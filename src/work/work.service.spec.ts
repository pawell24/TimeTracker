import { Test, TestingModule } from '@nestjs/testing';
import { WorkService } from './work.service';
import { UsersService } from '../users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Work } from './entities/work.entity';
import { NotFoundException } from '@nestjs/common';
import { User } from '../users/entities/user.entity';

describe('WorkService', () => {
  let workService: WorkService;
  let usersService: UsersService;
  let workRepository: Repository<Work>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkService,
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Work),
          useClass: Repository,
        },
      ],
    }).compile();

    workService = module.get<WorkService>(WorkService);
    usersService = module.get<UsersService>(UsersService);
    workRepository = module.get<Repository<Work>>(getRepositoryToken(Work));
  });

  describe('startWork', () => {
    it('should start work for a user', async () => {
      const userId = '1';
      const description = 'Work description';
      const user: User = {
        id: '1',
        email: 'test@example.com',
        password: 'password',
        confirmed: true,
        works: [],
      };
      const mockWork: Work = {
        id: 'workId',
        description: 'Work description',
        startTime: new Date(),
        endTime: null,
        user: null,
      };
      jest.spyOn(workRepository, 'create').mockReturnValue(mockWork as any);

      jest.spyOn(usersService, 'findById').mockResolvedValue(user);
      jest.spyOn(workRepository, 'create').mockReturnValue(mockWork);
      jest.spyOn(workRepository, 'save').mockResolvedValue(mockWork);

      const result = await workService.startWork(userId, description);

      expect(result.success).toBe(true);
      expect(result.workId).toBe('workId');
    });

    it('should throw NotFoundException if user is not found or not confirmed', async () => {
      const userId = 'nonexistentId';
      const description = 'Work description';

      jest.spyOn(usersService, 'findById').mockResolvedValue(null);

      await expect(
        workService.startWork(userId, description),
      ).rejects.toThrowError(NotFoundException);
    });
  });

  describe('stopWork', () => {
    it('should stop ongoing work for a user', async () => {
      const userId = '1';
      const user: User = {
        id: '1',
        email: 'test@example.com',
        password: 'password',
        confirmed: true,
        works: [],
      };
      jest.spyOn(usersService, 'findById').mockResolvedValue(user as any);
      const mockOngoingWork: Work = {
        id: 'workId',
        description: 'Ongoing work',
        startTime: new Date(),
        endTime: null,
        user: user,
      };
      jest
        .spyOn(workRepository, 'findOne')
        .mockResolvedValue(mockOngoingWork as any);

      jest.spyOn(usersService, 'findById').mockResolvedValue(user);
      jest.spyOn(workRepository, 'findOne').mockResolvedValue(mockOngoingWork);
      jest.spyOn(workRepository, 'save').mockResolvedValue(mockOngoingWork);

      const result = await workService.stopWork(userId);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Stopped working');
    });

    it('should throw NotFoundException if user is not found or not confirmed', async () => {
      const userId = 'nonexistentId';

      jest.spyOn(usersService, 'findById').mockResolvedValue(null);

      await expect(workService.stopWork(userId)).rejects.toThrowError(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if no ongoing work is found for the user', async () => {
      const userId = '1';
      const user: User = {
        id: '1',
        email: 'test@example.com',
        password: 'password',
        confirmed: true,
        works: [],
      };

      jest.spyOn(usersService, 'findById').mockResolvedValue(user);
      jest.spyOn(workRepository, 'findOne').mockResolvedValue(null);

      await expect(workService.stopWork(userId)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('getOngoingWork', () => {
    it('should return ongoing work for a user', async () => {
      const userId = '1';
      const user: User = {
        id: '1',
        email: 'test@example.com',
        password: 'password',
        confirmed: true,
        works: [],
      };
      const mockOngoingWork: Work = {
        id: 'workId',
        description: 'Ongoing work',
        startTime: new Date(),
        endTime: null,
        user: user,
      };

      jest.spyOn(usersService, 'findById').mockResolvedValue(user);
      jest.spyOn(workRepository, 'findOne').mockResolvedValue(mockOngoingWork);

      const result = await workService.getOngoingWork(userId);

      expect(result).toEqual(mockOngoingWork);
    });

    it('should return null if no ongoing work is found for the user', async () => {
      const userId = '1';
      const user: User = {
        id: '1',
        email: 'test@example.com',
        password: 'password',
        confirmed: true,
        works: [],
      };

      jest.spyOn(usersService, 'findById').mockResolvedValue(user);
      jest.spyOn(workRepository, 'findOne').mockResolvedValue(null);

      const result = await workService.getOngoingWork(userId);

      expect(result).toBeNull();
    });

    it('should throw NotFoundException if user is not found or not confirmed', async () => {
      const userId = 'nonexistentId';

      jest.spyOn(usersService, 'findById').mockResolvedValue(null);

      await expect(workService.getOngoingWork(userId)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('isAlreadyWorking', () => {
    it('should return true if there is ongoing work for a user', async () => {
      const userId = '1';
      const user: User = {
        id: '1',
        email: 'test@example.com',
        password: 'password',
        confirmed: true,
        works: [],
      };
      const mockOngoingWork: Work = {
        id: 'workId',
        description: 'Ongoing work',
        startTime: new Date(),
        endTime: null,
        user: user,
      };

      jest
        .spyOn(workService, 'getOngoingWork')
        .mockResolvedValue(mockOngoingWork);

      const result = await workService.isAlreadyWorking(userId);

      expect(result).toBe(true);
    });

    it('should return false if there is no ongoing work for a user', async () => {
      const userId = '1';

      jest.spyOn(workService, 'getOngoingWork').mockResolvedValue(null);

      const result = await workService.isAlreadyWorking(userId);

      expect(result).toBe(false);
    });
  });

  describe('getTotalWorkingTimeByDay', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return total working time by day for a user', async () => {
      const userId = '1';
      const user: User = {
        id: '1',
        email: 'test@example.com',
        password: 'password',
        confirmed: true,
        works: [],
      };
      const expectedResults = [{ date: '2023-01-01', totalHours: 8 }];

      jest.spyOn(usersService, 'findById').mockResolvedValue(user);
      jest.spyOn(workRepository, 'createQueryBuilder').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(expectedResults),
      } as any as SelectQueryBuilder<Work>);

      const result = await workService.getTotalWorkingTimeByDay(userId);

      expect(result).toEqual(expectedResults);

      const expectedSelect =
        "TO_CHAR(DATE(work.startTime), 'YYYY-MM-DD') AS date";
      const expectedGroupBy = "TO_CHAR(DATE(work.startTime), 'YYYY-MM-DD')";
      const expectedOrderBy = 'ASC';

      expect(workRepository.createQueryBuilder).toHaveBeenCalledWith('work');
      expect(workRepository.createQueryBuilder().select).toHaveBeenCalledWith(
        expectedSelect,
      );
      expect(workRepository.createQueryBuilder().where).toHaveBeenCalledWith(
        'work.user = :user',
        { user: '1' },
      );
      expect(workRepository.createQueryBuilder().andWhere).toHaveBeenCalledWith(
        'work.endTime IS NOT NULL',
      );
      expect(workRepository.createQueryBuilder().groupBy).toHaveBeenCalledWith(
        expectedGroupBy,
      );
      expect(workRepository.createQueryBuilder().orderBy).toHaveBeenCalledWith(
        expectedGroupBy,
        expectedOrderBy,
      );
      expect(workRepository.createQueryBuilder().getRawMany).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user is not found or not confirmed', async () => {
      const userId = 'nonexistentId';

      jest.spyOn(usersService, 'findById').mockResolvedValue(null);

      await expect(
        workService.getTotalWorkingTimeByDay(userId),
      ).rejects.toThrowError(NotFoundException);
    });
  });

  describe('getTotalWorkingTimeForAllUsers', () => {
    it('should return total working time for all users', async () => {
      const mockTotalWorkingTime = [{ date: '2023-01-01', totalHours: 8 }];
      jest.spyOn(workRepository, 'createQueryBuilder').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockTotalWorkingTime),
      } as any as SelectQueryBuilder<Work>);

      const result = await workService.getTotalWorkingTimeForAllUsers();

      expect(result).toEqual(mockTotalWorkingTime);

      expect(workRepository.createQueryBuilder).toHaveBeenCalledWith('work');
      expect(workRepository.createQueryBuilder().select).toHaveBeenCalledWith(
        "TO_CHAR(DATE(work.startTime), 'YYYY-MM-DD') AS date",
      );

      jest.clearAllMocks();
    });

    it('should handle the case when no total working time is available', async () => {
      jest.spyOn(workRepository, 'createQueryBuilder').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      } as any as SelectQueryBuilder<Work>);

      const result = await workService.getTotalWorkingTimeForAllUsers();

      expect(result).toEqual([]);

      expect(workRepository.createQueryBuilder).toHaveBeenCalledWith('work');
      expect(workRepository.createQueryBuilder().select).toHaveBeenCalledWith(
        "TO_CHAR(DATE(work.startTime), 'YYYY-MM-DD') AS date",
      );

      jest.clearAllMocks();
    });
  });
});
