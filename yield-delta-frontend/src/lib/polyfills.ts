/**
 * Global polyfills for SSR compatibility
 * 
 * This file provides polyfills for browser globals that may be used by
 * third-party libraries during server-side rendering, specifically targeting
 * the 'self is not defined' error from @metamask/sdk and other wallet libraries.
 */

// CRITICAL: Polyfill for 'self' global in Node.js environment
// This is the primary fix for the "self is not defined" error during Next.js build
if (typeof globalThis !== 'undefined') {
  // Add self if it doesn't exist
  if (typeof globalThis.self === 'undefined') {
    // @ts-expect-error - Adding self to globalThis for SSR compatibility
    globalThis.self = globalThis;
  }
  
  // Also add to global for broader compatibility
  if (typeof global !== 'undefined' && typeof global.self === 'undefined') {
    // @ts-expect-error - Adding self to global for SSR compatibility
    global.self = global;
  }
}

// Polyfill for 'window' global in Node.js environment  
if (typeof globalThis !== 'undefined' && typeof window === 'undefined') {
  // @ts-expect-error - Adding window to globalThis for SSR compatibility
  globalThis.window = globalThis;
}

// Polyfill for localStorage in Node.js environment
if (typeof globalThis !== 'undefined' && typeof localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      length: 0,
      key: () => null,
    },
    writable: true,
    configurable: true
  });
}

// Polyfill for sessionStorage in Node.js environment
if (typeof globalThis !== 'undefined' && typeof sessionStorage === 'undefined') {
  Object.defineProperty(globalThis, 'sessionStorage', {
    value: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      length: 0,
      key: () => null,
    },
    writable: true,
    configurable: true
  });
}

// Polyfill for document in Node.js environment
if (typeof globalThis !== 'undefined' && typeof document === 'undefined') {
  Object.defineProperty(globalThis, 'document', {
    value: {
      createElement: () => ({ style: {} }),
      createElementNS: () => ({ style: {} }),
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
      querySelector: () => null,
      querySelectorAll: () => [],
      getElementById: () => null,
      getElementsByTagName: () => [],
      getElementsByClassName: () => [],
      body: { appendChild: () => {}, removeChild: () => {} },
      head: { appendChild: () => {}, removeChild: () => {} },
      documentElement: { style: {} },
      cookie: '',
      readyState: 'complete',
      visibilityState: 'visible',
      hidden: false,
    },
    writable: true,
    configurable: true
  });
}

// Polyfill for location in Node.js environment
if (typeof globalThis !== 'undefined' && typeof location === 'undefined') {
    Object.defineProperty(globalThis, 'location', {
    value: {
      href: 'http://localhost:3000',
      origin: 'http://localhost:3000',
      protocol: 'http:',
      host: 'localhost:3000',
      hostname: 'localhost',
      port: '3000',
      pathname: '/',
      search: '',
      hash: '',
      assign: () => {},
      replace: () => {},
      reload: () => {},
    },
    writable: true,
    configurable: true
  });
}

// Polyfill for navigator in Node.js environment
if (typeof globalThis !== 'undefined' && typeof navigator === 'undefined') {
  Object.defineProperty(globalThis, 'navigator', {
    value: {
      userAgent: 'Node.js SSR',
      language: 'en-US',
      languages: ['en-US', 'en'],
      platform: 'Node.js',
      onLine: true,
      cookieEnabled: true,
      doNotTrack: null,
      maxTouchPoints: 0,
      hardwareConcurrency: 4,
      connection: { effectiveType: '4g' },
      serviceWorker: undefined,
      geolocation: undefined,
    },
    writable: true,
    configurable: true
  });
}

// Polyfill for crypto.getRandomValues in Node.js environment
if (typeof globalThis !== 'undefined' && globalThis.crypto && !globalThis.crypto.getRandomValues) {
  try {
    // @ts-expect-error - Adding getRandomValues for SSR compatibility
    globalThis.crypto.getRandomValues = (array: Uint8Array) => {
      // Use a simple fallback for SSR - not cryptographically secure but sufficient for build
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    };
  } catch {
    // Silently fail if we can't add crypto polyfill
  }
}

// Polyfill for Web APIs that might be used by wallet SDKs
if (typeof globalThis !== 'undefined') {
  // EventTarget polyfill
  if (typeof EventTarget === 'undefined') {
    // @ts-expect-error - Adding EventTarget mock for SSR compatibility
    globalThis.EventTarget = class {
      addEventListener() {}
      removeEventListener() {}
      dispatchEvent() { return true; }
    };
  }

  // MessageChannel polyfill
  if (typeof MessageChannel === 'undefined') {
    // @ts-expect-error - Adding MessageChannel mock for SSR compatibility
    globalThis.MessageChannel = class {
      port1 = { postMessage() {}, addEventListener() {}, removeEventListener() {} };
      port2 = { postMessage() {}, addEventListener() {}, removeEventListener() {} };
    };
  }

  // AbortController polyfill
  if (typeof AbortController === 'undefined') {
    // @ts-expect-error - Adding AbortController mock for SSR compatibility
    globalThis.AbortController = class {
      signal = { aborted: false, addEventListener() {}, removeEventListener() {} };
      abort() { this.signal.aborted = true; }
    };
  }

  // URL polyfill
  if (typeof URL === 'undefined') {
    // @ts-expect-error - Adding URL mock for SSR compatibility
    globalThis.URL = class {
      constructor(url: string) {
        this.href = url;
        this.origin = 'http://localhost:3000';
        this.protocol = 'http:';
        this.host = 'localhost:3000';
        this.hostname = 'localhost';
        this.port = '3000';
        this.pathname = '/';
        this.search = '';
        this.hash = '';
      }
      href: string;
      origin: string;
      protocol: string;
      host: string;
      hostname: string;
      port: string;
      pathname: string;
      search: string;
      hash: string;
      toString() { return this.href; }
      static createObjectURL() { return 'blob:'; }
      static revokeObjectURL() {}
    };
  }
}

export {};