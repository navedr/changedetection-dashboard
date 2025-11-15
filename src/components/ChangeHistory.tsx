import React, { useState, useEffect } from "react";

interface ChangeEvent {
    id: number;
    title: string;
    message: string;
    diffUrl: string | null;
    watchUrl: string | null;
    editUrl: string | null;
    screenshotBase64: string | null;
    screenshotMimetype: string | null;
    changeType: string | null;
    oldValue: string | null;
    newValue: string | null;
    createdAt: string;
}

interface Watcher {
    id: number;
    url: string;
    title: string;
    changes: ChangeEvent[];
}

interface ChangeHistoryProps {
    watcherId: number;
    onBack: () => void;
}

const ChangeHistory: React.FC<ChangeHistoryProps> = ({ watcherId, onBack }) => {
    const [watcher, setWatcher] = useState<Watcher | null>(null);
    const [selectedChange, setSelectedChange] = useState<ChangeEvent | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchWatcherHistory();
    }, [watcherId]);

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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const renderMarkdown = (text: string) => {
        // Simple markdown rendering
        let html = text
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/<del>(.*?)<\/del>/g, '<del class="text-danger">$1</del>')
            .replace(/\n/g, "<br>");

        return { __html: html };
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
                <div className="gradient-header">
                    <h2 className="fs-4 fs-md-3 mb-2" style={{ color: "white" }}>
                        <i className="bi bi-eye me-2"></i>
                        {watcher.title}
                    </h2>
                    <p
                        className="mb-0 small text-truncate"
                        style={{ maxWidth: "100%", color: "rgba(255, 255, 255, 0.9)" }}>
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
                    <h4 className="mb-2 mb-md-3 fs-5 fs-md-4">
                        <i className="bi bi-clock-history me-2" style={{ color: "#6366f1" }}></i>
                        Change History ({watcher.changes.length})
                    </h4>
                    <div className="list-group change-list-scroll">
                        {watcher.changes.map(change => (
                            <button
                                key={change.id}
                                className={`list-group-item list-group-item-action ${
                                    selectedChange?.id === change.id ? "active" : ""
                                }`}
                                onClick={() => setSelectedChange(change)}>
                                <div className="d-flex w-100 justify-content-between align-items-start gap-2 flex-wrap">
                                    <small className="text-nowrap">
                                        <i className="bi bi-calendar-event me-1"></i>
                                        {formatDate(change.createdAt)}
                                    </small>
                                    <span className="text-truncate">
                                        <i className="bi bi-arrow-right-circle me-1" style={{ color: "#10b981" }}></i>
                                        {change.newValue}
                                    </span>
                                </div>
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
                                    <i className="bi bi-info-circle me-2" style={{ color: '#06b6d4' }}></i>
                                    Change Details
                                </h5>
                                <small className="text-muted">
                                    <i className="bi bi-calendar-check me-1"></i>
                                    {formatDate(selectedChange.createdAt)}
                                </small>
                            </div>
                            <div className="card-body">
                                {/* Value Comparison Section */}
                                {(selectedChange.oldValue || selectedChange.newValue) && (
                                    <div className="mb-4">
                                        <h6 className="mb-3">
                                            <i className="bi bi-arrow-left-right me-2" style={{ color: '#f59e0b' }}></i>
                                            Value Change:
                                        </h6>
                                        <div className="row g-2 g-md-3">
                                            {selectedChange.oldValue && (
                                                <div className="col-12 col-md-6">
                                                    <div className="card bg-light border-danger">
                                                        <div className="card-body p-2 p-md-3">
                                                            <small className="text-muted d-block mb-2">
                                                                <i className="bi bi-dash-circle text-danger"></i> Old
                                                                Value
                                                            </small>
                                                            <div className="fs-5 fs-md-4 text-danger text-decoration-line-through">
                                                                {selectedChange.oldValue}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {selectedChange.newValue && (
                                                <div className="col-12 col-md-6">
                                                    <div className="card bg-light border-success">
                                                        <div className="card-body p-2 p-md-3">
                                                            <small className="text-muted d-block mb-2">
                                                                <i className="bi bi-check-circle text-success"></i> New
                                                                Value
                                                            </small>
                                                            <div className="fs-5 fs-md-4 text-success fw-bold">
                                                                {selectedChange.newValue}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="mb-3">
                                    <h6>
                                        <i className="bi bi-file-text me-2" style={{ color: '#3b82f6' }}></i>
                                        Changes Detected:
                                    </h6>
                                    <div dangerouslySetInnerHTML={renderMarkdown(selectedChange.message)} />
                                </div>

                                {selectedChange.screenshotBase64 && (
                                    <div className="mb-3">
                                        <h6>
                                            <i className="bi bi-camera me-2" style={{ color: '#ec4899' }}></i>
                                            Screenshot:
                                        </h6>
                                        <img
                                            src={`data:${selectedChange.screenshotMimetype};base64,${selectedChange.screenshotBase64}`}
                                            alt="Screenshot"
                                            className="img-fluid border rounded"
                                            style={{ maxHeight: "400px", width: "100%", objectFit: "contain" }}
                                        />
                                    </div>
                                )}

                                <div className="d-flex gap-2 flex-wrap">
                                    {selectedChange.watchUrl && (
                                        <a
                                            href={selectedChange.watchUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-primary btn-sm">
                                            <i className="bi bi-eye"></i>{" "}
                                            <span className="d-none d-sm-inline">Watch URL</span>
                                        </a>
                                    )}
                                    {selectedChange.diffUrl && (
                                        <a
                                            href={selectedChange.diffUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-info btn-sm">
                                            <i className="bi bi-file-diff"></i>{" "}
                                            <span className="d-none d-sm-inline">View Diff</span>
                                        </a>
                                    )}
                                    {selectedChange.editUrl && (
                                        <a
                                            href={selectedChange.editUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-secondary btn-sm">
                                            <i className="bi bi-pencil"></i>{" "}
                                            <span className="d-none d-sm-inline">Edit</span>
                                        </a>
                                    )}
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
