import { useCallback } from "react";
import { AnimatedNode } from "./AnimatedNode";
import { Edges } from "./Edges";

interface GraphProps {
  positions: [number, number, number][];
  edges: [number, number][];
  selected: number;
  onSelect: (i: number) => void;
  nodeRadius: number;
  nodeColor: string;
  activeColor: string;
  edgeColor: string;
  nodeOpacity: number;
  edgeOpacity: number;
  nodeBrightness: number;
}

export function Graph({
  positions,
  edges,
  selected,
  onSelect,
  nodeRadius,
  nodeColor,
  activeColor,
  edgeColor,
  nodeOpacity,
  edgeOpacity,
  nodeBrightness,
}: GraphProps) {
  const handleNodeClick = useCallback(
    (index: number) => {
      onSelect(index);
    },
    [onSelect]
  );

  return (
    <group>

      <Edges
        positions={positions}
        edges={edges}
        edgeColor={edgeColor}
        edgeOpacity={edgeOpacity}
        selected={selected}
      />

      {positions.map((pos, i) => (
                  <AnimatedNode
            key={i}
            position={pos}
            isSelected={i === selected}
            onClick={() => handleNodeClick(i)}
            nodeRadius={nodeRadius}
            nodeColor={nodeColor}
            activeColor={activeColor}
            nodeOpacity={nodeOpacity}
            nodeBrightness={nodeBrightness}
          />
      ))}
    </group>
  );
}
