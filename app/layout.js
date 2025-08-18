import { Outfit } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider
} from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from '@vercel/analytics/next';

const outfit = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "PennyPilot",
  description: "Your all-in-one expense tracker and analysis assistant",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={outfit.className}>
          <Toaster/>
          {children}
          <Analytics />
          </body>
      </html>
    </ClerkProvider>
  );
}
