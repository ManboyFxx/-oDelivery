
import React from 'react';
import { AppTab } from '../types';

interface SidebarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    {
      id: AppTab.ORDERS,
      label: 'Pedidos',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      id: AppTab.HISTORY,
      label: 'Histórico',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: AppTab.SETTINGS,
      label: 'Configurações',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ];

  return (
    <aside className="fixed bottom-0 left-0 w-full h-16 md:h-screen md:w-72 md:relative z-50 bg-[#0d1117] border-t md:border-t-0 md:border-r border-[#1e293b] flex md:flex-col transition-all duration-300 font-sans">
      <div className="hidden md:flex p-6 items-center justify-center gap-3">
        <img
          src="/logo.png"
          alt="ÓoPrint"
          className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(255,61,3,0.3)] hover:scale-105 transition-transform duration-300"
        />
        <div className="overflow-hidden">
          <h1 className="text-xl font-extrabold tracking-tight text-white uppercase italic truncate">ÓoPrint</h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest truncate">Sistema de Impressão v2.4</p>
        </div>
      </div>

      <nav className="flex-1 px-4 flex md:flex-col items-center md:items-stretch justify-around md:justify-start md:mt-6 gap-1 overflow-x-auto md:overflow-x-visible no-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex-1 md:flex-none flex flex-col md:flex-row items-center gap-2 md:gap-3 px-4 py-2.5 md:px-5 md:py-3.5 rounded-xl transition-all duration-200 ${activeTab === item.id
              ? 'text-white shadow-md'
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            style={activeTab === item.id ? { backgroundColor: '#ff3d03' } : {}}
          >
            <span className="shrink-0">{item.icon}</span>
            <span className="text-[10px] md:text-base font-bold tracking-tight">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="hidden md:block p-6 border-t border-[#1e293b]">
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/5 group transition-all">
          <div className="w-10 h-10 rounded-lg bg-[#ff3d03]/10 flex items-center justify-center text-[10px] font-black shrink-0 border border-[#ff3d03]/10" style={{ color: '#ff3d03' }}>PDV</div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold truncate text-gray-200">ÓoPrint Sistema</p>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_6px_rgba(255,61,3,0.5)]" style={{ backgroundColor: '#ff3d03' }} />
              <p className="text-[10px] font-bold uppercase tracking-widest truncate" style={{ color: '#ff3d03' }}>v2.4 Online</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
