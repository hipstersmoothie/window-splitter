<script module>
  import PanelGroup from "../PanelGroup.svelte";
  import Panel from "../Panel.svelte";
  import PanelResizer from "../PanelResizer.svelte";

  let panelGroup;

  /** @type {import("@window-splitter/interface").PanelGroupHandle} */
  export const handle = {
    getId: () => "panel-group",
    getTemplate: () => panelGroup.getTemplate(),
    getState: () => panelGroup.getState(),
    getPixelSizes: () => panelGroup.getPixelSizes(),
    getPercentageSizes: () => panelGroup.getPercentageSizes(),
    setSizes: (sizes) => panelGroup.setSizes(sizes),
  };
</script>

<PanelGroup bind:this={panelGroup} class="panel-group">
  <Panel class="panel">Panel 1</Panel>
  <PanelResizer class="panel-resizer" size="10px" />
  <Panel class="panel" min="100px">Panel 2</Panel>
</PanelGroup>

<style>
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
