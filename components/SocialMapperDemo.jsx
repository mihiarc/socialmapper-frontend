import React, { useState, useCallback } from 'react';
import { MapPin, Clock, Users, Search, Layers, Download, Settings, Play, X, Menu, TreePine, Utensils, GraduationCap, Stethoscope, BookOpen, ShoppingCart, Bus, Coffee } from 'lucide-react';

const DEMO_ISOCHRONE = {
  center: { lat: 35.9132, lng: -79.0558 },
  name: "Chapel Hill, NC",
  population: 45230,
  blocks: 23,
  pois: [
    { name: "Chapel Hill Public Library", type: "library", distance: "0.4 mi" },
    { name: "UNC Health", type: "hospital", distance: "1.2 mi" },
    { name: "Weaver Street Market", type: "grocery", distance: "0.8 mi" },
  ]
};

const POI_CATEGORIES = [
  { id: 'library', name: 'Libraries', icon: BookOpen, color: '#60A5FA' },
  { id: 'hospital', name: 'Healthcare', icon: Stethoscope, color: '#F87171' },
  { id: 'school', name: 'Schools', icon: GraduationCap, color: '#FBBF24' },
  { id: 'grocery', name: 'Groceries', icon: ShoppingCart, color: '#34D399' },
  { id: 'park', name: 'Parks', icon: TreePine, color: '#4ADE80' },
  { id: 'restaurant', name: 'Dining', icon: Utensils, color: '#FB923C' },
  { id: 'transit', name: 'Transit', icon: Bus, color: '#A78BFA' },
  { id: 'cafe', name: 'Cafes', icon: Coffee, color: '#F472B6' },
];

const TRAVEL_MODES = [
  { id: 'walk', name: 'Walk', speed: '5 km/h', emoji: '🚶' },
  { id: 'bike', name: 'Bike', speed: '15 km/h', emoji: '🚴' },
  { id: 'drive', name: 'Drive', speed: '50 km/h', emoji: '🚗' },
];

const TopoPattern = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="topo" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
        <path d="M0 50 Q25 30, 50 50 T100 50" fill="none" stroke="currentColor" strokeWidth="0.5"/>
        <path d="M0 70 Q25 50, 50 70 T100 70" fill="none" stroke="currentColor" strokeWidth="0.5"/>
        <path d="M0 30 Q25 10, 50 30 T100 30" fill="none" stroke="currentColor" strokeWidth="0.5"/>
        <circle cx="80" cy="20" r="15" fill="none" stroke="currentColor" strokeWidth="0.5"/>
        <circle cx="80" cy="20" r="10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#topo)"/>
  </svg>
);

const GridOverlay = () => (
  <div className="absolute inset-0 pointer-events-none" style={{
    backgroundImage: `
      linear-gradient(rgba(148, 163, 184, 0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(148, 163, 184, 0.04) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px'
  }}/>
);

const IsochroneViz = ({ isActive }) => {
  const rings = [0.25, 0.45, 0.65, 0.85, 1];
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {rings.map((scale, i) => (
        <div
          key={i}
          className="absolute rounded-full border transition-all duration-1000"
          style={{
            width: `${scale * 260}px`,
            height: `${scale * 240}px`,
            borderColor: isActive ? `rgba(59, 130, 246, ${0.6 - i * 0.1})` : 'transparent',
            borderWidth: i === 0 ? '2px' : '1px',
            transform: `scale(${isActive ? 1 : 0.8})`,
            transitionDelay: `${i * 100}ms`,
            borderStyle: i > 2 ? 'dashed' : 'solid',
            opacity: isActive ? 1 : 0
          }}
        />
      ))}
      {isActive && (
        <div className="absolute w-4 h-4 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50">
          <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75"/>
        </div>
      )}
    </div>
  );
};

const MapVisualization = ({ isAnalyzing, results }) => (
  <div className="relative w-full h-full bg-slate-900 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"/>
    <TopoPattern />
    <GridOverlay />
    
    <div className="absolute top-3 left-3 font-mono text-[10px] text-slate-500 tracking-wider">35.9132°N</div>
    <div className="absolute top-3 right-3 font-mono text-[10px] text-slate-500 tracking-wider">79.0558°W</div>
    
    <div className="absolute bottom-3 left-3 flex items-center gap-2">
      <div className="w-16 h-0.5 bg-gradient-to-r from-slate-500 to-transparent"/>
      <span className="font-mono text-[10px] text-slate-500">1 km</span>
    </div>
    
    <IsochroneViz isActive={isAnalyzing || results} />
    
    {results && (
      <div className="absolute inset-0 flex items-center justify-center">
        {DEMO_ISOCHRONE.pois.map((poi, i) => (
          <div key={poi.name} className="absolute" style={{ transform: `translate(${(i - 1) * 70}px, ${(i % 2) * 50 - 25}px)` }}>
            <div className="relative group cursor-pointer">
              <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50 group-hover:scale-150 transition-transform"/>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-slate-800/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-slate-200 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                {poi.name}
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
    
    {isAnalyzing && (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/80 backdrop-blur-sm rounded-full border border-slate-700">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"/>
          <span className="text-sm text-slate-300 font-medium">Analyzing accessibility...</span>
        </div>
      </div>
    )}
    
    {!isAnalyzing && !results && (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center max-w-xs px-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center">
            <MapPin className="w-7 h-7 text-slate-500"/>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            Enter a location to analyze community accessibility
          </p>
        </div>
      </div>
    )}
  </div>
);

const LocationSearch = ({ value, onChange, onSubmit }) => {
  const [isFocused, setIsFocused] = useState(false);
  const suggestions = ["Chapel Hill, NC", "Durham, NC", "Raleigh, NC", "Portland, OR"];
  
  return (
    <div className="relative">
      <div className={`relative flex items-center transition-all duration-300 ${isFocused ? 'ring-2 ring-blue-500/50' : ''}`}>
        <Search className="absolute left-3 w-4 h-4 text-slate-400"/>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
          placeholder="Enter location..."
          className="w-full pl-10 pr-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-600 transition-colors"
        />
      </div>
      
      {isFocused && !value && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 rounded-lg overflow-hidden shadow-xl z-50">
          {suggestions.map((s) => (
            <button key={s} onClick={() => { onChange(s); onSubmit(); }} className="w-full px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-700/50 transition-colors flex items-center gap-2">
              <MapPin className="w-3 h-3 text-slate-500"/>{s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const TravelModeSelector = ({ selected, onChange }) => (
  <div className="grid grid-cols-3 gap-1.5">
    {TRAVEL_MODES.map((mode) => (
      <button
        key={mode.id}
        onClick={() => onChange(mode.id)}
        className={`px-2 py-2 rounded-lg text-center transition-all duration-300 ${
          selected === mode.id
            ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
            : 'bg-slate-800/30 border-slate-700/30 text-slate-400 hover:bg-slate-700/30'
        } border`}
      >
        <div className="text-lg">{mode.emoji}</div>
        <div className="text-[10px] font-medium">{mode.name}</div>
      </button>
    ))}
  </div>
);

const TimeSlider = ({ value, onChange }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <label className="text-xs text-slate-400">Travel Time</label>
      <span className="text-xs font-mono text-blue-400">{value} min</span>
    </div>
    <input
      type="range"
      min="5"
      max="60"
      step="5"
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full h-1.5 bg-slate-700/50 rounded-full appearance-none cursor-pointer"
    />
  </div>
);

const POISelector = ({ selected, onChange }) => (
  <div className="space-y-2">
    <label className="text-xs text-slate-400">Points of Interest</label>
    <div className="grid grid-cols-4 gap-1.5">
      {POI_CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const isSelected = selected.includes(cat.id);
        return (
          <button
            key={cat.id}
            onClick={() => isSelected ? onChange(selected.filter(id => id !== cat.id)) : onChange([...selected, cat.id])}
            className={`p-2 rounded-lg transition-all duration-300 ${
              isSelected ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-800/30 border-slate-700/30 hover:bg-slate-700/30'
            } border`}
          >
            <Icon className="w-4 h-4 mx-auto" style={{ color: isSelected ? cat.color : '#64748b' }}/>
            <div className={`text-[9px] mt-1 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>{cat.name}</div>
          </button>
        );
      })}
    </div>
  </div>
);

const ResultsPanel = ({ data }) => {
  if (!data) return null;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
          <div className="text-xl font-light text-slate-200">{data.population.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500">Population</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
          <div className="text-xl font-light text-slate-200">{data.blocks}</div>
          <div className="text-[10px] text-slate-500">Blocks</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
          <div className="text-xl font-light text-slate-200">{data.pois.length}</div>
          <div className="text-[10px] text-slate-500">POIs</div>
        </div>
      </div>
      
      <div className="bg-slate-800/30 rounded-lg border border-slate-700/30 overflow-hidden">
        <div className="px-3 py-2 border-b border-slate-700/30">
          <h3 className="text-xs font-medium text-slate-300">Discovered</h3>
        </div>
        {data.pois.map((poi, i) => (
          <div key={i} className="px-3 py-2 flex items-center justify-between hover:bg-slate-700/20 transition-colors border-b border-slate-700/20 last:border-0">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"/>
              <div>
                <div className="text-xs text-slate-300">{poi.name}</div>
                <div className="text-[10px] text-slate-500 capitalize">{poi.type}</div>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">{poi.distance}</div>
          </div>
        ))}
      </div>
      
      <div className="flex gap-2">
        <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800/50 border border-slate-700/30 rounded-lg text-xs text-slate-300 hover:bg-slate-700/50 transition-colors">
          <Download className="w-3 h-3"/>CSV
        </button>
        <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800/50 border border-slate-700/30 rounded-lg text-xs text-slate-300 hover:bg-slate-700/50 transition-colors">
          <Layers className="w-3 h-3"/>GeoJSON
        </button>
      </div>
    </div>
  );
};

export default function SocialMapperUI() {
  const [location, setLocation] = useState('');
  const [travelMode, setTravelMode] = useState('walk');
  const [travelTime, setTravelTime] = useState(15);
  const [selectedPOIs, setSelectedPOIs] = useState(['library']);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const runAnalysis = useCallback(() => {
    if (!location) return;
    setIsAnalyzing(true);
    setResults(null);
    setTimeout(() => {
      setIsAnalyzing(false);
      setResults(DEMO_ISOCHRONE);
    }, 2000);
  }, [location]);
  
  return (
    <div className="h-screen w-full bg-slate-950 text-slate-100 flex overflow-hidden">
      <aside className={`relative flex flex-col bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/50 transition-all duration-500 ${sidebarOpen ? 'w-80' : 'w-0'} overflow-hidden`}>
        <header className="flex-shrink-0 px-4 py-4 border-b border-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <MapPin className="w-4 h-4 text-white"/>
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight">SocialMapper</h1>
              <p className="text-[10px] text-slate-500">Accessibility Analysis</p>
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider text-slate-500">Location</label>
            <LocationSearch value={location} onChange={setLocation} onSubmit={runAnalysis}/>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-wider text-slate-500">Travel Mode</label>
            <TravelModeSelector selected={travelMode} onChange={setTravelMode} />
          </div>
          
          <TimeSlider value={travelTime} onChange={setTravelTime} />
          <POISelector selected={selectedPOIs} onChange={setSelectedPOIs} />
          
          <button
            onClick={runAnalysis}
            disabled={!location || isAnalyzing}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-white shadow-lg shadow-blue-500/20 disabled:shadow-none transition-all duration-300 flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Analyzing...</>
            ) : (
              <><Play className="w-4 h-4"/>Run Analysis</>
            )}
          </button>
          
          <ResultsPanel data={results} />
        </div>
        
        <footer className="flex-shrink-0 px-4 py-3 border-t border-slate-800/50">
          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span>v1.0.0</span>
            <span>MIT License</span>
          </div>
        </footer>
      </aside>
      
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="absolute top-3 left-3 z-50 p-2 bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-lg hover:bg-slate-700/80 transition-colors md:hidden">
        {sidebarOpen ? <X className="w-4 h-4"/> : <Menu className="w-4 h-4"/>}
      </button>
      
      <main className="flex-1 relative">
        <MapVisualization isAnalyzing={isAnalyzing} results={results}/>
        
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          <button className="p-2 bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-lg hover:bg-slate-700/80 transition-colors">
            <Layers className="w-4 h-4 text-slate-400"/>
          </button>
          <button className="p-2 bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-lg hover:bg-slate-700/80 transition-colors">
            <Settings className="w-4 h-4 text-slate-400"/>
          </button>
        </div>
        
        {results && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-full flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-blue-400"/>
              <span className="text-slate-300">{results.name}</span>
            </div>
            <div className="w-px h-3 bg-slate-700"/>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-slate-500"/>
              <span className="text-slate-400">{travelTime}m {travelMode}</span>
            </div>
            <div className="w-px h-3 bg-slate-700"/>
            <div className="flex items-center gap-1.5">
              <Users className="w-3 h-3 text-slate-500"/>
              <span className="text-slate-400">{results.population.toLocaleString()}</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
