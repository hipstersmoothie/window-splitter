<script lang="ts">
  import type { SharedPanelGroupProps } from "@window-splitter/interface";
  import { measureGroupChildren } from "@window-splitter/interface";
  import {
    buildTemplate,
    groupMachine,
    prepareSnapshot,
  } from "@window-splitter/state";
  import type { ClassValue } from "svelte/elements";
  import { setContext } from "svelte";

  interface Props extends SharedPanelGroupProps {
    id: string;
  }

  let {
    children,
    orientation = "horizontal",
    autosaveStrategy = "localStorage",
    autosaveId,
    snapshot,
    ...attrs
  }: Props = $props();

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

  const defaultId = $props.id();
  const id = autosaveId || defaultId;
  let state = $state();

  const [initialState, send, machineState] = groupMachine(
    {
      orientation,
      groupId: id,
      autosaveStrategy,
      autosaveId,
      ...(snapshot ? prepareSnapshot(snapshot) : undefined),
    },
    (s) => {
      for (const key in s) {
        state[key] = s[key];
      }
    }
  );

  state = initialState;

  setContext("send", send);
  setContext("state", state);
  setContext("id", machineState);

  const isPrerender = $state({ current: true });
  setContext("isPrerender", isPrerender);
  $effect(() => (isPrerender.current = false));

  let elementRef = $state();

  $effect(() => {
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

  let childIds = $derived(state.items.map((i) => i.id).join(","));

  $effect(() =>
    measureGroupChildren(id, (childrenSizes) => {
      send({ type: "setActualItemsSize", childrenSizes });
    })
  );

  let template = $derived(buildTemplate(state));

  $effect(() => {
    send({ type: "unlockGroup" });
    return () => send({ type: "lockGroup" });
  });
</script>

<div
  {...attrs}
  data-panel-group-wrapper
  bind:this={elementRef}
  style:display="grid"
  style:grid-template-columns={state.orientation === "horizontal"
    ? template
    : undefined}
  style:grid-template-rows={state.orientation === "vertical"
    ? template
    : undefined}
  {id}
>
  {@render children()}
</div>

<style>
  :where([data-panel-group-wrapper]) {
    height: 100%;
  }
</style>
