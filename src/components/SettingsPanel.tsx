interface SettingsPanelProps {
  nodeRadius: number;
  setNodeRadius: (value: number) => void;
  iterations: number;
  setIterations: (value: number) => void;
  forceStrength: number;
  setForceStrength: (value: number) => void;
  centerForceStrength: number;
  setCenterForceStrength: (value: number) => void;
  fixedEdgeLength: number;
  setFixedEdgeLength: (value: number) => void;
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
  nodeBrightness: number;
  setNodeBrightness: (value: number) => void;
  useSelectedAsCenter: boolean;
  setUseSelectedAsCenter: (value: boolean) => void;
}

export function SettingsPanel({
  nodeRadius,
  setNodeRadius,
  iterations,
  setIterations,
  forceStrength,
  setForceStrength,
  centerForceStrength,
  setCenterForceStrength,
  fixedEdgeLength,
  setFixedEdgeLength,
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
  nodeBrightness,
  setNodeBrightness,
  useSelectedAsCenter,
  setUseSelectedAsCenter,
}: SettingsPanelProps) {
  return (
    <div className="absolute top-0 left-0 bottom-0 overflow-auto bg-black/20 backdrop-blur-sm p-4 text-white max-w-xs">
      <h4 className="text-lg font-bold mb-3 text-cyan-300">Graph Settings</h4>

      <div className="space-y-3">

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
            min="-0.5"
            max="1.5"
            step="0.05"
            value={forceStrength}
            onChange={(e) => setForceStrength(parseFloat(e.target.value))}
            className="w-full accent-purple-400"
          />
          <div className="text-xs text-gray-300 mt-1">
            Negative = Repulsion, Positive = Attraction
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">
            Center Force: {centerForceStrength.toFixed(2)}
          </label>
          <input
            type="range"
            min="0"
            max="0.8"
            step="0.05"
            value={centerForceStrength}
            onChange={(e) => setCenterForceStrength(parseFloat(e.target.value))}
            className="w-full accent-green-400"
          />
          <div className="text-xs text-gray-300 mt-1">
            Pushes nodes outward from center
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">
            Fixed Edge Length: {fixedEdgeLength.toFixed(2)}
          </label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={fixedEdgeLength}
            onChange={(e) => setFixedEdgeLength(parseFloat(e.target.value))}
            className="w-full accent-cyan-400"
          />
          <div className="text-xs text-gray-300 mt-1">
            All edges maintain this exact length
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

        <div>
          <label className="block text-xs mb-1">
            Node Brightness: {nodeBrightness.toFixed(2)}
          </label>
          <input
            type="range"
            min="0"
            max="0.5"
            step="0.01"
            value={nodeBrightness}
            onChange={(e) => setNodeBrightness(parseFloat(e.target.value))}
            className="w-full accent-yellow-400"
          />
          <div className="text-xs text-gray-300 mt-1">
            Controls node glow intensity
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="block text-sm">
            Rotation Center
          </label>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-300">Center</span>
            <button
              type="button"
              onClick={() => setUseSelectedAsCenter(!useSelectedAsCenter)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 !bg-white/20`}
            >
              <div
                className={`block size-4 aspect-square transform rounded-full bg-white transition-transform ${
                  useSelectedAsCenter ? 'translate-x-1' : '-translate-x-4'
                }`}
              />
            </button>
            <span className="text-xs text-gray-300">Selected</span>
          </div>
        </div>
        <div className="text-xs text-gray-300">
          {useSelectedAsCenter ? 'Camera orbits around selected node' : 'Camera orbits around graph centroid'}
        </div>
      </div>
    </div>
  );
}
