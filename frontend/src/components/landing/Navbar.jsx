import Logo from '../common/Logo';

const Navbar = () => {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-primary/10 bg-background/80 px-6 py-4 backdrop-blur md:px-16">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <a href="/" className="transition hover:opacity-80">
          <Logo />
        </a>
        <nav className="hidden gap-8 font-mono-ls text-[13px] text-muted md:flex">
          <a href="/about" className="relative py-1 transition hover:text-primary">ABOUT</a>
          <a href="/pricing" className="relative py-1 transition hover:text-primary">PRICING</a>
          <a href="/contact" className="relative py-1 transition hover:text-primary">CONTACT</a>
        </nav>
        <div className="flex items-center gap-3">
          <a href="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-primary/70 transition hover:text-primary">
            Log in
          </a>
          <a href="/signup" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-primary shadow-sm transition hover:shadow-glow">
            Sign up
          </a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;