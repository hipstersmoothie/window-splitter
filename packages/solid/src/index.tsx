import {
  buildTemplate,
  Constraints,
  getCollapsiblePanelForHandleId,
  getCursor,
  getGroupSize,
  getUnitPercentageValue,
  groupMachine,
  GroupMachineContextValue,
  initializePanel,
  isPanelData,
  PanelData,
  parseUnit,
  PixelUnit,
  prepareSnapshot,
  Rect,
  SendFn,
  Unit,
} from "@window-splitter/state";
import {
  Accessor,
  children,
  createSignal,
  createUniqueId,
  JSX,
  mergeProps,
  onMount,
} from "solid-js";
import { move } from "./move";
import {
  GroupMachineProvider,
  usePrerenderContext,
  useMachineActor,
  useGroupId,
  useMachineState,
} from "./context";

function measureGroupChildren(
  groupId: string,
  cb: (childrenSizes: Record<string, Rect>) => void
) {
  const childrenObserver = new ResizeObserver((childrenEntries) => {
    const childrenSizes: Record<string, { width: number; height: number }> = {};

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

    cb(childrenSizes);
  });

  const c = document.querySelectorAll(`[data-splitter-group-id="${groupId}"]`);

  for (const child of c) {
    childrenObserver.observe(child);
  }

  return () => {
    childrenObserver.disconnect();
  };
}

export interface PanelGroupProps
  extends JSX.HTMLAttributes<HTMLDivElement>,
    Partial<
      Pick<GroupMachineContextValue, "orientation" | "autosaveStrategy">
    > {
  /** Persisted state to initialized the machine with */
  snapshot?: GroupMachineContextValue;
  /** An id to use for autosaving the layout */
  autosaveId?: string;
}

export function PanelGroup(props: PanelGroupProps) {
  const {
    orientation = "horizontal",
    autosaveStrategy = "localStorage",
    autosaveId,
    snapshot: snapshotProp,
    ...attrs
  } = props;

  let snapshot: GroupMachineContextValue | undefined;

  if (snapshotProp) {
    snapshot = snapshotProp;
  } else if (
    typeof window !== "undefined" &&
    autosaveId &&
    autosaveStrategy === "localStorage"
  ) {
    const localSnapshot = localStorage.getItem(autosaveId);

    if (localSnapshot) {
      snapshot = JSON.parse(localSnapshot) as GroupMachineContextValue;
    }
  }

  const defaultGroupId = `panel-group-${createUniqueId()}`;
  const groupId = props.autosaveId || props.id || defaultGroupId;
  const [currentValue, setCurrentValue] = createSignal<
    GroupMachineContextValue | undefined
  >();

  const [intiialValue, send] = groupMachine(
    {
      orientation,
      groupId,
      autosaveStrategy,
      ...(snapshot ? prepareSnapshot(snapshot) : undefined),
    },
    (value) => {
      setCurrentValue({ ...value });
    }
  );

  // Prerender the children with the machine context
  children(() => (
    <GroupMachineProvider
      groupId={groupId}
      send={send}
      state={() => intiialValue}
      prerender
    >
      {props.children}
    </GroupMachineProvider>
  ));

  let elementRef: HTMLDivElement | undefined;

  onMount(() => {
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      send({
        type: "setSize",
        size: entry.contentRect,
      });
    });

    if (elementRef) {
      observer.observe(elementRef);
    }

    return () => observer.disconnect();
  });

  onMount(() => {
    return measureGroupChildren(groupId, (childrenSizes) => {
      send({ type: "setActualItemsSize", childrenSizes });
    });
  });

  return (
    <GroupMachineProvider groupId={groupId} send={send} state={currentValue}>
      <div
        ref={elementRef}
        {...mergeProps(attrs, {
          style: {
            display: "grid",
            "grid-template-columns":
              orientation === "horizontal"
                ? buildTemplate(currentValue() ?? intiialValue)
                : undefined,
            "grid-template-rows":
              orientation === "vertical"
                ? buildTemplate(currentValue() ?? intiialValue)
                : undefined,
            height: "100%",
            // @ts-expect-error TODO: fix this
            ...attrs.style,
          },
        })}
      >
        {props.children}
      </div>
    </GroupMachineProvider>
  );
}

export type OnResizeSize = {
  pixel: number;
  percentage: number;
};

export type OnResizeCallback = (size: OnResizeSize) => void;

export interface PanelProps
  extends Constraints<Unit>,
    Pick<PanelData, "collapseAnimation">,
    Omit<JSX.HTMLAttributes<HTMLDivElement>, "onResize"> {
  collapsed?: boolean;
  onCollapseChange?: (isCollapsed: boolean) => void;
  // TODO handle
  onResize?: OnResizeCallback;
}

export function Panel({
  min,
  max,
  id,
  collapsible,
  collapsed,
  collapsedSize,
  onCollapseChange,
  collapseAnimation,
  onResize,
  defaultCollapsed,
  default: defaultSize,
  isStaticAtRest,
  ...props
}: PanelProps) {
  const panelId = id || createUniqueId();
  const prerender = usePrerenderContext();
  const send = useMachineActor();
  const groupId = useGroupId();
  const state = useMachineState();

  if (send && prerender) {
    const hasRegistered = state?.()?.items.find((i) => i.id === panelId);

    if (!hasRegistered) {
      console.log("registering panel", state?.()?.groupId, panelId);
      send({
        type: "registerPanel",
        data: initializePanel({
          id: panelId,
          min,
          max,
          collapsible,
          collapsed,
          collapsedSize,
          onCollapseChange: { current: onCollapseChange },
          collapseAnimation,
          onResize: { current: onResize },
          defaultCollapsed,
          default: defaultSize,
          isStaticAtRest,
        }),
      });
    }
  }

  const panel = () => {
    const item = state?.()?.items.find((i) => i.id === panelId);
    if (!item) return undefined;
    if (!isPanelData(item)) return undefined;
    return item;
  };

  return (
    <div
      id={panelId}
      data-splitter-group-id={groupId}
      data-splitter-type="panel"
      data-splitter-id={panelId}
      data-collapsed={panel()?.collapsed && panel()?.collapsible}
      {...props}
      style={{
        // @ts-expect-error Don't know how to merge styles
        ...props.style,
        minWidth: 0,
        minHeight: 0,
        overflow: "hidden",
      }}
    />
  );
}

export interface PanelResizerProps
  extends Omit<
    JSX.HTMLAttributes<HTMLDivElement>,
    "onDragStart" | "onDrag" | "onDragEnd"
  > {
  /** If the handle is disabled */
  disabled?: boolean;
  size?: PixelUnit;
  /** Called when the user starts dragging the handle */
  onDragStart?: () => void;
  /** Called when the user drags the handle */
  onDrag?: () => void;
  /** Called when the user stops dragging the handle */
  onDragEnd?: () => void;
}

export function PanelResizer({
  size = "0px",
  id,
  onDragStart,
  onDrag,
  onDragEnd,
  disabled,
  ...props
}: PanelResizerProps) {
  const handleId = id || createUniqueId();
  const isPrerender = usePrerenderContext();
  const send = useMachineActor();
  const state = useMachineState();

  if (isPrerender && send) {
    const hasRegistered = state?.()?.items.find((i) => i.id === handleId);

    if (!hasRegistered) {
      console.log("registering handle", state?.()?.groupId, handleId);
      send({
        type: "registerPanelHandle",
        data: {
          size,
          id: handleId,
        },
      });
    }
  }

  const { moveProps } = move({
    onMoveStart: () => {
      send?.({ type: "dragHandleStart", handleId });
      onDragStart?.();
      document.body.style.cursor = cursor() || "auto";
    },
    onMove: (e) => {
      send?.({ type: "dragHandle", handleId, value: e });
      onDrag?.();
    },
    onMoveEnd: () => {
      send?.({ type: "dragHandleEnd", handleId });
      onDragEnd?.();
      document.body.style.cursor = "auto";
    },
  });

  const itemIndex = () =>
    state?.()?.items.findIndex((item) => item.id === handleId) || -1;
  const activeDragHandleId = () => state?.()?.activeDragHandleId;
  const isDragging = () => activeDragHandleId() === handleId;
  const panelBeforeHandle = () => state?.()?.items[itemIndex() - 1];
  const getCollapsiblePanel = () => {
    const currentState = state?.();
    if (!currentState) return undefined;

    try {
      return getCollapsiblePanelForHandleId(currentState, handleId);
    } catch {
      return undefined;
    }
  };
  const ariaValues = () => {
    const panelBefore = panelBeforeHandle();
    const currentState = state?.();
    if (!panelBefore || !currentState || !isPanelData(panelBefore))
      return undefined;

    return {
      "aria-controls": panelBefore.id,
      "aria-valuemin": getUnitPercentageValue(
        getGroupSize(currentState),
        panelBefore.min
      ),
      "aria-valuemax":
        panelBefore.max === "1fr"
          ? 100
          : getUnitPercentageValue(getGroupSize(currentState), panelBefore.max),
      "aria-valuenow": getUnitPercentageValue(
        getGroupSize(currentState),
        panelBefore.currentValue
      ),
    };
  };

  const cursor = () => {
    if (disabled) return;
    const currentState = state?.();
    if (!currentState) return;
    return getCursor(currentState);
  };
  const dimensions = () => {
    const currentState = state?.();
    if (!currentState) return {};
    const unit = parseUnit(size);
    return currentState.orientation === "horizontal"
      ? { width: `${unit.value.toNumber()}px`, height: "100%" }
      : { height: `${unit.value.toNumber()}px`, width: "100%" };
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const collapsiblePanel = getCollapsiblePanel();

    if (e.key === "Enter" && collapsiblePanel) {
      if (collapsiblePanel.collapsed) {
        send?.({ type: "expandPanel", panelId: collapsiblePanel.id });
      } else {
        send?.({ type: "collapsePanel", panelId: collapsiblePanel.id });
      }
    }
  };

  return (
    <div
      role="separator"
      id={handleId}
      data-splitter-type="handle"
      data-splitter-id={handleId}
      data-handle-orientation={state?.()?.orientation}
      data-state={
        isDragging() ? "dragging" : activeDragHandleId() ? "inactive" : "idle"
      }
      aria-label="Resize Handle"
      aria-disabled={disabled}
      {...mergeProps(
        props,
        disabled ? {} : mergeProps(moveProps, { onKeyDown, tabIndex: 0 }),
        ariaValues(),
        {
          style: {
            cursor: cursor(),
            ...dimensions(),
            // @ts-expect-error Dont know how to merge styles
            ...props.style,
          },
        }
      )}
    />
  );
}
