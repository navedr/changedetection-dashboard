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
            <div className="mb-4">
                <button className="btn btn-secondary mb-3" onClick={onBack}>
                    <i className="bi bi-arrow-left"></i> Back to Watchers
                </button>
                <h2>{watcher.title}</h2>
                <p className="text-muted">{watcher.url}</p>
            </div>

            <div className="row">
                {/* Change list */}
                <div className="col-md-4">
                    <h4 className="mb-3">Change History ({watcher.changes.length})</h4>
                    <div className="list-group" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                        {watcher.changes.map(change => (
                            <button
                                key={change.id}
                                className={`list-group-item list-group-item-action ${
                                    selectedChange?.id === change.id ? "active" : ""
                                }`}
                                onClick={() => setSelectedChange(change)}>
                                <div className="d-flex w-100 justify-content-between">
                                    <small>{formatDate(change.createdAt)}</small>
                                    {change.changeType && (
                                        <span
                                            className={`badge bg-${
                                                change.changeType === "info" ? "primary" : "warning"
                                            }`}>
                                            {change.changeType}
                                        </span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Change detail */}
                <div className="col-md-8">
                    {selectedChange ? (
                        <div className="card">
                            <div className="card-header">
                                <h5 className="mb-0">Change Details</h5>
                                <small className="text-muted">{formatDate(selectedChange.createdAt)}</small>
                            </div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <h6>Changes Detected:</h6>
                                    <div dangerouslySetInnerHTML={renderMarkdown(selectedChange.message)} />
                                </div>

                                {selectedChange.screenshotBase64 && (
                                    <div className="mb-3">
                                        <h6>Screenshot:</h6>
                                        <img
                                            src={`data:${selectedChange.screenshotMimetype};base64,${selectedChange.screenshotBase64}`}
                                            alt="Screenshot"
                                            className="img-fluid border rounded"
                                            style={{ maxHeight: "400px" }}
                                        />
                                    </div>
                                )}

                                <div className="d-flex gap-2">
                                    {selectedChange.watchUrl && (
                                        <a
                                            href={selectedChange.watchUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-primary btn-sm">
                                            <i className="bi bi-eye"></i> Watch URL
                                        </a>
                                    )}
                                    {selectedChange.diffUrl && (
                                        <a
                                            href={selectedChange.diffUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-info btn-sm">
                                            <i className="bi bi-file-diff"></i> View Diff
                                        </a>
                                    )}
                                    {selectedChange.editUrl && (
                                        <a
                                            href={selectedChange.editUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-secondary btn-sm">
                                            <i className="bi bi-pencil"></i> Edit
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
