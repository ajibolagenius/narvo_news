import React, { useState, useEffect } from 'react';
import { CheckCircle, Warning, Question, XCircle, CircleNotch } from '@phosphor-icons/react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Cache for fact-check results to avoid duplicate API calls
const factCheckCache = new Map();

const TruthTag = ({ storyId, compact = false }) => {
  const [factCheck, setFactCheck] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFactCheck = async () => {
      // Check cache first
      if (factCheckCache.has(storyId)) {
        setFactCheck(factCheckCache.get(storyId));
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/factcheck/${storyId}`);
        const data = await res.json();
        factCheckCache.set(storyId, data);
        setFactCheck(data);
      } catch (err) {
        console.error('Failed to fetch fact-check:', err);
      }
      setLoading(false);
    };

    fetchFactCheck();
  }, [storyId]);

  if (loading) {
    return compact ? (
      <Loader2 className="w-3 h-3 text-forest animate-spin" />
    ) : (
      <div className="flex items-center gap-1 mono-ui text-[8px] text-forest">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span>VERIFYING...</span>
      </div>
    );
  }

  if (!factCheck) return null;

  const statusConfig = {
    VERIFIED: {
      icon: CheckCircle,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/30',
      label: 'VERIFIED',
    },
    UNVERIFIED: {
      icon: HelpCircle,
      color: 'text-forest',
      bgColor: 'bg-forest/10',
      borderColor: 'border-forest/30',
      label: 'UNVERIFIED',
    },
    DISPUTED: {
      icon: AlertTriangle,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
      label: 'DISPUTED',
    },
    FALSE: {
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      label: 'FALSE',
    },
  };

  const config = statusConfig[factCheck.status] || statusConfig.UNVERIFIED;
  const Icon = config.icon;

  if (compact) {
    return (
      <div 
        className={`flex items-center gap-1 px-1.5 py-0.5 border ${config.borderColor} ${config.bgColor} ${config.color}`}
        title={`${factCheck.status}: ${factCheck.confidence}% confidence`}
        data-testid={`truth-tag-${storyId}`}
      >
        <Icon className="w-3 h-3" />
        <span className="mono-ui text-[7px] md:text-[8px] font-bold">{factCheck.confidence}%</span>
      </div>
    );
  }

  return (
    <div 
      className={`flex items-center gap-2 px-2 py-1 border ${config.borderColor} ${config.bgColor} ${config.color}`}
      title={factCheck.explanation}
      data-testid={`truth-tag-${storyId}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="mono-ui text-[8px] md:text-[9px] font-bold">{config.label}</span>
      <span className="mono-ui text-[7px] md:text-[8px] opacity-70">{factCheck.confidence}%</span>
    </div>
  );
};

export default TruthTag;
