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
import { createContext } from "wc-context";
import { withContext } from "wc-context/lit.js";
import { html, LitElement, PropertyValues } from "lit";
import { ContextConsumer } from "wc-context/controllers.js";
import { property } from "lit/decorators.js";

import "wc-context/context-provider.js";

import {
  getPanelDomAttributes,
  getPanelResizerDomAttributes,
  measureGroupChildren,
  move,
  SharedPanelGroupProps,
  SharedPanelProps,
} from "@window-splitter/interface";

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

export class WindowSplitter extends withContext(LitElement) {
  static properties = {
    send: { type: Function, providedContext: "send" },
    context: { type: Object, providedContext: "context" },
  };

  private observer: ResizeObserver;
  private cleanupChildrenObserver: () => void;
  private groupId: string;
  private context: GroupMachineContextValue;
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
        this.measureChildren();
      }
    });

    this.observer.observe(this.renderRoot.querySelector("div")!);
  }

  private measureChildren() {
    this.cleanupChildrenObserver = measureGroupChildren(
      this.groupId,
      (childrenSizes) =>
        this.send({ type: "setActualItemsSize", childrenSizes })
    );
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
      <context-provider
        id=${`${this.groupId}-context`}
        context="context"
        value=${this.context}
      >
        <context-provider
          id=${`${this.groupId}-send`}
          context="send"
          value=${this.send}
        >
          <div style="display: grid;height: 100%;${template}">
            <slot></slot>
          </div>
        </context-provider>
      </context-provider>
    `;
  }
}

customElements.define("window-splitter", WindowSplitter);

export class Panel extends withContext(LitElement) {
  static observedContexts = ["send"];

  public onCollapseChange?: (newCollapsed: boolean, el: Panel) => void;
  public onResize?: OnResizeCallback;
  public collapseAnimation?: SharedPanelProps<boolean>["collapseAnimation"];
  @property({ type: Boolean, reflect: true })
  collapsed?: boolean;

  contextConsumer = new ContextConsumer<GroupMachineContextValue>(
    this,
    "context",
    () => updateAttributes(this, this.getAttributes())
  );

  id: string;

  private send: SendFn;

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
    return this.contextConsumer.value.items.find(
      (item) => item.id === this.id
    ) as PanelData | undefined;
  }

  getAttributes() {
    return {
      ...getPanelDomAttributes({
        groupId: this.contextConsumer.value.groupId,
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

    if (!this.getPanelData()) {
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

export class PanelResizer extends withContext(LitElement) {
  static observedContexts = ["send"];

  contextConsumer = new ContextConsumer<GroupMachineContextValue>(
    this,
    "context",
    () => updateAttributes(this, this.getAttributes())
  );

  private send: SendFn;

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
    return this.contextConsumer.value.items.find(
      (item) => item.id === this.id
    ) as PanelHandleData | undefined;
  }

  private getAttributes() {
    const handleIndex = this.contextConsumer.value.items.findIndex(
      (item) => item.id === this.id
    );
    const panelBeforeHandle = isPanelData(
      this.contextConsumer.value.items[handleIndex - 1]
    )
      ? (this.contextConsumer.value.items[handleIndex - 1] as
          | PanelData
          | undefined)
      : undefined;
    const handleData = this.getHandleData() || this.initPanelResizer();

    return {
      // ...attrs, TODO other props
      ...getPanelResizerDomAttributes({
        groupId: this.contextConsumer.value.groupId,
        id: this.id,
        orientation: this.contextConsumer.value.orientation || "horizontal",
        isDragging: this.contextConsumer.value.activeDragHandleId === this.id,
        activeDragHandleId: this.contextConsumer.value.activeDragHandleId,
        disabled: false,
        // disabled: disabled, // TODO
        controlsId: panelBeforeHandle?.id,
        min: panelBeforeHandle?.min,
        max: panelBeforeHandle?.max,
        currentValue: panelBeforeHandle?.currentValue,
        groupSize: getGroupSize(this.contextConsumer.value),
      }),
      tabIndex: 0,
      // tabIndex: disabled ? -1 : 0,
      style: {
        cursor: this.contextConsumer.value
          ? getCursor(this.contextConsumer.value)
          : undefined,
        width:
          this.contextConsumer.value.orientation === "horizontal"
            ? `${handleData.size.value.toNumber()}px`
            : "100%",
        height:
          this.contextConsumer.value.orientation === "vertical"
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
        document.body.style.cursor =
          getCursor(this.contextConsumer.value) || "auto";
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
        this.contextConsumer.value,
        this.id
      );

      console.log("collapsiblePanel", collapsiblePanel, e);

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

    if (!this.getHandleData()) {
      this.send({ type: "registerPanelHandle", data: this.initPanelResizer() });
    }
  }

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define("window-panel-resizer", PanelResizer);
