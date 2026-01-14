"use client";

import React, { useState } from 'react';
import { LogIn, LogOut } from 'lucide-react';
import GithubIcon from './GitHubIcon';
import { useRouter } from "next/navigation";
import { useAuth } from '@/context/AuthProvider';

interface GitHubAuthButtonProps {
  // Size options
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  // Color customization
  loginColors?: {
    from: string;
    to: string;
    hoverFrom: string;
    hoverTo: string;
  };
  logoutColors?: {
    from: string;
    to: string;
    hoverFrom: string;
    hoverTo: string;
  };
  
  // Display options
  showStatus?: boolean;
  showIcon?: boolean;
  showText?: boolean;
  
  // Text customization
  loginText?: string;
  logoutText?: string;
  
  // Additional className
  className?: string;
}

const sizeConfig = {
  sm: {
    button: 'px-4 py-2 text-sm',
    icon: 'w-5 h-5',
    arrowIcon: 'w-4 h-4',
  },
  md: {
    button: 'px-6 py-3 text-base',
    icon: 'w-6 h-6',
    arrowIcon: 'w-4 h-4',
  },
  lg: {
    button: 'px-8 py-4 text-lg',
    icon: 'w-10 h-10',
    arrowIcon: 'w-5 h-5',
  },
  xl: {
    button: 'px-10 py-5 text-xl',
    icon: 'w-12 h-12',
    arrowIcon: 'w-6 h-6',
  },
};

export default function GitHubAuthButton({
  size = 'lg',
  loginColors = {
    from: 'from-green-600',
    to: 'to-emerald-600',
    hoverFrom: 'hover:from-green-700',
    hoverTo: 'hover:to-emerald-700',
  },
  logoutColors = {
    from: 'from-red-600',
    to: 'to-red-700',
    hoverFrom: 'hover:from-red-700',
    hoverTo: 'hover:to-red-800',
  },
  showStatus = true,
  showIcon = true,
  showText = true,
  loginText = 'Login with GitHub',
  logoutText = 'Logout from GitHub',
  className = '',
}: GitHubAuthButtonProps) {
    const { isLogged, refreshAuth } = useAuth();
    const [isHovered, setIsHovered] = useState(false);
    const router = useRouter();

    const handleAuth = async () => {
        if (isLogged) {
            await fetch("/api/github/logout", {
            method: "POST",
            credentials: "include",
            cache: "no-store",
            });

            // re-check auth state
            await refreshAuth();

            // optional: push somewhere “normal”
            router.push("/");
            router.refresh(); // helps App Router re-render server components too
        } else {
            router.push("/api/github/login");
        }
    };


    const currentSize = sizeConfig[size];
    const currentColors = isLogged ? logoutColors : loginColors;

    return (
        <div className={`flex items-center justify-center ${className}`}>
        <div className="text-center">
            <button
            onClick={handleAuth}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`
                relative overflow-hidden group
                ${currentSize.button}
                rounded-lg
                font-semibold
                transition-all duration-300 ease-out
                transform hover:scale-105
                bg-gradient-to-r ${currentColors.from} ${currentColors.to} ${currentColors.hoverFrom} ${currentColors.hoverTo}
                text-white shadow-lg hover:shadow-2xl
            `}
            >
            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
            
            <span className="relative flex items-center gap-3">
                {showIcon && (
                <GithubIcon 
                    className={`${currentSize.icon} transition-transform duration-300 ${isHovered ? 'rotate-12' : ''}`} 
                />
                )}
                
                {showText && (
                <span>{isLogged ? logoutText : loginText}</span>
                )}
                
                {isLogged ? (
                <LogOut className={`${currentSize.arrowIcon} transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
                ) : (
                <LogIn className={`${currentSize.arrowIcon} transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
                )}
            </span>
            </button>

            {showStatus && (
            <div className="mt-2 text-gray-400">
                <p className="text-sm">
                Status: <span className={`font-semibold ${isLogged ? 'text-green-400' : 'text-gray-500'}`}>
                    {isLogged ? '● Connected' : '○ Disconnected'}
                </span>
                </p>
            </div>
            )}
        </div>
        </div>
    );
    }