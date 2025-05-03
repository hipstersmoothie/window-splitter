<script module>
  import PanelGroup from "../lib/PanelGroup.svelte";
  import Panel from "../lib/Panel.svelte";
  import PanelResizer from "../lib/PanelResizer.svelte";

  /** @type {import("@window-splitter/interface").PanelGroupHandle} */
  let panelGroup;
  /** @type {import("@window-splitter/interface").PanelHandle} */
  let leftHandleRef;
  /** @type {import("@window-splitter/interface").PanelHandle} */
  let rightHandleRef;

  /** @type {import("@window-splitter/interface").PanelGroupHandle} */
  export const handle = {
    getId: () => "panel-group",
    getTemplate: () => panelGroup.getTemplate(),
    getState: () => panelGroup.getState(),
    getPixelSizes: () => panelGroup.getPixelSizes(),
    getPercentageSizes: () => panelGroup.getPercentageSizes(),
    setSizes: (sizes) => panelGroup.setSizes(sizes),
  };

  /** @type {import("@window-splitter/interface").PanelHandle} */
  export const leftHandle = {
    collapse: () => leftHandleRef.collapse(),
    isCollapsed: () => leftHandleRef.isCollapsed(),
    expand: () => leftHandleRef.expand(),
    isExpanded: () => leftHandleRef.isExpanded(),
    getId: () => leftHandleRef.getId(),
    getPixelSize: () => leftHandleRef.getPixelSize(),
    getPercentageSize: () => leftHandleRef.getPercentageSize(),
    setSize: (size) => leftHandleRef.setSize(size),
  };

  /** @type {import("@window-splitter/interface").PanelHandle} */
  export const rightHandle = {
    collapse: () => rightHandleRef.collapse(),
    isCollapsed: () => rightHandleRef.isCollapsed(),
    expand: () => rightHandleRef.expand(),
    isExpanded: () => rightHandleRef.isExpanded(),
    getId: () => rightHandleRef.getId(),
    getPixelSize: () => rightHandleRef.getPixelSize(),
    getPercentageSize: () => rightHandleRef.getPercentageSize(),
  };

  let collapsed = $state(true);
  const onCollapseChange = (newCollapsed) => {
    collapsed = newCollapsed;
  };
</script>

<PanelGroup bind:this={panelGroup} class="panel-group">
  <Panel
    bind:this={leftHandleRef}
    class="collapsible-example-panel-1 panel"
    min="100px"
    collapsible
    collapsedSize="60px"
    collapseAnimation={{ easing: "bounce", duration: 1000 }}
    onCollapseChange={(isCollapsed) => {
      // eslint-disable-next-line no-console
      console.log("COLLAPSE PASSIVE", isCollapsed);
    }}
  >
    1
  </Panel>
  <PanelResizer class="panel-resizer" id="resizer-1" size="10px" />
  <Panel min="100px">2</Panel>
  <PanelResizer class="panel-resizer" id="resizer-2" size="10px" />
  <Panel
    bind:this={rightHandleRef}
    class="collapsible-example-panel-2 panel"
    min="100px"
    collapsible
    collapsedSize="60px"
    collapseAnimation={{ easing: "bounce", duration: 1000 }}
    {collapsed}
    {onCollapseChange}
  >
    3
  </Panel>
</PanelGroup>

<style>
  :global(.collapsible-example-panel-1) {
    border: 10px solid green;
    box-sizing: border-box;
  }

  :global(.panel-group) {
    border: 1px solid rgba(0, 0, 0, 0.3);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    box-sizing: border-box;
    width: 500px;
  }

  :global(.panel) {
    height: 100%;
    width: 100%;
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    box-sizing: border-box;
  }

  :global(.panel-resizer) {
    background: red;
  }
</style>
