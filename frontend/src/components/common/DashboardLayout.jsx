import Logo from './Logo';
import { useAuth } from '../../context/AuthContext';
import { NavLink, useLocation } from 'react-router-dom';

const navByRole = {
  buyer: [
    { label: 'Browse', href: '/buyer/dashboard' },
    { label: 'My orders', href: '/buyer/orders' },
    { label: 'Profile', href: '/profile' },
  ],
  shipper: [
    { label: 'Overview', href: '/shipper/dashboard' },
    { label: 'Products', href: '/shipper/products' },
    { label: 'Shipments', href: '/shipper/shipments' },
    { label: 'Orders received', href: '/shipper/orders' },
    { label: 'Subscription', href: '/shipper/subscription' },
    { label: 'Profile', href: '/profile' },
  ],
  driver: [
    { label: 'Overview', href: '/driver/dashboard' },
    { label: 'Available loads', href: '/driver/loads' },
    { label: 'Trip history', href: '/driver/trips' },
    { label: 'Wallet', href: '/driver/wallet' },
    { label: 'Documents', href: '/driver/documents' },
  ],
  admin: [
    { label: 'Overview', href: '/admin/dashboard' },
    { label: 'Shipment requests', href: '/admin/shipments' },
    { label: 'Driver verification', href: '/admin/drivers' },
    { label: 'Complaints', href: '/admin/complaints' },
    { label: 'Reports', href: '/admin/reports' },
  ],
};

const DashboardLayout = ({ title, subtitle, children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const nav = navByRole[user?.role] || [];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-primary/10 bg-secondary/20 px-5 py-8 md:block">
        <a href="/" className="block transition hover:opacity-80">
          <Logo />
        </a>
        <nav className="mt-10 space-y-1">
          {nav.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition ${
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-[#5B7A70] hover:bg-secondary/30 hover:text-primary'
                  }`
                }
              >
                {/* 🚀 FIXED: Changed 'active' to 'isActive' right here */}
                {isActive && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                {item.label.toUpperCase()}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-primary/10 px-6 py-5 md:px-10">
          <div>
            <h1 className="font-display text-xl font-bold text-primary">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-[#5B7A70]">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono-ls text-[11px] text-[#5B7A70]">
              {user?.name?.toUpperCase()} · {user?.role?.toUpperCase()}
            </span>
            <button
              onClick={logout}
              className="rounded-lg border border-primary/15 px-3 py-1.5 text-xs text-primary/70 transition hover:border-danger/50 hover:text-danger"
            >
              Log out
            </button>
          </div>
        </header>
        <main className="px-6 py-8 md:px-10">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;