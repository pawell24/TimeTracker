import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Work } from './entities/work.entity';

@Injectable()
export class WorkService {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(Work)
    private readonly workRepository: Repository<Work>,
  ) {}

  async startWork(userId: string, description: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.confirmed) {
      throw new NotFoundException('User not found or not confirmed');
    }

    const work = this.workRepository.create({
      user: user,
      description: description,
      startTime: new Date(),
    });

    await this.workRepository.save(work);

    return {
      success: true,
      message: `Started working on ${description}`,
      workId: work.id,
    };
  }

  async stopWork(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.confirmed) {
      throw new NotFoundException('User not found or not confirmed');
    }

    const ongoingWork = await this.workRepository.findOne({
      where: {
        user: user,
        endTime: null,
      },
    });

    if (!ongoingWork) {
      throw new NotFoundException('No ongoing work found for the user');
    }

    ongoingWork.endTime = new Date();
    await this.workRepository.save(ongoingWork);

    return { success: true, message: 'Stopped working' };
  }

  async getOngoingWork(userId: string): Promise<Work | null> {
    const user = await this.usersService.findById(userId);
    if (!user || !user.confirmed) {
      throw new NotFoundException('User not found or not confirmed');
    }

    const ongoingWork = await this.workRepository.findOne({
      where: {
        user: user,
        endTime: IsNull(),
      },
    });

    return ongoingWork || null;
  }

  async isAlreadyWorking(userId: string): Promise<boolean> {
    const ongoingWork = await this.getOngoingWork(userId);
    return !!ongoingWork;
  }

  async getTotalWorkingTimeByDay(
    userId: string,
  ): Promise<{ date: string; totalHours: number }[]> {
    const user = await this.usersService.findById(userId);

    if (!user || !user.confirmed) {
      throw new NotFoundException('User not found or not confirmed');
    }
    const totalWorkingTimeByDay = await this.workRepository
      .createQueryBuilder('work')
      .select("TO_CHAR(DATE(work.startTime), 'YYYY-MM-DD') AS date")
      .addSelect(
        'SUM(EXTRACT(EPOCH FROM (work.endTime - work.startTime) / 3600)) AS totalHours',
      )
      .where('work.user = :user', { user: user.id })
      .andWhere('work.endTime IS NOT NULL')
      .groupBy("TO_CHAR(DATE(work.startTime), 'YYYY-MM-DD')")
      .orderBy("TO_CHAR(DATE(work.startTime), 'YYYY-MM-DD')", 'ASC')
      .getRawMany();

    return totalWorkingTimeByDay;
  }

  async getTotalWorkingTimeForAllUsers(): Promise<
    { date: string; totalHours: number }[]
  > {
    const totalWorkingTimeByDay = await this.workRepository
      .createQueryBuilder('work')
      .select("TO_CHAR(DATE(work.startTime), 'YYYY-MM-DD') AS date")
      .addSelect(
        'SUM(EXTRACT(EPOCH FROM (work.endTime - work.startTime) / 3600)) AS totalHours',
      )
      .andWhere('work.endTime IS NOT NULL')
      .groupBy("TO_CHAR(DATE(work.startTime), 'YYYY-MM-DD')")
      .orderBy("TO_CHAR(DATE(work.startTime), 'YYYY-MM-DD')", 'ASC')
      .getRawMany();

    return totalWorkingTimeByDay;
  }
}
