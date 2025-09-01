import { useCallback } from "react";
import { AnimatedNode } from "./AnimatedNode";
import { EnhancedEdges } from "./EnhancedEdges";

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
}: GraphProps) {
  const handleNodeClick = useCallback(
    (index: number) => {
      onSelect(index);
    },
    [onSelect]
  );

  return (
    <group>
      {/* Enhanced lighting for better visual depth */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#4488ff" />

      {/* Fog for depth perception */}
      <fog attach="fog" args={["#202030", 5, 25]} />

      <EnhancedEdges
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
        />
      ))}
    </group>
  );
}
