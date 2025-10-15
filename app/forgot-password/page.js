"use client";
import { useState, useEffect } from 'react';
import { FiShield } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { status } = useSession();


  useEffect(() => {
    if (status !== 'loading') setIsLoading(false);
  }, [status]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Reset link sent successfully!");
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <>
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b border-gray-600 bg-[#0e0e0f]/80 backdrop-blur-sm`}>
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-36 h-8 bg-gray-700 animate-pulse rounded"></div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-20 h-8 bg-gray-700 animate-pulse rounded"></div>
            </div>
          </div>
        </nav>

        <div className="min-h-screen bg-primary-gradient flex items-center justify-center px-4">
          <div className="  rounded-2xl  p-8 w-full max-w-sm text-center">
            <div className="flex justify-center">
              <div className="w-10 h-10 border-4 border-[#6C5CE7] border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-primary-gradient flex flex-col items-center justify-center px-4">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={true}
        newestOnTop={false}
        draggable
        theme="dark"
      />

      <div className='w-full max-w-md space-y-6 mt-5'>
        <Link href={"/login"} className="flex justify-center items-center space-x-2 text-gray-300 text-sm cursor-pointer hover:bg-[#232323] px-3 py-2 rounded-lg w-40 mt-16">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="25" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5"></path>
            <path d="M12 19l-7-7 7-7"></path>
          </svg>
          <span>Back</span>
        </Link>
      </div>

      {/* Shield Icon */}
      <div className="flex justify-center items-center space-x-3 mt-10">
        <div className="w-16 h-16 bg-button-gradient rounded-2xl flex items-center justify-center">
          <FiShield className='text-white text-5xl' />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-white font-bold text-2xl mt-5 text-center">
        Forgot your password?
      </h1>
      <p className="text-gray-400 text-sm mb-8 text-center max-w-md">
        Enter your email address and we&apos;ll send you a link to reset your password.
      </p>


      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#1a1a1d] rounded-2xl p-8 w-full max-w-md shadow-lg"
      >
        <div className="mb-5 relative">
          <label className="block text-sm text-white mb-1">Email Address</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full bg-[#1d1d1f] rounded-lg border border-[#333] pl-3 pr-3 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-button-gradient text-white py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-70"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
    </div>
  );
}
