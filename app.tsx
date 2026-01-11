import { User, Server, DMChannel, Message, Game } from './types';

export const CLYDE_BOT_ID = '9999999999';

// Placeholder for database connection
export const DATABASE_CONNECTION_URL = 'aicord_user_data.db';

// Gemini Bot remains as the only system user
export const GEMINI_BOT: User = {
  id: CLYDE_BOT_ID,
  username: 'Gemini AI',
  discriminator: '0000',
  email: 'gemini@aicord.chat',
  avatar: 'https://picsum.photos/seed/ai/200',
  status: 'online',
  isBot: true,
  bannerColor: '#1e1f22',
  aboutMe: 'I am a large language model, trained by Google.'
};

export const INITIAL_USERS: Record<string, User> = {
  [CLYDE_BOT_ID]: GEMINI_BOT
};

// EMPTY SEEDS - User starts fresh
export const SEED_SERVERS: Server[] = [];

// Removed fake bots
export const AVAILABLE_BOTS: User[] = [];

// Removed examples as requested
export const INITIAL_GAMES: Game[] = [];

export const INITIAL_DMS: DMChannel[] = [];
export const INITIAL_MESSAGES: Record<string, Message[]> = {};
export const INITIAL_SERVERS: Server[] = [];