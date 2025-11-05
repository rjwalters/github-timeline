import type { FileEdge, FileNode } from "../types";

export interface GraphLimits {
	maxNodes: number;
	maxEdges: number;
}

/**
 * Limits the graph size based on performance settings
 * Prioritizes keeping:
 * 1. Root node (always included)
 * 2. Directory nodes (to maintain structure)
 * 3. Larger files (more significant)
 * 4. Parent/child edges (to maintain hierarchy)
 */
export function limitGraph(
	nodes: FileNode[],
	edges: FileEdge[],
	limits: GraphLimits,
): { nodes: FileNode[]; edges: FileEdge[] } {
	// If we're under the limits, return as-is
	if (nodes.length <= limits.maxNodes && edges.length <= limits.maxEdges) {
		return { nodes, edges };
	}

	// Step 1: Select nodes to keep
	const keptNodes = selectNodesToKeep(nodes, limits.maxNodes);
	const keptNodeIds = new Set(keptNodes.map((n) => n.id));

	// Step 2: Select edges to keep (only edges between kept nodes)
	const keptEdges = selectEdgesToKeep(edges, keptNodeIds, limits.maxEdges);

	return { nodes: keptNodes, edges: keptEdges };
}

/**
 * Selects which nodes to keep based on importance
 */
function selectNodesToKeep(nodes: FileNode[], maxNodes: number): FileNode[] {
	if (nodes.length <= maxNodes) {
		return nodes;
	}

	// Separate nodes by type
	const rootNode = nodes.find((n) => n.id === "/" || n.path === "/");
	const directories = nodes.filter(
		(n) => n.type === "directory" && n.id !== "/" && n.path !== "/",
	);
	const files = nodes.filter((n) => n.type === "file");

	// Sort files by size (larger files are more significant)
	const sortedFiles = [...files].sort((a, b) => b.size - a.size);

	// Sort directories by path depth (shallower directories first for structure)
	const sortedDirs = [...directories].sort((a, b) => {
		const aDepth = a.path.split("/").length;
		const bDepth = b.path.split("/").length;
		return aDepth - bDepth;
	});

	// Allocate node budget:
	// 1. Root node (always included)
	// 2. 40% for directories (maintain structure)
	// 3. 60% for files
	const result: FileNode[] = [];

	// Always include root
	if (rootNode) {
		result.push(rootNode);
	}

	const remainingBudget = maxNodes - result.length;
	const dirBudget = Math.floor(remainingBudget * 0.4);
	const fileBudget = remainingBudget - dirBudget;

	// Add directories up to budget
	result.push(...sortedDirs.slice(0, dirBudget));

	// Add files up to budget
	result.push(...sortedFiles.slice(0, fileBudget));

	return result;
}

/**
 * Selects which edges to keep based on importance
 */
function selectEdgesToKeep(
	edges: FileEdge[],
	keptNodeIds: Set<string>,
	maxEdges: number,
): FileEdge[] {
	// Only keep edges where both nodes are in the kept set
	const validEdges = edges.filter(
		(e) => keptNodeIds.has(e.source) && keptNodeIds.has(e.target),
	);

	if (validEdges.length <= maxEdges) {
		return validEdges;
	}

	// Prioritize parent edges over other edge types
	const parentEdges = validEdges.filter((e) => e.type === "parent");
	const otherEdges = validEdges.filter((e) => e.type !== "parent");

	// Allocate 80% budget to parent edges, 20% to others
	const parentBudget = Math.floor(maxEdges * 0.8);
	const otherBudget = maxEdges - parentBudget;

	const keptParentEdges = parentEdges.slice(0, parentBudget);
	const keptOtherEdges = otherEdges.slice(0, otherBudget);

	return [...keptParentEdges, ...keptOtherEdges];
}
