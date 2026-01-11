import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MegaphoneIcon, HashtagIcon } from '../ui/Icons';

const ModalBackdrop: React.FC<{ children: React.ReactNode, onClose: () => void }> = ({ children, onClose }) => (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
        <div className="animate-scale-in" onClick={e => e.stopPropagation()}>
            {children}
        </div>
    </div>
);

const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const UserProfileModal = () => {
    const { modals, setModals, users, createDm } = useApp();
    const userId = modals.userProfile;
    if (!userId) return null;
    const user = users[userId];
    if (!user) return null;

    const handleMessage = () => {
        createDm(userId);
        setModals(p => ({...p, userProfile: null}));
    };

    return (
        <ModalBackdrop onClose={() => setModals(p => ({...p, userProfile: null}))}>
            <div className="bg-discord-dark rounded-xl w-[600px] overflow-hidden shadow-2xl relative">
                <div className="h-[210px] relative" style={{backgroundColor: user.bannerColor || '#000', backgroundImage: user.bannerUrl ? `url(${user.bannerUrl})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center'}}>
                     {/* Banner */}
                </div>
                <div className="relative px-4 pb-4 bg-discord-dark">
                    <div className="w-[140px] h-[140px] rounded-full border-[7px] border-discord-dark bg-discord-dark absolute -top-[70px] left-4 overflow-hidden">
                        <img src={user.avatar} className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="mt-20 ml-2">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-white">{user.username}</h2>
                            {user.isBot && <span className="bg-discord-blurple text-white px-2 py-0.5 rounded text-sm font-bold">BOT</span>}
                        </div>
                        <div className="text-gray-400">#{user.discriminator}</div>
                        
                        <div className="mt-4 border-t border-gray-700 pt-4">
                            <h3 className="uppercase text-xs font-bold text-gray-300 mb-2">About Me</h3>
                            <p className="text-sm text-gray-300 whitespace-pre-wrap">{user.aboutMe || "Just another AIcord user."}</p>
                        </div>

                        <div className="mt-4 border-t border-gray-700 pt-4">
                             <h3 className="uppercase text-xs font-bold text-gray-300 mb-2">Member Since</h3>
                             <p className="text-sm text-gray-400">May 2024</p>
                        </div>
                        
                        {!user.isBot && (
                            <div className="mt-6 flex justify-end">
                                <button onClick={handleMessage} className="bg-discord-green hover:bg-green-600 text-white px-4 py-2 rounded font-medium transition-colors w-full">Send Message</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ModalBackdrop>
    );
};

const CreateServerModal = () => {
    const { createServer, setModals } = useApp();
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const base64 = await readFileAsDataURL(e.target.files[0]);
            setIcon(base64);
        }
    };

    return (
        <ModalBackdrop onClose={() => setModals(p => ({...p, createServer: false}))}>
            <div className="bg-white rounded-md w-[440px] overflow-hidden text-gray-900">
                <div className="p-6 text-center">
                    <h2 className="text-2xl font-bold mb-2">Create Your Server</h2>
                    <p className="text-gray-500 mb-6">Give your new server a personality.</p>
                    <div className="text-left space-y-4">
                        <div className="flex justify-center mb-4">
                            <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center cursor-pointer overflow-hidden relative" onClick={() => fileInputRef.current?.click()}>
                                {icon ? <img src={icon} className="w-full h-full object-cover" /> : <span className="text-gray-400 text-xs text-center">Upload<br/>Icon</span>}
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                            </div>
                        </div>
                        <div>
                             <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Server Name</label>
                             <input className="w-full bg-gray-200 p-2 rounded border-none" value={name} onChange={(e) => setName(e.target.value)} placeholder="My Awesome Server" />
                        </div>
                        <div className="flex items-center">
                             <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} className="mr-2"/>
                             <label className="text-sm text-gray-600">Make public (Discoverable)</label>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-100 p-4 flex justify-between">
                    <button onClick={() => setModals(p => ({...p, createServer: false}))} className="text-gray-600">Back</button>
                    <button onClick={() => createServer(name || "New Server", isPublic, icon)} className="bg-discord-blurple text-white px-6 py-2 rounded">Create</button>
                </div>
            </div>
        </ModalBackdrop>
    );
};

const CreateChannelModal = () => {
    const { modals, createChannel, setModals } = useApp();
    const [name, setName] = useState('');
    const [type, setType] = useState<'text' | 'announcement'>('text');

    if (!modals.createChannel) return null;
    const { serverId, categoryId } = modals.createChannel;

    return (
        <ModalBackdrop onClose={() => setModals(p => ({...p, createChannel: null}))}>
            <div className="bg-discord-dark rounded-md w-[440px] p-6 text-white border border-gray-700">
                <h2 className="text-xl font-bold mb-4">Create Channel</h2>
                <div className="space-y-4">
                     <div>
                         <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Channel Type</label>
                         <div className="space-y-2">
                             <label className={`flex items-center p-3 rounded cursor-pointer border ${type === 'text' ? 'bg-discord-light border-discord-blurple' : 'bg-discord-darker border-transparent'}`} onClick={() => setType('text')}>
                                 <HashtagIcon className="w-6 h-6 mr-3 text-gray-400" />
                                 <div>
                                     <div className="font-bold">Text</div>
                                     <div className="text-xs text-gray-400">Send messages, images, and opinions.</div>
                                 </div>
                             </label>
                             <label className={`flex items-center p-3 rounded cursor-pointer border ${type === 'announcement' ? 'bg-discord-light border-discord-blurple' : 'bg-discord-darker border-transparent'}`} onClick={() => setType('announcement')}>
                                 <MegaphoneIcon className="w-6 h-6 mr-3 text-gray-400" />
                                 <div>
                                     <div className="font-bold">Announcement</div>
                                     <div className="text-xs text-gray-400">Post important updates for everyone.</div>
                                 </div>
                             </label>
                         </div>
                     </div>
                     <div>
                         <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Channel Name</label>
                         <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-discord-darker p-2 rounded text-white" placeholder="new-channel" />
                     </div>
                </div>
                <div className="mt-6 flex justify-end space-x-2">
                    <button onClick={() => setModals(p => ({...p, createChannel: null}))} className="px-4 py-2 hover:underline">Cancel</button>
                    <button onClick={() => categoryId && createChannel(serverId, categoryId, name, type)} className="bg-discord-blurple px-6 py-2 rounded text-white">Create Channel</button>
                </div>
            </div>
        </ModalBackdrop>
    );
};

const CreateCategoryModal = () => {
    const { modals, createCategory, setModals } = useApp();
    const [name, setName] = useState('');

    if (!modals.createCategory) return null;
    const { serverId } = modals.createCategory;

    return (
        <ModalBackdrop onClose={() => setModals(p => ({...p, createCategory: null}))}>
            <div className="bg-discord-dark rounded-md w-[440px] p-6 text-white border border-gray-700">
                <h2 className="text-xl font-bold mb-4">Create Category</h2>
                <div className="space-y-4">
                     <div>
                         <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Category Name</label>
                         <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-discord-darker p-2 rounded text-white" placeholder="New Category" />
                     </div>
                </div>
                <div className="mt-6 flex justify-end space-x-2">
                    <button onClick={() => setModals(p => ({...p, createCategory: null}))} className="px-4 py-2 hover:underline">Cancel</button>
                    <button onClick={() => createCategory(serverId, name)} className="bg-discord-blurple px-6 py-2 rounded text-white">Create Category</button>
                </div>
            </div>
        </ModalBackdrop>
    );
};

const CreateGroupDmModal = () => {
    const { createGroupDm, setModals, findUserByTag } = useApp();
    const [searchTag, setSearchTag] = useState('');
    const [addedUsers, setAddedUsers] = useState<any[]>([]);
    const [error, setError] = useState('');

    const handleAdd = () => {
        setError('');
        const user = findUserByTag(searchTag);
        if (user) {
            if (addedUsers.some(u => u.id === user.id)) setError('User already added');
            else {
                setAddedUsers(prev => [...prev, user]);
                setSearchTag('');
            }
        } else {
            setError('User not found. Check casing and tag.');
        }
    };

    return (
        <ModalBackdrop onClose={() => setModals(p => ({...p, createGroupDm: false}))}>
            <div className="bg-discord-dark rounded-md w-[440px] overflow-hidden text-white border border-gray-700">
                <div className="p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold">Select Friends</h2>
                    <p className="text-xs text-gray-400">Search by Username#0000 to find people.</p>
                </div>
                <div className="p-4">
                    <div className="flex space-x-2 mb-2">
                        <input 
                            value={searchTag} 
                            onChange={e => setSearchTag(e.target.value)} 
                            placeholder="Username#1234"
                            className="flex-1 bg-discord-darker p-2 rounded focus:outline-none"
                        />
                        <button onClick={handleAdd} className="bg-discord-blurple px-4 rounded">Add</button>
                    </div>
                    {error && <div className="text-red-400 text-xs mb-2">{error}</div>}
                    
                    <div className="mt-4 space-y-2">
                        {addedUsers.map(user => (
                            <div key={user.id} className="flex items-center bg-discord-light p-2 rounded">
                                <img src={user.avatar} className="w-6 h-6 rounded-full mr-2" />
                                <span>{user.username}</span>
                                <button onClick={() => setAddedUsers(p => p.filter(u => u.id !== user.id))} className="ml-auto text-gray-400 hover:text-white">✕</button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-4 bg-discord-darker flex justify-end">
                     <button onClick={() => createGroupDm(addedUsers.map(u => u.id))} disabled={addedUsers.length === 0} className="bg-discord-blurple disabled:opacity-50 text-white px-6 py-2 rounded">Create Group DM</button>
                </div>
            </div>
        </ModalBackdrop>
    );
};

const InvitePeopleModal = () => {
    const { setModals, modals, servers } = useApp();
    const server = servers.find(s => s.id === modals.invitePeople);
    if (!server) return null;

    const inviteLink = `https://aicord.chat/invite/${server.inviteCode || 'error'}`;

    return (
        <ModalBackdrop onClose={() => setModals(p => ({...p, invitePeople: null}))}>
            <div className="bg-discord-dark rounded-md w-[440px] p-6 text-white border border-gray-700">
                <h2 className="text-xl font-bold mb-2">Invite people to {server.name}</h2>
                <div className="mb-4">
                    <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Or send a server invite link</label>
                    <div className="flex bg-discord-darker p-2 rounded border border-black">
                        <input className="bg-transparent flex-1 text-gray-300 text-sm focus:outline-none" readOnly value={inviteLink} />
                        <button className="bg-discord-blurple px-4 py-1 rounded text-sm font-medium ml-2" onClick={() => navigator.clipboard.writeText(inviteLink)}>Copy</button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Your invite link expires in 7 days.</p>
                </div>
            </div>
        </ModalBackdrop>
    );
};

const ServerSettingsModal = () => {
    const { setModals, servers, modals, updateServer, addEmojiToServer } = useApp();
    const server = servers.find(s => s.id === modals.serverSettings);
    const [emojiName, setEmojiName] = useState('');
    
    // File inputs
    const iconRef = useRef<HTMLInputElement>(null);
    const bannerRef = useRef<HTMLInputElement>(null);
    const emojiRef = useRef<HTMLInputElement>(null);

    if (!server) return null;

    const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files?.[0]) updateServer(server.id, { icon: await readFileAsDataURL(e.target.files[0]) });
    };

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files?.[0]) updateServer(server.id, { bannerUrl: await readFileAsDataURL(e.target.files[0]) });
    };

    const handleEmojiUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files?.[0] && emojiName) {
            const url = await readFileAsDataURL(e.target.files[0]);
            addEmojiToServer(server.id, emojiName, url);
            setEmojiName('');
            // Reset input
            if(emojiRef.current) emojiRef.current.value = '';
        }
    };

    return (
        <ModalBackdrop onClose={() => setModals(p => ({...p, serverSettings: null}))}>
            <div className="bg-discord-dark rounded-md w-[600px] overflow-hidden text-white flex h-[500px]">
                <div className="w-1/3 bg-discord-darker p-2 space-y-1">
                     <div className="px-2 py-1 text-xs font-bold text-gray-400 uppercase">{server.name}</div>
                     <div className="px-2 py-1.5 bg-discord-light rounded cursor-pointer">Overview</div>
                </div>
                <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                    <h2 className="text-xl font-bold mb-4">Server Overview</h2>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <div className="w-24 h-24 bg-gray-600 rounded-full overflow-hidden shrink-0 cursor-pointer relative group" onClick={() => iconRef.current?.click()}>
                                {server.icon ? <img src={server.icon} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full">{server.name.substring(0,2)}</div>}
                                <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-xs">Change</div>
                                <input type="file" ref={iconRef} onChange={handleIconUpload} className="hidden" accept="image/*" />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Server Name</label>
                                <input value={server.name} onChange={e => updateServer(server.id, { name: e.target.value })} className="w-full bg-discord-darker p-2 rounded text-white" />
                            </div>
                        </div>
                        <div>
                             <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Server Banner</label>
                             <div className="h-24 bg-gray-700 rounded relative cursor-pointer group" onClick={() => bannerRef.current?.click()}>
                                 {server.bannerUrl && <img src={server.bannerUrl} className="w-full h-full object-cover rounded" />}
                                 <div className="absolute inset-0 bg-black/20 hidden group-hover:flex items-center justify-center text-xs">Upload Banner</div>
                                 <input type="file" ref={bannerRef} onChange={handleBannerUpload} className="hidden" accept="image/*" />
                             </div>
                        </div>
                        
                        <div className="h-px bg-gray-700 my-4"></div>
                        
                        <h3 className="font-bold mb-2">Custom Emojis</h3>
                        <div className="flex space-x-2 mb-2 items-end">
                             <div className="flex-1">
                                <label className="text-[10px] text-gray-400 uppercase mb-1 block">Emoji Name</label>
                                <input value={emojiName} onChange={e => setEmojiName(e.target.value)} placeholder="pepe" className="w-full bg-discord-darker p-2 rounded" />
                             </div>
                             <button onClick={() => emojiRef.current?.click()} disabled={!emojiName} className="bg-discord-blurple px-4 py-2 rounded h-10 disabled:opacity-50">Upload</button>
                             <input type="file" ref={emojiRef} onChange={handleEmojiUpload} className="hidden" accept="image/*" />
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                            {server.emojis?.map(e => (
                                <div key={e.id} className="bg-discord-darker p-2 rounded flex flex-col items-center">
                                    <img src={e.url} className="w-8 h-8 mb-1 object-contain" />
                                    <span className="text-[10px] text-gray-400 truncate w-full text-center">:{e.name}:</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </ModalBackdrop>
    );
};

const SettingsModal = () => {
    const { currentUser, updateUser, toggleSettings, logout } = useApp();
    if (!currentUser) return null;
    
    // Sync local state with current user prop to ensure updates render
    const [username, setUsername] = useState(currentUser.username);
    const [aboutMe, setAboutMe] = useState(currentUser.aboutMe || '');
    const [bannerColor, setBannerColor] = useState(currentUser.bannerColor || '#5865F2');

    const avatarRef = useRef<HTMLInputElement>(null);
    const bannerRef = useRef<HTMLInputElement>(null);

    const handleSave = () => {
        updateUser({ username, aboutMe, bannerColor });
        toggleSettings(false);
    };

    const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files?.[0]) {
             const url = await readFileAsDataURL(e.target.files[0]);
             updateUser({ avatar: url });
        }
    }

    const handleBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files?.[0]) {
            const url = await readFileAsDataURL(e.target.files[0]);
            updateUser({ bannerUrl: url });
        }
    }

    return (
        <div className="fixed inset-0 bg-discord-darkest z-50 flex animate-slide-up">
            <div className="w-1/3 bg-discord-darker flex justify-end p-4 pt-10 border-r border-discord-darkest">
                <div className="w-48 space-y-1">
                    <div className="px-2 py-1.5 text-gray-400 font-bold uppercase text-xs mb-2">User Settings</div>
                    <div className="px-2 py-1.5 bg-discord-light text-white rounded cursor-pointer">My Account</div>
                    <div className="h-[1px] bg-gray-700 my-2"></div>
                    <div onClick={() => {logout(); toggleSettings(false);}} className="px-2 py-1.5 text-red-400 hover:bg-red-400/10 rounded cursor-pointer">Log Out</div>
                </div>
            </div>
            <div className="flex-1 bg-discord-dark p-10 pt-14 overflow-y-auto">
                <div className="max-w-xl">
                    <h2 className="text-xl font-bold text-white mb-6">My Account</h2>
                    <div className="bg-discord-darker rounded-lg p-4 mb-8">
                         <div className="h-32 rounded-t-lg mb-12 relative bg-cover bg-center cursor-pointer group" style={{backgroundColor: bannerColor, backgroundImage: currentUser.bannerUrl ? `url(${currentUser.bannerUrl})` : undefined}} onClick={() => bannerRef.current?.click()}>
                             <div className="absolute inset-0 bg-black/20 hidden group-hover:flex items-center justify-center text-xs text-white">Change Banner</div>
                             <div className="absolute -bottom-10 left-4 w-24 h-24 rounded-full border-[6px] border-discord-darker bg-gray-600 overflow-hidden cursor-pointer group-hover:border-discord-light" onClick={(e) => { e.stopPropagation(); avatarRef.current?.click(); }}>
                                 <img src={currentUser.avatar} className="w-full h-full object-cover" />
                                 <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-[10px] text-center text-white">Change Avatar</div>
                             </div>
                             <input type="file" ref={bannerRef} onChange={handleBanner} className="hidden" accept="image/*" />
                             <input type="file" ref={avatarRef} onChange={handleAvatar} className="hidden" accept="image/*" />
                         </div>
                         <h3 className="text-2xl font-bold text-white pl-32">{currentUser.username}</h3>
                         <span className="text-gray-400 pl-32">#{currentUser.discriminator}</span>
                    </div>

                    <div className="space-y-4">
                         <div>
                             <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Username</label>
                             <input value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-discord-darker p-2 rounded text-white" />
                         </div>
                         <div>
                             <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Banner Color</label>
                             <input type="color" value={bannerColor} onChange={e => setBannerColor(e.target.value)} className="w-full h-10 bg-discord-darker rounded" />
                         </div>
                         <div>
                             <label className="text-xs font-bold text-gray-400 uppercase block mb-1">About Me</label>
                             <textarea value={aboutMe} onChange={e => setAboutMe(e.target.value)} className="w-full bg-discord-darker p-2 rounded text-white h-24" />
                         </div>
                    </div>
                    <div className="mt-8 flex justify-end space-x-4">
                         <button onClick={() => toggleSettings(false)} className="text-white hover:underline">Cancel</button>
                         <button onClick={handleSave} className="bg-discord-green hover:bg-green-600 text-white px-6 py-2 rounded font-medium transition-colors">Save Changes</button>
                    </div>
                </div>
            </div>
            <button onClick={() => toggleSettings(false)} className="absolute top-4 right-4 text-white text-lg font-bold border-2 border-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-white hover:text-black transition-all">✕</button>
        </div>
    );
};

const AddGameModal = () => {
    const { addGame, setModals } = useApp();
    const [name, setName] = useState('');
    const [code, setCode] = useState('');

    return (
        <ModalBackdrop onClose={() => setModals(p => ({...p, addGame: false}))}>
            <div className="bg-discord-dark rounded-md w-[440px] p-6 text-white border border-gray-700">
                <h2 className="text-xl font-bold mb-4">Add a Game by Code</h2>
                <div className="space-y-4">
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Game Name" className="w-full bg-discord-darker p-2 rounded" />
                    <textarea value={code} onChange={e => setCode(e.target.value)} placeholder="Paste HTML/Embed Code here..." className="w-full bg-discord-darker p-2 rounded h-32 font-mono text-xs" />
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                     <button onClick={() => setModals(p => ({...p, addGame: false}))} className="text-gray-400">Cancel</button>
                     <button onClick={() => addGame({ id: `game-${Date.now()}`, name, code, description: 'Custom Game', icon: '🎮' })} className="bg-discord-green px-4 py-2 rounded">Add Game</button>
                </div>
            </div>
        </ModalBackdrop>
    );
};

const GameCenterModal = () => {
    const { setModals, sendMessage, activeChannelId, games } = useApp();
    const [playingGame, setPlayingGame] = useState<string | null>(null);

    const launchGame = (game: any) => {
        if (game.code) {
             setPlayingGame(game.code);
        } else if (activeChannelId) {
             sendMessage(activeChannelId, `🎮 **Started a game of ${game.name}!**`);
             setModals(p => ({...p, gameCenter: false}));
        }
    };

    if (playingGame) {
        return (
            <ModalBackdrop onClose={() => setPlayingGame(null)}>
                <div className="bg-white w-[800px] h-[600px] rounded overflow-hidden relative">
                    <button onClick={() => setPlayingGame(null)} className="absolute top-2 right-2 text-black font-bold z-10">✕ Close</button>
                    <div dangerouslySetInnerHTML={{ __html: playingGame }} className="w-full h-full" />
                </div>
            </ModalBackdrop>
        );
    }

    return (
        <ModalBackdrop onClose={() => setModals(p => ({...p, gameCenter: false}))}>
            <div className="bg-discord-dark rounded-lg w-[440px] p-6 text-white border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Game Center</h2>
                    <button onClick={() => setModals(p => ({...p, addGame: true}))} className="text-xs bg-discord-blurple px-2 py-1 rounded">Add Game</button>
                </div>
                <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    {games.length === 0 ? <div className="col-span-2 text-center text-gray-500 py-4">No games added yet.</div> : null}
                    {games.map(game => (
                        <button key={game.id} onClick={() => launchGame(game)} className="bg-discord-darker hover:bg-discord-light p-4 rounded-lg flex flex-col items-center">
                            <span className="text-4xl mb-2">{game.icon}</span>
                            <span className="font-bold">{game.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </ModalBackdrop>
    );
}

export const Modals: React.FC = () => {
  const { modals } = useApp();
  return (
    <>
      {modals.createServer && <CreateServerModal />}
      {modals.settings && <SettingsModal />}
      {modals.gameCenter && <GameCenterModal />}
      {modals.serverSettings && <ServerSettingsModal />}
      {modals.createGroupDm && <CreateGroupDmModal />}
      {modals.createChannel && <CreateChannelModal />}
      {modals.createCategory && <CreateCategoryModal />}
      {modals.invitePeople && <InvitePeopleModal />}
      {modals.addGame && <AddGameModal />}
      {modals.userProfile && <UserProfileModal />}
    </>
  );
};