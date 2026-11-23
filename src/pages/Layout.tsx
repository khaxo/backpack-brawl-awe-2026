import { Link, Outlet } from "react-router";
import { HALL_OF_FAME, ROUTES } from "../game";

export function Layout() {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4">
      <header className="flex items-center justify-between border-b-2 border-panel-edge py-4">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">
          <Link to={ROUTES.start}>
            🎒 Backpack <span className="text-gold">Brawl</span>
          </Link>
        </h1>
        {/* B7 In the header, so the hall of fame is reachable from every screen. */}
        <Link to={HALL_OF_FAME} className="rounded-md border border-gold/40 px-3 py-1.5 text-sm font-bold text-gold hover:bg-gold/10">
          🏛️ Hall of fame
        </Link>
      </header>

      <main className="flex flex-1 flex-col gap-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-panel-edge py-3 text-xs tracking-wider text-muted">
        Backpack Brawl · practical exam starter
      </footer>
    </div>
  );
}
