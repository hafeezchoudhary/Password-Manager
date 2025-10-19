'use client';
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiShield } from 'react-icons/fi';
import { GoLock } from 'react-icons/go';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ResetPassword() {
  // const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get('token'); 

  useEffect(() => {
    const queryToken = router.query?.token;
    if (queryToken) setToken(queryToken);
  }, [router.query]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error('Token is missing');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Password reset successful! Redirecting...');
        setTimeout(() => router.push('/login'), 3000);
      } else {
        toast.error(data.message || 'Failed to reset password');
      }
    } catch (err) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-gradient flex flex-col items-center justify-center p-4">
      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={true}
        theme="dark"
        style={{ top: '1rem', right: '1rem', width: 'auto', zIndex: 9999 }}
      />

      {/* Shield Icon */}
      <div className="flex justify-center items-center space-x-3 mt-10">
        <div className="w-16 h-16 bg-button-gradient rounded-2xl flex items-center justify-center">
          <FiShield className="text-white text-5xl" />
        </div>
      </div>

      <h1 className="text-white font-bold text-2xl mt-3 text-center">Reset Your Password</h1>
      <p className="text-gray-400 text-sm mb-8 text-center">Enter a new password to secure your account</p>

      {/* Reset Password Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#1a1a1d] rounded-xl p-6 w-full max-w-md shadow-lg space-y-4"
      >
        {/* New Password */}
        <div className="relative">
          <GoLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#1d1d1f] rounded-lg border border-[#333] pl-10 pr-10 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
            required
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <GoLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-[#1d1d1f] rounded-lg border border-[#333] pl-10 pr-10 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
            required
          />
          <span
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-button-gradient text-white text-sm py-3 rounded-xl font-semibold hover:opacity-90 transition duration-200"
        >
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>

      <div className="text-gray-400 text-center text-sm mt-4">
        Remembered your password?{' '}
        <button onClick={() => router.push('/login')} className="text-primary hover:underline">
          Sign In
        </button>
      </div>
    </div>
  );
}
