# Package Conversion Checklist

Converting repo-timeline from standalone app to reusable npm package.

## Phase 1: Library Structure Setup

- [ ] Create `src/lib/` directory for library exports
- [ ] Create `src/lib/index.ts` with main exports
- [ ] Create `src/lib/types.ts` with public type definitions
- [ ] Move demo-specific code to `src/demo/`
  - [ ] Move `App.tsx` to `src/demo/App.tsx`
  - [ ] Move `main.tsx` to `src/demo/main.tsx`
  - [ ] Move `RepoInput.tsx` to `src/demo/RepoInput.tsx`
  - [ ] Move `RepoWrapper.tsx` to `src/demo/RepoWrapper.tsx`

## Phase 2: Component API Cleanup

- [ ] Update `RepoTimeline` component to accept `workerUrl` prop
- [ ] Remove `onBack` prop dependency (make optional)
- [ ] Remove hardcoded `WORKER_URL` from component
- [ ] Make component work without React Router
- [ ] Add optional props: `onError`, `showControls`, `autoPlay`, `playbackSpeed`
- [ ] Update `config.ts` to export defaults instead of constants

## Phase 3: Build Configuration

- [ ] Create `vite.config.ts` for library build
  - [ ] Configure `build.lib` mode
  - [ ] Set entry point to `src/lib/index.ts`
  - [ ] Externalize React, React-DOM, Three.js
  - [ ] Configure CSS extraction
  - [ ] Generate TypeScript declarations
- [ ] Create `vite.demo.config.ts` for demo app build
  - [ ] Set entry point to `src/demo/main.tsx`
  - [ ] Output to `demo-dist/`
  - [ ] Keep current SPA configuration
- [ ] Test library build: `pnpm build`
- [ ] Test demo build: `pnpm build:demo`

## Phase 4: Package.json Updates

- [ ] Update `name` to `@rjwalters/repo-timeline` (or your preferred scope)
- [ ] Set `private: false`
- [ ] Set `version` to `1.0.0`
- [ ] Add `description`
- [ ] Add `keywords`
- [ ] Add `repository` field
- [ ] Add `main`, `module`, `types` fields
- [ ] Add `exports` field for ESM/CJS
- [ ] Add `files` field (include only `dist/`)
- [ ] Move React/React-DOM/Three to `peerDependencies`
- [ ] Add build scripts:
  - [ ] `build` - library build
  - [ ] `build:demo` - demo app build
  - [ ] `prepublishOnly` - run build before publish

## Phase 5: Documentation

- [ ] Create `EMBEDDING.md` with usage instructions
  - [ ] Installation section
  - [ ] Basic usage example
  - [ ] Props documentation
  - [ ] TypeScript example
  - [ ] Advanced examples (error handling, custom worker)
  - [ ] Styling guide
- [ ] Update `README.md` to mention npm package usage
- [ ] Create `CHANGELOG.md`
- [ ] Create `.npmignore` file

## Phase 6: GitHub Actions Update

- [ ] Update `.github/workflows/deploy.yml` to build demo app
- [ ] Change build output directory to `demo-dist/`
- [ ] Ensure demo still deploys to GitHub Pages

## Phase 7: Testing

- [ ] Build library: `pnpm build`
- [ ] Verify output in `dist/`:
  - [ ] `index.js` (ESM)
  - [ ] `index.umd.js` (UMD)
  - [ ] `index.d.ts` (TypeScript types)
  - [ ] `style.css`
- [ ] Test local installation:
  - [ ] Run `npm pack`
  - [ ] Install in test project: `npm install ../repo-timeline-1.0.0.tgz`
  - [ ] Import and use component
  - [ ] Verify TypeScript types work
- [ ] Build demo: `pnpm build:demo`
- [ ] Test demo locally: `pnpm preview`
- [ ] Verify demo works at `/repo-timeline/`

## Phase 8: Publishing

- [ ] Review `package.json` one final time
- [ ] Ensure all files are committed
- [ ] Create git tag: `git tag v1.0.0`
- [ ] Test publish (dry run): `npm publish --dry-run`
- [ ] Publish to npm: `npm publish --access public`
- [ ] Verify package on npmjs.com
- [ ] Push tag to GitHub: `git push --tags`

## Phase 9: Post-Publishing

- [ ] Update README.md with npm badge
- [ ] Create GitHub release for v1.0.0
- [ ] Test installation from npm: `npm install @rjwalters/repo-timeline`
- [ ] Share announcement (optional)

## Rollback Plan (if needed)

If something goes wrong:
- [ ] Unpublish version (within 72 hours): `npm unpublish @rjwalters/repo-timeline@1.0.0`
- [ ] Or deprecate: `npm deprecate @rjwalters/repo-timeline@1.0.0 "Deprecated due to issue"`
- [ ] Fix issues
- [ ] Publish new patch version

## Notes

- The demo app remains fully functional at https://rjwalters.github.io/repo-timeline/
- Library users can embed the component in their own React apps
- Both builds share the same source code (components, services, utils)
- Worker deployment remains optional for both demo and library users
