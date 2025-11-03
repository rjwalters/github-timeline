import { beforeEach, describe, expect, it } from "vitest";
import type { FileEdge, FileNode } from "../types";
import { ForceSimulation } from "./forceSimulation";

describe("ForceSimulation", () => {
	describe("initialization", () => {
		it("should initialize nodes with random positions if not set", () => {
			const nodes: FileNode[] = [
				{
					id: "file1.ts",
					path: "file1.ts",
					name: "file1.ts",
					size: 100,
					type: "file",
				},
				{
					id: "file2.ts",
					path: "file2.ts",
					name: "file2.ts",
					size: 200,
					type: "file",
				},
			];

			const simulation = new ForceSimulation(nodes, []);
			const resultNodes = simulation.getNodes();

			// All nodes should have positions
			resultNodes.forEach((node) => {
				expect(node.x).toBeDefined();
				expect(node.y).toBeDefined();
				expect(node.z).toBeDefined();
				expect(node.vx).toBe(0);
				expect(node.vy).toBe(0);
				expect(node.vz).toBe(0);
			});
		});

		it("should preserve existing node positions", () => {
			const nodes: FileNode[] = [
				{
					id: "file1.ts",
					path: "file1.ts",
					name: "file1.ts",
					size: 100,
					type: "file",
					x: 50,
					y: 60,
					z: 70,
					vx: 1,
					vy: 2,
					vz: 3,
				},
			];

			const simulation = new ForceSimulation(nodes, []);
			const resultNodes = simulation.getNodes();

			expect(resultNodes[0].x).toBe(50);
			expect(resultNodes[0].y).toBe(60);
			expect(resultNodes[0].z).toBe(70);
		});

		it("should initialize positions within reasonable bounds", () => {
			const nodes: FileNode[] = [
				{
					id: "file1.ts",
					path: "file1.ts",
					name: "file1.ts",
					size: 100,
					type: "file",
				},
			];

			const simulation = new ForceSimulation(nodes, []);
			const resultNodes = simulation.getNodes();

			const node = resultNodes[0];
			const distance = Math.sqrt(
				node.x! * node.x! + node.y! * node.y! + node.z! * node.z!,
			);

			// Radius should be between 100 and 200 based on initialization logic
			expect(distance).toBeGreaterThanOrEqual(100);
			expect(distance).toBeLessThanOrEqual(200);
		});

		it("should handle empty node array", () => {
			const simulation = new ForceSimulation([], []);
			const nodes = simulation.getNodes();

			expect(nodes).toHaveLength(0);
		});

		it("should preserve edges", () => {
			const edges: FileEdge[] = [
				{
					source: "src",
					target: "src/index.ts",
					type: "parent",
				},
			];

			const simulation = new ForceSimulation([], edges);
			const resultEdges = simulation.getEdges();

			expect(resultEdges).toEqual(edges);
		});
	});

	describe("tick - position updates", () => {
		it("should update node positions based on velocity", () => {
			const nodes: FileNode[] = [
				{
					id: "file1.ts",
					path: "file1.ts",
					name: "file1.ts",
					size: 100,
					type: "file",
					x: 0,
					y: 0,
					z: 0,
					vx: 5,
					vy: 3,
					vz: 2,
				},
			];

			const simulation = new ForceSimulation(nodes, []);
			simulation.tick();

			const node = simulation.getNodes()[0];

			// Velocity should be damped (0.85 damping)
			expect(node.vx).toBeLessThan(5);
			expect(node.vy).toBeLessThan(3);
			expect(node.vz).toBeLessThan(2);

			// Position should have changed
			expect(node.x).not.toBe(0);
			expect(node.y).not.toBe(0);
			expect(node.z).not.toBe(0);
		});

		it("should apply velocity damping", () => {
			const nodes: FileNode[] = [
				{
					id: "file1.ts",
					path: "file1.ts",
					name: "file1.ts",
					size: 100,
					type: "file",
					x: 0,
					y: 0,
					z: 0,
					vx: 10,
					vy: 0,
					vz: 0,
				},
			];

			const simulation = new ForceSimulation(nodes, []);
			simulation.tick();

			const node = simulation.getNodes()[0];

			// Velocity should be damped by 0.85
			expect(node.vx).toBeLessThan(10);
			expect(node.vx).toBeGreaterThan(0);
		});

		it("should limit maximum velocity", () => {
			const nodes: FileNode[] = [
				{
					id: "file1.ts",
					path: "file1.ts",
					name: "file1.ts",
					size: 100,
					type: "file",
					x: 0,
					y: 0,
					z: 0,
					vx: 100,
					vy: 100,
					vz: 100,
				},
			];

			const simulation = new ForceSimulation(nodes, []);
			simulation.tick();

			const node = simulation.getNodes()[0];

			// Velocity magnitude should be limited to 10
			const velocityMagnitude = Math.sqrt(
				node.vx! * node.vx! + node.vy! * node.vy! + node.vz! * node.vz!,
			);

			expect(velocityMagnitude).toBeLessThanOrEqual(10.1); // Small margin for floating point
		});

		it("should handle multiple ticks", () => {
			const nodes: FileNode[] = [
				{
					id: "file1.ts",
					path: "file1.ts",
					name: "file1.ts",
					size: 100,
					type: "file",
					x: 0,
					y: 0,
					z: 0,
					vx: 5,
					vy: 5,
					vz: 5,
				},
			];

			const simulation = new ForceSimulation(nodes, []);
			const initialX = nodes[0].x;

			simulation.tick();
			const xAfterTick1 = simulation.getNodes()[0].x;

			simulation.tick();
			const xAfterTick2 = simulation.getNodes()[0].x;

			// Position should continue to change
			expect(xAfterTick1).not.toBe(initialX);
			expect(xAfterTick2).not.toBe(xAfterTick1);
		});
	});

	describe("spring forces", () => {
		it("should pull connected nodes together when far apart", () => {
			const nodes: FileNode[] = [
				{
					id: "parent",
					path: "src",
					name: "src",
					size: 0,
					type: "directory",
					x: 0,
					y: 0,
					z: 0,
					vx: 0,
					vy: 0,
					vz: 0,
				},
				{
					id: "child",
					path: "src/index.ts",
					name: "index.ts",
					size: 100,
					type: "file",
					x: 1000,
					y: 0,
					z: 0,
					vx: 0,
					vy: 0,
					vz: 0,
				},
			];

			const edges: FileEdge[] = [
				{
					source: "parent",
					target: "child",
					type: "parent",
				},
			];

			const simulation = new ForceSimulation(nodes, edges);
			simulation.tick();

			const resultNodes = simulation.getNodes();
			const parent = resultNodes.find((n) => n.id === "parent");
			const child = resultNodes.find((n) => n.id === "child");

			// Parent should be pulled towards child (positive x velocity)
			expect(parent!.vx).toBeGreaterThan(0);

			// Child should be pulled towards parent (negative x velocity)
			expect(child!.vx).toBeLessThan(0);
		});

		it("should handle nodes at ideal distance", () => {
			// Ideal distance is 30 + node radii
			const nodes: FileNode[] = [
				{
					id: "parent",
					path: "src",
					name: "src",
					size: 0,
					type: "directory",
					x: 0,
					y: 0,
					z: 0,
					vx: 0,
					vy: 0,
					vz: 0,
				},
				{
					id: "child",
					path: "src/index.ts",
					name: "index.ts",
					size: 100,
					type: "file",
					x: 31,
					y: 0,
					z: 0,
					vx: 0,
					vy: 0,
					vz: 0,
				},
			];

			const edges: FileEdge[] = [
				{
					source: "parent",
					target: "child",
					type: "parent",
				},
			];

			const simulation = new ForceSimulation(nodes, edges);
			simulation.tick();

			const resultNodes = simulation.getNodes();
			const parent = resultNodes.find((n) => n.id === "parent");
			const child = resultNodes.find((n) => n.id === "child");

			// Forces should be weaker than when far apart
			// Centering force will still apply
			expect(Math.abs(parent!.vx!)).toBeLessThan(15);
			expect(Math.abs(child!.vx!)).toBeLessThan(15);
		});

		it("should handle missing source or target node", () => {
			const nodes: FileNode[] = [
				{
					id: "parent",
					path: "src",
					name: "src",
					size: 0,
					type: "directory",
					x: 0,
					y: 0,
					z: 0,
					vx: 0,
					vy: 0,
					vz: 0,
				},
			];

			const edges: FileEdge[] = [
				{
					source: "parent",
					target: "nonexistent",
					type: "parent",
				},
			];

			const simulation = new ForceSimulation(nodes, edges);

			// Should not throw
			expect(() => simulation.tick()).not.toThrow();
		});
	});

	describe("repulsion forces", () => {
		it("should push overlapping nodes apart", () => {
			const nodes: FileNode[] = [
				{
					id: "file1.ts",
					path: "file1.ts",
					name: "file1.ts",
					size: 100,
					type: "file",
					x: 0,
					y: 0,
					z: 0,
					vx: 0,
					vy: 0,
					vz: 0,
				},
				{
					id: "file2.ts",
					path: "file2.ts",
					name: "file2.ts",
					size: 100,
					type: "file",
					x: 1,
					y: 0,
					z: 0,
					vx: 0,
					vy: 0,
					vz: 0,
				},
			];

			const simulation = new ForceSimulation(nodes, []);
			simulation.tick();

			const resultNodes = simulation.getNodes();

			// Nodes should be pushed apart in x direction
			expect(resultNodes[0].vx).toBeLessThan(0); // First node pushed left
			expect(resultNodes[1].vx).toBeGreaterThan(0); // Second node pushed right
		});

		it("should apply stronger force when nodes are closer", () => {
			const nodesClose: FileNode[] = [
				{
					id: "file1",
					path: "file1",
					name: "file1",
					size: 100,
					type: "file",
					x: 0,
					y: 0,
					z: 0,
					vx: 0,
					vy: 0,
					vz: 0,
				},
				{
					id: "file2",
					path: "file2",
					name: "file2",
					size: 100,
					type: "file",
					x: 2,
					y: 0,
					z: 0,
					vx: 0,
					vy: 0,
					vz: 0,
				},
			];

			const nodesFar: FileNode[] = [
				{
					id: "file1",
					path: "file1",
					name: "file1",
					size: 100,
					type: "file",
					x: 0,
					y: 0,
					z: 0,
					vx: 0,
					vy: 0,
					vz: 0,
				},
				{
					id: "file2",
					path: "file2",
					name: "file2",
					size: 100,
					type: "file",
					x: 100,
					y: 0,
					z: 0,
					vx: 0,
					vy: 0,
					vz: 0,
				},
			];

			const simClose = new ForceSimulation(nodesClose, []);
			simClose.tick();

			const simFar = new ForceSimulation(nodesFar, []);
			simFar.tick();

			const closeForce = Math.abs(simClose.getNodes()[0].vx!);
			const farForce = Math.abs(simFar.getNodes()[0].vx!);

			// Closer nodes should experience stronger repulsion
			expect(closeForce).toBeGreaterThan(farForce);
		});

		it("should handle single node (no repulsion)", () => {
			const nodes: FileNode[] = [
				{
					id: "file1.ts",
					path: "file1.ts",
					name: "file1.ts",
					size: 100,
					type: "file",
					x: 0,
					y: 0,
					z: 0,
					vx: 0,
					vy: 0,
					vz: 0,
				},
			];

			const simulation = new ForceSimulation(nodes, []);

			// Should not throw
			expect(() => simulation.tick()).not.toThrow();
		});

		it("should consider node sizes in repulsion", () => {
			const nodesSmall: FileNode[] = [
				{
					id: "file1",
					path: "file1",
					name: "file1",
					size: 10,
					type: "file",
					x: 0,
					y: 0,
					z: 0,
					vx: 0,
					vy: 0,
					vz: 0,
				},
				{
					id: "file2",
					path: "file2",
					name: "file2",
					size: 10,
					type: "file",
					x: 5,
					y: 0,
					z: 0,
					vx: 0,
					vy: 0,
					vz: 0,
				},
			];

			const nodesLarge: FileNode[] = [
				{
					id: "file1",
					path: "file1",
					name: "file1",
					size: 10000,
					type: "file",
					x: 0,
					y: 0,
					z: 0,
					vx: 0,
					vy: 0,
					vz: 0,
				},
				{
					id: "file2",
					path: "file2",
					name: "file2",
					size: 10000,
					type: "file",
					x: 5,
					y: 0,
					z: 0,
					vx: 0,
					vy: 0,
					vz: 0,
				},
			];

			const simSmall = new ForceSimulation(nodesSmall, []);
			simSmall.tick();

			const simLarge = new ForceSimulation(nodesLarge, []);
			simLarge.tick();

			const smallForce = Math.abs(simSmall.getNodes()[0].vx!);
			const largeForce = Math.abs(simLarge.getNodes()[0].vx!);

			// Larger nodes should have stronger repulsion
			expect(largeForce).toBeGreaterThan(smallForce);
		});
	});

	describe("centering force", () => {
		it("should pull nodes towards origin", () => {
			const nodes: FileNode[] = [
				{
					id: "file1.ts",
					path: "file1.ts",
					name: "file1.ts",
					size: 100,
					type: "file",
					x: 100,
					y: 100,
					z: 100,
					vx: 0,
					vy: 0,
					vz: 0,
				},
			];

			const simulation = new ForceSimulation(nodes, []);
			simulation.tick();

			const node = simulation.getNodes()[0];

			// Node should have velocity towards origin (negative direction)
			expect(node.vx).toBeLessThan(0);
			expect(node.vy).toBeLessThan(0);
			expect(node.vz).toBeLessThan(0);
		});

		it("should have weak centering force", () => {
			const nodes: FileNode[] = [
				{
					id: "file1.ts",
					path: "file1.ts",
					name: "file1.ts",
					size: 100,
					type: "file",
					x: 100,
					y: 0,
					z: 0,
					vx: 0,
					vy: 0,
					vz: 0,
				},
			];

			const simulation = new ForceSimulation(nodes, []);
			simulation.tick();

			const node = simulation.getNodes()[0];

			// Centering force should be weak (strength 0.01)
			// Expected: approximately -100 * 0.01 * 0.85 (damping) = -0.85
			expect(Math.abs(node.vx!)).toBeLessThan(2);
		});
	});

	describe("combined forces", () => {
		it("should balance spring and repulsion forces", () => {
			const nodes: FileNode[] = [
				{
					id: "parent",
					path: "src",
					name: "src",
					size: 0,
					type: "directory",
					x: 0,
					y: 0,
					z: 0,
					vx: 0,
					vy: 0,
					vz: 0,
				},
				{
					id: "child1",
					path: "src/file1.ts",
					name: "file1.ts",
					size: 100,
					type: "file",
					x: 50,
					y: 0,
					z: 0,
					vx: 0,
					vy: 0,
					vz: 0,
				},
				{
					id: "child2",
					path: "src/file2.ts",
					name: "file2.ts",
					size: 100,
					type: "file",
					x: 51,
					y: 0,
					z: 0,
					vx: 0,
					vy: 0,
					vz: 0,
				},
			];

			const edges: FileEdge[] = [
				{
					source: "parent",
					target: "child1",
					type: "parent",
				},
				{
					source: "parent",
					target: "child2",
					type: "parent",
				},
			];

			const simulation = new ForceSimulation(nodes, edges);
			simulation.tick();

			const resultNodes = simulation.getNodes();

			// All nodes should have some forces applied
			resultNodes.forEach((node) => {
				const hasForce =
					Math.abs(node.vx!) > 0 ||
					Math.abs(node.vy!) > 0 ||
					Math.abs(node.vz!) > 0;
				expect(hasForce).toBe(true);
			});
		});

		it("should reach stable configuration over multiple ticks", () => {
			const nodes: FileNode[] = [
				{
					id: "parent",
					path: "src",
					name: "src",
					size: 0,
					type: "directory",
					x: 0,
					y: 0,
					z: 0,
					vx: 0,
					vy: 0,
					vz: 0,
				},
				{
					id: "child",
					path: "src/index.ts",
					name: "index.ts",
					size: 100,
					type: "file",
					x: 100,
					y: 0,
					z: 0,
					vx: 0,
					vy: 0,
					vz: 0,
				},
			];

			const edges: FileEdge[] = [
				{
					source: "parent",
					target: "child",
					type: "parent",
				},
			];

			const simulation = new ForceSimulation(nodes, edges);

			// Run many iterations
			for (let i = 0; i < 100; i++) {
				simulation.tick();
			}

			const resultNodes = simulation.getNodes();
			const parent = resultNodes.find((n) => n.id === "parent");
			const child = resultNodes.find((n) => n.id === "child");

			// Velocities should be small (approaching stability)
			expect(Math.abs(parent!.vx!)).toBeLessThan(2);
			expect(Math.abs(child!.vx!)).toBeLessThan(2);

			// Distance should be reasonable
			const dx = child!.x! - parent!.x!;
			const dy = child!.y! - parent!.y!;
			const dz = child!.z! - parent!.z!;
			const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

			// Should settle somewhere reasonable (allow wider range)
			expect(distance).toBeGreaterThan(20);
			expect(distance).toBeLessThan(100);
		});
	});

	describe("edge cases", () => {
		it("should handle nodes with zero size", () => {
			const nodes: FileNode[] = [
				{
					id: "empty",
					path: "empty",
					name: "empty",
					size: 0,
					type: "file",
					x: 0,
					y: 0,
					z: 0,
					vx: 0,
					vy: 0,
					vz: 0,
				},
			];

			const simulation = new ForceSimulation(nodes, []);

			expect(() => simulation.tick()).not.toThrow();
		});

		it("should handle nodes at same position", () => {
			const nodes: FileNode[] = [
				{
					id: "file1",
					path: "file1",
					name: "file1",
					size: 100,
					type: "file",
					x: 0,
					y: 0,
					z: 0,
					vx: 0,
					vy: 0,
					vz: 0,
				},
				{
					id: "file2",
					path: "file2",
					name: "file2",
					size: 100,
					type: "file",
					x: 0,
					y: 0,
					z: 0,
					vx: 0,
					vy: 0,
					vz: 0,
				},
			];

			const simulation = new ForceSimulation(nodes, []);

			// Should not throw (division by zero protection with || 1)
			expect(() => simulation.tick()).not.toThrow();

			// With distance protection (|| 1), forces may still be calculated
			// Just verify it doesn't crash
			expect(simulation.getNodes()).toHaveLength(2);
		});

		it("should handle very large numbers of nodes", () => {
			const nodes: FileNode[] = Array.from({ length: 50 }, (_, i) => ({
				id: `file${i}`,
				path: `file${i}`,
				name: `file${i}`,
				size: 100,
				type: "file" as const,
				x: Math.random() * 100,
				y: Math.random() * 100,
				z: Math.random() * 100,
				vx: 0,
				vy: 0,
				vz: 0,
			}));

			const simulation = new ForceSimulation(nodes, []);

			// Should complete in reasonable time
			expect(() => simulation.tick()).not.toThrow();
		});

		it("should handle config parameter (backward compatibility)", () => {
			const nodes: FileNode[] = [
				{
					id: "file1",
					path: "file1",
					name: "file1",
					size: 100,
					type: "file",
				},
			];

			// Config is accepted but ignored (for backward compatibility)
			const simulation = new ForceSimulation(nodes, [], {
				strength: 1.0,
				distance: 15,
				iterations: 500,
			});

			expect(simulation.getNodes()).toHaveLength(1);
		});
	});
});
