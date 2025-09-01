export type Block = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  orientation: "H" | "V";
};

export type MoveState = Record<string, number>;

export type InputData = {
  W: number;
  H: number;
  blocks: Block[];
};
