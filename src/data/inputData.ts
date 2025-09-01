import type { InputData } from '../types';

export const input2: InputData = {
  W: 8,
  H: 8,
  blocks: [
    { id: "A", x: 4, y: 3, w: 2, h: 1, orientation: "H" },
    { id: "B", x: 3, y: 5, w: 1, h: 2, orientation: "V" },
    { id: "C", x: 3, y: 3, w: 1, h: 2, orientation: "V" },
    { id: "D", x: 1, y: 1, w: 2, h: 2, orientation: "H" },
  ],
};

export const input: InputData = {
  W: 6,
  H: 6,
  blocks: [
    { id: "A", x: 2, y: 0, w: 3, h: 1, orientation: "H" },
    { id: "B", x: 5, y: 0, w: 1, h: 2, orientation: "V" },
    { id: "C", x: 3, y: 2, w: 2, h: 1, orientation: "H" },
    { id: "D", x: 3, y: 3, w: 2, h: 1, orientation: "H" },
    { id: "E", x: 5, y: 2, w: 1, h: 3, orientation: "V" },
    { id: "F", x: 2, y: 3, w: 1, h: 3, orientation: "V" },
    { id: "G", x: 3, y: 5, w: 3, h: 1, orientation: "H" },
  ],
};
