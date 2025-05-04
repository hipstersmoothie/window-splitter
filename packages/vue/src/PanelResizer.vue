<script setup lang="ts">
import {
  getPanelResizerDomAttributes,
  move,
  SharedPanelResizerProps,
} from "@window-splitter/interface";
import {
  getCollapsiblePanelForHandleId,
  getCursor,
  getGroupSize,
  GroupMachineContextValue,
  haveConstraintsChangedForPanelHandle,
  initializePanelHandleData,
  isPanelData,
  isPanelHandle,
  PanelHandleData,
  SendFn,
} from "@window-splitter/state";
import {
  computed,
  HTMLAttributes,
  inject,
  onMounted,
  onUnmounted,
  Ref,
  useId,
  watchEffect,
} from "vue";

type PanelResizerProps = SharedPanelResizerProps & {
  id?: string;
} & /* @vue-ignore */ HTMLAttributes;

const {
  size = "0px",
  id: _id,
  onDragStart,
  onDrag,
  onDragEnd,
  disabled,
  ...attrs
} = defineProps<PanelResizerProps>();

const defaultId = _id || useId();
const id = defaultId;

const send = inject<SendFn>("send");
const state = inject<Ref<GroupMachineContextValue>>("state");
const isPrerender = inject<Ref<boolean>>("isPrerender");

const initHandle = () => initializePanelHandleData({ size, id });
const handleData = computed(() => {
  const item = state?.value?.items.find((i) => i.id === id);
  if (!item || !isPanelHandle(item)) return undefined;
  return item;
});

let dynamicPanelHandleIsMounting = false;

if (!handleData.value) {
  if (isPrerender?.value) {
    send?.({ type: "registerPanelHandle", data: initHandle() });
  } else {
    dynamicPanelHandleIsMounting = true;
  }
}

onMounted(() => {
  const groupId = state?.value?.groupId;
  if (!groupId || !dynamicPanelHandleIsMounting) return;

  const groupElement = document.getElementById(state?.value?.groupId);
  if (!groupElement) return;

  const handleEl = document.getElementById(id);
  if (!handleEl) return;

  const order = Array.from(groupElement.children).indexOf(handleEl);
  if (typeof order !== "number") return;

  send?.({
    type: "registerPanelHandle",
    data: { ...initHandle(), order },
  });
  dynamicPanelHandleIsMounting = false;
});

const contraintChanged = computed(
  () =>
    !dynamicPanelHandleIsMounting &&
    haveConstraintsChangedForPanelHandle(initHandle(), handleData.value)
);

watchEffect(() => {
  if (!contraintChanged.value) return;
  send?.({ type: "updateConstraints", data: initHandle() });
});

onUnmounted(() => {
  requestAnimationFrame(() => send?.({ type: "unregisterPanelHandle", id }));
});

const { moveProps } = move({
  onMoveStart: () => {
    send?.({ type: "dragHandleStart", handleId: id });
    onDragStart?.();
    if (!state?.value) return;
    document.body.style.cursor = getCursor(state?.value) || "auto";
  },
  onMove: (e) => {
    send?.({ type: "dragHandle", handleId: id, value: e });
    onDrag?.();
  },
  onMoveEnd: () => {
    send?.({ type: "dragHandleEnd", handleId: id });
    onDragEnd?.();
    document.body.style.cursor = "auto";
  },
});

const onKeyDown = (e: KeyboardEvent) => {
  if (!state?.value) return;

  try {
    const collapsiblePanel = getCollapsiblePanelForHandleId(state?.value, id);

    if (e.key === "Enter" && collapsiblePanel) {
      if (collapsiblePanel.collapsed) {
        send?.({ type: "expandPanel", panelId: collapsiblePanel.id });
      } else {
        send?.({ type: "collapsePanel", panelId: collapsiblePanel.id });
      }
    }
  } catch {
    //
  }
};

const combinedProps = computed(() => {
  const handleIndex = state?.value?.items.findIndex((item) => item.id === id);

  if (!handleIndex) return { id };

  const handle = state?.value?.items[handleIndex] as PanelHandleData;
  const panelBeforeHandle = state?.value?.items[handleIndex - 1];

  if (!panelBeforeHandle || !isPanelData(panelBeforeHandle)) return { id };

  return {
    ...attrs,
    ...getPanelResizerDomAttributes({
      groupId: state?.value?.groupId,
      id,
      orientation: state?.value?.orientation || "horizontal",
      isDragging: state?.value?.activeDragHandleId === id,
      activeDragHandleId: state?.value?.activeDragHandleId,
      disabled: disabled,
      controlsId: panelBeforeHandle.id,
      min: panelBeforeHandle.min,
      max: panelBeforeHandle.max,
      currentValue: panelBeforeHandle.currentValue,
      groupSize: getGroupSize(state.value),
    }),
    onpointerdown: disabled ? undefined : moveProps.onPointerDown,
    onkeydown: disabled
      ? undefined
      : (e: KeyboardEvent) => {
          moveProps.onKeyDown(e);
          onKeyDown(e);
        },
    style: {
      cursor: state?.value ? getCursor(state.value) : undefined,
      width:
        state?.value?.orientation === "horizontal"
          ? `${handle?.size.value.toNumber()}px`
          : "100%",
      height:
        state?.value?.orientation === "vertical"
          ? `${handle?.size.value.toNumber()}px`
          : "100%",
    },
  };
});
</script>

<template>
  <div v-bind="combinedProps" data-panel-resizer :tabindex="disabled ? -1 : 0">
    <slot></slot>
  </div>
</template>
