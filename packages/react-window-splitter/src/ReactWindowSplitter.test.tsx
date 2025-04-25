import React from "react";
import { test, expect, describe, vi } from "vitest";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import * as Cookies from "tiny-cookie";

import {
  Autosave,
  AutosaveCollapsible,
  Collapsible,
  ConditionalPanel,
  Simple,
  VerticalLayout,
  DynamicConstraints,
} from "./ReactWindowSplitter.stories.js";
import {
  PanelGroupHandle,
  PanelResizer,
  PanelHandle,
  PanelGroup,
  Panel,
} from "./index.js";

async function dragHandle(options: {
  handleId?: string;
  delta: number;
  orientation?: "horizontal" | "vertical";
}) {
  const orientation = options.orientation || "horizontal";
  const handle = document.querySelector(
    options.handleId
      ? `[data-splitter-id="${options.handleId}"]`
      : '[data-splitter-type="handle"]'
  );

  if (!handle) {
    throw new Error(`Handle not found: ${options.handleId}`);
  }

  const rect = handle.getBoundingClientRect();
  const x = rect.x + rect.width / 2;
  const y = rect.y + rect.height / 2;
  const step = options.delta > 0 ? 1 : -1;
  const pointerId = 1;

  handle.dispatchEvent(
    new PointerEvent("pointerdown", {
      bubbles: true,
      clientX: x,
      clientY: y,
      pointerId,
      button: 0,
    })
  );

  for (let i = 0; i < Math.abs(options.delta - 1); i++) {
    handle.dispatchEvent(
      new PointerEvent("pointermove", {
        bubbles: true,
        pointerId,
        clientX: orientation === "horizontal" ? x + i * step : x,
        clientY: orientation === "vertical" ? y + i * step : y,
      })
    );
    await new Promise((r) => setTimeout(r, 10));
  }

  handle.dispatchEvent(
    new PointerEvent("pointerup", {
      bubbles: true,
      pointerId,
      clientX: orientation === "horizontal" ? x + options.delta : x,
      clientY: orientation === "vertical" ? y + options.delta : y,
    })
  );
}

async function waitForMeasurement(handle: PanelGroupHandle) {
  await waitForCondition(() => !handle.getTemplate().includes("minmax"));
  await new Promise((resolve) => setTimeout(resolve, 100));
}

function waitForCondition(condition: () => boolean) {
  const stack = new Error().stack;

  return waitFor(
    () => {
      if (!condition()) {
        const error = new Error("Not ready");
        error.stack = stack;
        throw error;
      }
    },
    {
      timeout: 10_000,
    }
  );
}

async function expectTemplate(
  handle: { current: PanelGroupHandle },
  resolvedTemplate: string
) {
  const stack = new Error().stack;
  let template;

  await waitFor(
    () => {
      template = handle.current.getTemplate();

      if (!template.includes(resolvedTemplate)) {
        const e = new Error(
          `\nExpected: ${resolvedTemplate}\nGot     : ${template}`
        );
        e.stack = stack;
        throw e;
      }

      if (handle.current.getState() !== "idle") {
        const e = new Error(
          `\nExpected: idle\nGot     : ${handle.current.getState()}`
        );
        e.stack = stack;
        throw e;
      }
    },
    {
      timeout: 2_000,
    }
  );

  expect(template).toBe(resolvedTemplate);
}

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

  await expectTemplate(handle, "244px 10px 244px");

  // Should respect the min
  await dragHandle({ delta: 300 });
  await expectTemplate(handle, "388px 10px 100px");
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

  await expectTemplate(handle, "96px 10px 108px 10px 96px");

  // Should respect the min
  await dragHandle({ delta: 100, orientation: "vertical" });
  await expectTemplate(handle, "172px 10px 64px 10px 64px");
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
  await expectTemplate(handle, "244px 10px 244px");

  getByText("Expand").click();
  await expectTemplate(handle, "236.953125px 10px 141.046875px 10px 100px");

  getByText("Close").click();
  await expectTemplate(handle, "236.953125px 10px 251.03125px");
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
  await expectTemplate(handle, "100px 10px 178px 10px 700px");

  getByText("Toggle Custom").click();
  await expectTemplate(handle, "500px 10px 178px 10px 300px");

  getByText("Toggle Custom").click();
  await expectTemplate(handle, "400px 10px 178px 10px 400px");
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
    await expectTemplate(handle, "244px 10px 244px");

    await dragHandle({ delta: 100 });
    await expectTemplate(handle, "342px 10px 146px");

    await waitForCondition(() =>
      Boolean(localStorage.getItem("autosave-example"))
    );
    const obj = JSON.parse(localStorage.getItem("autosave-example") || "{}");
    expect(obj.items).toMatchSnapshot();
  });

  test.only("callback", async () => {
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
    await expectTemplate(handle, "100px 10px 388px");
    expect(spy).toHaveBeenCalledWith(true);

    cleanup();

    render(
      <div style={{ width: 500 }}>
        <AutosaveCollapsible handle={handle} onCollapseChange={spy} />
      </div>
    );

    await expectTemplate(handle, "100px 10px 388px");
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
    await expectTemplate(handle, "245px 10px 245px");

    await dragHandle({ delta: 100 });
    await expectTemplate(handle, "343px 10px 147px");

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

    await expectTemplate(handle, "343px 10px 147px");
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
  await expectTemplate(handle, "209px 10px 209px 10px 60px");

  const resizer2 = document.getElementById("resizer-2")!;
  fireEvent.keyDown(resizer2, { key: "Enter" });
  await expectTemplate(handle, "209px 10px 168.953125px 10px 100.03125px");

  fireEvent.keyDown(resizer2, { key: "ArrowLeft" });
  fireEvent.keyDown(resizer2, { key: "ArrowLeft" });
  fireEvent.keyDown(resizer2, { key: "ArrowLeft" });
  fireEvent.keyDown(resizer2, { key: "ArrowLeft" });
  await expectTemplate(handle, "209px 10px 164.96875px 10px 104.03125px");

  fireEvent.keyDown(resizer2, { key: "ArrowLeft", shiftKey: true });
  await expectTemplate(handle, "209px 10px 149.96875px 10px 119.03125px");

  fireEvent.keyDown(resizer2, { key: "Enter" });
  await expectTemplate(handle, "209px 10px 209px 10px 60px");

  fireEvent.keyDown(resizer2, { key: "Enter" });
  await expectTemplate(handle, "209px 10px 149.96875px 10px 119.03125px");
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

    await expectTemplate(handle, "209px 10px 209px 10px 60px");
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
    await waitForCondition(() =>
      handle.current.getTemplate().endsWith("100px")
    );

    expect(rightHandle.current.isCollapsed()).toBe(false);
    expect(rightHandle.current.isExpanded()).toBe(true);

    rightHandle.current.collapse();
    await waitForCondition(() => handle.current.getTemplate().endsWith("60px"));

    expect(rightHandle.current.isCollapsed()).toBe(true);
    expect(rightHandle.current.isExpanded()).toBe(false);

    // Test the non controlled version

    expect(leftHandle.current.isCollapsed()).toBe(false);
    expect(leftHandle.current.isExpanded()).toBe(true);

    leftHandle.current.collapse();
    await waitForCondition(() =>
      handle.current.getTemplate().startsWith("60px")
    );

    expect(leftHandle.current.isCollapsed()).toBe(true);
    expect(leftHandle.current.isExpanded()).toBe(false);
    expect(rightHandle.current.getPercentageSize()).toBe(
      leftHandle.current.getPercentageSize()
    );
    expect(rightHandle.current.getPixelSize()).toBe(
      leftHandle.current.getPixelSize()
    );

    leftHandle.current.expand();
    await waitForCondition(
      () => !handle.current.getTemplate().startsWith("60px")
    );

    expect(leftHandle.current.isCollapsed()).toBe(false);
    expect(leftHandle.current.isExpanded()).toBe(true);
  });
});
