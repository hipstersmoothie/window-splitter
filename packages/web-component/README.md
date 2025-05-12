# @window-splitter/web-component

A full featured window splitter as a web component.

- Support for the full [window splitter](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/) ARIA spec
- Support for percentage and pixel based constraints
- Collapsible panels
- Controlled panels
- Layout Persistance - LocalStorage and Cookie

[Read the full docs](https://react-window-splitter-six.vercel.app)

> NOTE: Docs are currently on react but it's the same API. Refer the the stories for usage examples.

## Installation

```bash
npm install @window-splitter/web-component
```

## Usage

First register the elements.

```js
import {
  Panel,
  PanelGroup,
  PanelResizer,
} from "@window-splitter/web-component";

customElements.define("window-panel-group", PanelGroup);
customElements.define("window-panel", Panel);
customElements.define("window-panel-resizer", PanelResizer);
```

Then you can use them.

```html
<window-panel-group>
  <window-panel min="130px" max="400px"></window-panel>
  <window-panel-resizer></window-panel-resizer>
  <window-panel min="130px"></<window-panel>
</window-panel-group>
```

## Features

- WAI-ARIA compliant
- Keyboard accessible
- Touch friendly
- Customizable
- TypeScript support

## Prior Art

This library is heavily inspired by the following libraries:

- [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels)
