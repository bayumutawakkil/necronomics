import type { Metadata } from "next";
import { Cinzel, Crimson_Pro } from "next/font/google";
import { Toast } from "@/components/ui/Toast";
import "./globals.css";

const cinzel = Cinzel({ 
  subsets: ["latin"], 
  variable: '--font-cinzel',
  display: 'swap',
});

const crimsonPro = Crimson_Pro({ 
  subsets: ["latin"],
  variable: '--font-crimson',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Necroconomics — The Dead Economy",
  description: "A dark-absurdist idle colony management simulation where death powers your economy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cinzel.variable} ${crimsonPro.variable}`}>
      <body className="bg-[#0a070f]">
        {children}
        <Toast />
      </body>
    </html>
  );
}
