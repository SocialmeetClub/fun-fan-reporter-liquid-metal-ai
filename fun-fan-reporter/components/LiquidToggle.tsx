import React from 'react';
import { NetworkMode } from '../types';
import { Cloud, Radio } from 'lucide-react';

interface LiquidToggleProps {
  mode: NetworkMode;
  onToggle: (mode: NetworkMode) => void;
}

const LiquidToggle: React.FC<LiquidToggleProps> = ({ mode, onToggle }) => {
  const isCloud = mode === 'CLOUD';

  return (
    <div className="flex items-center gap-3 bg-slate-900 p-1.5 rounded-full border border-slate-700 relative shadow-inner">
        {/* Slider Background */}
        <div className={`absolute top-1 bottom-1 w-[50%] rounded-full transition-all duration-500 ease-in-out ${isCloud ? 'left-1 bg-liquid-500 shadow-[0_0_15px_rgba(14,165,233,0.5)]' : 'left-[48%] bg-metal-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]'}`}></div>

        <button 
            onClick={() => onToggle('CLOUD')}
            className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-colors ${isCloud ? 'text-white' : 'text-slate-400 hover:text-white'}`}
        >
            <Cloud size={16} />
            VULTR CLOUD
        </button>

        <button 
            onClick={() => onToggle('EDGE_LIQUID')}
            className={`relative z-10 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-colors ${!isCloud ? 'text-black' : 'text-slate-400 hover:text-white'}`}
        >
            <Radio size={16} />
            LIQUID METAL
        </button>
    </div>
  );
};

export default LiquidToggle;