import path from "path";
import { changeDetectionAPI } from "./changedetection-api";

export const registerRoutes = (app: any, projectRoot: string, password: string | undefined, requireAuth: any) => {
    // Login page route - accessible without auth
    app.get("/login", function (req, res) {
        // If already authenticated, redirect to home
        if (req.session && req.session.authenticated) {
            return res.redirect("/");
        }
        // If no password is set, redirect to home (auth disabled)
        if (!password) {
            return res.redirect("/");
        }
        res.sendFile(path.join(projectRoot, "dist", "login.html"));
    });

    // Login API endpoint
    app.post("/api/login", function (req, res) {
        const { password: inputPassword } = req.body;

        // If no password is configured, deny login
        if (!password) {
            return res.status(400).json({ error: "Authentication is not enabled" });
        }

        // Check password
        if (inputPassword === password) {
            req.session.authenticated = true;
            res.json({ success: true });
        } else {
            res.status(401).json({ error: "Invalid password" });
        }
    });

    // Logout API endpoint
    app.post("/api/logout", function (req, res) {
        req.session.destroy(err => {
            if (err) {
                console.error("Error destroying session:", err);
                return res.status(500).json({ error: "Failed to logout" });
            }
            res.json({ success: true });
        });
    });

    // Check auth status
    app.get("/api/auth/status", function (req, res) {
        res.json({
            authenticated: !password || (req.session && req.session.authenticated),
            authEnabled: !!password,
        });
    });

    // Main app route - protected by auth
    app.get("/", requireAuth, function (req, res) {
        res.sendFile(path.join(projectRoot, "dist", "index.html"));
    });

    // Get all watchers with their latest change
    app.get("/api/watchers", requireAuth, async (req, res) => {
        try {
            const watchers = await changeDetectionAPI.getAllWatchers();
            res.json(watchers);
        } catch (error) {
            console.error("Error fetching watchers:", error);
            res.status(500).json({ error: (error as Error).message });
        }
    });

    // Get a specific watcher with all changes
    app.get("/api/watchers/:id", requireAuth, async (req, res) => {
        try {
            const watcherId = req.params.id;
            const watcher = await changeDetectionAPI.getWatcher(watcherId);
            res.json(watcher);
        } catch (error) {
            console.error("Error fetching watcher:", error);
            res.status(500).json({ error: (error as Error).message });
        }
    });

    // Get latest snapshot preview for a watcher (for list view)
    app.get("/api/watchers/:id/preview", requireAuth, async (req, res) => {
        try {
            const watcherId = req.params.id;
            const watcher = await changeDetectionAPI.getWatcher(watcherId);

            if (watcher.changes.length > 0) {
                const latestChange = watcher.changes[0];
                try {
                    const snapshot = await changeDetectionAPI.getSnapshot(watcherId, latestChange.id);
                    // Return first 300 chars as preview
                    res.json({ preview: snapshot.substring(0, 300).trim() });
                } catch (snapshotError) {
                    console.error(`Error fetching snapshot for ${watcherId}:`, snapshotError);
                    // Return null if snapshot fetch fails
                    res.json({ preview: null });
                }
            } else {
                // No change history - return null (watcher hasn't been checked yet or has no changes)
                console.log(`[Preview] No changes for watcher ${watcherId} (${watcher.title})`);
                res.json({ preview: null });
            }
        } catch (error) {
            console.error("Error fetching preview:", error);
            res.status(500).json({ error: (error as Error).message });
        }
    });

    // Get snapshot content for a specific change
    app.get("/api/snapshot/:watcherId/:timestamp", requireAuth, async (req, res) => {
        try {
            const { watcherId, timestamp } = req.params;
            const snapshot = await changeDetectionAPI.getSnapshot(watcherId, timestamp);
            res.type("text/html").send(snapshot);
        } catch (error) {
            console.error("Error fetching snapshot:", error);
            res.status(500).json({ error: (error as Error).message });
        }
    });

    // Get diff for a specific change
    app.get("/api/diff/:watcherId/:timestamp", requireAuth, async (req, res) => {
        try {
            const { watcherId, timestamp } = req.params;
            const diff = await changeDetectionAPI.getDiff(watcherId, timestamp);
            res.type("text/html").send(diff);
        } catch (error) {
            console.error("Error fetching diff:", error);
            res.status(500).json({ error: (error as Error).message });
        }
    });

    // Delete a watcher
    app.delete("/api/watchers/:id", requireAuth, async (req, res) => {
        try {
            const watcherId = req.params.id;
            await changeDetectionAPI.deleteWatcher(watcherId);
            res.json({ success: true, message: "Watcher deleted successfully" });
        } catch (error) {
            console.error("Error deleting watcher:", error);
            res.status(500).json({ error: (error as Error).message });
        }
    });

    // Trigger a check for a specific watcher
    app.post("/api/watchers/:id/trigger", requireAuth, async (req, res) => {
        try {
            const watcherId = req.params.id;
            await changeDetectionAPI.triggerCheck(watcherId);
            res.json({ success: true, message: "Check triggered successfully" });
        } catch (error) {
            console.error("Error triggering check:", error);
            res.status(500).json({ error: (error as Error).message });
        }
    });

    // Get system info
    app.get("/api/systeminfo", requireAuth, async (req, res) => {
        try {
            const systemInfo = await changeDetectionAPI.getSystemInfo();
            res.json(systemInfo);
        } catch (error) {
            console.error("Error fetching system info:", error);
            res.status(500).json({ error: (error as Error).message });
        }
    });
};
