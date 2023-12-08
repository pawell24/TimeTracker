import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto, LoginDto } from './auth.dto';
import { NotFoundException } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';

jest.mock('../users/users.service');
jest.mock('@nestjs/jwt');

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, UsersService, JwtService],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('register', () => {
    it('should register a new user and return confirmation link', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const generatedId = 'generated-id';
      const expectedUser = {
        id: generatedId,
        email: 'test@example.com',
        password: 'hashed-password',
        confirmed: false,
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
      jest
        .spyOn(usersService, 'createUser')
        .mockResolvedValueOnce(expectedUser as any as Promise<User>);
      jest
        .spyOn(usersService, 'saveUser')
        .mockResolvedValueOnce(expectedUser as any as Promise<User>);

      const result = await authService.register(registerDto);

      const expectedConfirmLink = `http://localhost:3000/auth/confirm?token=${generatedId}`;
      const expectedResponse = {
        email: 'test@example.com',
        confirmLink: expectedConfirmLink,
      };

      expect(result).toMatchObject(expectedResponse);

      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(usersService.createUser).toHaveBeenCalledWith(
        expect.any(String),
        'test@example.com',
        'password123',
      );
      expect(usersService.saveUser).toHaveBeenCalledWith(expectedUser);
    });
  });

  describe('confirmEmail', () => {
    it('should confirm the email for a valid token', async () => {
      const token = 'valid-token';
      const user: User = {
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashed-password',
        confirmed: false,
        works: [],
      };

      jest.spyOn(usersService, 'findById').mockResolvedValueOnce(user);
      jest.spyOn(usersService, 'saveUser').mockResolvedValueOnce(user);

      const result = await authService.confirmEmail(token);

      expect(result).toEqual({ success: true });
      expect(usersService.findById).toHaveBeenCalledWith(token);
      expect(usersService.saveUser).toHaveBeenCalledWith({
        ...user,
        confirmed: true,
      });
    });

    it('should throw NotFoundException for an invalid token', async () => {
      const token = 'invalid-token';

      jest.spyOn(usersService, 'findById').mockResolvedValueOnce(null);

      await expect(authService.confirmEmail(token)).rejects.toThrowError(
        NotFoundException,
      );
      expect(usersService.findById).toHaveBeenCalledWith(token);
    });
  });

  describe('login', () => {
    it('should throw NotFoundException for invalid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'invalid-email@example.com',
        password: 'invalid-password',
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrowError(
        NotFoundException,
      );
    });

    it('should throw NotFoundException for invalid email or password', async () => {
      const loginDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'invalid-password',
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValueOnce(null);

      await expect(authService.login(loginDto)).rejects.toThrowError(
        NotFoundException,
      );
      expect(usersService.findByEmail).toHaveBeenCalledWith(
        'nonexistent@example.com',
      );
    });
  });

  describe('validateUserById', () => {
    it('should validate and return a user for a valid ID', async () => {
      const userId = 'user-id';
      const user: User = {
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashed-password',
        confirmed: false,
        works: [],
      };

      jest.spyOn(usersService, 'findById').mockResolvedValueOnce(user);

      const result = await authService.validateUserById(userId);

      expect(result).toEqual(user);
      expect(usersService.findById).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException for an invalid ID', async () => {
      const invalidUserId = 'invalid-user-id';

      jest.spyOn(usersService, 'findById').mockResolvedValueOnce(null);

      await expect(
        authService.validateUserById(invalidUserId),
      ).rejects.toThrowError(NotFoundException);
      expect(usersService.findById).toHaveBeenCalledWith(invalidUserId);
    });
  });
});
