import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";
import SessionWrapper from "./SessionWrapper";


const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SecurePassVault - Your Trusted Password Manager",
  description: "SecurePassVault is a reliable and user-friendly password manager that helps you store, manage, and protect your passwords with top-notch security features.",
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionWrapper>
          <Navbar />
          {children}
          <Footer />
        </SessionWrapper>
      </body>
    </html>

  );
}
