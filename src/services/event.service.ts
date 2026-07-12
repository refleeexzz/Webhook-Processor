import { prisma } from '../config/database';
import { eventQueue } from '../config/queue';
import { CreateEventInput } from '../schemas';

export class EventService {
  async createEvent(data: CreateEventInput) {
    // Criar evento no banco
    const event = await prisma.event.create({
      data: {
        type: data.type,
        payload: data.payload,
      },
    });

    // Adicionar à fila para processamento assíncrono
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
