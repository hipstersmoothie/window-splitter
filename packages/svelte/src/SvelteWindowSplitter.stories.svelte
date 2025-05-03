<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import PanelGroup from "./PanelGroup.svelte";
  import Panel from "./Panel.svelte";
  import PanelResizer from "./PanelResizer.svelte";
  import { spring } from "framer-motion";
  import SimpleStory from "./stories/Simple.svelte";
  import VerticalLayoutStory from "./stories/VerticalLayout.svelte";
  import ConditionalStory from "./stories/Conditional.svelte";
  import DynamicConstraintsStory from "./stories/DynamicConstraints.svelte";
  import AutosaveStory from "./stories/Autosave.svelte";
  import AutosaveCollapsibleStory from "./stories/AutosaveCollapsible.svelte";
  import AutosaveCookieStory from "./stories/AutosaveCookie.svelte";
  import CollapsibleStory from "./stories/Collapsible.svelte";
  // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
  const { Story } = defineMeta({
    title: "WindowSplitter/Svelte",
  });

  const springFn = spring({
    keyframes: [0, 1],
    velocity: 1,
    stiffness: 100,
    damping: 10,
    mass: 1.0,
  });

  let isExpanded = $state(false);
  const toggleExpanded = () => {
    isExpanded = !isExpanded;
  };

  let panel;
  let group;
</script>

<Story name="Simple">
  <SimpleStory />
</Story>

<Story name="Autosave">
  <AutosaveStory />
</Story>

<Story name="AutosaveCookie">
  <AutosaveCookieStory />
</Story>

<Story name="AutosaveCollapsible">
  <AutosaveCollapsibleStory />
</Story>

<Story name="DynamicConstraints">
  <DynamicConstraintsStory />
</Story>

<Story name="SimpleMin">
  <PanelGroup class="panel-group">
    <Panel min="100px" class="panel">1</Panel>
    <PanelResizer class="panel-resizer" size="10px" />
    <Panel min="100px" class="panel">2</Panel>
    <PanelResizer class="panel-resizer" size="10px" />
    <Panel min="100px" class="panel">3</Panel>
  </PanelGroup>
</Story>

<Story name="SimpleMinMax">
  <PanelGroup class="panel-group">
    <Panel min="100px" max="200px" class="panel">1</Panel>
    <PanelResizer class="panel-resizer" size="10px" />
    <Panel min="100px" class="panel">2</Panel>
    <PanelResizer class="panel-resizer" size="20px" />
    <Panel min="100px" class="panel">3</Panel>
  </PanelGroup>
</Story>

<Story name="SimpleConstraints">
  <PanelGroup class="panel-group">
    <Panel min="100px" max="50%" class="panel">1</Panel>
    <PanelResizer class="panel-resizer" size="10px" />
    <Panel class="panel">2</Panel>
  </PanelGroup>
</Story>

<Story name="HorizontalLayout">
  <PanelGroup orientation="horizontal" class="panel-group">
    <Panel default="30%" min="20%" class="panel">left</Panel>
    <PanelResizer class="panel-resizer" size="10px" />
    <Panel min="20%" class="panel">middle</Panel>
    <PanelResizer class="panel-resizer" size="10px" />
    <Panel default="30%" min="20%" class="panel">right</Panel>
  </PanelGroup>
</Story>

<Story name="VerticalLayout">
  <VerticalLayoutStory />
</Story>

<Story name="VerticalLayout2">
  <PanelGroup orientation="vertical" class="panel-group vertical-example-2">
    <Panel default="200px" min="200px" class="panel">top</Panel>
    <PanelResizer class="panel-resizer" size="10px" />
    <Panel
      min="200px"
      collapsedSize="60px"
      defaultCollapsed
      collapsible
      class="panel"
    >
      middle
    </Panel>
  </PanelGroup>
</Story>

<Story name="NestedGroups">
  <PanelGroup
    orientation="horizontal"
    class="panel-group nested-groups-example"
  >
    <Panel min="10%">1</Panel>
    <PanelResizer class="panel-resizer" size="10px" />
    <Panel min="10%">
      <PanelGroup orientation="vertical">
        <Panel min="10%">2-1</Panel>
        <PanelResizer class="panel-resizer" size="10px" />
        <Panel min="10%">
          <PanelGroup orientation="horizontal">
            <Panel min="20%">2-2-1</Panel>
            <PanelResizer class="panel-resizer" size="10px" />
            <Panel min="20%">2-2-2</Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </Panel>
    <PanelResizer class="panel-resizer" size="10px" />
    <Panel min="10%">3</Panel>
  </PanelGroup>
</Story>

<Story name="WithOverflow">
  <PanelGroup class="panel-group with-overflow-example">
    <Panel min="200px">
      <div
        style:overflow="auto"
        style:padding="40px"
        style:height="100%"
        style:box-sizing="border-box"
      >
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
          euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi, eu
          tincidunt nisl nisl eu nisl. Sed euismod, nisl eget ultricies
          ultrices, nunc nisi aliquam nisi, eu tincidunt nisl nisl eu nisl. Sed
          euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi, eu
          tincidunt nisl nisl eu nisl.
        </p>
        <p>
          Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi, eu
          tincidunt nisl nisl eu nisl. Sed euismod, nisl eget ultricies
          ultrices, nunc nisi aliquam nisi, eu tincidunt nisl nisl eu nisl. Sed
          euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi, eu
          tincidunt nisl nisl eu nisl.
        </p>
        <p>
          Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi, eu
          tincidunt nisl nisl eu nisl. Sed euismod, nisl eget ultricies
          ultrices, nunc nisi aliquam nisi, eu tincidunt nisl nisl eu nisl. Sed
          euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi, eu
          tincidunt nisl nisl eu nisl.
        </p>
        <p>
          Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi, eu
          tincidunt nisl nisl eu nisl. Sed euismod, nisl eget ultricies
          ultrices, nunc nisi aliquam nisi, eu tincidunt nisl nisl eu nisl. Sed
          euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi, eu
          tincidunt nisl nisl eu nisl.
        </p>
        <p>
          Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi, eu
          tincidunt nisl nisl eu nisl. Sed euismod, nisl eget ultricies
          ultrices, nunc nisi aliquam nisi, eu tincidunt nisl nisl eu nisl. Sed
          euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi, eu
          tincidunt nisl nisl eu nisl.
        </p>
      </div>
    </Panel>
    <PanelResizer class="panel-resizer" size="10px" />
    <Panel min="200px">
      <div
        style:overflow="auto"
        style:padding="40px"
        style:height="100%"
        style:box-sizing="border-box"
      >
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
          euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi, eu
          tincidunt nisl nisl eu nisl. Sed euismod, nisl eget ultricies
          ultrices, nunc nisi aliquam nisi, eu tincidunt nisl nisl eu nisl. Sed
          euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi, eu
          tincidunt nisl nisl eu nisl.
        </p>
        <p>
          Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi, eu
          tincidunt nisl nisl eu nisl. Sed euismod, nisl eget ultricies
          ultrices, nunc nisi aliquam nisi, eu tincidunt nisl nisl eu nisl. Sed
          euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi, eu
          tincidunt nisl nisl eu nisl.
        </p>
        <p>
          Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi, eu
          tincidunt nisl nisl eu nisl. Sed euismod, nisl eget ultricies
          ultrices, nunc nisi aliquam nisi, eu tincidunt nisl nisl eu nisl. Sed
          euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi, eu
          tincidunt nisl nisl eu nisl.
        </p>
        <p>
          Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi, eu
          tincidunt nisl nisl eu nisl. Sed euismod, nisl eget ultricies
          ultrices, nunc nisi aliquam nisi, eu tincidunt nisl nisl eu nisl. Sed
          euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi, eu
          tincidunt nisl nisl eu nisl.
        </p>
        <p>
          Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi, eu
          tincidunt nisl nisl eu nisl. Sed euismod, nisl eget ultricies
          ultrices, nunc nisi aliquam nisi, eu tincidunt nisl nisl eu nisl. Sed
          euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi, eu
          tincidunt nisl nisl eu nisl.
        </p>
      </div>
    </Panel>
  </PanelGroup>
</Story>

<Story name="Collapsible">
  <CollapsibleStory />
</Story>

<Story name="CustomCollapseAnimation">
  <PanelGroup class="panel-group">
    <Panel
      min="100px"
      collapsible
      collapsedSize="60px"
      class="collapsible-example-panel-1 panel"
    >
      1
    </Panel>
    <PanelResizer class="panel-resizer" size="10px" />
    <Panel min="100px">2</Panel>
    <PanelResizer class="panel-resizer" size="10px" />
    <Panel
      min="100px"
      collapsible
      collapsedSize="60px"
      class="collapsible-example-panel-2 panel"
      defaultCollapsed
      collapseAnimation={{
        easing: (t) => springFn.next(t * 1000).value,
        duration: 1000,
      }}
    >
      3
    </Panel>
  </PanelGroup>
</Story>

<Story name="ImperativePanel">
  <PanelGroup class="panel-group" bind:this={group}>
    <Panel
      class="panel"
      bind:this={panel}
      min="100px"
      collapsible
      collapsedSize="60px"
    >
      1
    </Panel>
    <PanelResizer class="panel-resizer" size="10px" />
    <Panel class="panel" min="100px">2</Panel>
    <PanelResizer class="panel-resizer" size="10px" />
    <Panel
      class="panel"
      min="100px"
      collapsible
      collapsedSize="60px"
      defaultCollapsed
    >
      3
    </Panel>
  </PanelGroup>

  <div>
    <button
      type="button"
      onclick={() => alert(`Sizes: ${group?.getPixelSizes()}`)}
    >
      Get pixel sizes
    </button>
    <button
      type="button"
      onclick={() => alert(`Sizes: ${group?.getPercentageSizes()}`)}
    >
      Get percent sizes
    </button>
    <button
      type="button"
      onclick={() => group?.setSizes(["200px", "10px", "50%", "10px", "150px"])}
    >
      Override sizes
    </button>
  </div>

  <div>
    <button type="button" onclick={() => panel?.collapse()}> Collapse </button>
    <button
      type="button"
      onclick={() => alert(`Collapsed: ${panel?.isCollapsed()}`)}
    >
      Is Collapsed?
    </button>
    <button type="button" onclick={() => panel?.expand()}> Expand </button>
    <button
      type="button"
      onclick={() => alert(`Expanded: ${panel?.isExpanded()}`)}
    >
      Is Expanded?
    </button>
    <button type="button" onclick={() => alert(`Id: ${panel?.getId()}`)}>
      Get Id
    </button>
    <button
      type="button"
      onclick={() => alert(`Size: ${panel?.getPixelSize()}`)}
    >
      Get Pixel Size
    </button>
    <button
      type="button"
      onclick={() => alert(`Percentage: ${panel?.getPercentageSize()}`)}
    >
      Get Percentage Size
    </button>
    <button type="button" onclick={() => panel?.setSize("30px")}>
      Set size to 100px
    </button>
    <button type="button" onclick={() => panel?.setSize("50%")}>
      Set size to 50%
    </button>
  </div>
</Story>

<Story name="ConditionalPanel">
  <Conditional />
</Story>

<Story name="ConditionalPanelComplex">
  <PanelGroup class="panel-group">
    <Panel
      class="panel"
      id="panel-1"
      min="100px"
      collapsible
      collapsedSize="60px"
    >
      <div>1</div>
    </Panel>
    <PanelResizer id="handle-1" class="panel-resizer" size="10px" />
    <Panel class="panel" id="panel-2" min="100px">
      <div>2</div>
    </Panel>
    <PanelResizer id="handle-2" class="panel-resizer" size="10px" />
    <Panel class="panel" id="panel-3" min="100px">
      <div>3</div>
    </Panel>
    {#if isExpanded}
      <PanelResizer id="handle-3" class="panel-resizer" size="10px" />
      <Panel class="panel" id="panel-4" min="100px">
        expanded
        <button type="button" onclick={toggleExpanded}>Close</button>
      </Panel>
    {/if}
    <PanelResizer id="handle-4" class="panel-resizer" size="10px" />
    <Panel
      min="200px"
      collapsible
      collapsedSize="60px"
      defaultCollapsed
      class="panel"
      id="panel-5"
    >
      <div>4</div>
    </Panel>
  </PanelGroup>

  <button type="button" onclick={toggleExpanded}>Expand</button>
</Story>

<Story name="WithDefaultWidth">
  <PanelGroup class="panel-group h-200">
    <Panel class="panel">1</Panel>
    <PanelResizer class="panel-resizer" size="3px" />
    <Panel default="100px" min="100px" max="400px" class="panel">2</Panel>
  </PanelGroup>
</Story>

<Story name="StaticAtRest">
  <PanelGroup class="panel-group h-200">
    <Panel min="100px" max="300px" class="panel" isStaticAtRest>1</Panel>
    <PanelResizer class="panel-resizer" size="10px" />
    <Panel min="100px" class="panel">2</Panel>
    <PanelResizer class="panel-resizer" size="10px" />
    <Panel min="100px" class="panel">3</Panel>
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

  :global(.h-200) {
    height: 200px;
  }

  :global(.vertical-example-2) {
    height: calc(100vh - 100px);
  }

  :global(.nested-groups-example) {
    border: 1px solid rgba(0, 0, 0, 0.3);
    border-radius: 12px;
    height: 400px;
  }

  :global(.with-overflow-example) {
    height: 400px;
  }

  :global(.collapsible-example-panel-1) {
    border: 10px solid green;
    box-sizing: border-box;
  }

  :global(.collapsible-example-panel-2) {
    border: 10px solid blue;
    box-sizing: border-box;
  }
</style>
