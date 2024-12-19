import { Outlet } from 'react-router-dom';
import { Sidebar } from './layout/Sidebar';
import { useState } from 'react';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile menu button */}
      <div className="flex justify-start items-start p-4 md:hidden bg-gray-800">
        <button onClick={toggleSidebar} className="text-white">
          <div className="h-1 w-6 bg-white mb-1"></div>
          <div className="h-1 w-6 bg-white mb-1"></div>
          <div className="h-1 w-6 bg-white"></div>
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-0 z-50 w-64 bg-gray-800 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'transform-none' : '-translate-x-full'
          } md:relative md:translate-x-0`}
      >
        {isSidebarOpen && (
          <button
            onClick={closeSidebar}
            className="absolute top-4 right-4 text-white"
          >
            <span className="h-16 w-16 text-white">&times;</span>
          </button>
        )}
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-100 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
