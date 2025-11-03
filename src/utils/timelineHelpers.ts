import type { CommitData } from "../types";

/**
 * Find the index of the commit at or before the given time
 * @param commits Array of commits sorted by date
 * @param time Timestamp in milliseconds
 * @returns Index of the current commit (0 if no commits or time is before first commit)
 */
export function getCurrentIndex(commits: CommitData[], time: number): number {
	if (commits.length === 0) return 0;
	// Find the latest commit that is <= current time
	for (let i = commits.length - 1; i >= 0; i--) {
		if (commits[i].date.getTime() <= time) {
			return i;
		}
	}
	return 0;
}
