/**
 * Change Detection API Client
 * Documentation: https://changedetection.io/docs/api_v1/index.html
 */

const CHANGEDETECTION_URL = process.env.CHANGEDETECTION_URL || "http://localhost:5000";
const CHANGEDETECTION_API_KEY = process.env.CHANGEDETECTION_API_KEY || "";

interface ApiWatcher {
    uuid?: string;
    url: string;
    title?: string;
    last_changed?: number;
    last_checked?: number;
    history_n?: number; // Number of history entries
    viewed?: boolean;
    paused?: boolean; // Whether the watcher is paused
}

interface WatcherWithStats {
    id: string;
    url: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    changeCount: number;
    latestChange: ChangeHistoryEntry | null;
    paused: boolean;
}

interface ChangeHistoryEntry {
    id: string;
    createdAt: string;
    timestamp: number;
    size_total: number;
    size_removed: number;
    size_added: number;
}

interface WatcherDetail {
    id: string;
    url: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    changes: ChangeHistoryEntry[];
}

class ChangeDetectionAPIClient {
    private baseUrl: string;
    private apiKey: string;

    constructor() {
        this.baseUrl = CHANGEDETECTION_URL;
        this.apiKey = CHANGEDETECTION_API_KEY;

        if (!this.apiKey) {
            console.warn("WARNING: CHANGEDETECTION_API_KEY is not set. API calls may fail.");
        }
    }

    private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseUrl}/api/v1${endpoint}`;
        const headers = {
            "x-api-key": this.apiKey,
            "Content-Type": "application/json",
            ...options.headers,
        };

        const response = await fetch(url, { ...options, headers });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
        }

        return response.json();
    }

    /**
     * Get all watchers
     * GET /api/v1/watch
     * Note: We need to fetch individual watcher details to get paused status
     */
    async getAllWatchers(): Promise<WatcherWithStats[]> {
        const data = await this.fetch<{ [uuid: string]: ApiWatcher }>("/watch");

        const watchers: WatcherWithStats[] = [];

        // Fetch detailed info for each watcher to get paused status
        // The list endpoint doesn't include the paused field
        for (const [uuid, watcher] of Object.entries(data)) {
            const changeCount = watcher.history_n || 0;

            let latestChange: ChangeHistoryEntry | null = null;
            if (watcher.last_changed) {
                // Use last_changed as the latest change timestamp
                latestChange = {
                    id: watcher.last_changed.toString(),
                    createdAt: new Date(watcher.last_changed * 1000).toISOString(),
                    timestamp: watcher.last_changed,
                    size_total: 0,
                    size_removed: 0,
                    size_added: 0,
                };
            }

            // Fetch detailed watcher info to get paused status
            let isPaused = false;
            try {
                const detailedWatcher = await this.fetch<ApiWatcher>(`/watch/${uuid}`);
                isPaused = detailedWatcher.paused === true;
            } catch (error) {
                console.warn(`Failed to fetch paused status for ${uuid}:`, (error as Error).message);
            }

            watchers.push({
                id: uuid,
                url: watcher.url,
                title: watcher.title || watcher.url,
                createdAt: new Date().toISOString(), // API doesn't provide creation date
                updatedAt: watcher.last_changed ? new Date(watcher.last_changed * 1000).toISOString() : "", // Empty string for watchers with no changes - will sort to bottom
                changeCount,
                latestChange,
                paused: isPaused,
            });
        }

        // Sort by most recently updated (newest first)
        // Watchers with no updatedAt (empty string) will sort to the bottom
        watchers.sort((a, b) => {
            // If both have dates, sort by date (newest first)
            if (a.updatedAt && b.updatedAt) {
                return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            }
            // If only a has no date, put it after b
            if (!a.updatedAt) return 1;
            // If only b has no date, put it after a
            if (!b.updatedAt) return -1;
            // Both have no date (shouldn't happen, but handle it)
            return 0;
        });

        return watchers;
    }

    /**
     * Get a specific watcher with its history
     * GET /api/v1/watch/{uuid}
     * GET /api/v1/watch/{uuid}/history
     */
    async getWatcher(uuid: string): Promise<WatcherDetail> {
        const watcher = await this.fetch<ApiWatcher>(`/watch/${uuid}`);

        // Fetch the history separately
        let history: { [timestamp: string]: string } = {};
        try {
            history = await this.fetch<{ [timestamp: string]: string }>(`/watch/${uuid}/history`);
        } catch (error) {
            console.warn(`No history found for watcher ${uuid}:`, (error as Error).message);
        }

        const changes: ChangeHistoryEntry[] = [];
        // The history object has timestamps as keys and file paths as values
        for (const timestamp of Object.keys(history)) {
            const timestampNum = parseInt(timestamp);
            changes.push({
                id: timestamp, // Use timestamp as the ID for fetching snapshots
                createdAt: new Date(timestampNum * 1000).toISOString(),
                timestamp: timestampNum,
                size_total: 0,
                size_removed: 0,
                size_added: 0,
            });
        }

        // Sort changes by timestamp descending (newest first)
        changes.sort((a, b) => b.timestamp - a.timestamp);

        return {
            id: uuid,
            url: watcher.url,
            title: watcher.title || watcher.url,
            createdAt: new Date().toISOString(),
            updatedAt: watcher.last_changed
                ? new Date(watcher.last_changed * 1000).toISOString()
                : new Date().toISOString(),
            changes,
        };
    }

    /**
     * Get snapshot content for a specific change
     * GET /api/v1/watch/{uuid}/history/{timestamp}
     */
    async getSnapshot(uuid: string, timestamp: string): Promise<string> {
        const response = await fetch(`${this.baseUrl}/api/v1/watch/${uuid}/history/${timestamp}`, {
            headers: {
                "x-api-key": this.apiKey,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch snapshot: ${response.status} ${response.statusText}`);
        }

        return response.text();
    }

    /**
     * Get diff for a specific change
     * GET /api/v1/diff/{uuid}/{timestamp}
     */
    async getDiff(uuid: string, timestamp: string): Promise<string> {
        const response = await fetch(`${this.baseUrl}/api/v1/diff/${uuid}/${timestamp}`, {
            headers: {
                "x-api-key": this.apiKey,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch diff: ${response.status} ${response.statusText}`);
        }

        return response.text();
    }

    /**
     * Delete a watcher
     * DELETE /api/v1/watch/{uuid}
     */
    async deleteWatcher(uuid: string): Promise<void> {
        await this.fetch(`/watch/${uuid}`, { method: "DELETE" });
    }

    /**
     * Trigger a check for a specific watcher
     * GET /api/v1/watch/{uuid}/trigger
     */
    async triggerCheck(uuid: string): Promise<void> {
        await this.fetch(`/watch/${uuid}/trigger`, { method: "GET" });
    }

    /**
     * Check system info
     * GET /api/v1/systeminfo
     */
    async getSystemInfo(): Promise<any> {
        return this.fetch("/systeminfo");
    }
}

export const changeDetectionAPI = new ChangeDetectionAPIClient();
export type { WatcherWithStats, WatcherDetail, ChangeHistoryEntry };
