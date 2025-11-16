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

    return (
        <ErrorBoundary>
            <DryUXProvider rendererProps={{ modalConfig: { centered: true } }}>
                <div className="container-fluid py-3 py-md-4 px-2 px-md-3">
                    <div className="row">
                        <div className="col-12">
                            <div className="gradient-header mb-3 mb-md-4">
                                <h3 className="mb-0 fs-4 fs-md-3">
                                    <i className="bi bi-speedometer2 me-2"></i>
                                    ChangeDetection.io Dashboard
                                </h3>
                                <small style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                                    Monitor website changes in real-time
                                </small>
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
