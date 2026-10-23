import { Nav, NavProvider } from "@/components/Nav";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <NavProvider>
      <Nav />
      {children}
    </NavProvider>
  );
}
