import type { Meta, StoryObj } from "@storybook/vue3";
import dedent from "dedent";
import PanelGroup from "./PanelGroup.vue";
import Panel from "./Panel.vue";
import PanelResizer from "./PanelResizer.vue";

const meta: Meta<typeof PanelGroup> = {
  title: "WindowSplitter/Vue",
  component: PanelGroup,
  subcomponents: {
    Panel,
    PanelResizer,
  },
};
export default meta;

type Story = StoryObj<typeof PanelGroup>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Simple: Story = {
  render: () => ({
    components: { PanelGroup, Panel, PanelResizer },
    template: dedent/*html*/ `
      <PanelGroup 
        class="panel-group" 
        :style="{ height: '200px' }"
      >
        <Panel class="panel">Panel 1</Panel>
        <PanelResizer class="panel-resizer" size="10px" />
        <Panel class="panel" min="100px">Panel 2</Panel>
      </PanelGroup>
    `,
  }),
};

export const Autosave: Story = {
  render: () => ({
    components: { PanelGroup, Panel, PanelResizer },
    template: dedent/*html*/ `
      <PanelGroup 
        class="panel-group"
        autosaveId="autosave-example-solid"
      >
        <Panel class="panel" id="1">Panel 1</Panel>
        <PanelResizer class="panel-resizer" :id="resizer" size="10px" />
        <Panel class="panel" :id="2">Panel 2</Panel>
      </PanelGroup>
    `,
  }),
};

export const AutosaveCookie: Story = {
  render: () => ({
    components: { PanelGroup, Panel, PanelResizer },
    template: dedent/*html*/ `
      <PanelGroup
        autosaveId="autosave-cookie-vue"
        autosaveStrategy="cookie"
        :style="{ height: '200px' }"
        class="panel-group"
      >
        <Panel class="panel" id="1">Panel 1</Panel>
        <PanelResizer class="panel-resizer" id="resizer1" size="10px" />
        <Panel class="panel" id="2">Panel 2</Panel>
      </PanelGroup>
    `,
  }),
};

export const AutosaveCollapsible: Story = {
  render: () => ({
    components: { PanelGroup, Panel, PanelResizer },
    template: dedent/*html*/ `
      <PanelGroup 
        class="panel-group"
        autosaveId="autosave-example-2"
      >
        <Panel class="panel" id="1" collapsible collapsedSize="100px" min="140px">
          Collapsible
        </Panel>
        <PanelResizer class="panel-resizer" id="resizer" size="10px" />
        <Panel class="panel" id="2">Panel 2</Panel>
      </PanelGroup>
    `,
  }),
};
