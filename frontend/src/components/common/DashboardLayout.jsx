import Logo from './Logo';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { NavLink, Link } from 'react-router-dom';

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
  const nav = navByRole[user?.role] || [];
  // Cart is only meaningful for buyers; useCart is safe to call here since
  // CartProvider wraps the whole app, but the icon itself only renders for buyers.
  const { totalItems } = useCart();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-primary/10 bg-secondary/20 px-5 py-8 md:block">
        <a href="/" className="block transition hover:opacity-80">
          <Logo />
        </a>
        <nav className="mt-10 space-y-1">
          {nav.map((item) => {
            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive: active }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 font-mono-ls text-[12px] tracking-wide transition ${
                    active ? 'bg-primary text-white shadow-sm' : 'text-muted hover:bg-primary/5 hover:text-primary'
                  }`
                }
              >
                {({ isActive: active }) => (
                  <>
                    {active && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                    {item.label.toUpperCase()}
                  </>
                )}
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
            {user?.role === 'buyer' && (
              <Link to="/buyer/checkout" className="relative rounded-lg p-2 text-primary/70 transition hover:bg-primary/5 hover:text-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent font-mono-ls text-[9px] font-bold text-primary">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}
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