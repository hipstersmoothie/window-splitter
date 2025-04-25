"use client";

import React, {
  useEffect,
  useImperativeHandle,
  createContext,
  useRef,
  useState,
  useMemo,
  useContext,
} from "react";
import invariant from "tiny-invariant";
import { useIndex, useIndexedChildren } from "reforest";
import {
  buildTemplate,
  Constraints,
  getCollapsiblePanelForHandleId,
  getGroupSize,
  getPanelWithId,
  getUnitPercentageValue,
  groupMachine,
  GroupMachineContextValue,
  initializePanel,
  InitializePanelHandleData,
  isPanelData,
  Item,
  PanelData,
  parseUnit,
  prepareItems,
  Rect,
  Unit,
  prepareSnapshot,
  PixelUnit,
  getPanelGroupPixelSizes,
  getPanelGroupPercentageSizes,
  getPanelPixelSize,
  getPanelPercentageSize,
  getCursor,
  OnResizeCallback,
  haveConstraintsChangedForPanel,
  PanelHandleData,
  ParsedPixelUnit,
  haveConstraintsChangedForPanelHandle,
  GroupMachineInput,
  GroupMachineEvent,
  State,
} from "@window-splitter/state";
import {
  mergeProps,
  useEffectEvent,
  useId,
  useLayoutEffect,
  mergeRefs,
} from "@react-aria/utils";
import { useMove } from "@react-aria/interactions";

// #region Components

const GroupMachineState = createContext<{ current: State | undefined }>({
  current: undefined,
});
const GroupMachineContext = createContext<GroupMachineContextValue | undefined>(
  undefined
);
const GroupMachineStateContextRef = createContext<
  React.MutableRefObject<GroupMachineContextValue>
>({
  current: undefined,
} as unknown as React.MutableRefObject<GroupMachineContextValue>);
const GroupMachineActor = createContext<(e: GroupMachineEvent) => void>(
  () => {}
);
const GroupMachine = {
  useSelector<R>(
    selector: (data: { context: GroupMachineContextValue }) => R
  ): R {
    const context = useContext(GroupMachineContext);
    invariant(
      context,
      "GroupMachineContext must be used within a GroupMachineProvider"
    );
    return selector({ context });
  },
  useActorRef: () => {
    const send = useContext(GroupMachineActor);
    return { send };
  },
  useContextRef: () => {
    const ref = useContext(GroupMachineStateContextRef);
    invariant(
      ref,
      "GroupMachineContext must be used within a GroupMachineProvider"
    );
    return ref;
  },
  Provider: ({
    input,
    children,
  }: {
    input: GroupMachineInput;
    children: React.ReactNode;
  }) => {
    const [intiialValue, send, state] = useMemo(
      () =>
        groupMachine(input, (value) => {
          currentContextRef.current = value;
          setCurrentValue({ ...value });
        }),
      []
    );
    const currentContextRef = useRef(intiialValue);
    const [currentValue, setCurrentValue] = useState(intiialValue);

    return (
      <GroupMachineState.Provider value={state}>
        <GroupMachineStateContextRef.Provider value={currentContextRef}>
          <GroupMachineContext.Provider value={currentValue}>
            <GroupMachineActor.Provider value={send}>
              {children}
            </GroupMachineActor.Provider>
          </GroupMachineContext.Provider>
        </GroupMachineStateContextRef.Provider>
      </GroupMachineState.Provider>
    );
  },
};

// function useDebugGroupMachineContext({ id }: { id: string }) {
//   const value = GroupMachineContext.useSelector((state) => state.value);
//   const context = GroupMachineContext.useSelector((state) => state.context);
//   console.log(
//     "GROUP CONTEXT",
//     buildTemplate(context),
//     context.size,
//     context.items.map((item) =>
//       isPanelData(item)
//         ? {
//             type: item.currentValue.type,
//             value: item.currentValue.value.toNumber(),
//           }
//         : { type: item.size.type, value: item.size.value.toNumber() }
//     )
//   );
// }

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

  const children = document.querySelectorAll(
    `[data-splitter-group-id="${groupId}"]`
  );

  for (const child of children) {
    childrenObserver.observe(child);
  }

  return () => {
    childrenObserver.disconnect();
  };
}

export interface PanelGroupHandle {
  /** The id of the group */
  getId: () => string;
  /** Get the sizes of all the items in the layout as pixels */
  getPixelSizes: () => Array<number>;
  /** Get the sizes of all the items in the layout as percentages of the group size */
  getPercentageSizes: () => Array<number>;
  /**
   * Set the size of all the items in the layout.
   * This just calls `setSize` on each item. It is up to
   * you to make sure the sizes make sense.
   *
   * NOTE: Setting handle sizes will do nothing.
   */
  setSizes: (items: Array<Unit>) => void;
  /** Get the template for the group in pixels. Useful for testing */
  getTemplate: () => string;
  getState: () => "idle" | "dragging";
}

export interface PanelGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    Partial<
      Pick<GroupMachineContextValue, "orientation" | "autosaveStrategy">
    > {
  /** Imperative handle to control the group */
  handle?: React.Ref<PanelGroupHandle>;
  /** Persisted state to initialized the machine with */
  snapshot?: GroupMachineContextValue;
  /** An id to use for autosaving the layout */
  autosaveId?: string;
}

const InitialMapContext = createContext<Item[]>([]);
const PreRenderContext = createContext(false);

function PrerenderTree({
  children,
  onPrerender,
}: {
  children: React.ReactNode;
  onPrerender: () => void;
}) {
  const [shouldPrerender, setShouldPrerender] = React.useState(true);

  useLayoutEffect(() => {
    setShouldPrerender(false);
    onPrerender();
  }, []);

  return shouldPrerender ? (
    <div className="opacity-0 absolute">
      <PreRenderContext.Provider value>{children}</PreRenderContext.Provider>
    </div>
  ) : null;
}

function useGroupItem<T extends Item>(
  itemArg: Omit<T, "id"> & { id?: string }
): T {
  const isPrerender = React.useContext(PreRenderContext);
  const initialMap = React.useContext(InitialMapContext);
  const generatedId = useId();
  const id = itemArg.id || generatedId;
  const { index } = useIndex()!;
  const item = { ...itemArg, id } as T;

  if (isPrerender) {
    if (!initialMap.find((i) => i.id === item.id)) {
      initialMap.push(item);
    }
    return item;
  }

  // The way this hooks is called is never conditional so the usage here is fine
  /* eslint-disable react-hooks/rules-of-hooks */
  const currentItem = GroupMachine.useSelector(
    ({ context }) => context.items[index]
  ) as T;
  const { send } = GroupMachine.useActorRef();
  const machineRef = GroupMachine.useContextRef();

  const onCollapseChangeRef = isPanelData(itemArg)
    ? itemArg.onCollapseChange
    : undefined;
  const onResizeRef = isPanelData(itemArg) ? itemArg.onResize : undefined;

  React.useEffect(() => {
    console.log("item useEffect");
    const context = machineRef.current;

    if (!context) {
      return;
    }

    let contextItem: Item | undefined;

    if (itemArg.id) {
      contextItem = context.items.find((i) => i.id === itemArg.id);

      if (!contextItem) {
        debugger;
        invariant(
          itemArg.id,
          "When using dynamic panels you must provide an id on the items. This applies to React strict mode as well."
        );

        if (isPanelData(itemArg)) {
          send({
            type: "registerDynamicPanel",
            data: { ...itemArg, order: index },
          });
          console.log("registerDynamicPanel", itemArg, context.items);
        } else {
          send({
            type: "registerPanelHandle",
            data: {
              ...(itemArg as unknown as InitializePanelHandleData),
              order: index,
            },
          });
        }
      } else if (onCollapseChangeRef || onResizeRef) {
        send({
          type: "rebindPanelCallbacks",
          data: {
            id: itemArg.id,
            onCollapseChange: onCollapseChangeRef,
            onResize: onResizeRef,
          },
        });
      }
    } else {
      contextItem = context.items[index];
    }

    const unmountId = contextItem?.id || itemArg.id;

    return () => {
      const el = document.querySelector(
        `[data-splitter-id="${unmountId}"]`
      ) as HTMLElement;

      if (el || !unmountId) {
        return;
      }

      if (isPanelData(itemArg)) {
        send({ type: "unregisterPanel", id: unmountId });
      } else {
        send({ type: "unregisterPanelHandle", id: unmountId });
      }
    };
  }, [index, itemArg, machineRef, send, onCollapseChangeRef, onResizeRef]);

  return currentItem || item;
  /* eslint-enable react-hooks/rules-of-hooks */
}

function flattenChildren(children: React.ReactNode[]): React.ReactNode[] {
  return children.flatMap((child) =>
    React.isValidElement(child) && child.type === React.Fragment
      ? flattenChildren(child.props.children)
      : child
  );
}

/** A group of panels that has constraints and a user can resize */
export const PanelGroup = React.forwardRef<HTMLDivElement, PanelGroupProps>(
  function PanelGroup({ children, ...props }, ref) {
    const [hasPreRendered, setHasPreRendered] = useState(false);
    const initialMap = useRef<Item[]>([]);
    const indexedChildren = useIndexedChildren(
      // eslint-disable-next-line @eslint-react/no-children-to-array
      flattenChildren(React.Children.toArray(children))
    );

    return (
      <InitialMapContext.Provider value={initialMap.current}>
        {!hasPreRendered && (
          <PrerenderTree onPrerender={() => setHasPreRendered(true)}>
            {indexedChildren}
          </PrerenderTree>
        )}

        <PanelGroupImpl ref={ref} initialItems={initialMap} {...props}>
          {indexedChildren}
        </PanelGroupImpl>
      </InitialMapContext.Provider>
    );
  }
);

const PanelGroupImpl = React.forwardRef<
  HTMLDivElement,
  PanelGroupProps & {
    initialItems: { current: Item[] };
  }
>(function PanelGroupImpl(
  {
    autosaveId,
    autosaveStrategy = "localStorage",
    snapshot: snapshotProp,
    initialItems,
    ...props
  },
  ref
) {
  const defaultGroupId = `panel-group-${useId()}`;
  const groupId = autosaveId || props.id || defaultGroupId;
  const [snapshot, setSnapshot] = React.useState<
    GroupMachineContextValue | true | undefined
  >(snapshotProp);

  if (
    typeof window !== "undefined" &&
    autosaveId &&
    !snapshot &&
    autosaveStrategy === "localStorage"
  ) {
    const localSnapshot = localStorage.getItem(autosaveId);

    console.log("localSnapshot", localSnapshot);
    if (localSnapshot) {
      setSnapshot(JSON.parse(localSnapshot));
    } else {
      setSnapshot(true);
    }
  }

  console.log("before", {
    snapshot,
    snapshotProp,
  });
  const snapshotMemo = useMemo(() => {
    return typeof snapshot === "object" ? prepareSnapshot(snapshot) : undefined;
  }, [snapshot]);

  console.log("snapshotMemo", {
    orientation: props.orientation,
    snapshot,
    snapshotMemo,
    groupId,
    items: initialItems.current,
    autosaveStrategy,
    ...(typeof snapshotMemo === "object" ? snapshotMemo : undefined),
  });

  return (
    <GroupMachine.Provider
      input={{
        orientation: props.orientation,
        groupId,
        items: initialItems.current,
        autosaveStrategy,
        ...(typeof snapshotMemo === "object" ? snapshotMemo : undefined),
      }}
    >
      <PanelGroupImplementation ref={ref} {...props} />
    </GroupMachine.Provider>
  );
});

const PanelGroupImplementation = React.forwardRef<
  HTMLDivElement,
  PanelGroupProps
>(function PanelGroupImplementation(
  { handle, orientation: orientationProp, ...props },
  outerRef
) {
  const { send } = GroupMachine.useActorRef();
  const machineRef = GroupMachine.useContextRef();
  const innerRef = React.useRef<HTMLDivElement>(null);
  const ref = mergeRefs(outerRef, innerRef);
  const orientation = GroupMachine.useSelector(
    (state) => state.context.orientation
  );
  const groupId = GroupMachine.useSelector((state) => state.context.groupId);
  const template = GroupMachine.useSelector((state) =>
    buildTemplate(state.context)
  );

  // When the prop for `orientation` updates also update the state machine
  if (orientationProp && orientationProp !== orientation) {
    send({ type: "setOrientation", orientation: orientationProp });
  }

  // Track the size of the group
  useLayoutEffect(() => {
    const { current: el } = innerRef;

    if (!el) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (!entry) {
        return;
      }

      console.log({ type: "setSize", size: entry.contentRect });
      send({ type: "setSize", size: entry.contentRect });
    });

    observer.observe(el);

    send({ type: "setSize", size: el.getBoundingClientRect() });

    return () => {
      observer.disconnect();
    };
  }, [send, innerRef, groupId]);

  const childIds = GroupMachine.useSelector((state) =>
    state.context.items.map((i) => i.id).join(",")
  );
  useLayoutEffect(() => {
    return measureGroupChildren(groupId, (childrenSizes) => {
      send({ type: "setActualItemsSize", childrenSizes });
    });
  }, [send, groupId, childIds]);

  // useDebugGroupMachineContext({ id: groupId });

  const fallbackHandleRef = React.useRef<PanelGroupHandle>(null);
  const state = useContext(GroupMachineState);

  useImperativeHandle(handle || fallbackHandleRef, () => {
    return {
      getId: () => groupId,
      getPixelSizes: () => getPanelGroupPixelSizes(machineRef.current),
      getPercentageSizes: () =>
        getPanelGroupPercentageSizes(machineRef.current),
      setSizes: (updates) => {
        const context = machineRef.current;

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
        const context = machineRef.current;
        return buildTemplate({ ...context, items: prepareItems(context) });
      },
      getState: () => (state.current === "idle" ? "idle" : "dragging"),
    };
  });

  return (
    <div
      ref={ref}
      data-group-id={groupId}
      data-group-orientation={orientation}
      {...mergeProps(props, {
        style: {
          display: "grid",
          gridTemplateColumns:
            orientation === "horizontal" ? template : undefined,
          gridTemplateRows: orientation === "vertical" ? template : undefined,
          height: "100%",
          ...props.style,
        },
      })}
    />
  );
});

export interface PanelHandle {
  /** Collapse the panel */
  collapse: () => void;
  /** Returns true if the panel is collapsed */
  isCollapsed: () => boolean;
  /** Expand the panel */
  expand: () => void;
  /** Returns true if the panel is expanded */
  isExpanded: () => boolean;
  /** The id of the panel */
  getId: () => string;
  /** Get the size of the panel in pixels */
  getPixelSize: () => number;
  /** Get percentage of the panel relative to the group */
  getPercentageSize: () => number;
  /**
   * Set the size of the panel in pixels.
   *
   * This will be clamped to the min/max values of the panel.
   * If you want the panel to collapse/expand you should use the
   * expand/collapse methods.
   */
  setSize: (size: Unit) => void;
}

export interface PanelProps
  extends Constraints<Unit>,
    Pick<PanelData, "collapseAnimation">,
    Omit<React.HTMLAttributes<HTMLDivElement>, "onResize"> {
  /**
   * __CONTROLLED COMPONENT__
   *
   * If this prop is used it will be used as the source of truth for the collapsed state.
   * It should be used in conjunction with the `onCollapseChange` prop.
   *
   * Use this if you want full control over the collapsed state. When trying to
   * collapse a panel it will defer to onCollapseChange to determine if it should
   * be collapsed.
   */
  collapsed?: boolean;
  /**
   * __CONTROLLED COMPONENT__
   *
   * A callback called with the new desired collapsed state. If paired w
   * with the `collapsed` prop this will be used to control the collapsed state.
   *
   * Otherwise this will just be called with the new collapsed state so you can
   * use it to update your own state.
   */
  onCollapseChange?: (isCollapsed: boolean) => void;
  /** Imperative handle to control the panel */
  handle?: React.Ref<PanelHandle>;
  /** Callback called when the panel is resized */
  onResize?: OnResizeCallback;
}

/** A panel within a `PanelGroup` */
export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  function Panel(
    {
      defaultCollapsed,
      min,
      max,
      default: defaultSize,
      collapsedSize,
      onCollapseChange,
      onResize,
      collapseAnimation,
      isStaticAtRest,
      ...props
    },
    outerRef
  ) {
    const { collapsible = false, collapsed } = props;
    const isPrerender = React.useContext(PreRenderContext);
    const onCollapseChangeRef = React.useRef(onCollapseChange);
    useEffect(() => {
      onCollapseChangeRef.current = onCollapseChange;
    }, [onCollapseChange]);
    const onResizeRef = React.useRef(onResize);
    useEffect(() => {
      onResizeRef.current = onResize;
    }, [onResize]);
    const panelDataRef = React.useMemo(() => {
      return initializePanel({
        min: min,
        max: max,
        collapsible: collapsible,
        collapsed: collapsed,
        collapsedSize: collapsedSize,
        onCollapseChange: onCollapseChangeRef,
        collapseAnimation: collapseAnimation,
        onResize: onResizeRef,
        id: props.id,
        defaultCollapsed,
        default: defaultSize,
        isStaticAtRest,
      });
    }, [
      collapseAnimation,
      collapsed,
      collapsedSize,
      collapsible,
      defaultCollapsed,
      max,
      min,
      props.id,
      defaultSize,
      isStaticAtRest,
    ]);

    const { id: panelId } = useGroupItem(panelDataRef);

    if (isPrerender) {
      return null;
    }

    return (
      <PanelVisible
        ref={outerRef}
        panelProp={panelDataRef}
        {...props}
        panelId={panelId}
      />
    );
  }
);

const PanelVisible = React.forwardRef<
  HTMLDivElement,
  Omit<
    PanelProps,
    | "collapsedSize"
    | "onCollapseChange"
    | "defaultCollapsed"
    | "min"
    | "max"
    | "collapseAnimation"
    | "onResize"
  > & {
    panelId: string;
    /** The latest prop that was received by the `Panel` component */
    panelProp: Omit<PanelData, "id">;
  }
>(function PanelVisible(
  { collapsible = false, collapsed, handle, panelId, panelProp, ...props },
  outerRef
) {
  const innerRef = React.useRef<HTMLDivElement>(null);
  const ref = mergeRefs(outerRef, innerRef);
  const { send } = GroupMachine.useActorRef();
  const machineRef = GroupMachine.useContextRef();
  const groupId = GroupMachine.useSelector((state) => state.context.groupId);
  const panel = GroupMachine.useSelector(({ context }) => {
    try {
      return getPanelWithId(context, panelId);
    } catch {
      return undefined;
    }
  });

  const contraintChanged =
    panel && haveConstraintsChangedForPanel(panelProp, panel);

  const onConstraintChange = useEffectEvent(() => {
    if (contraintChanged) {
      send({
        type: "updateConstraints",
        data: { ...panelProp, id: panel.id },
      });
    }
  });

  React.useEffect(() => {
    if (contraintChanged) {
      onConstraintChange();
    }
  }, [send, contraintChanged, onConstraintChange]);

  // For controlled collapse we track if the `collapse` prop changes
  // and update the state machine if it does.
  React.useEffect(() => {
    if (typeof collapsed !== "undefined") {
      const context = machineRef.current;

      if (context.items.length === 0) {
        return;
      }

      const p = getPanelWithId(context, panelId);

      if (collapsed === true && !p.collapsed) {
        send({ type: "collapsePanel", panelId, controlled: true });
      } else if (collapsed === false && p.collapsed) {
        send({ type: "expandPanel", panelId, controlled: true });
      }
    }
  }, [send, collapsed, panelId, machineRef]);

  const fallbackHandleRef = React.useRef<PanelHandle>(null);

  useImperativeHandle(handle || fallbackHandleRef, () => {
    return {
      getId: () => panelId,
      collapse: () => {
        if (collapsible) {
          // TODO: setting controlled here might be wrong
          send({ type: "collapsePanel", panelId, controlled: true });
        }
      },
      isCollapsed: () => Boolean(collapsible && panel?.collapsed),
      expand: () => {
        if (collapsible) {
          send({ type: "expandPanel", panelId, controlled: true });
        }
      },
      isExpanded: () => Boolean(collapsible && !panel?.collapsed),
      getPixelSize: () => {
        const context = machineRef.current;
        return getPanelPixelSize(context, panelId);
      },
      setSize: (size) => {
        send({ type: "setPanelPixelSize", panelId, size });
      },
      getPercentageSize: () => {
        const context = machineRef.current;
        return getPanelPercentageSize(context, panelId);
      },
    };
  });

  return (
    <div
      ref={ref}
      data-splitter-group-id={groupId}
      data-splitter-type="panel"
      data-splitter-id={panelId}
      data-collapsed={collapsible && panel?.collapsed}
      {...props}
      style={{
        ...props.style,
        minWidth: 0,
        minHeight: 0,
        overflow: "hidden",
      }}
    />
  );
});

export interface PanelResizerProps
  extends Omit<
    React.HTMLAttributes<HTMLButtonElement>,
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

/** A resize handle to place between panels. */
export const PanelResizer = React.forwardRef<
  HTMLButtonElement,
  PanelResizerProps
>(function PanelResizer(props, ref) {
  const { size = "0px" } = props;
  const isPrerender = React.useContext(PreRenderContext);
  const data = React.useMemo(
    () => ({
      type: "handle" as const,
      size: parseUnit(size) as ParsedPixelUnit,
      id: props.id,
    }),
    [size, props.id]
  );

  useGroupItem(data);

  if (isPrerender) {
    return null;
  }

  return <PanelResizerVisible ref={ref} panelHandleProp={data} {...props} />;
});

const PanelResizerVisible = React.forwardRef<
  HTMLButtonElement,
  PanelResizerProps & { panelHandleProp: Omit<PanelHandleData, "id"> }
>(function PanelResizerVisible(
  {
    size = "0px",
    disabled,
    onDragStart,
    onDrag,
    onDragEnd,
    panelHandleProp,
    ...props
  },
  outerRef
) {
  const innerRef = React.useRef<HTMLButtonElement>(null);
  const ref = mergeRefs(outerRef, innerRef);
  const unit = parseUnit(size);
  const { send } = GroupMachine.useActorRef();
  const { index } = useIndex()!;
  const handleId = GroupMachine.useSelector(
    ({ context }) => context.items[index]?.id || ""
  );
  const panelHandle = GroupMachine.useSelector(
    ({ context }) => context.items[index] as PanelHandleData
  );
  const panelBeforeHandle = GroupMachine.useSelector(
    ({ context }) => context.items[index - 1]
  );
  const collapsiblePanel = GroupMachine.useSelector(({ context }) => {
    try {
      return getCollapsiblePanelForHandleId(context, handleId);
    } catch {
      return undefined;
    }
  });
  const orientation = GroupMachine.useSelector(
    (state) => state.context.orientation
  );
  const groupsSize = GroupMachine.useSelector((state) =>
    getGroupSize(state.context)
  );
  const overshoot = GroupMachine.useSelector(
    (state) => state.context.dragOvershoot
  );
  const activeDragHandleId = GroupMachine.useSelector(
    (state) => state.context.activeDragHandleId
  );
  const isDragging = activeDragHandleId === handleId;
  const { moveProps } = useMove({
    onMoveStart: () => {
      send({ type: "dragHandleStart", handleId: handleId });
      onDragStart?.();
    },
    onMove: (e) => {
      send({ type: "dragHandle", handleId: handleId, value: e });
      onDrag?.();
    },
    onMoveEnd: () => {
      send({ type: "dragHandleEnd", handleId: handleId });
      onDragEnd?.();
    },
  });

  const contraintChanged =
    panelHandle &&
    haveConstraintsChangedForPanelHandle(panelHandleProp, panelHandle);

  const onConstraintChange = useEffectEvent(() => {
    if (contraintChanged) {
      send({
        type: "updateConstraints",
        data: { ...panelHandleProp, id: handleId },
      });
    }
  });

  React.useEffect(() => {
    if (contraintChanged) {
      onConstraintChange();
    }
  }, [send, contraintChanged, onConstraintChange]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && collapsiblePanel) {
      if (collapsiblePanel.collapsed) {
        send({ type: "expandPanel", panelId: collapsiblePanel.id });
      } else {
        send({ type: "collapsePanel", panelId: collapsiblePanel.id });
      }
    }
  };

  let cursor: React.CSSProperties["cursor"];

  if (disabled) {
    cursor = "default";
  } else {
    cursor = getCursor({ dragOvershoot: overshoot, orientation });
  }

  // Update the cursor while the user is dragging.
  // This makes it so that the user can overshoot the drag handle and
  // still see the right cursor.
  useEffect(() => {
    if (!isDragging) {
      return;
    }

    document.body.style.cursor = cursor || "auto";

    return () => {
      document.body.style.cursor = "auto";
    };
  }, [cursor, isDragging]);

  if (!panelBeforeHandle || !isPanelData(panelBeforeHandle)) {
    return null;
  }

  return (
    <div
      ref={ref as unknown as React.Ref<HTMLDivElement>}
      role="separator"
      data-splitter-type="handle"
      data-splitter-id={handleId}
      data-handle-orientation={orientation}
      data-state={
        isDragging ? "dragging" : activeDragHandleId ? "inactive" : "idle"
      }
      aria-label="Resize Handle"
      aria-disabled={disabled}
      aria-controls={panelBeforeHandle.id}
      aria-valuemin={getUnitPercentageValue(groupsSize, panelBeforeHandle.min)}
      aria-valuemax={
        panelBeforeHandle.max === "1fr"
          ? 100
          : getUnitPercentageValue(groupsSize, panelBeforeHandle.max)
      }
      aria-valuenow={getUnitPercentageValue(
        groupsSize,
        panelBeforeHandle.currentValue
      )}
      {...mergeProps(props, disabled ? {} : moveProps, { onKeyDown })}
      tabIndex={0}
      style={{
        cursor,
        ...props.style,
        ...(orientation === "horizontal"
          ? { width: unit.value.toNumber(), height: "100%" }
          : { height: unit.value.toNumber(), width: "100%" }),
      }}
    />
  );
});

// #endregion
