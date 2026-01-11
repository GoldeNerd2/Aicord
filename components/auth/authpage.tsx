import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DiscordIcon } from '../ui/Icons';

export const AuthPage: React.FC = () => {
  const { login, signup } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  
  // Form State
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let finalEmail = email.trim();
    if (!finalEmail) {
        setError("Email is required.");
        return;
    }

    if (isLogin) {
      if (!finalEmail.includes('@')) {
          // Allow login with username shorthand if it matches specific format, else assume default domain
          if (!finalEmail.includes('.')) finalEmail = `${finalEmail}@aicord.chat`;
      }
      
      const success = login(finalEmail, password, rememberMe);
      if (!success) setError('Invalid email or password. Hint: Did you sign up?');
    } else {
      if (!username || !password) {
        setError('All fields are required.');
        return;
      }
      
      // Auto-generate AIcord email if not provided standard format
      if (!finalEmail.includes('@')) {
          finalEmail = `${finalEmail}@aicord.chat`;
      }

      signup(finalEmail, username, password, rememberMe);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center relative">
       {/* Overlay */}
       <div className="absolute inset-0 bg-discord-darkest/80 backdrop-blur-sm"></div>

       <div className="bg-discord-dark p-8 rounded shadow-2xl w-full max-w-[480px] z-10 animate-scale-in border border-gray-800">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
               <DiscordIcon className="w-12 h-12 text-discord-blurple" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {isLogin ? 'Welcome Back!' : 'Create an Account'}
            </h2>
            <p className="text-gray-400">
              {isLogin ? "We're so excited to see you again!" : "Join the AIcord community for free."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
               <div className="animate-slide-down">
                  <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Username</label>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-discord-darkest text-white p-2.5 rounded border border-transparent focus:border-discord-blurple focus:outline-none transition-colors"
                    required
                    minLength={3}
                  />
               </div>
            )}

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase block mb-2">
                {isLogin ? 'Email or Username' : 'Email (Optional: defaults to @aicord.chat)'}
              </label>
              <input 
                type="text" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-discord-darkest text-white p-2.5 rounded border border-transparent focus:border-discord-blurple focus:outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-discord-darkest text-white p-2.5 rounded border border-transparent focus:border-discord-blurple focus:outline-none transition-colors"
                required
                minLength={4}
              />
            </div>

            {isLogin && (
                <div className="flex items-center mb-4">
                   <input 
                     type="checkbox" 
                     id="remember"
                     checked={rememberMe}
                     onChange={(e) => setRememberMe(e.target.checked)}
                     className="w-4 h-4 rounded border-gray-600 bg-discord-darkest text-discord-blurple focus:ring-offset-0"
                   />
                   <label htmlFor="remember" className="ml-2 text-sm text-gray-400 cursor-pointer">Remember Me</label>
                   <a href="#" className="ml-auto text-sm text-discord-blurple hover:underline">Forgot your password?</a>
                </div>
            )}

            {error && <div className="text-discord-red text-xs font-bold uppercase bg-discord-red/10 p-2 rounded text-center">{error}</div>}

            <button type="submit" className="w-full bg-discord-blurple hover:bg-discord-blurple-hover text-white font-medium py-2.5 rounded transition-colors shadow-lg">
              {isLogin ? 'Log In' : 'Continue'}
            </button>

            <div className="mt-4 text-sm text-gray-400">
               {isLogin ? (
                 <>Need an account? <button type="button" onClick={() => {setIsLogin(false); setError('');}} className="text-discord-blurple hover:underline">Register</button></>
               ) : (
                 <><button type="button" onClick={() => {setIsLogin(true); setError('');}} className="text-discord-blurple hover:underline">Already have an account?</button></>
               )}
            </div>
          </form>
       </div>
    </div>
  );
};