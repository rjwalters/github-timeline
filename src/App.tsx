import { useState } from "react";
import { RepoInput } from "./components/RepoInput";
import { RepoTimeline } from "./components/RepoTimeline";
import "./index.css";

function App() {
	const [repoPath, setRepoPath] = useState<string | null>(null);

	return (
		<div className="w-screen h-screen">
			{repoPath ? (
				<RepoTimeline repoPath={repoPath} onBack={() => setRepoPath(null)} />
			) : (
				<RepoInput onSubmit={setRepoPath} />
			)}
		</div>
	);
}

export default App;
