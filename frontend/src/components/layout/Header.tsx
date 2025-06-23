import React from 'react';
import { useState, useCallback, useMemo, useRef, useEffect, memo, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  Home,
  Shirt,
  User,
  Users,
  Star,
  Image,
  Gem,
  Building,
  Calendar,
  FileText,
  Settings,
  ShoppingCart,
  Camera,
  ChevronDown,
  Music,
  Diamond
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/services/utils';
import ThemeToggle from '@/components/ThemeToggle';

interface MenuItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path?: string;
  badge?: string;
  color: string;
  children?: MenuItem[];
  category?: string;
}

export interface HeaderProps {
  className?: string;
}

const Dropdown = memo(function Dropdown({
  trigger,
  children,
  isOpen,
  onToggle
}: {
  trigger: ReactNode;
  children: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  const updateDropdownPosition = useCallback(() => {
    if (triggerRef.current && isOpen) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollX = window.scrollX || document.documentElement.scrollLeft;
      setDropdownPosition({
        top: triggerRect.bottom + scrollY + 8,
        left: triggerRect.left + scrollX
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(event.target as Node)
      ) {
        if (isOpen) {
          onToggle();
        }
      }
    };
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onToggle();
      }
    };
    const handleResize = () => {
      if (isOpen) {
        updateDropdownPosition();
      }
    };
    if (isOpen) {
      updateDropdownPosition();
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', updateDropdownPosition);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', updateDropdownPosition);
    };
  }, [isOpen, onToggle, updateDropdownPosition]);

  const dropdownContent = isOpen ? (
    <div
      ref={dropdownRef}
      className="header-dropdown-portal"
      style={{
        top: dropdownPosition.top,
        left: dropdownPosition.left
      }}
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="dropdown-trigger"
    >
      <div className="header-dropdown-content overflow-hidden">
        <div className="py-2" role="none">
          {children}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="relative" ref={triggerRef}>
      {trigger}
      {typeof document !== 'undefined' && dropdownContent &&
        createPortal(dropdownContent, document.body)
      }
    </div>
  );
});

const DropdownItem = memo(function DropdownItem({
  item,
  isActive,
  onClick
}: {
  item: MenuItem;
  isActive: boolean;
  onClick: () => void;
}) {
  const ItemIcon = item.icon;
  return (
    <Link
      to={item.path!}
      className={cn(
        'flex items-center gap-3 px-3 py-2 mx-1.5 text-sm font-medium rounded-md',
        'transition-all duration-150 ease-in-out',
        'hover:bg-accent/10 hover:text-accent-pink focus:bg-accent/10',
        'focus:outline-none focus:ring-2 focus:ring-accent-pink/30 focus:ring-offset-1',
        'min-h-[44px]', // Updated to WCAG AA compliance
        // Light mode enhancements
        'light:hover:bg-accent/20 light:hover:text-accent-pink light:focus:bg-accent/20',
        isActive ? 'bg-accent-pink/10 text-accent-pink border border-accent-pink/20 light:bg-accent-pink/15 light:border-accent-pink/30' : 'text-muted-foreground light:text-muted-foreground'
      )}
      onClick={onClick}
      role="menuitem"
      aria-current={isActive ? 'page' : undefined}
    >
      <div className="flex items-center justify-center w-5 h-5 rounded-md transition-all duration-200" aria-hidden="true">
        <ItemIcon className={cn('w-4 h-4', item.color, isActive ? 'text-accent-pink' : '')} />
      </div>
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <Badge
          variant="secondary"
          className="text-xs h-5 px-1.5"
          aria-label={`${item.badge} items`}
        >
          {item.badge}
        </Badge>
      )}
    </Link>
  );
});

export const Header = memo(function Header({ className }: HeaderProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Focus management refs
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const firstMenuItemRef = useRef<HTMLAnchorElement>(null);

  // Menu items configuration
  const menuItems: MenuItem[] = useMemo(() => [
    {
      id: 'home',
      icon: Home,
      label: 'Home',
      path: '/home',
      color: 'text-accent-pink',
      category: 'main'
    },
    {
      id: 'outfits',
      icon: Shirt,
      label: 'Outfits',
      color: 'text-accent-ocean',
      category: 'main',
      children: [
        {
          id: 'swimsuit',
          icon: Shirt,
          label: 'Swimsuit',
          path: '/swimsuit',
          color: 'text-accent-ocean',
          category: 'outfits'
        },
        {
          id: 'accessory',
          icon: Gem,
          label: 'Accessory',
          path: '/accessory',
          color: 'text-accent-gold',
          category: 'outfits'
        },
        {
          id: 'deco-bromide',
          icon: Image,
          label: 'Deco-bromide',
          path: '/decorate-bromide',
          color: 'text-accent-cyan',
          category: 'outfits'
        }
      ]
    },
    {
      id: 'girls',
      icon: Users,
      label: 'Girls',
      color: 'text-accent-pink',
      category: 'main',
      children: [
        {
          id: 'character',
          icon: User,
          label: 'Character',
          path: '/girls',
          color: 'text-accent-pink',
          category: 'girls'
        },
        {
          id: 'owner-room',
          icon: Building,
          label: 'Owner Room',
          path: '/owner-room',
          color: 'text-accent-ocean',
          category: 'girls'
        }
      ]
    },
    {
      id: 'memories',
      icon: Camera,
      label: 'Memories',
      path: '/memories',
      color: 'text-accent-purple',
      category: 'main'
    },
    {
      id: 'items',
      icon: Gem,
      label: 'Items',
      path: '/items',
      color: 'text-accent-gold',
      category: 'main'
    },
    {
      id: 'shop',
      icon: ShoppingCart,
      label: 'Shop',
      path: '/shop',
      color: 'text-accent-gold',
      category: 'main'
    },
    {
      id: 'events',
      icon: Calendar,
      label: 'Events',
      color: 'text-accent-purple',
      category: 'main',
      children: [
        {
          id: 'festivals',
          icon: Music,
          label: 'Festivals',
          path: '/festivals',
          color: 'text-yellow-400',
          category: 'events'
        },
        {
          id: 'gacha',
          icon: Diamond,
          label: 'Gacha',
          path: '/gacha',
          color: 'text-purple-400',
          category: 'events'
        }
      ]
    },
    {
      id: 'documents',
      icon: FileText,
      label: 'Document',
      path: '/documents',
      color: 'text-accent-cyan',
      category: 'main'
    },
    {
      id: 'admin',
      icon: Settings,
      label: 'Admin',
      path: '/admin',
      color: 'text-accent-gold',
      category: 'main'
    }
  ], []);

  // Check if current path is active
  const isActiveItem = useCallback((path?: string) => {
    if (!path) return false;
    return location.pathname === path;
  }, [location.pathname]);

  // Check if any child is active
  const hasActiveChild = useCallback((item: MenuItem) => {
    if (item.children) {
      return item.children.some(child => isActiveItem(child.path));
    }
    return false;
  }, [isActiveItem]);

  // Toggle dropdown
  const toggleDropdown = useCallback((itemId: string) => {
    setOpenDropdown(prev => prev === itemId ? null : itemId);
  }, []);

  // Close dropdowns when clicking outside or on mobile menu close
  useEffect(() => {
    if (!mobileMenuOpen) {
      setOpenDropdown(null);
    }
  }, [mobileMenuOpen]);

  // Enhanced keyboard navigation and focus management
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (openDropdown) {
          setOpenDropdown(null);
        } else if (mobileMenuOpen) {
          setMobileMenuOpen(false);
          // Return focus to mobile menu button
          mobileMenuButtonRef.current?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [openDropdown, mobileMenuOpen]);

  // Focus management for mobile menu
  useEffect(() => {
    if (mobileMenuOpen) {
      // Focus first menu item when mobile menu opens
      setTimeout(() => {
        firstMenuItemRef.current?.focus();
      }, 100);
    }
  }, [mobileMenuOpen]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (mobileMenuOpen && !target.closest('#header-nav')) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [mobileMenuOpen]);

  // Render menu item
  const renderMenuItem = useCallback((item: MenuItem, isMobile: boolean = false, isFirst: boolean = false) => {
    const isActive = isActiveItem(item.path);
    const hasChildren = item.children && item.children.length > 0;
    const hasActiveChildItem = hasActiveChild(item);
    const ItemIcon = item.icon;

    if (hasChildren) {
      const isDropdownOpen = openDropdown === item.id;
      
      const trigger = (
        <Button
          variant="ghost"
          className={cn(
            isMobile ? "mobile-menu-item" : "header-nav-item",
            (isActive || hasActiveChildItem || isDropdownOpen) ? "active" : undefined,
            isMobile ? "w-full justify-start" : ""
          )}
          onClick={() => toggleDropdown(item.id)}
          aria-expanded={isDropdownOpen}
          aria-haspopup="menu"
          id="dropdown-trigger"
          aria-label={`${item.label} menu`}
        >
          <div className={cn(
            "flex items-center justify-center rounded-md transition-all duration-200",
            isMobile ? "w-6 h-6" : "w-5 h-5",
            isDropdownOpen ? "scale-110" : ""
          )} aria-hidden="true">
            <ItemIcon className={cn(
              isMobile ? "w-5 h-5" : "w-4 h-4",
              item.color
            )} />
          </div>
          <span className="font-medium">{item.label}</span>
          <ChevronDown className={cn(
            "w-4 h-4 ml-auto transition-all duration-300 ease-out",
            isDropdownOpen ? "rotate-180 text-accent-pink" : ""
          )} aria-hidden="true" />
        </Button>
      );

      if (isMobile) {
        // Mobile: render children inline instead of dropdown
        return (
          <div key={item.id} className="space-y-1">
            {trigger}
            {isDropdownOpen && (
              <div className="ml-6 space-y-1 border-l-2 border-accent-pink/30 pl-4 animate-in slide-in-from-left-2 duration-200">
                {item.children!.map(child => (
                  <Link
                    key={child.id}
                    to={child.path!}
                    className={cn(
                      "mobile-menu-item text-sm",
                      isActiveItem(child.path) ? "active" : undefined
                    )}
                    onClick={() => {
                      setOpenDropdown(null);
                      setMobileMenuOpen(false);
                    }}
                    role="menuitem"
                  >
                    <div className="flex items-center justify-center w-5 h-5 rounded-md transition-all duration-200">
                      <child.icon className={cn("w-4 h-4", child.color)} />
                    </div>
                    <span className="font-medium">{child.label}</span>
                    {child.badge && (
                      <Badge variant="secondary" className="ml-auto text-xs px-2 py-1 bg-accent-pink/20 text-accent-pink border-accent-pink/30 font-semibold">
                        {child.badge}
                      </Badge>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      }

      return (
        <Dropdown
          key={item.id}
          trigger={trigger}
          isOpen={isDropdownOpen}
          onToggle={() => toggleDropdown(item.id)}
        >
          {item.children!.map(child => (
            <DropdownItem
              key={child.id}
              item={child}
              isActive={isActiveItem(child.path)}
              onClick={() => {
                setOpenDropdown(null);
                setMobileMenuOpen(false);
              }}
            />
          ))}
        </Dropdown>
      );
    }

    return (
      <Link
        key={item.id}
        ref={isMobile && isFirst ? firstMenuItemRef : undefined}
        to={item.path!}
        className={cn(
          isMobile ? "mobile-menu-item" : "header-nav-item",
          isActive ? "active" : undefined
        )}
        onClick={isMobile ? () => setMobileMenuOpen(false) : undefined}
        role="menuitem"
        tabIndex={0}
        aria-current={isActive ? 'page' : undefined}
      >
        <div className={cn(
          "flex items-center justify-center rounded-md transition-all duration-200",
          isMobile ? "w-6 h-6" : "w-5 h-5"
        )}>
          <ItemIcon className={cn(
            isMobile ? "w-5 h-5" : "w-4 h-4",
            item.color,
            isActive ? "text-accent-pink" : ""
          )} />
        </div>
        <span className={cn(
          "truncate font-medium",
          isMobile ? "text-base" : "text-sm"
        )}>{item.label}</span>
        {item.badge && (
          <Badge variant="secondary" className="ml-auto text-xs px-2 py-1 bg-accent-pink/20 text-accent-pink border-accent-pink/30 font-semibold">
            {item.badge}
          </Badge>
        )}
      </Link>
    );
  }, [isActiveItem, hasActiveChild, openDropdown, toggleDropdown]);

  return (
    <header
      id="header-nav"
      className={cn(
        "header-nav w-full gpu-accelerated contain-layout",
        className || ""
      )}
      role="banner"
    >
      <div className="container mx-auto px-4" style={{ overflow: 'visible' }}>
        <div className="flex items-center justify-between h-16 md:h-16" style={{ overflow: 'visible' }}>
          {/* Enhanced Logo */}
          <Link
            to="/home"
            className="header-logo"
            aria-label="Handbook"
          >
            <div className="relative">
              <Star className="w-7 h-7 text-accent-pink transition-all duration-200 group-hover:text-accent-cyan" />
              <div className="absolute inset-0 w-7 h-7 text-accent-pink/20 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-lg text-foreground group-hover:text-accent-pink transition-colors duration-200">
                Handbook
              </span>
            </div>
          </Link>

          {/* Enhanced Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1" style={{ position: 'static' }} role="navigation" aria-label="Main navigation">
            {menuItems.map((item, index) => renderMenuItem(item, false, index === 0))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />

            {/* Enhanced Mobile Menu Button */}
            <Button
              ref={mobileMenuButtonRef}
              variant="ghost"
              size="sm"
              className="md:hidden h-11 w-11 p-0 hover:bg-accent/10 transition-all duration-200 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-haspopup="menu"
            >
              <div className={cn("mobile-menu-toggle", mobileMenuOpen ? "open" : undefined)}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </Button>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        {mobileMenuOpen && (
          <div
            className="mobile-menu md:hidden"
            role="navigation"
            aria-label="Mobile navigation"
            id="mobile-navigation"
          >
            <nav className="mobile-menu-nav space-y-1 custom-scrollbar">
              {menuItems.map((item, index) => renderMenuItem(item, true, index === 0))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
});

export default Header;