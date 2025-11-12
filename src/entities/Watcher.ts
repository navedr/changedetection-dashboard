import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { ChangeEvent } from "./ChangeEvent";

@Entity()
export class Watcher {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "text", unique: true })
    url: string;

    @Column({ type: "text", nullable: true })
    title: string;

    @Column({ type: "text", nullable: true })
    watcherId: string; // UUID from changedetection.io

    @OneToMany(() => ChangeEvent, changeEvent => changeEvent.watcher)
    changes: ChangeEvent[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
