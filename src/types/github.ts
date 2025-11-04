export interface GitHubPR {
	number: number;
	title: string;
	merged_at: string | null;
	merge_commit_sha?: string | null;
	user: {
		login: string;
	};
	files_url: string;
	files?: GitHubPRFile[]; // Optional - included when fetched from worker
}

export interface GitHubCommit {
	sha: string;
	commit: {
		message: string;
		author: {
			name: string;
			date: string;
		};
	};
	files?: GitHubCommitFile[];
}

export interface GitHubCommitFile {
	filename: string;
	status: "added" | "removed" | "modified" | "renamed";
	additions: number;
	deletions: number;
	changes: number;
	previous_filename?: string;
}

export interface GitHubWorkerCommit {
	sha: string;
	commit: {
		message: string;
		author: {
			name: string;
			date: string;
		};
	};
	files?: GitHubCommitFile[];
}

export interface GitHubPRFile {
	filename: string;
	status: "added" | "removed" | "modified" | "renamed";
	additions: number;
	deletions: number;
	changes: number;
	previous_filename?: string;
}
