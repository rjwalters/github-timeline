#!/bin/bash
# Script to clear D1 cache for specific repositories
# Usage: ./scripts/clear-cache.sh [owner/repo]
# Example: ./scripts/clear-cache.sh elide-dev/elide

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if repo argument is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Repository argument required${NC}"
    echo "Usage: $0 owner/repo"
    echo "Example: $0 elide-dev/elide"
    echo ""
    echo "To clear all caches, use: $0 --all"
    exit 1
fi

REPO="$1"

# Function to clear cache for a specific repo
clear_repo_cache() {
    local repo_name="$1"
    echo -e "${YELLOW}Clearing cache for: ${repo_name}${NC}"

    # Delete commits first (due to foreign key constraints)
    npx wrangler@3 d1 execute repo_timeline --remote --command \
        "DELETE FROM commits WHERE repo_id IN (SELECT id FROM repos WHERE full_name = '${repo_name}');"

    # Delete the repo record
    npx wrangler@3 d1 execute repo_timeline --remote --command \
        "DELETE FROM repos WHERE full_name = '${repo_name}';"

    echo -e "${GREEN}✓ Cache cleared for ${repo_name}${NC}"
}

# Function to list all cached repos
list_cached_repos() {
    echo -e "${YELLOW}Cached repositories:${NC}"
    npx wrangler@3 d1 execute repo_timeline --remote --command \
        "SELECT full_name, datetime(last_updated, 'unixepoch') as last_updated FROM repos ORDER BY last_updated DESC;" \
        | grep -v "wrangler" | grep -v "Executing"
}

# Function to clear all caches
clear_all_caches() {
    echo -e "${RED}⚠️  WARNING: This will clear ALL cached repositories!${NC}"
    read -p "Are you sure? (yes/no): " confirm

    if [ "$confirm" != "yes" ]; then
        echo "Cancelled."
        exit 0
    fi

    echo -e "${YELLOW}Clearing all caches...${NC}"

    # Delete all commits
    npx wrangler@3 d1 execute repo_timeline --remote --command \
        "DELETE FROM commits;"

    # Delete all repos
    npx wrangler@3 d1 execute repo_timeline --remote --command \
        "DELETE FROM repos;"

    echo -e "${GREEN}✓ All caches cleared${NC}"
}

# Main logic
case "$REPO" in
    --list)
        list_cached_repos
        ;;
    --all)
        clear_all_caches
        ;;
    *)
        clear_repo_cache "$REPO"
        echo ""
        echo "To verify, fetch the repo again:"
        echo "curl https://repo-timeline-api.personal-account-251.workers.dev/api/repo/${REPO}?limit=3"
        ;;
esac
