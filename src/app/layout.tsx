import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import ThemeRegistry from "@/frontend/components/ThemeRegistry/ThemeRegistry";
import { AuthProvider } from "@/frontend/context/AuthContext";
import { ColorModeProvider } from "@/frontend/context/ThemeContext";
import { DataProvider } from "@/frontend/context/DataContext";
import AppShell from "@/frontend/components/AppShell";
import { TimerProvider } from "@/frontend/context/TimerContext";

const heebo = Heebo({ subsets: ["hebrew", "latin"] });

export const metadata: Metadata = {
  title: "Freelance Tracker",
  description: "Track your projects and time efficiently",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body className={heebo.className}>
        <AuthProvider>
          <ThemeRegistry>
            <ColorModeProvider>
              <DataProvider>
                <TimerProvider>
                  <AppShell>
                    {children}
                  </AppShell>
                </TimerProvider>
              </DataProvider>
            </ColorModeProvider>
          </ThemeRegistry>
        </AuthProvider>
      </body>
    </html>
  );
}
