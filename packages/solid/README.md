# `@window-splitter/solid`

A full featured window splitter for SolidJS.

- Support for the full [window splitter](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/) ARIA spec
- Support for percentage and pixel based constraints
- Collapsible panels
- Controlled panels
- Layout Persistance - LocalStorage and Cookie

[Read the full docs](https://react-window-splitter-six.vercel.app)

> NOTE: Docs are currently on react but it's the same API. Refer the the stories for usage examples.

## Install

```bash
npm install @window-splitter/solid
yarn add @window-splitter/solid
pnpm add @window-splitter/solid
```

## Usage

```tsx
import { PanelGroup, Panel, PanelResizer } from "@window-splitter/solid";

function Example() {
  return (
    <PanelGroup>
      <Panel min="130px" max="400px" />
      <PanelResizer />
      <Panel min="130px" />
    </PanelGroup>
  );
}
```

## Prior Art

This library is heavily inspired by the following libraries:

- [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels)
