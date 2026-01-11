import React from 'react';
import { ServerSidebar } from './ServerSidebar';
import { NavigationSidebar } from './NavigationSidebar';
import { ChatArea } from '../chat/ChatArea';
import { MemberList } from '../chat/MemberList';
import { Discovery } from '../discovery/Discovery';
import { useApp } from '../../context/AppContext';

export const Layout: React.FC = () => {
  const { activeServerId } = useApp();

  return (
    <div className="flex w-full h-full overflow-hidden">
      <ServerSidebar />
      
      {activeServerId === 'discovery' ? (
        <Discovery />
      ) : (
        <>
          <NavigationSidebar />
          <ChatArea />
          <MemberList />
        </>
      )}
    </div>
  );
};