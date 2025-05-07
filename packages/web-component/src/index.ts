import {
  groupMachine,
  initializePanel,
  initializePanelHandleData,
  buildTemplate,
  getCursor,
  PanelHandleData,
  SendFn,
  GroupMachineContextValue,
  Unit,
  PixelUnit,
  isPanelData,
  getGroupSize,
  PanelData,
  Orientation,
  prepareSnapshot,
  getCollapsiblePanelForHandleId,
  OnResizeCallback,
} from "@window-splitter/state";
import { html, LitElement, PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";

import {
  getPanelDomAttributes,
  getPanelResizerDomAttributes,
  measureGroupChildren,
  move,
  SharedPanelGroupProps,
  SharedPanelProps,
} from "@window-splitter/interface";
import { consume, createContext, provide } from "@lit/context";

const sendContext = createContext<SendFn>("send");
const contextContext = createContext<GroupMachineContextValue>("context");

let _id = 0;

const getNextId = () => {
  _id++;
  return `${_id}`;
};

function updateAttributes(
  element: HTMLElement,
  attributes:
    | Record<string, string>
    | { style: Record<string, string | number> }
) {
  for (const attr of Object.keys(attributes)) {
    if (attr === "style") {
      for (const style of Object.keys(attributes[attr])) {
        element.style[style] = attributes[attr][style];
      }
    } else {
      element.setAttribute(attr, attributes[attr]);
    }
  }
}

function isBooleanPropValue(value: string | undefined) {
  if (value === "true" || value === "") return true;
  if (value === "false") return false;
  return undefined;
}

createContext("send");
createContext("context");

export class WindowSplitter extends LitElement {
  static properties = {
    send: { type: Function, providedContext: "send" },
    context: { type: Object, providedContext: "context" },
  };

  private observer: ResizeObserver;
  private cleanupChildrenObserver: () => void;
  private groupId: string;

  @provide({ context: contextContext })
  private context: GroupMachineContextValue;
  @provide({ context: sendContext })
  private send: SendFn;

  constructor() {
    super();

    const autosaveId = this.getAttribute("autosaveId");
    const autosaveStrategy =
      (this.getAttribute(
        "autosaveStrategy"
      ) as GroupMachineContextValue["autosaveStrategy"]) || "localStorage";

    this.groupId = this.getAttribute("id") || autosaveId || getNextId();

    let snapshot = this.getAttribute("snapshot");

    if (
      !snapshot &&
      typeof window !== "undefined" &&
      autosaveId &&
      autosaveStrategy === "localStorage"
    ) {
      const localSnapshot = localStorage.getItem(autosaveId);

      if (localSnapshot) {
        snapshot = localSnapshot;
      }
    }

    const [initialState, send, machineState] = groupMachine(
      {
        orientation:
          (this.getAttribute("orientation") as Orientation) || "horizontal",
        groupId: this.groupId,
        autosaveStrategy,
        ...(snapshot ? prepareSnapshot(JSON.parse(snapshot)) : undefined),
      },
      (s) => {
        const oldContext = this.context;
        this.context = s;

        if (oldContext.items.length !== s.items.length) {
          this.cleanupChildrenObserver?.();
          this.measureChildren();
        }

        this.requestUpdate();
      }
    );

    this.send = send;
    this.context = initialState;
  }

  private measureSize() {
    this.observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
        this.send({ type: "setSize", size: entry.contentRect });
        console.log("setSize", entry.contentRect);
        this.measureChildren();
      }
    });

    this.observer.observe(this.renderRoot.querySelector("div")!);
  }

  private measureChildren() {
    const childrenObserver = new ResizeObserver((childrenEntries) => {
      const childrenSizes: Record<string, { width: number; height: number }> =
        {};

      for (const childEntry of childrenEntries) {
        const child = childEntry.target as HTMLElement;
        const childId = child.getAttribute("data-splitter-id");
        const childSize = childEntry.borderBoxSize[0];

        if (childId && childSize) {
          childrenSizes[childId] = {
            width: childSize.inlineSize,
            height: childSize.blockSize,
          };
        }
      }

      this.send({ type: "setActualItemsSize", childrenSizes });
    });

    const slot = this.shadowRoot.querySelector("slot");
    const elements = slot.assignedElements();

    for (const child of elements) {
      childrenObserver.observe(child);
    }

    this.cleanupChildrenObserver = () => {
      childrenObserver.disconnect();
    };
  }

  firstUpdated() {
    if (this.observer) {
      this.observer.disconnect();
    }

    this.measureSize();
    this.setAttribute("data-panel-group-wrapper", "");
    this.setAttribute("id", this.groupId);
  }

  disconnectedCallback() {
    this.observer?.disconnect();
    this.cleanupChildrenObserver?.();
  }

  render() {
    const template =
      this.context.orientation === "horizontal"
        ? `grid-template-columns: ${buildTemplate(this.context)};`
        : `grid-template-rows: ${buildTemplate(this.context)}`;

    return html`
      <div style="display: grid;height: 100%;${template}">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define("window-splitter", WindowSplitter);

export class Panel extends LitElement {
  static observedContexts = ["send"];

  public onCollapseChange?: (newCollapsed: boolean, el: Panel) => void;
  public onResize?: OnResizeCallback;
  public collapseAnimation?: SharedPanelProps<boolean>["collapseAnimation"];
  @property({ type: Boolean, reflect: true })
  collapsed?: boolean;

  @consume({ context: contextContext })
  @property({ attribute: false })
  public context?: GroupMachineContextValue;

  @consume({ context: sendContext })
  @property({ attribute: false })
  public send: SendFn;

  id: string;

  constructor({ id }: { id?: string } = {}) {
    super();

    this.id = `${id || getNextId()}`;
  }

  initPanel() {
    return initializePanel({
      id: this.id,
      min: this.getAttribute("min") as Unit | undefined,
      max: this.getAttribute("max") as Unit | undefined,
      collapsible: isBooleanPropValue(this.getAttribute("collapsible")),
      collapsed: isBooleanPropValue(this.getAttribute("collapsed")),
      collapsedSize: this.getAttribute("collapsedSize") as Unit | undefined,
      onCollapseChange: this.onCollapseChange
        ? { current: (e) => this.onCollapseChange?.(e, this) }
        : undefined,
      collapseAnimation: this.collapseAnimation,
      onResize: this.onResize ? { current: this.onResize } : undefined,
      defaultCollapsed: isBooleanPropValue(
        this.getAttribute("defaultCollapsed")
      ),
      default: this.getAttribute("default") as Unit | undefined,
      isStaticAtRest: isBooleanPropValue(this.getAttribute("isStaticAtRest")),
    });
  }

  getPanelData() {
    return this.context.items.find((item) => item.id === this.id) as
      | PanelData
      | undefined;
  }

  getAttributes() {
    return {
      ...getPanelDomAttributes({
        groupId: this.context.groupId,
        id: this.id,
        collapsible: this.getAttribute("collapsible") === "true",
        collapsed:
          this.getAttribute("collapsed") === "true"
            ? true
            : this.getAttribute("collapsed") === "false"
              ? false
              : undefined,
      }),
      style: {
        minWidth: 0,
        minHeight: 0,
        overflow: "hidden",
      },
    };
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    updateAttributes(this, this.getAttributes());

    if (this.getPanelData()) {
      const groupId = this.context?.groupId;
      if (!groupId) return;

      const groupElement = document.getElementById(groupId);
      if (!groupElement) return;

      const panelElement = document.getElementById(this.id);
      if (!panelElement) return;

      const order = Array.from(groupElement.children).indexOf(panelElement);
      if (typeof order !== "number") return;

      this.send({
        type: "registerDynamicPanel",
        data: { ...this.initPanel(), order },
      });
    } else {
      this.send({ type: "registerPanel", data: this.initPanel() });
    }
  }

  updated(changedProperties: PropertyValues) {
    if (changedProperties.has("collapsed")) {
      const isControlled = this.getPanelData()?.collapseIsControlled;

      if (isControlled) {
        if (this.collapsed) {
          this.send({
            type: "collapsePanel",
            panelId: this.id,
            controlled: true,
          });
        } else {
          this.send({
            type: "expandPanel",
            panelId: this.id,
            controlled: true,
          });
        }
      }
    }
  }

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define("window-panel", Panel);

export class PanelResizer extends LitElement {
  static observedContexts = ["send"];

  @consume({ context: contextContext })
  @property({ attribute: false })
  public context?: GroupMachineContextValue;
  @consume({ context: sendContext })
  @property({ attribute: false })
  public send: SendFn;

  id: string;

  constructor({ id }: { id?: string } = {}) {
    super();

    this.id = `${id || getNextId()}`;
  }

  initPanelResizer() {
    return initializePanelHandleData({
      id: this.id,
      size: (this.getAttribute("size") as PixelUnit | undefined) || "0px",
    });
  }

  getHandleData() {
    return this.context?.items.find((item) => item.id === this.id) as
      | PanelHandleData
      | undefined;
  }

  private getAttributes() {
    console.log("getAttributes", this.context);
    const handleIndex = this.context?.items.findIndex(
      (item) => item.id === this.id
    );
    const panelBeforeHandle = isPanelData(this.context?.items[handleIndex - 1])
      ? (this.context?.items[handleIndex - 1] as PanelData | undefined)
      : undefined;
    const handleData = this.getHandleData() || this.initPanelResizer();

    return {
      // ...attrs, TODO other props
      ...getPanelResizerDomAttributes({
        groupId: this.context?.groupId,
        id: this.id,
        orientation: this.context?.orientation || "horizontal",
        isDragging: this.context?.activeDragHandleId === this.id,
        activeDragHandleId: this.context?.activeDragHandleId,
        disabled: false,
        // disabled: disabled, // TODO
        controlsId: panelBeforeHandle?.id,
        min: panelBeforeHandle?.min,
        max: panelBeforeHandle?.max,
        currentValue: panelBeforeHandle?.currentValue,
        groupSize: getGroupSize(this.context),
      }),
      tabIndex: 0,
      // tabIndex: disabled ? -1 : 0,
      style: {
        cursor: this.context ? getCursor(this.context) : undefined,
        width:
          this.context?.orientation === "horizontal"
            ? `${handleData.size.value.toNumber()}px`
            : "100%",
        height:
          this.context?.orientation === "vertical"
            ? `${handleData.size.value.toNumber()}px`
            : "100%",
      },
    };
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    const { moveProps } = move({
      onMoveStart: () => {
        this.send({
          type: "dragHandleStart",
          handleId: this.getHandleData().id,
        });
        // onDragStart?.();
        document.body.style.cursor = getCursor(this.context) || "auto";
      },
      onMove: (e) => {
        this.send({
          type: "dragHandle",
          handleId: this.getHandleData().id,
          value: e,
        });
        // onDrag?.();
      },
      onMoveEnd: () => {
        this.send({ type: "dragHandleEnd", handleId: this.getHandleData().id });
        // onDragEnd?.();
        document.body.style.cursor = "auto";
      },
    });

    this.addEventListener("pointerdown", (e) => {
      // if (disabled) return; // TODO
      moveProps.onPointerDown(e);
    });
    this.addEventListener("keydown", (e) => {
      moveProps.onKeyDown(e);

      const collapsiblePanel = getCollapsiblePanelForHandleId(
        this.context,
        this.id
      );

      if (e.key === "Enter" && collapsiblePanel) {
        if (collapsiblePanel.collapsed) {
          console.log("expandPanel", collapsiblePanel.id);
          this.send({ type: "expandPanel", panelId: collapsiblePanel.id });
        } else {
          console.log("collapsePanel", collapsiblePanel.id);
          this.send({ type: "collapsePanel", panelId: collapsiblePanel.id });
        }
      }
    });

    updateAttributes(this, this.getAttributes());

    if (this.getHandleData()) {
      const groupId = this.context?.groupId;
      if (!groupId) return;

      const groupElement = document.getElementById(groupId);
      if (!groupElement) return;

      const handleEl = document.getElementById(this.id);
      if (!handleEl) return;

      const order = Array.from(groupElement.children).indexOf(handleEl);
      if (typeof order !== "number") return;

      this.send({
        type: "registerPanelHandle",
        data: { ...this.initPanelResizer(), order },
      });
    } else {
      this.send({ type: "registerPanelHandle", data: this.initPanelResizer() });
    }
  }

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define("window-panel-resizer", PanelResizer);
