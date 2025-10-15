'use client'; 
import React, { useState, useEffect } from 'react';
import { FiShield } from "react-icons/fi";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { FiUser } from "react-icons/fi";
import { GoLock } from "react-icons/go";
import { MdMailOutline } from "react-icons/md";
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showMasterPassword, setShowMasterPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { status } = useSession();
  const path = usePathname();

  useEffect(() => {
    if (status !== 'loading') setIsLoading(false);
  }, [status]);

  useEffect(() => {
    if (status === 'authenticated') router.push('/dashboard');
  }, [status, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password
        })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('OTP sent successfully!');
        setTimeout(() => {
          router.push(`/OTP?email=${encodeURIComponent(form.email)}`);
        }, 1000);
      } else if (data.error && data.error.toLowerCase().includes('exists')) {
        toast.warning('User already exists');
      } else {
        toast.error(data.error || data.message || 'Failed to send OTP');
      }
    } catch {
      toast.error('Something went wrong while sending OTP');
    } finally {
      setIsLoading(false);
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
    <div className="min-h-screen bg-primary-gradient flex flex-col items-center justify-center p-4">
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={true}
        theme="dark"
        style={{
          top: '1rem',
          right: '1rem',
          width: 'auto',
          zIndex: 9999,
        }}
      />
      {/* Back to Home */}
      <div className='w-full max-w-md space-y-6 mt-5'>
        <Link href={"/"} className="flex justify-center items-center space-x-2 text-gray-300 text-sm cursor-pointer hover:bg-[#232323] px-3 py-2 rounded-lg w-40 mt-16">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="25" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5"></path>
            <path d="M12 19l-7-7 7-7"></path>
          </svg>
          <span>Back to Home</span>
        </Link>
      </div>

      <div className=" text-white rounded shadow-lg ">
        <div className="flex justify-center p-1">
          <div className="inline-flex bg-[#0f0f0f] rounded-full p-1 shadow-inner">
            <Link
              href="/login"
              className={`px-8 py-2 text-sm rounded-full min-w-[120px] flex items-center justify-center transition-colors ${path === "/login"
                ? "bg-[#1a1a1c] text-white"
                : "text-gray-400 hover:text-gray-200"
                }`}>
              Login
            </Link>

            <Link
              href="/register"
              className={`px-8 py-2 text-sm rounded-full min-w-[120px] flex items-center justify-center transition-colors ${path === "/register"
                ? "bg-[#1a1a1c] text-white"
                : "text-gray-400 hover:text-gray-200"
                }`}>
              Register
            </Link>
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center space-x-3 mt-10">
        <div className="w-16 h-16 bg-button-gradient rounded-2xl flex items-center justify-center">
          <span className="text-white">
            <FiShield className='text-white text-5xl' />
          </span>
        </div>
      </div>

      <h1 className="text-white font-bold text-2xl">Create Account</h1>
      <p className="text-gray-400 text-sm mb-8">Start securing your passwords today</p>

      <form
        onSubmit={handleSendOtp}
        className="bg-[#1a1a1d] rounded-xl p-6 w-full max-w-md shadow-lg">
        {/* Full Name */}
        <div className="mb-4 relative">
          <label className="block text-sm text-white mb-1">Full Name</label>
          <FiUser className="absolute mt-3 left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            required
            name="name"
            type="text"
            placeholder="Enter your full name"
            value={form.name}
            onChange={handleChange}
            className="w-full bg-[#1d1d1f] rounded-lg border border-[#333] pl-10 pr-3 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]" />
        </div>

        {/* Email */}
        <label className="text-sm text-white">Email</label>
        <div className="relative mb-2">
          <MdMailOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            required
            name="email"
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            className="w-full bg-[#1d1d1f] rounded-lg border border-[#333] pl-10 pr-3 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]" />
        </div>

        {/* Password */}
        <label className="text-sm text-white">Master Password</label>
        <div className="relative mb-2">
          <GoLock className="absolute left-3 top-4 text-gray-400" />
          <input
            required
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a strong master password"
            value={form.password}
            onChange={handleChange}
            className="w-full bg-[#1d1d1f] rounded-lg border border-[#333] pl-10 pr-3 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]" />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-4  text-gray-400 cursor-pointer">
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        {/* Confirm Password */}
        <label className="text-sm text-white">Confirm Password</label>
        <div className="relative mb-2">
          <GoLock className="absolute left-3 top-4 text-gray-400" />
          <input
            required
            name="confirmPassword"
            type={showMasterPassword ? 'text' : 'password'}
            placeholder="Confirm your master password"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full bg-[#1d1d1f] rounded-lg border border-[#333] pl-10 pr-3 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]" />
          <span
            onClick={() => setShowMasterPassword(!showMasterPassword)}
            className="absolute right-3 top-4 text-gray-400 cursor-pointer">
            {showMasterPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        {/* Terms */}
        <label className="flex items-center space-x-2 mb-4">
          <input required type="checkbox" className="accent-[#6c63ff] w-3 h-3 rounded-full" />
          <span className="text-gray-400 text-sm">
            I agree to the<Link href="/login" className="text-primary hover:underline"> Terms of Service</Link> and<Link href="/login" className="text-primary hover:underline"> Privacy Policy</Link>
          </span>
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-button-gradient  text-white text-sm py-3 rounded-xl font-semibold hover:opacity-90 transition duration-200">
          {isLoading ? 'Sending OTP...' : 'Create Account'}
        </button>
        <div className='text-gray-400 text-center mt-4 text-sm'>
          Already have an account?<Link href="/login" className="text-primary hover:underline"> Sign In
          </Link>
        </div>
      </form>

      <div className="bg-[#19181c] text-sm rounded-xl mt-5 p-6 w-full max-w-md shadow-lg flex flex-col items-center text-center">
        <h3 className="text-primary text-base font-semibold mb-2">Security Notice</h3>
        <p className="text-gray-400">
          Your master password cannot be recovered. Make sure to remember it or store it safely.
        </p>
      </div>
    </div>
  );
};

export default Register;
