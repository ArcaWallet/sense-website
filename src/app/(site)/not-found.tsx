import type { Metadata } from "next";
import { EmptyScan } from "@/components/EmptyScan";

export const metadata: Metadata = {
  title: "Page not found",
};

// notFound() calls inside (site) pages (e.g. a missing blog post) render here, under the layout's Nav.
export default function SiteNotFound() {
  return <EmptyScan />;
}
