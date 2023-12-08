import { ApiProperty } from '@nestjs/swagger';

export class WorkDto {
  @ApiProperty({
    description: 'Description of the work',
    example: 'Working on a project',
  })
  description: string;
}

export class WorkResponseDto {
  @ApiProperty({
    description: 'Indicates whether the operation was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Additional message or information',
    example: 'Started working on a project',
  })
  message: string;

  @ApiProperty({
    description: 'Unique identifier for the work',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  workId?: string;
}

export class TotalWorkingTimeByDayDto {
  @ApiProperty({
    description: 'Date of the working day',
    example: '2023-01-01',
  })
  date: string;

  @ApiProperty({ description: 'Total working hours for the day', example: 8 })
  totalHours: number;
}
