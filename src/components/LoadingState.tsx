import type { LoadProgress } from "../services/gitService";

interface LoadingStateProps {
	loadProgress: LoadProgress | null;
	fromCache: boolean;
}

export function LoadingState({ loadProgress, fromCache }: LoadingStateProps) {
	return (
		<div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">
			<div className="text-center max-w-md">
				<div className="text-xl mb-4">Loading repository...</div>
				{loadProgress ? (
					<>
						<div className="mb-2 text-gray-400">
							{loadProgress.message || `Loading commits: ${loadProgress.loaded} / ${loadProgress.total}`}
						</div>
						<div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
							<div
								className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
								style={{ width: `${loadProgress.percentage}%` }}
							/>
						</div>
						<div className="text-sm text-gray-500">
							{loadProgress.percentage}%
						</div>
					</>
				) : (
					<div className="text-gray-400">
						{fromCache ? "Loading from cache..." : "Analyzing commit history..."}
					</div>
				)}
			</div>
		</div>
	);
}
