import { useState, useCallback, useMemo, useRef, useEffect, type ReactNode } from 'react';
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
  Diamond,
  Menu,
  X
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

interface HeaderProps {
  className?: string;
}

function Dropdown({
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
      className={cn(
        'header-dropdown-portal w-64',
        'animate-in fade-in-0 zoom-in-95 slide-in-from-top-2',
        'duration-200'
      )}
      style={{
        top: dropdownPosition.top,
        left: dropdownPosition.left
      }}
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="dropdown-trigger"
    >
      <div className="header-dropdown-content overflow-hidden">
        <div className="py-1" role="none">
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
}

function DropdownItem({
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
        'flex items-center gap-2 px-4 py-2.5 mx-2 text-sm font-medium rounded-md',
        'transition-all duration-150 ease-in-out',
        'hover:bg-accent/10 focus:bg-accent/10',
        'focus:outline-hidden focus:ring-2 focus:ring-accent-pink/30 focus:ring-offset-2',
        'min-h-[44px]',
        isActive ? 'bg-accent-pink/20 text-accent-pink' : ''
      )}
      onClick={onClick}
      role="menuitem"
      aria-current={isActive ? 'page' : undefined}
    >
      <div className="flex items-center justify-center w-6 h-6 rounded-md transition-all duration-200" aria-hidden="true">
        <ItemIcon className={cn('w-4 h-4', item.color, isActive ? 'text-accent-pink' : '')} />
      </div>
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <Badge
          variant="secondary"
          className="text-xs"
          aria-label={`${item.badge} items`}
        >
          {item.badge}
        </Badge>
      )}
    </Link>
  );
}

export function Header({ className }: HeaderProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

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

  // Render menu item
  const renderMenuItem = useCallback((item: MenuItem, isMobile: boolean = false) => {
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
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
            "hover:bg-gradient-to-r hover:from-white/10 hover:to-white/5 hover:scale-105",
            "focus:outline-hidden focus:ring-2 focus:ring-accent-pink/30",
            (isActive || hasActiveChildItem || isDropdownOpen) ? "bg-gradient-to-r from-accent-pink/20 via-accent-purple/15 to-accent-ocean/20 text-white border border-accent-pink/30 shadow-lg" : "",
            isMobile ? "w-full justify-start" : ""
          )}
          onClick={() => toggleDropdown(item.id)}
          aria-expanded={isDropdownOpen}
          aria-haspopup="menu"
          id="dropdown-trigger"
          aria-label={`${item.label} menu`}
        >
          <div className={cn(
            "flex items-center justify-center w-6 h-6 rounded-md transition-all duration-200",
            isDropdownOpen ? "bg-white/10 scale-110" : ""
          )} aria-hidden="true">
            <ItemIcon className={cn("w-4 h-4", item.color)} />
          </div>
          <span>{item.label}</span>
          <ChevronDown className={cn(
            "w-4 h-4 ml-1 transition-all duration-300 ease-out",
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
              <div className="ml-4 space-y-1 border-l-2 border-accent-pink/30 pl-4">
                {item.children!.map(child => (
                  <Link
                    key={child.id}
                    to={child.path!}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg",
                      "hover:bg-gradient-to-r hover:from-white/10 hover:to-white/5 hover:scale-[1.02]",
                      isActiveItem(child.path) ? "bg-accent-pink/20 text-accent-pink" : ""
                    )}
                    onClick={() => {
                      setOpenDropdown(null);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded-md transition-all duration-200">
                      <child.icon className={cn("w-4 h-4", child.color)} />
                    </div>
                    <span>{child.label}</span>
                    {child.badge && (
                      <Badge variant="secondary" className="ml-auto text-xs">
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
        to={item.path!}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
          "hover:bg-gradient-to-r hover:from-white/10 hover:to-white/5 hover:scale-105",
          "focus:outline-hidden focus:ring-2 focus:ring-accent-pink/30",
          isActive ? "bg-gradient-to-r from-accent-pink/20 via-accent-purple/15 to-accent-ocean/20 text-white border border-accent-pink/30 shadow-lg" : "",
          isMobile ? "w-full justify-start" : ""
        )}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div className={cn(
          "flex items-center justify-center w-6 h-6 rounded-md transition-all duration-200",
          "hover:bg-white/10 hover:scale-110",
          isActive ? "bg-white/10" : ""
        )}>
          <ItemIcon className={cn("w-4 h-4", item.color)} />
        </div>
        <span>{item.label}</span>
        {item.badge && (
          <Badge variant="secondary" className="ml-2 text-xs">
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
        "sticky top-0 z-[1000] w-full bg-background/95 backdrop-blur-xl border-b border-border",
        "shadow-lg shadow-black/5",
        className || ""
      )}
      role="banner"
    >
      <div className="container mx-auto px-4" style={{ overflow: 'visible' }}>
        <div className="flex items-center justify-between h-16" style={{ overflow: 'visible' }}>
          {/* Logo */}
          <Link to="/home" className="flex items-center space-x-3">
            <div className="relative">
              <Star className="w-8 h-8 text-accent-pink" />
              <div className="absolute inset-0 w-8 h-8 text-accent-pink animate-pulse opacity-50" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-lg text-foreground">Handbook</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1" style={{ position: 'static' }}>
            {menuItems.map(item => renderMenuItem(item))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl">
            <nav className="py-4 space-y-2 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {menuItems.map(item => renderMenuItem(item, true))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header; 