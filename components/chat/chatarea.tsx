import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HashtagIcon, PlusIcon, MegaphoneIcon } from '../ui/Icons';
import { Message, Attachment, Emoji } from '../../types';

// Simple Markdown & Emoji Parser
const formatText = (text: string, emojis: Emoji[]) => {
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/~~(.*?)~~/g, '<del>$1</del>');
    
    const sortedEmojis = [...emojis].sort((a,b) => b.name.length - a.name.length);
    sortedEmojis.forEach(emoji => {
        const regex = new RegExp(`:${emoji.name}:`, 'g');
        formatted = formatted.replace(regex, `<img src="${emoji.url}" class="inline-block w-5 h-5 align-text-bottom" alt=":${emoji.name}:" title=":${emoji.name}:" />`);
    });

    return formatted;
};

const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const AttachmentView: React.FC<{ attachment: Attachment }> = ({ attachment }) => {
    if (attachment.type === 'video') {
        return (
            <div className="mt-2 max-w-sm rounded-lg overflow-hidden border border-gray-700 bg-black">
                <video src={attachment.url} controls className="w-full h-auto max-h-[300px]" />
            </div>
        );
    }
    if (attachment.type === 'image') {
        return (
            <div className="mt-2 max-w-sm rounded-lg overflow-hidden border border-gray-700">
                <img src={attachment.url} alt="attachment" className="w-full h-auto" />
            </div>
        );
    }
    // Generic file fallback
    return <div className="mt-2 text-discord-blurple underline"><a href={attachment.url} download target="_blank">Download Attachment</a></div>;
};

const MessageItem: React.FC<{ message: Message; user: any; showHeader: boolean; currentUser: any, availableEmojis: Emoji[]; onUserClick: (id: string) => void }> = ({ message, user, showHeader, currentUser, availableEmojis, onUserClick }) => {
  const date = new Date(message.timestamp);
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = date.toLocaleDateString();

  const isMentioned = message.mentions?.includes(currentUser.id);
  const mentionClass = isMentioned ? 'bg-discord-yellow/10 border-l-2 border-discord-yellow pl-3 -ml-4 pr-4' : '';

  const renderContent = () => {
     let html = formatText(message.content, availableEmojis);
     html = html.replace(/<@(.*?)>/g, '<span class="bg-discord-blurple/30 text-discord-blurple px-1 rounded cursor-pointer hover:bg-discord-blurple/50">@User</span>');
     return <div dangerouslySetInnerHTML={{ __html: html }} className={`text-gray-300 whitespace-pre-wrap leading-6 ${isMentioned ? 'text-white' : ''}`} />;
  };

  if (!showHeader) {
    return (
      <div className={`group flex items-start px-4 py-0.5 hover:bg-[#2e3035] ${mentionClass}`}>
        <div className="w-[50px] text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 text-right pr-3 select-none mt-1">
          {timeStr}
        </div>
        <div className="flex-1 min-w-0">
          {renderContent()}
          {message.attachments?.map(att => <AttachmentView key={att.id} attachment={att} />)}
        </div>
      </div>
    );
  }

  return (
    <div className={`group flex items-start px-4 py-0.5 mt-[17px] hover:bg-[#2e3035] ${mentionClass}`}>
      <div className="w-[50px] flex justify-end pr-3 mt-1 cursor-pointer" onClick={() => onUserClick(user.id)}>
        <img src={user?.avatar} alt={user?.username} className="w-10 h-10 rounded-full hover:opacity-80 transition-opacity" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span onClick={() => onUserClick(user.id)} className="font-medium text-white hover:underline cursor-pointer" style={{ color: user?.isBot ? undefined : user?.bannerColor }}>{user?.username}</span>
          {user?.isBot && <span className="bg-discord-blurple text-[10px] px-1.5 rounded-[4px] text-white py-[1px] leading-none flex items-center h-4 mt-[1px]">BOT</span>}
          <span className="text-xs text-gray-400 ml-2">{dateStr} {timeStr}</span>
        </div>
        {renderContent()}
        {message.attachments?.map(att => <AttachmentView key={att.id} attachment={att} />)}
      </div>
    </div>
  );
};

export const ChatArea: React.FC = () => {
  const { 
    activeServerId, activeChannelId, activeDmId, 
    servers, dms, messages, users, sendMessage, currentUser, setModals 
  } = useApp();
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const isHome = activeServerId === 'home';
  const isDiscovery = activeServerId === 'discovery';

  if (isDiscovery) return null; 
  
  let channelName = "";
  let currentMessages: Message[] = [];
  let channelId = "";
  let placeholder = "";
  let isBotChannel = false;
  let availableEmojis: Emoji[] = [];
  let channelType = 'text';

  // Logic to gather available emojis
  if (!isHome) {
      const server = servers.find(s => s.id === activeServerId);
      const channel = server?.channels.find(c => c.id === activeChannelId);
      if (server) availableEmojis = server.emojis || [];
      if (channel) channelType = channel.type;
  } else {
      servers.filter(s => s.members.includes(currentUser?.id || '')).forEach(s => {
          availableEmojis = [...availableEmojis, ...s.emojis];
      });
  }

  if (isHome) {
    const dm = dms.find(d => d.id === activeDmId);
    if (dm) {
        const otherUserId = dm.recipientIds.find(id => id !== currentUser?.id) || dm.recipientIds[0];
        const otherUser = users[otherUserId];
        channelName = dm.recipientIds.length > 2 ? 'Group DM' : (otherUser?.username || "Unknown");
        currentMessages = messages[dm.id] || [];
        channelId = dm.id;
        placeholder = `Message @${channelName}`;
        if (otherUser?.isBot) isBotChannel = true;
    }
  } else {
    const server = servers.find(s => s.id === activeServerId);
    const channel = server?.channels.find(c => c.id === activeChannelId);
    if (channel) {
        channelName = channel.name;
        currentMessages = messages[channel.id] || [];
        channelId = channel.id;
        placeholder = `Message #${channelName}`;
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, activeChannelId, activeDmId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (inputValue.trim()) {
            sendMessage(channelId, inputValue);
            setInputValue("");
            setShowEmojiPicker(false);
        }
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          try {
              const base64 = await readFileAsDataURL(file);
              // Simple detection for video vs image
              const type = file.type.startsWith('image/') ? 'image' : (file.type.startsWith('video/') ? 'video' : 'file');
              sendMessage(channelId, "", [{ id: `att-${Date.now()}`, url: base64, type }]);
          } catch (e) {
              console.error("Upload failed", e);
          }
      }
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addEmoji = (emojiName: string) => {
      setInputValue(prev => prev + ` :${emojiName}: `);
      setShowEmojiPicker(false);
  };

  const handleUserClick = (userId: string) => {
      setModals(p => ({...p, userProfile: userId}));
  };

  if (!channelId) {
      return <div className="flex-1 bg-discord-dark flex items-center justify-center text-gray-500">Select a channel or DM</div>;
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-discord-dark relative">
      {/* Header */}
      <div className="h-12 border-b border-discord-darkest flex items-center px-4 shadow-sm shrink-0 justify-between">
        <div className="flex items-center">
             {channelType === 'announcement' ? <MegaphoneIcon className="w-6 h-6 text-gray-400 mr-2" /> : <HashtagIcon className="w-6 h-6 text-gray-400 mr-2" />}
             <h3 className="font-bold text-white mr-4">{channelName}</h3>
             {isBotChannel && <span className="text-xs bg-discord-blurple text-white px-1 rounded">BOT</span>}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col px-0 pb-4" onClick={() => setShowEmojiPicker(false)}>
         <div className="flex-1" />
         
            <div className="px-4 mb-8 mt-4">
                 <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mb-4">
                     {channelType === 'announcement' ? <MegaphoneIcon className="w-10 h-10 text-white" /> : <HashtagIcon className="w-10 h-10 text-white" />}
                 </div>
                 <h1 className="text-3xl font-bold text-white mb-2">Welcome to {isHome ? '@' : '#'}{channelName}!</h1>
                 <p className="text-gray-400">This is the start of the conversation.</p>
            </div>
         
         {currentMessages.map((msg, idx) => {
             const prevMsg = currentMessages[idx - 1];
             const isCompact = prevMsg && prevMsg.authorId === msg.authorId && (msg.timestamp - prevMsg.timestamp < 5 * 60 * 1000);
             const user = users[msg.authorId] || { username: 'Unknown', avatar: '' };
             return <MessageItem key={msg.id} message={msg} user={user} showHeader={!isCompact} currentUser={currentUser} availableEmojis={availableEmojis} onUserClick={handleUserClick} />;
         })}
         <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-6 pt-2 shrink-0 relative">
        {showEmojiPicker && (
            <div className="absolute bottom-20 right-4 bg-discord-darker border border-discord-darkest rounded-lg p-4 shadow-2xl w-64 h-64 overflow-y-auto custom-scrollbar z-20">
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Emojis</h3>
                {availableEmojis.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2">
                        {availableEmojis.map(emoji => (
                            <button key={emoji.id} onClick={() => addEmoji(emoji.name)} title={`:${emoji.name}:`} className="hover:bg-discord-light p-1 rounded">
                                <img src={emoji.url} className="w-6 h-6 object-contain" />
                            </button>
                        ))}
                    </div>
                ) : <div className="text-gray-500 text-sm">No custom emojis found.</div>}
            </div>
        )}

        <div className="bg-discord-light rounded-lg px-4 py-2.5 flex items-center relative">
            <button onClick={() => fileInputRef.current?.click()} className="text-gray-400 hover:text-gray-200 mr-4">
                <PlusIcon className="w-6 h-6 bg-gray-500 rounded-full text-discord-light p-1" />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,video/*" />
            
            <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="bg-transparent flex-1 text-gray-100 placeholder-gray-400 focus:outline-none"
            />
            <div className="flex items-center space-x-3 ml-2">
               <button onClick={() => setModals(p => ({...p, gameCenter: true}))} className="w-6 h-6 text-gray-400 cursor-pointer hover:text-green-400" title="Play a Game">🎮</button>
               <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="w-6 h-6 text-gray-400 cursor-pointer hover:text-yellow-400 grayscale hover:grayscale-0">😀</button>
            </div>
        </div>
      </div>
    </div>
  );
};