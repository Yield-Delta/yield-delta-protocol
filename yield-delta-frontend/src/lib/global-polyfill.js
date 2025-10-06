/**
 * Global polyfill module for webpack fallback resolution
 * 
 * This file provides a 'global' module that can be resolved when
 * third-party packages require('global') during the build process.
 */

// IMMEDIATE: Set self on global before any other code at top level
if (typeof global !== 'undefined') {
  global.self = global;
  global.window = global;
} else if (typeof globalThis !== 'undefined') {
  globalThis.self = globalThis;
  globalThis.window = globalThis;
}

// Also set at module scope
if (typeof self === 'undefined') {
  var self = (typeof global !== 'undefined') ? global : (typeof globalThis !== 'undefined') ? globalThis : this;
}

// Export the global object for packages that need it
const globalObject = (function() {
  if (typeof globalThis !== 'undefined') return globalThis;
  if (typeof global !== 'undefined') return global;
  if (typeof window !== 'undefined') return window;
  if (typeof self !== 'undefined') return self;
  throw new Error('Unable to locate global object');
})();

// Ensure essential browser globals are available
if (typeof globalObject.self === 'undefined') {
  globalObject.self = globalObject;
}

if (typeof globalObject.window === 'undefined') {
  globalObject.window = globalObject;
}

// Also set it directly on the Node.js global for immediate access
if (typeof global !== 'undefined') {
  global.self = global;
  global.window = global;
}

module.exports = globalObject;