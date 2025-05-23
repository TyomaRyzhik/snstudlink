import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class ChecklistItem {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column("text")
	description: string;

	@Column("boolean", { default: false })
	isCompleted: boolean;

	@Column({ type: "timestamp", nullable: true })
	dueDate: Date | null;

	@ManyToOne(() => User, user => user.checklistItems, { onDelete: "CASCADE" })
	user: User;

	@Column()
	userId: string; // For foreign key relationship

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
} 