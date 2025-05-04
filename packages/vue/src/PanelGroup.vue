<script setup lang="ts">
import {
  measureGroupChildren,
  PanelGroupHandle,
  SharedPanelGroupProps,
} from "@window-splitter/interface";
import {
  buildTemplate,
  getPanelGroupPercentageSizes,
  getPanelGroupPixelSizes,
  groupMachine,
  GroupMachineContextValue,
  isPanelData,
  prepareSnapshot,
  Unit,
} from "@window-splitter/state";
import {
  useId,
  type HTMLAttributes,
  provide,
  ref,
  computed,
  onMounted,
  watchEffect,
} from "vue";

type PanelGroupProps = SharedPanelGroupProps & /* @vue-ignore */ HTMLAttributes;

const {
  orientation = "horizontal",
  autosaveStrategy = "localStorage",
  snapshot: snapshotProp,
  autosaveId,
  id,
  ...attrs
} = defineProps<PanelGroupProps>();

let snapshot = snapshotProp;

if (
  !snapshot &&
  typeof window !== "undefined" &&
  autosaveId &&
  autosaveStrategy === "localStorage"
) {
  const localSnapshot = localStorage.getItem(autosaveId);

  if (localSnapshot) {
    snapshot = JSON.parse(localSnapshot) as GroupMachineContextValue;
  }
}

const isPrerender = ref(true);
provide("isPrerender", isPrerender);

const groupId = autosaveId || id || useId();
const [initialState, send, machineState] = groupMachine(
  {
    orientation: orientation,
    groupId,
    autosaveStrategy: autosaveStrategy,
    ...(snapshot ? prepareSnapshot(snapshot) : undefined),
  },
  (s) => {
    context.value = { ...s };
  },
);

onMounted(() => {
  isPrerender.value = false;
});

const context = ref(initialState);
const gridStyle = computed(() => {
  const template = buildTemplate(context.value);
  return {
    height: "100%",
    display: "grid",
    gridTemplateColumns: orientation === "horizontal" ? template : undefined,
    gridTemplateRows: orientation === "vertical" ? template : undefined,
  };
});

provide("send", send);
provide("state", context);
provide("id", machineState);

const elementRef = ref<HTMLDivElement | null>(null);

onMounted(() => {
  const observer = new ResizeObserver(([entry]) => {
    if (!entry) return;
    if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
      send?.({ type: "setSize", size: entry.contentRect });
    }
  });

  if (elementRef.value) {
    observer.observe(elementRef.value);
  }

  return () => observer.disconnect();
});

const childIds = computed(() =>
  context.value?.items.map((i) => i.id).join(","),
);

watchEffect(() => {
  // re-render when the childIds change
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  childIds.value;

  return measureGroupChildren(groupId, (childrenSizes) =>
    send({ type: "setActualItemsSize", childrenSizes }),
  );
});

onMounted(() => {
  send({ type: "unlockGroup" });
  return () => send({ type: "lockGroup" });
});

defineExpose<PanelGroupHandle>({
  getId: () => groupId,
  getPixelSizes: () => getPanelGroupPixelSizes(context.value),
  getPercentageSizes: () => getPanelGroupPercentageSizes(context.value),
  getTemplate: () => buildTemplate(context.value),
  getState: () => (machineState.current === "idle" ? "idle" : "dragging"),
  setSizes: (updates) => {
    for (let index = 0; index < updates.length; index++) {
      const item = context.value?.items[index];
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
});
</script>

<template>
  <div
    v-bind="attrs"
    ref="elementRef"
    data-panel-group-wrapper
    :id="groupId"
    :style="gridStyle"
  >
    <slot></slot>
  </div>
</template>
