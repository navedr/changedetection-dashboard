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

    const deleteWatcher = async (watcherId: number, watcherTitle: string) => {
        if (
            !confirm(
                `Are you sure you want to delete "${watcherTitle}"? This will also delete all associated change history.`,
            )
        ) {
            return;
        }

        try {
            const response = await fetch(`/api/watchers/${watcherId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete watcher");
            }

            // Refresh the list after successful deletion
            await fetchWatchers();
        } catch (err) {
            setError((err as Error).message);
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
            <div className="gradient-header d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                    <h2 className="fs-3 fs-md-2 mb-1" style={{ color: "white" }}>
                        <i className="bi bi-binoculars me-2"></i>Watchers
                    </h2>
                    <small style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                        Monitoring {watchers.length} {watchers.length === 1 ? "site" : "sites"}
                    </small>
                </div>
                <button className="btn btn-light btn-sm" onClick={fetchWatchers}>
                    <i className="bi bi-arrow-clockwise"></i> <span className="d-none d-sm-inline">Refresh</span>
                </button>
            </div>

            {watchers.length === 0 ? (
                <div className="alert alert-info">No watchers found. Webhook data will appear here once received.</div>
            ) : (
                <div className="list-group">
                    {watchers.map(watcher => (
                        <div
                            key={watcher.id}
                            className="list-group-item list-group-item-action d-flex justify-content-between align-items-start gap-2"
                            style={{ cursor: "pointer" }}>
                            <div
                                className="flex-grow-1 min-w-0"
                                style={{ maxWidth: "80%" }}
                                onClick={() => onSelectWatcher(watcher.id)}>
                                <div className="d-flex w-100 justify-content-between flex-wrap gap-2 align-items-center">
                                    <h5 className="mb-1 text-truncate fs-6 fs-md-5">
                                        <i className="bi bi-globe2 me-2" style={{ color: "#6366f1" }}></i>
                                        {watcher.title}
                                    </h5>
                                    <span
                                        className={`badge ${
                                            watcher.changeCount > 0 ? "bg-success" : "bg-secondary"
                                        } text-nowrap`}>
                                        <i className="bi bi-clock-history me-1"></i>
                                        {watcher.changeCount} {watcher.changeCount === 1 ? "change" : "changes"}
                                    </span>
                                </div>
                                <p
                                    className="mb-1 text-truncate small"
                                    style={{
                                        maxWidth: "100%",
                                        textOverflow: "ellipsis",
                                        overflow: "hidden",
                                        whiteSpace: "nowrap",
                                    }}>
                                    <i className="bi bi-link-45deg me-1" style={{ color: "#06b6d4" }}></i>
                                    <small className="text-muted">{watcher.url}</small>
                                </p>
                                {watcher.latestChange && (
                                    <small className="text-muted d-block">
                                        <i className="bi bi-calendar-event me-1" style={{ color: "#f59e0b" }}></i>
                                        Latest: {formatDate(watcher.latestChange.createdAt)}
                                    </small>
                                )}
                            </div>
                            <button
                                className="btn btn-sm btn-danger flex-shrink-0"
                                onClick={e => {
                                    e.stopPropagation();
                                    deleteWatcher(watcher.id, watcher.title);
                                }}
                                title="Delete watcher"
                                style={{ alignSelf: "center" }}>
                                <i className="bi bi-trash"></i>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WatcherList;
