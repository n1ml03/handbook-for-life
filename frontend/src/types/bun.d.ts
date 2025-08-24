// Bun-specific type extensions

// Extend the global ImportMeta interface
declare global {
  interface ImportMeta {
    dir: string;
  }
}

export {}; 