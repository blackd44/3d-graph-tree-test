import React, { useMemo, useState, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Text } from "@react-three/drei";
import * as THREE from "three";

// Enhanced Sliding Block Escape Solver with 3D Tree Visualization
// Features: BFS solver, animated 3D tree, solution path highlighting, puzzle preview

// --------------------- Helper Functions ---------------------
function serializeState(blocks) {
  return blocks
    .slice()
    .sort((a, b) => (a.id > b.id ? 1 : -1))
    .map((b) => `${b.id}:${b.x},${b.y}`)
    .join("|");
}

function cloneBlocks(blocks) {
  return blocks.map((b) => ({ ...b }));
}

function gridOccupiedMap(blocks, W, H) {
  const map = Array.from({ length: H }, () => Array(W).fill(null));
  for (const b of blocks) {
    for (let dx = 0; dx < b.w; dx++) {
      for (let dy = 0; dy < b.h; dy++) {
        const gx = b.x + dx;
        const gy = b.y + dy;
        if (gy >= 0 && gy < H && gx >= 0 && gx < W) map[gy][gx] = b.id;
      }
    }
  }
  return map;
}

function possibleMovesForBlock(block, blocks, W, H) {
  const map = gridOccupiedMap(blocks, W, H);
  const moves = [];

  // Horizontal moves
  if (block.orientation === "H") {
    // Move left
    for (let step = 1; block.x - step >= 0; step++) {
      const nx = block.x - step;
      let blocked = false;
      for (let dy = 0; dy < block.h; dy++) {
        if (
          map[block.y + dy][nx] !== null &&
          map[block.y + dy][nx] !== block.id
        ) {
          blocked = true;
          break;
        }
      }
      if (blocked) break;
      moves.push({ id: block.id, x: nx, y: block.y, direction: "left" });
    }

    // Move right
    for (let step = 1; block.x + block.w - 1 + step < W; step++) {
      const nx = block.x + step;
      let blocked = false;
      for (let dy = 0; dy < block.h; dy++) {
        if (
          map[block.y + dy][nx + block.w - 1] !== null &&
          map[block.y + dy][nx + block.w - 1] !== block.id
        ) {
          blocked = true;
          break;
        }
      }
      if (blocked) break;
      moves.push({ id: block.id, x: nx, y: block.y, direction: "right" });
    }
  }

  // Vertical moves
  if (block.orientation === "V") {
    // Move up
    for (let step = 1; block.y - step >= 0; step++) {
      const ny = block.y - step;
      let blocked = false;
      for (let dx = 0; dx < block.w; dx++) {
        if (
          map[ny][block.x + dx] !== null &&
          map[ny][block.x + dx] !== block.id
        ) {
          blocked = true;
          break;
        }
      }
      if (blocked) break;
      moves.push({ id: block.id, x: block.x, y: ny, direction: "up" });
    }

    // Move down
    for (let step = 1; block.y + block.h - 1 + step < H; step++) {
      const ny = block.y + step;
      let blocked = false;
      for (let dx = 0; dx < block.w; dx++) {
        if (
          map[ny + block.h - 1][block.x + dx] !== null &&
          map[ny + block.h - 1][block.x + dx] !== block.id
        ) {
          blocked = true;
          break;
        }
      }
      if (blocked) break;
      moves.push({ id: block.id, x: block.x, y: ny, direction: "down" });
    }
  }

  return moves;
}

function applyMove(blocks, move) {
  const nb = cloneBlocks(blocks);
  const b = nb.find((x) => x.id === move.id);
  b.x = move.x;
  b.y = move.y;
  return nb;
}

function buildPossibilityTree(
  initBlocks,
  W,
  H,
  depthLimit = 6,
  stopWhenFoundTargetExit = true
) {
  const rootKey = serializeState(initBlocks);
  const nodes = [];
  const byKey = new Map();
  let nodeId = 0;

  const root = {
    id: nodeId++,
    depth: 0,
    stateKey: rootKey,
    blocks: cloneBlocks(initBlocks),
    parent: null,
    move: null,
    children: [],
  };
  nodes.push(root);
  byKey.set(rootKey, root.id);

  const queue = [root];
  const depthCounts = { 0: 1 };

  while (queue.length) {
    const cur = queue.shift();
    if (cur.depth >= depthLimit) continue;

    for (const b of cur.blocks) {
      const moves = possibleMovesForBlock(b, cur.blocks, W, H);
      for (const move of moves) {
        const nextBlocks = applyMove(cur.blocks, move);
        const key = serializeState(nextBlocks);

        if (!byKey.has(key)) {
          const nd = {
            id: nodeId++,
            depth: cur.depth + 1,
            stateKey: key,
            blocks: nextBlocks,
            parent: cur.id,
            move,
            children: [],
          };
          nodes.push(nd);
          byKey.set(key, nd.id);
          queue.push(nd);
          cur.children.push(nd.id);
          depthCounts[nd.depth] = (depthCounts[nd.depth] || 0) + 1;

          if (stopWhenFoundTargetExit) {
            const target = nextBlocks.find((z) => z.isTarget);
            if (target && target.x + target.w === W) {
              return { nodes, depthCounts, solvedNodeId: nd.id };
            }
          }
        }
      }
    }
  }
  return { nodes, depthCounts, solvedNodeId: null };
}

function getSolutionPath(nodes, solvedNodeId) {
  if (!solvedNodeId) return [];
  const path = [];
  let current = nodes.find((n) => n.id === solvedNodeId);

  while (current) {
    path.unshift(current.id);
    current =
      current.parent !== null
        ? nodes.find((n) => n.id === current.parent)
        : null;
  }
  return path;
}

// --------------------- 3D Components ---------------------
function AnimatedNodeMesh({ pos, label, isGoal, isOnSolutionPath, delay = 0 }) {
  const meshRef = useRef();
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setScale(1), delay * 50);
    return () => clearTimeout(timer);
  }, [delay]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(
        THREE.MathUtils.lerp(meshRef.current.scale.x, scale, 0.1)
      );
      if (isGoal) {
        meshRef.current.rotation.y = state.clock.elapsedTime * 2;
      } else if (isOnSolutionPath) {
        meshRef.current.rotation.y =
          Math.sin(state.clock.elapsedTime * 3) * 0.3;
      }
    }
  });

  const color = isGoal ? "#ffd700" : isOnSolutionPath ? "#ff6b6b" : "#4ecdc4";
  const emissive = isGoal
    ? "#554400"
    : isOnSolutionPath
    ? "#441111"
    : "#002222";

  return (
    <group position={pos}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.2, 16, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      <Html distanceFactor={10} center>
        <div
          className={`px-2 py-1 rounded text-xs font-bold ${
            isGoal
              ? "bg-yellow-500 text-black"
              : isOnSolutionPath
              ? "bg-red-500 text-white"
              : "bg-blue-500 text-white"
          }`}
        >
          {label}
        </div>
      </Html>
    </group>
  );
}

function AnimatedEdgeLine({ from, to, isOnSolutionPath, delay = 0 }) {
  const lineRef = useRef();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(1), delay * 50);
    return () => clearTimeout(timer);
  }, [delay]);

  useFrame(() => {
    if (lineRef.current) {
      const targetProgress = progress;
      const currentProgress = lineRef.current.material.dashOffset || 0;
      lineRef.current.material.dashOffset = THREE.MathUtils.lerp(
        currentProgress,
        1 - targetProgress,
        0.1
      );
    }
  });

  const points = useMemo(() => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    return [start, end];
  }, [from, to]);

  return (
    <line ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={2}
          array={new Float32Array([...from, ...to])}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color={isOnSolutionPath ? "#ff6b6b" : "#666666"}
        linewidth={isOnSolutionPath ? 3 : 1}
        dashed={true}
        dashSize={0.1}
        gapSize={0.05}
      />
    </line>
  );
}

function TreeScene({ tree, solvedNodeId }) {
  const solutionPath = useMemo(
    () => getSolutionPath(tree.nodes, solvedNodeId),
    [tree.nodes, solvedNodeId]
  );
  const solutionPathSet = useMemo(() => new Set(solutionPath), [solutionPath]);

  const nodesByDepth = useMemo(() => {
    const map = new Map();
    tree.nodes.forEach((n) => {
      if (!map.has(n.depth)) map.set(n.depth, []);
      map.get(n.depth).push(n);
    });
    return map;
  }, [tree]);

  const positions = useMemo(() => {
    const pos = new Map();
    for (const [depth, arr] of nodesByDepth.entries()) {
      const radius = depth === 0 ? 0 : 3 + depth * 2;
      const count = arr.length;

      for (let i = 0; i < arr.length; i++) {
        if (depth === 0) {
          pos.set(arr[i].id, [0, 0, 0]);
        } else {
          const angle = (i / Math.max(1, count)) * Math.PI * 2;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const z = -depth * 4;
          pos.set(arr[i].id, [x, y, z]);
        }
      }
    }
    return pos;
  }, [nodesByDepth]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <pointLight position={[0, 0, 5]} intensity={0.3} color="#4ecdc4" />

      {/* Nodes */}
      {tree.nodes.map((n, index) => {
        const p = positions.get(n.id) || [0, 0, 0];
        const isGoal = solvedNodeId === n.id;
        const isOnPath = solutionPathSet.has(n.id);
        const moveDesc = n.move ? `${n.move.id} ${n.move.direction}` : "start";

        return (
          <AnimatedNodeMesh
            key={n.id}
            pos={p}
            label={moveDesc}
            isGoal={isGoal}
            isOnSolutionPath={isOnPath}
            delay={index}
          />
        );
      })}

      {/* Edges */}
      {tree.nodes.map((n, index) => {
        if (n.parent === null) return null;
        const parentPos = positions.get(n.parent);
        const childPos = positions.get(n.id);
        if (!parentPos || !childPos) return null;

        const isOnPath =
          solutionPathSet.has(n.id) && solutionPathSet.has(n.parent);

        return (
          <AnimatedEdgeLine
            key={`e${n.id}`}
            from={parentPos}
            to={childPos}
            isOnSolutionPath={isOnPath}
            delay={index}
          />
        );
      })}

      <OrbitControls
        enableDamping={true}
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={50}
      />
    </>
  );
}

// --------------------- 2D Puzzle Preview ---------------------
function PuzzlePreview({ blocks, W, H, className = "" }) {
  const cellSize = 25;

  return (
    <div
      className={`border border-gray-600 bg-gray-800 ${className}`}
      style={{
        width: W * cellSize + 2,
        height: H * cellSize + 2,
        position: "relative",
      }}
    >
      {/* Grid lines */}
      <svg
        width={W * cellSize}
        height={H * cellSize}
        className="absolute inset-0"
        style={{ pointerEvents: "none" }}
      >
        {/* Vertical lines */}
        {Array.from({ length: W + 1 }, (_, i) => (
          <line
            key={`v${i}`}
            x1={i * cellSize}
            y1={0}
            x2={i * cellSize}
            y2={H * cellSize}
            stroke="#555"
            strokeWidth={1}
          />
        ))}
        {/* Horizontal lines */}
        {Array.from({ length: H + 1 }, (_, i) => (
          <line
            key={`h${i}`}
            x1={0}
            y1={i * cellSize}
            x2={W * cellSize}
            y2={i * cellSize}
            stroke="#555"
            strokeWidth={1}
          />
        ))}
      </svg>

      {/* Blocks */}
      {blocks.map((block) => (
        <div
          key={block.id}
          className={`absolute border-2 flex items-center justify-center font-bold text-sm ${
            block.isTarget
              ? "bg-red-500 border-red-700 text-white"
              : "bg-blue-500 border-blue-700 text-white"
          }`}
          style={{
            left: block.x * cellSize + 1,
            top: block.y * cellSize + 1,
            width: block.w * cellSize - 2,
            height: block.h * cellSize - 2,
          }}
        >
          {block.id}
        </div>
      ))}

      {/* Exit indicator */}
      <div
        className="absolute bg-green-400 opacity-50"
        style={{
          right: -2,
          top: 2 * cellSize + 1,
          width: 4,
          height: cellSize - 2,
        }}
      />
    </div>
  );
}

// --------------------- Main App ---------------------
export default function App() {
  const presets = {
    "Simple 4x4": {
      W: 4,
      H: 4,
      blocks: [
        { id: "A", x: 1, y: 1, w: 2, h: 1, orientation: "H", isTarget: true },
        { id: "B", x: 0, y: 0, w: 1, h: 2, orientation: "V" },
        { id: "C", x: 3, y: 0, w: 1, h: 3, orientation: "V" },
        { id: "D", x: 1, y: 3, w: 2, h: 1, orientation: "H" },
      ],
    },
    "Classic 6x6": {
      W: 6,
      H: 6,
      blocks: [
        { id: "A", x: 1, y: 2, w: 2, h: 1, orientation: "H", isTarget: true },
        { id: "B", x: 0, y: 0, w: 1, h: 2, orientation: "V" },
        { id: "C", x: 1, y: 0, w: 2, h: 1, orientation: "H" },
        { id: "D", x: 3, y: 1, w: 1, h: 2, orientation: "V" },
        { id: "E", x: 4, y: 0, w: 2, h: 1, orientation: "H" },
        { id: "F", x: 5, y: 1, w: 1, h: 2, orientation: "V" },
        { id: "G", x: 0, y: 3, w: 2, h: 1, orientation: "H" },
        { id: "H", x: 2, y: 4, w: 1, h: 2, orientation: "V" },
      ],
    },
    "Hard Puzzle": {
      W: 5,
      H: 5,
      blocks: [
        { id: "A", x: 1, y: 2, w: 2, h: 1, orientation: "H", isTarget: true },
        { id: "B", x: 0, y: 0, w: 2, h: 1, orientation: "H" },
        { id: "C", x: 3, y: 0, w: 1, h: 3, orientation: "V" },
        { id: "D", x: 4, y: 0, w: 1, h: 2, orientation: "V" },
        { id: "E", x: 0, y: 1, w: 1, h: 2, orientation: "V" },
        { id: "F", x: 1, y: 1, w: 1, h: 1, orientation: "H" },
        { id: "G", x: 1, y: 3, w: 3, h: 1, orientation: "H" },
        { id: "H", x: 4, y: 4, w: 1, h: 1, orientation: "H" },
      ],
    },
  };

  const [input, setInput] = useState(
    JSON.stringify(presets["Simple 4x4"], null, 2)
  );
  const [tree, setTree] = useState(null);
  const [depthLimit, setDepthLimit] = useState(8);
  const [status, setStatus] = useState("Ready to solve");
  const [solvedId, setSolvedId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPuzzle, setCurrentPuzzle] = useState(null);

  const solutionPath = useMemo(() => {
    if (!tree || !solvedId) return [];
    return getSolutionPath(tree.nodes, solvedId);
  }, [tree, solvedId]);

  function loadPreset(presetName) {
    setInput(JSON.stringify(presets[presetName], null, 2));
    setTree(null);
    setSolvedId(null);
    setStatus("Preset loaded");
  }

  function onGenerate() {
    let parsed;
    try {
      parsed = JSON.parse(input);
    } catch (e) {
      setStatus("❌ Invalid JSON: " + e.message);
      return;
    }

    if (!parsed.blocks || !Array.isArray(parsed.blocks)) {
      setStatus("❌ Missing 'blocks' array");
      return;
    }

    const W = parsed.W || 6;
    const H = parsed.H || 6;
    const blocks = parsed.blocks.map((b) => ({ ...b }));

    // Validate blocks
    const hasTarget = blocks.some((b) => b.isTarget);
    if (!hasTarget) {
      setStatus("❌ No target block found (set isTarget: true)");
      return;
    }

    setCurrentPuzzle({ blocks, W, H });
    setIsGenerating(true);
    setStatus("🔍 Solving puzzle...");
    setTree(null);
    setSolvedId(null);

    // Use setTimeout to prevent UI blocking
    setTimeout(() => {
      const startTime = Date.now();
      const res = buildPossibilityTree(blocks, W, H, depthLimit, true);
      const endTime = Date.now();

      setTree(res);
      setSolvedId(res.solvedNodeId);
      setIsGenerating(false);

      const solvedText = res.solvedNodeId
        ? `✅ SOLVED in ${solutionPath.length - 1} moves!`
        : "❌ No solution found";

      setStatus(
        `${solvedText} | ${res.nodes.length} states | ${endTime - startTime}ms`
      );
    }, 100);
  }

  return (
    <div className="w-screen h-screen flex bg-gray-900 text-white">
      {/* Control Panel */}
      <div className="w-1/3 p-4 bg-gray-900 border-r border-gray-700 overflow-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2 text-blue-400">
            🧩 Block Escape Solver
          </h1>
          <p className="text-sm text-gray-300 mb-4">
            Visualize the solution space as an interactive 3D tree. Red path
            shows the solution!
          </p>
        </div>

        {/* Presets */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Quick Start</h3>
          <div className="flex flex-wrap gap-2">
            {Object.keys(presets).map((name) => (
              <button
                key={name}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors"
                onClick={() => loadPreset(name)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Current Puzzle Preview */}
        {currentPuzzle && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Current Puzzle</h3>
            <PuzzlePreview {...currentPuzzle} className="mb-2" />
            <p className="text-xs text-gray-400">
              Red block = target, Green = exit
            </p>
          </div>
        )}

        {/* JSON Input */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Puzzle Definition</h3>
          <textarea
            className="w-full h-48 bg-gray-800 border border-gray-600 p-3 rounded text-xs font-mono text-green-400 focus:border-blue-500 focus:outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your puzzle JSON here..."
          />
        </div>

        {/* Controls */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-3">
            <label className="text-sm font-medium">Search Depth:</label>
            <input
              type="number"
              className="w-20 bg-gray-800 border border-gray-600 text-white p-1 rounded focus:border-blue-500 focus:outline-none"
              value={depthLimit}
              onChange={(e) =>
                setDepthLimit(Math.max(1, parseInt(e.target.value) || 1))
              }
              min="1"
              max="15"
            />
            <span className="text-xs text-gray-400">(1-15)</span>
          </div>

          <button
            className={`w-full py-3 rounded font-semibold transition-all ${
              isGenerating
                ? "bg-yellow-600 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-500 active:scale-95"
            }`}
            onClick={onGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? "🔄 Generating..." : "🚀 Generate Tree"}
          </button>
        </div>

        {/* Status & Stats */}
        <div className="bg-gray-800 p-3 rounded">
          <div className="text-sm font-medium mb-2">Status</div>
          <div className="text-xs text-gray-300">{status}</div>

          {tree && (
            <div className="mt-3 space-y-1 text-xs">
              <div>
                🌳 <span className="text-blue-400">Total States:</span>{" "}
                {tree.nodes.length}
              </div>
              <div>
                📊 <span className="text-blue-400">By Depth:</span>{" "}
                {Object.entries(tree.depthCounts)
                  .map(([d, c]) => `L${d}:${c}`)
                  .join(", ")}
              </div>
              {solvedId && (
                <div className="text-green-400">
                  🎯 <span className="text-blue-400">Solution:</span>{" "}
                  {solutionPath.length - 1} moves
                </div>
              )}
            </div>
          )}
        </div>

        {/* Solution Steps */}
        {solvedId && solutionPath.length > 1 && (
          <div className="mt-4 bg-gray-800 p-3 rounded">
            <h3 className="text-sm font-semibold mb-2 text-green-400">
              Solution Steps
            </h3>
            <div className="space-y-1 text-xs">
              {tree.nodes
                .filter((n) => solutionPath.includes(n.id))
                .sort(
                  (a, b) =>
                    solutionPath.indexOf(a.id) - solutionPath.indexOf(b.id)
                )
                .map((node, i) => (
                  <div key={node.id} className="flex items-center gap-2">
                    <span className="text-gray-400 w-6">{i}.</span>
                    <span className="text-white">
                      {node.move
                        ? `Move ${node.move.id} ${node.move.direction}`
                        : "Start"}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Help */}
        <div className="mt-4 text-xs text-gray-400 space-y-1">
          <div>
            💡 <strong>Tips:</strong>
          </div>
          <div>• Target block (red) must reach right edge</div>
          <div>• Higher depth = more thorough search</div>
          <div>• Gold nodes = solution found</div>
          <div>• Red path = optimal solution route</div>
        </div>
      </div>

      {/* 3D Visualization */}
      <div className="flex-1 relative">
        <Canvas
          camera={{ position: [0, -8, 12], fov: 60 }}
          className="bg-gradient-to-b from-gray-900 to-black"
        >
          {tree ? (
            <TreeScene tree={tree} solvedNodeId={solvedId} />
          ) : (
            <>
              <ambientLight intensity={0.4} />
              <Html center>
                <div className="text-center text-gray-400">
                  <div className="text-xl mb-2">🌳</div>
                  <div>Load a preset or paste JSON, then click Generate</div>
                  <div className="text-sm mt-1 opacity-75">
                    The possibility tree will appear here
                  </div>
                </div>
              </Html>
            </>
          )}
        </Canvas>

        {/* Overlay controls for 3D view */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 p-3 rounded">
          <div className="text-xs text-gray-300 space-y-1">
            <div>
              🖱️ <strong>Controls:</strong>
            </div>
            <div>• Drag to orbit</div>
            <div>• Scroll to zoom</div>
            <div>• Right-click + drag to pan</div>
          </div>
        </div>

        {tree && solvedId && (
          <div className="absolute bottom-4 right-4 bg-green-900 bg-opacity-80 p-3 rounded border border-green-600">
            <div className="text-green-400 font-semibold">
              🎉 Puzzle Solved!
            </div>
            <div className="text-xs text-gray-200">
              Solution found in {solutionPath.length - 1} moves
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
