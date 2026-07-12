import { prisma } from '../config/database';
import { eventQueue } from '../config/queue';
import { CreateEventInput } from '../schemas';

export class EventService {
  async createEvent(data: CreateEventInput, idempotencyKey?: string) {
    // check if event with this idempotency key already exists
    if (idempotencyKey) {
      const existing = await prisma.event.findUnique({
        where: { idempotencyKey },
      });

      if (existing) {
        // return existing event without reprocessing
        return existing;
      }
    }

    // create event in database
    const event = await prisma.event.create({
      data: {
        type: data.type,
        payload: data.payload,
        idempotencyKey,
      },
    });

    // add to queue for async processing
    await eventQueue.add('process-event', {
      eventId: event.id,
    });

    return event;
  }

  async getEvent(id: string) {
    return prisma.event.findUnique({
      where: { id },
      include: {
        deliveries: {
          include: {
            webhook: true,
          },
        },
      },
    });
  }

  async listEvents(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.event.count(),
    ]);

    return {
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
