
"use client";
import React, { useState, useEffect } from 'react';
import { FiShield, FiLock } from "react-icons/fi";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { MdOutlineEmail } from "react-icons/md";
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { data: session, status } = useSession();
    const path = usePathname();
    const [showForgot, setShowForgot] = useState(false);

    useEffect(() => {
        if (session) {
            router.push("/dashboard");
        }
    }, [session, router]);

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

    const handleLogin = async (e) => {
        e.preventDefault();

        // ✅ Check empty inputs
        if (!email.trim() || !password.trim()) {
            toast.error("Please fill all fields");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        setIsLoading(true);
        setShowForgot(false);

        try {
            const result = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });

            if (result.error) {
                toast.error("Invalid email or password");
                setShowForgot(true);
            } else {
                setTimeout(() => router.push("/dashboard"), 1500);
            }
        } catch (err) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-primary-gradient px-4">
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
            <div className="w-full max-w-md space-y-6 mt-24 lg:mt-20">
                <Link href={"/"} className="flex items-center space-x-2 text-gray-300 text-sm cursor-pointer hover:bg-[#232323] px-3 py-2 rounded-lg w-40">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="25" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"></path><path d="M12 19l-7-7 7-7"></path></svg>
                    <span>Back to Home</span>
                </Link>

                <div className=" text-white rounded shadow-lg ">
                    <div className="flex justify-center p-1">
                        {/* pill container */}
                        <div className="inline-flex bg-[#0f0f0f] rounded-full p-1 shadow-inner">
                            <Link
                                href="/login"
                                className={`px-8 py-2 text-sm rounded-full min-w-[120px] flex items-center justify-center transition-colors ${path === "/login" ? "bg-[#1a1a1c] text-white"
                                    : "text-gray-400 hover:text-gray-200"
                                    }`}>
                                Login
                            </Link>

                            <Link
                                href="/register"
                                className={`px-8 py-2 text-sm rounded-full min-w-[120px] flex items-center justify-center transition-colors ${path === "/register" ? "bg-[#0b0b0c] text-white"
                                    : "text-gray-400 hover:text-gray-200"
                                    }`}>
                                Register
                            </Link>
                        </div>
                    </div>
                </div>


                <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-button-gradient text-white font-bold text-xl">
                        <FiShield className='text-white text-3xl' />
                    </div>
                    <h1 className="text-white text-2xl font-bold">Welcome Back</h1>
                    <p className="text-gray-400 text-sm">Access your password vault</p>
                </div>

                <div className="bg-[#18181A] rounded-xl p-6 space-y-5 shadow-lg border border-[#222]">
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <div>
                        <h2 className='text-lg text-white flex justify-center'>Sign in</h2>
                        <p className='text-gray-400 text-sm flex justify-center'>Enter your credentials to access your vault</p>
                        <label className="block text-sm font-medium text-white mt-7 mb-2">
                            Email
                        </label>

                        <div className="relative w-full">
                            <MdOutlineEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                            <input
                                required
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="w-full bg-[#1d1d1f] rounded-lg border border-[#333] pl-10 pr-3 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            Master Password
                        </label>

                        <div className="relative">
                            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />

                            <input
                                required
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your master password"
                                className="w-full bg-[#1d1d1f] rounded-lg border border-[#333] pl-10 pr-10 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]" />

                            <span
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-200">
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>

                    </div>
                    {showForgot && (
                        <div className="text-center mt-2">
                            <a
                                href="/forgot-password"
                                className="text-sm text-indigo-600 hover:text-indigo-800 transition"
                            >
                                Forgot your password?
                            </a>
                        </div>
                    )}


                    <button
                        onClick={handleLogin}
                        disabled={isLoading}
                        className="w-full bg-button-gradient text-white py-3 rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-70">
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </button>
                    <p className="text-center text-sm text-gray-400">
                        Don&apos;t have an account?{" "}
                        <Link href="/register" className="text-[#6C5CE7] hover:underline">
                            Create account
                        </Link>
                    </p>

                </div>
            </div>
        </div>
    );
};

export default Login;
