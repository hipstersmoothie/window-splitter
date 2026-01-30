# `@window-splitter/react`

A full featured window splitter for React.

- Support for the full [window splitter](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/) ARIA spec
- Support for percentage and pixel based constraints
- Collapsible panels
- Controlled panels
- Layout Persistance - LocalStorage and Cookie

[Read the full docs](https://react-window-splitter-six.vercel.app)

## Install

```bash
npm install @window-splitter/react
yarn add @window-splitter/react
pnpm add @window-splitter/react
```

## Usage

```tsx
import { PanelGroup, Panel, PanelResizer } from "@window-splitter/react";

function Example() {
  return (
    <PanelGroup>
      <Panel id="panel-1" min="130px" max="400px" />
      <PanelResizer id="resizer-1" />
      <Panel id="panel-2" min="130px" />
    </PanelGroup>
  );
}
```

## ID Requirement

The `id` prop is **required** for both `Panel` and `PanelResizer` components.
This is so that the component can tell all of the components apart during layout and rendering, especially for:

- Conditional Panels
- Server Side Rendering
- React Strict Mode
- Layout persistence

## Prior Art

This library is heavily inspired by the following libraries:

- [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels)
