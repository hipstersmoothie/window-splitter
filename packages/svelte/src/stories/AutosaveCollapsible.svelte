<script>
  import PanelGroup from "../lib/PanelGroup.svelte";
  import Panel from "../lib/Panel.svelte";
  import PanelResizer from "../lib/PanelResizer.svelte";

  const { onCollapseChange, handle: handleProp } = $props();

  let panelGroup;

  if (handleProp) {
    /** @type {import("@window-splitter/interface").PanelGroupHandle} */
    handleProp.current = {
      getId: () => "panel-group",
      getTemplate: () => panelGroup.getTemplate(),
      getState: () => panelGroup.getState(),
      getPixelSizes: () => panelGroup.getPixelSizes(),
      getPercentageSizes: () => panelGroup.getPercentageSizes(),
      setSizes: (sizes) => panelGroup.setSizes(sizes),
    };
  }
</script>

<PanelGroup
  bind:this={panelGroup}
  class="panel-group"
  autosaveId="autosave-collapsible-svelte"
>
  <Panel
    id="1"
    collapsible
    collapsedSize="100px"
    {onCollapseChange}
    min="140px"
    class="panel"
  >
    Collapsible
  </Panel>
  <PanelResizer id="resizer" class="panel-resizer" size="10px" />
  <Panel id="2" class="panel">Panel 2</Panel>
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
