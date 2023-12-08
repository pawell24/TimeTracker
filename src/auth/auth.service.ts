import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto, LoginDto } from './auth.dto';
import { UsersService } from '../users/users.service';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }
    const newUser = await this.usersService.createUser(
      uuidv4(),
      registerDto.email,
      registerDto.password,
    );

    const { id, email } = await this.usersService.saveUser(newUser);

    return {
      email,
      confirmLink: `http://localhost:3000/auth/confirm?token=${id}`,
    };
  }

  async confirmEmail(token: string) {
    const user = await this.usersService.findById(token);

    if (!user) {
      throw new NotFoundException('Invalid token');
    }

    user.confirmed = true;
    await this.usersService.saveUser(user);

    return { success: true };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    console.log(user);
    if (!user || !user.confirmed || user.password !== loginDto.password) {
      throw new NotFoundException('Invalid email or password');
    }

    const payload = { id: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }

  async validateUserById(userId: string): Promise<User> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
