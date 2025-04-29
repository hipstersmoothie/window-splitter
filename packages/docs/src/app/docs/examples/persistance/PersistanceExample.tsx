import { PanelGroup, Panel, PanelResizer } from "@window-splitter/react";

export function PersistanceExample() {
  return (
    <PanelGroup autosaveId="autosave" style={{ height: 200 }}>
      <Panel id="panel-1" min="130px" max="400px" />
      <PanelResizer id="resizer-1" />
      <Panel id="panel-2" min="130px" />
    </PanelGroup>
  );
}
