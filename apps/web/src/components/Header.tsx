import { Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { BellIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { cn, getInitials } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notifications';
import { useUIStore } from '@/stores/ui';
import { useLogout } from '@/api/auth';

export function Header() {
  const { user } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const { setMobileSidebarOpen } = useUIStore();
  const logoutMutation = useLogout();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => navigate('/login'),
    });
  };

  const fullName = user ? `${user.firstName} ${user.lastName}` : '';
  const initials = fullName ? getInitials(fullName) : '?';

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:px-6">
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileSidebarOpen(true)}
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden min-h-touch min-w-touch flex items-center justify-center"
        aria-label="Open sidebar"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Org name */}
      <div className="hidden lg:block">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {user?.organizationName || 'Nuestable'}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <Link
          to="/notifications"
          className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200 min-h-touch min-w-touch flex items-center justify-center"
          aria-label="Notifications"
        >
          <BellIcon className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>

        {/* User dropdown */}
        <Menu as="div" className="relative">
          <MenuButton className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 min-h-touch transition-colors">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                {initials}
              </div>
            )}
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{fullName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role?.replace(/_/g, ' ')}</p>
            </div>
          </MenuButton>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <MenuItems className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800 focus:outline-none">
              <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{fullName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
              <MenuItem>
                {({ focus }) => (
                  <Link
                    to="/notifications/preferences"
                    className={cn(
                      'block px-4 py-2.5 text-sm min-h-touch flex items-center',
                      focus ? 'bg-gray-50 dark:bg-gray-700' : '',
                      'text-gray-700 dark:text-gray-200',
                    )}
                  >
                    Settings
                  </Link>
                )}
              </MenuItem>
              <MenuItem>
                {({ focus }) => (
                  <button
                    onClick={handleLogout}
                    className={cn(
                      'block w-full text-left px-4 py-2.5 text-sm min-h-touch flex items-center',
                      focus ? 'bg-gray-50 dark:bg-gray-700' : '',
                      'text-red-600 dark:text-red-400',
                    )}
                  >
                    Sign out
                  </button>
                )}
              </MenuItem>
            </MenuItems>
          </Transition>
        </Menu>
      </div>
    </header>
  );
}
