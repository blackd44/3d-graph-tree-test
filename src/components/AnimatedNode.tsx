import { useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface AnimatedNodeProps {
  position: [number, number, number];
  isSelected: boolean;
  onClick: () => void;
  nodeRadius: number;
  nodeColor: string;
  activeColor: string;
  nodeOpacity: number;
}

export function AnimatedNode({
  position,
  isSelected,
  onClick,
  nodeRadius,
  nodeColor,
  activeColor,
  nodeOpacity,
}: AnimatedNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      const time = state.clock.getElapsedTime();
      meshRef.current.position.y =
        position[1] + Math.sin(time * 2 + position[0]) * 0.05;

      // Subtle rotation for selected node
      if (isSelected) {
        meshRef.current.rotation.y += 0.02;
      }

      // Scale effect on hover/selection
      const targetScale = hovered || isSelected ? 1.3 : 1;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[position[0], position[1], position[2]]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <sphereGeometry args={[nodeRadius, 32, 32]} />
      <meshStandardMaterial
        color={isSelected ? activeColor : nodeColor}
        transparent
        opacity={nodeOpacity}
        roughness={0.3}
        metalness={0.2}
        emissive={isSelected ? activeColor : nodeColor}
        emissiveIntensity={isSelected ? 0.2 : 0.05}
      />
    </mesh>
  );
}
