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

  let collapsed = $state(false);
  const onCollapseChange = (newCollapsed) => {
    console.log("onCollapseChange", newCollapsed);
    collapsed = newCollapsed;
  };
</script>

<Story name="Simple">
  <PanelGroup class="panel-group">
    <Panel class="panel">1</Panel>
    <PanelResizer class="panel-resizer" size="10px" />
    <Panel class="panel">2</Panel>
  </PanelGroup>
</Story>

<Story name="Autosave">
  <PanelGroup class="panel-group" autosaveId="autosave-example-svelte">
    <Panel id="1" class="panel">1</Panel>
    <PanelResizer id="resizer" class="panel-resizer" size="10px" />
    <Panel id="2" class="panel">2</Panel>
  </PanelGroup>
</Story>

<Story name="AutosaveCookie">
  <PanelGroup
    class="panel-group autosave-cookie-example"
    autosaveId="autosave-cookie-svelte"
    autosaveStrategy="cookie"
  >
    <Panel id="1" class="panel">1</Panel>
    <PanelResizer id="resizer" class="panel-resizer" size="10px" />
    <Panel id="2" class="panel">2</Panel>
  </PanelGroup>
</Story>

<Story name="AutosaveCollapsible">
  <PanelGroup class="panel-group" autosaveId="autosave-collapsible-svelte">
    <Panel id="1" collapsible collapsedSize="100px" min="140px" class="panel">
      1
    </Panel>
    <PanelResizer id="resizer" class="panel-resizer" size="10px" />
    <Panel id="2" class="panel">2</Panel>
  </PanelGroup>
</Story>

<!-- TODO: add dynamic constraints -->

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
  <PanelGroup orientation="vertical" class="panel-group vertical-example">
    <Panel default="30%" min="20%" class="panel">top</Panel>
    <PanelResizer class="panel-resizer" size="10px" />
    <Panel min="20%" class="panel">middle</Panel>
    <PanelResizer class="panel-resizer" size="10px" />
    <Panel default="30%" min="20%" class="panel">bottom</Panel>
  </PanelGroup>
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
  <PanelGroup class="panel-group">
    <Panel
      class="collapsible-example-panel-1"
      min="100px"
      collapsible
      collapsedSize="60px"
      collapseAnimation={{ easing: "bounce", duration: 1000 }}
      onCollapseChange={(isCollapsed) => {
        console.log("COLLAPSE PASSIVE", isCollapsed);
      }}
    >
      1
    </Panel>
    <PanelResizer class="panel-resizer" size="10px" />
    <Panel min="100px">2</Panel>
    <PanelResizer class="panel-resizer" size="10px" />
    <Panel
      class="collapsible-example-panel-2"
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

  :global(.autosave-cookie-example) {
    height: 200px;
  }

  :global(.vertical-example) {
    height: 322px;
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
