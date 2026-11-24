# Contributing to OpenFigma

Thank you for your interest in contributing to **OpenFigma**! Whether you are fixing a bug, refining Figma UI3 visual parity, adding a canvas tool, or improving docs, contributions are welcome.

## Local Development

OpenFigma uses **pnpm** (please use `pnpm` rather than `npm` to keep `pnpm-lock.yaml` consistent).

```bash
pnpm install
pnpm dev
```

## Running Verification

Before opening a pull request, please verify TypeScript, the Vitest suite, and the production Vite build all pass:

```bash
pnpm exec tsc -b
pnpm test
pnpm build
```

## Guidelines

1. **Reuse Figma UI3 Core Components**: Prefer primitives from `src/components/ui/` (`NumberField`, `TextField`, `SelectField`, `SegmentedField`, `ColorField`, `FillField`, `IconButton`, `InspectorSection`, `FigmaIcons`) and CSS tokens from `src/index.css` (`var(--color-*)`, `var(--fpl-*)`) instead of ad-hoc hex colors or custom heights.
2. **Accessible & Agent-Ready Controls**: Wrap interactive controls with `@ui-sdk/react/*` primitives and provide clear accessible labels (`aria-label` / `label`) so keyboard users, screen readers, and `createAgent().snapshot()` work seamlessly.
3. **Keep PRs Focused**: Include tests in `src/App.test.tsx` for new canvas or inspector interactions and attach a screenshot/GIF for UI changes.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
