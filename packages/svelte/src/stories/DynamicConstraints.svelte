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

  let dynamicConstraints = $state(false);
  const toggleDynamicConstraints = () => {
    dynamicConstraints = !dynamicConstraints;
  };
</script>

<PanelGroup class="panel-group dynamic-constraints" bind:this={panelGroup}>
  <Panel
    default="100px"
    min={dynamicConstraints ? "200px" : "100px"}
    class="panel"
  >
    Panel 1
  </Panel>
  <PanelResizer class="panel-resizer" size="10px" />
  <Panel min="100px" class="panel">Panel 2</Panel>
  <PanelResizer class="panel-resizer" size="10px" />
  <Panel
    min={dynamicConstraints ? "100px" : "400px"}
    max={dynamicConstraints ? "300px" : "700px"}
    class="panel"
  >
    Panel 3
  </Panel>
</PanelGroup>
<button type="button" onclick={toggleDynamicConstraints}>
  Toggle Custom
</button>

<style>
  :global(.dynamic-constraints) {
    width: 1000px !important;
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
