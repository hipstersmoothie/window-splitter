<script module>
  import PanelGroup from "../lib/PanelGroup.svelte";
  import Panel from "../lib/Panel.svelte";
  import PanelResizer from "../lib/PanelResizer.svelte";

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

<PanelGroup
  bind:this={panelGroup}
  orientation="vertical"
  class="panel-group vertical-example"
>
  <Panel default="30%" min="20%" class="panel">top</Panel>
  <PanelResizer class="panel-resizer" size="10px" />
  <Panel min="20%" class="panel">middle</Panel>
  <PanelResizer class="panel-resizer" size="10px" />
  <Panel default="30%" min="20%" class="panel">bottom</Panel>
</PanelGroup>

<style>
  :global(.vertical-example) {
    height: 322px;
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
