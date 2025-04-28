/* eslint-disable @eslint-react/no-unstable-context-value */
import { createContext, useContext, Accessor, JSXElement } from "solid-js";
import { GroupMachineContextValue, SendFn } from "@window-splitter/state";

export const InitialPrerenderContext = createContext<Accessor<boolean>>(
  () => false
);
export const PrerenderContext = createContext<boolean>(false);
export const MachineActorContext = createContext<SendFn | undefined>();
export const GroupIdContext = createContext<string | undefined>();
export const MachineStateContext = createContext<
  Accessor<GroupMachineContextValue | undefined> | undefined
>();

// Helper hooks to enforce proper context usage
export function usePrerenderContext() {
  const context = useContext(PrerenderContext);
  return context;
}

export function useInitialPrerenderContext() {
  const context = useContext(InitialPrerenderContext);
  return context;
}

export function useMachineActor() {
  const context = useContext(MachineActorContext);
  return context;
}

export function useGroupId() {
  const context = useContext(GroupIdContext);
  return context;
}

export function useMachineState() {
  const context = useContext(MachineStateContext);
  return context;
}

// Create a provider component that bundles all the contexts together
export function GroupMachineProvider(props: {
  children: JSXElement;
  groupId: string;
  send: SendFn;
  state: Accessor<GroupMachineContextValue | undefined>;
  prerender?: boolean;
  initialPrerender?: Accessor<boolean>;
}) {
  return (
    <InitialPrerenderContext.Provider
      value={props.initialPrerender ?? (() => false)}
    >
      <PrerenderContext.Provider value={props.prerender ?? false}>
        <GroupIdContext.Provider value={props.groupId}>
          <MachineActorContext.Provider value={props.send}>
            <MachineStateContext.Provider value={props.state}>
              {props.children}
            </MachineStateContext.Provider>
          </MachineActorContext.Provider>
        </GroupIdContext.Provider>
      </PrerenderContext.Provider>
    </InitialPrerenderContext.Provider>
  );
}
