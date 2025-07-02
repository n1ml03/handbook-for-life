// Bun-specific type extensions
declare namespace Bun {
  interface ImportMeta {
    dir: string;
    main: boolean;
  }
}

// Extend the global ImportMeta interface
declare global {
  interface ImportMeta {
    dir: string;
    main: boolean;
  }
}



export {}; 