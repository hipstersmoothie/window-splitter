import { html } from "lit";
import { Panel, WindowSplitter, PanelResizer } from ".";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
export default {
  title: "WindowSplitter/WebComponent",
};

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Simple = {
  render: () => html`
    <window-splitter class="panel-group">
      <window-panel class="panel">Panel 1</window-panel>
      <window-panel-resizer
        size="10px"
        class="panel-resizer"
      ></window-panel-resizer>
      <window-panel min="100px" class="panel">Panel 2</window-panel>
    </window-splitter>
  `,
};

export const Autosave = {
  render: () => html`
    <window-splitter
      autosaveId="autosave-example-web-component"
      class="panel-group"
    >
      <window-panel class="panel" id="1">Panel 1</window-panel>
      <window-panel-resizer
        size="10px"
        class="panel-resizer"
      ></window-panel-resizer>
      <window-panel class="panel" id="2">Panel 2</window-panel>
    </window-splitter>
  `,
};

export const AutosaveCookie = {
  render: () => html`
    <window-splitter
      autosaveId="autosave-example-web-component"
      autosaveStrategy="cookie"
      class="panel-group"
      style="height: 200px"
    >
      <window-panel class="panel" id="1">Panel 1</window-panel>
      <window-panel-resizer
        size="10px"
        class="panel-resizer"
      ></window-panel-resizer>
      <window-panel class="panel" id="2">Panel 2</window-panel>
    </window-splitter>
  `,
};

export const AutosaveCollapsible = {
  render: () => html`
    <window-splitter
      autosaveId="autosave-example-web-component-2"
      class="panel-group"
    >
      <window-panel
        class="panel"
        id="1"
        collapsible
        collapsedSize="100px"
        min="140px"
        onCollapseChange=${(e) => console.log(e)}
      >
        Panel 1
      </window-panel>
      <window-panel-resizer
        size="10px"
        class="panel-resizer"
      ></window-panel-resizer>
      <window-panel class="panel" id="2">Panel 2</window-panel>
    </window-splitter>
  `,
};
