import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { RateLimitInfo } from "../types";
import { ErrorState } from "./ErrorState";

// Mock RateLimitDisplay since we're testing ErrorState in isolation
vi.mock("./RateLimitDisplay", () => ({
	RateLimitDisplay: ({
		remaining,
		limit,
	}: {
		remaining: number | null;
		limit: number | null;
	}) => (
		<div data-testid="rate-limit-display">
			{remaining}/{limit}
		</div>
	),
}));

describe("ErrorState", () => {
	const defaultProps = {
		error: "Failed to load repository",
		repoPath: "facebook/react",
		rateLimit: null,
		onRetry: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("basic rendering", () => {
		it("should render error message", () => {
			render(<ErrorState {...defaultProps} />);

			expect(screen.getByText("Error Loading Repository")).toBeInTheDocument();
			expect(screen.getByText("Failed to load repository")).toBeInTheDocument();
		});

		it("should render repo path", () => {
			render(<ErrorState {...defaultProps} />);

			expect(
				screen.getByText("Repository: facebook/react"),
			).toBeInTheDocument();
		});

		it("should render retry button", () => {
			render(<ErrorState {...defaultProps} />);

			expect(screen.getByText("Retry")).toBeInTheDocument();
		});

		it("should not render back button when onBack is not provided", () => {
			render(<ErrorState {...defaultProps} />);

			expect(screen.queryByText("Back")).not.toBeInTheDocument();
		});

		it("should render back button when onBack is provided", () => {
			const onBack = vi.fn();
			render(<ErrorState {...defaultProps} onBack={onBack} />);

			expect(screen.getByText("Back")).toBeInTheDocument();
		});
	});

	describe("rate limit error", () => {
		it("should detect rate limit error from message", () => {
			render(<ErrorState {...defaultProps} error="API rate limit exceeded" />);

			expect(
				screen.getByText("⚠️ GitHub API Rate Limit Exceeded"),
			).toBeInTheDocument();
		});

		it("should show rate limit error message for 'rate limit' keyword", () => {
			render(
				<ErrorState {...defaultProps} error="You have hit the rate limit" />,
			);

			expect(
				screen.getByText("⚠️ GitHub API Rate Limit Exceeded"),
			).toBeInTheDocument();
		});

		it("should show generic error for non-rate-limit errors", () => {
			render(<ErrorState {...defaultProps} error="Network error" />);

			expect(screen.getByText("Error Loading Repository")).toBeInTheDocument();
			expect(
				screen.queryByText("⚠️ GitHub API Rate Limit Exceeded"),
			).not.toBeInTheDocument();
		});
	});

	describe("rate limit display", () => {
		it("should not render RateLimitDisplay when rateLimit is null", () => {
			render(<ErrorState {...defaultProps} rateLimit={null} />);

			expect(
				screen.queryByTestId("rate-limit-display"),
			).not.toBeInTheDocument();
		});

		it("should render RateLimitDisplay when rateLimit is provided", () => {
			const rateLimit: RateLimitInfo = {
				remaining: 10,
				limit: 60,
				resetTime: new Date("2024-12-31T23:59:59Z"),
			};

			render(<ErrorState {...defaultProps} rateLimit={rateLimit} />);

			expect(screen.getByTestId("rate-limit-display")).toBeInTheDocument();
			expect(screen.getByText("10/60")).toBeInTheDocument();
		});
	});

	describe("button interactions", () => {
		it("should call onRetry when retry button is clicked", () => {
			const onRetry = vi.fn();
			render(<ErrorState {...defaultProps} onRetry={onRetry} />);

			fireEvent.click(screen.getByText("Retry"));

			expect(onRetry).toHaveBeenCalledOnce();
		});

		it("should call onBack when back button is clicked", () => {
			const onBack = vi.fn();
			render(<ErrorState {...defaultProps} onBack={onBack} />);

			fireEvent.click(screen.getByText("Back"));

			expect(onBack).toHaveBeenCalledOnce();
		});

		it("should call correct handler for each button", () => {
			const onBack = vi.fn();
			const onRetry = vi.fn();
			render(
				<ErrorState {...defaultProps} onBack={onBack} onRetry={onRetry} />,
			);

			fireEvent.click(screen.getByText("Back"));
			expect(onBack).toHaveBeenCalledOnce();
			expect(onRetry).not.toHaveBeenCalled();

			fireEvent.click(screen.getByText("Retry"));
			expect(onRetry).toHaveBeenCalledOnce();
			expect(onBack).toHaveBeenCalledOnce();
		});
	});

	describe("styling", () => {
		it("should have correct container classes", () => {
			const { container } = render(<ErrorState {...defaultProps} />);

			const mainDiv = container.firstChild;
			expect(mainDiv).toHaveClass("w-full", "h-full", "bg-slate-900");
		});
	});

	describe("error message variations", () => {
		it("should handle empty error message", () => {
			render(<ErrorState {...defaultProps} error="" />);

			expect(screen.getByText("Error Loading Repository")).toBeInTheDocument();
		});

		it("should handle long error messages", () => {
			const longError = "A".repeat(500);
			render(<ErrorState {...defaultProps} error={longError} />);

			expect(screen.getByText(longError)).toBeInTheDocument();
		});

		it("should handle multiline error messages", () => {
			const multilineError = "Line 1\nLine 2\nLine 3";
			render(<ErrorState {...defaultProps} error={multilineError} />);

			// Use a custom matcher that handles newlines
			expect(
				screen.getByText((content, element) => {
					return element?.textContent === multilineError;
				}),
			).toBeInTheDocument();
		});
	});
});
