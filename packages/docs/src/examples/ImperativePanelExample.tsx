import { useRef } from "react";
import {
  Panel,
  PanelGroup,
  PanelHandle,
  PanelResizer,
} from "react-window-splitter";
import { Button } from "@/Components/Button";

export function ImperativeGroupExample() {
  const panelHandle = useRef<PanelHandle>(null);

  return (
    <div className="flex flex-col gap-4">
      <PanelGroup orientation="horizontal" style={{ height: 200 }}>
        <Panel
          handle={panelHandle}
          color="green"
          min="200px"
          max="300px"
          collapsible
          collapsedSize="100px"
        />
        <PanelResizer />
        <Panel color="red" min="50px" />
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
