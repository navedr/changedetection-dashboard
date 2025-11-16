import path from "path";
import { changeDetectionAPI } from "./changedetection-api";

export const registerRoutes = (app: any, projectRoot: string) => {
    app.get("/", function (req, res) {
        res.sendFile(path.join(projectRoot, "dist", "index.html"));
    });

    // Get all watchers with their latest change
    app.get("/api/watchers", async (req, res) => {
        try {
            const watchers = await changeDetectionAPI.getAllWatchers();
            res.json(watchers);
        } catch (error) {
            console.error("Error fetching watchers:", error);
            res.status(500).json({ error: (error as Error).message });
        }
    });

    // Get a specific watcher with all changes
    app.get("/api/watchers/:id", async (req, res) => {
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
    app.get("/api/watchers/:id/preview", async (req, res) => {
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
    app.get("/api/snapshot/:watcherId/:timestamp", async (req, res) => {
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
    app.get("/api/diff/:watcherId/:timestamp", async (req, res) => {
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
    app.delete("/api/watchers/:id", async (req, res) => {
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
    app.post("/api/watchers/:id/trigger", async (req, res) => {
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
    app.get("/api/systeminfo", async (req, res) => {
        try {
            const systemInfo = await changeDetectionAPI.getSystemInfo();
            res.json(systemInfo);
        } catch (error) {
            console.error("Error fetching system info:", error);
            res.status(500).json({ error: (error as Error).message });
        }
    });
};
