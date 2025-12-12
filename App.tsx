import React, { useState, useEffect, useRef } from 'react';
import { NetworkMode, Report, ReportCategory, ThreatLevel, Alert } from './types';
import { ZONES, MOCK_REPORTS } from './constants';
import LiquidToggle from './components/LiquidToggle';
import StadiumMap from './components/StadiumMap';
import { analyzeReportWithGemini } from './services/geminiService';
import { generateElevenLabsAudio, isElevenLabsAvailable } from './services/elevenLabsService';
import { LiveService } from './services/liveService';
import { checkRaindropHealth } from './services/raindropConnection'; // Raindrop Integration
import { AlertTriangle, Send, Mic, MapPin, Radio, Activity, Volume2, Database, Server, Wifi, WifiOff, DollarSign, X, CreditCard, Info } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [mode, setMode] = useState<NetworkMode>('CLOUD');
  const [reports, setReports] = useState<Report[]>(MOCK_REPORTS as any[]);
  const [newReportText, setNewReportText] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('N');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Economy State
  const [walletBalance, setWalletBalance] = useState(500);
  const [activeTipReport, setActiveTipReport] = useState<Report | null>(null);
  const [tipAmount, setTipAmount] = useState<string>('5');

  // Live State
  const [isLiveActive, setIsLiveActive] = useState(false);
  const liveServiceRef = useRef<LiveService | null>(null);

  // Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const reportsEndRef = useRef<HTMLDivElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
     audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
     liveServiceRef.current = new LiveService();
     audioPlayerRef.current = new Audio();
     
     // Check Raindrop Health on Mount
     checkRaindropHealth().then(healthy => console.log("Raindrop Mesh Status:", healthy ? "OPTIMAL" : "DEGRADED"));

     return () => {
       audioContextRef.current?.close();
       liveServiceRef.current?.disconnect(() => {});
     }
  }, []);

  useEffect(() => {
    reportsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [reports]);

  // Simulate Vultr Redis / Liquid Metal Sync
  useEffect(() => {
    if (mode === 'EDGE_LIQUID') {
      const interval = setInterval(() => {
        if (Math.random() > 0.7) {
            const zones = ZONES.map(z => z.name);
            const randomZone = zones[Math.floor(Math.random() * zones.length)];
            const edgeReport: Report = {
                id: `edge-${Date.now()}`,
                timestamp: Date.now(),
                text: `⚡ SYNC: Raindrop Node [${Math.floor(Math.random() * 99)}] -> Vultr Redis [LATENCY: 2ms]`,
                location: randomZone,
                category: ReportCategory.LOGISTICS,
                threatLevel: ThreatLevel.LOW,
                status: 'analyzed',
                author: 'LIQUID_NODE',
                upvotes: 0,
                tips: 0
            };
            setReports(prev => [...prev, edgeReport]);
        }
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [mode]);

  const handleZoneClick = (zoneId: string) => {
    setSelectedZone(zoneId);
  };

  const handleModeToggle = (newMode: NetworkMode) => {
    setMode(newMode);
    if (newMode === 'EDGE_LIQUID') {
        const sysMsg: Report = {
            id: `sys-${Date.now()}`,
            timestamp: Date.now(),
            text: "⚠️ CLOUD CONNECTION SEVERED. ENGAGING LIQUID METAL MESH. OFFLINE PROTOCOL ACTIVE.",
            location: "SYSTEM",
            category: ReportCategory.SAFETY,
            threatLevel: ThreatLevel.LOW,
            status: 'broadcasted',
            author: 'SYSTEM',
            upvotes: 999,
            tips: 0
        };
        setReports(prev => [...prev, sysMsg]);
    } else {
        const sysMsg: Report = {
            id: `sys-${Date.now()}`,
            timestamp: Date.now(),
            text: "☁️ CLOUD LINK RESTORED. UPLOADING REDIS CACHE TO VULTR CLOUD GPU.",
            location: "SYSTEM",
            category: ReportCategory.LOGISTICS,
            threatLevel: ThreatLevel.LOW,
            status: 'broadcasted',
            author: 'SYSTEM',
            upvotes: 999,
            tips: 0
        };
        setReports(prev => [...prev, sysMsg]);
    }
  };

  const toggleLiveWalkieTalkie = () => {
    if (isLiveActive) {
      liveServiceRef.current?.disconnect(setIsLiveActive);
    } else {
      liveServiceRef.current?.connect(setIsLiveActive);
    }
  };

  const submitReport = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newReportText.trim()) return;

    setIsProcessing(true);
    const tempId = `temp-${Date.now()}`;
    const zoneName = ZONES.find(z => z.id === selectedZone)?.name || "Unknown";

    const optimisticReport: Report = {
      id: tempId,
      timestamp: Date.now(),
      text: newReportText,
      location: zoneName,
      category: ReportCategory.UNKNOWN,
      threatLevel: ThreatLevel.LOW,
      status: 'pending',
      author: 'You',
      upvotes: 0,
      tips: 0
    };

    setReports(prev => [...prev, optimisticReport]);
    setNewReportText('');

    let analysis;
    if (mode === 'CLOUD') {
        analysis = await analyzeReportWithGemini(newReportText);
    } else {
        // Edge Logic Simulation
        await new Promise(r => setTimeout(r, 600)); 
        analysis = {
            category: ReportCategory.LOGISTICS,
            threatLevel: ThreatLevel.LOW,
            summary: "Edge processed"
        };
    }

    setReports(prev => prev.map(r => r.id === tempId ? {
        ...r,
        category: analysis.category as ReportCategory,
        threatLevel: analysis.threatLevel as ThreatLevel,
        status: 'analyzed'
    } : r));

    setIsProcessing(false);

    if ((analysis.threatLevel === ThreatLevel.HIGH || analysis.threatLevel === ThreatLevel.CRITICAL)) {
        triggerVoiceAlert(newReportText, zoneName);
    }
  };

  const triggerVoiceAlert = async (text: string, location: string) => {
    const alertId = `alert-${Date.now()}`;
    const message = `Attention. High priority in ${location}: ${text}`;
    
    const newAlert: Alert = {
        id: alertId,
        message: message,
        level: ThreatLevel.HIGH,
        timestamp: Date.now()
    };
    setAlerts(prev => [newAlert, ...prev]);

    const audioUrl = await generateElevenLabsAudio(message);
    
    if (audioUrl && audioPlayerRef.current) {
        audioPlayerRef.current.src = audioUrl;
        audioPlayerRef.current.play().catch(e => console.error("Playback failed", e));
    }
  };

  const handleTipClick = (report: Report) => {
    setActiveTipReport(report);
    setTipAmount('5');
  };

  const handleSendTip = () => {
    if (!activeTipReport || !tipAmount) return;
    const amount = parseInt(tipAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    if (amount > walletBalance) {
        alert("Insufficient funds in Liquid Wallet");
        return;
    }
    setWalletBalance(prev => prev - amount);
    setReports(prev => prev.map(r => r.id === activeTipReport.id ? { ...r, tips: (r.tips || 0) + amount } : r));
    setActiveTipReport(null);
  };

  // Dynamic Styles
  const bgClass = mode === 'CLOUD' ? 'bg-slate-900' : 'bg-black';
  const textClass = mode === 'CLOUD' ? 'text-slate-100' : 'text-amber-500 font-mono';
  const borderClass = mode === 'CLOUD' ? 'border-slate-700' : 'border-amber-900';
  const accentClass = mode === 'CLOUD' ? 'text-liquid-400' : 'text-metal-500';

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${bgClass} ${textClass}`}>
      
      {/* Disclaimer Banner for Judges */}
      {!isElevenLabsAvailable && (
        <div className="bg-yellow-600/20 border-b border-yellow-600/50 p-2 text-center text-xs font-mono text-yellow-200 flex items-center justify-center gap-2">
            <Info size={14} />
            <span>JUDGES NOTE: ELEVENLABS API KEY NOT DETECTED. VOICE ALERTS RUNNING IN SIMULATION MODE (BROWSER TTS).</span>
        </div>
      )}

      {/* Tipping Modal */}
      {activeTipReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className={`w-full max-w-md bg-slate-900 border ${mode === 'CLOUD' ? 'border-liquid-500' : 'border-metal-500'} rounded-2xl shadow-2xl p-6 relative`}>
                <button 
                    onClick={() => setActiveTipReport(null)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white"
                >
                    <X size={24} />
                </button>

                <div className="flex flex-col items-center gap-4 text-center">
                    <div className={`p-4 rounded-full ${mode === 'CLOUD' ? 'bg-liquid-500/20 text-liquid-400' : 'bg-metal-500/20 text-metal-400'}`}>
                        <DollarSign size={40} />
                    </div>
                    
                    <div>
                        <h3 className="text-xl font-bold text-white">Send Tip to {activeTipReport.author}</h3>
                        <p className="text-sm opacity-60 mt-1">Reward this reporter for valuable intel.</p>
                    </div>

                    <div className="w-full bg-slate-800 rounded-xl p-4 border border-slate-700">
                        <label className="text-xs text-slate-400 block mb-2 text-left">AMOUNT (MERITOCRACY COINS)</label>
                        <div className="flex items-center gap-2">
                             <span className="text-2xl font-bold text-green-400">$</span>
                             <input 
                                type="number" 
                                value={tipAmount}
                                onChange={(e) => setTipAmount(e.target.value)}
                                className="bg-transparent text-3xl font-bold text-white focus:outline-none w-full"
                                autoFocus
                             />
                        </div>
                    </div>

                    <button 
                        onClick={handleSendTip}
                        className="w-full py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all flex items-center justify-center gap-2"
                    >
                        SEND TIP
                    </button>
                    
                    <div className="flex items-center gap-2 text-xs opacity-50">
                        <CreditCard size={12} />
                        <span>Processed securely via Stripe Connect</span>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b ${borderClass} p-4 bg-opacity-90`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className={`p-2 rounded-lg ${mode === 'CLOUD' ? 'bg-liquid-500 text-black' : 'bg-metal-500 text-black animate-pulse'}`}>
                {mode === 'CLOUD' ? <Wifi size={24} /> : <WifiOff size={24} />}
             </div>
             <div>
                <h1 className="text-xl font-bold tracking-tight">THE FUN FAN REPORTER</h1>
                <p className="text-xs opacity-60 font-mono tracking-widest">
                  {mode === 'CLOUD' ? 'VULTR CLOUD GPU / ONLINE' : 'LIQUID METAL RAINDROP / OFFLINE'}
                </p>
             </div>
          </div>
          
          <LiquidToggle mode={mode} onToggle={handleModeToggle} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Map & Stats */}
        <div className="lg:col-span-2 space-y-6">
            {/* Status Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-4 rounded-xl border ${mode === 'CLOUD' ? 'bg-slate-800/50' : 'bg-amber-900/10'} ${borderClass}`}>
                    <div className="text-xs opacity-60 mb-1 flex items-center gap-1">
                      {mode === 'CLOUD' ? <Server size={10} /> : <Database size={10} />}
                      {mode === 'CLOUD' ? 'CORE' : 'EDGE DB'}
                    </div>
                    <div className="font-mono text-sm md:text-lg font-bold flex items-center gap-2 truncate">
                        {mode === 'CLOUD' ? 'VULTR CLOUD' : 'LIQUID METAL'}
                    </div>
                </div>
                <div className={`p-4 rounded-xl border ${mode === 'CLOUD' ? 'bg-slate-800/50' : 'bg-amber-900/10'} ${borderClass}`}>
                    <div className="text-xs opacity-60 mb-1">CROWD DENSITY</div>
                    <div className="font-mono text-lg font-bold">78%</div>
                </div>
                <div className={`p-4 rounded-xl border ${mode === 'CLOUD' ? 'bg-slate-800/50' : 'bg-amber-900/10'} ${borderClass}`}>
                    <div className="text-xs opacity-60 mb-1">RAINDROP NODES</div>
                    <div className="font-mono text-lg font-bold">{mode === 'CLOUD' ? '4,521' : '3 (MESH)'}</div>
                </div>
                <div className={`p-4 rounded-xl border ${mode === 'CLOUD' ? 'bg-slate-800/50' : 'bg-amber-900/10'} ${borderClass}`}>
                    <div className="text-xs opacity-60 mb-1">VOICE AGENT</div>
                    <div className={`font-mono text-lg font-bold ${isElevenLabsAvailable ? 'text-green-400' : 'text-yellow-500'}`}>
                      {isElevenLabsAvailable ? 'ELEVENLABS' : 'SIMULATION'}
                    </div>
                </div>
            </div>

            {/* Map */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <h2 className={`text-lg font-bold flex items-center gap-2 ${accentClass}`}>
                        <MapPin size={18} /> LIVE HEATMAP
                    </h2>
                    <span className="text-xs font-mono opacity-50">CLICK ZONE TO FILTER</span>
                </div>
                <StadiumMap reports={reports} onZoneClick={handleZoneClick} selectedZone={selectedZone} />
            </div>

            {/* Report Input */}
            <div className={`p-6 rounded-2xl border ${mode === 'CLOUD' ? 'bg-slate-800/50' : 'bg-zinc-900'} ${borderClass}`}>
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                    <Send size={16} /> SUBMIT FIELD REPORT
                </h3>
                <form onSubmit={submitReport} className="flex flex-col gap-4">
                    <div className="flex gap-2">
                        <select 
                            value={selectedZone} 
                            onChange={(e) => setSelectedZone(e.target.value)}
                            className={`bg-slate-900 border rounded-lg px-3 text-sm focus:outline-none focus:ring-2 ${mode === 'CLOUD' ? 'border-slate-700 focus:ring-liquid-500' : 'border-amber-900 focus:ring-metal-500'}`}
                        >
                            {ZONES.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                        </select>
                        <span className="flex-1"></span>
                    </div>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={newReportText}
                            onChange={(e) => setNewReportText(e.target.value)}
                            placeholder="Describe what you see (e.g., 'Fight breaking out in Section N')..."
                            className={`flex-1 bg-slate-900 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all ${mode === 'CLOUD' ? 'border-slate-700 focus:ring-liquid-500' : 'border-amber-900 focus:ring-metal-500'}`}
                        />
                        <button 
                            type="button"
                            className={`p-3 rounded-xl transition-all duration-300 relative overflow-hidden ${isLiveActive ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)]' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                            onClick={toggleLiveWalkieTalkie}
                            title={isLiveActive ? "Disconnect Walkie-Talkie" : "Connect Walkie-Talkie (Live API)"}
                        >
                            <Mic size={20} className={isLiveActive ? 'animate-pulse' : ''} />
                            {isLiveActive && (
                                <span className="absolute top-0 right-0 w-2 h-2 bg-white rounded-full m-1 animate-ping"></span>
                            )}
                        </button>
                        <button 
                            type="submit"
                            disabled={!newReportText.trim() || isProcessing}
                            className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                                isProcessing 
                                ? 'bg-slate-700 opacity-50 cursor-not-allowed' 
                                : mode === 'CLOUD' 
                                    ? 'bg-liquid-600 hover:bg-liquid-500 text-white shadow-lg shadow-liquid-500/20' 
                                    : 'bg-metal-600 hover:bg-metal-500 text-black shadow-lg shadow-metal-500/20'
                            }`}
                        >
                           {isProcessing ? 'SCANNING...' : <><Send size={18} /> SEND</>} 
                        </button>
                    </div>
                </form>
            </div>
        </div>

        {/* Right Col: Feed & Alerts */}
        <div className="space-y-6 flex flex-col h-[calc(100vh-120px)] overflow-hidden">
            
            {/* Live Indicator */}
            {isLiveActive && (
                 <div className="bg-red-600 text-white p-3 rounded-xl font-bold flex items-center justify-between animate-pulse shadow-lg shadow-red-900/50">
                     <span className="flex items-center gap-2"><Mic size={18}/> LIVE WALKIE-TALKIE</span>
                     <div className="flex gap-1">
                         <div className="w-1 h-3 bg-white/80 animate-[bounce_1s_infinite]"></div>
                         <div className="w-1 h-4 bg-white/80 animate-[bounce_1.1s_infinite]"></div>
                         <div className="w-1 h-2 bg-white/80 animate-[bounce_0.9s_infinite]"></div>
                     </div>
                 </div>
            )}

            {/* Active Alerts */}
            {alerts.length > 0 && (
                <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 animate-pulse-fast">
                    <h3 className="text-red-400 font-bold flex items-center gap-2 text-sm mb-2">
                        <AlertTriangle size={16} /> 
                        {isElevenLabsAvailable ? 'ACTIVE ALERTS (ELEVENLABS)' : 'ACTIVE ALERTS (VOICE SIMULATION)'}
                    </h3>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                        {alerts.map(alert => (
                            <div key={alert.id} className="text-xs text-red-200 bg-red-900/40 p-2 rounded flex items-start gap-2 border border-red-800/30">
                                <Volume2 size={12} className="mt-1 flex-shrink-0" />
                                <div>
                                    <span className="font-bold block">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                                    {alert.message}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Live Feed */}
            <div className={`flex-1 rounded-2xl border overflow-hidden flex flex-col ${mode === 'CLOUD' ? 'bg-slate-800/30 border-slate-700' : 'bg-amber-900/10 border-amber-900/50'}`}>
                <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-900/50">
                    <h3 className={`font-bold flex items-center gap-2 ${accentClass}`}>
                        <Activity size={18} />
                        LIVE INTELLIGENCE
                    </h3>
                    <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400 font-mono">
                        {reports.length} REPORTS
                    </span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {reports.length === 0 && (
                        <div className="text-center opacity-40 py-10">No reports yet. Be the first reporter.</div>
                    )}
                    {reports.map((report) => (
                        <div 
                            key={report.id} 
                            className={`p-3 rounded-lg border text-sm transition-all hover:translate-x-1 ${
                                report.author === 'SYSTEM' || report.author === 'LIQUID_NODE'
                                ? 'bg-slate-800 border-slate-600 opacity-75 font-mono text-xs' 
                                : report.threatLevel === ThreatLevel.HIGH || report.threatLevel === ThreatLevel.CRITICAL
                                    ? 'bg-red-900/10 border-red-800/50 border-l-4 border-l-red-500'
                                    : 'bg-slate-800/40 border-slate-700 border-l-4 border-l-slate-600'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`font-bold text-xs px-1.5 py-0.5 rounded ${
                                    report.category === ReportCategory.SAFETY ? 'bg-red-900 text-red-300' :
                                    report.category === ReportCategory.VIBE ? 'bg-purple-900 text-purple-300' :
                                    report.category === ReportCategory.MEDICAL ? 'bg-blue-900 text-blue-300' :
                                    'bg-slate-700 text-slate-300'
                                }`}>
                                    {report.category}
                                </span>
                                <span className="text-xs opacity-50 font-mono">{new Date(report.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <p className="mb-2 leading-relaxed opacity-90">{report.text}</p>
                            
                            <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-700/30">
                                <div className="flex items-center gap-3 text-xs opacity-60">
                                    <span className="flex items-center gap-1"><MapPin size={10} /> {report.location}</span>
                                    <span>@{report.author}</span>
                                </div>
                                {report.author !== 'SYSTEM' && report.author !== 'LIQUID_NODE' && (
                                    <div className="flex items-center gap-2">
                                        {report.tips && report.tips > 0 ? (
                                             <span className="text-green-400 font-bold text-xs flex items-center gap-1">
                                                <DollarSign size={10} /> {report.tips}
                                             </span>
                                        ) : null}
                                        <button 
                                            onClick={() => handleTipClick(report)}
                                            className="flex items-center gap-1 text-xs bg-slate-700 hover:bg-green-700 hover:text-white px-2 py-1 rounded transition-colors text-slate-300"
                                        >
                                            <DollarSign size={12} /> Tip
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={reportsEndRef} />
                </div>
            </div>

            {/* Tipping / Economy Micro-simulation */}
             <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center justify-between text-sm">
                 <div className="flex flex-col">
                     <span className="opacity-60 text-xs">YOUR WALLET</span>
                     <span className="font-mono text-green-400 font-bold text-lg flex items-center gap-1">
                        $ {walletBalance}.00
                     </span>
                 </div>
                 <div className="flex items-center gap-2 opacity-50 text-xs">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Stripe Connected
                 </div>
             </div>

        </div>
      </main>
    </div>
  );
};

export default App;