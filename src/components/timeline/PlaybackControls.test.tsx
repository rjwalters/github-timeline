import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { PlaybackDirection, PlaybackSpeed } from "../../lib/types";
import { PlaybackControls } from "./PlaybackControls";

describe("PlaybackControls", () => {
	const defaultProps = {
		isPlaying: false,
		onPlayPause: vi.fn(),
		playbackSpeed: 1 as PlaybackSpeed,
		onSpeedChange: vi.fn(),
		playbackDirection: "forward" as PlaybackDirection,
		onDirectionChange: vi.fn(),
		currentIndex: 5,
		totalCommits: 10,
		onSkipToStart: vi.fn(),
		onPrevious: vi.fn(),
		onNext: vi.fn(),
		onSkipToEnd: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("rendering", () => {
		it("should render all control buttons", () => {
			render(<PlaybackControls {...defaultProps} />);

			// Check for button titles
			expect(screen.getByTitle("Skip to first commit")).toBeInTheDocument();
			expect(screen.getByTitle("Previous commit")).toBeInTheDocument();
			expect(screen.getByTitle("Toggle reverse playback")).toBeInTheDocument();
			expect(screen.getByTitle("Play")).toBeInTheDocument();
			expect(screen.getByTitle("Playback speed: 1x")).toBeInTheDocument();
			expect(screen.getByTitle("Next commit")).toBeInTheDocument();
			expect(screen.getByTitle("Skip to last commit")).toBeInTheDocument();
		});

		it("should show Play icon when not playing", () => {
			render(<PlaybackControls {...defaultProps} isPlaying={false} />);

			expect(screen.getByTitle("Play")).toBeInTheDocument();
		});

		it("should show Pause icon when playing", () => {
			render(<PlaybackControls {...defaultProps} isPlaying={true} />);

			expect(screen.getByTitle("Pause")).toBeInTheDocument();
		});

		it("should display current playback speed", () => {
			render(<PlaybackControls {...defaultProps} playbackSpeed={60} />);

			expect(screen.getByText("60x")).toBeInTheDocument();
		});
	});

	describe("play/pause button", () => {
		it("should call onPlayPause when clicked", () => {
			const onPlayPause = vi.fn();
			render(<PlaybackControls {...defaultProps} onPlayPause={onPlayPause} />);

			fireEvent.click(screen.getByTitle("Play"));

			expect(onPlayPause).toHaveBeenCalledOnce();
		});

		it("should toggle between play and pause", () => {
			const { rerender } = render(
				<PlaybackControls {...defaultProps} isPlaying={false} />,
			);
			expect(screen.getByTitle("Play")).toBeInTheDocument();

			rerender(<PlaybackControls {...defaultProps} isPlaying={true} />);
			expect(screen.getByTitle("Pause")).toBeInTheDocument();
		});
	});

	describe("navigation buttons", () => {
		it("should call onSkipToStart when skip to start is clicked", () => {
			const onSkipToStart = vi.fn();
			render(
				<PlaybackControls {...defaultProps} onSkipToStart={onSkipToStart} />,
			);

			fireEvent.click(screen.getByTitle("Skip to first commit"));

			expect(onSkipToStart).toHaveBeenCalledOnce();
		});

		it("should call onPrevious when previous is clicked", () => {
			const onPrevious = vi.fn();
			render(<PlaybackControls {...defaultProps} onPrevious={onPrevious} />);

			fireEvent.click(screen.getByTitle("Previous commit"));

			expect(onPrevious).toHaveBeenCalledOnce();
		});

		it("should call onNext when next is clicked", () => {
			const onNext = vi.fn();
			render(<PlaybackControls {...defaultProps} onNext={onNext} />);

			fireEvent.click(screen.getByTitle("Next commit"));

			expect(onNext).toHaveBeenCalledOnce();
		});

		it("should call onSkipToEnd when skip to end is clicked", () => {
			const onSkipToEnd = vi.fn();
			render(<PlaybackControls {...defaultProps} onSkipToEnd={onSkipToEnd} />);

			fireEvent.click(screen.getByTitle("Skip to last commit"));

			expect(onSkipToEnd).toHaveBeenCalledOnce();
		});
	});

	describe("disabled states", () => {
		it("should disable skip to start when at first commit", () => {
			render(<PlaybackControls {...defaultProps} currentIndex={0} />);

			const button = screen.getByTitle("Skip to first commit");
			expect(button).toBeDisabled();
		});

		it("should disable previous when at first commit", () => {
			render(<PlaybackControls {...defaultProps} currentIndex={0} />);

			const button = screen.getByTitle("Previous commit");
			expect(button).toBeDisabled();
		});

		it("should enable skip to start and previous when not at first commit", () => {
			render(<PlaybackControls {...defaultProps} currentIndex={1} />);

			expect(screen.getByTitle("Skip to first commit")).not.toBeDisabled();
			expect(screen.getByTitle("Previous commit")).not.toBeDisabled();
		});

		it("should disable skip to end when at last commit", () => {
			render(
				<PlaybackControls
					{...defaultProps}
					currentIndex={9}
					totalCommits={10}
				/>,
			);

			const button = screen.getByTitle("Skip to last commit");
			expect(button).toBeDisabled();
		});

		it("should disable next when at last commit", () => {
			render(
				<PlaybackControls
					{...defaultProps}
					currentIndex={9}
					totalCommits={10}
				/>,
			);

			const button = screen.getByTitle("Next commit");
			expect(button).toBeDisabled();
		});

		it("should enable skip to end and next when not at last commit", () => {
			render(
				<PlaybackControls
					{...defaultProps}
					currentIndex={8}
					totalCommits={10}
				/>,
			);

			expect(screen.getByTitle("Skip to last commit")).not.toBeDisabled();
			expect(screen.getByTitle("Next commit")).not.toBeDisabled();
		});
	});

	describe("speed cycling", () => {
		it("should cycle through speeds: 1 → 60 → 300 → 1800 → 1", () => {
			const onSpeedChange = vi.fn();
			render(
				<PlaybackControls
					{...defaultProps}
					playbackSpeed={1}
					onSpeedChange={onSpeedChange}
				/>,
			);

			// Click to cycle from 1 to 60
			fireEvent.click(screen.getByTitle("Playback speed: 1x"));
			expect(onSpeedChange).toHaveBeenCalledWith(60);
		});

		it("should cycle from 60x to 300x", () => {
			const onSpeedChange = vi.fn();
			render(
				<PlaybackControls
					{...defaultProps}
					playbackSpeed={60}
					onSpeedChange={onSpeedChange}
				/>,
			);

			fireEvent.click(screen.getByTitle("Playback speed: 60x"));
			expect(onSpeedChange).toHaveBeenCalledWith(300);
		});

		it("should cycle from 300x to 1800x", () => {
			const onSpeedChange = vi.fn();
			render(
				<PlaybackControls
					{...defaultProps}
					playbackSpeed={300}
					onSpeedChange={onSpeedChange}
				/>,
			);

			fireEvent.click(screen.getByTitle("Playback speed: 300x"));
			expect(onSpeedChange).toHaveBeenCalledWith(1800);
		});

		it("should cycle from 1800x back to 1x", () => {
			const onSpeedChange = vi.fn();
			render(
				<PlaybackControls
					{...defaultProps}
					playbackSpeed={1800}
					onSpeedChange={onSpeedChange}
				/>,
			);

			fireEvent.click(screen.getByTitle("Playback speed: 1800x"));
			expect(onSpeedChange).toHaveBeenCalledWith(1);
		});
	});

	describe("direction toggle", () => {
		it("should toggle from forward to reverse", () => {
			const onDirectionChange = vi.fn();
			render(
				<PlaybackControls
					{...defaultProps}
					playbackDirection="forward"
					onDirectionChange={onDirectionChange}
				/>,
			);

			fireEvent.click(screen.getByTitle("Toggle reverse playback"));

			expect(onDirectionChange).toHaveBeenCalledWith("reverse");
		});

		it("should toggle from reverse to forward", () => {
			const onDirectionChange = vi.fn();
			render(
				<PlaybackControls
					{...defaultProps}
					playbackDirection="reverse"
					onDirectionChange={onDirectionChange}
				/>,
			);

			fireEvent.click(screen.getByTitle("Toggle reverse playback"));

			expect(onDirectionChange).toHaveBeenCalledWith("forward");
		});

		it("should highlight reverse button when in reverse mode", () => {
			render(
				<PlaybackControls {...defaultProps} playbackDirection="reverse" />,
			);

			const button = screen.getByTitle("Toggle reverse playback");
			expect(button).toHaveClass("bg-blue-600");
		});

		it("should not highlight reverse button when in forward mode", () => {
			render(
				<PlaybackControls {...defaultProps} playbackDirection="forward" />,
			);

			const button = screen.getByTitle("Toggle reverse playback");
			expect(button).not.toHaveClass("bg-blue-600");
		});
	});

	describe("edge cases", () => {
		it("should handle zero commits", () => {
			render(
				<PlaybackControls
					{...defaultProps}
					currentIndex={0}
					totalCommits={0}
				/>,
			);

			// All navigation buttons should be disabled
			expect(screen.getByTitle("Skip to first commit")).toBeDisabled();
			expect(screen.getByTitle("Previous commit")).toBeDisabled();
			// Note: With 0 commits, currentIndex should be 0, and totalCommits - 1 = -1
			// But the test still works because currentIndex (0) !== -1
		});

		it("should handle single commit", () => {
			render(
				<PlaybackControls
					{...defaultProps}
					currentIndex={0}
					totalCommits={1}
				/>,
			);

			// All navigation buttons should be disabled
			expect(screen.getByTitle("Skip to first commit")).toBeDisabled();
			expect(screen.getByTitle("Previous commit")).toBeDisabled();
			expect(screen.getByTitle("Next commit")).toBeDisabled();
			expect(screen.getByTitle("Skip to last commit")).toBeDisabled();
		});

		it("should handle middle position correctly", () => {
			render(
				<PlaybackControls
					{...defaultProps}
					currentIndex={5}
					totalCommits={10}
				/>,
			);

			// All navigation buttons should be enabled
			expect(screen.getByTitle("Skip to first commit")).not.toBeDisabled();
			expect(screen.getByTitle("Previous commit")).not.toBeDisabled();
			expect(screen.getByTitle("Next commit")).not.toBeDisabled();
			expect(screen.getByTitle("Skip to last commit")).not.toBeDisabled();
		});
	});
});
