import type { Metadata } from "next";
import { Borel } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SITE_URL } from "@/lib/constants";
import "./globals.css";

const borel = Borel({ weight: "400", subsets: ["latin"], variable: "--font-borel" });

const title = "Sense - Your Wallet's Missing Half";
const description =
  "Gift cards, memberships, loyalty programs, and passes - everything with a barcode, scanned once and one tap away. Sense keeps it all in one place on iOS.";
const alternateName = ["Sense Wallet", "Sense Financial"];

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: title,
    template: "%s | Sense",
  },
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title,
    description,
    url: SITE_URL,
    siteName: "Sense",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

const organization = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "Makes Sense LLC",
  url: SITE_URL,
  logo: `${SITE_URL}/icon.png`,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    organization,
    {
      "@type": "WebSite",
      name: "Sense",
      alternateName,
      url: SITE_URL,
      publisher: { "@id": organization["@id"] },
    },
    {
      "@type": "SoftwareApplication",
      name: "Sense",
      alternateName,
      operatingSystem: "iOS",
      applicationCategory: "UtilitiesApplication",
      description,
      url: SITE_URL,
      publisher: { "@id": organization["@id"] },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${borel.variable} h-full antialiased`} data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
