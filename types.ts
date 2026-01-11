export interface User {
  id: string;
  username: string;
  discriminator: string;
  email: string;
  password?: string;
  avatar?: string;
  bannerColor?: string;
  bannerUrl?: string; // Image banner
  status: 'online' | 'idle' | 'dnd' | 'invisible';
  customStatus?: string;
  isBot?: boolean;
  aboutMe?: string;
}

export interface Attachment {
  id: string;
  url: string;
  type: 'image' | 'video' | 'file';
}

export interface Emoji {
  id: string;
  name: string;
  url: string;
  creatorId: string;
}

export interface Message {
  id: string;
  channelId: string;
  authorId: string;
  content: string;
  timestamp: number;
  attachments?: Attachment[];
  isSystem?: boolean;
  mentions?: string[];
}

export interface Channel {
  id: string;
  serverId: string;
  name: string;
  type: 'text' | 'announcement'; // Changed voice to announcement
  categoryId?: string;
}

export interface ChannelCategory {
  id: string;
  serverId: string;
  name: string;
}

export interface Role {
  id: string;
  name: string;
  color: string;
  permissions: ('ADMINISTRATOR' | 'MANAGE_CHANNELS' | 'KICK_MEMBERS')[];
}

export interface Server {
  id: string;
  name: string;
  icon?: string;
  bannerUrl?: string; // Server Banner
  ownerId: string;
  isPublic: boolean;
  channels: Channel[];
  categories: ChannelCategory[];
  members: string[]; 
  roles: Role[];
  memberRoles: Record<string, string[]>;
  emojis: Emoji[];
  inviteCode?: string; // For adding people
}

export interface DMChannel {
  id: string;
  recipientIds: string[];
  lastMessageId?: string;
  name?: string; 
  icon?: string; 
  ownerId?: string; 
}

export interface Game {
  id: string;
  name: string;
  description: string;
  icon: string;
  code?: string; // HTML/JS Embed Code
}

export type ViewType = 'server' | 'dm' | 'settings' | 'discovery';

export interface AppState {
  currentUser: User | null;
  users: Record<string, User>;
  servers: Server[];
  dms: DMChannel[];
  messages: Record<string, Message[]>;
  games: Game[]; // Added games state
  
  // Navigation State
  activeServerId: string | 'home' | 'discovery';
  activeChannelId: string | null;
  activeDmId: string | null;
  
  // UI State
  modals: {
    settings: boolean;
    createServer: boolean;
    createGroupDm: boolean;
    serverSettings: string | null; 
    gameCenter: boolean;
    addBot: boolean;
    createChannel: { serverId: string, categoryId?: string } | null;
    createCategory: { serverId: string } | null;
    invitePeople: string | null; // Server ID
    addGame: boolean;
    userProfile: string | null; // User ID for profile popout
  };
}