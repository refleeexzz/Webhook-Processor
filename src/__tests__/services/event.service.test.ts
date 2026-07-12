import { EventService } from '../../services/event.service';
import { prisma } from '../../config/database';
import { eventQueue } from '../../config/queue';

// Mock das dependências externas
jest.mock('../../config/database', () => ({
  prisma: {
    event: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock('../../config/queue', () => ({
  eventQueue: {
    add: jest.fn(),
  },
}));

describe('EventService', () => {
  let eventService: EventService;

  beforeEach(() => {
    eventService = new EventService();
    jest.clearAllMocks();
  });

  describe('createEvent', () => {
    it('should create an event and add it to the queue', async () => {
      const mockEvent = {
        id: 'event-123',
        type: 'test.event',
        payload: { message: 'Hello' },
        createdAt: new Date(),
      };

      (prisma.event.create as jest.Mock).mockResolvedValue(mockEvent);
      (eventQueue.add as jest.Mock).mockResolvedValue({});

      const result = await eventService.createEvent({
        type: 'test.event',
        payload: { message: 'Hello' },
      });

      expect(result).toEqual(mockEvent);
      expect(prisma.event.create).toHaveBeenCalledWith({
        data: {
          type: 'test.event',
          payload: { message: 'Hello' },
        },
      });
      expect(eventQueue.add).toHaveBeenCalledWith('process-event', {
        eventId: 'event-123',
      });
    });
  });

  describe('getEvent', () => {
    it('should return an event with deliveries', async () => {
      const mockEvent = {
        id: 'event-123',
        type: 'test.event',
        payload: {},
        createdAt: new Date(),
        deliveries: [],
      };

      (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);

      const result = await eventService.getEvent('event-123');

      expect(result).toEqual(mockEvent);
      expect(prisma.event.findUnique).toHaveBeenCalledWith({
        where: { id: 'event-123' },
        include: {
          deliveries: {
            include: {
              webhook: true,
            },
          },
        },
      });
    });
  });

  describe('listEvents', () => {
    it('should return paginated events', async () => {
      const mockEvents = [
        { id: '1', type: 'test', payload: {}, createdAt: new Date() },
        { id: '2', type: 'test', payload: {}, createdAt: new Date() },
      ];

      (prisma.event.findMany as jest.Mock).mockResolvedValue(mockEvents);
      (prisma.event.count as jest.Mock).mockResolvedValue(10);

      const result = await eventService.listEvents(1, 2);

      expect(result.events).toEqual(mockEvents);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 2,
        total: 10,
        totalPages: 5,
      });
    });
  });
});
