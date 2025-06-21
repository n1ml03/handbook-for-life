# FRONTEND README - DOAXVV HANDBOOK 

---

## 🏗️ CẤU TRÚC TỔNG QUAN

```
frontend/
├── src/
│   ├── components/           # ✅ UI Components
│   │   ├── admin/           # ✅ Admin functionality (8 components)
│   │   ├── features/        # ✅ Feature-specific components
│   │   ├── layout/          # ✅ Layout components (Header, Accessibility)
│   │   └── ui/              # ✅ Reusable UI components (14 components)
│   ├── contexts/            # ✅ React Context providers
│   ├── hooks/               # ✅ Custom React hooks
│   ├── pages/               # ✅ 16 main pages
│   ├── services/            # ✅ API services & utilities
│   ├── styles/              # ✅ Global CSS và themes
│   ├── types/               # ✅ TypeScript definitions
│   ├── assets/              # ✅ Static assets (icons, images)
│   ├── App.tsx              # ✅ Main App component với routing
│   └── main.tsx             # ✅ Entry point
├── public/                  # Static files
├── dist/                    # Build output
├── vite.config.ts           # ✅ Vite configuration
├── tailwind.config.js       # ✅ Tailwind CSS config
├── package.json             # ✅ Dependencies & scripts
└── .env                     # ✅ Environment variables
```

---

## 🚀 CÔNG NGHỆ STACK

### **Framework & Runtime:**
- ⚛️ **React 19.1.0** - Latest React with concurrent features
- ⚡ **Vite 6.3.5** - Next-generation frontend build tool
- 📘 **TypeScript** - Type safety
- 🎨 **Tailwind CSS 3.4.17** - Utility-first CSS framework

### **UI Components:**
- 🎯 **Radix UI** - Headless UI primitives (15+ components)
- ✨ **Framer Motion** - Advanced animations
- 🎨 **Lucide React** - Beautiful icons
- 🎭 **Class Variance Authority** - Component variants

### **Rich Text Editor:**
- 📝 **TipTap 2.14.0** - Modular rich text editor
- 📊 **TipTap Extensions** - Tables, Images, Links, Styling

### **State Management:**
- 🗂️ **Zustand 5.0.5** - Lightweight state management
- ⚛️ **React Context** - Component state sharing
- 🔄 **React Router DOM 7.6.2** - Client-side routing

### **Development Tools:**
- 🔧 **ESLint** - Code linting
- 💅 **Prettier** - Code formatting
- 📦 **Bundle optimization** - Code splitting & chunking

---

## 📱 CÁC TRANG CHÍNH (16 PAGES)

### **Core Game Pages:**
1. 🏠 **HomePage** (14KB) - Dashboard và timeline
2. 👙 **SwimsuitPage** (43KB) - Thư viện đồ bơi, trang lớn nhất
3. 👭 **GirlListPage** (19KB) - Danh sách nhân vật
4. 👧 **GirlDetailPage** (30KB) - Chi tiết nhân vật
5. 🎯 **SkillsPage** (15KB) - Quản lý kỹ năng
6. 💎 **AccessoryPage** (17KB) - Phụ kiện

### **Content & Activities:**
7. 🖼️ **DecorateBromidePage** (17KB) - Deco-Bromide collection
8. 🏠 **OwnerRoomPage** (19KB) - Phòng riêng
9. 📦 **ItemsPage** (22KB) - Vật phẩm game
10. 🛒 **ShopPage** (19KB) - Cửa hàng
11. 🎪 **FestivalPage** (15KB) - Sự kiện Festival
12. 🎰 **GachaPage** (17KB) - Hệ thống Gacha
13. 💭 **MemoriesPage** (22KB) - Cốt truyện & kỷ niệm

### **Management Pages:**
14. 📚 **DocumentPage** (20KB) - Tài liệu hướng dẫn
15. 👑 **AdminPage** (14KB) - Quản trị hệ thống
16. ❓ **NotFoundPage** (6.7KB) - 404 error page

---

## 🎨 UI/UX FEATURES

### **Design System:**
- ✅ **Dark/Light mode** - Theme switching
- ✅ **Responsive design** - Mobile-first approach
- ✅ **Custom color palette** - DOAXVV themed colors
- ✅ **Consistent spacing** - Design system tokens
- ✅ **Accessibility** - Screen reader support, keyboard navigation

### **Custom Colors:**
```css
accent-ocean   /* Ocean blue theme */
accent-pink    /* Pink/coral theme */
accent-purple  /* Purple theme */
accent-gold    /* Gold theme */
accent-cyan    /* Cyan theme */
accent-coral   /* Coral theme */
```

### **Animations:**
- ✅ **Page transitions** - Smooth routing
- ✅ **Loading states** - Shimmer effects
- ✅ **Micro-interactions** - Button hover, focus states
- ✅ **Search animations** - Slide effects

### **Performance Optimizations:**
- ✅ **Lazy loading** - Code splitting cho tất cả pages
- ✅ **Bundle chunking** - Vendor chunks tối ưu
- ✅ **Image optimization** - Lazy loading images
- ✅ **API caching** - Request optimization

---

## 🔧 COMPONENTS ARCHITECTURE

### **Layout Components:**
- `Header` - Navigation với theme toggle
- `AccessibilityProvider` - A11y support & skip links

### **UI Components (14 components):**
- `Button`, `Card`, `Dialog`, `Input`, `Select`
- `Avatar`, `Badge`, `Progress`, `Slider`, `Tabs`
- `Tooltip`, `Dropdown`, `ErrorState`, `Loading`

### **Feature Components:**
- `UnifiedFilter` - Advanced filtering system
- `TiptapEditor` - Rich text editing
- `DatabaseSchema` - Schema visualization
- `FilterConfigs` - Filter configurations

### **Admin Components (8 components):**
- `CSVManagement` - Data import/export
- `DocumentEditor` - Content management
- `DocumentManagement` - Document CRUD
- `UpdateLogEditor` - Change tracking
- `NotificationToast` - User feedback
- `TagInput` - Tag management

---

## 🛠️ SERVICES & UTILITIES

### **API Services:**
- `api.ts` (21KB) - Complete API client
- REST endpoints cho tất cả entities
- Error handling & retry logic
- Response type safety

### **Custom Hooks:**
- `useTheme.ts` - Theme management
- `useMultiLanguageSearch.ts` - Multi-language search
- `useScrollDirection.ts` - Scroll detection
- `useDebounce.ts` - Performance optimization
- `useLocalStorage.ts` - Local storage integration

### **Utility Functions:**
- `utils.ts` (6.1KB) - Helper functions
- `multiLanguageSearch.ts` - Search algorithms
- Type definitions & validation

---

## 📋 SCRIPTS PACKAGE.JSON

```json
{
  "dev": "vite --host",                    // Development server với network access
  "build": "vite build",                   // Production build
  "build:dev": "vite build --mode development",
  "build:analyze": "vite build --mode analyze",
  "preview": "vite preview",               // Preview production build
  "preview:host": "vite preview --host",   // Preview với network access
  "lint": "eslint . --ext ts,tsx",         // Code linting
  "lint:fix": "eslint . --ext ts,tsx --fix",
  "type-check": "tsc --noEmit",           // TypeScript type checking
  "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,json,css,md}\"",
  "clean": "rm -rf dist node_modules"      // Clean build artifacts
}
```

---

## 🚀 HƯỚNG DẪN SETUP & CHẠY

### **Bước 1: Cài đặt Dependencies**
```bash
cd frontend
npm install
# hoặc
yarn install
# hoặc
pnpm install
```

### **Bước 2: Cấu hình Environment**
```bash
# File .env đã có sẵn, kiểm tra config:
VITE_API_URL=http://localhost:3001/api
VITE_DEV_MODE=true
VITE_BUILD_MODE=production
```

### **Bước 3: Chạy Development Server**
```bash
# Chạy dev server (port 3000)
npm run dev

# Chạy với network access
npm run dev -- --host

# Server sẽ chạy tại:
# - Local: http://localhost:3000
# - Network: http://[your-ip]:3000
```

### **Bước 4: Build Production**
```bash
# Build cho production
npm run build

# Preview production build
npm run preview

# Build artifacts sẽ có trong thư mục dist/
```

### **Bước 5: Development Tools**
```bash
# Type checking
npm run type-check

# Code linting
npm run lint
npm run lint:fix

# Code formatting
npm run format
```

---

## 🔧 VITE CONFIGURATION

### **Key Features:**
- ✅ **Hot Module Replacement** - Instant updates
- ✅ **API Proxy** - `/api` routes proxy to backend (port 3001)
- ✅ **Path aliases** - `@/` maps to `src/`
- ✅ **Bundle optimization** - Code splitting & chunking
- ✅ **Source maps** - Debug support

### **Bundle Chunks:**
```javascript
manualChunks: {
  'react-vendor': ['react', 'react-dom', 'react-router-dom'],
  'ui-radix': ['@radix-ui/*'],              // UI components
  'editor-tiptap': ['@tiptap/*'],           // Rich text editor
  'animation-vendor': ['framer-motion'],    // Animations
  'data-vendor': ['zustand'],               // State management
  'utils-vendor': ['class-variance-authority', 'tailwind-merge']
}
```

---

## 🎯 ROUTING STRUCTURE

### **Public Routes:**
```
/home              → HomePage (Dashboard)
/swimsuit          → SwimsuitPage (Swimsuit library)
/girls             → GirlListPage (Character list)
/girls/:id         → GirlDetailPage (Character details)
/skills            → SkillsPage (Skills management)
/decorate-bromide  → DecorateBromidePage (Bromide collection)
/accessory         → AccessoryPage (Accessories)
/memories          → MemoriesPage (Story episodes)
/owner-room        → OwnerRoomPage (Owner room)
/items             → ItemsPage (Game items)
/shop              → ShopPage (Shop system)
/festivals         → FestivalPage (Events & festivals)
/gacha             → GachaPage (Gacha system)
/documents         → DocumentPage (Documentation)
```

### **Admin Routes:**
```
/admin             → AdminPage (Admin panel)
```

### **Special Routes:**
```
/                  → Redirect to /home
/*                 → NotFoundPage (404)
```

---

## 📊 PERFORMANCE METRICS

### **Bundle Size Optimization:**
- ✅ **Code splitting** - Lazy load tất cả pages
- ✅ **Vendor chunking** - Separate vendor libraries  
- ✅ **Tree shaking** - Remove unused code
- ✅ **Asset optimization** - Image & font optimization

### **Runtime Performance:**
- ✅ **Virtual scrolling** - Large lists
- ✅ **Debounced search** - Prevent excessive API calls
- ✅ **Memoization** - Expensive calculations
- ✅ **Lazy loading** - Images và components

### **Loading States:**
- ✅ **Suspense boundaries** - React Suspense
- ✅ **Skeleton screens** - Loading placeholders
- ✅ **Progressive loading** - Incremental content

---

## 🛡️ TYPE SAFETY

### **TypeScript Setup:**
- ✅ **Strict mode** - Maximum type safety
- ✅ **Path mapping** - `@/` alias
- ✅ **Type definitions** - Complete API types
- ✅ **Component props** - Fully typed components

### **API Integration:**
- ✅ **Generated types** - From backend schemas
- ✅ **Request/Response types** - Type-safe API calls
- ✅ **Error handling** - Typed error responses

---

## 🎨 STYLING ARCHITECTURE

### **Tailwind CSS Setup:**
- ✅ **Custom design tokens** - Color palette, spacing
- ✅ **Dark mode support** - Class-based dark mode
- ✅ **Responsive design** - Mobile-first breakpoints
- ✅ **Component variants** - CVA integration
- ✅ **Animation utilities** - Custom animations

### **CSS Variables:**
```css
/* Color system */
--color-primary
--color-secondary
--color-accent-*

/* Layout */
--radius-lg, --radius-md, --radius-sm

/* Animations */
--animate-fade-in
--animate-slide-up
--animate-shimmer
```