import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Fizjo App - przypomnienia o cwiczeniach dla fizjoterapii",
    template: "%s | Fizjo App",
  },
  description:
    "Aplikacja dla fizjoterapeutow do wysylania pacjentom przypomnien o cwiczeniach. Wiecej regularnosci, lepsza wspolpraca i szybszy powrot do zdrowia.",
  keywords: [
    "fizjoterapia",
    "przypomnienia o cwiczeniach",
    "pacjent",
    "fizjoterapeuta",
    "rehabilitacja",
  ],
  openGraph: {
    title: "Fizjo App",
    description:
      "Wysylaj pacjentom przypomnienia o cwiczeniach i zwiekszaj skutecznosc terapii.",
    type: "website",
    locale: "pl_PL",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fizjo App",
    description:
      "Przypomnienia o cwiczeniach dla pacjentow, lepsza regularnosc i lepsze efekty fizjoterapii.",
  },
};

export const viewport: Viewport = {
  themeColor: "#f4f7fb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <a href="#main-content" className="skip-link">
          Skip to Main Content
        </a>
        {children}
      </body>
    </html>
  );
}
