<script lang="ts">
  import type { SharedPanelProps } from "@window-splitter/interface";
  import { getContext } from "svelte";
  import {
    initializePanel,
    isPanelData,
    haveConstraintsChangedForPanel,
    getPanelPercentageSize,
    getPanelPixelSize,
  } from "@window-splitter/state";
  import { getPanelDomAttributes } from "@window-splitter/interface";

  export { PanelHandle } from "@window-splitter/interface";

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

  const defaultId = $props.id();
  const id = _id || defaultId;
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
      onCollapseChange: { current: onCollapseChange },
      collapseAnimation,
      onResize: { current: onResize },
      defaultCollapsed,
      default: defaultSize,
      isStaticAtRest,
    });

  const isPrerender = getContext("isPrerender");
  const panelData = () => {
    const item = state?.items.find((i) => i.id === id);
    if (!item || !isPanelData(item)) return undefined;
    return item;
  };

  let dynamicPanelIsMounting = false;

  if (panelData()) {
    send({
      type: "rebindPanelCallbacks",
      data: {
        id,
        onCollapseChange: { current: onCollapseChange },
        onResize: { current: onResize },
      },
    });
  } else {
    if (isPrerender.current) {
      send({ type: "registerPanel", data: initPanel() });
    } else {
      dynamicPanelIsMounting = true;
    }
  }

  const contraintChanged = $derived(
    !dynamicPanelIsMounting &&
      haveConstraintsChangedForPanel(initPanel(), panelData())
  );

  $effect(() => {
    if (!contraintChanged) return;
    send({ type: "updateConstraints", data: initPanel() });
  });

  const dynamicPanelData = initPanel();

  $effect(() => {
    if (!dynamicPanelIsMounting) return;

    const groupElement = document.getElementById(state.groupId);

    if (!groupElement) return;

    const order = Array.from(groupElement.children).indexOf(
      document.getElementById(id)
    );

    if (typeof order !== "number") return;

    send({
      type: "registerDynamicPanel",
      data: { ...dynamicPanelData, order },
    });
    dynamicPanelIsMounting = false;
  });

  $effect(() => () => send({ type: "unregisterPanel", id }));

  const isControlledCollapse = $derived(panelData()?.collapseIsControlled);

  $effect(() => {
    if (!isControlledCollapse) return;

    if (collapsed) {
      send?.({ type: "collapsePanel", panelId: id, controlled: true });
    } else {
      send?.({ type: "expandPanel", panelId: id, controlled: true });
    }
  });

  const domAttributes = () => {
    const currentPanel = panelData();

    return getPanelDomAttributes({
      groupId: state.groupId,
      id,
      collapsible: currentPanel?.collapsible,
      collapsed: currentPanel?.collapsed,
    });
  };

  export const getId = () => id;
  export const collapse = () => {
    if (!panelData()?.collapsible) return;
    send({ type: "collapsePanel", panelId: id, controlled: true });
  };
  export const isCollapsed = () =>
    Boolean(panelData()?.collapsible && panelData()?.collapsed);
  export const expand = () => {
    if (!panelData()?.collapsible) return;
    send({ type: "expandPanel", panelId: id, controlled: true });
  };
  export const isExpanded = () =>
    Boolean(panelData()?.collapsible && !panelData()?.collapsed);
  export const getPixelSize = () => getPanelPixelSize(state, id);
  export const setSize = (size: Unit) => {
    send({ type: "setPanelPixelSize", panelId: id, size });
  };
  export const getPercentageSize = () => getPanelPercentageSize(state, id);
</script>

<div
  {...attrs}
  {...domAttributes()}
  style:min-width={0}
  style:min-height={0}
  style:overflow="hidden"
>
  {@render children()}
</div>
