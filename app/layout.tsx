import "./globals.css";
import Header from "../components/header";
import Footer from "../components/footer";
import InviteHashRedirect from "../components/auth/invite-hash-redirect";
import { rootMetadata } from "../utils/site-metadata";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = rootMetadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.variable} min-h-screen font-sans bg-slate-950 text-slate-100`}>
        <InviteHashRedirect />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
