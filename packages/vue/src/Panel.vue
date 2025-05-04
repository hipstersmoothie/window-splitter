<script setup lang="ts">
import {
  getPanelDomAttributes,
  SharedPanelProps,
} from "@window-splitter/interface";
import {
  GroupMachineContextValue,
  initializePanel,
  isPanelData,
  PanelData,
  SendFn,
} from "@window-splitter/state";
import { computed, HTMLAttributes, inject, Ref, useId } from "vue";

type PanelProps = SharedPanelProps<boolean> & /* @vue-ignore */ HTMLAttributes;
const {
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
  ...attrs
} = defineProps<PanelProps>();

const panelId = id || useId();
const send = inject<SendFn>("send");
const state = inject<Ref<GroupMachineContextValue>>("state");

const initPanel = (): PanelData =>
  initializePanel({
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
  });

const panelData = () => {
  const item = state?.value?.items.find((i) => i.id === id);
  if (!item || !isPanelData(item)) return undefined;
  return item;
};

if (panelData()) {
  // TODO
} else {
  send?.({ type: "registerPanel", data: initPanel() });
}

const computedProps = computed(() => {
  const currentPanel = panelData();

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
