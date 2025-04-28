import React from "react";
import { test, expect, describe, vi } from "vitest";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import * as Cookies from "tiny-cookie";

import { PanelGroupHandle, PanelHandle } from "@window-splitter/interface";
import {
  Autosave,
  AutosaveCollapsible,
  Collapsible,
  ConditionalPanel,
  Simple,
  VerticalLayout,
  DynamicConstraints,
} from "./ReactWindowSplitter.stories.js";
import { PanelResizer, PanelGroup, Panel } from "./ReactWindowSplitter.js";
import { createTestUtils, dragHandle } from "@window-splitter/interface/test";

const { expectTemplate, waitForMeasurement, waitForCondition } =
  createTestUtils({ waitFor });

test("horizontal layout", async () => {
  const handle = { current: null } as unknown as {
    current: PanelGroupHandle;
  };
  const { getByText } = render(
    <div style={{ width: 500 }}>
      <Simple handle={handle} />
    </div>
  );

  await waitForMeasurement(handle.current);

  expect(getByText("Panel 1")).toBeInTheDocument();
  expect(getByText("Panel 2")).toBeInTheDocument();

  await expectTemplate(handle.current, "244px 10px 244px");

  // Should respect the min
  await dragHandle({ delta: 300 });
  await expectTemplate(handle.current, "388px 10px 100px");
});

test("vertical layout", async () => {
  const handle = { current: null } as unknown as {
    current: PanelGroupHandle;
  };
  const { getByText } = render(
    <div style={{ width: 500 }}>
      <VerticalLayout handle={handle} />
    </div>
  );

  await waitForMeasurement(handle.current);

  expect(getByText("top")).toBeInTheDocument();
  expect(getByText("middle")).toBeInTheDocument();
  expect(getByText("bottom")).toBeInTheDocument();

  await expectTemplate(handle.current, "96px 10px 108px 10px 96px");

  // Should respect the min
  await dragHandle({ delta: 100, orientation: "vertical" });
  await expectTemplate(handle.current, "172px 10px 64px 10px 64px");
});

test("Conditional Panels", async () => {
  const handle = { current: null } as unknown as {
    current: PanelGroupHandle;
  };
  const { getByText } = render(
    <div style={{ width: 500 }}>
      <ConditionalPanel handle={handle} />
    </div>
  );

  await waitForMeasurement(handle.current);
  await expectTemplate(handle.current, "244px 10px 244px");

  getByText("Expand").click();
  await expectTemplate(
    handle.current,
    "236.953125px 10px 141.046875px 10px 100px"
  );

  getByText("Close").click();
  await expectTemplate(handle.current, "236.96875px 10px 251.03125px");
});

test("Dynamic constraints", async () => {
  const handle = { current: null } as unknown as {
    current: PanelGroupHandle;
  };
  const { getByText } = render(
    <div style={{ width: 1000 }}>
      <DynamicConstraints handle={handle} />
    </div>
  );

  await waitForMeasurement(handle.current);
  await expectTemplate(handle.current, "100px 10px 178px 10px 700px");

  getByText("Toggle Custom").click();
  await expectTemplate(handle.current, "500px 10px 178px 10px 300px");

  getByText("Toggle Custom").click();
  await expectTemplate(handle.current, "400px 10px 178px 10px 400px");
});

describe("Autosave", () => {
  test("localStorage", async () => {
    localStorage.clear();

    const handle = { current: null } as unknown as {
      current: PanelGroupHandle;
    };

    render(
      <div style={{ width: 500 }}>
        <Autosave handle={handle} />
      </div>
    );

    await waitForMeasurement(handle.current);
    await expectTemplate(handle.current, "244px 10px 244px");

    await dragHandle({ delta: 100 });
    await expectTemplate(handle.current, "342px 10px 146px");

    await waitForCondition(() =>
      Boolean(localStorage.getItem("autosave-example"))
    );
    const obj = JSON.parse(localStorage.getItem("autosave-example") || "{}");
    expect(obj.items).toMatchSnapshot();
  });

  test("callback", async () => {
    localStorage.clear();

    const handle = { current: null } as unknown as {
      current: PanelGroupHandle;
    };

    const spy = vi.fn();

    render(
      <div style={{ width: 500 }}>
        <AutosaveCollapsible handle={handle} onCollapseChange={spy} />
      </div>
    );

    await dragHandle({ delta: -200 });
    await expectTemplate(handle.current, "100px 10px 388px");
    expect(spy).toHaveBeenCalledWith(true);

    cleanup();

    render(
      <div style={{ width: 500 }}>
        <AutosaveCollapsible handle={handle} onCollapseChange={spy} />
      </div>
    );

    await expectTemplate(handle.current, "100px 10px 388px");
    await dragHandle({ delta: 200 });
    expect(spy).toHaveBeenCalledWith(false);
  });

  test("cookie", async () => {
    // clear cookies
    document.cookie = "test=; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    const handle = { current: null } as unknown as {
      current: PanelGroupHandle;
    };

    render(
      <div style={{ width: 500 }}>
        <PanelGroup
          handle={handle}
          orientation="horizontal"
          autosaveId="autosave-cookie-example"
          autosaveStrategy="cookie"
          style={{ height: 200 }}
        >
          <Panel id="panel1">1</Panel>
          <PanelResizer
            id="resizer1"
            size="10px"
            style={{ background: "red" }}
          />
          <Panel id="panel2">2</Panel>
        </PanelGroup>
      </div>
    );

    await waitForMeasurement(handle.current);
    await expectTemplate(handle.current, "245px 10px 245px");

    await dragHandle({ delta: 100 });
    await expectTemplate(handle.current, "343px 10px 147px");

    await waitForCondition(() =>
      document.cookie.includes("autosave-cookie-example")
    );

    expect(document.cookie).toMatchSnapshot();

    const snapshot = Cookies.get("autosave-cookie-example");

    cleanup();

    render(
      <div style={{ width: 500 }}>
        <PanelGroup
          handle={handle}
          orientation="horizontal"
          autosaveId="autosave-cookie-example"
          autosaveStrategy="cookie"
          style={{ height: 200 }}
          snapshot={snapshot ? JSON.parse(snapshot) : undefined}
        >
          <Panel id="panel1">1</Panel>
          <PanelResizer
            id="resizer1"
            size="10px"
            style={{ background: "red" }}
          />
          <Panel id="panel2">2</Panel>
        </PanelGroup>
      </div>
    );

    await expectTemplate(handle.current, "343px 10px 147px");
  });
});

test("Keyboard interactions with collapsed panels", async () => {
  const handle = { current: null } as unknown as {
    current: PanelGroupHandle;
  };
  const rightHandle = { current: null } as unknown as {
    current: PanelHandle;
  };
  render(
    <div style={{ width: 500 }}>
      <Collapsible handle={handle} rightPanelHandle={rightHandle} />
    </div>
  );

  await waitForMeasurement(handle.current);
  await expectTemplate(handle.current, "209px 10px 209px 10px 60px");

  const resizer2 = document.getElementById("resizer-2")!;
  fireEvent.keyDown(resizer2, { key: "Enter" });
  await expectTemplate(
    handle.current,
    "209px 10px 168.953125px 10px 100.03125px"
  );

  fireEvent.keyDown(resizer2, { key: "ArrowLeft" });
  fireEvent.keyDown(resizer2, { key: "ArrowLeft" });
  fireEvent.keyDown(resizer2, { key: "ArrowLeft" });
  fireEvent.keyDown(resizer2, { key: "ArrowLeft" });
  await expectTemplate(
    handle.current,
    "209px 10px 164.96875px 10px 104.03125px"
  );

  fireEvent.keyDown(resizer2, { key: "ArrowLeft", shiftKey: true });
  await expectTemplate(
    handle.current,
    "209px 10px 149.96875px 10px 119.03125px"
  );

  fireEvent.keyDown(resizer2, { key: "Enter" });
  await expectTemplate(handle.current, "209px 10px 209px 10px 60px");

  fireEvent.keyDown(resizer2, { key: "Enter" });
  await expectTemplate(
    handle.current,
    "209px 10px 149.96875px 10px 119.03125px"
  );
});

describe("imperative panel API", async () => {
  test("panel group", async () => {
    const handle = { current: null } as unknown as {
      current: PanelGroupHandle;
    };

    render(
      <div style={{ width: 500 }}>
        <Collapsible handle={handle} />
      </div>
    );

    await waitForMeasurement(handle.current);

    expect(handle.current.getPercentageSizes()).toMatchInlineSnapshot(`
      [
        0.5,
        0.020080321285140562,
        0.5,
        0.020080321285140562,
        0.12048192771084337,
      ]
    `);

    expect(handle.current.getPixelSizes()).toMatchInlineSnapshot(`
      [
        209,
        10,
        209,
        10,
        60,
      ]
    `);

    await expectTemplate(handle.current, "209px 10px 209px 10px 60px");
  });

  test("panel", async () => {
    const handle = { current: null } as unknown as {
      current: PanelGroupHandle;
    };
    const rightHandle = { current: null } as unknown as {
      current: PanelHandle;
    };
    const leftHandle = { current: null } as unknown as {
      current: PanelHandle;
    };

    render(
      <div style={{ width: 500 }}>
        <Collapsible
          handle={handle}
          leftPanelHandle={leftHandle}
          rightPanelHandle={rightHandle}
        />
      </div>
    );

    await waitForMeasurement(handle.current);

    expect(rightHandle.current.isCollapsed()).toBe(true);
    expect(rightHandle.current.isExpanded()).toBe(false);

    rightHandle.current.expand();
    await new Promise((resolve) => setTimeout(resolve, 2000));

    expect(rightHandle.current.isCollapsed()).toBe(false);
    expect(rightHandle.current.isExpanded()).toBe(true);

    rightHandle.current.collapse();
    await new Promise((resolve) => setTimeout(resolve, 2000));

    expect(rightHandle.current.isCollapsed()).toBe(true);
    expect(rightHandle.current.isExpanded()).toBe(false);

    // Test the non controlled version

    expect(leftHandle.current.isCollapsed()).toBe(false);
    expect(leftHandle.current.isExpanded()).toBe(true);

    leftHandle.current.collapse();
    await new Promise((resolve) => setTimeout(resolve, 2000));

    expect(leftHandle.current.isCollapsed()).toBe(true);
    expect(leftHandle.current.isExpanded()).toBe(false);
    expect(rightHandle.current.getPercentageSize()).toBe(
      leftHandle.current.getPercentageSize()
    );
    expect(rightHandle.current.getPixelSize()).toBe(
      leftHandle.current.getPixelSize()
    );

    leftHandle.current.expand();
    await new Promise((resolve) => setTimeout(resolve, 5000));

    expect(leftHandle.current.isCollapsed()).toBe(false);
    expect(leftHandle.current.isExpanded()).toBe(true);
  });
});
