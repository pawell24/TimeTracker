import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | undefined> {
    const options = { where: { email } };
    return this.userRepository.findOne(options);
  }

  async findById(id: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { id } });
  }

  async createUser(id: string, email: string, password: string) {
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const newUser = this.userRepository.create({
      id,
      email,
      password,
      confirmed: false,
    });

    await this.userRepository.save(newUser);

    return newUser;
  }

  async confirmUser(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user || user.confirmed) {
      throw new NotFoundException('User not found or already confirmed');
    }

    user.confirmed = true;
    await this.userRepository.save(user);

    return user;
  }

  async saveUser(user: User): Promise<User> {
    return this.userRepository.save(user);
  }
}
