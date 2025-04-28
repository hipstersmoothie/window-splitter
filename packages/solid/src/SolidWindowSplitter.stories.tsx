import type { Meta } from "storybook-solidjs";
import { spring } from "framer-motion";

import {
  PanelGroup,
  PanelResizer,
  Panel,
  PanelGroupProps,
  PanelProps,
  PanelResizerProps,
} from "./SolidWIndowSplitter.jsx";
import { createSignal, Ref, Show } from "solid-js";
import { PanelHandle } from "@window-splitter/interface";
import { PanelGroupHandle } from "@window-splitter/interface";
import { GroupMachineContextValue } from "@window-splitter/state";

const meta = {
  title: "Components/Solid",
  component: PanelGroup,
} satisfies Meta<typeof PanelGroup>;

export default meta;

function StyledPanelGroup(props: PanelGroupProps) {
  return (
    <PanelGroup
      {...props}
      style={{
        border: "1px solid rgba(0, 0, 0, 0.3)",
        background: "rgba(0, 0, 0, 0.1)",
        "border-radius": "12px",
        "box-sizing": "border-box",
        ...props.style,
      }}
    />
  );
}

function StyledPanel({ children, ...props }: PanelProps) {
  return (
    <Panel
      style={{
        overflow: "hidden",
      }}
      {...props}
    >
      <div
        style={{
          height: "100%",
          width: "100%",
          padding: "20px",
          display: "flex",
          "align-items": "center",
          "justify-content": "center",
          overflow: "hidden",
          "box-sizing": "border-box",
        }}
      >
        {children}
      </div>
    </Panel>
  );
}

function StyledResizer(props: PanelResizerProps) {
  return <PanelResizer size="10px" style={{ background: "red" }} {...props} />;
}

export function Simple({ handle }: { handle?: Ref<PanelGroupHandle> }) {
  return (
    <StyledPanelGroup handle={handle} style={{ height: "200px" }}>
      <StyledPanel>Panel 1</StyledPanel>
      <StyledResizer />
      <StyledPanel min="100px">Panel 2</StyledPanel>
    </StyledPanelGroup>
  );
}

export function Autosave({
  handle,
  snapshot,
}: {
  handle?: Ref<PanelGroupHandle>;
  snapshot?: GroupMachineContextValue;
}) {
  return (
    <StyledPanelGroup
      autosaveId="autosave-example-solid"
      handle={handle}
      snapshot={snapshot}
    >
      <StyledPanel id="1">Panel 1</StyledPanel>
      <StyledResizer id="resizer" />
      <StyledPanel id="2">Panel 2</StyledPanel>
    </StyledPanelGroup>
  );
}

export function AutosaveCookie({
  handle,
  snapshot,
}: {
  handle?: Ref<PanelGroupHandle>;
  snapshot?: GroupMachineContextValue;
}) {
  return (
    <StyledPanelGroup
      autosaveId="autosave-cookie-solid"
      autosaveStrategy="cookie"
      style={{ height: "200px" }}
      handle={handle}
      snapshot={snapshot}
    >
      <StyledPanel id="1">Panel 1</StyledPanel>
      <StyledResizer id="resizer1" size="10px" style={{ background: "red" }} />
      <StyledPanel id="2">Panel 2</StyledPanel>
    </StyledPanelGroup>
  );
}

export function AutosaveCollapsible({
  handle,
  onCollapseChange,
}: {
  handle?: Ref<PanelGroupHandle>;
  onCollapseChange?: (isCollapsed: boolean) => void;
}) {
  return (
    <StyledPanelGroup autosaveId="autosave-example-2" handle={handle}>
      <StyledPanel
        id="1"
        collapsible
        collapsedSize="100px"
        min="140px"
        onCollapseChange={onCollapseChange}
      >
        Collapsible
      </StyledPanel>
      <StyledResizer id="resizer" />
      <StyledPanel id="2">Panel 2</StyledPanel>
    </StyledPanelGroup>
  );
}

// TODO: fix this
export function DynamicConstraints({
  handle,
}: {
  handle?: Ref<PanelGroupHandle>;
}) {
  const [customOn, setCustomOn] = createSignal(false);

  return (
    <>
      <StyledPanelGroup handle={handle}>
        <StyledPanel default="100px" min={customOn() ? "200px" : "100px"}>
          <div>Panel 1</div>
        </StyledPanel>
        <StyledResizer />
        <StyledPanel min="100px">
          <div>Panel 2</div>
        </StyledPanel>
        <StyledResizer />
        <StyledPanel
          min={customOn() ? "100px" : "400px"}
          max={customOn() ? "300px" : "700px"}
        >
          <div>Panel 3</div>
        </StyledPanel>
      </StyledPanelGroup>
      <button type="button" onClick={() => setCustomOn(!customOn)}>
        Toggle Custom
      </button>
    </>
  );
}

export function SimpleMin() {
  return (
    <StyledPanelGroup>
      <StyledPanel min="100px">
        <div>Panel 1</div>
      </StyledPanel>
      <StyledResizer />
      <StyledPanel min="100px">
        <div>Panel 2</div>
      </StyledPanel>
      <StyledResizer />
      <StyledPanel min="100px">
        <div>Panel 3</div>
      </StyledPanel>
    </StyledPanelGroup>
  );
}

export function SimpleMinMax() {
  return (
    <StyledPanelGroup>
      <StyledPanel min="100px" max="200px">
        <div>Panel 1</div>
      </StyledPanel>
      <StyledResizer />
      <StyledPanel min="100px">
        <div>Panel 2</div>
      </StyledPanel>
      <StyledResizer size="20px" />
      <StyledPanel min="100px">
        <div>Panel 3</div>
      </StyledPanel>
    </StyledPanelGroup>
  );
}

export function SimpleConstraints() {
  return (
    <StyledPanelGroup>
      <StyledPanel min="100px" max="50%">
        <div>Panel 1</div>
      </StyledPanel>
      <StyledResizer />
      <StyledPanel>
        <div>Panel 2</div>
      </StyledPanel>
    </StyledPanelGroup>
  );
}

export function HorizontalLayout() {
  return (
    <StyledPanelGroup orientation="horizontal">
      <StyledPanel default="30%" min="20%">
        left
      </StyledPanel>
      <StyledResizer />
      <StyledPanel min="20%">middle</StyledPanel>
      <StyledResizer />
      <StyledPanel default="30%" min="20%">
        right
      </StyledPanel>
    </StyledPanelGroup>
  );
}

export function VerticalLayout({ handle }: { handle?: Ref<PanelGroupHandle> }) {
  return (
    <StyledPanelGroup
      orientation="vertical"
      style={{ height: "322px" }}
      handle={handle}
    >
      <StyledPanel default="30%" min="20%">
        top
      </StyledPanel>
      <StyledResizer />
      <StyledPanel min="20%">middle</StyledPanel>
      <StyledResizer />
      <StyledPanel default="30%" min="20%">
        bottom
      </StyledPanel>
    </StyledPanelGroup>
  );
}

export function VerticalLayout2() {
  return (
    <StyledPanelGroup
      orientation="vertical"
      style={{ height: "calc(100vh - 100px)" }}
    >
      <StyledPanel default="200px" min="200px">
        top
      </StyledPanel>
      <StyledResizer />
      <StyledPanel
        min="200px"
        collapsedSize="60px"
        defaultCollapsed
        collapsible
      >
        middle
      </StyledPanel>
    </StyledPanelGroup>
  );
}

export function NestedGroups() {
  return (
    <PanelGroup
      orientation="horizontal"
      style={{
        border: "1px solid rgba(0, 0, 0, 0.3)",
        "border-radius": "12px",
        height: "400px",
      }}
    >
      <Panel min="10%">1</Panel>
      <StyledResizer />
      <Panel min="10%">
        <PanelGroup orientation="vertical">
          <Panel min="10%">2-1</Panel>
          <StyledResizer />
          <Panel min="10%">
            <PanelGroup orientation="horizontal">
              <Panel min="20%">2-2-1</Panel>
              <StyledResizer />
              <Panel min="20%">2-2-2</Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </Panel>
      <StyledResizer />
      <Panel min="10%">3</Panel>
    </PanelGroup>
  );
}

export function WithOverflow() {
  return (
    <StyledPanelGroup style={{ height: "400px" }}>
      <Panel min="200px">
        <div
          style={{
            overflow: "auto",
            padding: "40px",
            height: "100%",
            "box-sizing": "border-box",
          }}
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
      <StyledResizer />
      <Panel min="200px">
        <div
          style={{
            overflow: "auto",
            padding: "40px",
            height: "100%",
            "box-sizing": "border-box",
          }}
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
    </StyledPanelGroup>
  );
}

export function Collapsible({
  handle,
  rightPanelHandle,
  leftPanelHandle,
}: {
  handle?: Ref<PanelGroupHandle>;
  rightPanelHandle?: Ref<PanelHandle>;
  leftPanelHandle?: Ref<PanelHandle>;
}) {
  const [collapsed, setCollapsed] = createSignal(true);

  return (
    <StyledPanelGroup handle={handle}>
      <StyledPanel
        handle={leftPanelHandle}
        min="100px"
        collapsible
        collapsedSize="60px"
        style={{ border: "10px solid green", "box-sizing": "border-box" }}
        onCollapseChange={(isCollapsed) => {
          console.log("COLLAPSE PASSIVE", isCollapsed);
        }}
      >
        <div>1</div>
      </StyledPanel>
      <StyledResizer />
      <StyledPanel min="100px">
        <div>2</div>
      </StyledPanel>
      <StyledResizer id="resizer-2" />
      <StyledPanel
        handle={rightPanelHandle}
        min="100px"
        collapsible
        collapsedSize="60px"
        collapseAnimation={{ easing: "bounce", duration: 1000 }}
        style={{ border: "10px solid blue", "box-sizing": "border-box" }}
        collapsed={collapsed}
        onCollapseChange={setCollapsed}
      >
        <div>3</div>
      </StyledPanel>
    </StyledPanelGroup>
  );
}

export function CustomCollapseAnimation() {
  const springFn = spring({
    keyframes: [0, 1],
    velocity: 1,
    stiffness: 100,
    damping: 10,
    mass: 1.0,
  });

  return (
    <StyledPanelGroup>
      <StyledPanel
        min="100px"
        collapsible
        collapsedSize="60px"
        style={{ border: "10px solid green", "box-sizing": "border-box" }}
      >
        1
      </StyledPanel>
      <StyledResizer />
      <StyledPanel min="100px">2</StyledPanel>
      <StyledResizer />
      <StyledPanel
        style={{ border: "10px solid blue", "box-sizing": "border-box" }}
        min="100px"
        collapsible
        collapsedSize="60px"
        defaultCollapsed
        collapseAnimation={{
          easing: (t) => springFn.next(t * 1000).value,
          duration: 1000,
        }}
      >
        3
      </StyledPanel>
    </StyledPanelGroup>
  );
}

export function ImperativePanel() {
  let groupRef: PanelGroupHandle | undefined;
  let panelRef: PanelHandle | undefined;

  return (
    <>
      <StyledPanelGroup handle={(v) => (groupRef = v)}>
        <StyledPanel
          handle={(v) => (panelRef = v)}
          min="100px"
          collapsible
          collapsedSize="60px"
        >
          1
        </StyledPanel>
        <StyledResizer />
        <StyledPanel min="100px">2</StyledPanel>
        <StyledResizer />
        <StyledPanel
          min="100px"
          collapsible
          collapsedSize="60px"
          defaultCollapsed
        >
          3
        </StyledPanel>
      </StyledPanelGroup>

      <div>
        <button
          type="button"
          onClick={() => alert(`Sizes: ${groupRef?.getPixelSizes()}`)}
        >
          Get pixel sizes
        </button>
        <button
          type="button"
          onClick={() => alert(`Sizes: ${groupRef?.getPercentageSizes()}`)}
        >
          Get percent sizes
        </button>
        <button
          type="button"
          onClick={() =>
            groupRef?.setSizes(["200px", "10px", "50%", "10px", "150px"])
          }
        >
          Override sizes
        </button>
      </div>

      <div>
        <button type="button" onClick={() => panelRef?.collapse()}>
          Collapse
        </button>
        <button
          type="button"
          onClick={() => alert(`Collapsed: ${panelRef?.isCollapsed()}`)}
        >
          Is Collapsed?
        </button>
        <button type="button" onClick={() => panelRef?.expand()}>
          Expand
        </button>
        <button
          type="button"
          onClick={() => alert(`Expanded: ${panelRef?.isExpanded()}`)}
        >
          Is Expanded?
        </button>
        <button type="button" onClick={() => alert(`Id: ${panelRef?.getId()}`)}>
          Get Id
        </button>
        <button
          type="button"
          onClick={() => alert(`Size: ${panelRef?.getPixelSize()}`)}
        >
          Get Pixel Size
        </button>
        <button
          type="button"
          onClick={() => alert(`Percentage: ${panelRef?.getPercentageSize()}`)}
        >
          Get Percentage Size
        </button>
        <button type="button" onClick={() => panelRef?.setSize("30px")}>
          Set size to 100px
        </button>
        <button type="button" onClick={() => panelRef?.setSize("50%")}>
          Set size to 50%
        </button>
      </div>
    </>
  );
}

export function ConditionalPanel({
  handle,
}: {
  handle?: Ref<PanelGroupHandle>;
}) {
  const [isExpanded, setIsExpanded] = createSignal(false);

  return (
    <>
      <StyledPanelGroup handle={handle}>
        <StyledPanel id="panel-1" min="100px" collapsible collapsedSize="60px">
          <div>1</div>
        </StyledPanel>
        <StyledResizer id="handle-1" />
        <StyledPanel id="panel-2" min="100px">
          <div>2</div>
        </StyledPanel>

        {isExpanded() && (
          <>
            <StyledResizer id="handle-2" />
            <StyledPanel id="panel-3" min="100px">
              3
              <button type="button" onClick={() => setIsExpanded(false)}>
                Close
              </button>
            </StyledPanel>
          </>
        )}
      </StyledPanelGroup>

      <button type="button" onClick={() => setIsExpanded(true)}>
        Expand
      </button>
    </>
  );
}

export function ConditionalPanelComplex() {
  const [isExpanded, setIsExpanded] = createSignal(false);

  return (
    <>
      <StyledPanelGroup>
        <StyledPanel id="panel-1" min="100px" collapsible collapsedSize="60px">
          <div>1</div>
        </StyledPanel>
        <StyledResizer id="handle-1" />
        <StyledPanel id="panel-2" min="100px">
          <div>2</div>
        </StyledPanel>
        <StyledResizer id="handle-2" />
        <StyledPanel id="panel-3" min="100px">
          <div>3</div>
        </StyledPanel>
        <Show when={isExpanded()}>
          <StyledResizer id="handle-3" />
          <StyledPanel id="panel-4" min="100px">
            expanded
            <button type="button" onClick={() => setIsExpanded(false)}>
              Close
            </button>
          </StyledPanel>
        </Show>
        <StyledResizer id="handle-4" />
        <StyledPanel
          min="200px"
          collapsible
          collapsedSize="60px"
          defaultCollapsed
          id="panel-5"
        >
          <div>4</div>
        </StyledPanel>
      </StyledPanelGroup>
      <button type="button" onClick={() => setIsExpanded(true)}>
        Expand
      </button>
    </>
  );
}

export function WithDefaultWidth() {
  return (
    <PanelGroup style={{ height: "400px" }}>
      <Panel style={{ "background-color": "#333366" }} />
      <PanelResizer size="3px" />
      <Panel
        default="100px"
        min="100px"
        max="400px"
        style={{ "background-color": "#ff3366" }}
      />
    </PanelGroup>
  );
}

export function StaticAtRest() {
  return (
    <StyledPanelGroup style={{ height: "200px" }}>
      <StyledPanel min="100px" max="300px" isStaticAtRest>
        Panel 1
      </StyledPanel>
      <StyledResizer />
      <StyledPanel min="100px">Panel 2</StyledPanel>
      <StyledResizer />
      <StyledPanel min="100px">Panel 3</StyledPanel>
    </StyledPanelGroup>
  );
}
