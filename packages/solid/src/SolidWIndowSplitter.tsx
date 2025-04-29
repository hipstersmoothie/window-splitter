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
  createDeferred,
  createEffect,
  createRenderEffect,
  createRoot,
  createSignal,
  createUniqueId,
  JSX,
  onCleanup,
  onMount,
  Ref,
  splitProps,
} from "solid-js";
import {
  GroupMachineProvider,
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
import { mergeSolidAttributes } from "./mergeSolidAttributes.js";

export interface PanelGroupProps
  extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "style">,
    SharedPanelGroupProps {
  /** Imperative handle to control the group */
  handle?: Ref<PanelGroupHandle>;
  style?: JSX.CSSProperties;
}

export function PanelGroup(props: PanelGroupProps) {
  const [, attrs] = splitProps(props, [
    "orientation",
    "autosaveStrategy",
    "autosaveId",
    "snapshot",
  ]);
  const [intiialValue, send, machineState, groupId] = createRoot(() => {
    const defaultGroupId = `panel-group-${createUniqueId()}`;
    const groupIdInit = props.autosaveId || props.id || defaultGroupId;
    const orientation = props.orientation || "horizontal";
    const autosaveStrategy = props.autosaveStrategy || "localStorage";

    let snapshot: GroupMachineContextValue | undefined;

    if (props.snapshot) {
      snapshot = props.snapshot;
    } else if (
      typeof window !== "undefined" &&
      props.autosaveId &&
      autosaveStrategy === "localStorage"
    ) {
      const localSnapshot = localStorage.getItem(props.autosaveId);

      if (localSnapshot) {
        snapshot = JSON.parse(localSnapshot) as GroupMachineContextValue;
      }
    }

    return [
      ...groupMachine(
        {
          orientation,
          groupId: groupIdInit,
          autosaveStrategy: autosaveStrategy,
          ...(snapshot ? prepareSnapshot(snapshot) : undefined),
        },
        (value) => {
          setCurrentValue({ ...value });
        }
      ),
      groupIdInit,
    ];
  });
  const [currentValue, setCurrentValue] = createSignal(intiialValue);

  const getContext = () => {
    const context = currentValue?.() || intiialValue;
    if (!context) throw new Error("No state");
    return context;
  };

  // Prerender the children with the machine context
  const [isInitialPrerender, setIsInitialPrerender] = createSignal(true);
  const resolvedChildren = children(() => (
    <GroupMachineProvider
      groupId={groupId}
      send={send}
      state={getContext}
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
      if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
        send({
          type: "setSize",
          size: entry.contentRect,
        });
      }
    });

    if (elementRef) {
      observer.observe(elementRef);
    }

    return () => observer.disconnect();
  });

  const childIds = createDeferred(() => {
    const s = currentValue?.();
    if (!s) throw new Error("No state");
    return s.items.map((i) => i.id).join(",");
  });

  // Measure children size
  createEffect(() => {
    // This sets up a dep on the childIds. When new ids are added this
    // effect will clean up and re-run to measure the new children.
    childIds();

    const cleanup = measureGroupChildren(groupId, (childrenSizes) => {
      send({ type: "setActualItemsSize", childrenSizes });
    });

    onCleanup(cleanup);
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

  const getTemplate = () => {
    const context = getContext();
    const tempalte = buildTemplate(context);
    return tempalte;
  };

  onMount(() => send({ type: "unlockGroup" }));
  onCleanup(() => send({ type: "lockGroup" }));

  return (
    <div
      ref={elementRef}
      data-panel-group-wrapper
      {...attrs}
      style={{
        display: "grid",
        "grid-template-columns":
          currentValue()?.orientation === "horizontal"
            ? getTemplate()
            : undefined,
        "grid-template-rows":
          currentValue()?.orientation === "vertical"
            ? getTemplate()
            : undefined,
        height: "100%",
        ...props.style,
      }}
    >
      {resolvedChildren()}
    </div>
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
    Omit<JSX.HTMLAttributes<HTMLDivElement>, "onResize" | "style"> {
  /** Imperative handle to control the panel */
  handle?: Ref<PanelHandle>;
  style?: JSX.CSSProperties;
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
      } else {
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
    // We wait a frame because in Solid children unmount before their parent
    // and we want to only unregister if just the panel is being removed, not
    // the whole group. This frame allows for the parent to lock the machine.
    requestAnimationFrame(() => {
      send?.({ type: "unregisterPanel", id: panelId });
    });
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
      {...mergeSolidAttributes(props, domAttributes())}
      style={{
        "min-width": 0,
        "min-height": 0,
        overflow: "hidden",
        ...props.style,
      }}
    />
  );
}

export interface PanelResizerProps
  extends SharedPanelResizerProps,
    Omit<
      JSX.HTMLAttributes<HTMLDivElement>,
      "onDragStart" | "onDrag" | "onDragEnd" | "style"
    > {
  style?: JSX.CSSProperties;
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
      } else {
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
    }
  };

  onCleanup(() => {
    // We wait a frame because in Solid children unmount before their parent
    // and we want to only unregister if just the panel is being removed, not
    // the whole group. This frame allows for the parent to lock the machine.
    requestAnimationFrame(() => {
      send?.({ type: "unregisterPanelHandle", id: handleId });
    });
  });

  return (
    <div
      {...mergeSolidAttributes(
        props,
        disabled
          ? {}
          : mergeSolidAttributes(moveProps, { onKeyDown, tabIndex: 0 }),
        panelAttributes(),
        {
          style: {
            cursor: cursor(),
            ...dimensions(),
            ...props.style,
          },
        }
      )}
    />
  );
}
