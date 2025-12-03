import React, { useState, useEffect } from 'react';
import { X, Menu } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface MobileNavProps {
  items?: NavItem[];
  className?: string;
}

const defaultNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/' },
  { label: 'Chat', href: '/chat' },
  { label: 'Agents', href: '/agents' },
  { label: 'Settings', href: '/settings' },
];

export const MobileNav: React.FC<MobileNavProps> = ({
  items = defaultNavItems,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-4 right-4 z-50 p-3 rounded-xl bg-gray-900/80 backdrop-blur-md
                   border border-gray-700 hover:bg-gray-800 transition-all duration-300
                   hover:scale-105 active:scale-95 md:hidden ${className}`}
        aria-label="Toggle menu"
      >
        <div className="relative w-6 h-6">
          <Menu
            className={`absolute inset-0 w-6 h-6 text-white transition-all duration-300
                       ${isOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}`}
          />
          <X
            className={`absolute inset-0 w-6 h-6 text-white transition-all duration-300
                       ${isOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`}
          />
        </div>
      </button>

      {/* Full Screen Overlay */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-500 ease-in-out md:hidden
                   ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        {/* Background Overlay with Blur */}
        <div
          className={`absolute inset-0 bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95
                     backdrop-blur-xl transition-opacity duration-500
                     ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsOpen(false)}
        />

        {/* Navigation Content */}
        <nav
          className={`relative flex flex-col items-center justify-center h-full px-8
                     transition-all duration-500 transform
                     ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        >
          {/* Logo or Title */}
          <div className={`mb-12 transition-all duration-700 delay-100 transform
                          ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <h2 className="text-4xl font-bold text-white text-center">
              Kairos
            </h2>
            <p className="text-gray-400 text-center mt-2">Navigation Menu</p>
          </div>

          {/* Menu Items */}
          <ul className="space-y-6 w-full max-w-xs">
            {items.map((item, index) => (
              <li
                key={index}
                className={`transition-all duration-700 transform
                           ${isOpen
                             ? 'opacity-100 translate-y-0'
                             : 'opacity-0 translate-y-4'}`}
                style={{
                  transitionDelay: isOpen ? `${150 + index * 50}ms` : '0ms'
                }}
              >
                <a
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-3 py-4 px-8
                           text-lg font-medium text-white
                           bg-white/5 hover:bg-white/10
                           border border-white/10 hover:border-white/20
                           rounded-2xl transition-all duration-300
                           hover:scale-105 active:scale-95
                           backdrop-blur-sm"
                >
                  {item.icon && (
                    <span className="text-white/70">{item.icon}</span>
                  )}
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>

          {/* Footer or Additional Content */}
          <div className={`mt-12 text-center transition-all duration-700 delay-500 transform
                          ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-gray-500 text-sm">
              © 2024 Kairos Agent
            </p>
          </div>

          {/* Decorative Elements */}
          <div className={`absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full
                          blur-3xl transition-all duration-1000
                          ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
          <div className={`absolute bottom-20 right-10 w-40 h-40 bg-purple-500/10 rounded-full
                          blur-3xl transition-all duration-1000 delay-200
                          ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
        </nav>
      </div>
    </>
  );
};

export default MobileNav;