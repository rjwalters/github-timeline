/**
 * Repo Timeline - 3D visualization of GitHub repository evolution
 *
 * @packageDocumentation
 */

// Export main component
export { RepoTimeline } from "../components/RepoTimeline";

// Export public types
export type {
	RepoTimelineProps,
	PlaybackSpeed,
	PlaybackDirection,
} from "./types";

// Re-export commonly needed types from internal modules
export type { CommitData, FileNode, FileEdge } from "../types";
