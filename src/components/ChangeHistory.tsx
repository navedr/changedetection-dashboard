import React, { useState, useEffect } from "react";

interface ChangeEvent {
    id: string;
    createdAt: string;
    timestamp: number;
    size_total: number;
    size_removed: number;
    size_added: number;
}

interface Watcher {
    id: string;
    url: string;
    title: string;
    changes: ChangeEvent[];
}

interface ChangeHistoryProps {
    watcherId: string;
    onBack: () => void;
}

const ChangeHistory: React.FC<ChangeHistoryProps> = ({ watcherId, onBack }) => {
    const [watcher, setWatcher] = useState<Watcher | null>(null);
    const [selectedChange, setSelectedChange] = useState<ChangeEvent | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [snapshotContent, setSnapshotContent] = useState<string | null>(null);
    const [loadingSnapshot, setLoadingSnapshot] = useState(false);
    const [showAllHistory, setShowAllHistory] = useState(false);
    const [filteredChanges, setFilteredChanges] = useState<ChangeEvent[]>([]);
    const [snapshotPreviews, setSnapshotPreviews] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        fetchWatcherHistory();
    }, [watcherId]);

    useEffect(() => {
        if (selectedChange && watcher) {
            fetchSnapshotContent();
        }
    }, [selectedChange]);

    useEffect(() => {
        if (watcher) {
            // Show only recent changes by default (last 30 days or 50 changes, whichever is less)
            if (showAllHistory) {
                setFilteredChanges(watcher.changes);
            } else {
                // Calculate 30 days ago
                const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

                // Filter to recent changes (within 30 days) OR take last 50
                const recentChanges = watcher.changes.filter(change => change.timestamp * 1000 >= thirtyDaysAgo);

                // If less than 10 changes in 30 days, take last 50 anyway
                if (recentChanges.length < 10 && watcher.changes.length > recentChanges.length) {
                    setFilteredChanges(watcher.changes.slice(0, 50));
                } else {
                    setFilteredChanges(recentChanges);
                }
            }
        }
    }, [watcher, showAllHistory]);

    useEffect(() => {
        // Fetch snapshot previews for all filtered changes
        if (watcher && filteredChanges.length > 0) {
            fetchAllSnapshotPreviews();
        }
    }, [filteredChanges]);

    const fetchAllSnapshotPreviews = async () => {
        if (!watcher) return;

        // Fetch previews for all changes (limit to prevent too many requests)
        const changesToFetch = filteredChanges.slice(0, 20); // Limit to first 20 for performance

        for (const change of changesToFetch) {
            // Skip if already fetched
            if (snapshotPreviews[change.id]) continue;

            try {
                const response = await fetch(`/api/snapshot/${watcher.id}/${change.id}`);
                if (response.ok) {
                    const content = await response.text();
                    // Store preview (first 200 chars)
                    setSnapshotPreviews(prev => ({
                        ...prev,
                        [change.id]: content.substring(0, 300).trim(),
                    }));
                }
            } catch (err) {
                console.error(`Error fetching preview for ${change.id}:`, err);
            }
        }
    };

    const fetchWatcherHistory = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/watchers/${watcherId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch watcher history");
            }
            const data = (await response.json()) as Watcher;
            setWatcher(data);
            if (data.changes && data.changes.length > 0) {
                setSelectedChange(data.changes[0]);
            }
            setError(null);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const fetchSnapshotContent = async () => {
        if (!selectedChange || !watcher) return;

        try {
            setLoadingSnapshot(true);
            const response = await fetch(`/api/snapshot/${watcher.id}/${selectedChange.id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch snapshot");
            }
            const content = await response.text();
            setSnapshotContent(content);
        } catch (err) {
            console.error("Error fetching snapshot:", err);
            setSnapshotContent(null);
        } finally {
            setLoadingSnapshot(false);
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

    if (!watcher) {
        return <div className="alert alert-warning">Watcher not found</div>;
    }

    return (
        <div>
            <div className="mb-3 mb-md-4">
                <button className="btn btn-secondary btn-sm mb-3" onClick={onBack}>
                    <i className="bi bi-arrow-left"></i> <span className="d-none d-sm-inline">Back to Watchers</span>
                    <span className="d-inline d-sm-none">Back</span>
                </button>
                <div>
                    <h2 className="fs-4 fs-md-3 mb-2" style={{ color: "white" }}>
                        <i className="bi bi-eye me-2"></i>
                        {watcher.title}
                    </h2>
                    <p
                        className="mb-0 small text-truncate"
                        style={{
                            maxWidth: "95%",
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            color: "rgba(255, 255, 255, 0.9)",
                        }}>
                        <i className="bi bi-link-45deg me-1"></i>
                        <a
                            href={watcher.url}
                            target={`_blank`}
                            rel="noopener noreferrer"
                            style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                            {watcher.url}
                        </a>
                    </p>
                </div>
            </div>

            <div className="row g-3">
                {/* Change list */}
                <div className="col-12 col-lg-4">
                    <div className="d-flex justify-content-between align-items-center mb-2 mb-md-3">
                        <h4 className="mb-0 fs-5 fs-md-4">
                            <i className="bi bi-clock-history me-2" style={{ color: "#6366f1" }}></i>
                            Change History ({filteredChanges.length})
                        </h4>
                        {watcher.changes.length > filteredChanges.length && (
                            <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => setShowAllHistory(!showAllHistory)}
                                title={showAllHistory ? "Show recent only" : "Show all history"}>
                                {showAllHistory ? (
                                    <>
                                        <i className="bi bi-funnel"></i>
                                        <span className="d-none d-md-inline ms-1">Recent</span>
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-list"></i>
                                        <span className="d-none d-md-inline ms-1">All ({watcher.changes.length})</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                    {!showAllHistory && watcher.changes.length > filteredChanges.length && (
                        <div className="alert alert-info small mb-2 py-2">
                            <i className="bi bi-info-circle me-1"></i>
                            Showing recent history for current URL. Click "All" to see complete history.
                        </div>
                    )}
                    <div className="list-group change-list-scroll">
                        {filteredChanges.map(change => (
                            <button
                                key={change.id}
                                className={`list-group-item list-group-item-action ${
                                    selectedChange?.id === change.id ? "active" : ""
                                }`}
                                onClick={() => setSelectedChange(change)}
                                style={{ textAlign: "left" }}>
                                <div className="d-flex w-100 justify-content-between align-items-start gap-2 flex-wrap mb-2">
                                    <small className="text-nowrap">
                                        <i className="bi bi-calendar-event me-1"></i>
                                        {formatDate(change.createdAt)}
                                    </small>
                                    {change.size_added > 0 || change.size_removed > 0 ? (
                                        <span className="text-truncate">
                                            {change.size_added > 0 && (
                                                <span className="text-success me-2">
                                                    <i className="bi bi-plus-circle"></i> {change.size_added}
                                                </span>
                                            )}
                                            {change.size_removed > 0 && (
                                                <span className="text-danger">
                                                    <i className="bi bi-dash-circle"></i> {change.size_removed}
                                                </span>
                                            )}
                                        </span>
                                    ) : null}
                                </div>
                                {snapshotPreviews[change.id] && (
                                    <div
                                        className="small text-muted mt-1 p-2 rounded"
                                        style={{
                                            fontFamily: "monospace",
                                            fontSize: "0.75rem",
                                            backgroundColor: "rgba(0,0,0,0.05)",
                                            whiteSpace: "pre-wrap",
                                            wordBreak: "break-word",
                                            maxHeight: "80px",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        }}>
                                        {snapshotPreviews[change.id]}
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Change detail */}
                <div className="col-12 col-lg-8">
                    {selectedChange ? (
                        <div className="card">
                            <div className="card-header">
                                <h5 className="mb-0">
                                    <i className="bi bi-info-circle me-2" style={{ color: "#06b6d4" }}></i>
                                    Change Details
                                </h5>
                                <small className="text-muted">
                                    <i className="bi bi-calendar-check me-1"></i>
                                    {formatDate(selectedChange.createdAt)}
                                </small>
                            </div>
                            <div className="card-body">
                                {/* Change Statistics - Only show if we have data */}
                                {(selectedChange.size_total > 0 ||
                                    selectedChange.size_added > 0 ||
                                    selectedChange.size_removed > 0) && (
                                    <div className="mb-3">
                                        <div className="row g-2 g-md-3">
                                            <div className="col-4">
                                                <div className="card bg-light">
                                                    <div className="card-body p-2 p-md-3 text-center">
                                                        <div className="text-muted small">Total Size</div>
                                                        <div className="fs-6 fw-bold">{selectedChange.size_total}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-4">
                                                <div className="card bg-light border-success">
                                                    <div className="card-body p-2 p-md-3 text-center">
                                                        <div className="text-success small">Added</div>
                                                        <div className="fs-6 fw-bold text-success">
                                                            +{selectedChange.size_added}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-4">
                                                <div className="card bg-light border-danger">
                                                    <div className="card-body p-2 p-md-3 text-center">
                                                        <div className="text-danger small">Removed</div>
                                                        <div className="fs-6 fw-bold text-danger">
                                                            -{selectedChange.size_removed}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Info about the snapshot */}
                                <div className="mb-3 p-3 bg-light rounded">
                                    <p className="mb-2">
                                        <i className="bi bi-info-circle me-2 text-info"></i>
                                        <strong>Snapshot captured:</strong> {formatDate(selectedChange.createdAt)}
                                    </p>
                                </div>

                                {/* Snapshot Content */}
                                <div className="mb-3">
                                    <h6 className="mb-2">
                                        <i className="bi bi-file-text me-2"></i>
                                        Snapshot Content
                                    </h6>
                                    {loadingSnapshot ? (
                                        <div className="text-center py-3">
                                            <div className="spinner-border spinner-border-sm" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                            <span className="ms-2">Loading snapshot...</span>
                                        </div>
                                    ) : snapshotContent ? (
                                        <div
                                            className="border rounded p-3"
                                            style={{
                                                maxHeight: "400px",
                                                overflowY: "auto",
                                                // backgroundColor: "#f8f9fa",
                                                fontFamily: "monospace",
                                                fontSize: "0.875rem",
                                                whiteSpace: "pre-wrap",
                                                wordBreak: "break-word",
                                            }}>
                                            {snapshotContent}
                                        </div>
                                    ) : (
                                        <div className="alert alert-warning">Failed to load snapshot content</div>
                                    )}
                                </div>

                                <div className="d-flex gap-2 flex-wrap">
                                    <a
                                        href={`/api/snapshot/${watcher.id}/${selectedChange.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-primary btn-sm">
                                        <i className="bi bi-eye me-1"></i>
                                        Open Snapshot in New Tab
                                    </a>
                                    <a
                                        href={`/api/diff/${watcher.id}/${selectedChange.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-info btn-sm">
                                        <i className="bi bi-file-diff me-1"></i>
                                        View Diff
                                    </a>
                                    <a
                                        href={watcher.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-secondary btn-sm">
                                        <i className="bi bi-link-45deg me-1"></i>
                                        Visit Site
                                    </a>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="alert alert-info">Select a change to view details</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChangeHistory;
