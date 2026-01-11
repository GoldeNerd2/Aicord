import React from 'react';
import { useApp } from '../../context/AppContext';

export const MemberList: React.FC = () => {
  const { activeServerId, servers, users } = useApp();

  if (activeServerId === 'home') return null;

  const server = servers.find(s => s.id === activeServerId);
  if (!server) return null;

  const onlineMembers = server.members.map(id => users[id]).filter(u => u.status !== 'invisible');
  
  return (
    <div className="w-60 bg-discord-darker hidden lg:flex flex-col h-full overflow-y-auto p-3">
       <div className="mb-2">
           <h3 className="uppercase text-xs font-bold text-gray-400 mb-2 px-2">Online — {onlineMembers.length}</h3>
           {onlineMembers.map(user => (
               <div key={user.id} className="flex items-center px-2 py-1.5 rounded hover:bg-discord-light/40 cursor-pointer opacity-90 hover:opacity-100 group">
                   <div className="relative mr-3">
                       <img src={user.avatar} className="w-8 h-8 rounded-full" />
                       <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-discord-darker rounded-full 
                            ${user.status === 'online' ? 'bg-discord-green' : 'bg-discord-yellow'}`} />
                   </div>
                   <div>
                       <div className="text-white font-medium flex items-center">
                           <span className={user.id === server.ownerId ? 'text-yellow-400' : ''}>{user.username}</span>
                           {user.isBot && <span className="bg-discord-blurple text-[8px] px-1.5 rounded text-white ml-1.5 py-0.5">BOT</span>}
                       </div>
                       {user.customStatus && <div className="text-xs text-gray-400 truncate w-32">{user.customStatus}</div>}
                   </div>
               </div>
           ))}
       </div>
    </div>
  );
};