import { cookies } from "next/headers";
import { PanelGroup, Panel, PanelResizer } from "@window-splitter/react";

export function PersistanceExamplePage() {
  const persistedState = cookies().get("autosave");
  const snapshot = persistedState
    ? JSON.parse(persistedState.value)
    : undefined;

  return (
    <PanelGroup
      autosaveId="autosave"
      autosaveStrategy="cookie"
      snapshot={snapshot}
      style={{ height: 200 }}
    >
      <Panel id="panel-1" min="130px" max="400px" />
      <PanelResizer id="resizer-1" />
      <Panel id="panel-2" min="130px" />
    </PanelGroup>
  );
}
