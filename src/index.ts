"use strict";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import express from "express";
import bodyParser from "body-parser";
import path from "path";
import session from "express-session";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./server/routes";

// Load environment variables
dotenv.config();

// Get password from environment variable
const PASSWORD = process.env.PASSWORD;
const SESSION_SECRET = process.env.SESSION_SECRET || "changedetection-secret-" + Math.random().toString(36);

// Authentication middleware - only enforces auth if PASSWORD env var is set
const requireAuth = function (req, res, next) {
    // If no PASSWORD is set, allow access
    if (!PASSWORD) {
        return next();
    }

    // Check if user is authenticated
    if (req.session && req.session.authenticated) {
        return next();
    }

    // Not authenticated - redirect to login page
    res.redirect("/login");
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

    // Cookie parser
    app.use(cookieParser());

    // Session middleware
    app.use(
        session({
            secret: SESSION_SECRET,
            resave: false,
            saveUninitialized: false,
            cookie: {
                secure: false, // set to true if using HTTPS
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000, // 24 hours
            },
        }),
    );

    // Register API routes (includes login/logout endpoints)
    registerRoutes(app, getProjectRoot(), PASSWORD, requireAuth);

    // Set Static path
    app.use(express.static(path.join(getProjectRoot(), "dist")));

    // Start server
    app.listen(port, function () {
        console.log("Server started on port " + port);
        console.log("ChangeDetection API URL:", process.env.CHANGEDETECTION_URL || "http://localhost:5000");
        if (PASSWORD) {
            console.log("Authentication enabled - PASSWORD is set");
        } else {
            console.log("Authentication disabled - no PASSWORD environment variable set");
        }
    });
};

await startWebServer();
