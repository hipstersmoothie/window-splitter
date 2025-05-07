import { css, html, LitElement } from "lit";
import { spring } from "framer-motion";
import { Panel, WindowSplitter, PanelResizer } from ".";
import { property } from "lit/decorators.js";
import { when } from "lit/directives/when.js";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
export default {
  title: "WindowSplitter/WebComponent",
};

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Simple = {
  render: () => html`
    <window-splitter class="panel-group">
      <window-panel class="panel">Panel 1</window-panel>
      <window-panel-resizer
        size="10px"
        class="panel-resizer"
      ></window-panel-resizer>
      <window-panel min="100px" class="panel">Panel 2</window-panel>
    </window-splitter>
  `,
};

export const Autosave = {
  render: () => html`
    <window-splitter
      autosaveId="autosave-example-web-component"
      class="panel-group"
    >
      <window-panel class="panel" id="1">Panel 1</window-panel>
      <window-panel-resizer
        size="10px"
        class="panel-resizer"
      ></window-panel-resizer>
      <window-panel class="panel" id="2">Panel 2</window-panel>
    </window-splitter>
  `,
};

export const AutosaveCookie = {
  render: () => html`
    <window-splitter
      autosaveId="autosave-example-web-component"
      autosaveStrategy="cookie"
      class="panel-group"
      style="height: 200px"
    >
      <window-panel class="panel" id="1">Panel 1</window-panel>
      <window-panel-resizer
        size="10px"
        class="panel-resizer"
      ></window-panel-resizer>
      <window-panel class="panel" id="2">Panel 2</window-panel>
    </window-splitter>
  `,
};

export const AutosaveCollapsible = {
  render: () => html`
    <window-splitter
      autosaveId="autosave-example-web-component-2"
      class="panel-group"
    >
      <window-panel
        class="panel"
        id="1"
        collapsible
        collapsedSize="100px"
        min="140px"
        onCollapseChange=${(e) => console.log(e)}
      >
        Panel 1
      </window-panel>
      <window-panel-resizer
        size="10px"
        class="panel-resizer"
      ></window-panel-resizer>
      <window-panel class="panel" id="2">Panel 2</window-panel>
    </window-splitter>
  `,
};

// TODO: Add dynamic constraints

export const SimpleMin = {
  render: () => html`
    <window-splitter class="panel-group">
      <window-panel min="100px" class="panel">Panel 1</window-panel>
      <window-panel-resizer
        size="10px"
        class="panel-resizer"
      ></window-panel-resizer>
      <window-panel min="100px" class="panel">Panel 2</window-panel>
      <window-panel-resizer
        size="10px"
        class="panel-resizer"
      ></window-panel-resizer>
      <window-panel min="100px" class="panel">Panel 3</window-panel>
    </window-splitter>
  `,
};

export const SimpleMinMax = {
  render: () => html`
    <window-splitter class="panel-group">
      <window-panel min="100px" max="200px" class="panel">Panel 1</window-panel>
      <window-panel-resizer
        size="10px"
        class="panel-resizer"
      ></window-panel-resizer>
      <window-panel min="100px" class="panel">Panel 2</window-panel>
      <window-panel-resizer
        size="20px"
        class="panel-resizer"
      ></window-panel-resizer>
      <window-panel min="100px" class="panel">Panel 3</window-panel>
    </window-splitter>
  `,
};

export const SimpleConstraints = {
  render: () => html`
    <window-splitter class="panel-group">
      <window-panel min="100px" max="50%" class="panel">Panel 1</window-panel>
      <window-panel-resizer
        size="10px"
        class="panel-resizer"
      ></window-panel-resizer>
      <window-panel class="panel">Panel 2</window-panel>
    </window-splitter>
  `,
};

export const HorizontalLayout = {
  render: () => html`
    <window-splitter class="panel-group" orientation="horizontal">
      <window-panel default="30%" min="20%" class="panel">Left</window-panel>
      <window-panel-resizer
        size="10px"
        class="panel-resizer"
      ></window-panel-resizer>
      <window-panel min="20%" class="panel">Middle</window-panel>
      <window-panel-resizer
        size="10px"
        class="panel-resizer"
      ></window-panel-resizer>
      <window-panel default="30%" min="20%" class="panel">Panel 3</window-panel>
    </window-splitter>
  `,
};

export const VerticalLayout = {
  render: () => html`
    <window-splitter
      class="panel-group"
      orientation="vertical"
      style="height: 322px"
    >
      <window-panel default="30%" min="20%" class="panel">Top</window-panel>
      <window-panel-resizer
        size="10px"
        class="panel-resizer"
      ></window-panel-resizer>
      <window-panel min="20%" class="panel">Middle</window-panel>
      <window-panel-resizer
        size="10px"
        class="panel-resizer"
      ></window-panel-resizer>
      <window-panel default="30%" min="20%" class="panel">Bottom</window-panel>
    </window-splitter>
  `,
};

export const VerticalLayout2 = {
  render: () => html`
    <window-splitter
      class="panel-group"
      orientation="vertical"
      style="height: calc(100vh - 100px)"
    >
      <window-panel default="200px" min="200px" class="panel">top</window-panel>
      <window-panel-resizer
        size="10px"
        class="panel-resizer"
      ></window-panel-resizer>
      <window-panel
        min="200px"
        collapsedSize="60px"
        defaultCollapsed
        collapsible
        class="panel"
      >
        middle
      </window-panel>
    </window-splitter>
  `,
};

export const NestedGroups = {
  render: () => html`
    <window-splitter
      class="panel-group"
      orientation="horizontal"
      style="border: 1px solid rgba(0, 0, 0, 0.3); border-radius: 12px; height: 400px"
    >
      <window-panel min="10%">1</window-panel>
      <window-panel-resizer
        size="10px"
        class="panel-resizer"
      ></window-panel-resizer>
      <window-panel min="10%">
        <window-splitter orientation="vertical">
          <window-panel min="10%">2-1</window-panel>
          <window-panel-resizer
            size="10px"
            class="panel-resizer"
          ></window-panel-resizer>
          <window-panel min="10%">
            <window-splitter orientation="horizontal">
              <window-panel min="20%">2-2-1</window-panel>
              <window-panel-resizer
                size="10px"
                class="panel-resizer"
              ></window-panel-resizer>
              <window-panel min="20%">2-2-2</window-panel>
            </window-splitter>
          </window-panel>
        </window-splitter>
      </window-panel>
      <window-panel-resizer
        size="10px"
        class="panel-resizer"
      ></window-panel-resizer>
      <window-panel min="10%">3</window-panel>
    </window-splitter>
  `,
};

export const WithOverflow = {
  render: () => html`
    <window-splitter class="panel-group" style="height: 400px">
      <window-panel min="200px">
        <div
          style="
            overflow: auto;
            padding: 40px;
            height: 100%;
            box-sizing: border-box;
          "
        >
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
            euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi, eu
            tincidunt nisl nisl eu nisl. Sed euismod, nisl eget ultricies
            ultrices, nunc nisi aliquam nisi, eu tincidunt nisl nisl eu nisl.
            Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
            eu tincidunt nisl nisl eu nisl.
          </p>
          <p>
            Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
            eu tincidunt nisl nisl eu nisl. Sed euismod, nisl eget ultricies
            ultrices, nunc nisi aliquam nisi, eu tincidunt nisl nisl eu nisl.
            Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
            eu tincidunt nisl nisl eu nisl.
          </p>
          <p>
            Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
            eu tincidunt nisl nisl eu nisl. Sed euismod, nisl eget ultricies
            ultrices, nunc nisi aliquam nisi, eu tincidunt nisl nisl eu nisl.
            Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
            eu tincidunt nisl nisl eu nisl.
          </p>
          <p>
            Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
            eu tincidunt nisl nisl eu nisl. Sed euismod, nisl eget ultricies
            ultrices, nunc nisi aliquam nisi, eu tincidunt nisl nisl eu nisl.
            Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
            eu tincidunt nisl nisl eu nisl.
          </p>
          <p>
            Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
            eu tincidunt nisl nisl eu nisl. Sed euismod, nisl eget ultricies
            ultrices, nunc nisi aliquam nisi, eu tincidunt nisl nisl eu nisl.
            Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
            eu tincidunt nisl nisl eu nisl.
          </p>
        </div>
      </window-panel>
      <window-panel-resizer
        size="10px"
        class="panel-resizer"
      ></window-panel-resizer>
      <window-panel min="200px">
        <div
          style="
            overflow: auto;
            padding: 40px;
            height: 100%;
            box-sizing: border-box;
          "
        >
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
            euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi, eu
            tincidunt nisl nisl eu nisl. Sed euismod, nisl eget ultricies
            ultrices, nunc nisi aliquam nisi, eu tincidunt nisl nisl eu nisl.
            Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
            eu tincidunt nisl nisl eu nisl.
          </p>
          <p>
            Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
            eu tincidunt nisl nisl eu nisl. Sed euismod, nisl eget ultricies
            ultrices, nunc nisi aliquam nisi, eu tincidunt nisl nisl eu nisl.
            Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
            eu tincidunt nisl nisl eu nisl.
          </p>
          <p>
            Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
            eu tincidunt nisl nisl eu nisl. Sed euismod, nisl eget ultricies
            ultrices, nunc nisi aliquam nisi, eu tincidunt nisl nisl eu nisl.
            Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
            eu tincidunt nisl nisl eu nisl.
          </p>
          <p>
            Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
            eu tincidunt nisl nisl eu nisl. Sed euismod, nisl eget ultricies
            ultrices, nunc nisi aliquam nisi, eu tincidunt nisl nisl eu nisl.
            Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
            eu tincidunt nisl nisl eu nisl.
          </p>
          <p>
            Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
            eu tincidunt nisl nisl eu nisl. Sed euismod, nisl eget ultricies
            ultrices, nunc nisi aliquam nisi, eu tincidunt nisl nisl eu nisl.
            Sed euismod, nisl eget ultricies ultrices, nunc nisi aliquam nisi,
            eu tincidunt nisl nisl eu nisl.
          </p>
        </div>
      </window-panel>
    </window-splitter>
  `,
};

export const Collapsible = {
  render: () => html`
    <window-splitter class="panel-group">
      <window-panel
        class="panel"
        min="100px"
        collapsible
        collapsedSize="60px"
        style="border: 10px solid green; box-sizing: border-box"
        .onCollapseChange=${(e) => console.log("COLLAPSE PASSIVE", e)}
      >
        Panel 1
      </window-panel>
      <window-panel-resizer
        size="10px"
        class="panel-resizer"
      ></window-panel-resizer>
      <window-panel min="100px" class="panel">Panel 2</window-panel>
      <window-panel-resizer
        size="10px"
        class="panel-resizer"
      ></window-panel-resizer>
      <window-panel
        id="panel-3"
        min="100px"
        class="panel"
        collapsible
        .collapseAnimation=${{ duration: 1000, easing: "bounce" }}
        collapsedSize="60px"
        style="border: 10px solid blue; box-sizing: border-box"
        collapsed=${true}
        .onCollapseChange=${(newCollapsed, el) => {
          el.collapsed = newCollapsed;
        }}
      >
        Panel 3
      </window-panel>
    </window-splitter>
  `,
};

const springFn = spring({
  keyframes: [0, 1],
  velocity: 1,
  stiffness: 100,
  damping: 10,
  mass: 1.0,
});

export const CustomCollapseAnimation = {
  render: () => html`
    <window-splitter class="panel-group">
      <window-panel
        class="panel"
        min="100px"
        collapsible
        collapsedSize="60px"
        style="border: 10px solid green; box-sizing: border-box"
      >
        Panel 1
      </window-panel>
      <window-panel-resizer
        size="10px"
        class="panel-resizer"
      ></window-panel-resizer>
      <window-panel min="100px" class="panel">Panel 2</window-panel>
      <window-panel-resizer
        size="10px"
        class="panel-resizer"
      ></window-panel-resizer>
      <window-panel
        class="panel"
        style="border: 10px solid blue; box-sizing: border-box"
        min="100px"
        collapsible
        collapsedSize="60px"
        defaultCollapsed
        .collapseAnimation=${{
          easing: (t) => springFn.next(t * 1000).value,
          duration: 1000,
        }}
      >
        Panel 3
      </window-panel>
    </window-splitter>
  `,
};

// imperative

class ConditionalPanelElement extends LitElement {
  static properties = {
    isExpanded: { type: Boolean },
  };

  // pass through class styles
  static styles = css`
    window-splitter {
      border: 1px solid rgba(0, 0, 0, 0.3);
      background: rgba(0, 0, 0, 0.1);
      border-radius: 12px;
      box-sizing: border-box;
      min-width: 500px;
      display: block;
    }

    window-panel {
      height: 100%;
      width: 100%;
      padding: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      box-sizing: border-box;
    }

    window-panel-resizer {
      background: red;
    }
  `;
  render() {
    return html`
      <window-splitter class="panel-group">
        <window-panel
          id="panel-1"
          min="100px"
          collapsible
          collapsedSize="60px"
          class="panel"
        >
          1
        </window-panel>
        <window-panel-resizer
          id="handle-1"
          size="10px"
          class="panel-resizer"
        ></window-panel-resizer>
        <window-panel id="panel-2" min="100px" class="panel">2</window-panel>

        ${when(
          this.isExpanded,
          () => html`
            <window-panel-resizer
              id="handle-2"
              size="10px"
              class="panel-resizer"
            ></window-panel-resizer>
            <window-panel id="panel-3" min="100px" class="panel">
              3
              <button type="button" @click=${() => (this.isExpanded = false)}>
                Close
              </button>
            </window-panel>
          `
        )}
      </window-splitter>

      <button type="button" @click=${() => (this.isExpanded = true)}>
        Expand
      </button>
    `;
  }
}

customElements.define("conditional-panel", ConditionalPanelElement);

export const ConditionalPanel = {
  render: () => html`<conditional-panel></conditional-panel>`,
};

// complex conditional

export const WithDefaultWidth = {
  render: () => html`
    <window-splitter class="panel-group" style="height: 400px">
      <window-panel style="background-color: #333366"></window-panel>
      <window-panel-resizer size="3px"></window-panel-resizer>
      <window-panel
        style="background-color: #ff3366"
        default="100px"
        min="100px"
        max="400px"
      >
      </window-panel>
    </window-splitter>
  `,
};

export const StaticAtRest = {
  render: () => html`
    <window-splitter class="panel-group" style="height: 200px">
      <window-panel min="100px" max="300px" class="panel" isStaticAtRest>
        Panel 1
      </window-panel>
      <window-panel-resizer
        size="10px"
        class="panel-resizer"
      ></window-panel-resizer>
      <window-panel min="100px" class="panel">Panel 2</window-panel>
      <window-panel-resizer
        size="10px"
        class="panel-resizer"
      ></window-panel-resizer>
      <window-panel min="100px" class="panel">Panel 3</window-panel>
    </window-splitter>
  `,
};
