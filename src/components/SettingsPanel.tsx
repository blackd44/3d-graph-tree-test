interface SettingsPanelProps {
  minDistance: number;
  setMinDistance: (value: number) => void;
  nodeRadius: number;
  setNodeRadius: (value: number) => void;
  iterations: number;
  setIterations: (value: number) => void;
  forceStrength: number;
  setForceStrength: (value: number) => void;
  nodeColor: string;
  setNodeColor: (value: string) => void;
  activeColor: string;
  setActiveColor: (value: string) => void;
  edgeColor: string;
  setEdgeColor: (value: string) => void;
  nodeOpacity: number;
  setNodeOpacity: (value: number) => void;
  edgeOpacity: number;
  setEdgeOpacity: (value: number) => void;
}

export function SettingsPanel({
  minDistance,
  setMinDistance,
  nodeRadius,
  setNodeRadius,
  iterations,
  setIterations,
  forceStrength,
  setForceStrength,
  nodeColor,
  setNodeColor,
  activeColor,
  setActiveColor,
  edgeColor,
  setEdgeColor,
  nodeOpacity,
  setNodeOpacity,
  edgeOpacity,
  setEdgeOpacity,
}: SettingsPanelProps) {
  return (
    <div className="absolute top-4 left-4 bg-black/20 backdrop-blur-sm p-4 rounded-lg text-white max-w-xs">
      <h4 className="text-lg font-bold mb-3 text-cyan-300">Graph Settings</h4>

      <div className="space-y-3">
        <div>
          <label className="block text-sm mb-1">
            Min Distance: {minDistance.toFixed(2)}
          </label>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.05"
            value={minDistance}
            onChange={(e) => setMinDistance(parseFloat(e.target.value))}
            className="w-full accent-cyan-400"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">
            Node Radius: {nodeRadius.toFixed(2)}
          </label>
          <input
            type="range"
            min="0.05"
            max="0.5"
            step="0.01"
            value={nodeRadius}
            onChange={(e) => setNodeRadius(parseFloat(e.target.value))}
            className="w-full accent-cyan-400"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">
            Iterations: {iterations}
          </label>
          <input
            type="range"
            min="10"
            max="200"
            step="10"
            value={iterations}
            onChange={(e) => setIterations(parseInt(e.target.value))}
            className="w-full accent-cyan-400"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">
            Force Strength: {forceStrength.toFixed(2)}
          </label>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.05"
            value={forceStrength}
            onChange={(e) => setForceStrength(parseFloat(e.target.value))}
            className="w-full accent-purple-400"
          />
          <div className="text-xs text-gray-300 mt-1">
            Negative = Repulsion, Positive = Attraction
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs mb-1">Node Color</label>
            <input
              type="color"
              value={nodeColor}
              onChange={(e) => setNodeColor(e.target.value)}
              className="w-full h-8 rounded"
            />
          </div>
          <div>
            <label className="block text-xs mb-1">Active Color</label>
            <input
              type="color"
              value={activeColor}
              onChange={(e) => setActiveColor(e.target.value)}
              className="w-full h-8 rounded"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs mb-1">Edge Color</label>
          <input
            type="color"
            value={edgeColor}
            onChange={(e) => setEdgeColor(e.target.value)}
            className="w-full h-8 rounded"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs mb-1">
              Node Opacity: {nodeOpacity.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={nodeOpacity}
              onChange={(e) => setNodeOpacity(parseFloat(e.target.value))}
              className="w-full accent-orange-400"
            />
          </div>
          <div>
            <label className="block text-xs mb-1">
              Edge Opacity: {edgeOpacity.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={edgeOpacity}
              onChange={(e) => setEdgeOpacity(parseFloat(e.target.value))}
              className="w-full accent-orange-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
