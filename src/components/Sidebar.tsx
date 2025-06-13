import React from 'react';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <nav>
        <ul>
          <li><a href="#home">Home</a></li>
          <li><a href="#library">My Library</a></li>
          <li><a href="#store">Game Store</a></li>
          <li><a href="#new">New Releases</a></li>
          <li><a href="#categories">Categories</a></li>
          <li><a href="#multiplayer">Multiplayer</a></li>
          <li><a href="#achievements">Achievements</a></li>
          <li><a href="#friends">Friends</a></li>
          <li><a href="#settings">Settings</a></li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
