<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";

  import PanelGroup from "./PanelGroup.svelte";
  import Panel from "./Panel.svelte";
  import PanelResizer from "./PanelResizer.svelte";

  const { Story } = defineMeta({
    title: "WindowSplitter/Svelte",
    component: PanelGroup,
  });
</script>

<Story name="Primary" args={{ primary: true }} />
