import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from "typeorm";
import { Watcher } from "./Watcher";

@Entity()
export class ChangeEvent {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Watcher, watcher => watcher.changes)
    @JoinColumn({ name: "watcherId" })
    watcher: Watcher;

    @Column({ type: "integer" })
    watcherId: number;

    @Column({ type: "text" })
    title: string;

    @Column({ type: "text" })
    message: string;

    @Column({ type: "text", nullable: true })
    diffUrl: string;

    @Column({ type: "text", nullable: true })
    watchUrl: string;

    @Column({ type: "text", nullable: true })
    editUrl: string;

    @Column({ type: "text", nullable: true })
    screenshotBase64: string;

    @Column({ type: "text", nullable: true })
    screenshotMimetype: string;

    @Column({ type: "text", nullable: true })
    changeType: string;

    @Column({ type: "text", nullable: true })
    webhookData: string; // Store raw webhook data as JSON

    @CreateDateColumn()
    createdAt: Date;
}
