import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CaretRight, Lock, Sparkle, Sliders, ArrowCounterClockwise, Check, X } from '@phosphor-icons/react';

const CurationConsolePage = () => {
  const { t } = useTranslation();
  const [toneValue, setToneValue] = useState(65);
  const [lengthValue, setLengthValue] = useState(50);

  const rawContent = [
    { type: 'quote', text: '"High-ranking officials from multiple ECOWAS states convened today in Lagos regarding the rapidly evolving energy sector regulations in the Gulf of Guinea..."' },
    { type: 'text', text: 'Primary focus centered on proposed standardized pricing caps for renewable energy exports, a topic sparking significant debate across the regional bloc.' },
    { type: 'text', text: '"We are facing a critical juncture," stated the Commissioner for Energy, highlighting unprecedented volatility in global markets. Analysts suggest that without immediate intervention, projected costs could rise by 15%.' },
  ];

  const synthesizedContent = [
    { type: 'highlight', text: 'ECOWAS officials met in Lagos to address energy market volatility and export pricing caps. The "Regional Transition Framework" proposes cutting dependency by 40% over five years.' },
    { type: 'text', text: 'The Energy Commissioner warned of 15% cost increases for consumers without intervention. Major economies like Nigeria and Ghana back the framework, though smaller nations seek implementation delays.' },
    { type: 'text', text: 'The consensus remains that rapid action is vital to stabilize household economies across the region.' },
  ];

  const legendItems = [
    { color: 'bg-red-500/50 border-red-500', label: 'OMITTED' },
    { color: 'bg-forest/50', label: 'SYNTHESIZED' },
    { color: 'bg-primary/50 border-primary', label: 'REPHRASED' },
  ];

  return (
    <main className="flex-1 flex flex-col min-h-0 bg-background-dark" data-testid="curation-console-page">
      {/* Breadcrumb Bar */}
      <div className="h-14 narvo-border-b bg-background-dark/20 flex items-center px-8 gap-4 shrink-0">
        <span className="mono-ui text-[11px] text-forest font-bold">DASHBOARD</span>
        <CaretRight className="w-3 h-3 text-forest" />
        <span className="mono-ui text-[11px] text-forest font-bold">WIRE_FEEDS</span>
        <CaretRight className="w-3 h-3 text-forest" />
        <span className="mono-ui text-[11px] text-primary font-bold">REUTERS_V2 // ID:8829</span>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Content Pane */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-8 pb-4 shrink-0">
            <div className="flex justify-between items-start mb-6">
              <h2 className="font-display text-3xl font-bold text-content uppercase tracking-tight max-w-2xl leading-tight">
                Source_Analysis: Geopolitical_Shift_Lagos
              </h2>
              <span className="mono-ui text-[11px] border border-primary px-3 py-1 bg-primary/10 text-primary font-bold">
                HIGH_PRIORITY
              </span>
            </div>
          </div>

          {/* Content Comparison */}
          <div className="flex-1 flex divide-x divide-forest/30 overflow-hidden">
            {/* Raw Feed */}
            <div className="flex-1 flex flex-col min-w-[300px]">
              <div className="px-8 py-3 narvo-border-b bg-forest/5 flex justify-between items-center">
                <span className="mono-ui text-[11px] text-forest font-bold tracking-widest uppercase">RAW_SOURCE // REUTERS</span>
                <Lock className="w-4 h-4 text-forest" />
              </div>
              <div className="p-8 overflow-y-auto custom-scroll space-y-6 text-sm text-forest font-medium leading-relaxed">
                {rawContent.map((item, idx) => (
                  <p 
                    key={idx} 
                    className={item.type === 'quote' 
                      ? 'bg-primary/5 p-4 border-l-2 border-primary/20 text-content italic' 
                      : 'opacity-60 hover:opacity-100 transition-opacity'
                    }
                  >
                    {item.text}
                  </p>
                ))}
              </div>
            </div>

            {/* Synthesized Output */}
            <div className="flex-1 flex flex-col min-w-[300px] bg-background-dark/10">
              <div className="px-8 py-3 narvo-border-b bg-forest/5 flex justify-between items-center">
                <span className="mono-ui text-[11px] text-primary font-bold tracking-widest uppercase">NARVO_SYNTHESIS // V2.4</span>
                <Sparkle className="w-4 h-4 text-primary" />
              </div>
              <div className="p-8 overflow-y-auto custom-scroll space-y-6 text-sm text-content font-medium leading-relaxed">
                {synthesizedContent.map((item, idx) => (
                  <p 
                    key={idx} 
                    className={item.type === 'highlight' 
                      ? 'bg-forest/10 p-4 border-l-2 border-forest text-content' 
                      : ''
                    }
                  >
                    {item.text}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="h-12 narvo-border-t bg-background-dark/40 flex items-center px-8 gap-8 mono-ui text-[11px] text-forest font-bold shrink-0 uppercase">
            <span className="opacity-40 tracking-widest">Signal_Legend:</span>
            {legendItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className={`w-2 h-2 narvo-border ${item.color}`} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Adjustment Panel */}
        <div className="w-80 narvo-border-l bg-background-dark/20 flex flex-col overflow-hidden shrink-0">
          <div className="p-6 narvo-border-b">
            <div className="flex items-center gap-3 mb-2">
              <Sliders className="w-5 h-5 text-primary" />
              <h3 className="mono-ui text-[13px] text-content font-bold tracking-widest">ADJUSTMENT_PANEL</h3>
            </div>
            <p className="mono-ui text-[10px] text-forest">FINE_TUNE_SYNTHESIS_PARAMS</p>
          </div>

          <div className="flex-1 overflow-y-auto custom-scroll p-6 space-y-8">
            {/* Tone Control */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="mono-ui text-[11px] text-forest font-bold">TONE_FORMALITY</span>
                <span className="mono-ui text-[12px] text-primary font-bold">{toneValue}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={toneValue}
                onChange={(e) => setToneValue(parseInt(e.target.value))}
                className="w-full h-1 bg-forest/30 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary"
              />
              <div className="flex justify-between mono-ui text-[10px] text-forest">
                <span>CASUAL</span>
                <span>FORMAL</span>
              </div>
            </div>

            {/* Length Control */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="mono-ui text-[11px] text-forest font-bold">OUTPUT_LENGTH</span>
                <span className="mono-ui text-[12px] text-primary font-bold">{lengthValue}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={lengthValue}
                onChange={(e) => setLengthValue(parseInt(e.target.value))}
                className="w-full h-1 bg-forest/30 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary"
              />
              <div className="flex justify-between mono-ui text-[10px] text-forest">
                <span>CONCISE</span>
                <span>DETAILED</span>
              </div>
            </div>

            {/* Keyword Retention */}
            <div className="space-y-4">
              <span className="mono-ui text-[11px] text-forest font-bold block">KEYWORD_RETENTION</span>
              <div className="flex flex-wrap gap-2">
                {['ECOWAS', 'LAGOS', 'ENERGY', 'PRICING'].map((keyword, idx) => (
                  <span 
                    key={idx} 
                    className="px-3 py-1 narvo-border bg-primary/10 text-primary mono-ui text-[10px] font-bold"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Bias Detection */}
            <div className="narvo-border bg-forest/5 p-4 space-y-3">
              <span className="mono-ui text-[11px] text-forest font-bold block">BIAS_SCAN_RESULT</span>
              <div className="flex items-center gap-3">
                <div className="w-full h-2 bg-forest/20 relative">
                  <div className="absolute inset-0 bg-primary w-[15%]" />
                </div>
                <span className="mono-ui text-[12px] text-primary font-bold">15%</span>
              </div>
              <p className="mono-ui text-[10px] text-forest">LOW_BIAS_DETECTED // SAFE_TO_PUBLISH</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 narvo-border-t space-y-3">
            <button className="w-full py-3 narvo-border mono-ui text-[12px] font-bold text-forest hover:bg-forest hover:text-content transition-all flex items-center justify-center gap-2">
              <ArrowCounterClockwise className="w-4 h-4" />
              REGENERATE
            </button>
            <div className="flex gap-3">
              <button className="flex-1 py-3 narvo-border mono-ui text-[12px] font-bold text-content hover:bg-red-500 hover:border-red-500 transition-all flex items-center justify-center gap-2">
                <X className="w-4 h-4" />
                REJECT
              </button>
              <button className="flex-1 py-3 bg-primary mono-ui text-[12px] font-bold text-background-dark hover:bg-white transition-all flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                APPROVE
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CurationConsolePage;
