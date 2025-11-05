import { useEffect, useState } from "react";
import type { PerformanceSettings } from "../components/PerformanceSettingsModal";

const STORAGE_KEY = "github-timeline-performance-settings";

const DEFAULT_SETTINGS: PerformanceSettings = {
	maxNodes: 1000,
	maxEdges: 2000,
};

export function usePerformanceSettings() {
	const [settings, setSettings] = useState<PerformanceSettings>(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored);
				return {
					maxNodes: parsed.maxNodes ?? DEFAULT_SETTINGS.maxNodes,
					maxEdges: parsed.maxEdges ?? DEFAULT_SETTINGS.maxEdges,
				};
			}
		} catch (error) {
			console.error("Failed to load performance settings:", error);
		}
		return DEFAULT_SETTINGS;
	});

	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
		} catch (error) {
			console.error("Failed to save performance settings:", error);
		}
	}, [settings]);

	return [settings, setSettings] as const;
}
