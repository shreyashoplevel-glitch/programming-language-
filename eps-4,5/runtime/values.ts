export type ValuesType = "Null" | "Number" | "Boolean" | "Object";

export interface RunTimeVal {
  type: ValuesType;
}

export interface NullVal extends RunTimeVal {
  type: "Null";
  value: null;
}

export interface NumberVal extends RunTimeVal {
  type: "Number";
  value: number;
}

export interface BooleanVal extends RunTimeVal {
  type: "Boolean";
  value: boolean;
}

export interface ObjectVal extends RunTimeVal {
  type: "Object";
  properties: Map<string, RunTimeVal>;
}
