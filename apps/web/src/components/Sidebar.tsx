import { NavLink, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  RectangleGroupIcon,
  TrophyIcon,
  WrenchScrewdriverIcon,
  HeartIcon,
  DocumentTextIcon,
  BanknotesIcon,
  UserGroupIcon,
  BellIcon,
  Cog6ToothIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  children?: { label: string; href: string }[];
}

const navigation: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <HomeIcon className="h-5 w-5" /> },
  {
    label: 'Horses',
    href: '/horses',
    icon: <RectangleGroupIcon className="h-5 w-5" />,
  },
  {
    label: 'Races',
    href: '/races',
    icon: <TrophyIcon className="h-5 w-5" />,
    children: [
      { label: 'Calendar', href: '/races' },
      { label: 'Race Day', href: '/races/today' },
      { label: 'Eligibility', href: '/races/eligibility' },
    ],
  },
  {
    label: 'Operations',
    href: '/operations/checklist',
    icon: <WrenchScrewdriverIcon className="h-5 w-5" />,
    children: [
      { label: 'Checklist', href: '/operations/checklist' },
      { label: 'Feed Log', href: '/operations/feed' },
      { label: 'Therapy', href: '/operations/therapy' },
      { label: 'Tasks', href: '/operations/tasks' },
      { label: 'Barn Map', href: '/operations/barn' },
    ],
  },
  {
    label: 'Health',
    href: '/health/medications',
    icon: <HeartIcon className="h-5 w-5" />,
    children: [
      { label: 'Medications', href: '/health/medications' },
      { label: 'Vaccinations', href: '/health/vaccinations' },
      { label: 'Injuries', href: '/health/injuries' },
      { label: 'Pre-Race Clearance', href: '/health/clearance' },
    ],
  },
  {
    label: 'Documents',
    href: '/documents',
    icon: <DocumentTextIcon className="h-5 w-5" />,
    children: [
      { label: 'Repository', href: '/documents' },
      { label: 'Upload', href: '/documents/upload' },
      { label: 'Expiry Tracker', href: '/documents/expiry' },
    ],
  },
  {
    label: 'Financial',
    href: '/financial/expenses',
    icon: <BanknotesIcon className="h-5 w-5" />,
    children: [
      { label: 'Expenses', href: '/financial/expenses' },
      { label: 'Invoices', href: '/financial/invoices' },
      { label: 'Cost Per Horse', href: '/financial/cost-per-horse' },
    ],
  },
  {
    label: 'Owner Portal',
    href: '/owner-portal',
    icon: <UserGroupIcon className="h-5 w-5" />,
    children: [
      { label: 'Dashboard', href: '/owner-portal' },
      { label: 'Messages', href: '/owner-portal/messages' },
      { label: 'Voting', href: '/owner-portal/voting' },
    ],
  },
  { label: 'Notifications', href: '/notifications', icon: <BellIcon className="h-5 w-5" /> },
  { label: 'Settings', href: '/notifications/preferences', icon: <Cog6ToothIcon className="h-5 w-5" /> },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const location = useLocation();

  return (
    <aside
      className={cn(
        'flex h-full flex-col bg-brand-600 transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-brand-700">
        {!sidebarCollapsed && (
          <span className="text-lg font-bold text-white tracking-tight">Nuestable</span>
        )}
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-1.5 text-brand-200 hover:bg-brand-700 hover:text-white transition-colors min-h-touch min-w-touch flex items-center justify-center"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronDoubleRightIcon className="h-5 w-5" />
          ) : (
            <ChevronDoubleLeftIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
          const isParentActive = item.children?.some(
            (child) => location.pathname === child.href || location.pathname.startsWith(child.href + '/'),
          );

          return (
            <div key={item.label}>
              <NavLink
                to={item.href}
                className={cn(
                  'sidebar-link',
                  (isActive || isParentActive) && 'sidebar-link-active',
                  sidebarCollapsed && 'justify-center px-0',
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!sidebarCollapsed && <span>{item.label}</span>}
              </NavLink>

              {/* Sub-navigation */}
              {!sidebarCollapsed && item.children && (isActive || isParentActive) && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <NavLink
                      key={child.href}
                      to={child.href}
                      className={({ isActive: childActive }) =>
                        cn(
                          'block rounded-lg px-3 py-2 text-xs font-medium transition-colors min-h-[36px] flex items-center',
                          childActive
                            ? 'text-white bg-brand-700'
                            : 'text-brand-200 hover:text-white hover:bg-brand-700/50',
                        )
                      }
                    >
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
