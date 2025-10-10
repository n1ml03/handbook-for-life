# 🎮 DOAXVV Handbook Frontend

<div align="center">

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Radix UI](https://img.shields.io/badge/Radix_UI-161618?style=for-the-badge&logo=radix-ui&logoColor=white)

**A modern, responsive React application for the DOAXVV Handbook**

*Built with React 19, TypeScript, Vite, Tailwind CSS, and cutting-edge UI libraries*

</div>

---

## 📋 Table of Contents

- [🚀 Quick Start](#-quick-start)
- [🎯 Features](#-features)
- [🏗️ Project Architecture](#️-project-architecture)
- [🛠️ Installation & Setup](#️-installation--setup)
- [🎨 UI Components](#-ui-components)
- [📱 Pages & Routes](#-pages--routes)
- [🔧 Development Workflow](#-development-workflow)
- [🚦 Scripts & Commands](#-scripts--commands)
- [⚙️ Configuration](#️-configuration)
- [🚀 Build & Deployment](#-build--deployment)
- [🐛 Troubleshooting](#-troubleshooting)
- [📖 Resources](#-resources)

---

## 🚀 Quick Start

### **For Absolute Beginners**

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
bun install

# 3. Start development server
bun run dev

# 4. Open in browser
# Visit: http://localhost:3000 (or http://localhost:5173)
```

### **For Developers**

```bash
# Install and start
bun install && bun run dev

# Type checking
bun run type-check

# Lint and format
bun run lint && bun run format

# Build for production
bun run build
```

---

## 🎯 Features

### **🌟 Core Features**
- ✅ **16+ Game Pages** - Characters, Swimsuits, Skills, Items, Events, etc.
- ✅ **Admin Dashboard** - Content management with rich text editor
- ✅ **Advanced Search** - Multi-language search with filters
- ✅ **Responsive Design** - Mobile-first, adaptive layouts
- ✅ **Dark/Light Mode** - System-aware theme switching
- ✅ **Accessibility** - WCAG compliant, keyboard navigation
- ✅ **Real-time Updates** - Live data synchronization
- ✅ **File Upload** - Image upload with preview and validation

### **🎨 UI/UX Features**
- **Modern Components** - Radix UI primitives with custom styling
- **Smooth Animations** - Framer Motion powered transitions
- **Rich Text Editor** - TipTap editor with full formatting
- **Interactive Filters** - Advanced filtering and sorting
- **Pagination** - Efficient data pagination
- **Loading States** - Skeleton loading and progress indicators
- **Error Handling** - Graceful error boundaries and fallbacks
- **Toast Notifications** - User feedback system

### **📊 Data Management**
- **State Management** - Zustand for global state
- **Context API** - React contexts for feature-specific data
- **Custom Hooks** - Reusable logic for common operations
- **API Integration** - RESTful API consumption with error handling
- **Local Storage** - Persistent user preferences
- **Real-time Search** - Debounced search with instant results

---

## 🏗️ Project Architecture

```
frontend/
├── 📁 src/
│   ├── 🌐 App.tsx                    # Main app component
│   ├── 🚪 main.tsx                   # Application entry point
│   │
│   ├── 📱 pages/                     # Page components
│   │   ├── HomePage.tsx              # Landing page
│   │   ├── CharacterListPage.tsx     # Character listing
│   │   ├── CharacterDetailPage.tsx   # Character details
│   │   ├── SwimsuitPage.tsx          # Swimsuit catalog
│   │   ├── SkillsPage.tsx            # Skills database
│   │   ├── ItemsPage.tsx             # Items inventory
│   │   ├── GachaPage.tsx             # Gacha system
│   │   ├── EventsPage.tsx            # Events calendar
│   │   ├── ShopPage.tsx              # Shop listings
│   │   ├── DocumentPage.tsx          # Documentation
│   │   ├── AdminPage.tsx             # Admin dashboard
│   │   ├── MemoriesPage.tsx          # Photo memories
│   │   ├── FestivalPage.tsx          # Festival events
│   │   ├── AccessoryPage.tsx         # Accessories
│   │   ├── DecorateBromidePage.tsx   # Bromide decoration
│   │   └── NotFoundPage.tsx          # 404 error page
│   │
│   ├── 🧩 components/                # Reusable components
│   │   ├── 🎨 ui/                    # Base UI components
│   │   │   ├── button.tsx            # Button component
│   │   │   ├── card.tsx              # Card component
│   │   │   ├── dialog.tsx            # Modal dialogs
│   │   │   ├── input.tsx             # Form inputs
│   │   │   ├── select.tsx            # Dropdown selects
│   │   │   ├── tabs.tsx              # Tab navigation
│   │   │   ├── loading.tsx           # Loading components
│   │   │   ├── FileUpload.tsx        # File upload widget
│   │   │   └── ...                   # Other UI components
│   │   │
│   │   ├── 🏗️ layout/                # Layout components
│   │   │   ├── Header.tsx            # App header
│   │   │   ├── ThemeToggle.tsx       # Theme switcher
│   │   │   └── AccessibilityProvider.tsx # A11y provider
│   │   │
│   │   ├── ⚡ features/              # Feature components
│   │   │   ├── UnifiedFilter.tsx     # Advanced filtering
│   │   │   ├── FilterConfigs.tsx     # Filter configurations
│   │   │   └── TiptapEditor.tsx      # Rich text editor
│   │   │
│   │   └── 👨‍💼 admin/                  # Admin components
│   │       ├── DocumentManagement.tsx # Document CRUD
│   │       ├── DocumentEditor.tsx    # Document editor
│   │       ├── UpdateLogManagement.tsx # Update logs
│   │       ├── CSVManagement.tsx     # CSV import
│   │       ├── TagInput.tsx          # Tag input widget
│   │       └── NotificationToast.tsx # Toast notifications
│   │
│   ├── 🪝 hooks/                     # Custom React hooks
│   │   ├── useTheme.ts               # Theme management
│   │   ├── usePagination.ts          # Pagination logic
│   │   ├── useDebounce.ts            # Debounced values
│   │   ├── useLocalStorage.ts        # Local storage persistence
│   │   ├── useLoadingState.ts        # Loading state management
│   │   ├── useScrollDirection.ts     # Scroll direction detection
│   │   ├── useAccessibility.ts       # Accessibility features
│   │   ├── useDocuments.ts           # Document operations
│   │   └── useUpdateLogs.ts          # Update log operations
│   │
│   ├── 🌍 contexts/                  # React contexts
│   │   ├── DocumentsContext.tsx      # Documents state
│   │   ├── UpdateLogsContext.tsx     # Update logs state
│   │   ├── LoadingContext.tsx        # Global loading state
│   │   └── AccessibilityContext.ts   # A11y preferences
│   │
│   ├── 🔌 services/                  # API and utilities
│   │   ├── api.ts                    # API client
│   │   ├── multiLanguageSearch.ts    # Search service
│   │   └── utils.ts                  # Utility functions
│   │
│   ├── 📝 types/                     # TypeScript definitions
│   │   ├── index.ts                  # Type exports
│   │   └── bun.d.ts                  # Bun type definitions
│   │
│   ├── 🔧 utils/                     # Utility functions
│   │   └── sortingHelpers.ts         # Sorting utilities
│   │
│   └── 🎨 styles/                    # Global styles
│       └── index.css                 # Tailwind CSS imports
│
├── 📦 package.json                   # Dependencies & scripts
├── 🔧 vite.config.ts                 # Vite configuration
├── 🎨 tailwind.config.js             # Tailwind CSS config
├── 📄 tsconfig.json                  # TypeScript config
├── 🏠 index.html                     # HTML template
└── 📖 README.md                      # This file
```

---

## 🛠️ Installation & Setup

### **Prerequisites**
- **Bun** >= 1.0.0 ([Install Bun](https://bun.sh/docs/installation))
- **Node.js** >= 18 (for compatibility)
- **Backend API** running on port 3001

### **Step-by-Step Setup**

#### 1️⃣ **Clone & Install**
```bash
# Navigate to project
cd path/to/handbook-for-life/frontend

# Install dependencies
bun install
```

#### 2️⃣ **Environment Configuration**
```bash
# Create environment file
cp .env.example .env

# Edit configuration
nano .env
```

**Environment Variables:**
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3001
VITE_API_TIMEOUT=10000

# App Configuration
VITE_APP_TITLE=DOAXVV Handbook
VITE_APP_VERSION=1.0.0

# Features
VITE_ENABLE_ADMIN=true
VITE_ENABLE_UPLOAD=true
VITE_DEBUG_MODE=false
```

#### 3️⃣ **Start Development**
```bash
# Start development server
bun run dev

# Server runs on: http://localhost:5173
# Or configure in vite.config.ts
```

#### 4️⃣ **Verify Setup**
```bash
# Type checking
bun run type-check

# Linting
bun run lint

# Build test
bun run build
```

---

## 🎨 UI Components

### **🏗️ Component Architecture**

#### **Base UI Components (`src/components/ui/`)**
Built on **Radix UI** primitives with custom Tailwind styling:

| Component | Description | Features |
|-----------|-------------|----------|
| `Button` | Interactive buttons | Variants, sizes, loading states |
| `Card` | Content containers | Headers, footers, hover effects |
| `Dialog` | Modal dialogs | Accessibility, animations, portals |
| `Input` | Form inputs | Validation, icons, disabled states |
| `Select` | Dropdown selects | Multi-select, search, grouping |
| `Tabs` | Tab navigation | Keyboard navigation, indicators |
| `Loading` | Loading states | Skeletons, spinners, progress bars |
| `FileUpload` | File upload widget | Drag & drop, preview, validation |

#### **Layout Components (`src/components/layout/`)**
- **Header**: Main navigation with theme toggle
- **ThemeToggle**: Dark/light mode switcher
- **AccessibilityProvider**: A11y features and preferences

#### **Feature Components (`src/components/features/`)**
- **UnifiedFilter**: Advanced search and filtering system
- **FilterConfigs**: Configurable filter presets
- **TiptapEditor**: Rich text editor with full formatting

#### **Admin Components (`src/components/admin/`)**
- **DocumentManagement**: CRUD operations for documents
- **DocumentEditor**: Rich text document editing
- **UpdateLogManagement**: System update tracking
- **CSVManagement**: Bulk data import/export
- **TagInput**: Tag management widget
- **NotificationToast**: User feedback system

### **🎨 Design System**

#### **Colors & Theming**
```css
/* Light Mode */
--background: 0 0% 100%
--foreground: 222.2 84% 4.9%
--primary: 222.2 47.4% 11.2%

/* Dark Mode */
--background: 222.2 84% 4.9%
--foreground: 210 40% 98%
--primary: 210 40% 98%
```

#### **Typography**
- **Font Family**: Inter (system fallback)
- **Scale**: 12px → 48px (responsive)
- **Weights**: 400, 500, 600, 700

#### **Spacing & Layout**
- **Grid**: 4px base unit
- **Breakpoints**: sm(640px), md(768px), lg(1024px), xl(1280px)
- **Container**: Max-width with responsive padding

---

## 📱 Pages & Routes

### **🏠 Core Pages**
| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `HomePage` | Landing page with navigation |
| `/characters` | `CharacterListPage` | Character database |
| `/characters/:id` | `CharacterDetailPage` | Individual character info |
| `/swimsuits` | `SwimsuitPage` | Swimsuit catalog |
| `/skills` | `SkillsPage` | Skills database |
| `/items` | `ItemsPage` | Items inventory |
| `/events` | `FestivalPage` | Events calendar |
| `/gacha` | `GachaPage` | Gacha system |
| `/shop` | `ShopPage` | Shop listings |

### **🎮 Game Features**
| Route | Component | Description |
|-------|-----------|-------------|
| `/memories` | `MemoriesPage` | Photo collection |
| `/accessories` | `AccessoryPage` | Accessory catalog |
| `/decorate` | `DecorateBromidePage` | Bromide decoration |

### **📚 Documentation & Admin**
| Route | Component | Description |
|-------|-----------|-------------|
| `/docs` | `DocumentPage` | Documentation system |
| `/admin` | `AdminPage` | Admin dashboard |
| `*` | `NotFoundPage` | 404 error page |

### **🎯 Page Features**
- **Responsive Design**: Mobile-first, adaptive layouts
- **SEO Optimized**: Meta tags, structured data
- **Performance**: Code splitting, lazy loading
- **Accessibility**: ARIA labels, keyboard navigation
- **Error Boundaries**: Graceful error handling
- **Loading States**: Skeleton loading, progress indicators

---

## 🔧 Development Workflow

### **🔥 Hot Development**
```bash
# Start with hot reload
bun run dev

# Server: http://localhost:5173
# Network: http://192.168.1.x:5173
# Auto-reloads on file changes
```

### **🧪 Testing & Validation**
```bash
# Type checking
bun run type-check

# Linting
bun run lint
bun run lint:fix

# Format code
bun run format

# Build verification
bun run build
bun run preview
```

### **🏗️ Component Development**

#### **Creating New Components**
```typescript
// src/components/ui/new-component.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface NewComponentProps {
  className?: string;
  children: React.ReactNode;
}

export const NewComponent: React.FC<NewComponentProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        "base-styles",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
```

#### **Creating Custom Hooks**
```typescript
// src/hooks/useCustomHook.ts
import { useState, useEffect } from 'react';

export const useCustomHook = (initialValue: string) => {
  const [value, setValue] = useState(initialValue);
  
  useEffect(() => {
    // Hook logic
  }, [value]);
  
  return { value, setValue };
};
```

### **🎨 Styling Guidelines**
- **Tailwind CSS**: Utility-first approach
- **Component Variants**: Using `class-variance-authority`
- **Responsive Design**: Mobile-first breakpoints
- **Dark Mode**: CSS variables with `dark:` variants

---

## 🚦 Scripts & Commands

### **🌟 Primary Commands**
```bash
# Development
bun run dev           # Start development server
bun run dev --host    # Expose to network

# Building
bun run build         # Production build
bun run build:dev     # Development build
bun run build:analyze # Bundle analysis

# Preview
bun run preview       # Preview production build
bun run preview:host  # Preview with network access
```

### **🔧 Development Tools**
```bash
# Code quality
bun run lint          # ESLint checking
bun run lint:fix      # Fix linting issues
bun run type-check    # TypeScript validation
bun run format        # Prettier formatting

# Utilities
bun run clean         # Clean build artifacts
```

### **📊 Complete Scripts Reference**
| Script | Description | Use Case |
|--------|-------------|----------|
| `dev` | Development server | Day-to-day development |
| `build` | Production build | Deployment |
| `preview` | Preview build | Testing production build |
| `lint` | Code linting | Code quality checks |
| `format` | Code formatting | Code consistency |
| `type-check` | TypeScript check | Type safety verification |
| `clean` | Clean artifacts | Fresh start |

---

## ⚙️ Configuration

### **🔧 Vite Configuration (`vite.config.ts`)**
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

### **🎨 Tailwind Configuration (`tailwind.config.js`)**
```javascript
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
```

### **📝 TypeScript Configuration (`tsconfig.json`)**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### **🌍 Environment Variables**
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3001
VITE_API_TIMEOUT=10000

# App Configuration
VITE_APP_TITLE=DOAXVV Handbook
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=Handbook for DOAXVV game

# Feature Flags
VITE_ENABLE_ADMIN=true
VITE_ENABLE_UPLOAD=true
VITE_ENABLE_ANALYTICS=false
VITE_DEBUG_MODE=false

# UI Configuration
VITE_DEFAULT_THEME=system
VITE_ITEMS_PER_PAGE=20
VITE_ANIMATION_DURATION=300
```

---

## 🚀 Build & Deployment

### **🏗️ Production Build**
```bash
# Build for production
bun run build

# Output directory: dist/
# Assets are optimized and minified
# Source maps are generated
```

### **📊 Build Analysis**
```bash
# Analyze bundle size
bun run build:analyze

# View bundle composition
# Identify optimization opportunities
```

### **🐳 Docker Deployment**
```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install
COPY . .
RUN bun run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### **📁 Build Output**
```
dist/
├── index.html              # Main HTML file
├── assets/
│   ├── index-[hash].js     # Main JavaScript bundle
│   ├── index-[hash].css    # Main CSS bundle
│   └── [name]-[hash].*     # Chunked assets
└── favicon.ico             # Favicon
```

### **⚡ Performance Optimizations**
- **Code Splitting**: Automatic route-based splitting
- **Tree Shaking**: Remove unused code
- **Asset Optimization**: Image and font optimization
- **Caching**: Long-term caching with content hashing
- **Compression**: Gzip/Brotli compression ready

---

## 🐛 Troubleshooting

### **🔧 Common Issues**

#### **❌ Dependencies Issues**
```bash
# Clear node_modules and reinstall
rm -rf node_modules bun.lockb
bun install

# Check for version conflicts
bun list
```

#### **🚪 Port Issues**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Use different port
bun run dev --port 3000
```

#### **🌐 API Connection Issues**
```bash
# Check backend is running
curl http://localhost:3001/api/health

# Verify proxy configuration in vite.config.ts
# Check CORS settings in backend
```

#### **🎨 Style Issues**
```bash
# Rebuild CSS
rm -rf node_modules/.vite
bun run dev

# Check Tailwind configuration
# Verify CSS imports in main.tsx
```

### **🩺 Debug Tools**
- **React DevTools**: Component inspection
- **Vite DevTools**: Build analysis
- **Browser DevTools**: Network, performance, console
- **TypeScript**: Type checking errors
- **ESLint**: Code quality issues

### **📞 Getting Help**
- **Console Logs**: Check browser console for errors
- **Network Tab**: Verify API requests
- **React DevTools**: Component state inspection
- **Build Logs**: Check terminal output for build errors

---

## 📖 Resources

### **📚 Documentation**
- **Component Library**: Radix UI primitives
- **Styling**: Tailwind CSS utility classes
- **Animations**: Framer Motion documentation
- **Forms**: React Hook Form patterns
- **Routing**: React Router v7

### **🛠️ Tech Stack**
- **[React 19](https://react.dev/)**: UI library with latest features
- **[TypeScript](https://www.typescriptlang.org/)**: Type-safe JavaScript
- **[Vite](https://vitejs.dev/)**: Fast build tool and dev server
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)**: Accessible component primitives
- **[Framer Motion](https://www.framer.com/motion/)**: Animation library
- **[TipTap](https://tiptap.dev/)**: Rich text editor framework
- **[Zustand](https://zustand-demo.pmnd.rs/)**: Lightweight state management

### **🔗 Related Projects**
- **Backend API**: Node.js/Express backend with RESTful API
- **Database**: MySQL with comprehensive game data
- **Documentation**: Comprehensive API and database documentation

### **📝 Development Guidelines**
- **Code Style**: ESLint + Prettier configuration
- **Component Design**: Composition over inheritance
- **State Management**: Local state first, global when needed
- **Performance**: Lazy loading, code splitting, memoization
- **Accessibility**: WCAG 2.1 AA compliance
- **Testing**: Component testing with React Testing Library