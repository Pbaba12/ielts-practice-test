
import React from 'react';
import { TestSection } from '../types';

interface NavbarProps {
  currentSection: TestSection;
  onSelectSection: (section: TestSection) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentSection, onSelectSection }) => {
  const sections = Object.values(TestSection);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-around items-center">
          {sections.map((section) => (
            <button
              key={section}
              onClick={() => onSelectSection(section)}
              className={`py-4 px-3 text-sm font-medium border-b-4 transition-colors duration-150 ease-in-out
                ${currentSection === section 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-600 hover:text-primary hover:border-gray-300'
                }
                focus:outline-none focus:text-primary focus:border-primary`}
            >
              {section}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};
