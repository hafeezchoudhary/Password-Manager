'use client';
export const dynamic = "force-dynamic"; 
import React, { useState, useEffect, Suspense } from 'react';
import { FiShield } from "react-icons/fi";
import { FaKey, FaCheckCircle } from "react-icons/fa";
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const OTP = () => {
  return (
    <Suspense fallback={<div className="text-white text-center mt-20">Loading...</div>}>
      <OTPContent />
    </Suspense>
  );
};

const OTPContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  // const handleResendOTP = async () => {
  //   setResendLoading(true);
  //   setMessage("");
  //   try {
  //     const res = await fetch("/api/auth/send-otp", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ email }),
  //     });

  //     const data = await res.json();
  //     if (res.ok) setMessage("New OTP sent to your email");
  //     else setMessage(data.message || "Failed to resend OTP");
  //   } catch (error) {
  //     setMessage("Something went wrong. Try again.");
  //   } finally {
  //     setResendLoading(false);
  //   }
  // };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setVerified(true);
        setMessage("Email verified successfully!");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setMessage(data.error || data.message || "Invalid or expired OTP");
      }
    } catch (error) {
      setMessage("Something went wrong. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!email) router.push("/register");
  }, [email, router]);

  return (
    <div className="min-h-screen bg-primary-gradient flex flex-col items-center justify-center p-4">
      {/* Back to Home */}
      <div className='w-full max-w-md space-y-6 mt-5'>
        <Link href={"/register"} className="flex justify-center items-center space-x-2 text-gray-300 text-sm cursor-pointer hover:bg-[#232323] px-3 py-2 rounded-lg w-40 mt-16">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="25" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5"></path>
            <path d="M12 19l-7-7 7-7"></path>
          </svg>
          <span>Back</span>
        </Link>
      </div>

      <div className="flex justify-center items-center space-x-3 mt-10">
        <div className="w-16 h-16 bg-button-gradient rounded-2xl flex items-center justify-center">
          <FiShield className='text-white text-5xl' />
        </div>
      </div>

      <h1 className="text-white font-bold text-2xl mt-3">Verify Your Email</h1>
      <p className="text-gray-400 text-sm mb-8 text-center">
        Enter the 6-digit OTP sent to your email<br />
        <span className="text-primary">{email}</span>
      </p>

      {!verified ? (
        <form onSubmit={handleVerifyOtp} className="bg-[#1a1a1d] rounded-xl p-6 w-full max-w-md shadow-lg">
          <div className="mb-5 relative">
            <label className="block text-sm text-white mb-1">Enter OTP</label>
            <FaKey className="absolute left-3 top-9 text-gray-400" />
            <input
              required
              type="text"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit code"
              className="w-full bg-[#1d1d1f] rounded-lg border border-[#333] pl-10 pr-3 py-3 text-center tracking-widest text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-button-gradient text-white text-sm py-3 rounded-xl font-semibold hover:opacity-90 transition duration-200 mt-4"
          >
            {isLoading ? "Verifying..." : "Verify OTP"}
          </button>

          {message && (
            <p className="text-red-500 text-center text-sm mt-4">{message}</p>
          )}
        </form>
      ) : (
        <div className="bg-[#1a1a1d] rounded-xl p-8 w-full max-w-md text-center shadow-lg">
          <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Email Verified Successfully!
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            Redirecting to login page...
          </p>
        </div>
      )}
    </div>
  );
};

export default OTP;
