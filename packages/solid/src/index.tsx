import {
  buildTemplate,
  getCollapsiblePanelForHandleId,
  getCursor,
  getGroupSize,
  getPanelGroupPercentageSizes,
  getPanelGroupPixelSizes,
  getPanelPercentageSize,
  getPanelPixelSize,
  getUnitPercentageValue,
  groupMachine,
  GroupMachineContextValue,
  initializePanel,
  isPanelData,
  parseUnit,
  prepareItems,
  prepareSnapshot,
  Rect,
} from "@window-splitter/state";
import {
  Accessor,
  children,
  createEffect,
  createRenderEffect,
  createSignal,
  createUniqueId,
  JSX,
  mergeProps,
  onCleanup,
  onMount,
  Ref,
} from "solid-js";
import { move } from "./move";
import {
  GroupMachineProvider,
  usePrerenderContext,
  useMachineActor,
  useGroupId,
  useMachineState,
} from "./context";
import {
  PanelGroupHandle,
  SharedPanelGroupProps,
  PanelHandle,
  SharedPanelProps,
  SharedPanelResizerProps,
} from "@window-splitter/interface";

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
    SharedPanelGroupProps {
  /** Imperative handle to control the group */
  handle?: Ref<PanelGroupHandle>;
}

export function PanelGroup(props: PanelGroupProps) {
  const {
    orientation = "horizontal",
    autosaveStrategy = "localStorage",
    autosaveId,
    snapshot: snapshotProp,
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

  const [intiialValue, send, machineState] = groupMachine(
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
  const [isPrerender, setIsPrerender] = createSignal(true);
  children(() => (
    <GroupMachineProvider
      groupId={groupId}
      send={send}
      state={() => intiialValue}
      prerender={isPrerender}
    >
      {props.children}
    </GroupMachineProvider>
  ));
  setIsPrerender(false);

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

  createRefContent(
    () => props.handle,
    () => ({
      getId: () => groupId,
      getPixelSizes: () => {
        const s = currentValue?.();
        if (!s) throw new Error("No state");
        return getPanelGroupPixelSizes(s);
      },
      getPercentageSizes: () => {
        const s = currentValue?.();
        if (!s) throw new Error("No state");
        return getPanelGroupPercentageSizes(s);
      },
      setSizes: (updates) => {
        const context = currentValue?.();
        if (!context) throw new Error("No state");

        for (let index = 0; index < updates.length; index++) {
          const item = context.items[index];
          const update = updates[index];

          if (item && isPanelData(item) && update) {
            send({
              type: "setPanelPixelSize",
              panelId: item.id,
              size: update,
            });
          }
        }
      },
      getTemplate: () => {
        const context = currentValue?.();
        if (!context) throw new Error("No state");
        return buildTemplate({ ...context, items: prepareItems(context) });
      },
      getState: () => (machineState.current === "idle" ? "idle" : "dragging"),
    })
  );

  return (
    <GroupMachineProvider groupId={groupId} send={send} state={currentValue}>
      <div
        ref={elementRef}
        data-panel-group-wrapper
        {...mergeProps(props, {
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
            ...props?.style,
          },
        })}
      >
        {props.children}
      </div>
    </GroupMachineProvider>
  );
}

function createRefContent<T extends Exclude<unknown, () => void>>(
  getRef: () => Ref<T> | undefined,
  createRef: () => T
) {
  createRenderEffect(() => {
    const refProp = getRef();
    if (typeof refProp !== "function") {
      return () => {};
    }
    const refFunc = refProp as (value: T) => void;
    refFunc(createRef());
  });
}

export interface PanelProps
  extends SharedPanelProps<Accessor<boolean | undefined>>,
    Omit<JSX.HTMLAttributes<HTMLDivElement>, "onResize"> {
  /** Imperative handle to control the panel */
  handle?: Ref<PanelHandle>;
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

  const panel = initializePanel({
    id: panelId,
    min,
    max,
    collapsible,
    collapsed: collapsed?.(),
    collapsedSize,
    onCollapseChange: { current: onCollapseChange },
    collapseAnimation,
    onResize: { current: onResize },
    defaultCollapsed,
    default: defaultSize,
    isStaticAtRest,
  });

  let dynamicPanelMounted = false;

  if (send) {
    const hasRegistered = state?.()?.items.find((i) => i.id === panelId);

    if (!hasRegistered) {
      if (prerender()) {
        send({ type: "registerPanel", data: panel });
      } else {
        send({ type: "registerDynamicPanel", data: panel });
        dynamicPanelMounted = true;
      }
    }
  }

  onMount(() => {
    if (dynamicPanelMounted) {
      // get the index of the panel in it's group
      const panelElement = document.getElementById(panelId);

      if (!panelElement) return;

      const groupElement = panelElement.closest(
        `[data-panel-group-wrapper]`
      ) as HTMLDivElement;

      if (groupElement && panelElement) {
        const order = Array.from(groupElement.children).indexOf(panelElement);

        if (typeof order === "number") {
          send?.({
            type: "registerDynamicPanel",
            data: { ...panel, order },
          });
        }
      }
    }
  });

  const panelData = () => {
    const item = state?.()?.items.find((i) => i.id === panelId);
    if (!item) return undefined;
    if (!isPanelData(item)) return undefined;
    return item;
  };

  const collapseIsControlled = panelData?.()?.collapseIsControlled;

  createEffect(() => {
    const currentCollapsed = collapsed?.() || false;

    if (!collapseIsControlled) {
      return;
    }

    if (currentCollapsed) {
      send?.({ type: "collapsePanel", panelId, controlled: true });
    } else {
      send?.({ type: "expandPanel", panelId, controlled: true });
    }
  });

  createRefContent(
    () => props.handle,
    () => ({
      getId: () => panelId,
      collapse: () => {
        if (collapsible) {
          // TODO: setting controlled here might be wrong
          send?.({ type: "collapsePanel", panelId, controlled: true });
        }
      },
      isCollapsed: () => Boolean(collapsible && panelData()?.collapsed),
      expand: () => {
        if (collapsible) {
          send?.({ type: "expandPanel", panelId, controlled: true });
        }
      },
      isExpanded: () => Boolean(collapsible && !panelData()?.collapsed),
      getPixelSize: () => {
        const s = state?.();
        if (!s) throw new Error("No state");
        return getPanelPixelSize(s, panelId);
      },
      setSize: (size) => {
        send?.({ type: "setPanelPixelSize", panelId, size });
      },
      getPercentageSize: () => {
        const s = state?.();
        if (!s) throw new Error("No state");
        return getPanelPercentageSize(s, panelId);
      },
    })
  );

  onCleanup(() => {
    send?.({ type: "unregisterPanel", id: panelId });
  });

  return (
    <div
      id={panelId}
      data-splitter-group-id={groupId}
      data-splitter-type="panel"
      data-splitter-id={panelId}
      data-collapsed={panelData()?.collapsed && panelData()?.collapsible}
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
  extends SharedPanelResizerProps,
    Omit<
      JSX.HTMLAttributes<HTMLDivElement>,
      "onDragStart" | "onDrag" | "onDragEnd"
    > {}

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

  let dynamicPanelHandleMounted = false;

  if (send) {
    const hasRegistered = state?.()?.items.find((i) => i.id === handleId);

    if (!hasRegistered) {
      if (!isPrerender()) {
        dynamicPanelHandleMounted = true;
      }

      send({
        type: "registerPanelHandle",
        data: { size, id: handleId },
      });
    }
  }

  onMount(() => {
    if (dynamicPanelHandleMounted) {
      // get the index of the panel in it's group
      const handleElement = document.getElementById(handleId);

      if (!handleElement) return;

      const groupElement = handleElement.closest(
        `[data-panel-group-wrapper]`
      ) as HTMLDivElement;

      if (groupElement && handleElement) {
        const order = Array.from(groupElement.children).indexOf(handleElement);

        if (typeof order === "number") {
          send?.({
            type: "registerPanelHandle",
            data: {
              size: size,
              id: handleId,
              order,
            },
          });
        }
      }
    }
  });

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

  onCleanup(() => {
    send?.({ type: "unregisterPanelHandle", id: handleId });
  });

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
