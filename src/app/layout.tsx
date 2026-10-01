import type { Metadata, Viewport } from "next";
import "@fontsource-variable/nunito-sans/standard.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dialoghi con Annibale",
  description: "Una conversazione storica e responsabile con Annibale Barca, generale cartaginese.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#10151B",
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
