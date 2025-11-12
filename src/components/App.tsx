import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "notyf/notyf.min.css";
import { DryUXProvider, ErrorBoundary } from "dry-ux";
import WatcherList from "./WatcherList";
import ChangeHistory from "./ChangeHistory";

const App = React.memo(() => {
    const [selectedWatcherId, setSelectedWatcherId] = useState<number | null>(null);

    return (
        <ErrorBoundary>
            <DryUXProvider rendererProps={{ modalConfig: { centered: true } }}>
                <div className="container-fluid py-4">
                    <div className="row">
                        <div className="col-12">
                            <h1 className="mb-4">ChangeDetection.io Dashboard</h1>
                            {selectedWatcherId === null ? (
                                <WatcherList onSelectWatcher={setSelectedWatcherId} />
                            ) : (
                                <ChangeHistory
                                    watcherId={selectedWatcherId}
                                    onBack={() => setSelectedWatcherId(null)}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </DryUXProvider>
        </ErrorBoundary>
    );
});

export default App;
