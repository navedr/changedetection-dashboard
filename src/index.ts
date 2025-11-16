"use strict";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import express from "express";
import bodyParser from "body-parser";
import path from "path";
import basicAuth from "basic-auth";
import { registerRoutes } from "./server/routes";

// Load environment variables
dotenv.config();

// Get auth credentials from environment variables
const AUTH_USERNAME = process.env.AUTH_USERNAME || "admin";
const AUTH_PASSWORD = process.env.AUTH_PASSWORD || "password";

const auth = function (req, res, next) {
    var user = basicAuth(req);
    if (!user || !user.name || !user.pass) {
        res.set("WWW-Authenticate", "Basic realm=Authorization Required");
        res.sendStatus(401);
        return;
    }
    if (user.name === AUTH_USERNAME && user.pass === AUTH_PASSWORD) {
        next();
    } else {
        res.set("WWW-Authenticate", "Basic realm=Authorization Required");
        res.sendStatus(401);
    }
};

let projectRoot: string | null = null;

export function getProjectRoot(): string {
    // Return cached result if available
    if (projectRoot) {
        return projectRoot;
    }

    // Start from the directory of the current module
    const currentFilePath = fileURLToPath(import.meta.url);
    let currentDir = path.dirname(currentFilePath);

    // eslint-disable-next-line no-constant-condition
    while (true) {
        const packageJsonPath = path.join(currentDir, "package.json");
        if (fs.existsSync(packageJsonPath)) {
            projectRoot = currentDir; // Cache the result
            return projectRoot;
        }

        const parentDir = path.dirname(currentDir);
        // Check if we have reached the filesystem root
        if (parentDir === currentDir) {
            throw new Error("Could not find project root containing package.json.");
        }
        currentDir = parentDir;
    }
}

let app;

const startWebServer = async () => {
    const port = parseInt(process.env.PORT || "8080", 10);
    app = express();

    const logger = function (req, res, next) {
        console.log(req.url);
        next();
    };

    app.use(logger);

    // Body Parser Middleware
    app.use(bodyParser.json({ limit: "50mb" }));
    app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

    // Apply auth to all routes
    app.use(auth);

    // Set Static path
    app.use(express.static(path.join(getProjectRoot(), "dist")));

    // Register API routes
    registerRoutes(app, getProjectRoot());

    // Start server
    app.listen(port, function () {
        console.log("Server started on port " + port);
        console.log("ChangeDetection API URL:", process.env.CHANGEDETECTION_URL || "http://localhost:5000");
    });
};

await startWebServer();
