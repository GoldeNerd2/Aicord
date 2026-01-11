import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HashtagIcon, MegaphoneIcon, GearIcon, PlusIcon, UserPlusIcon } from '../ui/Icons';

const UserControls = () => {
  const { currentUser, toggleSettings } = useApp();
  return (
    <div className="bg-discord-darker p-2 flex items-center justify-between mt-auto z-10 shrink-0">
      <div className="flex items-center space-x-2 group cursor-pointer hover:bg-white/10 p-1 rounded">
        <div className="relative">
          <img src={currentUser.avatar} alt="Me" className="w-8 h-8 rounded-full" />
          <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-discord-darker rounded-full 
            ${currentUser.status === 'online' ? 'bg-discord-green' : 'bg-discord-yellow'}`} />
        </div>
        <div className="text-sm">
          <div className="font-semibold text-white leading-tight">{currentUser.username}</div>
          <div className="text-xs text-gray-400 leading-tight">#{currentUser.discriminator}</div>
        </div>
      </div>
      <div className="flex items-center">
        <button onClick={() => toggleSettings(true)} className="p-1.5 hover:bg-white/10 rounded"><GearIcon className="w-5 h-5" /></button>
      </div>
    </div>
  );
};

export const NavigationSidebar: React.FC = () => {
  const { activeServerId, servers, users, dms, activeDmId, activeChannelId, setActiveDm, setActiveChannel, currentUser, setModals } = useApp();

  const isHome = activeServerId === 'home';

  // --- Home / DM View ---
  if (isHome) {
    return (
      <div className="w-60 bg-discord-darker flex flex-col h-full shrink-0">
        {/* Search / Top Bar */}
        <div className="h-12 shadow-sm flex items-center px-2 border-b border-discord-darkest shrink-0">
            <button 
                onClick={() => setModals(p => ({...p, createGroupDm: true}))}
                className="w-full text-left text-sm text-gray-400 bg-discord-darkest rounded px-2 py-1.5 hover:text-gray-200 transition-colors truncate"
            >
                Find or start a conversation
            </button>
        </div>

        {/* DM List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {dms.length > 0 && <div className="text-xs font-semibold text-gray-400 px-2 mb-2 hover:text-gray-200 uppercase tracking-wide">Direct Messages</div>}
          
          {dms.map(dm => {
            const isGroup = dm.recipientIds.length > 2;
            const otherUserIds = dm.recipientIds.filter(id => id !== currentUser?.id);
            const primaryUser = users[otherUserIds[0]]; 
            
            const isActive = activeDmId === dm.id;
            
            const name = isGroup 
                ? (dm.name || otherUserIds.map(id => users[id]?.username).join(', '))
                : (primaryUser ? primaryUser.username : 'Unknown User');
            
            let icon = primaryUser?.avatar;
            if (isGroup) icon = dm.icon || "https://picsum.photos/seed/group/40";
            if (!icon) icon = "https://cdn.discordapp.com/embed/avatars/0.png";

            return (
              <button
                key={dm.id}
                onClick={() => setActiveDm(dm.id)}
                className={`w-full flex items-center px-2 py-2 rounded group transition-colors ${isActive ? 'bg-discord-light text-white' : 'hover:bg-discord-light/50 text-gray-400 hover:text-gray-200'}`}
              >
                <div className="relative mr-3">
                  <img src={icon} className="w-8 h-8 rounded-full bg-gray-600" />
                  {!isGroup && primaryUser?.isBot && <div className="absolute -bottom-1 -right-1 bg-discord-blurple text-[8px] px-1 rounded text-white">BOT</div>}
                </div>
                <div className="flex-1 text-left font-medium truncate">
                  {name}
                  {isGroup && <div className="text-xs text-gray-400">{otherUserIds.length + 1} Members</div>}
                </div>
                {isActive && <button className="text-gray-400 hover:text-white" onClick={(e) => { e.stopPropagation(); /* Remove DM logic */ }}>×</button>}
              </button>
            );
          })}
        </div>
        <UserControls />
      </div>
    );
  }

  // --- Server View ---
  const server = servers.find(s => s.id === activeServerId);
  if (!server) return null;

  const isOwner = server.ownerId === currentUser?.id;

  return (
    <div className="w-60 bg-discord-darker flex flex-col h-full shrink-0">
      <div 
        className="h-12 shadow-sm flex items-center justify-between px-4 border-b border-discord-darkest transition-colors relative"
        style={{backgroundImage: server.bannerUrl ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.8)), url(${server.bannerUrl})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center'}}
      >
        <h1 className="font-bold text-white truncate drop-shadow-md cursor-pointer flex-1" onClick={() => isOwner && setModals(p => ({...p, serverSettings: server.id}))}>{server.name}</h1>
        {isOwner && (
            <div className="flex items-center space-x-2">
                 <button onClick={() => setModals(p => ({...p, invitePeople: server.id}))} title="Invite People"><UserPlusIcon className="w-4 h-4 text-gray-200 hover:text-white" /></button>
                 <button onClick={() => setModals(p => ({...p, serverSettings: server.id}))} title="Settings"><GearIcon className="w-4 h-4 text-gray-200 hover:text-white" /></button>
            </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-4 custom-scrollbar">
        {server.categories.map(category => {
          const categoryChannels = server.channels.filter(c => c.categoryId === category.id);
          return (
            <div key={category.id}>
              <div className="flex items-center justify-between px-1 mb-1 text-gray-400 hover:text-gray-200 cursor-pointer group">
                <span className="text-xs font-bold uppercase tracking-wide flex items-center">
                    <span className="mr-0.5 text-[10px]">v</span> {category.name}
                </span>
                {isOwner && (
                    <button onClick={(e) => { e.stopPropagation(); setModals(p => ({...p, createChannel: { serverId: server.id, categoryId: category.id }})) }}>
                        <PlusIcon className="w-3 h-3 cursor-pointer opacity-0 group-hover:opacity-100" />
                    </button>
                )}
              </div>
              <div className="space-y-[1px]">
                {categoryChannels.map(channel => {
                  const isActive = activeChannelId === channel.id;
                  return (
                    <button
                      key={channel.id}
                      onClick={() => setActiveChannel(channel.id)}
                      className={`w-full flex items-center px-2 py-[6px] rounded group transition-colors ${isActive ? 'bg-discord-light text-white' : 'hover:bg-discord-light/50 text-gray-400 hover:text-gray-200'}`}
                    >
                      {channel.type === 'announcement' ? (
                         <MegaphoneIcon className="w-5 h-5 mr-1.5 text-gray-400" />
                      ) : (
                         <HashtagIcon className="w-5 h-5 mr-1.5 text-gray-400" />
                      )}
                      <span className={`truncate font-medium ${isActive ? '' : ''}`}>{channel.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        {isOwner && (
            <button 
                onClick={() => setModals(p => ({...p, createCategory: { serverId: server.id }}))}
                className="w-full text-left px-1 mt-2 text-xs font-bold text-discord-blurple hover:underline uppercase"
            >
                + Create Category
            </button>
        )}
      </div>
      <UserControls />
    </div>
  );
};