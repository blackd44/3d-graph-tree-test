import { useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// Types
type Block = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  orientation: "H" | "V";
};

type MoveState = Record<string, number>;

type InputData = {
  W: number;
  H: number;
  blocks: Block[];
};

const input: InputData = {
  W: 7,
  H: 7,
  blocks: [
    { id: "A", x: 3, y: 3, w: 2, h: 1, orientation: "H" },
    { id: "B", x: 3, y: 5, w: 1, h: 2, orientation: "V" },
    { id: "C", x: 5, y: 5, w: 1, h: 2, orientation: "V" },
    { id: "D", x: 1, y: 1, w: 1, h: 2, orientation: "H" },
  ],
};

// Generate moves dynamically by exploring state space
function generateMoves(blocks: Block[], W: number, H: number) {
  const start: MoveState = {};
  blocks.forEach((b) => {
    start[b.id] = b.orientation === "H" ? b.x : b.orientation === "V" ? b.y : 0;
  });

  const nodes: MoveState[] = [start];
  const edges: [number, number][] = [];
  const visited = new Set<string>();

  function key(state: MoveState) {
    return JSON.stringify(state);
  }

  function isValid(state: MoveState): boolean {
    const grid = Array.from({ length: H }, () => Array(W).fill(null));

    for (const b of blocks) {
      const offset = state[b.id] ?? 0;
      const x =
        b.orientation === "H" ? offset : b.orientation === "V" ? b.x : offset;
      const y =
        b.orientation === "V" ? offset : b.orientation === "H" ? b.y : offset;

      if (x < 0 || y < 0 || x + b.w > W || y + b.h > H) return false;

      for (let dx = 0; dx < b.w; dx++) {
        for (let dy = 0; dy < b.h; dy++) {
          if (grid[y + dy][x + dx]) return false;
          grid[y + dy][x + dx] = b.id;
        }
      }
    }

    return true;
  }

  const queue = [start];
  visited.add(key(start));

  while (queue.length) {
    const cur = queue.shift()!;
    const curIndex = nodes.findIndex((n) => key(n) === key(cur));

    for (const b of blocks) {
      const deltas: [number, number][] = [];

      if (b.orientation === "H") deltas.push([1, 0], [-1, 0]);
      else if (b.orientation === "V") deltas.push([0, 1], [0, -1]);
      else deltas.push([1, 0], [-1, 0], [0, 1], [0, -1]);

      for (const [dx, dy] of deltas) {
        const next = { ...cur };
        if (b.orientation === "H") next[b.id] = (cur[b.id] ?? 0) + dx;
        else if (b.orientation === "V") next[b.id] = (cur[b.id] ?? 0) + dy;
        else next[b.id] = (cur[b.id] ?? 0) + (dx !== 0 ? dx : dy);

        if (!visited.has(key(next)) && isValid(next)) {
          nodes.push(next);
          const nextIndex = nodes.length - 1;
          edges.push([curIndex, nextIndex]);
          visited.add(key(next));
          queue.push(next);
        } else if (visited.has(key(next)) && isValid(next)) {
          const nextIndex = nodes.findIndex((n) => key(n) === key(next));
          if (nextIndex !== -1) edges.push([curIndex, nextIndex]);
        }
      }
    }
  }

  return { nodes, edges };
}

function computeAxes(_nodes: MoveState[], blocks: Block[]) {
  const axes: [number, number, number][] = [];
  const n = blocks.length;
  const defaultAxes: [number, number, number][] = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ];

  for (let i = 0; i < n; i++) {
    if (i < 3) axes.push(defaultAxes[i]);
    else {
      // for extra blocks, small fractional offsets
      const f = 0.5 / i;
      axes.push([f, f, f]);
    }
  }
  return axes;
}

function mapNodeTo3D(
  node: MoveState,
  blocks: Block[],
  axes: [number, number, number][]
): [number, number, number] {
  const pos: [number, number, number] = [0, 0, 0];
  blocks.forEach((b, i) => {
    const val = node[b.id] ?? 0;
    pos[0] += axes[i][0] * val;
    pos[1] += axes[i][1] * val;
    pos[2] += axes[i][2] * val;
  });
  return pos;
}

function applyForces(
  positions: [number, number, number][],
  edges: [number, number][],
  minDistance = 0.5,
  iterations = 50
) {
  const n = positions.length;
  const pos = positions.map((p) => [...p] as [number, number, number]);

  for (let iter = 0; iter < iterations; iter++) {
    // repulsion
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = pos[j][0] - pos[i][0];
        const dy = pos[j][1] - pos[i][1];
        const dz = pos[j][2] - pos[i][2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < minDistance && dist > 0.001) {
          const push = (minDistance - dist) / 2;
          const nx = (dx / dist) * push;
          const ny = (dy / dist) * push;
          const nz = (dz / dist) * push;
          pos[i][0] -= nx;
          pos[i][1] -= ny;
          pos[i][2] -= nz;
          pos[j][0] += nx;
          pos[j][1] += ny;
          pos[j][2] += nz;
        }
      }
    }

    // attraction along edges
    const k = 0.1; // spring strength
    edges.forEach(([s, t]) => {
      const dx = pos[t][0] - pos[s][0];
      const dy = pos[t][1] - pos[s][1];
      const dz = pos[t][2] - pos[s][2];
      pos[s][0] += dx * k;
      pos[s][1] += dy * k;
      pos[s][2] += dz * k;
      pos[t][0] -= dx * k;
      pos[t][1] -= dy * k;
      pos[t][2] -= dz * k;
    });
  }

  return pos;
}

// ------------------ Graph ------------------
function Graph({
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
}: {
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
}) {
  return (
    <group>
      {positions.map((pos, i) => (
        <mesh
          key={i}
          position={pos}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(i);
          }}
        >
          <sphereGeometry args={[nodeRadius, 16, 16]} />
          <meshStandardMaterial
            color={i === selected ? activeColor : nodeColor}
            transparent
            opacity={nodeOpacity}
          />
        </mesh>
      ))}
      {edges.map(([s, t], i) => {
        const geom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(...positions[s]),
          new THREE.Vector3(...positions[t]),
        ]);
        return (
          <line key={i} geometry={geom}>
            <lineBasicMaterial
              color={edgeColor}
              transparent
              opacity={edgeOpacity}
            />
          </line>
        );
      })}
    </group>
  );
}

// ------------------ Board preview ------------------
function BoardPreview({
  W,
  H,
  blocks,
  state,
}: {
  W: number;
  H: number;
  blocks: Block[];
  state: MoveState;
}) {
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

// ------------------ Viewer ------------------
export default function Viewer() {
  const [minDistance, setMinDistance] = useState(0.6);
  const [nodeRadius, setNodeRadius] = useState(0.15);
  const [iterations, setIterations] = useState(80);
  const [springK, setSpringK] = useState(0.1);

  // Colors and opacity
  const [nodeColor, setNodeColor] = useState("#00aaff");
  const [activeColor, setActiveColor] = useState("orange");
  const [edgeColor, setEdgeColor] = useState("#ffaa00");
  const [nodeOpacity, setNodeOpacity] = useState(0.8);
  const [edgeOpacity, setEdgeOpacity] = useState(0.6);

  const [selected, setSelected] = useState(0);

  const { nodes, edges } = useMemo(
    () => generateMoves(input.blocks, input.W, input.H),
    []
  );
  const axes = useMemo(() => computeAxes(nodes, input.blocks), [nodes]);
  let positions = useMemo(
    () => nodes.map((n) => mapNodeTo3D(n, input.blocks, axes)),
    [nodes, axes]
  );
  positions = useMemo(
    () => applyForces(positions, edges, 0.6, 100),
    [positions, edges]
  );

  const target = useMemo(() => positions[selected], [positions, selected]);

  return (
    <div className="flex">
      <div className="w-dvw h-screen">
        <Canvas camera={{ position: [6, 6, 6], fov: 50 }}>
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
          <Graph
            positions={positions}
            edges={edges}
            selected={selected}
            onSelect={setSelected}
            nodeRadius={nodeRadius}
            nodeColor={nodeColor}
            activeColor={activeColor}
            edgeColor={edgeColor}
            nodeOpacity={nodeOpacity}
            edgeOpacity={edgeOpacity}
          />
          <OrbitControls target={target} />
          <axesHelper args={[5]} />
        </Canvas>
      </div>
      <div className="p-2 absolute top-0 right-0">
        <h3>Board Preview</h3>
        <BoardPreview
          W={input.W}
          H={input.H}
          blocks={input.blocks}
          state={nodes[selected]}
        />
      </div>

      {/* Settings Panel */}
      <div className="absolute top-3 left-3 bg-white/10 p-4 rounded">
        <h4>Graph Settings</h4>
        <div>
          <label>Min Distance: {minDistance.toFixed(2)}</label>
          <input
            type="range"
            min="0.1"
            max={10}
            step="0.05"
            value={minDistance}
            onChange={(e) => setMinDistance(parseFloat(e.target.value))}
          />
        </div>
        <div>
          <label>Node Radius: {nodeRadius.toFixed(2)}</label>
          <input
            type="range"
            min="0.05"
            max="0.5"
            step="0.01"
            value={nodeRadius}
            onChange={(e) => setNodeRadius(parseFloat(e.target.value))}
          />
        </div>
        <div>
          <label>Spring K: {springK.toFixed(2)}</label>
          <input
            type="range"
            min="0.01"
            max="0.5"
            step="0.01"
            value={springK}
            onChange={(e) => setSpringK(parseFloat(e.target.value))}
          />
        </div>
        <div>
          <label>Iterations: {iterations}</label>
          <input
            type="range"
            min="10"
            max="200"
            step="10"
            value={iterations}
            onChange={(e) => setIterations(parseInt(e.target.value))}
          />
        </div>
        <div>
          <label>Node Color: </label>
          <input
            type="color"
            value={nodeColor}
            onChange={(e) => setNodeColor(e.target.value)}
          />
        </div>
        <div>
          <label>Active Node Color: </label>
          <input
            type="color"
            value={activeColor}
            onChange={(e) => setActiveColor(e.target.value)}
          />
        </div>
        <div>
          <label>Edge Color: </label>
          <input
            type="color"
            value={edgeColor}
            onChange={(e) => setEdgeColor(e.target.value)}
          />
        </div>
        <div>
          <label>Node Opacity: {nodeOpacity.toFixed(2)}</label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={nodeOpacity}
            onChange={(e) => setNodeOpacity(parseFloat(e.target.value))}
          />
        </div>
        <div>
          <label>Edge Opacity: {edgeOpacity.toFixed(2)}</label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={edgeOpacity}
            onChange={(e) => setEdgeOpacity(parseFloat(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
}
