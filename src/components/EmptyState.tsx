interface EmptyStateProps {
	repoPath: string;
}

export function EmptyState({ repoPath }: EmptyStateProps) {
	return (
		<div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">
			<div className="text-center">
				<div className="text-xl mb-2">No commits found</div>
				<div className="text-gray-400">
					Unable to load repository data for: {repoPath}
				</div>
			</div>
		</div>
	);
}
