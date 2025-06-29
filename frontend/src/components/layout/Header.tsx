import React, { useState, useCallback, useRef, useEffect, memo } from 'react';
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
import ThemeToggle from './ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Constants
const HOVER_DELAY = 200;
const DROPDOWN_Z_INDEX = 1100;
const BRIDGE_HEIGHT = 8;

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

// Extracted dropdown state management hook
const useDropdownState = () => {
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  const hoverTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  const handleMouseEnter = useCallback((itemId: string) => {
    if (hoverTimeouts.current[itemId]) {
      clearTimeout(hoverTimeouts.current[itemId]);
      delete hoverTimeouts.current[itemId];
    }
    
    setOpenDropdowns(prev => prev[itemId] ? prev : { ...prev, [itemId]: true });
  }, []);

  const handleMouseLeave = useCallback((itemId: string) => {
    hoverTimeouts.current[itemId] = setTimeout(() => {
      setOpenDropdowns(prev => prev[itemId] ? { ...prev, [itemId]: false } : prev);
      delete hoverTimeouts.current[itemId];
    }, HOVER_DELAY);
  }, []);

  const closeDropdown = useCallback((itemId: string) => {
    setOpenDropdowns(prev => ({ ...prev, [itemId]: false }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(hoverTimeouts.current).forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  return { openDropdowns, handleMouseEnter, handleMouseLeave, closeDropdown };
};

// Menu configuration moved to separate constant
const MENU_ITEMS: MenuItem[] = [
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
      { id: 'swimsuit', icon: Shirt, label: 'Swimsuit', path: '/swimsuit', color: 'text-accent-ocean', category: 'outfits' },
      { id: 'skills', icon: Star, label: 'Skills', path: '/skills', color: 'text-accent-purple', category: 'main' },
      { id: 'accessory', icon: Gem, label: 'Accessory', path: '/accessory', color: 'text-accent-gold', category: 'outfits' },
      { id: 'deco-bromide', icon: Image, label: 'Deco-bromide', path: '/decorate-bromide', color: 'text-accent-cyan', category: 'outfits' }
    ]
  },
  {
    id: 'girls',
    icon: Users,
    label: 'Girls',
    color: 'text-accent-pink',
    category: 'main',
    children: [
      { id: 'character', icon: User, label: 'Character', path: '/girls', color: 'text-accent-pink', category: 'girls' },
      { id: 'owner-room', icon: Building, label: 'Owner Room', path: '/owner-room', color: 'text-accent-ocean', category: 'girls' }
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
      { id: 'festivals', icon: Music, label: 'Festivals', path: '/festivals', color: 'text-yellow-400', category: 'events' },
      { id: 'gacha', icon: Diamond, label: 'Gacha', path: '/gacha', color: 'text-purple-400', category: 'events' }
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
];

// Extracted components for better organization
const MenuIcon = memo(({ icon: Icon, className, size = 'sm' }: {
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
  size?: 'sm' | 'md';
}) => (
  <div className={cn(
    "flex items-center justify-center",
    size === 'sm' ? "w-4 h-4" : "w-5 h-5"
  )}>
    <Icon className={cn(size === 'sm' ? "w-4 h-4" : "w-5 h-5", className)} />
  </div>
));

const MenuBadge = memo(({ badge }: { badge: string }) => (
  <Badge
    variant="secondary"
    className="text-xs h-4 px-1.5 bg-accent-pink/15 text-accent-pink border-accent-pink/30"
  >
    {badge}
  </Badge>
));

const DropdownTrigger = memo(({
  item,
  isActive,
  hasActiveChild
}: {
  item: MenuItem;
  isActive: boolean;
  hasActiveChild: boolean;
}) => (
  <DropdownMenuTrigger asChild>
    <Button
      variant="ghost"
      className={cn(
        'header-nav-item h-9 px-3 gap-2',
        'transition-all duration-150 ease-out',
        'hover:bg-accent/60 hover:text-accent-pink',
        'data-[state=open]:bg-accent/80 data-[state=open]:text-accent-pink',
        (isActive || hasActiveChild) ? 'bg-accent-pink/10 text-accent-pink' : ''
      )}
      style={{ transform: 'translateZ(0)', willChange: 'transform, background-color' }}
      aria-label={`${item.label} menu`}
    >
      <MenuIcon icon={item.icon} className={item.color} />
      <span className="font-medium text-sm">{item.label}</span>
      <ChevronDown className="w-3 h-3 ml-1 transition-transform duration-200 data-[state=open]:rotate-180" />
    </Button>
  </DropdownMenuTrigger>
));

const DropdownItem = memo(({
  item,
  isActive,
  onClick
}: {
  item: MenuItem;
  isActive: boolean;
  onClick: () => void;
}) => (
  <DropdownMenuItem asChild>
    <Link
      to={item.path!}
      className={cn(
        'flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-md',
        'transition-all duration-200 ease-out cursor-pointer',
        'hover:bg-accent/80 focus:bg-accent/80 min-h-[36px]',
        isActive 
          ? 'bg-accent-pink/10 text-accent-pink border-l-2 border-accent-pink' 
          : 'text-foreground hover:text-accent-pink'
      )}
      onClick={onClick}
    >
      <MenuIcon icon={item.icon} className={cn(item.color, isActive ? 'text-accent-pink' : '')} />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge && <MenuBadge badge={item.badge} />}
    </Link>
  </DropdownMenuItem>
));

const DesktopDropdown = memo(({
  item,
  isActive,
  hasActiveChild,
  isOpen,
  onMouseEnter,
  onMouseLeave,
  onItemClick,
  children
}: {
  item: MenuItem;
  isActive: boolean;
  hasActiveChild: boolean;
  isOpen: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onItemClick: () => void;
  children: MenuItem[];
}) => (
  <DropdownMenu 
    open={isOpen}
    onOpenChange={(open) => !open && onMouseLeave()}
    modal={false}
  >
    <div
      className="hover-zone relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        padding: '12px 8px',
        margin: '-12px -8px',
        minHeight: '48px'
      }}
    >
      <DropdownTrigger item={item} isActive={isActive} hasActiveChild={hasActiveChild} />
      
      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 bg-transparent pointer-events-auto"
          style={{
            height: BRIDGE_HEIGHT,
            marginTop: '-2px',
            zIndex: DROPDOWN_Z_INDEX - 50
          }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        />
      )}
      
      <DropdownMenuContent
        className={cn(
          'min-w-[12rem] max-w-[16rem] p-1',
          'border border-border/60 shadow-lg bg-popover/95 backdrop-blur-sm',
          'animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-150 ease-out',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-top-1'
        )}
        style={{ zIndex: DROPDOWN_Z_INDEX }}
        align="start"
        sideOffset={2}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {children.map(child => (
          <DropdownItem
            key={child.id}
            item={child}
            isActive={child.path === location.pathname}
            onClick={onItemClick}
          />
        ))}
      </DropdownMenuContent>
    </div>
  </DropdownMenu>
));

const MobileDropdown = memo(({
  item,
  isActive,
  hasActiveChild,
  isOpen,
  onToggle,
  onItemClick,
  children
}: {
  item: MenuItem;
  isActive: boolean;
  hasActiveChild: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onItemClick: () => void;
  children: MenuItem[];
}) => (
  <div className="space-y-1">
    <Button
      variant="ghost"
      className={cn(
        "mobile-menu-item w-full justify-start",
        (isActive || hasActiveChild) ? "active" : undefined
      )}
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-haspopup="menu"
      aria-label={`${item.label} menu`}
    >
      <MenuIcon icon={item.icon} className={item.color} size="md" />
      <span className="font-medium">{item.label}</span>
      <ChevronDown className={cn(
        "w-4 h-4 ml-auto transition-transform duration-200",
        isOpen ? "rotate-180" : ""
      )} />
    </Button>
    {isOpen && (
      <div className="ml-6 space-y-1 border-l-2 border-accent-pink/30 pl-4 animate-in slide-in-from-left-2 duration-200">
        {children.map(child => (
          <Link
            key={child.id}
            to={child.path!}
            className={cn(
              "mobile-menu-item text-sm",
              child.path === location.pathname ? "active" : undefined
            )}
            onClick={onItemClick}
            role="menuitem"
          >
            <MenuIcon icon={child.icon} className={child.color} />
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
));

const SimpleMenuItem = memo(({
  item,
  isActive,
  isMobile,
  isFirst,
  onClick
}: {
  item: MenuItem;
  isActive: boolean;
  isMobile: boolean;
  isFirst: boolean;
  onClick: () => void;
}) => {
  const firstMenuItemRef = useRef<HTMLAnchorElement>(null);
  
  return (
    <Link
      ref={isMobile && isFirst ? firstMenuItemRef : undefined}
      to={item.path!}
      className={cn(
        isMobile ? "mobile-menu-item" : "header-nav-item",
        isActive ? "active" : undefined
      )}
      onClick={onClick}
      role="menuitem"
      tabIndex={0}
      aria-current={isActive ? 'page' : undefined}
    >
      <MenuIcon 
        icon={item.icon} 
        className={cn(item.color, isActive ? "text-accent-pink" : "")} 
        size={isMobile ? "md" : "sm"} 
      />
      <span className={cn(
        "truncate font-medium",
        isMobile ? "text-base" : "text-sm"
      )}>
        {item.label}
      </span>
      {item.badge && (
        <Badge variant="secondary" className="ml-auto text-xs px-2 py-1 bg-accent-pink/20 text-accent-pink border-accent-pink/30 font-semibold">
          {item.badge}
        </Badge>
      )}
    </Link>
  );
});

const MobileMenuToggle = memo(({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) => (
  <Button
    variant="ghost"
    size="sm"
    className="md:hidden h-11 w-11 p-0 hover:bg-accent/10 transition-all duration-200 rounded-lg"
    onClick={onClick}
    aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
    aria-expanded={isOpen}
    aria-controls="mobile-navigation"
    aria-haspopup="menu"
  >
    <div className={cn("mobile-menu-toggle", isOpen ? "open" : undefined)}>
      <span></span>
      <span></span>
      <span></span>
    </div>
  </Button>
));

export const Header = memo(function Header({ className }: HeaderProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDropdownStates, setMobileDropdownStates] = useState<Record<string, boolean>>({});
  
  const { openDropdowns, handleMouseEnter, handleMouseLeave } = useDropdownState();

  // Memoized utilities
  const isActiveItem = useCallback((path?: string) => {
    return path ? location.pathname === path : false;
  }, [location.pathname]);

  const hasActiveChild = useCallback((item: MenuItem) => {
    return item.children?.some(child => isActiveItem(child.path)) || false;
  }, [isActiveItem]);

  const toggleMobileDropdown = useCallback((itemId: string) => {
    setMobileDropdownStates(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  // Effects for enhanced UX
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && mobileMenuOpen) {
        closeMobileMenu();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (mobileMenuOpen && !target.closest('#header-nav')) {
        closeMobileMenu();
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [mobileMenuOpen, closeMobileMenu]);

  // Render menu item based on type and context
  const renderMenuItem = useCallback((item: MenuItem, isMobile: boolean, index: number) => {
    const isActive = isActiveItem(item.path);
    const hasChildren = item.children?.length;
    const hasActiveChildItem = hasActiveChild(item);
    const isFirst = index === 0;

    if (hasChildren) {
      if (isMobile) {
        return (
          <MobileDropdown
            key={item.id}
            item={item}
            isActive={isActive}
            hasActiveChild={hasActiveChildItem}
            isOpen={mobileDropdownStates[item.id] || false}
            onToggle={() => toggleMobileDropdown(item.id)}
            onItemClick={closeMobileMenu}
            children={item.children!}
          />
        );
      }

      return (
        <DesktopDropdown
          key={item.id}
          item={item}
          isActive={isActive}
          hasActiveChild={hasActiveChildItem}
          isOpen={openDropdowns[item.id] || false}
          onMouseEnter={() => handleMouseEnter(item.id)}
          onMouseLeave={() => handleMouseLeave(item.id)}
          onItemClick={closeMobileMenu}
          children={item.children!}
        />
      );
    }

    return (
      <SimpleMenuItem
        key={item.id}
        item={item}
        isActive={isActive}
        isMobile={isMobile}
        isFirst={isFirst}
        onClick={isMobile ? closeMobileMenu : () => {}}
      />
    );
  }, [isActiveItem, hasActiveChild, mobileDropdownStates, openDropdowns, toggleMobileDropdown, handleMouseEnter, handleMouseLeave, closeMobileMenu]);

  return (
    <header
      id="header-nav"
      className={cn("header-nav w-full gpu-accelerated contain-layout", className)}
      role="banner"
    >
      <div className="modern-container safe-area-inset" style={{ overflow: 'visible' }}>
        <div className="flex items-center justify-between min-h-[56px] md:min-h-[64px] py-2" style={{ overflow: 'visible' }}>
          {/* Logo */}
          <Link to="/home" className="header-logo touch-target" aria-label="Handbook">
            <div className="relative">
              <Star className="w-6 h-6 md:w-7 md:h-7 text-accent-pink transition-all duration-200 group-hover:text-accent-cyan" />
              <div className="absolute inset-0 w-6 h-6 md:w-7 md:h-7 text-accent-pink/20 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
            <div className="hidden xs:block">
              <span className="font-bold text-responsive-lg text-foreground group-hover:text-accent-pink transition-colors duration-200">
                Handbook
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav 
            className="hidden md:flex items-center space-x-1" 
            style={{ position: 'static' }} 
            role="navigation" 
            aria-label="Main navigation"
          >
            {MENU_ITEMS.map((item, index) => renderMenuItem(item, false, index))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <MobileMenuToggle 
              isOpen={mobileMenuOpen} 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            />
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            className="mobile-menu md:hidden"
            role="navigation"
            aria-label="Mobile navigation"
            id="mobile-navigation"
          >
            <nav className="mobile-menu-nav space-y-1 custom-scrollbar">
              {MENU_ITEMS.map((item, index) => renderMenuItem(item, true, index))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
});

export default Header;