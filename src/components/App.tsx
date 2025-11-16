import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "notyf/notyf.min.css";
import "../styles/responsive.css";
import { DryUXProvider, ErrorBoundary, useSearchParams } from "dry-ux";
import WatcherList from "./WatcherList";
import ChangeHistory from "./ChangeHistory";

const App = React.memo(() => {
    const { params, setParam, clearParams } = useSearchParams<{ watcher: string }>();
    const [authEnabled, setAuthEnabled] = React.useState(false);

    React.useEffect(() => {
        // Check if auth is enabled
        fetch("/api/auth/status")
            .then(res => res.json())
            .then(data => setAuthEnabled(data.authEnabled))
            .catch(() => setAuthEnabled(false));
    }, []);

    const handleLogout = async () => {
        try {
            await fetch("/api/logout", { method: "POST" });
            window.location.href = "/login";
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <ErrorBoundary>
            <DryUXProvider rendererProps={{ modalConfig: { centered: true } }}>
                <div className="container-fluid py-3 py-md-4 px-2 px-md-3">
                    <div className="row">
                        <div className="col-12">
                            <div className="gradient-header mb-3 mb-md-4 d-flex justify-content-between align-items-center">
                                <div>
                                    <h3 className="mb-0 fs-4 fs-md-3">
                                        <i className="bi bi-speedometer2 me-2"></i>
                                        ChangeDetection.io Dashboard
                                    </h3>
                                    <small style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                                        Monitor website changes in real-time
                                    </small>
                                </div>
                                {authEnabled && (
                                    <button
                                        className="btn btn-sm btn-outline-light"
                                        onClick={handleLogout}
                                        title="Logout">
                                        <i className="bi bi-box-arrow-right me-1"></i>
                                        Logout
                                    </button>
                                )}
                            </div>
                            {!params.watcher ? (
                                <WatcherList onSelectWatcher={id => setParam("watcher", id)} />
                            ) : (
                                <ChangeHistory watcherId={params.watcher} onBack={() => clearParams("watcher")} />
                            )}
                        </div>
                    </div>
                </div>
            </DryUXProvider>
        </ErrorBoundary>
    );
});

export default App;
