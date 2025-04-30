<script lang="ts">
  import { getContext } from "svelte";
  import {
    getCursor,
    getGroupSize,
    initializePanelHandleData,
    isPanelData,
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
  const id = $props.id();

  const send = getContext("send");
  const state = getContext("state");

  const initHandle = () => initializePanelHandleData({ size, id });

  send({ type: "registerPanelHandle", data: initHandle() });

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
</script>

<div
  {...attrs}
  {...panelAttributes()}
  onpointerdown={moveProps.onPointerDown}
  onkeydown={moveProps.onKeyDown}
  style:cursor={getCursor(state)}
></div>
