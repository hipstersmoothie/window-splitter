import { onCleanup, onMount } from "solid-js";
import { CounterProvider, useCounter } from "./CounterContext";
import { Panel, PanelGroup, PanelResizer } from "./index";

const title = "Count";

function Count() {
  d;
  const counter = useCounter();
  onMount(() => {
    console.log("Mounted Count");
  });
  onCleanup(() => {
    console.log("Unmounted Count");
  });
  return (
    <h1>
      {title}: {counter.value()}
    </h1>
  );
}

function Increment() {
  const counter = useCounter();
  onMount(() => {
    console.log("Mounted Increment");
  });
  onCleanup(() => {
    console.log("Unmounted Increment");
  });
  return <button onClick={counter.increment}>Increment</button>;
}

function Decrement() {
  const counter = useCounter();
  onMount(() => {
    console.log("Mounted Decrement");
  });
  onCleanup(() => {
    console.log("Unmounted Decrement");
  });
  return <button onClick={counter.decrement}>Decrement</button>;
}

export default function App() {
  return (
    <PanelGroup>
      <Panel
        id="panel-0"
        style={{ background: "red", color: "white", padding: "20px" }}
        min="100px"
      >
        Panel 0
      </Panel>
      <PanelResizer
        id="resizer-0"
        style={{ background: "green", height: "100%" }}
        size="10px"
      />
      <Panel
        id="panel-1"
        style={{ background: "red", color: "white", padding: "20px" }}
        min="100px"
      >
        Panel 1
      </Panel>
      <PanelResizer
        id="resizer-1"
        style={{ background: "green", height: "100%" }}
        size="10px"
      />
      <Panel
        id="panel-2"
        style={{ background: "blue", color: "white", padding: "20px" }}
        max="50%"
        min="200px"
        collapsedSize="100px"
        collapsible
      >
        Panel 2
      </Panel>
    </PanelGroup>
  );
}
