import {
  buildTemplate,
  getCollapsiblePanelForHandleId,
  getCursor,
  getGroupSize,
  getPanelGroupPercentageSizes,
  getPanelGroupPixelSizes,
  getPanelPercentageSize,
  getPanelPixelSize,
  groupMachine,
  GroupMachineContextValue,
  initializePanel,
  isPanelData,
  parseUnit,
  prepareItems,
  prepareSnapshot,
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
import {
  GroupMachineProvider,
  usePrerenderContext,
  useMachineActor,
  useGroupId,
  useMachineState,
  useInitialPrerenderContext,
} from "./context.jsx";
import {
  PanelGroupHandle,
  SharedPanelGroupProps,
  PanelHandle,
  SharedPanelProps,
  SharedPanelResizerProps,
  measureGroupChildren,
  getPanelDomAttributes,
  getPanelResizerDomAttributes,
  move,
} from "@window-splitter/interface";

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
  const [isInitialPrerender, setIsInitialPrerender] = createSignal(true);
  children(() => (
    <GroupMachineProvider
      groupId={groupId}
      send={send}
      state={() => intiialValue}
      prerender
      initialPrerender={isInitialPrerender}
    >
      {props.children}
    </GroupMachineProvider>
  ));
  setIsInitialPrerender(false);

  let elementRef: HTMLDivElement | undefined;

  // Measure group size
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

  // Measure children size
  onMount(() => {
    // TODO unmount not working
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

  const getContext = () => {
    const context = currentValue?.() || intiialValue;
    if (!context) throw new Error("No state");
    return context;
  };
  const getTemplate = () => {
    const context = getContext();
    const tempalte = buildTemplate(context);
    return tempalte;
  };

  return (
    <GroupMachineProvider groupId={groupId} send={send} state={getContext}>
      <div
        ref={elementRef}
        data-panel-group-wrapper
        {...mergeProps(props, {
          style: {
            display: "grid",
            "grid-template-columns":
              orientation === "horizontal" ? getTemplate() : undefined,
            "grid-template-rows":
              orientation === "vertical" ? getTemplate() : undefined,
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
  const isPrerender = usePrerenderContext();
  const isInitialPrerender = useInitialPrerenderContext();
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
      if (isInitialPrerender()) {
        send({ type: "registerPanel", data: panel });
      } else if (!isPrerender) {
        dynamicPanelMounted = true;
      }
    } else {
      send?.({
        type: "rebindPanelCallbacks",
        data: {
          id: panelId,
          onCollapseChange: { current: onCollapseChange },
          onResize: { current: onResize },
        },
      });
    }
  }

  onMount(() => {
    if (!dynamicPanelMounted) return;

    // get the index of the panel in it's group
    const panelElement = document.getElementById(panelId);

    if (!panelElement) return;

    const groupElement = panelElement.closest(
      `[data-panel-group-wrapper]`
    ) as HTMLDivElement;

    if (!groupElement || !panelElement) return;

    const order = Array.from(groupElement.children).indexOf(panelElement);

    if (typeof order !== "number") return;

    send?.({
      type: "registerDynamicPanel",
      data: { ...panel, order },
    });
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

  const domAttributes = () => {
    const currentPanel = panelData();

    return getPanelDomAttributes({
      groupId,
      id: panelId,
      collapsible: currentPanel?.collapsible,
      collapsed: currentPanel?.collapsed,
    });
  };

  return (
    <div
      {...mergeProps(props, domAttributes())}
      style={{
        "min-width": 0,
        "min-height": 0,
        overflow: "hidden",
        // @ts-expect-error Don't know how to merge styles
        ...props.style,
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
  const isInitialPrerender = useInitialPrerenderContext();
  const send = useMachineActor();
  const state = useMachineState();

  let dynamicPanelHandleMounted = false;

  if (send) {
    const hasRegistered = state?.()?.items.find((i) => i.id === handleId);

    if (!hasRegistered) {
      if (isInitialPrerender()) {
        send({
          type: "registerPanelHandle",
          data: { size, id: handleId },
        });
      } else if (!isPrerender) {
        dynamicPanelHandleMounted = true;
      }
    }
  }

  onMount(() => {
    if (!dynamicPanelHandleMounted) return;

    // get the index of the panel in it's group
    const handleElement = document.getElementById(handleId);

    if (!handleElement) return;

    const groupElement = handleElement.closest(
      `[data-panel-group-wrapper]`
    ) as HTMLDivElement;

    if (!groupElement || !handleElement) return;

    const order = Array.from(groupElement.children).indexOf(handleElement);

    if (typeof order !== "number") return;

    send?.({
      type: "registerPanelHandle",
      data: { size: size, id: handleId, order },
    });
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
  const panelAttributes = () => {
    const panelBefore = panelBeforeHandle();
    const currentState = state?.();

    if (!panelBefore || !currentState || !isPanelData(panelBefore))
      return { id: handleId };

    return getPanelResizerDomAttributes({
      groupId: currentState.groupId,
      id: handleId,
      orientation: currentState.orientation,
      isDragging: isDragging(),
      activeDragHandleId: activeDragHandleId(),
      disabled,
      controlsId: panelBefore.id,
      min: panelBefore.min,
      max: panelBefore.max,
      currentValue: panelBefore.currentValue,
      groupSize: getGroupSize(currentState),
    });
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

  const onKeyDown = (e: KeyboardEvent) => {
    const collapsiblePanel = getCollapsiblePanel();

    if (e.key === "Enter" && collapsiblePanel) {
      if (collapsiblePanel.collapsed) {
        send?.({ type: "expandPanel", panelId: collapsiblePanel.id });
      } else {
        send?.({ type: "collapsePanel", panelId: collapsiblePanel.id });
      }
    } else {
      moveProps.onKeyDown?.(e);
    }
  };

  onCleanup(() => {
    send?.({ type: "unregisterPanelHandle", id: handleId });
  });

  return (
    <div
      {...mergeProps(
        props,
        disabled ? {} : mergeProps(moveProps, { onKeyDown, tabIndex: 0 }),
        panelAttributes(),
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
