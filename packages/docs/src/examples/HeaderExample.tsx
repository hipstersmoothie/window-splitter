import { PanelGroup, Panel, PanelResizer } from "@window-splitter/react";

export function Example() {
  return (
    <PanelGroup>
      <Panel min="130px" max="400px" />
      <PanelResizer />
      <Panel min="130px" />
    </PanelGroup>
  );
}
