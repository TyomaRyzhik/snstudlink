import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('conferences')
export class Conference {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'host_id' })
    host: User;

    @Column()
    title: string;

    @Column({ type: 'uuid', default: () => 'gen_random_uuid()' })
    room_name: string;

    @Column({ type: 'timestamp with time zone' })
    scheduled_at: Date;

    @CreateDateColumn({ type: 'timestamp with time zone' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp with time zone' })
    updated_at: Date;
} 