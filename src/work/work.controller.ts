import {
  Controller,
  Post,
  Body,
  NotFoundException,
  UseGuards,
  Get,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ApiBody,
  ApiNotFoundResponse,
  ApiResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { WorkService } from './work.service';
import { TotalWorkingTimeByDayDto, WorkDto, WorkResponseDto } from './work.dto';
import { UserId } from '../users/user.decorator';
import { AuthGuard } from '../auth/auth.guard';
import { Work } from './entities/work.entity';

@ApiTags('Work')
@Controller('work')
export class WorkController {
  constructor(private readonly workService: WorkService) {}

  @ApiOperation({ summary: 'Start working time' })
  @ApiBody({
    type: WorkDto,
    examples: {
      example1: {
        value: { description: 'Working on a project' },
        summary: 'Start working time example',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully started work',
    type: WorkResponseDto,
  })
  @ApiNotFoundResponse({ description: 'User not found or not confirmed' })
  @UseGuards(AuthGuard)
  @Post('start')
  async startWork(
    @UserId() userId: string,
    @Body() workDto: WorkDto,
  ): Promise<WorkResponseDto> {
    try {
      const isAlreadyWorking = await this.workService.isAlreadyWorking(userId);

      if (isAlreadyWorking) {
        throw new ConflictException(
          'User is already working on something else.',
        );
      }

      const result = await this.workService.startWork(
        userId,
        workDto.description,
      );
      console.log({ result });
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @ApiOperation({ summary: 'Stop working time' })
  @ApiResponse({
    status: 200,
    description: 'Successfully stopped work',
    type: WorkResponseDto,
  })
  @ApiNotFoundResponse({ description: 'User not found or not confirmed' })
  @UseGuards(AuthGuard)
  @Post('stop')
  async stopWork(@UserId() userId: string): Promise<WorkResponseDto> {
    try {
      const result = await this.workService.stopWork(userId);
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @ApiOperation({
    summary: 'Get total working time by day for the currently logged-in user',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved total working time by day',
    type: [TotalWorkingTimeByDayDto],
  })
  @ApiNotFoundResponse({ description: 'User not found or not confirmed' })
  @UseGuards(AuthGuard)
  @Get('total-working-time-by-day')
  async getTotalWorkingTimeByDay(
    @UserId() userId: string,
  ): Promise<TotalWorkingTimeByDayDto[]> {
    try {
      console.log('lol');
      const totalWorkingTimeByDay =
        await this.workService.getTotalWorkingTimeByDay(userId);

      return totalWorkingTimeByDay;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
    }
  }

  @ApiOperation({
    summary: 'Get total working time by day for all users',
  })
  @ApiResponse({
    status: 200,
    description:
      'Successfully retrieved total working time by day for all users',
    type: [TotalWorkingTimeByDayDto],
  })
  @ApiNotFoundResponse({ description: 'No data found' })
  @UseGuards(AuthGuard)
  @Get('total-working-time-for-all-users')
  async getTotalWorkingTimeForAllUsers(): Promise<TotalWorkingTimeByDayDto[]> {
    try {
      const totalWorkingTimeByDay =
        await this.workService.getTotalWorkingTimeForAllUsers();
      return totalWorkingTimeByDay;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve total working time for all users',
        error.message,
      );
    }
  }
}
