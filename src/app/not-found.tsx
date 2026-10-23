import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { EmptyScan } from "@/components/EmptyScan";

export const metadata: Metadata = {
  title: "Page not found",
};

// Unmatched URLs render here, outside the (site) layout, so this page brings its own Nav.
export default function NotFound() {
  return (
    <>
      <Nav darkTop />
      <EmptyScan />
    </>
  );
}
