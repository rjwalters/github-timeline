import type { FileNode } from "../types";

/**
 * Calculates the bounding sphere radius of the graph
 * by finding the maximum distance from the origin to any node
 */
export function calculateGraphBounds(nodes: FileNode[]): {
	maxDistance: number;
	farthestNode: FileNode | null;
	averageDistance: number;
	nodeDistances: Array<{ node: FileNode; distance: number }>;
} {
	if (nodes.length === 0) {
		return {
			maxDistance: 0,
			farthestNode: null,
			averageDistance: 0,
			nodeDistances: [],
		};
	}

	const nodeDistances = nodes
		.map((node) => {
			// Calculate Euclidean distance from origin (0, 0, 0)
			const distance = Math.sqrt(
				(node.x ?? 0) ** 2 + (node.y ?? 0) ** 2 + (node.z ?? 0) ** 2,
			);
			return { node, distance };
		})
		.sort((a, b) => b.distance - a.distance);

	const maxDistance = nodeDistances[0]?.distance ?? 0;
	const farthestNode = nodeDistances[0]?.node ?? null;

	const totalDistance = nodeDistances.reduce((sum, nd) => sum + nd.distance, 0);
	const averageDistance = totalDistance / nodeDistances.length;

	return {
		maxDistance,
		farthestNode,
		averageDistance,
		nodeDistances,
	};
}

/**
 * Calculates optimal camera distance based on graph bounds
 * @param maxDistance - Maximum distance from origin to any node
 * @param fov - Camera field of view in degrees
 * @returns Recommended camera distance
 */
export function calculateOptimalCameraDistance(
	maxDistance: number,
	fov: number = 75,
): number {
	// We want the entire graph to fit in the view
	// Using some trigonometry: distance = radius / tan(fov/2)
	// Add 20% padding for comfortable viewing
	const fovRadians = (fov * Math.PI) / 180;
	const baseDistance = maxDistance / Math.tan(fovRadians / 2);
	const paddedDistance = baseDistance * 1.2;

	// Clamp to reasonable values
	return Math.max(100, Math.min(paddedDistance, 500));
}

/**
 * Calculates optimal zoom limits based on graph bounds
 */
export function calculateOptimalZoomLimits(maxDistance: number): {
	minDistance: number;
	maxDistance: number;
} {
	// Min distance: close enough to see individual nodes clearly
	const minDistance = Math.max(20, maxDistance * 0.1);

	// Max distance: far enough to see entire graph with padding
	const maxZoomDistance = Math.max(200, maxDistance * 3);

	return {
		minDistance,
		maxDistance: maxZoomDistance,
	};
}
