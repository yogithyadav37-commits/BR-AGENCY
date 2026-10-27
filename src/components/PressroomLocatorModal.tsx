import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Search, 
  ExternalLink, 
  Check, 
  Sparkles, 
  Building2, 
  Navigation, 
  Loader2,
  AlertCircle,
  Truck,
  ArrowRight
} from 'lucide-react';
import { DeliveryAddress } from '../types/ink';

interface PressroomLocatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFacility?: (facility: {
    name: string;
    address: string;
    city: string;
    postalCode?: string;
  }) => void;
}

export const PressroomLocatorModal: React.FC<PressroomLocatorModalProps> = ({
  isOpen,
  onClose,
  onSelectFacility
}) => {
  const [city, setCity] = useState<string>('Delhi NCR, India');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resultsText, setResultsText] = useState<string | null>(null);
  const [groundingMetadata, setGroundingMetadata] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFacilityName, setSelectedFacilityName] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (customQuery?: string) => {
    setIsLoading(true);
    setError(null);
    setResultsText(null);
    setGroundingMetadata(null);

    const queryToUse = customQuery || searchQuery || 
      `Find major commercial printing presses, carton packaging companies, and industrial print docks in ${city}. Provide verified company names, street addresses, and locations from Google Maps.`;

    try {
      const response = await fetch('/api/maps-grounding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: queryToUse,
          city
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to query Google Maps Grounding.');
      }

      setResultsText(data.text);
      setGroundingMetadata(data.groundingMetadata);
    } catch (err: any) {
      console.error('Maps grounding error:', err);
      setError(err?.message || 'Failed to search Google Maps data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const QUICK_CITIES = [
    'Naraina Industrial Area, New Delhi',
    'Okhla Industrial Estate, New Delhi',
    'Kundli & Rai Industrial Area, Haryana',
    'Navi Mumbai & Thane, Maharashtra',
    'Bhiwandi Packaging Hub, Maharashtra',
    'Peenya Industrial Area, Bengaluru',
    'Sivakasi Print Hub, Tamil Nadu'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Google Maps Pressroom &amp; Dock Locator</h3>
                <span className="text-[10px] font-mono font-bold bg-cyan-900/60 text-cyan-300 px-2 py-0.5 rounded border border-cyan-700/60">
                  Maps Grounding (Gemini 3.8 Flash)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Live Google Maps search for verified commercial printing presses, packaging docks, and delivery hubs
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & City Selector */}
        <div className="p-5 bg-slate-950/40 border-b border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search printing company, industrial cluster, or delivery bay..."
                className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-medium"
              />
            </div>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleSearch()}
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching Maps...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                  <span>Ground with Maps</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Hub Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px]">
            <span className="text-slate-500 font-medium whitespace-nowrap">Popular Hubs:</span>
            {QUICK_CITIES.map((c, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setCity(c);
                  handleSearch(`Locate prominent printing presses and carton packaging plants in ${c}`);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80 whitespace-nowrap transition-colors"
              >
                {c.split(',')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Results Area */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3.5 bg-rose-950/50 border border-rose-800 text-rose-200 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!resultsText && !isLoading && (
            <div className="text-center py-10 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Navigation className="w-6 h-6 text-cyan-400" />
              </div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Search Google Maps data for verified commercial offset press facilities, folding boxboard carton plants, or freight transfer hubs in your region.
              </p>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-12 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
              <p className="text-xs text-slate-400">
                Querying Google Maps live locations &amp; place details via Gemini 3.8 Flash...
              </p>
            </div>
          )}

          {resultsText && (
            <div className="space-y-4">
              {/* Grounding Source Attribution Banner */}
              <div className="p-3 bg-cyan-950/30 border border-cyan-800/60 rounded-xl text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-cyan-300">
                  <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="font-semibold">
                    Live Google Maps Grounding Active
                  </span>
                </div>
                {groundingMetadata?.webSearchQueries && (
                  <span className="text-[10px] font-mono text-slate-400">
                    Queries: {groundingMetadata.webSearchQueries.join(' · ')}
                  </span>
                )}
              </div>

              {/* Formatted Text Content from Maps Grounding */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                {resultsText}
              </div>

              {/* Grounding Chunks & Direct Links if provided */}
              {groundingMetadata?.groundingChunks && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Verified Google Maps Sources &amp; Place References:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {groundingMetadata.groundingChunks.map((chunk: any, idx: number) => {
                      const web = chunk.web;
                      if (!web) return null;
                      return (
                        <a
                          key={idx}
                          href={web.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500 text-xs text-slate-300 flex items-center justify-between gap-2 transition-colors group"
                        >
                          <span className="truncate group-hover:text-cyan-400 font-medium">
                            {web.title || web.uri}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Model: gemini-3.8-flash · tool: googleMaps
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
