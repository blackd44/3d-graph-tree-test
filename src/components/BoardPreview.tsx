import type { Block, MoveState } from "../types";

interface BoardPreviewProps {
  W: number;
  H: number;
  blocks: Block[];
  state: MoveState;
}

export function BoardPreview({
  W,
  H,
  blocks,
  state,
}: BoardPreviewProps) {
  return (
    <svg width={200} height={200} style={{ border: "1px solid #ccc" }}>
      {Array.from({ length: H }).map((_, y) =>
        Array.from({ length: W }).map((_, x) => (
          <rect
            key={`${x},${y}`}
            x={(x * 200) / W}
            y={(y * 200) / H}
            width={200 / W}
            height={200 / H}
            fill="white"
            stroke="gray"
            strokeWidth={0.5}
          />
        ))
      )}
      {blocks.map((b) => {
        const offset = state[b.id] ?? 0;
        const bx = b.orientation === "H" ? offset : b.x;
        const by = b.orientation === "V" ? offset : b.y;
        return (
          <rect
            key={b.id}
            x={(bx * 200) / W}
            y={(by * 200) / H}
            width={(b.w * 200) / W}
            height={(b.h * 200) / H}
            fill={b.id === "A" ? "red" : "blue"}
            opacity={0.6}
          />
        );
      })}
    </svg>
  );
}
