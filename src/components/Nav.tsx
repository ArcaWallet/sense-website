"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_STORE_URL } from "@/lib/constants";

const links = [
  { href: "#system", label: "Why Sense" },
  { href: "#product", label: "Product" },
  { href: "#plans", label: "Plans" },
];

// Lets page content that the pathname can't identify (e.g. a 404 rendered at a
// blog post URL) tell the layout's Nav that the top of the page is dark.
const DarkTopContext = createContext<{
  forced: boolean;
  setForced: (forced: boolean) => void;
} | null>(null);

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [forced, setForced] = useState(false);
  return (
    <DarkTopContext.Provider value={{ forced, setForced }}>{children}</DarkTopContext.Provider>
  );
}

export function ForceNavDarkTop() {
  const setForced = useContext(DarkTopContext)?.setForced;
  useEffect(() => {
    setForced?.(true);
    return () => setForced?.(false);
  }, [setForced]);
  return null;
}

export function Nav({ darkTop = false }: { darkTop?: boolean }) {
  const forcedDarkTop = useContext(DarkTopContext)?.forced ?? false;
  const pathname = usePathname();
  const onHomepage = pathname === "/";
  const onBlogIndex = pathname === "/blog";
  const onBlog = pathname.startsWith("/blog");
  const [solid, setSolid] = useState(false);
  const [activeHref, setActiveHref] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!onHomepage) {
      setActiveHref("");
      return;
    }

    const sections = links
      .map((link) => document.querySelector(link.href))
      .filter((el): el is Element => el !== null);
    if (sections.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveHref(`#${entry.target.id}`);
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    sections.forEach((section) => io.observe(section));
    return () => io.disconnect();
  }, [onHomepage]);

  const showSolid = solid || menuOpen;
  // The homepage and the blog index both have a dark section at the very
  // top (Hero, and the blog's textured header band) — text/icons stay bone
  // there. Every other page (like an individual blog post) starts on a
  // light background, so text needs to read dark before the solid backdrop
  // kicks in. The 404 page opts in via `darkTop` or ForceNavDarkTop.
  const hasDarkTop = darkTop || forcedDarkTop || onHomepage || onBlogIndex;
  const useDarkText = !showSolid && !hasDarkTop;
  const linkColorClass = (active: boolean) =>
    useDarkText
      ? active
        ? "text-ink"
        : "text-ink/55"
      : active
        ? "text-bone"
        : "text-bone/65";
  const linkHoverClass = useDarkText ? "hover:text-ink" : "hover:text-bone";

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 border-b px-[5vw] py-[18px] transition-[background-color,backdrop-filter,border-color] duration-[.35s] ${
        showSolid
          ? "border-bone/12 bg-ink/72 backdrop-blur-[14px] backdrop-saturate-[1.6]"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="flex items-center justify-between">
        <a
          href={onHomepage ? "#top" : "/#top"}
          className="flex items-center gap-[11px] text-inherit no-underline"
        >
          <Image
            src="/assets/sense-logo.png"
            alt="Sense"
            width={52}
            height={52}
            className="block h-[40px] w-[40px] md:h-[52px] md:w-[52px]"
          />
          <span
            className={`relative top-[0.27em] font-brand text-[20px] leading-none md:text-[22px] ${
              useDarkText ? "text-ink" : "text-bone"
            }`}
          >
            sense
          </span>
        </a>

        <div className="hidden items-center gap-[28px] text-[13.5px] font-semibold md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={onHomepage ? link.href : `/${link.href}`}
              className={`no-underline transition-colors ${linkHoverClass} ${linkColorClass(
                activeHref === link.href
              )}`}
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/blog"
            className={`no-underline transition-colors ${linkHoverClass} ${linkColorClass(onBlog)}`}
          >
            Blog
          </Link>
          <a
            href={APP_STORE_URL}
            className="rounded-full bg-flame px-[20px] py-[11px] font-bold text-white no-underline transition-colors hover:bg-bone hover:text-ink"
          >
            Pre-order
          </a>
        </div>

        <div className="flex items-center gap-[14px] md:hidden">
          <a
            href={APP_STORE_URL}
            className="rounded-full bg-flame px-[16px] py-[9px] text-[13px] font-bold text-white no-underline transition-colors hover:bg-bone hover:text-ink"
          >
            Pre-order
          </a>
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className={`flex h-[32px] w-[32px] flex-none items-center justify-center rounded-full ${
              useDarkText ? "text-ink" : "text-bone"
            }`}
          >
            {menuOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M5 5l14 14M19 5L5 19" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mt-[18px] flex flex-col gap-[18px] pb-[6px] text-[15px] font-semibold md:hidden">
          {links.map((link) => (
            <a
              key={link.href}
              href={onHomepage ? link.href : `/${link.href}`}
              onClick={() => setMenuOpen(false)}
              className={`no-underline transition-colors hover:text-bone ${
                activeHref === link.href ? "text-bone" : "text-bone/65"
              }`}
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/blog"
            onClick={() => setMenuOpen(false)}
            className={`no-underline transition-colors hover:text-bone ${
              onBlog ? "text-bone" : "text-bone/65"
            }`}
          >
            Blog
          </Link>
        </div>
      )}
    </nav>
  );
}
