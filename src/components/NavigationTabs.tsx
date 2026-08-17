import React from 'react';
import { 
  LayoutDashboard, 
  Terminal, 
  Settings, 
  Map, 
  Users, 
  Layers
} from 'lucide-react';

export type TabType = 'overview' | 'console' | 'config' | 'worlds' | 'players' | 'architecture';

interface NavigationTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  playerCount?: number;
  worldName?: string;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onTabChange,
  playerCount = 0,
}) => {
  const tabs = [
    {
      id: 'overview' as TabType,
      label: 'Panel de Control',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'console' as TabType,
      label: 'Consola en Vivo',
      icon: Terminal,
      badge: 'WS',
    },
    {
      id: 'config' as TabType,
      label: 'Configuración',
      icon: Settings,
      badge: null,
    },
    {
      id: 'worlds' as TabType,
      label: 'Mundos y Backups',
      icon: Map,
      badge: null,
    },
    {
      id: 'players' as TabType,
      label: 'Jugadores y Jefes',
      icon: Users,
      badge: playerCount > 0 ? `${playerCount}` : null,
    },
    {
      id: 'architecture' as TabType,
      label: 'Arquitectura Multijuego',
      icon: Layers,
      badge: 'SDK',
    },
  ];

  return (
    <div className="border-b border-white/5 bg-[#090a0c]/80 backdrop-blur-sm sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 scrollbar-none" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
