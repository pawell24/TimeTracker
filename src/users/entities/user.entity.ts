import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Work } from '../../work/entities/work.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: false })
  confirmed: boolean;

  @OneToMany(() => Work, (work) => work.user)
  works: Work[];
}
