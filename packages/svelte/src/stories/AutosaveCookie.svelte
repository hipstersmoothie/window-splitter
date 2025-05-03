<script>
  import PanelGroup from "../lib/PanelGroup.svelte";
  import Panel from "../lib/Panel.svelte";
  import PanelResizer from "../lib/PanelResizer.svelte";

  const { snapshot, handle } = $props();

  let panelGroup;

  /** @type {import("@window-splitter/interface").PanelGroupHandle} */
  handle.current = {
    getId: () => "panel-group",
    getTemplate: () => panelGroup.getTemplate(),
    getState: () => panelGroup.getState(),
    getPixelSizes: () => panelGroup.getPixelSizes(),
    getPercentageSizes: () => panelGroup.getPercentageSizes(),
    setSizes: (sizes) => panelGroup.setSizes(sizes),
  };
</script>

<PanelGroup
  bind:this={panelGroup}
  class="panel-group h-200 w-502"
  autosaveId="autosave-cookie-svelte"
  autosaveStrategy="cookie"
  {snapshot}
>
  <Panel id="1" class="panel">Panel 1</Panel>
  <PanelResizer id="resizer" class="panel-resizer" size="10px" />
  <Panel id="2" class="panel">Panel 2</Panel>
</PanelGroup>

<style>
  :global(.h-200) {
    height: 200px;
  }

  :global(.w-502) {
    width: 502px !important;
  }

  :global(.panel-group) {
    border: 1px solid rgba(0, 0, 0, 0.3);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    box-sizing: border-box;
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
