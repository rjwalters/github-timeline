import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";

interface PerformanceStatsProps {
	nodeCount: number;
	edgeCount: number;
}

/**
 * Performance statistics overlay for the 3D visualization
 * Displays FPS, node count, and edge count in the bottom right corner
 */
export function PerformanceStats({
	nodeCount,
	edgeCount,
}: PerformanceStatsProps) {
	const [fps, setFps] = useState(60);
	const frameCountRef = useRef(0);
	const lastTimeRef = useRef(performance.now());

	useFrame(() => {
		frameCountRef.current++;

		const currentTime = performance.now();
		const elapsed = currentTime - lastTimeRef.current;

		// Update FPS every second
		if (elapsed >= 1000) {
			const currentFps = Math.round(
				(frameCountRef.current * 1000) / elapsed,
			);
			setFps(currentFps);
			frameCountRef.current = 0;
			lastTimeRef.current = currentTime;
		}
	});

	// Get FPS color based on performance
	const getFpsColor = () => {
		if (fps >= 55) return "#10b981"; // green
		if (fps >= 30) return "#f59e0b"; // orange
		return "#ef4444"; // red
	};

	return null; // This component doesn't render anything in the 3D scene
}

/**
 * HTML overlay component for performance stats
 * Should be rendered outside the Canvas
 */
export function PerformanceStatsOverlay({
	nodeCount,
	edgeCount,
}: PerformanceStatsProps) {
	const [fps, setFps] = useState(60);
	const frameCountRef = useRef(0);
	const lastTimeRef = useRef(performance.now());
	const rafRef = useRef<number>();

	useEffect(() => {
		const updateFps = () => {
			frameCountRef.current++;

			const currentTime = performance.now();
			const elapsed = currentTime - lastTimeRef.current;

			// Update FPS every second
			if (elapsed >= 1000) {
				const currentFps = Math.round(
					(frameCountRef.current * 1000) / elapsed,
				);
				setFps(currentFps);
				frameCountRef.current = 0;
				lastTimeRef.current = currentTime;
			}

			rafRef.current = requestAnimationFrame(updateFps);
		};

		rafRef.current = requestAnimationFrame(updateFps);

		return () => {
			if (rafRef.current) {
				cancelAnimationFrame(rafRef.current);
			}
		};
	}, []);

	// Get FPS color based on performance
	const getFpsColor = () => {
		if (fps >= 55) return "#10b981"; // green
		if (fps >= 30) return "#f59e0b"; // orange
		return "#ef4444"; // red
	};

	return (
		<div
			style={{
				position: "absolute",
				bottom: "12px",
				right: "12px",
				background: "rgba(15, 23, 42, 0.9)",
				backdropFilter: "blur(8px)",
				border: "1px solid rgba(148, 163, 184, 0.2)",
				borderRadius: "6px",
				padding: "8px 12px",
				fontFamily: "monospace",
				fontSize: "11px",
				color: "#94a3b8",
				pointerEvents: "none",
				userSelect: "none",
				zIndex: 10,
			}}
		>
			<div style={{ marginBottom: "4px" }}>
				<span style={{ color: getFpsColor(), fontWeight: "bold" }}>
					{fps} FPS
				</span>
			</div>
			<div>
				<span style={{ color: "#64748b" }}>Nodes:</span>{" "}
				<span style={{ color: "#e2e8f0" }}>{nodeCount.toLocaleString()}</span>
			</div>
			<div>
				<span style={{ color: "#64748b" }}>Edges:</span>{" "}
				<span style={{ color: "#e2e8f0" }}>{edgeCount.toLocaleString()}</span>
			</div>
		</div>
	);
}
