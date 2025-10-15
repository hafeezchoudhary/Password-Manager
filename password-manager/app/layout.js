import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";
import SessionWrapper from "./SessionWrapper";


const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "CipherLock",
  description: "CipherLock is a secure place to store your secrets",
  icons: {
    icon: [
      { url: "/favicon.ico", 
       href: "/favicon.png" },
    ],
  },
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>CipherLock</title>
        <link rel="icon" href="/favicon.ico" />
      </head>
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
