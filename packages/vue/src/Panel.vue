<script setup lang="ts">
import {
  getPanelDomAttributes,
  PanelHandle,
  SharedPanelProps,
} from "@window-splitter/interface";
import {
  getPanelPercentageSize,
  getPanelPixelSize,
  GroupMachineContextValue,
  initializePanel,
  isPanelData,
  PanelData,
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

type PanelProps = SharedPanelProps<Ref<boolean>> & {
  id?: string;
} & /* @vue-ignore */ HTMLAttributes;
const {
  min,
  max,
  id,
  collapsible,
  collapsedSize,
  onCollapseChange,
  collapseAnimation,
  onResize,
  defaultCollapsed,
  default: defaultSize,
  isStaticAtRest,
  collapsed,
  ...attrs
} = defineProps<PanelProps>();

const panelId = id || useId();
const send = inject<SendFn>("send");
const state = inject<Ref<GroupMachineContextValue>>("state");
const isPrerender = inject<Ref<boolean>>("isPrerender");

const initPanel = (): PanelData => {
  return initializePanel({
    id: panelId,
    min,
    max,
    collapsible,
    collapsed: collapsed as unknown as boolean,
    collapsedSize,
    onCollapseChange: onCollapseChange
      ? { current: onCollapseChange }
      : undefined,
    collapseAnimation,
    onResize: onResize ? { current: onResize } : undefined,
    defaultCollapsed,
    default: defaultSize,
    isStaticAtRest,
  });
};

const panelData = computed(() => {
  const item = state?.value?.items.find((i) => i.id === panelId);
  if (!item || !isPanelData(item)) return undefined;
  return item;
});

let dynamicPanelIsMounting = false;

if (panelData.value) {
  // TODO
} else {
  if (isPrerender?.value) {
    send?.({ type: "registerPanel", data: initPanel() });
  } else {
    dynamicPanelIsMounting = true;
  }
}

onMounted(() => {
  const groupId = state?.value?.groupId;
  if (!groupId || !dynamicPanelIsMounting) return;

  const groupElement = document.getElementById(groupId);
  if (!groupElement) return;

  const panelElement = document.getElementById(panelId);
  if (!panelElement) return;

  const order = Array.from(groupElement.children).indexOf(panelElement);
  if (typeof order !== "number") return;

  send?.({
    type: "registerDynamicPanel",
    data: { ...initPanel(), order },
  });
  dynamicPanelIsMounting = false;
});

onUnmounted(() => {
  requestAnimationFrame(() => send?.({ type: "unregisterPanel", id: panelId }));
});

defineExpose<PanelHandle>({
  getId: () => panelId,
  collapse: () => {
    if (!panelData.value?.collapsible) return;
    send?.({ type: "collapsePanel", panelId: panelId, controlled: true });
  },
  isCollapsed: () =>
    Boolean(panelData.value?.collapsible && panelData.value?.collapsed),
  expand: () => {
    if (!panelData.value?.collapsible) return;
    send?.({ type: "expandPanel", panelId: panelId, controlled: true });
  },
  isExpanded: () =>
    Boolean(panelData.value?.collapsible && !panelData.value?.collapsed),
  getPixelSize: () => getPanelPixelSize(state!.value, panelId),
  getPercentageSize: () => getPanelPercentageSize(state!.value, panelId),
  setSize: (size) =>
    send?.({ type: "setPanelPixelSize", panelId: panelId, size }),
});

const isControlledCollapse = computed(
  () => panelData.value?.collapseIsControlled,
);

watchEffect(() => {
  if (!isControlledCollapse.value) return;

  if (collapsed) {
    send?.({ type: "collapsePanel", panelId: panelId, controlled: true });
  } else {
    send?.({ type: "expandPanel", panelId: panelId, controlled: true });
  }
});

const computedProps = computed(() => {
  const currentPanel = panelData.value;

  return {
    ...attrs,
    ...getPanelDomAttributes({
      groupId: state?.value?.groupId,
      id: panelId,
      collapsible: currentPanel?.collapsible,
      collapsed: currentPanel?.collapsed,
    }),
    style: {
      minWidth: 0,
      minHeight: 0,
      overflow: "hidden",
    },
  };
});
</script>

<template>
  <div v-bind="computedProps"><slot></slot></div>
</template>
