import { createContext } from "solid-js";

export const PanelContextTest = createContext({
  registerPanel: () => {
    throw new Error("PanelContext not initialized");
  },
});
