import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface EnhancedEdgesProps {
  positions: [number, number, number][];
  edges: [number, number][];
  edgeColor: string;
  edgeOpacity: number;
  selected: number;
}

export function EnhancedEdges({
  positions,
  edges,
  edgeColor,
  edgeOpacity,
  selected,
}: EnhancedEdgesProps) {
  const linesRef = useRef<THREE.Group>(null);

  const edgeGeometries = useMemo<THREE.BufferGeometry<THREE.NormalBufferAttributes, THREE.BufferGeometryEventMap>[]>(() => {
    return edges.map(([s, t]) => {
      const points = [
        new THREE.Vector3(...positions[s]),
        new THREE.Vector3(...positions[t]),
      ];
      return new THREE.BufferGeometry().setFromPoints(points);
    });
  }, [positions, edges]);

  useFrame(() => {
    if (linesRef.current) {
      // Subtle opacity animation for edges connected to selected node
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
      {edgeGeometries.map((geometry, i) => {
        const [s, t] = edges[i];
        const isConnectedToSelected = s === selected || t === selected;
        return (
          <line key={i} geometry={geometry}>
            <lineBasicMaterial
              color={edgeColor}
              transparent
              opacity={isConnectedToSelected ? edgeOpacity * 1.5 : edgeOpacity}
              linewidth={isConnectedToSelected ? 3 : 1}
            />
          </line>
        );
      })}
    </group>
  );
}
