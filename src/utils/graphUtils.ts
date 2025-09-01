import type { Block, MoveState } from '../types';

// Generate moves dynamically by exploring state space
export function generateMoves(blocks: Block[], W: number, H: number) {
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

export function computeAxes(_nodes: MoveState[], blocks: Block[]) {
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
      const f = 0.5 / i;
      axes.push([f, f, f]);
    }
  }
  return axes;
}

export function mapNodeTo3D(
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

export function applyForces(
  positions: [number, number, number][],
  edges: [number, number][],
  iterations = 150,
  springStrength = 0.1,
  centerForceStrength = 0.0,
  fixedEdgeLength = 2.0
) {
  const n = positions.length;
  const pos = positions.map((p) => [...p] as [number, number, number]);

  // Create adjacency map for connected nodes
  const connected = new Set<string>();
  edges.forEach(([s, t]) => {
    connected.add(`${Math.min(s, t)}-${Math.max(s, t)}`);
  });

  const isConnected = (i: number, j: number) => {
    return connected.has(`${Math.min(i, j)}-${Math.max(i, j)}`);
  };

  for (let iter = 0; iter < iterations; iter++) {
    const forces = Array.from(
      { length: n },
      () => [0, 0, 0] as [number, number, number]
    );

    // Process all node pairs
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = pos[j][0] - pos[i][0];
        const dy = pos[j][1] - pos[i][1];
        const dz = pos[j][2] - pos[i][2];
        const distSq = dx * dx + dy * dy + dz * dz;
        const dist = Math.sqrt(distSq);

        if (dist < 0.001) continue; // Avoid division by zero

        if (isConnected(i, j)) {
          // ATTRACTION: Only between connected nodes (spring force)
          const displacement = dist - fixedEdgeLength;
          // Make spring force much stronger to resist other forces
          const springForce = springStrength * 10 * displacement;

          const fx = (dx / dist) * springForce;
          const fy = (dy / dist) * springForce;
          const fz = (dz / dist) * springForce;

          forces[i][0] += fx;
          forces[i][1] += fy;
          forces[i][2] += fz;
          forces[j][0] -= fx;
          forces[j][1] -= fy;
          forces[j][2] -= fz;
        } else {
          // REPULSION: Only between unconnected nodes (Coulomb force)
          const repulsionStrength = (fixedEdgeLength * fixedEdgeLength) / distSq;
          const fx = (dx / dist) * repulsionStrength;
          const fy = (dy / dist) * repulsionStrength;
          const fz = (dz / dist) * repulsionStrength;

          forces[i][0] -= fx;
          forces[i][1] -= fy;
          forces[i][2] -= fz;
          forces[j][0] += fx;
          forces[j][1] += fy;
          forces[j][2] += fz;
        }
      }
    }

    // Apply center force pushing outward from graph centroid
    if (centerForceStrength > 0) {
      // Calculate the center of all node positions
      const centerX = pos.reduce((sum, p) => sum + p[0], 0) / n;
      const centerY = pos.reduce((sum, p) => sum + p[1], 0) / n;
      const centerZ = pos.reduce((sum, p) => sum + p[2], 0) / n;
      
      for (let i = 0; i < n; i++) {
        const dx = pos[i][0] - centerX;
        const dy = pos[i][1] - centerY;
        const dz = pos[i][2] - centerZ;
        const distFromCenter = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        if (distFromCenter > 0.001) {
          const centerForce = centerForceStrength * distFromCenter;
          forces[i][0] += (dx / distFromCenter) * centerForce;
          forces[i][1] += (dy / distFromCenter) * centerForce;
          forces[i][2] += (dz / distFromCenter) * centerForce;
        }
      }
    }

    // Apply forces with proper physics integration
    const timeStep = 0.1;
    const damping = 0.95; // Light damping to prevent excessive oscillation

    for (let i = 0; i < n; i++) {
      // Apply forces (F = ma, assuming m = 1)
      pos[i][0] += forces[i][0] * timeStep;
      pos[i][1] += forces[i][1] * timeStep;
      pos[i][2] += forces[i][2] * timeStep;

      // Apply light damping only to prevent runaway
      pos[i][0] *= damping;
      pos[i][1] *= damping;
      pos[i][2] *= damping;
    }

    // Hard constraint: enforce fixed edge length for connected nodes
    for (const [i, j] of edges) {
      const dx = pos[j][0] - pos[i][0];
      const dy = pos[j][1] - pos[i][1];
      const dz = pos[j][2] - pos[i][2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      if (dist > 0.001) {
        const scale = fixedEdgeLength / dist;
        const midX = (pos[i][0] + pos[j][0]) / 2;
        const midY = (pos[i][1] + pos[j][1]) / 2;
        const midZ = (pos[i][2] + pos[j][2]) / 2;
        
        // Move both nodes to maintain exact edge length
        pos[i][0] = midX - (dx * scale) / 2;
        pos[i][1] = midY - (dy * scale) / 2;
        pos[i][2] = midZ - (dz * scale) / 2;
        
        pos[j][0] = midX + (dx * scale) / 2;
        pos[j][1] = midY + (dy * scale) / 2;
        pos[j][2] = midZ + (dz * scale) / 2;
      }
    }
  }

  return pos;
}
