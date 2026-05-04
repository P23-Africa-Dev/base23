import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  style: ["normal"],
});

export const metadata: Metadata = {
  title: "NOEL",
  description: "Business Referral Network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`min-h-full flex flex-col ${montserrat.className}`}>
        <AuthProvider>
          <Suspense fallback={null}>{children}</Suspense>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: { background: "#333", color: "#fff" },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
