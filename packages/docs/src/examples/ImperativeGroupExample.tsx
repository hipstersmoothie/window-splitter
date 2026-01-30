import { useRef } from "react";
import {
  Panel,
  PanelGroup,
  PanelGroupHandle,
  PanelResizer,
} from "@window-splitter/react";
import { Button } from "@/Components/Button";

export function ImperativeGroupExample() {
  const panelGroupHandle = useRef<PanelGroupHandle>(null);

  return (
    <div className="flex flex-col gap-4">
      <PanelGroup
        orientation="horizontal"
        style={{ height: 200 }}
        handle={panelGroupHandle}
      >
        <Panel id="panel-1" color="green" min="50px" max="300px" />
        <PanelResizer id="resizer-1" />
        <Panel id="panel-2" color="red" min="50px" />
      </PanelGroup>
      <Button
        onPress={() => {
          panelGroupHandle.current?.setSizes(["100px", "20px", "80%"]);
        }}
      >
        Override sizes
      </Button>
    </div>
  );
}
