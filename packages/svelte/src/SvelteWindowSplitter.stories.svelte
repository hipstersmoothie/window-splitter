<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { fn } from "@storybook/test";
  import PanelGroup from "./PanelGroup.svelte";
  import Panel from "./Panel.svelte";
  import PanelResizer from "./PanelResizer.svelte";

  // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
  const { Story } = defineMeta({
    title: "WindowSplitter/Svelte",
  });
</script>

<Story name="Primary" args={{ primary: true, label: "Button" }}>
  <PanelGroup class="panel-group">
    <Panel class="panel">1</Panel>
    <PanelResizer class="panel-resizer" size="10px" />
    <Panel class="panel">2</Panel>
  </PanelGroup>
</Story>

<style>
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
