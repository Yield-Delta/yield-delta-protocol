/**
 * Critical server-side polyfills for Next.js build process
 * 
 * This file is injected at the entry point of all server-side bundles
 * to ensure global variables are available before any other code executes.
 * 
 * IMPORTANT: This must be plain JavaScript (not TypeScript) to ensure
 * it can be processed without any transpilation dependencies.
 */

// IMMEDIATE: Define self before any other code executes - must be at top level
if (typeof global !== 'undefined') {
  global.self = global;
  global.window = global;
} else if (typeof globalThis !== 'undefined') {
  globalThis.self = globalThis;
  globalThis.window = globalThis;
}

// CRITICAL: Also set on module scope immediately
if (typeof self === 'undefined') {
  var self = (typeof global !== 'undefined') ? global : (typeof globalThis !== 'undefined') ? globalThis : this;
}

// IMMEDIATE: Define self before any other code executes
(function setupCriticalPolyfills() {
  'use strict';
  
  // Get the global object in the most compatible way
  var globalObj;
  if (typeof globalThis !== 'undefined') {
    globalObj = globalThis;
  } else if (typeof global !== 'undefined') {
    globalObj = global;
  } else if (typeof window !== 'undefined') {
    globalObj = window;
  } else if (typeof self !== 'undefined') {
    globalObj = self;
  } else {
    throw new Error('Unable to locate global object');
  }

  // CRITICAL: Define self immediately
  if (typeof globalObj.self === 'undefined') {
    globalObj.self = globalObj;
  }

  // Also ensure it's available on global for Node.js context
  if (typeof global !== 'undefined' && typeof global.self === 'undefined') {
    global.self = global;
  }

  // Define window for SSR compatibility
  if (typeof globalObj.window === 'undefined') {
    globalObj.window = globalObj;
  }

  // Define document stub for SSR compatibility
  if (typeof globalObj.document === 'undefined') {
    globalObj.document = {
      createElement: function() { return { style: {} }; },
      createElementNS: function() { return { style: {} }; },
      addEventListener: function() {},
      removeEventListener: function() {},
      dispatchEvent: function() { return true; },
      querySelector: function() { return null; },
      querySelectorAll: function() { return []; },
      getElementById: function() { return null; },
      getElementsByTagName: function() { return []; },
      getElementsByClassName: function() { return []; },
      body: { 
        appendChild: function() {}, 
        removeChild: function() {} 
      },
      head: { 
        appendChild: function() {}, 
        removeChild: function() {} 
      },
      documentElement: { style: {} },
      cookie: '',
      readyState: 'complete',
      visibilityState: 'visible',
      hidden: false
    };
  }

  // Define location stub for SSR compatibility
  if (typeof globalObj.location === 'undefined') {
    globalObj.location = {
      href: 'http://localhost:3000',
      origin: 'http://localhost:3000',
      protocol: 'http:',
      host: 'localhost:3000',
      hostname: 'localhost',
      port: '3000',
      pathname: '/',
      search: '',
      hash: '',
      assign: function() {},
      replace: function() {},
      reload: function() {}
    };
  }

  // Define navigator stub for SSR compatibility
  if (typeof globalObj.navigator === 'undefined') {
    globalObj.navigator = {
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
      geolocation: undefined
    };
  }

  // Define localStorage stub for SSR compatibility
  if (typeof globalObj.localStorage === 'undefined') {
    globalObj.localStorage = {
      getItem: function() { return null; },
      setItem: function() {},
      removeItem: function() {},
      clear: function() {},
      length: 0,
      key: function() { return null; }
    };
  }

  // Define sessionStorage stub for SSR compatibility
  if (typeof globalObj.sessionStorage === 'undefined') {
    globalObj.sessionStorage = {
      getItem: function() { return null; },
      setItem: function() {},
      removeItem: function() {},
      clear: function() {},
      length: 0,
      key: function() { return null; }
    };
  }

  // Define crypto stub for SSR compatibility
  if (typeof globalObj.crypto === 'undefined') {
    try {
      // Try to use Node.js crypto module
      var nodeCrypto = require('crypto');
      globalObj.crypto = {
        getRandomValues: function(array) {
          var randomBytes = nodeCrypto.randomBytes(array.length);
          for (var i = 0; i < array.length; i++) {
            array[i] = randomBytes[i];
          }
          return array;
        },
        randomUUID: function() {
          return nodeCrypto.randomUUID ? nodeCrypto.randomUUID() : 
            'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
              var r = Math.random() * 16 | 0;
              var v = c === 'x' ? r : (r & 0x3 | 0x8);
              return v.toString(16);
            });
        },
        subtle: {}
      };
    } catch (e) {
      // Fallback crypto implementation
      globalObj.crypto = {
        getRandomValues: function(array) {
          for (var i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
          }
          return array;
        },
        randomUUID: function() {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0;
            var v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        },
        subtle: {}
      };
    }
  }

  // Define performance stub for SSR compatibility
  if (typeof globalObj.performance === 'undefined') {
    globalObj.performance = {
      now: function() { return Date.now(); },
      mark: function() { 
        return { 
          name: '', 
          entryType: 'mark', 
          startTime: Date.now(), 
          duration: 0, 
          detail: null, 
          toJSON: function() { return {}; } 
        }; 
      },
      measure: function() { 
        return { 
          name: '', 
          entryType: 'measure', 
          startTime: Date.now(), 
          duration: 0, 
          detail: null, 
          toJSON: function() { return {}; } 
        }; 
      },
      clearMarks: function() {},
      clearMeasures: function() {},
      getEntriesByType: function() { return []; },
      getEntriesByName: function() { return []; },
      getEntries: function() { return []; },
      timeOrigin: Date.now(),
      eventCounts: new Map(),
      navigation: {
        redirectCount: 0,
        type: 0,
        toJSON: function() { return {}; },
        TYPE_NAVIGATE: 0,
        TYPE_RELOAD: 1,
        TYPE_BACK_FORWARD: 2,
        TYPE_RESERVED: 255
      },
      onresourcetimingbufferfull: null,
      toJSON: function() { return {}; }
    };
  }

  // Define btoa/atob for SSR compatibility
  if (typeof globalObj.btoa === 'undefined') {
    globalObj.btoa = function(str) {
      return Buffer.from(str, 'binary').toString('base64');
    };
  }
  
  if (typeof globalObj.atob === 'undefined') {
    globalObj.atob = function(str) {
      return Buffer.from(str, 'base64').toString('binary');
    };
  }

  // Define TextEncoder/TextDecoder for SSR compatibility
  if (typeof globalObj.TextEncoder === 'undefined') {
    try {
      var util = require('util');
      globalObj.TextEncoder = util.TextEncoder;
      globalObj.TextDecoder = util.TextDecoder;
    } catch (e) {
      globalObj.TextEncoder = function() {
        this.encoding = 'utf-8';
        this.encode = function(input) {
          input = input || '';
          return new Uint8Array(Buffer.from(input, 'utf8'));
        };
        this.encodeInto = function() {
          throw new Error('encodeInto not implemented in polyfill');
        };
      };
      globalObj.TextDecoder = function() {
        this.encoding = 'utf-8';
        this.fatal = false;
        this.ignoreBOM = false;
        this.decode = function(input) {
          if (!input) return '';
          return Buffer.from(input).toString('utf8');
        };
      };
    }
  }
})();

// Ensure this runs immediately when the module is loaded
if (typeof self === 'undefined') {
  var self = this;
}

// Export empty object to satisfy module requirements
module.exports = {};