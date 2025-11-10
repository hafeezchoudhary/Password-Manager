"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FiShield } from "react-icons/fi";
import { MdLockOutline } from "react-icons/md";
import { BsPersonFillAdd } from "react-icons/bs";
import { LuKey } from "react-icons/lu";
import { RxLightningBolt } from "react-icons/rx";
import { useSession } from 'next-auth/react';
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status !== 'loading') {
      setIsLoading(false);
    }
  }, [status]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-primary-gradient flex items-center justify-center px-4">
        <div className="  rounded-2xl  p-8 w-full max-w-sm text-center">
          <div className="flex justify-center">
            <div className="w-10 h-10 border-4 border-[#6C5CE7] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="bg-primary-gradient min-h-screen text-center px-4 py-16 md:py-24">
        <ToastContainer
          position="top-right"
          autoClose={2000}
          hideProgressBar={true}
          newestOnTop={false}
          closeOnClick
          draggable
          theme="dark" />
        {/* Icon */}
        <div className="flex justify-center items-center space-x-3 mt-10">
          <div className="w-16 h-16 bg-button-gradient rounded-2xl flex items-center justify-center">
            <FiShield className='text-white text-5xl' />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl mt-5 md:text-6xl font-extrabold text-white leading-tight">
          Your Digital <br />
          <span className="text-transparent bg-clip-text bg-[#3b82f6]">
            Security Vault
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 max-w-2xl mx-auto text-gray-400 text-base md:text-lg">
          Secure, organize, and access all your passwords from anywhere.
          Military-grade encryption keeps your digital life protected.
        </p>

        {/* Buttons */}
        <div className="mt-8 flex justify-center gap-4 flex-wrap">
          <Link href={"/register"}
            className="px-6 py-3 rounded-lg text-white text-sm font-semibold bg-button-gradient">
            Get Started Free
          </Link>
          <Link href={"/login"}
            className="px-10 py-3 rounded-lg font-semibold text-sm text-white border border-[#2a2a2a] hover:bg-[#232323]">
            Sign In
          </Link>
        </div>

        <section className=" text-white py-16 px-6 mt-16">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Why Choose SecurePass Vault?
            </h2>
            <p className="text-gray-400 mb-12 max-w-2xl mx-auto">
              Built with security first, designed for simplicity. Your passwords
              deserve the best protection.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="bg-[#191818] max-w-4xl p-8 rounded-xl">
                <div className="flex justify-center mb-6">
                  <div className="bg-button-gradient w-12 h-12 rounded-lg flex items-center justify-center text-white text-3xl font-bold">
                    <MdLockOutline />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Military-Grade Encryption</h3>
                <p className="text-gray-400 text-sm">
                  AES-256 encryption ensures your passwords are protected with the
                  same security used by governments
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-[#191818] p-8 rounded-xl">
                <div className="flex justify-center mb-6">
                  <div className="bg-button-gradient w-12 h-12 rounded-lg flex items-center justify-center text-white text-3xl font-bold">
                    <LuKey />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Zero-Knowledge Architecture
                </h3>
                <p className="text-gray-400 text-sm">
                  We can&apos;t see your passwords even if we wanted to. Your master
                  password is the only key to your vault
                </p>

              </div>

              {/* Card 3 */}
              <div className="bg-[#191818] p-8 rounded-xl">
                <div className="flex justify-center mb-6">
                  <div className="bg-button-gradient w-12 h-12 rounded-lg flex items-center justify-center text-white text-3xl font-bold">
                    <RxLightningBolt />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Instant Access</h3>
                <p className="text-gray-400 text-sm">
                  Access your passwords instantly across all devices with seamless
                  synchronization and offline access
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className=" text-white py-16 px-6">
          <div className="max-w-6xl mx-auto">
            {/* Top Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 text-center mb-16">
              <div>
                <h3 className="text-2xl font-bold text-[#8b5cf6]">256-bit</h3>
                <p className="text-gray-400">Encryption Standard</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#8b5cf6]">1M+</h3>
                <p className="text-gray-400">Passwords Protected</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#8b5cf6]">99.9%</h3>
                <p className="text-gray-400">Uptime Guarantee</p>
              </div>
            </div>

            {/* CTA Box */}
            <div className="bg-[#191818] p-10 rounded-xl text-center border border-transparent transition-colors max-w-3xl mx-auto">
              <h2 className="text-xl font-semibold mb-3">
                Ready to Secure Your Digital Life?
              </h2>
              <p className="text-gray-400">
                Join thousands of users who trust SecurePass Vault to protect their most important passwords.
              </p>


              {/* Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                {/* Create Account Button */}
                <Link href="/register" className="flex items-center justify-center gap-2 bg-button-gradient px-4 py-3 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition hover:cursor-pointer">
                  <BsPersonFillAdd />
                  Create Free Account
                </Link>

              </div>
            </div>
          </div>
        </section>
      </section>
    </>
  );
}
