# v0.7.0 (Mon Apr 28 2025)

### Release Notes

#### `@window-splitter/solid` ([#54](https://github.com/hipstersmoothie/window-splitter/pull/54))

The second framework adapter for `window-splitter` is live!

Things of note:

- `react-window-splitter` is deprecated in favor of `@window-splitter/react`
- `@window-splitter/solid` is feature complete and passes the test full test suite
- `@window-splitter/interface` was created to house the shared component types and some help functions

In creating the solid adapter we had to make vanilla JS versions of some functions we previously got from a dependency. This resulted in a 7.4% bundle size reduction for the react package 🎉 

### Breaking Change

The API for registering panel handles changed a little bit. If you're using the `@window-splitter/state` package directly you will have to update your code (if you exist send me a message!)

---

#### 🚀 Enhancement

- `@window-splitter/solid` [#54](https://github.com/hipstersmoothie/window-splitter/pull/54) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### 🐛 Bug Fix

- fix ci tests ([@hipstersmoothie](https://github.com/hipstersmoothie))
- dynamic constraints ([@hipstersmoothie](https://github.com/hipstersmoothie))
- lint ([@hipstersmoothie](https://github.com/hipstersmoothie))
- first pass ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix props spread ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix attr merging ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix style ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix conditional test ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fixing tests ([@hipstersmoothie](https://github.com/hipstersmoothie))
- make id automatic by rendering once ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix unmount ([@hipstersmoothie](https://github.com/hipstersmoothie))
- more ([@hipstersmoothie](https://github.com/hipstersmoothie))
- ugh ([@hipstersmoothie](https://github.com/hipstersmoothie))
- update names ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix double conditional render layout ([@hipstersmoothie](https://github.com/hipstersmoothie))
- move ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix lint ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix build ([@hipstersmoothie](https://github.com/hipstersmoothie))
- FIX BUILD ([@hipstersmoothie](https://github.com/hipstersmoothie))
- move move ([@hipstersmoothie](https://github.com/hipstersmoothie))
- move shared stuff ([@hipstersmoothie](https://github.com/hipstersmoothie))
- move shared types out ([@hipstersmoothie](https://github.com/hipstersmoothie))
- conditional panels ([@hipstersmoothie](https://github.com/hipstersmoothie))
- imperative handles ([@hipstersmoothie](https://github.com/hipstersmoothie))
- controlled collapse ([@hipstersmoothie](https://github.com/hipstersmoothie))
- more stories ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix nested ([@hipstersmoothie](https://github.com/hipstersmoothie))
- ai ([@hipstersmoothie](https://github.com/hipstersmoothie))
- cleanup ([@hipstersmoothie](https://github.com/hipstersmoothie))
- starting to wrk ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### ⚠️ Pushed to `main`

- add missing publish configs ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
