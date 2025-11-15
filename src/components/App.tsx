import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "notyf/notyf.min.css";
import { DryUXProvider, ErrorBoundary, useSearchParams } from "dry-ux";
import WatcherList from "./WatcherList";
import ChangeHistory from "./ChangeHistory";

const App = React.memo(() => {
    const { params, setParam, clearParams } = useSearchParams<{ watcher: number }>();

    return (
        <ErrorBoundary>
            <DryUXProvider rendererProps={{ modalConfig: { centered: true } }}>
                <div className="container-fluid py-4">
                    <div className="row">
                        <div className="col-12">
                            <h3 className="mb-4">ChangeDetection.io Dashboard</h3>
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
