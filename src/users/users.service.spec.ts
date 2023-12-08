import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('UsersService', () => {
  let usersService: UsersService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const mockUser = { id: '1', email: 'test@example.com' } as User;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      const result = await usersService.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);
    });

    it('should return undefined if the user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

      const result = await usersService.findByEmail('nonexistent@example.com');
      expect(result).toBeUndefined();
    });
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      const mockUser = { id: '1', email: 'test@example.com' } as User;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      const result = await usersService.findById('1');
      expect(result).toEqual(mockUser);
    });

    it('should return undefined if the user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

      const result = await usersService.findById('nonexistent-id');
      expect(result).toBeUndefined();
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'password',
      } as User;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);
      jest.spyOn(userRepository, 'create').mockReturnValue(mockUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser);

      const result = await usersService.createUser(
        '1',
        'test@example.com',
        'password',
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException if user with the same email already exists', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue({} as User);

      await expect(
        usersService.createUser('1', 'test@example.com', 'password'),
      ).rejects.toThrowError(ConflictException);
    });
  });

  describe('confirmUser', () => {
    it('should confirm a user', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        confirmed: false,
      } as User;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser);

      const result = await usersService.confirmUser('1');
      expect(result.confirmed).toBe(true);
    });

    it('should throw NotFoundException if the user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

      await expect(
        usersService.confirmUser('nonexistent-id'),
      ).rejects.toThrowError(NotFoundException);
    });

    it('should throw NotFoundException if the user is already confirmed', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        confirmed: true,
      } as User;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      await expect(usersService.confirmUser('1')).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('saveUser', () => {
    it('should save a user', async () => {
      const mockUser = { id: '1', email: 'test@example.com' } as User;
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser);

      const result = await usersService.saveUser(mockUser);
      expect(result).toEqual(mockUser);
    });
  });
});
