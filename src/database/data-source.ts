import "reflect-metadata";
import { DataSource } from "typeorm";
import path from "path";
import fs from "fs";
import { Watcher } from "../entities/Watcher";
import { ChangeEvent } from "../entities/ChangeEvent";

// Get database path from environment variable or use default
const dbPath = process.env.DB_PATH || "./data/changedetection.sqlite";

// Ensure the directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

export const AppDataSource = new DataSource({
    type: "better-sqlite3",
    database: dbPath,
    synchronize: true,
    logging: false,
    entities: [Watcher, ChangeEvent],
    migrations: [],
    subscribers: [],
});
