import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
	describe("basic rendering", () => {
		it("should render no commits message", () => {
			render(<EmptyState repoPath="facebook/react" />);

			expect(screen.getByText("No commits found")).toBeInTheDocument();
		});

		it("should render repo path in message", () => {
			render(<EmptyState repoPath="facebook/react" />);

			expect(screen.getByText(/facebook\/react/)).toBeInTheDocument();
		});

		it("should show full error description", () => {
			render(<EmptyState repoPath="microsoft/vscode" />);

			expect(
				screen.getByText(
					"Unable to load repository data for: microsoft/vscode",
				),
			).toBeInTheDocument();
		});
	});

	describe("styling", () => {
		it("should have correct container classes", () => {
			const { container } = render(<EmptyState repoPath="test/repo" />);

			const mainDiv = container.firstChild;
			expect(mainDiv).toHaveClass("w-full", "h-full", "bg-slate-900");
		});
	});

	describe("repo path variations", () => {
		it("should handle simple repo paths", () => {
			render(<EmptyState repoPath="user/repo" />);

			expect(screen.getByText(/user\/repo/)).toBeInTheDocument();
		});

		it("should handle org/sub/repo paths", () => {
			render(<EmptyState repoPath="org/sub/repo" />);

			expect(screen.getByText(/org\/sub\/repo/)).toBeInTheDocument();
		});

		it("should handle empty repo path", () => {
			render(<EmptyState repoPath="" />);

			expect(screen.getByText("No commits found")).toBeInTheDocument();
		});

		it("should handle special characters in repo path", () => {
			render(<EmptyState repoPath="user-name/repo_name.test" />);

			expect(
				screen.getByText(/user-name\/repo_name\.test/),
			).toBeInTheDocument();
		});
	});
});
