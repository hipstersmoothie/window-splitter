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

  let isExpanded = $state(false);
  const toggleExpanded = () => {
    isExpanded = !isExpanded;
  };
</script>

<PanelGroup bind:this={panelGroup} class="panel-group">
  <Panel
    id="panel-1"
    min="100px"
    collapsible
    collapsedSize="60px"
    class="panel"
  >
    1
  </Panel>
  <PanelResizer id="handle-1" class="panel-resizer" size="10px" />
  <Panel id="panel-2" min="100px" class="panel">2</Panel>

  {#if isExpanded}
    <PanelResizer id="handle-2" class="panel-resizer" size="10px" />
    <Panel id="panel-3" min="100px" class="panel">
      3
      <button type="button" onclick={toggleExpanded}>Close</button>
    </Panel>
  {/if}
</PanelGroup>
<button type="button" onclick={toggleExpanded}>Expand</button>

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
