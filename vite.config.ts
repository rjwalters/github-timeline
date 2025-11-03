import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

// Library build configuration for npm package
// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		dts({
			include: ["src/lib/**/*", "src/components/**/*", "src/types.ts"],
			rollupTypes: true,
		}),
	],
	build: {
		lib: {
			entry: resolve(__dirname, "src/lib/index.ts"),
			name: "RepoTimeline",
			formats: ["es", "umd"],
			fileName: (format) => `index.${format === "es" ? "js" : "umd.js"}`,
		},
		rollupOptions: {
			// Externalize dependencies that shouldn't be bundled
			external: [
				"react",
				"react-dom",
				"react/jsx-runtime",
				"three",
				"@react-three/fiber",
				"@react-three/drei",
			],
			output: {
				// Provide global variables for UMD build
				globals: {
					react: "React",
					"react-dom": "ReactDOM",
					"react/jsx-runtime": "react/jsx-runtime",
					three: "THREE",
					"@react-three/fiber": "ReactThreeFiber",
					"@react-three/drei": "ReactThreeDrei",
				},
			},
		},
		// Ensure CSS is extracted
		cssCodeSplit: false,
	},
});
