import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { NotificationsProvider } from "./components/NotificationsProvider";

export const metadata: Metadata = {
  title: "mercari — buy and sell anything",
  description: "A marketplace to buy and sell pre-loved items.",
};

const themeInitScript = `
  (function() {
    try {
      var stored = localStorage.getItem('theme');
      var theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <ThemeProvider>
          <NotificationsProvider>{children}</NotificationsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
