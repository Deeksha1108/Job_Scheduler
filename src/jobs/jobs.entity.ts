import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string;

  @Column({ type: 'timestamptz' })
  runAt: Date;

  @Column({ type: 'jsonb' })
  payload: Record<string, any>;

  @Column({ default: 'pending' })
  status: string;
}
