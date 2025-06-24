import React from 'react';
import { useState, useCallback, useMemo, useRef, useEffect, memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

// Modernized compact dropdown trigger component
const ModernDropdownTrigger = memo(function ModernDropdownTrigger({
  item,
  isActive,
  hasActiveChild
}: {
  item: MenuItem;
  isActive: boolean;
  hasActiveChild: boolean;
}) {
  const ItemIcon = item.icon;
  return (
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        className={cn(
          'header-nav-item h-9 px-3 gap-2',
          'transition-all duration-200 ease-out',
          'hover:bg-accent/60 hover:text-accent-pink',
          'data-[state=open]:bg-accent/80 data-[state=open]:text-accent-pink',
          (isActive || hasActiveChild) ? 'bg-accent-pink/10 text-accent-pink' : ''
        )}
        aria-label={`${item.label} menu`}
      >
        <div className="flex items-center justify-center w-4 h-4">
          <ItemIcon className={cn('w-4 h-4', item.color)} />
        </div>
        <span className="font-medium text-sm">{item.label}</span>
        <ChevronDown className="w-3 h-3 ml-1 transition-transform duration-200 data-[state=open]:rotate-180" />
      </Button>
    </DropdownMenuTrigger>
  );
});

// Modernized compact dropdown item component
const ModernDropdownItem = memo(function ModernDropdownItem({
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
    <DropdownMenuItem asChild>
      <Link
        to={item.path!}
        className={cn(
          'flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-md',
          'transition-all duration-200 ease-out cursor-pointer',
          'hover:bg-accent/80 focus:bg-accent/80',
          'min-h-[36px]', // More compact than before
          isActive 
            ? 'bg-accent-pink/10 text-accent-pink border-l-2 border-accent-pink' 
            : 'text-foreground hover:text-accent-pink'
        )}
        onClick={onClick}
      >
        <div className="flex items-center justify-center w-4 h-4 flex-shrink-0">
          <ItemIcon className={cn('w-4 h-4', item.color, isActive ? 'text-accent-pink' : '')} />
        </div>
        <span className="flex-1 truncate">{item.label}</span>
        {item.badge && (
          <Badge
            variant="secondary"
            className="text-xs h-4 px-1.5 bg-accent-pink/15 text-accent-pink border-accent-pink/30"
          >
            {item.badge}
          </Badge>
        )}
      </Link>
    </DropdownMenuItem>
  );
});

export const Header = memo(function Header({ className }: HeaderProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          id: 'skills',
          icon: Star,
          label: 'Skills',
          path: '/skills',
          color: 'text-accent-purple',
          category: 'main'
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

  // Enhanced keyboard navigation and focus management
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
        // Return focus to mobile menu button
        mobileMenuButtonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

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

  // Mobile dropdown state for each item
  const [mobileDropdownStates, setMobileDropdownStates] = useState<Record<string, boolean>>({});

  const toggleMobileDropdown = useCallback((itemId: string) => {
    setMobileDropdownStates(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  }, []);

  // Render menu item with modernized dropdown
  const renderMenuItem = useCallback((item: MenuItem, isMobile: boolean = false, isFirst: boolean = false) => {
    const isActive = isActiveItem(item.path);
    const hasChildren = item.children && item.children.length > 0;
    const hasActiveChildItem = hasActiveChild(item);
    const ItemIcon = item.icon;

    if (hasChildren) {
      if (isMobile) {
        // Mobile: render children inline instead of dropdown
        const isOpen = mobileDropdownStates[item.id] || false;
        return (
          <div key={item.id} className="space-y-1">
            <Button
              variant="ghost"
              className={cn(
                "mobile-menu-item w-full justify-start",
                (isActive || hasActiveChildItem) ? "active" : undefined
              )}
                             onClick={() => toggleMobileDropdown(item.id)}
              aria-expanded={isOpen}
              aria-haspopup="menu"
              aria-label={`${item.label} menu`}
            >
              <div className="flex items-center justify-center w-6 h-6">
                <ItemIcon className={cn("w-5 h-5", item.color)} />
              </div>
              <span className="font-medium">{item.label}</span>
              <ChevronDown className={cn(
                "w-4 h-4 ml-auto transition-transform duration-200",
                isOpen ? "rotate-180" : ""
              )} />
            </Button>
            {isOpen && (
              <div className="ml-6 space-y-1 border-l-2 border-accent-pink/30 pl-4 animate-in slide-in-from-left-2 duration-200">
                {item.children!.map(child => (
                  <Link
                    key={child.id}
                    to={child.path!}
                    className={cn(
                      "mobile-menu-item text-sm",
                      isActiveItem(child.path) ? "active" : undefined
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                    role="menuitem"
                  >
                    <div className="flex items-center justify-center w-5 h-5">
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

      // Desktop: use modernized Radix UI dropdown
      return (
        <DropdownMenu key={item.id}>
          <ModernDropdownTrigger 
            item={item} 
            isActive={isActive} 
            hasActiveChild={hasActiveChildItem}
          />
          <DropdownMenuContent
            className={cn(
              'min-w-[12rem] max-w-[16rem] p-1',
              'border border-border/60 shadow-lg',
              'bg-popover/95 backdrop-blur-sm',
              'animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2'
            )}
            align="start"
            sideOffset={8}
          >
            {item.children!.map(child => (
              <ModernDropdownItem
                key={child.id}
                item={child}
                isActive={isActiveItem(child.path)}
                onClick={() => setMobileMenuOpen(false)}
              />
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
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
  }, [isActiveItem, hasActiveChild, mobileDropdownStates, toggleMobileDropdown]);

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