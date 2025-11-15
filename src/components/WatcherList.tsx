import React, { useState, useEffect } from "react";

interface Watcher {
    id: number;
    url: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    changeCount: number;
    latestChange: {
        id: number;
        createdAt: string;
        message: string;
    } | null;
}

interface WatcherListProps {
    onSelectWatcher: (watcherId: number) => void;
}

const WatcherList: React.FC<WatcherListProps> = ({ onSelectWatcher }) => {
    const [watchers, setWatchers] = useState<Watcher[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchWatchers();
    }, []);

    const fetchWatchers = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/watchers");
            if (!response.ok) {
                throw new Error("Failed to fetch watchers");
            }
            const data = (await response.json()) as Watcher[];
            setWatchers(data);
            setError(null);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger" role="alert">
                Error: {error}
            </div>
        );
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Watchers</h2>
                <button className="btn btn-primary" onClick={fetchWatchers}>
                    <i className="bi bi-arrow-clockwise"></i> Refresh
                </button>
            </div>

            {watchers.length === 0 ? (
                <div className="alert alert-info">No watchers found. Webhook data will appear here once received.</div>
            ) : (
                <div className="list-group">
                    {watchers.map(watcher => (
                        <button
                            key={watcher.id}
                            className="list-group-item list-group-item-action"
                            onClick={() => onSelectWatcher(watcher.id)}>
                            <div className="d-flex w-100 justify-content-between">
                                <h5 className="mb-1 text-truncate">{watcher.title}</h5>
                                <small className="text-muted">
                                    {watcher.changeCount} {watcher.changeCount === 1 ? "change" : "changes"}
                                </small>
                            </div>
                            <p
                                className="mb-1 text-truncate"
                                style={{
                                    maxWidth: "600px",
                                    textOverflow: "ellipsis",
                                    overflow: "hidden",
                                    whiteSpace: "nowrap",
                                }}>
                                <small className="text-muted">{watcher.url}</small>
                            </p>
                            {watcher.latestChange && (
                                <small className="text-muted">
                                    Latest: {formatDate(watcher.latestChange.createdAt)}
                                </small>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WatcherList;
