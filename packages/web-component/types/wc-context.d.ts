declare module "wc-context" {
  export function createContext<T>(name: string): void;
}

declare module "wc-context/lit.js" {
  export function withContext<T>(component: T): T;
}

declare module "wc-context/controllers.js" {
  import { LitElement } from "lit";
  export class ContextConsumer<T> {
    constructor(
      component: LitElement,
      context: string,
      onChange: (value: T) => void
    );
    value: T;
  }
}
