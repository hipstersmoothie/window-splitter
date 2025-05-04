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
    template: dedent`
      <PanelGroup class="panel-group" handle={props.handle} :style="{ height: '200px' }">
        <Panel class="panel">Panel 1</Panel>
        <PanelResizer class="panel-resizer" size="10px" />
        <Panel class="panel" min="100px">Panel 2</Panel>
      </PanelGroup>
    `,
  }),
};
