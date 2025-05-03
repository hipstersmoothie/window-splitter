<script lang="ts">
  import { getContext } from "svelte";
  import {
    getCursor,
    getGroupSize,
    initializePanelHandleData,
    isPanelData,
    isPanelHandle,
    getCollapsiblePanelForHandleId,
    haveConstraintsChangedForPanelHandle,
  } from "@window-splitter/state";
  import type {
    SendFn,
    GroupMachineContextValue,
  } from "@window-splitter/state";
  import type { SharedPanelResizerProps } from "@window-splitter/interface";
  import {
    getPanelResizerDomAttributes,
    move,
  } from "@window-splitter/interface";
  import type { HTMLAttributes } from "svelte/elements";

  interface Props
    extends SharedPanelResizerProps,
      HTMLAttributes<HTMLDivElement> {}

  let {
    size = "0px",
    id: _id,
    onDragStart,
    onDrag,
    onDragEnd,
    disabled,
    ...attrs
  }: Props = $props();

  const defaultId = $props.id();
  const id = _id || defaultId;
  const send = getContext<SendFn>("send");
  const state = getContext<GroupMachineContextValue>("state");
  const isPrerender = getContext<{ current: boolean }>("isPrerender");
  const initHandle = () => initializePanelHandleData({ size, id });
  const handleData = () => {
    const item = state?.items.find((i) => i.id === id);
    if (!item || !isPanelHandle(item)) return undefined;
    return item;
  };

  let dynamicPanelHandleIsMounting = false;

  if (!handleData()) {
    if (isPrerender.current) {
      send({ type: "registerPanelHandle", data: initHandle() });
    } else {
      dynamicPanelHandleIsMounting = true;
    }
  }

  $effect(() => {
    if (!dynamicPanelHandleIsMounting) return;

    const groupElement = document.getElementById(state.groupId);
    if (!groupElement) return;

    const handleEl = document.getElementById(id);
    if (!handleEl) return;

    const order = Array.from(groupElement.children).indexOf(handleEl);
    if (typeof order !== "number") return;

    send({
      type: "registerPanelHandle",
      data: { ...initHandle(), order },
    });
    dynamicPanelHandleIsMounting = false;
  });

  const contraintChanged = $derived(
    !dynamicPanelHandleIsMounting &&
      haveConstraintsChangedForPanelHandle(initHandle(), handleData())
  );

  const dynamicPanelHandleData = initHandle();
  $effect(() => {
    if (!contraintChanged) return;
    send({ type: "updateConstraints", data: dynamicPanelHandleData });
  });

  $effect(() => () => {
    requestAnimationFrame(() => {
      send({ type: "unregisterPanelHandle", id });
    });
  });

  const { moveProps } = move({
    onMoveStart: () => {
      send({ type: "dragHandleStart", handleId: id });
      onDragStart?.();
      document.body.style.cursor = getCursor(state) || "auto";
    },
    onMove: (e) => {
      send({ type: "dragHandle", handleId: id, value: e });
      onDrag?.();
    },
    onMoveEnd: () => {
      send({ type: "dragHandleEnd", handleId: id });
      onDragEnd?.();
      document.body.style.cursor = "auto";
    },
  });

  const itemIndex = 1;
  const panelAttributes = () => {
    const panelBeforeHandle = state?.items[itemIndex - 1];

    if (!panelBeforeHandle || !isPanelData(panelBeforeHandle)) return { id };

    return getPanelResizerDomAttributes({
      groupId: state.groupId,
      id,
      orientation: state.orientation,
      isDragging: state.activeDragHandleId === id,
      activeDragHandleId: state.activeDragHandleId,
      disabled: disabled,
      controlsId: panelBeforeHandle.id,
      min: panelBeforeHandle.min,
      max: panelBeforeHandle.max,
      currentValue: panelBeforeHandle.currentValue,
      groupSize: getGroupSize(state),
    });
  };
  const getDimensions = () => {
    const handle = state.items.find((item) => item.id === id);
    if (!handle || !isPanelHandle(handle)) return {};
    return state.orientation === "horizontal"
      ? { width: `${handle.size.value.toNumber()}px`, height: "100%" }
      : { height: `${handle.size.value.toNumber()}px`, width: "100%" };
  };
  const onKeyDown = (e: KeyboardEvent) => {
    try {
      const collapsiblePanel = getCollapsiblePanelForHandleId(state, id);

      if (e.key === "Enter" && collapsiblePanel) {
        if (collapsiblePanel.collapsed) {
          send({ type: "expandPanel", panelId: collapsiblePanel.id });
        } else {
          send({ type: "collapsePanel", panelId: collapsiblePanel.id });
        }
      }
    } catch {
      //
    }
  };
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
  {...attrs}
  {...panelAttributes()}
  onpointerdown={disabled ? undefined : moveProps.onPointerDown}
  onkeydown={disabled
    ? undefined
    : (e) => {
        moveProps.onKeyDown(e);
        onKeyDown(e);
      }}
  tabindex={disabled ? -1 : 0}
  style:cursor={getCursor(state)}
  style:width={getDimensions().width}
  style:height={getDimensions().height}
></div>
