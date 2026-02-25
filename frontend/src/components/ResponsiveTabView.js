import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ResponsiveTabView - Shows columns on desktop, tabs on mobile
 * @param {Array} tabs - Array of { id, label, icon, content }
 * @param {string} className - Additional container classes
 */
export const ResponsiveTabView = ({ tabs, className = '' }) => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || '');

  return (
    <div className={className}>
      {/* Mobile: Tab Navigation */}
      <div className="lg:hidden">
        <div className="flex border-b border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[100px] px-4 py-3 font-mono text-[12px] uppercase tracking-wider transition-all whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'text-[rgb(var(--color-primary))] border-b-2 border-[rgb(var(--color-primary))] bg-[rgb(var(--color-bg))]' 
                  : 'text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]'
                }`}
              data-testid={`tab-${tab.id}`}
            >
              {tab.icon && <span className="mr-2">{tab.icon}</span>}
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Mobile: Tab Content */}
        <AnimatePresence mode="wait">
          {tabs.map((tab) => (
            activeTab === tab.id && (
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-4"
              >
                {tab.content}
              </motion.div>
            )
          ))}
        </AnimatePresence>
      </div>

      {/* Desktop: Columns */}
      <div className="hidden lg:grid lg:grid-cols-3 lg:gap-4">
        {tabs.map((tab) => (
          <div key={tab.id} className="border border-[rgb(var(--color-border))]">
            <div className="px-4 py-3 border-b border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]">
              <h3 className="font-mono text-[12px] uppercase tracking-wider text-[rgb(var(--color-text-secondary))]">
                {tab.icon && <span className="mr-2">{tab.icon}</span>}
                {tab.label}
              </h3>
            </div>
            <div className="p-4">
              {tab.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Simple Tab component for general use
 */
export const Tabs = ({ tabs, defaultTab, className = '' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '');

  return (
    <div className={className}>
      <div className="flex border-b border-[rgb(var(--color-border))] overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 font-mono text-[12px] uppercase tracking-wider transition-all whitespace-nowrap
              ${activeTab === tab.id 
                ? 'text-[rgb(var(--color-primary))] border-b-2 border-[rgb(var(--color-primary))]' 
                : 'text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]'
              }`}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>
      
      <AnimatePresence mode="wait">
        {tabs.map((tab) => (
          activeTab === tab.id && (
            <motion.div
              key={tab.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {tab.content}
            </motion.div>
          )
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ResponsiveTabView;
