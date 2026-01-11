import React from 'react';
import { useApp } from '../../context/AppContext';
import { DiscordIcon, PlusIcon } from '../ui/Icons';

const CompassIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
  </svg>
);

const ServerIcon: React.FC<{ 
  id: string; 
  name: string; 
  icon?: string; 
  isActive: boolean; 
  hasNotification?: boolean;
  onClick: () => void 
}> = ({ name, icon, isActive, onClick, hasNotification }) => {
  return (
    <div className="relative group w-[72px] flex justify-center py-1">
      {/* Active Indicator */}
      <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-white rounded-r-lg transition-all duration-200 
          ${isActive ? 'h-10' : 'h-2 group-hover:h-5'} 
          ${isActive || hasNotification ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} 
      />
      
      <button 
        onClick={onClick}
        className={`w-12 h-12 rounded-[24px] group-hover:rounded-[16px] transition-all duration-200 flex items-center justify-center overflow-hidden
        ${isActive ? 'bg-discord-blurple rounded-[16px]' : 'bg-discord-dark dark:bg-discord-dark bg-gray-700 group-hover:bg-discord-blurple'}
        `}
      >
        {icon ? (
          <img src={icon} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-sm font-medium text-white">{name.substring(0, 2).toUpperCase()}</span>
        )}
      </button>
    </div>
  );
};

export const ServerSidebar: React.FC = () => {
  const { servers, activeServerId, setActiveServer, setModals, currentUser } = useApp();

  // Only show servers where I am a member
  const myServers = servers.filter(s => currentUser && s.members.includes(currentUser.id));

  return (
    <nav className="w-[72px] bg-discord-darkest flex flex-col items-center py-3 space-y-2 h-full overflow-y-auto no-scrollbar shrink-0">
      <ServerIcon 
        id="home"
        name="Direct Messages"
        icon="https://assets-global.website-files.com/6257adef93867e56f84d3092/636e0a6ca814282eca7172c6_icon_clyde_white_RGB.png" 
        isActive={activeServerId === 'home'} 
        onClick={() => setActiveServer('home')}
      />
      
      <div className="w-8 h-[2px] bg-discord-darker rounded-lg mx-auto" />

      {myServers.map(server => (
        <ServerIcon 
          key={server.id}
          id={server.id}
          name={server.name}
          icon={server.icon || undefined}
          isActive={activeServerId === server.id}
          onClick={() => setActiveServer(server.id)}
        />
      ))}

      <button 
        onClick={() => setModals(prev => ({ ...prev, createServer: true }))}
        className="w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-discord-dark bg-opacity-50 hover:bg-discord-green text-discord-green hover:text-white transition-all duration-200 flex items-center justify-center group"
        title="Add a Server"
      >
        <PlusIcon className="w-6 h-6" />
      </button>

      <button 
        onClick={() => setActiveServer('discovery')}
        className={`w-12 h-12 rounded-[24px] hover:rounded-[16px] transition-all duration-200 flex items-center justify-center group mt-2
         ${activeServerId === 'discovery' ? 'bg-discord-green text-white' : 'bg-discord-dark bg-opacity-50 text-discord-green hover:bg-discord-green hover:text-white'}
        `}
        title="Explore Public Servers"
      >
        <CompassIcon className="w-6 h-6" />
      </button>
    </nav>
  );
};