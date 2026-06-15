// Componente de navegación con tabs
interface NavTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const NavTabs = ({ activeTab, onTabChange }: NavTabsProps) => {
  const tabs = [
    { id: 'matches', label: '⚽ Partidos', icon: '🏟️' },
    { id: 'leaderboard', label: '🏆 Tabla', icon: '📊' },
    { id: 'config', label: '⚙️ Config', icon: '🔧' },
  ];

  return (
    <div className="bg-white shadow-md sticky top-[72px] z-40">
      <div className="container mx-auto px-4">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-bold transition-all border-b-4 ${
                activeTab === tab.id
                  ? 'border-celeste-afa text-celeste-afa bg-celeste-light/20'
                  : 'border-transparent text-gray-500 hover:text-celeste-afa hover:bg-gray-50'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

