import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vocalis AI — Speak to the World in Your Own Voice",
  description: "Real-time voice translation and voice cloning powered by AI. Translate your voice to 50+ languages while preserving your unique vocal identity.",
  keywords: ["voice translation", "AI voice cloning", "speech translation", "multilingual AI"],
  openGraph: {
    title: "Vocalis AI",
    description: "Speak to the World in Your Own Voice",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-white antialiased">
        {children}
      </body>
    </html>
  );
}
