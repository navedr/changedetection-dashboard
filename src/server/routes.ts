import { AppDataSource } from "../database/data-source";
import { ChangeEvent } from "../entities/ChangeEvent";
import { Watcher } from "../entities/Watcher";
import path from "path";
import { WebhookRequest } from "./interface";

export const registerRoutes = (app: any, projectRoot: string) => {
    app.get("/", function (req, res) {
        res.sendFile(path.join(projectRoot, "dist", "index.html"));
    });

    app.post("/api/webhook", webhook);

    // Get all watchers with their latest change
    app.get("/api/watchers", async (req, res) => {
        try {
            const watcherRepo = AppDataSource.getRepository(Watcher);
            const watchers = await watcherRepo.find({
                relations: ["changes"],
                order: {
                    updatedAt: "DESC",
                },
            });

            // Add latest change and count to each watcher
            const watchersWithStats = watchers.map(watcher => ({
                id: watcher.id,
                url: watcher.url,
                title: watcher.title,
                createdAt: watcher.createdAt,
                updatedAt: watcher.updatedAt,
                changeCount: watcher.changes.length,
                latestChange:
                    watcher.changes.length > 0
                        ? watcher.changes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]
                        : null,
            }));

            res.json(watchersWithStats);
        } catch (error) {
            console.error("Error fetching watchers:", error);
            res.status(500).json({ error: (error as Error).message });
        }
    });

    // Get a specific watcher with all changes
    app.get("/api/watchers/:id", async (req, res) => {
        try {
            const watcherId = parseInt(req.params.id);
            const watcherRepo = AppDataSource.getRepository(Watcher);
            const watcher = await watcherRepo.findOne({
                where: { id: watcherId },
                relations: ["changes"],
            });

            if (!watcher) {
                return res.status(404).json({ error: "Watcher not found" });
            }

            // Sort changes by date descending
            watcher.changes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

            res.json(watcher);
        } catch (error) {
            console.error("Error fetching watcher:", error);
            res.status(500).json({ error: (error as Error).message });
        }
    });

    // Get a specific change event with full details
    app.get("/api/changes/:id", async (req, res) => {
        try {
            const changeId = parseInt(req.params.id);
            const changeEventRepo = AppDataSource.getRepository(ChangeEvent);
            const changeEvent = await changeEventRepo.findOne({
                where: { id: changeId },
                relations: ["watcher"],
            });

            if (!changeEvent) {
                return res.status(404).json({ error: "Change event not found" });
            }

            res.json(changeEvent);
        } catch (error) {
            console.error("Error fetching change event:", error);
            res.status(500).json({ error: (error as Error).message });
        }
    });

    // Delete a watcher and all its associated changes
    app.delete("/api/watchers/:id", async (req, res) => {
        try {
            const watcherId = parseInt(req.params.id);
            const watcherRepo = AppDataSource.getRepository(Watcher);
            const changeEventRepo = AppDataSource.getRepository(ChangeEvent);

            // Check if watcher exists
            const watcher = await watcherRepo.findOne({
                where: { id: watcherId },
            });

            if (!watcher) {
                return res.status(404).json({ error: "Watcher not found" });
            }

            // Delete all associated change events first
            await changeEventRepo.delete({ watcherId });

            // Delete the watcher
            await watcherRepo.delete({ id: watcherId });

            res.json({ success: true, message: "Watcher and associated changes deleted successfully" });
        } catch (error) {
            console.error("Error deleting watcher:", error);
            res.status(500).json({ error: (error as Error).message });
        }
    });
};

export const webhook = async (req: any, res: any) => {
    try {
        console.log("Received webhook data", req.body);
        const webhookData: WebhookRequest = Array.isArray(req.body) ? req.body[0] : req.body;

        const body = webhookData;

        // Extract URLs from message
        const messageLinks = extractLinksFromMessage(body.message);
        const url = messageLinks.watchUrl; // The URL is in the title field

        // Extract old and new values from message
        const values = extractValues(body.message);

        // Find or create watcher
        const watcherRepo = AppDataSource.getRepository(Watcher);
        let watcher = await watcherRepo.findOne({ where: { url } });

        if (!watcher) {
            watcher = watcherRepo.create({
                url,
                title: body.title,
            });
            await watcherRepo.save(watcher);
            console.log("Created new watcher:", url);
        }

        // Create change event
        const changeEventRepo = AppDataSource.getRepository(ChangeEvent);
        const changeEvent = changeEventRepo.create({
            watcherId: watcher.id,
            title: body.title,
            message: body.message,
            diffUrl: messageLinks.diffUrl,
            watchUrl: messageLinks.watchUrl,
            editUrl: messageLinks.editUrl,
            changeType: body.type,
            oldValue: values.oldValue,
            newValue: values.newValue,
            screenshotBase64: body.attachments?.[0]?.base64,
            screenshotMimetype: body.attachments?.[0]?.mimetype,
            webhookData: JSON.stringify(webhookData),
        });

        await changeEventRepo.save(changeEvent);
        console.log("Saved change event for watcher:", watcher.id);

        res.json({ success: true, watcherId: watcher.id, changeEventId: changeEvent.id });
    } catch (error) {
        console.error("Error processing webhook:", error);
        res.status(500).json({ success: false, error: (error as Error).message });
    }
};

// Helper function to extract links from message
function extractLinksFromMessage(message: string): { watchUrl?: string; diffUrl?: string; editUrl?: string } {
    const result: { watchUrl?: string; diffUrl?: string; editUrl?: string } = {};

    // Extract Watch URL
    const watchMatch = message.match(/\[Watch URL\]\((.*?)\)/);
    if (watchMatch) result.watchUrl = watchMatch[1];

    // Extract Diff URL
    const diffMatch = message.match(/\[Diff URL\]\((.*?)\)/);
    if (diffMatch) result.diffUrl = diffMatch[1];

    // Extract Edit URL
    const editMatch = message.match(/\[Edit\]\((.*?)\)/);
    if (editMatch) result.editUrl = editMatch[1];

    return result;
}

// Helper function to extract old and new values from message
function extractValues(message: string): { oldValue?: string; newValue?: string } {
    const result: { oldValue?: string; newValue?: string } = {};

    // Extract old value from <del> tags
    const oldMatch = message.match(/<del>(.*?)<\/del>/);
    if (oldMatch) {
        result.oldValue = oldMatch[1].trim();
    }

    // Extract new value from ** tags that come after <del>
    const newMatch = message.match(/<\/del>\s*\n\*\*(.*?)\*\*/);
    if (newMatch) {
        result.newValue = newMatch[1].trim();
    }

    return result;
}
