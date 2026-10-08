import { useEffect, useRef, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { useI18n, type TKey } from "@/i18n";

const NAV: { to: string; key: TKey }[] = [
  { to: "/", key: "nav.home" },
  { to: "/quiz", key: "nav.quiz" },
  { to: "/projects", key: "nav.projects" },
  { to: "/plan", key: "nav.plan" },
  { to: "/mentor", key: "nav.mentor" },
  { to: "/recursos", key: "nav.resources" },
];

export function Logo() {
  return (
    <Link to="/" className="font-mono2 text-sm font-bold tracking-tight no-underline">
      <span style={{ color: "var(--btc)" }}>21</span>
      <span style={{ color: "var(--paper)" }}>weeks</span>
      <span className="text-[10px] font-medium tracking-[0.2em] uppercase ml-2 opacity-60">
        bitcoin oss
      </span>
    </Link>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const { locale, setLocale, t } = useI18n();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--ink)" }}>
      <header className="fixed top-0 inset-x-0 z-50">
        <div
          className="mx-auto max-w-6xl flex items-center justify-between gap-4 px-5 py-3"
          style={{
            background: "rgba(246, 245, 240, 0.85)",
            backdropFilter: "blur(14px)",
            borderBottom: "1px solid var(--hairline)",
          }}
        >
          <Logo />
          <nav
            className="hidden md:flex items-center gap-1 rounded-full p-1"
            style={{ border: "1px solid var(--hairline)" }}
          >
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `font-mono2 text-[11px] uppercase tracking-[0.08em] px-3.5 py-1.5 rounded-full transition-colors no-underline ${
                    isActive ? "text-[--paper]" : "opacity-60 hover:opacity-100"
                  }`
                }
                style={({ isActive }) =>
                  isActive ? { background: "var(--ember)", color: "#ffffff" } : { color: "var(--paper)" }
                }
              >
                {t(item.key)}
              </NavLink>
            ))}
          </nav>
          <button
            onClick={() => setLocale(locale === "es" ? "en" : "es")}
            className="font-mono2 text-[11px] uppercase tracking-[0.1em] rounded-full px-3 py-1.5 cursor-pointer"
            style={{ border: "1px solid var(--hairline)", color: "var(--paper)" }}
          >
            {locale === "es" ? "EN" : "ES"}
          </button>
        </div>
      </header>

      {/* nav móvil */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-50 flex justify-around py-2"
        style={{
          background: "rgba(246, 245, 240, 0.94)",
          backdropFilter: "blur(14px)",
          borderTop: "1px solid var(--hairline)",
        }}
      >
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className="font-mono2 text-[9px] uppercase tracking-[0.06em] no-underline"
            style={({ isActive }) => ({
              color: isActive ? "var(--ember)" : "rgba(23,29,54,0.55)",
            })}
          >
            {t(item.key)}
          </NavLink>
        ))}
      </nav>

      <main className="flex-1 pt-[57px] pb-16 md:pb-0">{children}</main>

      <footer
        className="hidden md:block py-8 text-center"
        style={{ borderTop: "1px solid var(--hairline)" }}
      >
        <p className="font-mono2 text-[11px] opacity-50">{t("footer")}</p>
      </footer>
    </div>
  );
}

/** Reveal on scroll */
export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setTimeout(() => e.target.classList.add("is-visible"), delay);
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return (
    <div ref={ref} className="reveal">
      {children}
    </div>
  );
}
