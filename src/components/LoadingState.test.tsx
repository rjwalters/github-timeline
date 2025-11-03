import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LoadingState } from "./LoadingState";

describe("LoadingState", () => {
	describe("basic rendering", () => {
		it("should render loading message", () => {
			render(<LoadingState loadProgress={null} fromCache={false} />);

			expect(screen.getByText("Loading repository...")).toBeInTheDocument();
		});

		it("should show analyzing message when no progress and not from cache", () => {
			render(<LoadingState loadProgress={null} fromCache={false} />);

			expect(
				screen.getByText("Analyzing commit history..."),
			).toBeInTheDocument();
		});

		it("should show cache message when no progress but from cache", () => {
			render(<LoadingState loadProgress={null} fromCache={true} />);

			expect(screen.getByText("Loading from cache...")).toBeInTheDocument();
		});
	});

	describe("progress display", () => {
		it("should show progress bar with percentage", () => {
			const loadProgress = {
				loaded: 50,
				total: 100,
				percentage: 50,
				message: null,
			};

			render(<LoadingState loadProgress={loadProgress} fromCache={false} />);

			expect(screen.getByText("Loading commits: 50 / 100")).toBeInTheDocument();
			expect(screen.getByText("50%")).toBeInTheDocument();
		});

		it("should show custom message when provided", () => {
			const loadProgress = {
				loaded: 25,
				total: 100,
				percentage: 25,
				message: "Processing pull requests...",
			};

			render(<LoadingState loadProgress={loadProgress} fromCache={false} />);

			expect(
				screen.getByText("Processing pull requests..."),
			).toBeInTheDocument();
			expect(screen.getByText("25%")).toBeInTheDocument();
		});

		it("should render progress bar with correct width", () => {
			const loadProgress = {
				loaded: 75,
				total: 100,
				percentage: 75,
				message: null,
			};

			const { container } = render(
				<LoadingState loadProgress={loadProgress} fromCache={false} />,
			);

			const progressBar = container.querySelector(".bg-blue-600");
			expect(progressBar).toHaveStyle({ width: "75%" });
		});

		it("should handle 0% progress", () => {
			const loadProgress = {
				loaded: 0,
				total: 100,
				percentage: 0,
				message: null,
			};

			render(<LoadingState loadProgress={loadProgress} fromCache={false} />);

			expect(screen.getByText("0%")).toBeInTheDocument();
		});

		it("should handle 100% progress", () => {
			const loadProgress = {
				loaded: 100,
				total: 100,
				percentage: 100,
				message: null,
			};

			render(<LoadingState loadProgress={loadProgress} fromCache={false} />);

			expect(screen.getByText("100%")).toBeInTheDocument();
		});
	});

	describe("styling", () => {
		it("should have correct container classes", () => {
			const { container } = render(
				<LoadingState loadProgress={null} fromCache={false} />,
			);

			const mainDiv = container.firstChild;
			expect(mainDiv).toHaveClass("w-full", "h-full", "bg-slate-900");
		});
	});
});
