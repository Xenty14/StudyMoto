import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'outline';
  className?: string;
}

export function Button({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'default', 
  className = '' 
}: ButtonProps) {
  const baseClasses = `
    px-4 py-2 rounded-xl font-medium transition-all duration-200
    transform hover:scale-105 active:scale-95
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
  `;

  const variantClasses = {
    default: `
      bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700
      text-white shadow-lg hover:shadow-xl
    `,
    outline: `
      border-2 border-white/30 text-white hover:bg-white/10
      backdrop-blur-sm hover:border-white/50
    `
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
}