# v1.1.0 (Mon May 26 2025)

#### 🚀 Enhancement

- Add "shiftAmount" prop [#64](https://github.com/hipstersmoothie/window-splitter/pull/64) ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### 🐛 Bug Fix

- Add "shiftAmount" prop ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.8.7 (Sun May 11 2025)

#### 🐛 Bug Fix

- Web Component [#59](https://github.com/hipstersmoothie/window-splitter/pull/59) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- tests ([@hipstersmoothie](https://github.com/hipstersmoothie))
- start ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.8.5 (Sun May 04 2025)

#### 🐛 Bug Fix

- Vue Adapter [#56](https://github.com/hipstersmoothie/window-splitter/pull/56) ([@hipstersmoothie](https://github.com/hipstersmoothie))
- catalogs ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

# v0.8.3 (Tue Apr 29 2025)

#### ⚠️ Pushed to `main`

- fix repo links ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))

---

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

- lint ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix attr merging ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix unmount ([@hipstersmoothie](https://github.com/hipstersmoothie))
- ugh ([@hipstersmoothie](https://github.com/hipstersmoothie))
- update names ([@hipstersmoothie](https://github.com/hipstersmoothie))
- build ([@hipstersmoothie](https://github.com/hipstersmoothie))
- use shared move ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix lint ([@hipstersmoothie](https://github.com/hipstersmoothie))
- fix build ([@hipstersmoothie](https://github.com/hipstersmoothie))
- move move ([@hipstersmoothie](https://github.com/hipstersmoothie))
- move shared stuff ([@hipstersmoothie](https://github.com/hipstersmoothie))
- move shared types out ([@hipstersmoothie](https://github.com/hipstersmoothie))

#### Authors: 1

- Andrew Lisowski ([@hipstersmoothie](https://github.com/hipstersmoothie))
