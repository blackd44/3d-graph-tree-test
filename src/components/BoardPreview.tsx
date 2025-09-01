import type { Block, MoveState } from "../types";

interface BoardPreviewProps {
  W: number;
  H: number;
  blocks: Block[];
  state: MoveState;
}

// Color palette for different blocks
const blockColors = [
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#45B7D1", // Blue
  "#96CEB4", // Green
  "#FFEAA7", // Yellow
  "#DDA0DD", // Plum
  "#98D8C8", // Mint
  "#F7DC6F", // Gold
  "#BB8FCE", // Lavender
  "#85C1E9", // Sky Blue
  "#F8C471", // Orange
  "#82E0AA", // Light Green
  "#F1948A", // Pink
  "#85C1E9", // Light Blue
  "#FAD7A0", // Peach
  "#D7BDE2", // Light Purple
];

export function BoardPreview({ W, H, blocks, state }: BoardPreviewProps) {
  // Function to get color for a block
  const getBlockColor = (blockId: string) => {
    // Use the block ID to generate a consistent color
    const hash = blockId.charCodeAt(0) - 65; // Convert A=0, B=1, etc.
    return blockColors[hash % blockColors.length];
  };

  // Function to get darker color for stroke
  const getBlockStrokeColor = (blockId: string) => {
    return `color-mix(in srgb, ${getBlockColor(blockId)} 40%, black)`;
  };

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
            fill={getBlockColor(b.id)}
            opacity={0.9}
            style={{ stroke: getBlockStrokeColor(b.id) }}
            strokeWidth={1}
          />
        );
      })}
    </svg>
  );
}
