// Bun-specific type extensions
declare namespace Bun {
  interface ImportMeta {
    dir: string;
  }
}

// Extend the global ImportMeta interface
declare global {
  interface ImportMeta {
    dir: string;
  }
}

declare module 'csv-parser';

export {}; 