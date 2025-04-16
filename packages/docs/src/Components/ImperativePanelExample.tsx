"use client";

import { Button } from "@/Components/Button";
import {
  ColorfulPanel,
  ColorfulPanelGroup,
  ColorfulPanelResizer,
} from "@/Components/ColorfulPanels";
import { useRef } from "react";
import { PanelHandle } from "react-window-splitter";

export function ImperativePanelExample() {
  const panelHandle = useRef<PanelHandle>(null);

  return (
    <div className="flex flex-col gap-4">
      <ColorfulPanelGroup orientation="horizontal" style={{ height: 200 }}>
        <ColorfulPanel
          handle={panelHandle}
          color="green"
          min="200px"
          max="300px"
          collapsible
          collapsedSize="100px"
        />
        <ColorfulPanelResizer />
        <ColorfulPanel color="red" min="50px" />
      </ColorfulPanelGroup>
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
