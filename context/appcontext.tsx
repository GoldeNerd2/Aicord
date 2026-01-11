import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppState, User, Server, DMChannel, Message, Channel, Emoji, ChannelCategory, Game } from '../types';
import { INITIAL_DMS, INITIAL_MESSAGES, INITIAL_USERS, CLYDE_BOT_ID, SEED_SERVERS, GEMINI_BOT, INITIAL_GAMES, DATABASE_CONNECTION_URL } from '../constants';
import { sendMessageToGemini } from '../services/geminiService';

interface AppContextType extends AppState {
  setActiveServer: (id: string | 'home') => void;
  setActiveChannel: (id: string) => void;
  setActiveDm: (id: string) => void;
  sendMessage: (channelId: string, content: string, attachments?: any[]) => void;
  createDm: (targetUserId: string) => void;
  createGroupDm: (userIds: string[]) => void;
  findUserByTag: (tag: string) => User | undefined;
  updateUser: (updates: Partial<User>) => void;
  toggleSettings: (isOpen: boolean) => void;
  createServer: (name: string, isPublic?: boolean, icon?: string) => void;
  updateServer: (serverId: string, updates: Partial<Server>) => void;
  createChannel: (serverId: string, categoryId: string, name: string, type: 'text' | 'announcement') => void;
  createCategory: (serverId: string, name: string) => void;
  addEmojiToServer: (serverId: string, name: string, url: string) => void;
  addGame: (game: Game) => void;
  login: (email: string, pass: string, remember: boolean) => boolean;
  signup: (email: string, username: string, pass: string, remember: boolean) => void;
  logout: () => void;
  joinServer: (server: Server) => void;
  addBot: (bot: User) => void;
  setModals: React.Dispatch<React.SetStateAction<AppState['modals']>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Simulating Database Read
const loadState = (key: string, fallback: any) => {
    try {
        console.log(`[DB Read] Reading from ${DATABASE_CONNECTION_URL} (mapped to ${key})`);
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch (e) {
        console.warn("Failed to load from local storage", e);
        return fallback;
    }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<Record<string, User>>(() => loadState('aicord_users', INITIAL_USERS));
  const [servers, setServers] = useState<Server[]>(() => {
      const stored = loadState('aicord_servers', null);
      return stored !== null ? stored : SEED_SERVERS;
  });
  const [dms, setDms] = useState<DMChannel[]>(() => loadState('aicord_dms', INITIAL_DMS));
  const [messages, setMessages] = useState<Record<string, Message[]>>(() => loadState('aicord_messages', INITIAL_MESSAGES));
  const [games, setGames] = useState<Game[]>(() => loadState('aicord_games', INITIAL_GAMES));
  
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
      const stored = localStorage.getItem('aicord_current_user');
      return stored ? JSON.parse(stored) : null;
  });

  const [activeServerId, setActiveServerId] = useState<string | 'home' | 'discovery'>('home');
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [activeDmId, setActiveDmId] = useState<string | null>(null);
  const [modals, setModals] = useState<AppState['modals']>({
    settings: false,
    createServer: false,
    createGroupDm: false,
    serverSettings: null,
    gameCenter: false,
    addBot: false,
    createChannel: null,
    createCategory: null,
    invitePeople: null,
    addGame: false,
    userProfile: null
  });

  const currentUser = currentUserId ? users[currentUserId] : null;

  // Simulating Database Write
  useEffect(() => localStorage.setItem('aicord_users', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('aicord_servers', JSON.stringify(servers)), [servers]);
  useEffect(() => localStorage.setItem('aicord_dms', JSON.stringify(dms)), [dms]);
  useEffect(() => localStorage.setItem('aicord_messages', JSON.stringify(messages)), [messages]);
  useEffect(() => localStorage.setItem('aicord_games', JSON.stringify(games)), [games]);
  useEffect(() => {
      if (currentUserId) localStorage.setItem('aicord_current_user', JSON.stringify(currentUserId));
      else localStorage.removeItem('aicord_current_user');
  }, [currentUserId]);

  useEffect(() => {
    if (currentUserId && !users[CLYDE_BOT_ID]) {
        setUsers(prev => ({...prev, [CLYDE_BOT_ID]: GEMINI_BOT}));
    }
  }, [currentUserId, users]);

  const toggleSettings = (isOpen: boolean) => {
    setModals(prev => ({ ...prev, settings: isOpen }));
  };

  const createServer = (name: string, isPublic: boolean = false, icon?: string) => {
    if (!currentUserId) return;
    const newServerId = `server-${Date.now()}`;
    const newChanId = `chan-${Date.now()}`;
    const newCatId = `cat-${Date.now()}`;
    const newServer: Server = {
      id: newServerId,
      name,
      icon,
      ownerId: currentUserId,
      isPublic: isPublic,
      members: [currentUserId],
      categories: [{ id: newCatId, serverId: newServerId, name: 'General' }],
      channels: [
        { id: newChanId, serverId: newServerId, name: 'general', type: 'text', categoryId: newCatId }
      ],
      roles: [],
      memberRoles: {},
      emojis: [],
      inviteCode: Math.random().toString(36).substring(2, 10).toUpperCase()
    };
    setServers(prev => [...prev, newServer]);
    setActiveServerId(newServerId);
    setActiveChannelId(newChanId);
    setModals(prev => ({ ...prev, createServer: false }));
  };

  const updateServer = (serverId: string, updates: Partial<Server>) => {
      setServers(prev => prev.map(s => s.id === serverId ? { ...s, ...updates } : s));
  };

  const createChannel = (serverId: string, categoryId: string, name: string, type: 'text' | 'announcement') => {
      const newChan: Channel = {
          id: `chan-${Date.now()}`,
          serverId,
          categoryId,
          name: name.toLowerCase().replace(/\s+/g, '-'),
          type
      };
      setServers(prev => prev.map(s => 
        s.id === serverId ? { ...s, channels: [...s.channels, newChan] } : s
      ));
      setModals(prev => ({ ...prev, createChannel: null }));
  };

  const createCategory = (serverId: string, name: string) => {
      const newCat: ChannelCategory = {
          id: `cat-${Date.now()}`,
          serverId,
          name
      };
      setServers(prev => prev.map(s => 
          s.id === serverId ? { ...s, categories: [...s.categories, newCat] } : s
      ));
      setModals(prev => ({ ...prev, createCategory: null }));
  };

  const addEmojiToServer = (serverId: string, name: string, url: string) => {
      if (!currentUserId) return;
      const newEmoji: Emoji = {
          id: `emoji-${Date.now()}`,
          name,
          url,
          creatorId: currentUserId
      };
      setServers(prev => prev.map(s => 
        s.id === serverId ? { ...s, emojis: [...s.emojis, newEmoji] } : s
      ));
  };

  const addGame = (game: Game) => {
      setGames(prev => [...prev, game]);
      setModals(prev => ({ ...prev, addGame: false }));
  };

  const updateUser = (updates: Partial<User>) => {
    if (currentUserId) {
        setUsers(prev => ({
        ...prev,
        [currentUserId]: { ...prev[currentUserId], ...updates }
        }));
    }
  };

  const sendMessage = useCallback(async (channelId: string, content: string, attachments?: any[]) => {
    if (!currentUserId) return;
    
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      channelId,
      authorId: currentUserId,
      content,
      timestamp: Date.now(),
      attachments,
      mentions: []
    };

    const mentionMatch = content.match(/@(\w+)/);
    if (mentionMatch) {
       const mentionedUser = (Object.values(users) as User[]).find(u => u.username === mentionMatch[1]);
       if (mentionedUser) newMessage.mentions?.push(mentionedUser.id);
    }

    setMessages(prev => ({
      ...prev,
      [channelId]: [...(prev[channelId] || []), newMessage]
    }));

    let isAiChannel = false;
    const dm = dms.find(d => d.id === channelId);
    if (dm && dm.recipientIds.includes(CLYDE_BOT_ID)) isAiChannel = true;
    
    const server = servers.find(s => s.channels.some(c => c.id === channelId));
    const channel = server?.channels.find(c => c.id === channelId);
    if (channel?.name === 'ai-chat' || content.includes(`@${users[CLYDE_BOT_ID].username}`)) isAiChannel = true;

    if (isAiChannel) {
        const historyMsgs = messages[channelId] || [];
        const history = historyMsgs.map(m => ({
            role: m.authorId === CLYDE_BOT_ID ? 'model' as const : 'user' as const,
            text: m.content
        }));

        try {
            const aiResponseText = await sendMessageToGemini(content, history);
            const botMessage: Message = {
                id: `msg-ai-${Date.now()}`,
                channelId,
                authorId: CLYDE_BOT_ID,
                content: aiResponseText,
                timestamp: Date.now()
            };
            setMessages(prev => ({
                ...prev,
                [channelId]: [...(prev[channelId] || []), botMessage]
            }));
        } catch (e) {
            console.error(e);
        }
    }

  }, [dms, servers, users, messages, currentUserId]);

  const createDm = (targetUserId: string) => {
    if (!currentUserId) return;
    const existing = dms.find(d => 
        d.recipientIds.length === 2 && 
        d.recipientIds.includes(targetUserId) && 
        d.recipientIds.includes(currentUserId)
    );
    
    if (existing) {
      setActiveDmId(existing.id);
      setActiveServerId('home');
      return;
    }

    const newId = `dm-${Date.now()}`;
    const newDm: DMChannel = {
      id: newId,
      recipientIds: [currentUserId, targetUserId]
    };
    setDms(prev => [newDm, ...prev]);
    setActiveDmId(newId);
    setActiveServerId('home');
  };

  const createGroupDm = (userIds: string[]) => {
      if (!currentUserId) return;
      const allMembers = [...new Set([currentUserId, ...userIds])];
      const newId = `dm-group-${Date.now()}`;
      const newDm: DMChannel = {
          id: newId,
          recipientIds: allMembers,
          ownerId: currentUserId
      };
      setDms(prev => [newDm, ...prev]);
      setActiveDmId(newId);
      setActiveServerId('home');
      setModals(prev => ({ ...prev, createGroupDm: false }));
  }

  const findUserByTag = (tag: string): User | undefined => {
      const [uname, disc] = tag.split('#');
      if (!uname || !disc) return undefined;
      return (Object.values(users) as User[]).find(u => 
          u.username.toLowerCase() === uname.toLowerCase() && 
          u.discriminator === disc
      );
  };

  const setActiveServer = (id: string | 'home' | 'discovery') => {
    setActiveServerId(id);
    if (id !== 'home' && id !== 'discovery') {
      const server = servers.find(s => s.id === id);
      if (server && server.channels.length > 0) {
        setActiveChannelId(server.channels[0].id);
      }
    }
  };

  const login = (email: string, pass: string, remember: boolean) => {
    const user = (Object.values(users) as User[]).find(u => 
        (u.email === email || (`${u.username}#${u.discriminator}` === email)) && 
        u.password === pass
    );
    if (user) {
        setCurrentUserId(user.id);
        return true;
    }
    return false;
  };

  const signup = (email: string, username: string, pass: string, remember: boolean) => {
      const newId = `user-${Date.now()}`;
      const disc = Math.floor(1000 + Math.random() * 9000).toString();
      const newUser: User = {
          id: newId,
          username,
          discriminator: disc,
          email,
          password: pass,
          avatar: `https://ui-avatars.com/api/?name=${username}&background=random`,
          status: 'online',
          bannerColor: '#5865F2'
      };
      
      const newUsers = { ...users, [newId]: newUser };
      if (!newUsers[CLYDE_BOT_ID]) newUsers[CLYDE_BOT_ID] = GEMINI_BOT;

      setUsers(newUsers);
      setCurrentUserId(newId);
      
      const dmId = `dm-initial-${Date.now()}`;
      setDms(prev => [...prev, { id: dmId, recipientIds: [newId, CLYDE_BOT_ID] }]);
      setMessages(prev => ({...prev, [dmId]: [{
          id: `msg-welcome`,
          channelId: dmId,
          authorId: CLYDE_BOT_ID,
          content: "Hello! I am Gemini. I'm here to help you. You can chat with me here or add me to your servers!",
          timestamp: Date.now()
      }]}));
  };

  const logout = () => {
      setCurrentUserId(null);
      setActiveServerId('home');
  };

  const joinServer = (server: Server) => {
      if (!currentUserId) return;
      setServers(prev => prev.map(s => {
          if (s.id === server.id) {
              if (!s.members.includes(currentUserId)) {
                  return { ...s, members: [...s.members, currentUserId] };
              }
          }
          return s;
      }));
      setActiveServerId(server.id);
  };

  const addBot = (bot: User) => {
     if (!users[bot.id]) {
        setUsers(prev => ({ ...prev, [bot.id]: bot }));
     }
     createDm(bot.id);
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      users,
      servers,
      dms,
      messages,
      games,
      activeServerId,
      activeChannelId,
      activeDmId,
      modals,
      setActiveServer,
      setActiveChannel: setActiveChannelId,
      setActiveDm: setActiveDmId,
      sendMessage,
      createDm,
      createGroupDm,
      findUserByTag,
      updateUser,
      toggleSettings,
      createServer,
      updateServer,
      createChannel,
      createCategory,
      addEmojiToServer,
      addGame,
      login,
      signup,
      logout,
      joinServer,
      addBot,
      setModals
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};