import React, { useState, useCallback, useRef } from "react";
import type { Block, InputData } from "../types";

interface BoardEditorProps {
  initialData: InputData;
  onDataChange: (data: InputData) => void;
  onVisualize: (data: InputData) => void;
}

export const BoardEditor: React.FC<BoardEditorProps> = ({
  initialData,
  onVisualize,
}) => {
  const [data, setData] = useState<InputData>(initialData);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [isAddingBlock, setIsAddingBlock] = useState(false);
  const [newBlock, setNewBlock] = useState<Partial<Block>>({
    id: "",
    x: 0,
    y: 0,
    w: 1,
    h: 1,
    orientation: "H",
  });

  // Drag and resize state
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  // Color palette for different blocks (same as BoardPreview)
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

  const getBlockColor = (blockId: string) => {
    const hash = blockId.charCodeAt(0) - 65;
    return blockColors[hash % blockColors.length];
  };

  const getBlockStrokeColor = (blockId: string) => {
    return `color-mix(in srgb, ${getBlockColor(blockId)} 40%, black)`;
  };

  const handleCellClick = useCallback(
    (x: number, y: number) => {
      if (isAddingBlock) {
        const blockId = newBlock.id || `Block${data.blocks.length + 1}`;
        const newBlockData: Block = {
          id: blockId,
          x,
          y,
          w: newBlock.w || 1,
          h: newBlock.h || 1,
          orientation: newBlock.orientation || "H",
        };

        const updatedData = {
          ...data,
          blocks: [...data.blocks, newBlockData],
        };

        setData(updatedData);
        setIsAddingBlock(false);
        setNewBlock({ id: "", x: 0, y: 0, w: 1, h: 1, orientation: "H" });
      } else {
        // Select block if clicked on one
        const clickedBlock = data.blocks.find(
          (block) =>
            x >= block.x &&
            x < block.x + block.w &&
            y >= block.y &&
            y < block.y + block.h
        );
        setSelectedBlock(clickedBlock?.id || null);
      }
    },
    [isAddingBlock, newBlock, data]
  );

  const handleBlockDelete = useCallback(
    (blockId: string) => {
      const updatedData = {
        ...data,
        blocks: data.blocks.filter((block) => block.id !== blockId),
      };
      setData(updatedData);
      setSelectedBlock(null);
    },
    [data]
  );

  const handleBlockResize = useCallback(
    (blockId: string, field: "w" | "h", value: number) => {
      const updatedData = {
        ...data,
        blocks: data.blocks.map((block) =>
          block.id === blockId
            ? { ...block, [field]: Math.max(1, value) }
            : block
        ),
      };
      setData(updatedData);
    },
    [data]
  );

  const handleBlockMove = useCallback(
    (blockId: string, x: number, y: number) => {
      const updatedData = {
        ...data,
        blocks: data.blocks.map((block) =>
          block.id === blockId ? { ...block, x, y } : block
        ),
      };
      setData(updatedData);
    },
    [data]
  );

  const handleBlockOrientationChange = useCallback(
    (blockId: string, orientation: "H" | "V") => {
      const updatedData = {
        ...data,
        blocks: data.blocks.map((block) =>
          block.id === blockId ? { ...block, orientation } : block
        ),
      };
      setData(updatedData);
    },
    [data]
  );

  // Convert SVG coordinates to grid coordinates
  const svgToGrid = useCallback(
    (svgX: number, svgY: number) => {
      if (!svgRef.current) return { x: 0, y: 0 };
      const rect = svgRef.current.getBoundingClientRect();
      const x = Math.floor((svgX - rect.left) / (rect.width / data.W));
      const y = Math.floor((svgY - rect.top) / (rect.height / data.H));
      return {
        x: Math.max(0, Math.min(data.W - 1, x)),
        y: Math.max(0, Math.min(data.H - 1, y)),
      };
    },
    [data.W, data.H]
  );

  // Mouse event handlers for drag and resize
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, blockId: string, isResizeHandle = false) => {
      e.preventDefault();
      const { x, y } = svgToGrid(e.clientX, e.clientY);
      const block = data.blocks.find((b) => b.id === blockId);
      if (!block) return;

      if (isResizeHandle) {
        setIsResizing(true);
        setResizeStart({ x, y, w: block.w, h: block.h });
      } else {
        setIsDragging(true);
        setDragStart({ x: x - block.x, y: y - block.y });
      }
    },
    [svgToGrid, data.blocks]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if ((!isDragging && !isResizing) || !selectedBlock) return;

      const { x, y } = svgToGrid(e.clientX, e.clientY);
      const block = data.blocks.find((b) => b.id === selectedBlock);
      if (!block) return;

      if (isDragging) {
        const newX = Math.max(0, Math.min(data.W - block.w, x - dragStart.x));
        const newY = Math.max(0, Math.min(data.H - block.h, y - dragStart.y));
        handleBlockMove(selectedBlock, newX, newY);
      } else if (isResizing) {
        const newW = Math.max(
          1,
          Math.min(data.W - block.x, x - resizeStart.x + resizeStart.w)
        );
        const newH = Math.max(
          1,
          Math.min(data.H - block.y, y - resizeStart.y + resizeStart.h)
        );
        handleBlockResize(selectedBlock, "w", newW);
        handleBlockResize(selectedBlock, "h", newH);
      }
    },
    [
      isDragging,
      isResizing,
      selectedBlock,
      svgToGrid,
      data.blocks,
      data.W,
      data.H,
      dragStart,
      resizeStart,
      handleBlockMove,
      handleBlockResize,
    ]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  const selectedBlockData = data.blocks.find(
    (block) => block.id === selectedBlock
  );

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Board Editor</h3>
      </div>

      {isAddingBlock && (
        <div className="mb-3 p-2 bg-blue-900/30 rounded border border-blue-500/50">
          <div className="grid grid-cols-4 gap-1 text-xs">
            <input
              type="text"
              placeholder="ID"
              value={newBlock.id}
              onChange={(e) => setNewBlock({ ...newBlock, id: e.target.value })}
              className="px-1 py-1 bg-gray-800 rounded text-white"
            />
            <select
              value={newBlock.orientation}
              onChange={(e) =>
                setNewBlock({
                  ...newBlock,
                  orientation: e.target.value as "H" | "V",
                })
              }
              className="px-1 py-1 bg-gray-800 rounded text-white"
            >
              <option value="H">H</option>
              <option value="V">V</option>
            </select>
            <input
              type="number"
              placeholder="W"
              value={newBlock.w}
              onChange={(e) =>
                setNewBlock({ ...newBlock, w: parseInt(e.target.value) || 1 })
              }
              className="px-1 py-1 bg-gray-800 rounded text-white"
              min="1"
            />
            <input
              type="number"
              placeholder="H"
              value={newBlock.h}
              onChange={(e) =>
                setNewBlock({ ...newBlock, h: parseInt(e.target.value) || 1 })
              }
              className="px-1 py-1 bg-gray-800 rounded text-white"
              min="1"
            />
          </div>
          <div className="mt-1 text-xs text-blue-300">
            Click on grid to place
          </div>
        </div>
      )}

      {/* SVG Grid */}
      <div className="mb-4 flex justify-center items-center bg-black/20 rounded-lg">
        <svg
          ref={svgRef}
          width={200}
          height={200}
          style={{ border: "1px solid #ccc" }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Grid cells */}
          {Array.from({ length: data.H }).map((_, y) =>
            Array.from({ length: data.W }).map((_, x) => (
              <rect
                key={`${x},${y}`}
                x={(x * 200) / data.W}
                y={(y * 200) / data.H}
                width={200 / data.W}
                height={200 / data.H}
                fill="white"
                stroke="gray"
                strokeWidth={0.5}
                onClick={() => handleCellClick(x, y)}
                style={{ cursor: isAddingBlock ? "crosshair" : "default" }}
              />
            ))
          )}

          {/* Blocks */}
          {data.blocks.map((block) => {
            const isSelected = selectedBlock === block.id;
            return (
              <g key={block.id}>
                <rect
                  x={(block.x * 200) / data.W}
                  y={(block.y * 200) / data.H}
                  width={(block.w * 200) / data.W}
                  height={(block.h * 200) / data.H}
                  fill={getBlockColor(block.id)}
                  opacity={0.9}
                  style={{
                    stroke: getBlockStrokeColor(block.id),
                    cursor: isSelected ? "move" : "pointer",
                  }}
                  strokeWidth={isSelected ? 2 : 1}
                  onMouseDown={(e) => handleMouseDown(e, block.id)}
                  onClick={() => setSelectedBlock(block.id)}
                />

                {/* Block ID text */}
                <text
                  x={(block.x * 200) / data.W + (block.w * 200) / data.W / 2}
                  y={(block.y * 200) / data.H + (block.h * 200) / data.H / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
                  style={{ pointerEvents: "none" }}
                >
                  {block.id}
                </text>

                {/* Resize handle for selected block */}
                {isSelected && (
                  <rect
                    x={(block.x * 200) / data.W + (block.w * 200) / data.W - 8}
                    y={(block.y * 200) / data.H + (block.h * 200) / data.H - 8}
                    width={8}
                    height={8}
                    fill="#FFD700"
                    stroke="#FFA500"
                    strokeWidth={1}
                    style={{ cursor: "nw-resize" }}
                    onMouseDown={(e) => handleMouseDown(e, block.id, true)}
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Block Details */}
      {selectedBlockData && (
        <div className="p-2 bg-gray-800/50 rounded border border-gray-600">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold">
              {selectedBlockData.id}
            </span>
            <button
              onClick={() => handleBlockDelete(selectedBlockData.id)}
              className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
              title="Remove block"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1 text-xs">
            <div>
              <label className="block text-gray-300">Pos</label>
              <div className="flex gap-1">
                <input
                  type="number"
                  value={selectedBlockData.x}
                  onChange={(e) =>
                    handleBlockMove(
                      selectedBlockData.id,
                      parseInt(e.target.value) || 0,
                      selectedBlockData.y
                    )
                  }
                  className="w-8 px-1 py-1 bg-gray-700 rounded text-white text-xs"
                  min="0"
                  max={data.W - selectedBlockData.w}
                />
                <input
                  type="number"
                  value={selectedBlockData.y}
                  onChange={(e) =>
                    handleBlockMove(
                      selectedBlockData.id,
                      selectedBlockData.x,
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="w-8 px-1 py-1 bg-gray-700 rounded text-white text-xs"
                  min="0"
                  max={data.H - selectedBlockData.h}
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300">Size</label>
              <div className="flex gap-1">
                <input
                  type="number"
                  value={selectedBlockData.w}
                  onChange={(e) =>
                    handleBlockResize(
                      selectedBlockData.id,
                      "w",
                      parseInt(e.target.value) || 1
                    )
                  }
                  className="w-8 px-1 py-1 bg-gray-700 rounded text-white text-xs"
                  min="1"
                  max={data.W - selectedBlockData.x}
                />
                <input
                  type="number"
                  value={selectedBlockData.h}
                  onChange={(e) =>
                    handleBlockResize(
                      selectedBlockData.id,
                      "h",
                      parseInt(e.target.value) || 1
                    )
                  }
                  className="w-8 px-1 py-1 bg-gray-700 rounded text-white text-xs"
                  min="1"
                  max={data.H - selectedBlockData.y}
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300">Orient</label>
              <select
                value={selectedBlockData.orientation}
                onChange={(e) =>
                  handleBlockOrientationChange(
                    selectedBlockData.id,
                    e.target.value as "H" | "V"
                  )
                }
                className="w-full px-1 py-1 bg-gray-700 rounded text-white text-xs"
              >
                <option value="H">H</option>
                <option value="V">V</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 ">
        <div className="flex gap-px rounded-xl bg-white/30 hover:bg-transparent">
          <button
            onClick={() => {
              const updatedData = { ...data, W: data.W - 1 };
              setData(updatedData);
            }}
            className="flex-1 px-2 py-1 bg-gray-600 hover:bg-gray-700 text-sm rounded-l-lg"
          >
            W-
          </button>
          <button
            onClick={() => {
              const updatedData = { ...data, W: data.W + 1 };
              setData(updatedData);
            }}
            className="flex-1 px-2 py-1 bg-gray-600 hover:bg-gray-700 text-sm rounded-r-lg"
          >
            W+
          </button>
        </div>
        <div className="flex gap-px rounded-xl bg-white/30 hover:bg-transparent">
          <button
            onClick={() => {
              const updatedData = { ...data, H: data.H - 1 };
              setData(updatedData);
            }}
            className="flex-1 px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded-l-lg text-sm"
          >
            H-
          </button>
          <button
            onClick={() => {
              const updatedData = { ...data, H: data.H + 1 };
              setData(updatedData);
            }}
            className="flex-1 px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded-r-lg text-sm"
          >
            H+
          </button>
        </div>
        <button
          onClick={() => setIsAddingBlock(!isAddingBlock)}
          className={`px-3 py-1 rounded-lg text-sm ${
            isAddingBlock
              ? "bg-red-600 hover:bg-red-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isAddingBlock ? "Cancel" : "Add Block"}
        </button>
        <button
          onClick={() => onVisualize(data)}
          className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold"
        >
          Visualize
        </button>
      </div>

      <div className="text-xs text-gray-400 mt-2">
        Grid: {data.W}×{data.H} | Blocks: {data.blocks.length}
      </div>
    </>
  );
};
