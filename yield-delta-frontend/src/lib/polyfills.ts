/**
 * Global polyfills for SSR compatibility
 * 
 * This file provides polyfills for browser globals that may be used by
 * third-party libraries during server-side rendering, specifically targeting
 * the 'self is not defined' error from @metamask/sdk and other wallet libraries.
 */

// CRITICAL: Early polyfill setup - apply to both global and globalThis
// This prevents the "self is not defined" error during Next.js build
(function setupGlobalPolyfills() {
  const globalObj = (function() {
    if (typeof globalThis !== 'undefined') return globalThis;
    if (typeof global !== 'undefined') return global;
    if (typeof window !== 'undefined') return window;
    if (typeof self !== 'undefined') return self;
    throw new Error('Unable to locate global object');
  })();

  // Primary fix for 'self is not defined' 
  if (typeof globalObj.self === 'undefined') {
    // @ts-expect-error - Adding self for SSR compatibility
    globalObj.self = globalObj;
  }

  // Ensure both global and globalThis have the same reference
  if (typeof global !== 'undefined' && typeof global.self === 'undefined') {
    // @ts-expect-error - Adding self to global for broader compatibility
    global.self = globalObj;
  }

  // Add to all possible global contexts
  if (typeof globalThis !== 'undefined' && typeof globalThis.self === 'undefined') {
    // @ts-expect-error - Adding self to globalThis
    globalThis.self = globalObj;
  }
})();

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

// Enhanced crypto polyfill for Node.js environment
if (typeof globalThis !== 'undefined') {
  if (!globalThis.crypto) {
    try {
      // Try to use Node.js crypto module for better compatibility
      const nodeCrypto = eval('require')('crypto');
      globalThis.crypto = {
        getRandomValues: (array: Uint8Array) => {
          const randomBytes = nodeCrypto.randomBytes(array.length);
          for (let i = 0; i < array.length; i++) {
            array[i] = randomBytes[i];
          }
          return array;
        },
        randomUUID: (() => nodeCrypto.randomUUID?.() || 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        })) as () => `${string}-${string}-${string}-${string}-${string}`,
        subtle: {} as SubtleCrypto,
      };
    } catch {
      // Fallback to basic crypto implementation
      globalThis.crypto = {
        getRandomValues: (array: Uint8Array) => {
          for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
          }
          return array;
        },
        randomUUID: (() => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        })) as () => `${string}-${string}-${string}-${string}-${string}`,
        subtle: {} as SubtleCrypto,
      };
    }
  } else if (!globalThis.crypto.getRandomValues) {
    try {
      const nodeCrypto = eval('require')('crypto');
      globalThis.crypto.getRandomValues = (array: Uint8Array) => {
        const randomBytes = nodeCrypto.randomBytes(array.length);
        for (let i = 0; i < array.length; i++) {
          array[i] = randomBytes[i];
        }
        return array;
      };
    } catch {
      globalThis.crypto.getRandomValues = (array: Uint8Array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 256);
        }
        return array;
      };
    }
  }
}

// Polyfill for Web APIs that might be used by wallet SDKs
if (typeof globalThis !== 'undefined') {
  // EventTarget polyfill
  if (typeof EventTarget === 'undefined') {
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

  // TextEncoder/TextDecoder polyfills for Node.js
  if (typeof TextEncoder === 'undefined') {
    try {
      const { TextEncoder: NodeTextEncoder, TextDecoder: NodeTextDecoder } = eval('require')('util');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      globalThis.TextEncoder = NodeTextEncoder as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      globalThis.TextDecoder = NodeTextDecoder as any;
    } catch {
      // Fallback implementations
      globalThis.TextEncoder = class {
        encode(input: string = '') {
          return new Uint8Array(Buffer.from(input, 'utf8'));
        }
      };
      globalThis.TextDecoder = class {
        decode(input?: BufferSource) {
          if (!input) return '';
          return Buffer.from(input as Uint8Array).toString('utf8');
        }
      };
    }
  }

  // Additional browser APIs needed by wallet SDKs
  if (typeof btoa === 'undefined') {
    globalThis.btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');
  }
  
  if (typeof atob === 'undefined') {
    globalThis.atob = (str: string) => Buffer.from(str, 'base64').toString('binary');
  }

  // Performance API polyfill
  if (typeof performance === 'undefined') {
    // @ts-expect-error - Basic performance polyfill for SSR - types don't match but runtime behavior is adequate
    globalThis.performance = {
      now: () => Date.now(),
      mark: () => ({ name: '', entryType: 'mark', startTime: Date.now(), duration: 0, detail: null, toJSON: () => ({}) }),
      measure: () => ({ name: '', entryType: 'measure', startTime: Date.now(), duration: 0, detail: null, toJSON: () => ({}) }),
      clearMarks: () => {},
      clearMeasures: () => {},
      getEntriesByType: () => [],
      getEntriesByName: () => [],
      getEntries: () => [],
      timeOrigin: Date.now(),
      eventCounts: new Map(),
      navigation: {
        redirectCount: 0,
        type: 0,
        toJSON: () => ({}),
        TYPE_NAVIGATE: 0,
        TYPE_RELOAD: 1,
        TYPE_BACK_FORWARD: 2,
        TYPE_RESERVED: 255,
      },
      onresourcetimingbufferfull: null,
      toJSON: () => ({}),
    };
  }
}

export {};