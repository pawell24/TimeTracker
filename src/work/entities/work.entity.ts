import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Work {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  description: string;

  @Column()
  startTime: Date;

  @Column({ nullable: true })
  endTime: Date;

  @ManyToOne(() => User, (user) => user.works)
  user: User;
}
