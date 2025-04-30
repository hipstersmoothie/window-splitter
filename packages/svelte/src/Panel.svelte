<script lang="ts">
  import type { SharedPanelProps } from "@window-splitter/interface";
  import { getContext } from "svelte";
  import { initializePanel, isPanelData } from "@window-splitter/state";
  import { getPanelDomAttributes } from "@window-splitter/interface";

  interface Props extends SharedPanelProps<boolean> {}

  let {
    children,
    min,
    max,
    id: _id,
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
  }: Props = $props();

  const id = $props.id();
  const send = getContext("send");
  const state = getContext("state");

  const initPanel = (): PanelData =>
    initializePanel({
      id,
      min,
      max,
      collapsible,
      collapsed,
      collapsedSize,
      onCollapseChange,
      collapseAnimation,
      onResize,
      defaultCollapsed,
      default: defaultSize,
      isStaticAtRest,
    });

  send({ type: "registerPanel", data: initPanel() });

  const panelData = () => {
    const item = state?.items.find((i) => i.id === id);
    if (!item || !isPanelData(item)) return undefined;
    return item;
  };

  const domAttributes = () => {
    const currentPanel = panelData();

    return getPanelDomAttributes({
      groupId: state.groupId,
      id,
      collapsible: currentPanel?.collapsible,
      collapsed: currentPanel?.collapsed,
    });
  };
</script>

<div {...attrs} {...domAttributes()}>
  {@render children()}
</div>
