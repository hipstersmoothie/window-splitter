import { useRef } from "react";
import {
  Panel,
  PanelGroup,
  PanelHandle,
  PanelResizer,
} from "@window-splitter/react";
import { Button } from "@/Components/Button";

export function ImperativeGroupExample() {
  const panelHandle = useRef<PanelHandle>(null);

  return (
    <div className="flex flex-col gap-4">
      <PanelGroup orientation="horizontal" style={{ height: 200 }}>
        <Panel
          id="panel-1"
          handle={panelHandle}
          color="green"
          min="200px"
          max="300px"
          collapsible
          collapsedSize="100px"
        />
        <PanelResizer id="resizer-1" />
        <Panel id="panel-2" color="red" min="50px" />
      </PanelGroup>
      <Button
        onPress={() => {
          panelHandle.current?.collapse();
        }}
      >
        Collapse
      </Button>
    </div>
  );
}
