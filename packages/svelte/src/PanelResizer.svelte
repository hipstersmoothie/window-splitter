<script lang="ts">
  import { getContext } from "svelte";
  import {
    getCursor,
    getGroupSize,
    initializePanelHandleData,
    isPanelData,
    isPanelHandle,
    parseUnit,
    getCollapsiblePanelForHandleId,
  } from "@window-splitter/state";
  import type { SharedPanelResizerProps } from "@window-splitter/interface";
  import {
    getPanelResizerDomAttributes,
    move,
  } from "@window-splitter/interface";

  interface Props extends SharedPanelResizerProps {}

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
  const send = getContext("send");
  const state = getContext("state");

  const initHandle = () => initializePanelHandleData({ size, id });
  const handleData = () => {
    const item = state?.items.find((i) => i.id === id);
    if (!item || !isPanelHandle(item)) return undefined;
    return item;
  };

  if (!handleData()) {
    send({ type: "registerPanelHandle", data: initHandle() });
  }

  $effect(() => {
    return () => send({ type: "unregisterPanelHandle", handleId: id });
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
    if (!handle) return {};
    return state.orientation === "horizontal"
      ? { width: `${handle.size.value.toNumber()}px`, height: "100%" }
      : { height: `${handle.size.value.toNumber()}px`, width: "100%" };
  };
  const onKeyDown = (e: KeyboardEvent) => {
    try {
      const collapsiblePanel = getCollapsiblePanelForHandleId(state, id);

      if (e.key === "Enter" && collapsiblePanel) {
        if (collapsiblePanel.collapsed) {
          console.log("expandPanel", collapsiblePanel.id);
          send({ type: "expandPanel", panelId: collapsiblePanel.id });
        } else {
          console.log("collapsePanel", collapsiblePanel.id);
          send({ type: "collapsePanel", panelId: collapsiblePanel.id });
        }
      }
    } catch (error) {
      console.error(error);
      return undefined;
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
