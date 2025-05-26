
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white shadow-lg rounded-xl p-6 md:p-8 ${className}`}>
      {children}
    </div>
  );
};

interface CardTitleProps {
    children: React.ReactNode;
    className?: string;
}
export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '' }) => {
    return <h2 className={`text-2xl font-semibold text-gray-800 mb-4 ${className}`}>{children}</h2>;
};

interface CardContentProps {
    children: React.ReactNode;
    className?: string;
}
export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => {
    return <div className={`text-gray-700 space-y-4 ${className}`}>{children}</div>;
};
