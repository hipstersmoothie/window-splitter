"use client";

import { Button } from "@/Components/Button";
import {
  ColorfulPanel,
  ColorfulPanelGroup,
  ColorfulPanelResizer,
} from "@/Components/ColorfulPanels";
import { useRef } from "react";
import { PanelGroupHandle } from "@window-splitter/react";

export function ImperativeGroupExample() {
  const panelGroupHandle = useRef<PanelGroupHandle>(null);

  return (
    <div className="flex flex-col gap-4">
      <ColorfulPanelGroup
        orientation="horizontal"
        style={{ height: 200 }}
        handle={panelGroupHandle}
      >
        <ColorfulPanel id="panel-1" color="green" min="50px" max="300px" />
        <ColorfulPanelResizer id="resizer-1" />
        <ColorfulPanel id="panel-2" color="red" min="50px" />
      </ColorfulPanelGroup>
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
