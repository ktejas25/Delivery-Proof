import React from 'react';
import { motion } from 'framer-motion';
import { IconType } from 'react-icons';

interface Tab {
  id: string;
  label: string;
  icon: IconType;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="flex p-1 bg-gray-100/50 backdrop-blur-sm rounded-2xl w-fit border border-gray-200/50">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              relative flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300
              ${isActive ? 'text-white' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'}
            `}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-indigo-600 rounded-xl shadow-md shadow-indigo-200"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">
              <Icon size={16} />
            </span>
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
