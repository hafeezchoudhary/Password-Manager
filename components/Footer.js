"use client"
import React from 'react'
import { FiShield } from "react-icons/fi";
import { MdLockOutline } from "react-icons/md";
import { LuKey } from "react-icons/lu";
import { useSession } from "next-auth/react";

const Footer = () => {

  const { data: session, status } = useSession();

  if (status === "loading") {
    return null; // Don't render anything while loading
  }

  return (
    <footer className="bg-[#000000] text-gray-300 py-10 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Logo + Description */}
        <div className="flex items-start space-x-4 ">
          {/* Circle with Letter S */}
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] text-white font-bold text-lg">
            <FiShield className="text-white text-2xl"/>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">CipherLock</h2>
            <p className="text-sm text-gray-400">
              Your trusted password manager
            </p>
          </div>
        </div>

        {/* Security Features */}
        <div>
          <h3 className="flex items-center text-white font-semibold text-lg mb-3 gap-3">
           <MdLockOutline className='text-2xl'/>
            Security Features
          </h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>• End-to-end encryption</li>
            <li>• Zero-knowledge architecture</li>
            <li>• Secure password generation</li>
          </ul>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="flex items-center text-white font-semibold text-lg mb-3 gap-3">
            <LuKey className='text-2xl'/>
            Quick Actions
          </h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>• Import/Export passwords</li>
            <li>• Security audit</li>
            <li>• Two-factor authentication</li>
          </ul>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-10 border-t border-gray-700 pt-6 text-center text-sm text-gray-400">
        &copy; 2024 CipherLock. All rights reserved. 
      </div>
    </footer>
  )
}

export default Footer
