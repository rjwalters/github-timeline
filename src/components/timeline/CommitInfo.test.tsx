import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { CommitData } from "../../types";
import { CommitInfo } from "./CommitInfo";

describe("CommitInfo", () => {
	const mockCommit: CommitData = {
		hash: "abc123def456",
		message: "Add new feature",
		author: "John Doe",
		date: new Date("2024-01-15T14:30:00Z"),
		files: [],
		edges: [],
	};

	const defaultProps = {
		commit: mockCommit,
		currentTime: new Date("2024-01-15T14:30:00Z").getTime(),
		isPlaying: false,
	};

	describe("commit information rendering", () => {
		it("should render commit message", () => {
			render(<CommitInfo {...defaultProps} />);

			expect(screen.getByText("Add new feature")).toBeInTheDocument();
		});

		it("should render author name", () => {
			render(<CommitInfo {...defaultProps} />);

			expect(screen.getByText(/John Doe/)).toBeInTheDocument();
		});

		it("should render commit date", () => {
			render(<CommitInfo {...defaultProps} />);

			// Date will be rendered as "1/15/2024" (or locale-specific)
			expect(screen.getByText(/1\/15\/2024/)).toBeInTheDocument();
		});

		it("should render author and date together", () => {
			render(<CommitInfo {...defaultProps} />);

			// Check for the bullet separator
			expect(screen.getByText(/John Doe •/)).toBeInTheDocument();
		});
	});

	describe("playback time display", () => {
		it("should not show current time when not playing", () => {
			const { container } = render(
				<CommitInfo {...defaultProps} isPlaying={false} />,
			);

			// Time display should not be visible (it has text-blue-400 class)
			const timeDisplay = container.querySelector(".text-blue-400");
			expect(timeDisplay).not.toBeInTheDocument();
		});

		it("should show current time when playing", () => {
			const currentTime = new Date("2024-06-20T10:15:30Z").getTime();
			const { container } = render(
				<CommitInfo
					{...defaultProps}
					isPlaying={true}
					currentTime={currentTime}
				/>,
			);

			// Should show the current time with blue color
			const timeDisplay = container.querySelector(".text-blue-400");
			expect(timeDisplay).toBeInTheDocument();
			// Check that it contains 2024 (year should be in the output)
			expect(timeDisplay).toHaveTextContent("2024");
		});

		it("should format current time correctly", () => {
			const currentTime = new Date("2024-12-31T23:59:59Z").getTime();
			const { container } = render(
				<CommitInfo
					{...defaultProps}
					isPlaying={true}
					currentTime={currentTime}
				/>,
			);

			const timeDisplay = container.querySelector(".text-blue-400");
			expect(timeDisplay).toBeInTheDocument();
			expect(timeDisplay).toHaveTextContent("2024");
			expect(timeDisplay).toHaveTextContent("31"); // Day
		});

		it("should update time display when currentTime changes", () => {
			const { rerender, container } = render(
				<CommitInfo
					{...defaultProps}
					isPlaying={true}
					currentTime={new Date("2024-06-15T12:00:00Z").getTime()}
				/>,
			);

			let timeDisplay = container.querySelector(".text-blue-400");
			expect(timeDisplay).toBeInTheDocument();
			const firstText = timeDisplay?.textContent || "";

			rerender(
				<CommitInfo
					{...defaultProps}
					isPlaying={true}
					currentTime={new Date("2024-12-25T12:00:00Z").getTime()}
				/>,
			);

			timeDisplay = container.querySelector(".text-blue-400");
			const secondText = timeDisplay?.textContent || "";

			// Texts should be different
			expect(firstText).not.toBe(secondText);
			// Both should contain 2024
			expect(firstText).toContain("2024");
			expect(secondText).toContain("2024");
		});
	});

	describe("different commit data", () => {
		it("should handle long commit messages", () => {
			const longCommit: CommitData = {
				...mockCommit,
				message: "A".repeat(200),
			};

			render(<CommitInfo {...defaultProps} commit={longCommit} />);

			expect(screen.getByText("A".repeat(200))).toBeInTheDocument();
		});

		it("should handle commit message with special characters", () => {
			const specialCommit: CommitData = {
				...mockCommit,
				message: "Fix: Update <Component> & handle 'edge' cases",
			};

			render(<CommitInfo {...defaultProps} commit={specialCommit} />);

			expect(
				screen.getByText("Fix: Update <Component> & handle 'edge' cases"),
			).toBeInTheDocument();
		});

		it("should handle author names with special characters", () => {
			const specialAuthor: CommitData = {
				...mockCommit,
				author: "François O'Brien-Smith",
			};

			render(<CommitInfo {...defaultProps} commit={specialAuthor} />);

			expect(screen.getByText(/François O'Brien-Smith/)).toBeInTheDocument();
		});

		it("should handle empty commit message", () => {
			const emptyMessage: CommitData = {
				...mockCommit,
				message: "",
			};

			render(<CommitInfo {...defaultProps} commit={emptyMessage} />);

			// Component should still render without crashing
			expect(screen.getByText(/John Doe/)).toBeInTheDocument();
		});
	});

	describe("date formatting", () => {
		it("should format old dates correctly", () => {
			const oldCommit: CommitData = {
				...mockCommit,
				date: new Date("2010-06-15T12:00:00Z"),
			};

			render(<CommitInfo {...defaultProps} commit={oldCommit} />);

			// Just check that 2010 appears in the output (safe timezone)
			expect(screen.getByText(/2010/)).toBeInTheDocument();
		});

		it("should format future dates correctly", () => {
			const futureCommit: CommitData = {
				...mockCommit,
				date: new Date("2030-06-15T12:00:00Z"),
			};

			render(<CommitInfo {...defaultProps} commit={futureCommit} />);

			// Just check that 2030 appears in the output (safe timezone)
			expect(screen.getByText(/2030/)).toBeInTheDocument();
		});
	});

	describe("styling", () => {
		it("should have font-semibold class on message", () => {
			const { container } = render(<CommitInfo {...defaultProps} />);

			const message = container.querySelector(".font-semibold");
			expect(message).toHaveTextContent("Add new feature");
		});

		it("should have text-gray-400 class on author/date", () => {
			const { container } = render(<CommitInfo {...defaultProps} />);

			const metadata = container.querySelector(".text-gray-400");
			expect(metadata).toHaveTextContent("John Doe");
		});

		it("should have blue color class on time display when playing", () => {
			const { container } = render(
				<CommitInfo {...defaultProps} isPlaying={true} />,
			);

			const timeDisplay = container.querySelector(".text-blue-400");
			expect(timeDisplay).toBeInTheDocument();
		});
	});
});
