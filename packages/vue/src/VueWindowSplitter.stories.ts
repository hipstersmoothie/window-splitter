import type { Meta, StoryObj } from "@storybook/vue3";
import dedent from "dedent";
import PanelGroup from "./PanelGroup.vue";
import Panel from "./Panel.vue";
import PanelResizer from "./PanelResizer.vue";
import { ref, useTemplateRef } from "vue";
import { spring } from "framer-motion";
import { PanelGroupHandle, PanelHandle } from "@window-splitter/interface";

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

export const DynamicConstraints: Story = {
  render: () => ({
    components: { PanelGroup, Panel, PanelResizer },
    setup() {
      const customOn = ref(false);
      return { customOn };
    },
    template: dedent/*html*/ `
      <PanelGroup class="panel-group">
        <Panel default="100px" :min="customOn ? '200px' : '100px'" class="panel">
          <div>Panel 1</div>
        </Panel>
        <PanelResizer class="panel-resizer" size="10px" />
        <Panel min="100px" class="panel">
          <div>Panel 2</div>
        </Panel>
        <PanelResizer class="panel-resizer" size="10px" />
        <Panel
          class="panel"
          :min="customOn ? '100px' : '400px'"
          :max="customOn ? '300px' : '700px'"
        >
          <div>Panel 3</div>
        </Panel>
      </PanelGroup>

      <button type="button" @click="() => customOn = !customOn">
        Toggle Custom
      </button>
    `,
  }),
};

export const SimpleMin: Story = {
  render: () => ({
    components: { PanelGroup, Panel, PanelResizer },
    template: dedent/*html*/ `
      <PanelGroup class="panel-group">
        <Panel min="100px" class="panel">
          <div>Panel 1</div>
        </Panel>
        <PanelResizer class="panel-resizer" size="10px" />
        <Panel min="100px" class="panel">
          <div>Panel 2</div>
        </Panel>
        <PanelResizer class="panel-resizer" size="10px" />
        <Panel min="100px" class="panel">
          <div>Panel 3</div>
        </Panel>
      </PanelGroup>
    `,
  }),
};

export const SimpleMinMax: Story = {
  render: () => ({
    components: { PanelGroup, Panel, PanelResizer },
    template: dedent/*html*/ `
      <PanelGroup class="panel-group">
        <Panel min="100px" max="200px" class="panel">
          <div>Panel 1</div>
        </Panel>
        <PanelResizer class="panel-resizer" size="10px" />
        <Panel min="100px" class="panel">
          <div>Panel 2</div>
        </Panel>
        <PanelResizer class="panel-resizer" size="20px" />
        <Panel min="100px" class="panel">
          <div>Panel 3</div>
        </Panel>
      </PanelGroup>
    `,
  }),
};

export const SimpleConstraints: Story = {
  render: () => ({
    components: { PanelGroup, Panel, PanelResizer },
    template: dedent/*html*/ `
      <PanelGroup class="panel-group">
        <Panel min="100px" max="50%" class="panel">
          <div>Panel 1</div>
        </Panel>
        <PanelResizer class="panel-resizer" size="10px" />
        <Panel class="panel">
          <div>Panel 2</div>
        </Panel>
      </PanelGroup>
    `,
  }),
};

export const HorizontalLayout: Story = {
  render: () => ({
    components: { PanelGroup, Panel, PanelResizer },
    template: dedent/*html*/ `
      <PanelGroup orientation="horizontal" class="panel-group">
        <Panel default="30%" min="20%" class="panel">
          left
        </Panel>
        <PanelResizer class="panel-resizer" size="10px" />
        <Panel min="20%" class="panel">middle</Panel>
        <PanelResizer class="panel-resizer" size="10px" />
        <Panel default="30%" min="20%" class="panel">
          right
        </Panel>
      </PanelGroup>
    `,
  }),
};

export const VerticalLayout: Story = {
  render: () => ({
    components: { PanelGroup, Panel, PanelResizer },
    template: dedent/*html*/ `
      <PanelGroup
        orientation="vertical"
        :style="{ height: '322px' }"
        class="panel-group"
      >
        <Panel default="30%" min="20%" class="panel">
          top
        </Panel>
        <PanelResizer class="panel-resizer" size="10px" />
        <Panel min="20%" class="panel">middle</Panel>
        <PanelResizer class="panel-resizer" size="10px" />
        <Panel default="30%" min="20%" class="panel">
          bottom
        </Panel>
      </PanelGroup>
    `,
  }),
};

export const VerticalLayout2: Story = {
  render: () => ({
    components: { PanelGroup, Panel, PanelResizer },
    template: dedent/*html*/ `
      <PanelGroup
        orientation="vertical"
        :style="{ height: 'calc(100vh - 100px)' }"
        class="panel-group"
      >
        <Panel default="200px" min="200px" class="panel">
          top
        </Panel>
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
    `,
  }),
};

export const NestedGroups: Story = {
  render: () => ({
    components: { PanelGroup, Panel, PanelResizer },
    template: dedent/*html*/ `
      <PanelGroup
        orientation="horizontal"
        :style="{
          border: '1px solid rgba(0, 0, 0, 0.3)',
          'border-radius': '12px',
          height: '400px',
        }"
        class="panel-group"
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
    `,
  }),
};

export const WithOverflow: Story = {
  render: () => ({
    components: { PanelGroup, Panel, PanelResizer },
    template: dedent/*html*/ `
      <PanelGroup
        :style="{ height: '400px' }"
        class="panel-group"
      >
        <Panel min="200px" class="panel">
          <div
            :style="{
              overflow: 'auto',
              height: '100%',
              'box-sizing': 'border-box',
            }"
          >
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
              euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi, eu
              tincidunt nisl nisl eu nisl. Sed euismod, nisl eget ultricies
              ultrices, nunc nisi aliquam nisi, eu tincidunt nisl nisl eu nisl.
              Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
              eu tincidunt nisl nisl eu nisl.
            </p>
            <p>
              Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
              eu tincidunt nisl nisl eu nisl. Sed euismod, nisl eget ultricies
              ultrices, nunc nisi aliquam nisi, eu tincidunt nisl nisl eu nisl.
              Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
              eu tincidunt nisl nisl eu nisl.
            </p>
            <p>
              Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
              eu tincidunt nisl nisl eu nisl. Sed euismod, nisl eget ultricies
              ultrices, nunc nisi aliquam nisi, eu tincidunt nisl nisl eu nisl.
              Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
              eu tincidunt nisl nisl eu nisl.
            </p>
            <p>
              Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
              eu tincidunt nisl nisl eu nisl. Sed euismod, nisl eget ultricies
              ultrices, nunc nisi aliquam nisi, eu tincidunt nisl nisl eu nisl.
              Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
              eu tincidunt nisl nisl eu nisl.
            </p>
            <p>
              Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
              eu tincidunt nisl nisl eu nisl. Sed euismod, nisl eget ultricies
              ultrices, nunc nisi aliquam nisi, eu tincidunt nisl nisl eu nisl.
              Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
              eu tincidunt nisl nisl eu nisl.
            </p>
          </div>
        </Panel>
        <PanelResizer class="panel-resizer" size="10px" />
        <Panel min="200px" class="panel">
          <div
            :style="{
              overflow: 'auto',
              padding: '40px',
              height: '100%',
              'box-sizing': 'border-box',
            }"
          >
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
              euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi, eu
              tincidunt nisl nisl eu nisl. Sed euismod, nisl eget ultricies
              ultrices, nunc nisi aliquam nisi, eu tincidunt nisl nisl eu nisl.
              Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
              eu tincidunt nisl nisl eu nisl.
            </p>
            <p>
              Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
              eu tincidunt nisl nisl eu nisl. Sed euismod, nisl eget ultricies
              ultrices, nunc nisi aliquam nisi, eu tincidunt nisl nisl eu nisl.
              Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
              eu tincidunt nisl nisl eu nisl.
            </p>
            <p>
              Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
              eu tincidunt nisl nisl eu nisl. Sed euismod, nisl eget ultricies
              ultrices, nunc nisi aliquam nisi, eu tincidunt nisl nisl eu nisl.
              Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
              eu tincidunt nisl nisl eu nisl.
            </p>
            <p>
              Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
              eu tincidunt nisl nisl eu nisl. Sed euismod, nisl eget ultricies
              ultrices, nunc nisi aliquam nisi, eu tincidunt nisl nisl eu nisl.
              Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
              eu tincidunt nisl nisl eu nisl.
            </p>
            <p>
              Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
              eu tincidunt nisl nisl eu nisl. Sed euismod, nisl eget ultricies
              ultrices, nunc nisi aliquam nisi, eu tincidunt nisl nisl eu nisl.
              Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
              eu tincidunt nisl nisl eu nisl.
            </p>
          </div>
        </Panel>
      </PanelGroup>
    `,
  }),
};

export const Collapsible: Story = {
  render: () => ({
    components: { PanelGroup, Panel, PanelResizer },
    setup() {
      const collapsed = ref(true);
      return { collapsed };
    },
    template: dedent/*html*/ `
      <PanelGroup class="panel-group">
        <Panel
          min="100px"
          collapsible
          collapsedSize="60px"
          :style="{ border: '10px solid green', 'box-sizing': 'border-box' }"
        >
          <div>1</div>
        </Panel>
        <PanelResizer class="panel-resizer" size="10px" />
        <Panel min="100px" class="panel">
          <div>2</div>
        </Panel>
        <PanelResizer class="panel-resizer" id="resizer-2" size="10px" />
        <Panel
          min="100px"
          collapsible
          collapsedSize="60px"
          :collapseAnimation="{ easing: 'bounce', duration: 1000 }"
          :style="{ border: '10px solid blue', 'box-sizing': 'border-box' }"
          :collapsed="collapsed"
          @collapse-change="collapsed = !collapsed"
        >
          <div>3</div>
        </Panel>
      </PanelGroup>
    `,
  }),
};

export const CustomCollapseAnimation: Story = {
  render: () => ({
    components: { PanelGroup, Panel, PanelResizer },
    setup() {
      const springFn = spring({
        keyframes: [0, 1],
        velocity: 1,
        stiffness: 100,
        damping: 10,
        mass: 1.0,
      });

      return { springFn };
    },
    template: dedent/*html*/ `
      <PanelGroup class="panel-group">
        <Panel
          min="100px"
          collapsible
          collapsedSize="60px"
          :style="{ border: '10px solid green', 'box-sizing': 'border-box' }"
          class="panel"
        >
          1
        </Panel>
        <PanelResizer class="panel-resizer" size="10px" />
        <Panel min="100px" class="panel">2</Panel>
        <PanelResizer class="panel-resizer" size="10px" />
        <Panel
          class="panel"
          :style="{ border: '10px solid blue', 'box-sizing': 'border-box' }"
          min="100px"
          collapsible
          collapsedSize="60px"
          defaultCollapsed
          :collapseAnimation="{
            easing: (t) => springFn.next(t * 1000).value,
            duration: 1000,
          }"
        >
          3
        </Panel>
      </PanelGroup>
    `,
  }),
};

export const ImperativePanel: Story = {
  render: () => ({
    components: { PanelGroup, Panel, PanelResizer },
    setup() {
      const groupRef = useTemplateRef<PanelGroupHandle>("groupRef");
      const panelRef = useTemplateRef<PanelHandle>("panelRef");

      return {
        groupRef,
        panelRef,
        alert: (...args: any[]) => alert(args.join(", ")),
      };
    },
    template: dedent/*html*/ `
      <PanelGroup class="panel-group" ref="groupRef">
        <Panel
          ref="panelRef"
          min="100px"
          class="panel"
          collapsible
          collapsedSize="60px"
        >
          1
        </Panel>
        <PanelResizer class="panel-resizer" size="10px" />
        <Panel min="100px" class="panel">2</Panel>
        <PanelResizer class="panel-resizer" size="10px" />
        <Panel
          min="100px"
          collapsible
          collapsedSize="60px"
          defaultCollapsed
          class="panel"
        >
          3
        </Panel>
      </PanelGroup>

      <div>
        <button
          type="button"
          @click="() => alert('Sizes:', groupRef?.getPixelSizes())"
        >
          Get pixel sizes
        </button>
        <button
          type="button"
          @click="() => alert('Sizes:', groupRef?.getPercentageSizes())"
        >
          Get percentage sizes
        </button>
        <button
          type="button"
          @click="() => groupRef?.setSizes(['200px', '10px', '50%', '10px', '150px'])"
        >
          Override sizes
        </button>
      </div>

      <div>
        <button type="button" @click="() => panelRef?.collapse()">
          Collapse
        </button>
        <button
          type="button"
          @click="() => alert('Collapsed: ' + panelRef?.isCollapsed())"
        >
          Is Collapsed?
        </button>
        <button type="button" @click="() => panelRef?.expand()">
          Expand
        </button>
        <button
          type="button"
          @click="() => alert('Expanded: ' + panelRef?.isExpanded())"
        >
          Is Expanded?
        </button>
        <button type="button" @click="() => alert('Id: ' + panelRef?.getId())">
          Get Id
        </button>
        <button
          type="button"
          @click="() => alert('Size: ' + panelRef?.getPixelSize())"
        >
          Get Pixel Size
        </button>
        <button
          type="button"
          @click="() => alert('Percentage: ' + panelRef?.getPercentageSize())"
        >
          Get Percentage Size
        </button>
        <button type="button" @click="() => panelRef?.setSize('30px')">
          Set size to 100px
        </button>
        <button type="button" @click="() => panelRef?.setSize('50%')">
          Set size to 50%
        </button>
      </div>
    `,
  }),
};

export const ConditionalPanel: Story = {
  render: () => ({
    components: { PanelGroup, Panel, PanelResizer },
    setup() {
      const isExpanded = ref(false);
      return { isExpanded };
    },
    template: dedent/*html*/ `
      <PanelGroup class="panel-group">
        <Panel id="panel-1" min="100px" collapsible collapsedSize="60px" class="panel">
          <div>1</div>
        </Panel>
        <PanelResizer class="panel-resizer" id="handle-1" size="10px" />
        <Panel id="panel-2" min="100px" class="panel">
          <div>2</div>
        </Panel>

        <template v-if="isExpanded">
          <PanelResizer class="panel-resizer" id="handle-2" size="10px" />
          <Panel id="panel-3" min="100px" class="panel">
            3
            <button type="button" @click="isExpanded = false">
              Close
            </button>
          </Panel>
        </template>
      </PanelGroup>

      <button type="button" @click="isExpanded = true">
        Expand
      </button>
    `,
  }),
};

export const ConditionalPanelComplex: Story = {
  render: () => ({
    components: { PanelGroup, Panel, PanelResizer },
    setup() {
      const isExpanded = ref(false);
      return { isExpanded };
    },
    template: dedent/*html*/ `
      <PanelGroup class="panel-group">
        <Panel id="panel-1" min="100px" collapsible collapsedSize="60px" class="panel">
          <div>1</div>
        </Panel>
        <PanelResizer id="handle-1" class="panel-resizer" size="10px" />
        <Panel id="panel-2" min="100px" class="panel">
          <div>2</div>
        </Panel>
        <PanelResizer id="handle-2" class="panel-resizer" size="10px" />
        <Panel id="panel-3" min="100px" class="panel">
          <div>3</div>
        </Panel>
        <template v-if="isExpanded">
          <PanelResizer id="handle-3" class="panel-resizer" size="10px" />
          <Panel id="panel-4" min="100px" class="panel">
            expanded
            <button type="button" @click="isExpanded = false">
              Close
            </button>
          </Panel>
        </template>
        <PanelResizer id="handle-4" class="panel-resizer" size="10px" />
        <Panel id="panel-5" min="200px"
          min="200px"
          collapsible
          collapsedSize="60px"
          defaultCollapsed
          id="panel-5"
        >
          <div>4</div>
        </Panel>
      </PanelGroup>
      <button type="button" @click="isExpanded = true">
        Expand
      </button>
    `,
  }),
};

export const WithDefaultWidth: Story = {
  render: () => ({
    components: { PanelGroup, Panel, PanelResizer },
    template: dedent/*html*/ `
      <PanelGroup :style="{ height: '400px' }" class="panel-group">
        <Panel :style="{ 'background-color': '#333366' }" class="panel" />
        <PanelResizer  size="3px" />
        <Panel
          default="100px"
          min="100px"
          max="400px"
          :style="{ 'background-color': '#ff3366' }"
          class="panel"
        />
      </PanelGroup>
    `,
  }),
};

export const StaticAtRest: Story = {
  render: () => ({
    components: { PanelGroup, Panel, PanelResizer },
    template: dedent/*html*/ `
      <PanelGroup :style="{ height: '200px' }" class="panel-group">
        <Panel min="100px" max="300px" isStaticAtRest class="panel">
          Panel 1
        </Panel>
        <PanelResizer class="panel-resizer" size="10px" />
        <Panel min="100px" class="panel">Panel 2</Panel>
        <PanelResizer class="panel-resizer" size="10px" />
        <Panel min="100px" class="panel">Panel 3</Panel>
      </PanelGroup>
    `,
  }),
};
