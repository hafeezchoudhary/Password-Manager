"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FiShield } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import React from "react";

const Navbar = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const dropdownRef = useRef(null);

  // Redirect if logged in and on /login
  useEffect(() => {
    if (session && window.location.pathname === "/login") {
      router.push("/dashboard");
    }
  }, [session, router]);

  // Handle Logout
  const handleLogout = async () => {
    setIsDropdownOpen(false);
    try {
      await signOut({ redirect: false, callbackUrl: "/login" });
      localStorage.removeItem("token");
      localStorage.removeItem("savedPasswords");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/login");
    }
  };

  // Handle Dashboard
  const handleDashboard = () => {
    setIsDropdownOpen(false);
    router.push("/dashboard");
  };

  const handleHomepage = () => {
    setIsDropdownOpen(false);
    router.push("/");
  };

  // Handle Delete Account with popup + toaster
  const handleDeleteAccount = () => {
    setIsDropdownOpen(false);
    setShowDeletePopup(true);
  };

  const confirmDeleteAccount = async () => {
  setShowDeletePopup(false);
  try {
    const res = await fetch(`/api/deleteaccount`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${session?.user?.id}`,
      },
    });

    if (res.ok) {
      // Save toast message to show on home page
      localStorage.setItem("accountDeletedMessage", "Account deleted successfully.");
      // Sign out and redirect to home
      signOut({ callbackUrl: "/" });
    } else {
      const data = await res.json();
      setToastMessage(data.message || "Error deleting account.");
      setTimeout(() => setToastMessage(null), 2000);
    }
  } catch (err) {
    console.error(err);
    setToastMessage("Network error deleting account.");
    setTimeout(() => setToastMessage(null), 2000);
  }
};


  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Navbar scroll background
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (status === "loading") {
    return (
      <nav className="fixed top-0 w-full z-50 transition-all duration-300 border-b border-gray-600 bg-[#0e0e0f]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-36 h-8 bg-gray-700 animate-pulse rounded"></div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-20 h-8 bg-gray-700 animate-pulse rounded"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 border-b border-gray-600 ${
          scrolled ? "bg-[#0e0e0f]/80 backdrop-blur-sm" : "bg-[#0e0e0f]/80 backdrop-blur-sm"
        }`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Left - Logo + Title */}
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-button-gradient flex items-center justify-center">
              <span className="text-white text-2xl">
                <FiShield />
              </span>
            </div>
            <div className="leading-tight">
              <h1 className="text-white font-semibold text-lg">SecurePassVault</h1>
              <p className="text-gray-400 text-xs">Password Manager</p>
            </div>
          </div>

          {/* Right - Buttons / User Dropdown */}
          <div className="flex items-center space-x-3">
            {!session && (
              <>
                <Link
                  href="/login"
                  className="text-white text-sm font-semibold px-3 py-2 whitespace-nowrap hover:bg-[#232323] rounded-lg transition duration-200">
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-button-gradient text-white px-3 py-3 sm:px-3 sm:py-2 rounded-lg text-sm font-semibold whitespace-nowrap hover:opacity-90">
                  Get Started
                </Link>
              </>
            )}

            {session && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="flex items-center space-x-2 text-white hover:text-[#798dff] transition">
                  <FaUserCircle className="text-3xl" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1d] border border-gray-700 rounded-lg shadow-lg z-50">
                    <button
                      onClick={handleHomepage}
                      className="block w-full text-left text-white px-4 py-2 hover:bg-gray-800 transition">
                      Home
                    </button>
                    <button
                      onClick={handleDashboard}
                      className="block w-full text-left text-white px-4 py-2 hover:bg-gray-800 transition">
                      Dashboard
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-white hover:bg-gray-800 transition">
                      Logout
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      className="block w-full text-left px-4 py-2 text-red-400 hover:bg-gray-800 hover:text-red-300 transition">
                      Delete Account
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Delete Account Popup */}
      {showDeletePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[1000]">
          <div className="bg-[#1a1a1d] p-6 rounded-xl shadow-lg text-center border border-gray-700 w-96">
            <h3 className="text-lg font-semibold mb-2 text-red-600">Delete Account?</h3>
            <p className="text-gray-400 mb-6 text-sm">
              This action is permanent and cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeletePopup(false)}
                className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition">
                Cancel
              </button>
              <button
                onClick={confirmDeleteAccount}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition">
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#1a1a1d] border border-gray-700 text-white px-4 py-3 rounded-lg shadow-lg animate-fadeIn z-[1000]">
          {toastMessage}
        </div>
      )}
    </>
  );
};

export default Navbar;
