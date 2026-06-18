import { Link, useLocation } from "react-router";
import { useAuth } from "~/modules/authentication/use-authentication";
import { useConfigurables } from "~/modules/configurables/src/hooks/use-configurables";

type IconProps = { active: boolean };
type IconFn = (props: IconProps) => React.ReactElement;

interface NavItem {
  path: string;
  label: string;
  icon: IconFn;
  adminOnly?: boolean;
}

function CalendarIcon({ active }: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="17" rx="3" stroke={active ? "#C1440E" : "#6B6560"} strokeWidth="1.8" />
      <path d="M16 2v4M8 2v4M3 10h18" stroke={active ? "#C1440E" : "#6B6560"} strokeWidth="1.8" strokeLinecap="round" />
      {active && <circle cx="8" cy="15" r="1.5" fill="#C1440E" />}
      {active && <circle cx="12" cy="15" r="1.5" fill="#C1440E" />}
    </svg>
  );
}

function UsersIcon({ active }: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="8" r="3.5" stroke={active ? "#C1440E" : "#6B6560"} strokeWidth="1.8" />
      <path d="M2 20c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke={active ? "#C1440E" : "#6B6560"} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 6c2.21 0 4 1.567 4 3.5S18.21 13 16 13" stroke={active ? "#C1440E" : "#6B6560"} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M20 20c0-2.314-1.686-4.26-4-4.899" stroke={active ? "#C1440E" : "#6B6560"} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function HomeIcon({ active }: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M3 12L12 4l9 8" stroke={active ? "#C1440E" : "#6B6560"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v9a1 1 0 001 1h4v-4h4v4h4a1 1 0 001-1v-9" stroke={active ? "#C1440E" : "#6B6560"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProfileIcon({ active }: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke={active ? "#C1440E" : "#6B6560"} strokeWidth="1.8" />
      <path d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6" stroke={active ? "#C1440E" : "#6B6560"} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const { config, loading } = useConfigurables();

  const primaryColor = loading ? "#C1440E" : (config?.brandColor?.primary ?? "#C1440E");

  const navItems: NavItem[] = [
    { path: "/", label: "Home", icon: HomeIcon },
    { path: "/schedule", label: "Schedule", icon: CalendarIcon },
    ...(isAdmin ? [{ path: "/team", label: "Team", icon: UsersIcon, adminOnly: true }] : []),
    { path: "/profile", label: "Profile", icon: ProfileIcon },
  ];

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#FAF7F2" }}>
      {/* Content area with bottom padding for nav */}
      <main className="flex-1 pb-20 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-[#E8E2DA] flex items-center z-50"
        style={{ boxShadow: "0 -1px 0 #E8E2DA" }}
      >
        {navItems.map((item) => {
          const isActive =
            item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex-1 flex flex-col items-center gap-0.5 py-3 transition-colors"
            >
              <Icon active={isActive} />
              <span
                className="text-[11px] font-medium"
                style={{ color: isActive ? primaryColor : "#6B6560" }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
