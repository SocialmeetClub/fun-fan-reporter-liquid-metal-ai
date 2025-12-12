import React, { useMemo } from 'react';
import { ZONES } from '../constants';
import { Report, ThreatLevel } from '../types';

interface StadiumMapProps {
  reports: Report[];
  onZoneClick: (zoneId: string) => void;
  selectedZone: string | null;
}

const StadiumMap: React.FC<StadiumMapProps> = ({ reports, onZoneClick, selectedZone }) => {
  
  const zoneStats = useMemo(() => {
    const stats: Record<string, { count: number; maxThreat: number }> = {};
    
    ZONES.forEach(z => {
        stats[z.id] = { count: 0, maxThreat: 0 };
    });

    reports.forEach(r => {
        const zoneId = ZONES.find(z => z.name === r.location)?.id;
        if (zoneId && stats[zoneId]) {
            stats[zoneId].count++;
            const threatVal = r.threatLevel === ThreatLevel.CRITICAL ? 3 : 
                              r.threatLevel === ThreatLevel.HIGH ? 2 :
                              r.threatLevel === ThreatLevel.MEDIUM ? 1 : 0;
            stats[zoneId].maxThreat = Math.max(stats[zoneId].maxThreat, threatVal);
        }
    });
    return stats;
  }, [reports]);

  const getZoneColor = (zoneId: string) => {
    const stat = zoneStats[zoneId];
    if (!stat || stat.count === 0) return 'fill-slate-800 stroke-slate-600';
    
    // High threat overrides everything
    if (stat.maxThreat >= 2) return 'fill-red-600 stroke-red-400 animate-pulse';
    if (stat.maxThreat === 1) return 'fill-yellow-600 stroke-yellow-400';
    
    // Otherwise based on density
    if (stat.count > 10) return 'fill-blue-600 stroke-blue-400';
    return 'fill-blue-900 stroke-blue-700';
  };

  return (
    <div className="relative w-full aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
      <svg viewBox="0 0 800 500" className="w-full h-full">
        {/* Field */}
        <rect 
            x="200" y="150" width="400" height="200" rx="20" 
            className={`cursor-pointer transition-colors duration-300 ${selectedZone === 'G' ? 'fill-green-800' : 'fill-green-900'} stroke-green-600 stroke-2 hover:fill-green-800`}
            onClick={() => onZoneClick('G')}
        />
        <text x="400" y="255" textAnchor="middle" className="fill-green-200 opacity-50 text-2xl font-mono tracking-widest pointer-events-none">PITCH</text>

        {/* North Stand */}
        <path 
            d="M200 130 L600 130 L620 50 L180 50 Z" 
            className={`cursor-pointer transition-colors duration-300 ${getZoneColor('N')} hover:opacity-80`}
            onClick={() => onZoneClick('N')}
        />
        <text x="400" y="100" textAnchor="middle" className="fill-white font-bold pointer-events-none">NORTH STAND</text>

        {/* South Stand */}
        <path 
            d="M200 370 L600 370 L620 450 L180 450 Z" 
            className={`cursor-pointer transition-colors duration-300 ${getZoneColor('S')} hover:opacity-80`}
            onClick={() => onZoneClick('S')}
        />
        <text x="400" y="420" textAnchor="middle" className="fill-white font-bold pointer-events-none">SOUTH STAND</text>

        {/* West Stand */}
        <path 
            d="M180 150 L180 350 L50 380 L50 120 Z" 
            className={`cursor-pointer transition-colors duration-300 ${getZoneColor('W')} hover:opacity-80`}
            onClick={() => onZoneClick('W')}
        />
        <text x="110" y="260" textAnchor="middle" className="fill-white font-bold pointer-events-none rotate-270" style={{transformOrigin: "110px 260px", transform: "rotate(-90deg)"}}>WEST</text>

        {/* East Stand */}
        <path 
            d="M620 150 L620 350 L750 380 L750 120 Z" 
            className={`cursor-pointer transition-colors duration-300 ${getZoneColor('E')} hover:opacity-80`}
            onClick={() => onZoneClick('E')}
        />
         <text x="690" y="260" textAnchor="middle" className="fill-white font-bold pointer-events-none rotate-90" style={{transformOrigin: "690px 260px", transform: "rotate(90deg)"}}>EAST</text>

      </svg>
      
      {/* Legend overlay */}
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm p-2 rounded text-xs text-slate-300 font-mono border border-slate-700">
        <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 bg-blue-900 border border-blue-700"></div> Low Activity</div>
        <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 bg-blue-600 border border-blue-400"></div> High Activity</div>
        <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 bg-yellow-600 border border-yellow-400"></div> Warning</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-600 border border-red-400 animate-pulse"></div> Critical</div>
      </div>
    </div>
  );
};

export default StadiumMap;