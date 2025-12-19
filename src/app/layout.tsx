import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import ThemeRegistry from "@/components/ThemeRegistry/ThemeRegistry";
import { AuthProvider } from "@/context/AuthContext";
import { ColorModeProvider } from "@/context/ThemeContext";
import { DataProvider } from "@/context/DataContext";
import AppShell from "@/components/AppShell";

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
                <AppShell>
                  {children}
                </AppShell>
              </DataProvider>
            </ColorModeProvider>
          </ThemeRegistry>
        </AuthProvider>
      </body>
    </html>
  );
}
