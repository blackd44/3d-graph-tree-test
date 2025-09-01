import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

interface EdgesProps {
  positions: [number, number, number][];
  edges: [number, number][];
  edgeColor: string;
  edgeOpacity: number;
  selected: number;
}

export function Edges({
  positions,
  edges,
  edgeColor,
  edgeOpacity,
  selected,
}: EdgesProps) {
  const linesRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (linesRef.current) {
      linesRef.current.children.forEach((line, i) => {
        const [s, t] = edges[i];
        const material = (line as THREE.Line)
          .material as THREE.LineBasicMaterial;
        const isConnectedToSelected = s === selected || t === selected;
        const targetOpacity = isConnectedToSelected
          ? edgeOpacity * 1.5
          : edgeOpacity;

        material.opacity = THREE.MathUtils.lerp(
          material.opacity,
          targetOpacity,
          0.1
        );
      });
    }
  });

  return (
    <group ref={linesRef}>
      {edges.map(([s, t], i) => {
        const isConnectedToSelected = s === selected || t === selected;
        return (
          <Line
            key={i}
            points={[positions[s], positions[t]]}
            color={edgeColor}
            transparent
            opacity={isConnectedToSelected ? edgeOpacity * 1.5 : edgeOpacity}
            lineWidth={isConnectedToSelected ? 3 : 1}
          />
        );
      })}
    </group>
  );
}
