# NPM Package Conversion Plan

## Goal
Convert repo-timeline from a standalone app to a reusable npm package that developers can embed in their React applications.

## Target API

```tsx
import { RepoTimeline } from 'repo-timeline';
import 'repo-timeline/dist/style.css';

function MyApp() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <RepoTimeline
        repoPath="facebook/react"
        workerUrl="https://your-worker.workers.dev" // Optional
      />
    </div>
  );
}
```

## Required Changes

### 1. Library Build Configuration (vite.config.ts)

**Current:** Builds as SPA application
**Target:** Build as library with proper exports

Changes needed:
- Add `build.lib` configuration
- Set entry point to library exports
- Externalize React, React-DOM, Three.js (peer dependencies)
- Generate both ESM and UMD builds
- Preserve CSS for separate import

### 2. Package Structure

```
repo-timeline/
├── src/
│   ├── lib/                      # Library exports (NEW)
│   │   └── index.ts              # Main export file
│   ├── components/               # Existing - export the good ones
│   ├── services/                 # Existing - keep internal
│   ├── utils/                    # Existing - keep internal
│   └── demo/                     # Demo app (NEW - moved from root)
│       ├── App.tsx
│       ├── main.tsx
│       └── RepoInput.tsx
├── dist/                         # Build output
│   ├── index.js                  # ESM build
│   ├── index.umd.js              # UMD build
│   ├── index.d.ts                # TypeScript definitions
│   └── style.css                 # Styles
└── demo-dist/                    # Demo app build (for GitHub Pages)
```

### 3. Clean Component API

**Main Export:** `RepoTimeline` component

**Props:**
```typescript
interface RepoTimelineProps {
  repoPath: string;              // Required: "owner/repo"
  workerUrl?: string;            // Optional: Cloudflare Worker URL
  onError?: (error: Error) => void;  // Optional: Error callback
  theme?: 'dark' | 'light';      // Optional: Theme (future)
  showControls?: boolean;        // Optional: Show timeline controls (default: true)
  autoPlay?: boolean;            // Optional: Start playing automatically
  playbackSpeed?: 1 | 60 | 300 | 1800;  // Optional: Initial speed
}
```

**Remove from component:**
- React Router dependency (make component self-contained)
- "Back" button (parent controls navigation)
- Hardcoded footer with build info

### 4. Package.json Updates

```json
{
  "name": "@rjwalters/repo-timeline",
  "version": "1.0.0",
  "description": "3D visualization of GitHub repository evolution over time",
  "private": false,
  "type": "module",
  "main": "./dist/index.umd.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.umd.js",
      "types": "./dist/index.d.ts"
    },
    "./dist/style.css": "./dist/style.css"
  },
  "files": [
    "dist"
  ],
  "keywords": [
    "react",
    "github",
    "visualization",
    "3d",
    "three.js",
    "timeline",
    "git"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/rjwalters/repo-timeline"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "three": "^0.160.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "build:demo": "vite build --config vite.demo.config.ts",
    "preview": "vite preview"
  }
}
```

### 5. Dual Build System

**Library Build:**
- Input: `src/lib/index.ts`
- Output: `dist/` (for npm)
- Config: `vite.config.ts`

**Demo App Build:**
- Input: `src/demo/main.tsx`
- Output: `demo-dist/` (for GitHub Pages)
- Config: `vite.demo.config.ts`

### 6. Config Management

**Current:** `src/config.ts` with hardcoded Worker URL
**Target:** Accept config via props

Create default config:
```typescript
// src/lib/defaultConfig.ts
export const DEFAULT_CONFIG = {
  workerUrl: undefined, // User must provide or falls back to GitHub API
  theme: 'dark',
  showControls: true,
  autoPlay: false,
  playbackSpeed: 60,
};
```

### 7. Remove Router Dependencies

**Current:** Uses React Router in App.tsx and RepoWrapper.tsx
**Target:** Self-contained component

Changes:
- RepoTimeline receives `repoPath` as prop
- No routing logic
- Parent app handles navigation
- Remove `onBack` callback (parent decides what to do)

### 8. Documentation

Create **EMBEDDING.md:**
- Installation instructions
- Basic usage example
- Props documentation
- Advanced examples (error handling, custom worker)
- Styling guide
- TypeScript usage

## Implementation Steps

1. ✅ Analysis (this document)
2. Create library entry point (`src/lib/index.ts`)
3. Configure Vite for library build
4. Update RepoTimeline to accept worker URL as prop
5. Move demo code to `src/demo/`
6. Create demo build config
7. Update package.json metadata
8. Test library build locally
9. Create EMBEDDING.md
10. Publish to npm

## Breaking Changes (for current demo users)

- Demo app will move to `demo-dist/` instead of `dist/`
- GitHub Pages deployment needs config update
- Component API simplified (no router props)

## Backward Compatibility

To maintain the current demo app:
- Keep demo in separate directory
- Dual build process
- GitHub Actions updated to build both library and demo

## Publishing Checklist

- [ ] Library builds successfully
- [ ] TypeScript types generated
- [ ] Demo app still works
- [ ] README updated with installation
- [ ] EMBEDDING.md created
- [ ] CHANGELOG.md created
- [ ] package.json metadata complete
- [ ] .npmignore configured
- [ ] Test local install: `npm pack && npm install repo-timeline-1.0.0.tgz`
- [ ] Publish to npm: `npm publish --access public`
