import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Tags,
  Package,
  BarChart3,
  LogOut,
  Receipt,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useEffect, useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Categories', href: '/categories', icon: Tags },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Stock', href: '/stock', icon: BarChart3 },
  { name: 'Bills', href: '/bills', icon: Receipt },
];

export function Sidebar() {
  const location = useLocation();
  const [userMetadata, setUserMetadata] = useState<{ full_name: string | null } | null>(null);

  // Function to get current authenticated user and their profile
  const getCurrentUser = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('Error fetching user:', userError);
      return null;
    }

    if (userData?.user) {
      // Fetch additional user profile details from 'profiles' table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userData.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return null;
      }

      return { user: userData.user, profile: profileData };
    }
    return null;
  };

  useEffect(() => {
    // Fetch current user and their profile when the component is mounted
    const fetchUserData = async () => {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUserMetadata(currentUser.profile);
      }
    };

    fetchUserData();
  }, []); // Empty dependency array to run once when the component mounts

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="flex h-full flex-col bg-gray-800">
      <div className="flex h-16 items-center justify-center border-b border-gray-700">
        <h1 className="text-xl font-bold text-white">Inventory Pro</h1>
      </div>

      {/* User info section */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          {/* Display avatar or user initials */}
          <div className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center">
            <span className="text-white">
              {userMetadata?.full_name?.[0]}
            </span>
          </div>
          {/* Display user's full name */}
          <span className="text-white text-sm">
            {userMetadata?.full_name || 'User'}
          </span>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${location.pathname === item.href
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Sign out button */}
      <div className="border-t border-gray-700 p-4">
        <button
          onClick={handleSignOut}
          className="group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign out
        </button>
      </div>
    </div>
  );
}