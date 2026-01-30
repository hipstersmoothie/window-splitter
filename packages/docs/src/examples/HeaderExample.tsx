import { PanelGroup, Panel, PanelResizer } from "@window-splitter/react";

export function Example() {
  return (
    <PanelGroup>
      <Panel id="panel-1" min="130px" max="400px" />
      <PanelResizer id="resizer-1" />
      <Panel id="panel-2" min="130px" />
    </PanelGroup>
  );
}
