import { useMemo, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import { input } from "./data";
import { generateMoves, computeAxes, mapNodeTo3D, applyForces } from "./utils";
import { Graph, BoardPreview, SettingsPanel } from "./components";

// Main Viewer component
export default function Viewer() {
  const [minDistance, setMinDistance] = useState(0.6);
  const [nodeRadius, setNodeRadius] = useState(0.1);
  const [iterations, setIterations] = useState(100);
  const [forceStrength, setForceStrength] = useState(1);

  // Colors and opacity
  const [nodeColor, setNodeColor] = useState("#86e8fe");
  const [activeColor, setActiveColor] = useState("#ff6600");
  const [edgeColor, setEdgeColor] = useState("#9c9c9c");
  const [nodeOpacity, setNodeOpacity] = useState(0.8);
  const [edgeOpacity, setEdgeOpacity] = useState(0.6);

  const [selected, setSelected] = useState(0);

  // Memoized computations for better performance
  const { nodes, edges } = useMemo(
    () => generateMoves(input.blocks, input.W, input.H),
    []
  );

  const axes = useMemo(() => computeAxes(nodes, input.blocks), [nodes]);

  const initialPositions = useMemo(
    () => nodes.map((n) => mapNodeTo3D(n, input.blocks, axes)),
    [nodes, axes]
  );

  const positions = useMemo(
    () => applyForces([...initialPositions], edges, minDistance, iterations, forceStrength),
    [initialPositions, edges, minDistance, iterations, forceStrength]
  );

  const target = useMemo(() => positions[selected], [positions, selected]);

  const handleNodeSelect = useCallback((index: number) => {
    setSelected(index);
  }, []);

  return (
    <div className="flex bg-gradient-to-br from-gray-900 to-black">
      <div className="w-dvw h-screen">
        <Canvas
          camera={{ position: [8, 8, 8], fov: 60 }}
          gl={{ antialias: true, alpha: false }}
        >
          <color attach="background" args={["#1a1a2e"]} />
          <Graph
            positions={positions}
            edges={edges}
            selected={selected}
            onSelect={handleNodeSelect}
            nodeRadius={nodeRadius}
            nodeColor={nodeColor}
            activeColor={activeColor}
            edgeColor={edgeColor}
            nodeOpacity={nodeOpacity}
            edgeOpacity={edgeOpacity}
          />
          <OrbitControls
            target={target}
            enableDamping={true}
            dampingFactor={0.05}
            maxDistance={20}
            minDistance={2}
          />
          <axesHelper args={[3]} />
        </Canvas>
      </div>

      <div className="p-4 absolute top-0 right-0 bg-black/20 backdrop-blur-sm rounded-bl-lg">
        <h3 className="text-white text-lg font-bold mb-2">Board Preview</h3>
        <BoardPreview
          W={input.W}
          H={input.H}
          blocks={input.blocks}
          state={nodes[selected]}
        />
        <div className="mt-2 text-white text-sm">
          Node: {selected + 1}/{nodes.length}
        </div>
      </div>

      <SettingsPanel
        minDistance={minDistance}
        setMinDistance={setMinDistance}
        nodeRadius={nodeRadius}
        setNodeRadius={setNodeRadius}
        iterations={iterations}
        setIterations={setIterations}
        forceStrength={forceStrength}
        setForceStrength={setForceStrength}
        nodeColor={nodeColor}
        setNodeColor={setNodeColor}
        activeColor={activeColor}
        setActiveColor={setActiveColor}
        edgeColor={edgeColor}
        setEdgeColor={setEdgeColor}
        nodeOpacity={nodeOpacity}
        setNodeOpacity={setNodeOpacity}
        edgeOpacity={edgeOpacity}
        setEdgeOpacity={setEdgeOpacity}
      />
    </div>
  );
}
