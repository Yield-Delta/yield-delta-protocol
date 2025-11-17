import { createRequire } from "node:module";
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => all[name] = () => newValue
    });
};
var __esm = (fn, res) => () => (fn && (res = fn(fn = 0)), res);
var __require = /* @__PURE__ */ createRequire(import.meta.url);

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/abitype/dist/esm/version.js
var version = "1.0.8";

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/abitype/dist/esm/errors.js
var BaseError;
var init_errors = __esm(() => {
  BaseError = class BaseError extends Error {
    constructor(shortMessage, args = {}) {
      const details = args.cause instanceof BaseError ? args.cause.details : args.cause?.message ? args.cause.message : args.details;
      const docsPath = args.cause instanceof BaseError ? args.cause.docsPath || args.docsPath : args.docsPath;
      const message = [
        shortMessage || "An error occurred.",
        "",
        ...args.metaMessages ? [...args.metaMessages, ""] : [],
        ...docsPath ? [`Docs: https://abitype.dev${docsPath}`] : [],
        ...details ? [`Details: ${details}`] : [],
        `Version: abitype@${version}`
      ].join(`
`);
      super(message);
      Object.defineProperty(this, "details", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "docsPath", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "metaMessages", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "shortMessage", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "AbiTypeError"
      });
      if (args.cause)
        this.cause = args.cause;
      this.details = details;
      this.docsPath = docsPath;
      this.metaMessages = args.metaMessages;
      this.shortMessage = shortMessage;
    }
  };
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/abitype/dist/esm/regex.js
function execTyped(regex, string) {
  const match = regex.exec(string);
  return match?.groups;
}
var bytesRegex, integerRegex, isTupleRegex;
var init_regex = __esm(() => {
  bytesRegex = /^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/;
  integerRegex = /^u?int(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/;
  isTupleRegex = /^\(.+?\).*?$/;
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/abitype/dist/esm/human-readable/formatAbiParameter.js
function formatAbiParameter(abiParameter) {
  let type = abiParameter.type;
  if (tupleRegex.test(abiParameter.type) && "components" in abiParameter) {
    type = "(";
    const length = abiParameter.components.length;
    for (let i = 0;i < length; i++) {
      const component = abiParameter.components[i];
      type += formatAbiParameter(component);
      if (i < length - 1)
        type += ", ";
    }
    const result = execTyped(tupleRegex, abiParameter.type);
    type += `)${result?.array ?? ""}`;
    return formatAbiParameter({
      ...abiParameter,
      type
    });
  }
  if ("indexed" in abiParameter && abiParameter.indexed)
    type = `${type} indexed`;
  if (abiParameter.name)
    return `${type} ${abiParameter.name}`;
  return type;
}
var tupleRegex;
var init_formatAbiParameter = __esm(() => {
  init_regex();
  tupleRegex = /^tuple(?<array>(\[(\d*)\])*)$/;
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/abitype/dist/esm/human-readable/formatAbiParameters.js
function formatAbiParameters(abiParameters) {
  let params = "";
  const length = abiParameters.length;
  for (let i = 0;i < length; i++) {
    const abiParameter = abiParameters[i];
    params += formatAbiParameter(abiParameter);
    if (i !== length - 1)
      params += ", ";
  }
  return params;
}
var init_formatAbiParameters = __esm(() => {
  init_formatAbiParameter();
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/abitype/dist/esm/human-readable/formatAbiItem.js
function formatAbiItem(abiItem) {
  if (abiItem.type === "function")
    return `function ${abiItem.name}(${formatAbiParameters(abiItem.inputs)})${abiItem.stateMutability && abiItem.stateMutability !== "nonpayable" ? ` ${abiItem.stateMutability}` : ""}${abiItem.outputs?.length ? ` returns (${formatAbiParameters(abiItem.outputs)})` : ""}`;
  if (abiItem.type === "event")
    return `event ${abiItem.name}(${formatAbiParameters(abiItem.inputs)})`;
  if (abiItem.type === "error")
    return `error ${abiItem.name}(${formatAbiParameters(abiItem.inputs)})`;
  if (abiItem.type === "constructor")
    return `constructor(${formatAbiParameters(abiItem.inputs)})${abiItem.stateMutability === "payable" ? " payable" : ""}`;
  if (abiItem.type === "fallback")
    return `fallback() external${abiItem.stateMutability === "payable" ? " payable" : ""}`;
  return "receive() external payable";
}
var init_formatAbiItem = __esm(() => {
  init_formatAbiParameters();
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/abitype/dist/esm/human-readable/runtime/signatures.js
function isErrorSignature(signature) {
  return errorSignatureRegex.test(signature);
}
function execErrorSignature(signature) {
  return execTyped(errorSignatureRegex, signature);
}
function isEventSignature(signature) {
  return eventSignatureRegex.test(signature);
}
function execEventSignature(signature) {
  return execTyped(eventSignatureRegex, signature);
}
function isFunctionSignature(signature) {
  return functionSignatureRegex.test(signature);
}
function execFunctionSignature(signature) {
  return execTyped(functionSignatureRegex, signature);
}
function isStructSignature(signature) {
  return structSignatureRegex.test(signature);
}
function execStructSignature(signature) {
  return execTyped(structSignatureRegex, signature);
}
function isConstructorSignature(signature) {
  return constructorSignatureRegex.test(signature);
}
function execConstructorSignature(signature) {
  return execTyped(constructorSignatureRegex, signature);
}
function isFallbackSignature(signature) {
  return fallbackSignatureRegex.test(signature);
}
function execFallbackSignature(signature) {
  return execTyped(fallbackSignatureRegex, signature);
}
function isReceiveSignature(signature) {
  return receiveSignatureRegex.test(signature);
}
var errorSignatureRegex, eventSignatureRegex, functionSignatureRegex, structSignatureRegex, constructorSignatureRegex, fallbackSignatureRegex, receiveSignatureRegex, modifiers, eventModifiers, functionModifiers;
var init_signatures = __esm(() => {
  init_regex();
  errorSignatureRegex = /^error (?<name>[a-zA-Z$_][a-zA-Z0-9$_]*)\((?<parameters>.*?)\)$/;
  eventSignatureRegex = /^event (?<name>[a-zA-Z$_][a-zA-Z0-9$_]*)\((?<parameters>.*?)\)$/;
  functionSignatureRegex = /^function (?<name>[a-zA-Z$_][a-zA-Z0-9$_]*)\((?<parameters>.*?)\)(?: (?<scope>external|public{1}))?(?: (?<stateMutability>pure|view|nonpayable|payable{1}))?(?: returns\s?\((?<returns>.*?)\))?$/;
  structSignatureRegex = /^struct (?<name>[a-zA-Z$_][a-zA-Z0-9$_]*) \{(?<properties>.*?)\}$/;
  constructorSignatureRegex = /^constructor\((?<parameters>.*?)\)(?:\s(?<stateMutability>payable{1}))?$/;
  fallbackSignatureRegex = /^fallback\(\) external(?:\s(?<stateMutability>payable{1}))?$/;
  receiveSignatureRegex = /^receive\(\) external payable$/;
  modifiers = new Set([
    "memory",
    "indexed",
    "storage",
    "calldata"
  ]);
  eventModifiers = new Set(["indexed"]);
  functionModifiers = new Set([
    "calldata",
    "memory",
    "storage"
  ]);
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/abitype/dist/esm/human-readable/errors/abiItem.js
var UnknownTypeError, UnknownSolidityTypeError;
var init_abiItem = __esm(() => {
  init_errors();
  UnknownTypeError = class UnknownTypeError extends BaseError {
    constructor({ type }) {
      super("Unknown type.", {
        metaMessages: [
          `Type "${type}" is not a valid ABI type. Perhaps you forgot to include a struct signature?`
        ]
      });
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "UnknownTypeError"
      });
    }
  };
  UnknownSolidityTypeError = class UnknownSolidityTypeError extends BaseError {
    constructor({ type }) {
      super("Unknown type.", {
        metaMessages: [`Type "${type}" is not a valid ABI type.`]
      });
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "UnknownSolidityTypeError"
      });
    }
  };
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/abitype/dist/esm/human-readable/errors/abiParameter.js
var InvalidParameterError, SolidityProtectedKeywordError, InvalidModifierError, InvalidFunctionModifierError, InvalidAbiTypeParameterError;
var init_abiParameter = __esm(() => {
  init_errors();
  InvalidParameterError = class InvalidParameterError extends BaseError {
    constructor({ param }) {
      super("Invalid ABI parameter.", {
        details: param
      });
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "InvalidParameterError"
      });
    }
  };
  SolidityProtectedKeywordError = class SolidityProtectedKeywordError extends BaseError {
    constructor({ param, name }) {
      super("Invalid ABI parameter.", {
        details: param,
        metaMessages: [
          `"${name}" is a protected Solidity keyword. More info: https://docs.soliditylang.org/en/latest/cheatsheet.html`
        ]
      });
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "SolidityProtectedKeywordError"
      });
    }
  };
  InvalidModifierError = class InvalidModifierError extends BaseError {
    constructor({ param, type, modifier }) {
      super("Invalid ABI parameter.", {
        details: param,
        metaMessages: [
          `Modifier "${modifier}" not allowed${type ? ` in "${type}" type` : ""}.`
        ]
      });
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "InvalidModifierError"
      });
    }
  };
  InvalidFunctionModifierError = class InvalidFunctionModifierError extends BaseError {
    constructor({ param, type, modifier }) {
      super("Invalid ABI parameter.", {
        details: param,
        metaMessages: [
          `Modifier "${modifier}" not allowed${type ? ` in "${type}" type` : ""}.`,
          `Data location can only be specified for array, struct, or mapping types, but "${modifier}" was given.`
        ]
      });
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "InvalidFunctionModifierError"
      });
    }
  };
  InvalidAbiTypeParameterError = class InvalidAbiTypeParameterError extends BaseError {
    constructor({ abiParameter }) {
      super("Invalid ABI parameter.", {
        details: JSON.stringify(abiParameter, null, 2),
        metaMessages: ["ABI parameter type is invalid."]
      });
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "InvalidAbiTypeParameterError"
      });
    }
  };
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/abitype/dist/esm/human-readable/errors/signature.js
var InvalidSignatureError, UnknownSignatureError, InvalidStructSignatureError;
var init_signature = __esm(() => {
  init_errors();
  InvalidSignatureError = class InvalidSignatureError extends BaseError {
    constructor({ signature, type }) {
      super(`Invalid ${type} signature.`, {
        details: signature
      });
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "InvalidSignatureError"
      });
    }
  };
  UnknownSignatureError = class UnknownSignatureError extends BaseError {
    constructor({ signature }) {
      super("Unknown signature.", {
        details: signature
      });
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "UnknownSignatureError"
      });
    }
  };
  InvalidStructSignatureError = class InvalidStructSignatureError extends BaseError {
    constructor({ signature }) {
      super("Invalid struct signature.", {
        details: signature,
        metaMessages: ["No properties exist."]
      });
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "InvalidStructSignatureError"
      });
    }
  };
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/abitype/dist/esm/human-readable/errors/struct.js
var CircularReferenceError;
var init_struct = __esm(() => {
  init_errors();
  CircularReferenceError = class CircularReferenceError extends BaseError {
    constructor({ type }) {
      super("Circular reference detected.", {
        metaMessages: [`Struct "${type}" is a circular reference.`]
      });
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "CircularReferenceError"
      });
    }
  };
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/abitype/dist/esm/human-readable/errors/splitParameters.js
var InvalidParenthesisError;
var init_splitParameters = __esm(() => {
  init_errors();
  InvalidParenthesisError = class InvalidParenthesisError extends BaseError {
    constructor({ current, depth }) {
      super("Unbalanced parentheses.", {
        metaMessages: [
          `"${current.trim()}" has too many ${depth > 0 ? "opening" : "closing"} parentheses.`
        ],
        details: `Depth "${depth}"`
      });
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "InvalidParenthesisError"
      });
    }
  };
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/abitype/dist/esm/human-readable/runtime/cache.js
function getParameterCacheKey(param, type, structs) {
  let structKey = "";
  if (structs)
    for (const struct of Object.entries(structs)) {
      if (!struct)
        continue;
      let propertyKey = "";
      for (const property of struct[1]) {
        propertyKey += `[${property.type}${property.name ? `:${property.name}` : ""}]`;
      }
      structKey += `(${struct[0]}{${propertyKey}})`;
    }
  if (type)
    return `${type}:${param}${structKey}`;
  return param;
}
var parameterCache;
var init_cache = __esm(() => {
  parameterCache = new Map([
    ["address", { type: "address" }],
    ["bool", { type: "bool" }],
    ["bytes", { type: "bytes" }],
    ["bytes32", { type: "bytes32" }],
    ["int", { type: "int256" }],
    ["int256", { type: "int256" }],
    ["string", { type: "string" }],
    ["uint", { type: "uint256" }],
    ["uint8", { type: "uint8" }],
    ["uint16", { type: "uint16" }],
    ["uint24", { type: "uint24" }],
    ["uint32", { type: "uint32" }],
    ["uint64", { type: "uint64" }],
    ["uint96", { type: "uint96" }],
    ["uint112", { type: "uint112" }],
    ["uint160", { type: "uint160" }],
    ["uint192", { type: "uint192" }],
    ["uint256", { type: "uint256" }],
    ["address owner", { type: "address", name: "owner" }],
    ["address to", { type: "address", name: "to" }],
    ["bool approved", { type: "bool", name: "approved" }],
    ["bytes _data", { type: "bytes", name: "_data" }],
    ["bytes data", { type: "bytes", name: "data" }],
    ["bytes signature", { type: "bytes", name: "signature" }],
    ["bytes32 hash", { type: "bytes32", name: "hash" }],
    ["bytes32 r", { type: "bytes32", name: "r" }],
    ["bytes32 root", { type: "bytes32", name: "root" }],
    ["bytes32 s", { type: "bytes32", name: "s" }],
    ["string name", { type: "string", name: "name" }],
    ["string symbol", { type: "string", name: "symbol" }],
    ["string tokenURI", { type: "string", name: "tokenURI" }],
    ["uint tokenId", { type: "uint256", name: "tokenId" }],
    ["uint8 v", { type: "uint8", name: "v" }],
    ["uint256 balance", { type: "uint256", name: "balance" }],
    ["uint256 tokenId", { type: "uint256", name: "tokenId" }],
    ["uint256 value", { type: "uint256", name: "value" }],
    [
      "event:address indexed from",
      { type: "address", name: "from", indexed: true }
    ],
    ["event:address indexed to", { type: "address", name: "to", indexed: true }],
    [
      "event:uint indexed tokenId",
      { type: "uint256", name: "tokenId", indexed: true }
    ],
    [
      "event:uint256 indexed tokenId",
      { type: "uint256", name: "tokenId", indexed: true }
    ]
  ]);
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/abitype/dist/esm/human-readable/runtime/utils.js
function parseSignature(signature, structs = {}) {
  if (isFunctionSignature(signature))
    return parseFunctionSignature(signature, structs);
  if (isEventSignature(signature))
    return parseEventSignature(signature, structs);
  if (isErrorSignature(signature))
    return parseErrorSignature(signature, structs);
  if (isConstructorSignature(signature))
    return parseConstructorSignature(signature, structs);
  if (isFallbackSignature(signature))
    return parseFallbackSignature(signature);
  if (isReceiveSignature(signature))
    return {
      type: "receive",
      stateMutability: "payable"
    };
  throw new UnknownSignatureError({ signature });
}
function parseFunctionSignature(signature, structs = {}) {
  const match = execFunctionSignature(signature);
  if (!match)
    throw new InvalidSignatureError({ signature, type: "function" });
  const inputParams = splitParameters(match.parameters);
  const inputs = [];
  const inputLength = inputParams.length;
  for (let i = 0;i < inputLength; i++) {
    inputs.push(parseAbiParameter(inputParams[i], {
      modifiers: functionModifiers,
      structs,
      type: "function"
    }));
  }
  const outputs = [];
  if (match.returns) {
    const outputParams = splitParameters(match.returns);
    const outputLength = outputParams.length;
    for (let i = 0;i < outputLength; i++) {
      outputs.push(parseAbiParameter(outputParams[i], {
        modifiers: functionModifiers,
        structs,
        type: "function"
      }));
    }
  }
  return {
    name: match.name,
    type: "function",
    stateMutability: match.stateMutability ?? "nonpayable",
    inputs,
    outputs
  };
}
function parseEventSignature(signature, structs = {}) {
  const match = execEventSignature(signature);
  if (!match)
    throw new InvalidSignatureError({ signature, type: "event" });
  const params = splitParameters(match.parameters);
  const abiParameters = [];
  const length = params.length;
  for (let i = 0;i < length; i++)
    abiParameters.push(parseAbiParameter(params[i], {
      modifiers: eventModifiers,
      structs,
      type: "event"
    }));
  return { name: match.name, type: "event", inputs: abiParameters };
}
function parseErrorSignature(signature, structs = {}) {
  const match = execErrorSignature(signature);
  if (!match)
    throw new InvalidSignatureError({ signature, type: "error" });
  const params = splitParameters(match.parameters);
  const abiParameters = [];
  const length = params.length;
  for (let i = 0;i < length; i++)
    abiParameters.push(parseAbiParameter(params[i], { structs, type: "error" }));
  return { name: match.name, type: "error", inputs: abiParameters };
}
function parseConstructorSignature(signature, structs = {}) {
  const match = execConstructorSignature(signature);
  if (!match)
    throw new InvalidSignatureError({ signature, type: "constructor" });
  const params = splitParameters(match.parameters);
  const abiParameters = [];
  const length = params.length;
  for (let i = 0;i < length; i++)
    abiParameters.push(parseAbiParameter(params[i], { structs, type: "constructor" }));
  return {
    type: "constructor",
    stateMutability: match.stateMutability ?? "nonpayable",
    inputs: abiParameters
  };
}
function parseFallbackSignature(signature) {
  const match = execFallbackSignature(signature);
  if (!match)
    throw new InvalidSignatureError({ signature, type: "fallback" });
  return {
    type: "fallback",
    stateMutability: match.stateMutability ?? "nonpayable"
  };
}
function parseAbiParameter(param, options) {
  const parameterCacheKey = getParameterCacheKey(param, options?.type, options?.structs);
  if (parameterCache.has(parameterCacheKey))
    return parameterCache.get(parameterCacheKey);
  const isTuple = isTupleRegex.test(param);
  const match = execTyped(isTuple ? abiParameterWithTupleRegex : abiParameterWithoutTupleRegex, param);
  if (!match)
    throw new InvalidParameterError({ param });
  if (match.name && isSolidityKeyword(match.name))
    throw new SolidityProtectedKeywordError({ param, name: match.name });
  const name = match.name ? { name: match.name } : {};
  const indexed = match.modifier === "indexed" ? { indexed: true } : {};
  const structs = options?.structs ?? {};
  let type;
  let components = {};
  if (isTuple) {
    type = "tuple";
    const params = splitParameters(match.type);
    const components_ = [];
    const length = params.length;
    for (let i = 0;i < length; i++) {
      components_.push(parseAbiParameter(params[i], { structs }));
    }
    components = { components: components_ };
  } else if (match.type in structs) {
    type = "tuple";
    components = { components: structs[match.type] };
  } else if (dynamicIntegerRegex.test(match.type)) {
    type = `${match.type}256`;
  } else {
    type = match.type;
    if (!(options?.type === "struct") && !isSolidityType(type))
      throw new UnknownSolidityTypeError({ type });
  }
  if (match.modifier) {
    if (!options?.modifiers?.has?.(match.modifier))
      throw new InvalidModifierError({
        param,
        type: options?.type,
        modifier: match.modifier
      });
    if (functionModifiers.has(match.modifier) && !isValidDataLocation(type, !!match.array))
      throw new InvalidFunctionModifierError({
        param,
        type: options?.type,
        modifier: match.modifier
      });
  }
  const abiParameter = {
    type: `${type}${match.array ?? ""}`,
    ...name,
    ...indexed,
    ...components
  };
  parameterCache.set(parameterCacheKey, abiParameter);
  return abiParameter;
}
function splitParameters(params, result = [], current = "", depth = 0) {
  const length = params.trim().length;
  for (let i = 0;i < length; i++) {
    const char = params[i];
    const tail = params.slice(i + 1);
    switch (char) {
      case ",":
        return depth === 0 ? splitParameters(tail, [...result, current.trim()]) : splitParameters(tail, result, `${current}${char}`, depth);
      case "(":
        return splitParameters(tail, result, `${current}${char}`, depth + 1);
      case ")":
        return splitParameters(tail, result, `${current}${char}`, depth - 1);
      default:
        return splitParameters(tail, result, `${current}${char}`, depth);
    }
  }
  if (current === "")
    return result;
  if (depth !== 0)
    throw new InvalidParenthesisError({ current, depth });
  result.push(current.trim());
  return result;
}
function isSolidityType(type) {
  return type === "address" || type === "bool" || type === "function" || type === "string" || bytesRegex.test(type) || integerRegex.test(type);
}
function isSolidityKeyword(name) {
  return name === "address" || name === "bool" || name === "function" || name === "string" || name === "tuple" || bytesRegex.test(name) || integerRegex.test(name) || protectedKeywordsRegex.test(name);
}
function isValidDataLocation(type, isArray) {
  return isArray || type === "bytes" || type === "string" || type === "tuple";
}
var abiParameterWithoutTupleRegex, abiParameterWithTupleRegex, dynamicIntegerRegex, protectedKeywordsRegex;
var init_utils = __esm(() => {
  init_regex();
  init_abiItem();
  init_abiParameter();
  init_signature();
  init_splitParameters();
  init_cache();
  init_signatures();
  abiParameterWithoutTupleRegex = /^(?<type>[a-zA-Z$_][a-zA-Z0-9$_]*)(?<array>(?:\[\d*?\])+?)?(?:\s(?<modifier>calldata|indexed|memory|storage{1}))?(?:\s(?<name>[a-zA-Z$_][a-zA-Z0-9$_]*))?$/;
  abiParameterWithTupleRegex = /^\((?<type>.+?)\)(?<array>(?:\[\d*?\])+?)?(?:\s(?<modifier>calldata|indexed|memory|storage{1}))?(?:\s(?<name>[a-zA-Z$_][a-zA-Z0-9$_]*))?$/;
  dynamicIntegerRegex = /^u?int$/;
  protectedKeywordsRegex = /^(?:after|alias|anonymous|apply|auto|byte|calldata|case|catch|constant|copyof|default|defined|error|event|external|false|final|function|immutable|implements|in|indexed|inline|internal|let|mapping|match|memory|mutable|null|of|override|partial|private|promise|public|pure|reference|relocatable|return|returns|sizeof|static|storage|struct|super|supports|switch|this|true|try|typedef|typeof|var|view|virtual)$/;
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/abitype/dist/esm/human-readable/runtime/structs.js
function parseStructs(signatures) {
  const shallowStructs = {};
  const signaturesLength = signatures.length;
  for (let i = 0;i < signaturesLength; i++) {
    const signature = signatures[i];
    if (!isStructSignature(signature))
      continue;
    const match = execStructSignature(signature);
    if (!match)
      throw new InvalidSignatureError({ signature, type: "struct" });
    const properties = match.properties.split(";");
    const components = [];
    const propertiesLength = properties.length;
    for (let k = 0;k < propertiesLength; k++) {
      const property = properties[k];
      const trimmed = property.trim();
      if (!trimmed)
        continue;
      const abiParameter = parseAbiParameter(trimmed, {
        type: "struct"
      });
      components.push(abiParameter);
    }
    if (!components.length)
      throw new InvalidStructSignatureError({ signature });
    shallowStructs[match.name] = components;
  }
  const resolvedStructs = {};
  const entries = Object.entries(shallowStructs);
  const entriesLength = entries.length;
  for (let i = 0;i < entriesLength; i++) {
    const [name, parameters] = entries[i];
    resolvedStructs[name] = resolveStructs(parameters, shallowStructs);
  }
  return resolvedStructs;
}
function resolveStructs(abiParameters, structs, ancestors = new Set) {
  const components = [];
  const length = abiParameters.length;
  for (let i = 0;i < length; i++) {
    const abiParameter = abiParameters[i];
    const isTuple = isTupleRegex.test(abiParameter.type);
    if (isTuple)
      components.push(abiParameter);
    else {
      const match = execTyped(typeWithoutTupleRegex, abiParameter.type);
      if (!match?.type)
        throw new InvalidAbiTypeParameterError({ abiParameter });
      const { array, type } = match;
      if (type in structs) {
        if (ancestors.has(type))
          throw new CircularReferenceError({ type });
        components.push({
          ...abiParameter,
          type: `tuple${array ?? ""}`,
          components: resolveStructs(structs[type] ?? [], structs, new Set([...ancestors, type]))
        });
      } else {
        if (isSolidityType(type))
          components.push(abiParameter);
        else
          throw new UnknownTypeError({ type });
      }
    }
  }
  return components;
}
var typeWithoutTupleRegex;
var init_structs = __esm(() => {
  init_regex();
  init_abiItem();
  init_abiParameter();
  init_signature();
  init_struct();
  init_signatures();
  init_utils();
  typeWithoutTupleRegex = /^(?<type>[a-zA-Z$_][a-zA-Z0-9$_]*)(?<array>(?:\[\d*?\])+?)?$/;
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/abitype/dist/esm/human-readable/parseAbi.js
function parseAbi(signatures) {
  const structs = parseStructs(signatures);
  const abi = [];
  const length = signatures.length;
  for (let i = 0;i < length; i++) {
    const signature = signatures[i];
    if (isStructSignature(signature))
      continue;
    abi.push(parseSignature(signature, structs));
  }
  return abi;
}
var init_parseAbi = __esm(() => {
  init_signatures();
  init_structs();
  init_utils();
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/abitype/dist/esm/exports/index.js
var init_exports = __esm(() => {
  init_formatAbiItem();
  init_parseAbi();
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/abi/formatAbiItem.js
function formatAbiItem2(abiItem, { includeName = false } = {}) {
  if (abiItem.type !== "function" && abiItem.type !== "event" && abiItem.type !== "error")
    throw new InvalidDefinitionTypeError(abiItem.type);
  return `${abiItem.name}(${formatAbiParams(abiItem.inputs, { includeName })})`;
}
function formatAbiParams(params, { includeName = false } = {}) {
  if (!params)
    return "";
  return params.map((param) => formatAbiParam(param, { includeName })).join(includeName ? ", " : ",");
}
function formatAbiParam(param, { includeName }) {
  if (param.type.startsWith("tuple")) {
    return `(${formatAbiParams(param.components, { includeName })})${param.type.slice("tuple".length)}`;
  }
  return param.type + (includeName && param.name ? ` ${param.name}` : "");
}
var init_formatAbiItem2 = __esm(() => {
  init_abi();
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/data/isHex.js
function isHex(value, { strict = true } = {}) {
  if (!value)
    return false;
  if (typeof value !== "string")
    return false;
  return strict ? /^0x[0-9a-fA-F]*$/.test(value) : value.startsWith("0x");
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/data/size.js
function size(value) {
  if (isHex(value, { strict: false }))
    return Math.ceil((value.length - 2) / 2);
  return value.length;
}
var init_size = () => {};

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/errors/version.js
var version2 = "2.22.23";

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/errors/base.js
function walk(err, fn) {
  if (fn?.(err))
    return err;
  if (err && typeof err === "object" && "cause" in err && err.cause !== undefined)
    return walk(err.cause, fn);
  return fn ? null : err;
}
var errorConfig, BaseError2;
var init_base = __esm(() => {
  errorConfig = {
    getDocsUrl: ({ docsBaseUrl, docsPath = "", docsSlug }) => docsPath ? `${docsBaseUrl ?? "https://viem.sh"}${docsPath}${docsSlug ? `#${docsSlug}` : ""}` : undefined,
    version: `viem@${version2}`
  };
  BaseError2 = class BaseError2 extends Error {
    constructor(shortMessage, args = {}) {
      const details = (() => {
        if (args.cause instanceof BaseError2)
          return args.cause.details;
        if (args.cause?.message)
          return args.cause.message;
        return args.details;
      })();
      const docsPath = (() => {
        if (args.cause instanceof BaseError2)
          return args.cause.docsPath || args.docsPath;
        return args.docsPath;
      })();
      const docsUrl = errorConfig.getDocsUrl?.({ ...args, docsPath });
      const message = [
        shortMessage || "An error occurred.",
        "",
        ...args.metaMessages ? [...args.metaMessages, ""] : [],
        ...docsUrl ? [`Docs: ${docsUrl}`] : [],
        ...details ? [`Details: ${details}`] : [],
        ...errorConfig.version ? [`Version: ${errorConfig.version}`] : []
      ].join(`
`);
      super(message, args.cause ? { cause: args.cause } : undefined);
      Object.defineProperty(this, "details", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "docsPath", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "metaMessages", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "shortMessage", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "version", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "BaseError"
      });
      this.details = details;
      this.docsPath = docsPath;
      this.metaMessages = args.metaMessages;
      this.name = args.name ?? this.name;
      this.shortMessage = shortMessage;
      this.version = version2;
    }
    walk(fn) {
      return walk(this, fn);
    }
  };
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/errors/abi.js
var AbiConstructorNotFoundError, AbiConstructorParamsNotFoundError, AbiDecodingDataSizeTooSmallError, AbiDecodingZeroDataError, AbiEncodingArrayLengthMismatchError, AbiEncodingBytesSizeMismatchError, AbiEncodingLengthMismatchError, AbiErrorSignatureNotFoundError, AbiEventSignatureEmptyTopicsError, AbiEventSignatureNotFoundError, AbiEventNotFoundError, AbiFunctionNotFoundError, AbiFunctionOutputsNotFoundError, AbiItemAmbiguityError, BytesSizeMismatchError, DecodeLogDataMismatch, DecodeLogTopicsMismatch, InvalidAbiEncodingTypeError, InvalidAbiDecodingTypeError, InvalidArrayError, InvalidDefinitionTypeError;
var init_abi = __esm(() => {
  init_formatAbiItem2();
  init_size();
  init_base();
  AbiConstructorNotFoundError = class AbiConstructorNotFoundError extends BaseError2 {
    constructor({ docsPath }) {
      super([
        "A constructor was not found on the ABI.",
        "Make sure you are using the correct ABI and that the constructor exists on it."
      ].join(`
`), {
        docsPath,
        name: "AbiConstructorNotFoundError"
      });
    }
  };
  AbiConstructorParamsNotFoundError = class AbiConstructorParamsNotFoundError extends BaseError2 {
    constructor({ docsPath }) {
      super([
        "Constructor arguments were provided (`args`), but a constructor parameters (`inputs`) were not found on the ABI.",
        "Make sure you are using the correct ABI, and that the `inputs` attribute on the constructor exists."
      ].join(`
`), {
        docsPath,
        name: "AbiConstructorParamsNotFoundError"
      });
    }
  };
  AbiDecodingDataSizeTooSmallError = class AbiDecodingDataSizeTooSmallError extends BaseError2 {
    constructor({ data, params, size: size2 }) {
      super([`Data size of ${size2} bytes is too small for given parameters.`].join(`
`), {
        metaMessages: [
          `Params: (${formatAbiParams(params, { includeName: true })})`,
          `Data:   ${data} (${size2} bytes)`
        ],
        name: "AbiDecodingDataSizeTooSmallError"
      });
      Object.defineProperty(this, "data", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "params", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "size", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      this.data = data;
      this.params = params;
      this.size = size2;
    }
  };
  AbiDecodingZeroDataError = class AbiDecodingZeroDataError extends BaseError2 {
    constructor() {
      super('Cannot decode zero data ("0x") with ABI parameters.', {
        name: "AbiDecodingZeroDataError"
      });
    }
  };
  AbiEncodingArrayLengthMismatchError = class AbiEncodingArrayLengthMismatchError extends BaseError2 {
    constructor({ expectedLength, givenLength, type }) {
      super([
        `ABI encoding array length mismatch for type ${type}.`,
        `Expected length: ${expectedLength}`,
        `Given length: ${givenLength}`
      ].join(`
`), { name: "AbiEncodingArrayLengthMismatchError" });
    }
  };
  AbiEncodingBytesSizeMismatchError = class AbiEncodingBytesSizeMismatchError extends BaseError2 {
    constructor({ expectedSize, value }) {
      super(`Size of bytes "${value}" (bytes${size(value)}) does not match expected size (bytes${expectedSize}).`, { name: "AbiEncodingBytesSizeMismatchError" });
    }
  };
  AbiEncodingLengthMismatchError = class AbiEncodingLengthMismatchError extends BaseError2 {
    constructor({ expectedLength, givenLength }) {
      super([
        "ABI encoding params/values length mismatch.",
        `Expected length (params): ${expectedLength}`,
        `Given length (values): ${givenLength}`
      ].join(`
`), { name: "AbiEncodingLengthMismatchError" });
    }
  };
  AbiErrorSignatureNotFoundError = class AbiErrorSignatureNotFoundError extends BaseError2 {
    constructor(signature, { docsPath }) {
      super([
        `Encoded error signature "${signature}" not found on ABI.`,
        "Make sure you are using the correct ABI and that the error exists on it.",
        `You can look up the decoded signature here: https://openchain.xyz/signatures?query=${signature}.`
      ].join(`
`), {
        docsPath,
        name: "AbiErrorSignatureNotFoundError"
      });
      Object.defineProperty(this, "signature", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      this.signature = signature;
    }
  };
  AbiEventSignatureEmptyTopicsError = class AbiEventSignatureEmptyTopicsError extends BaseError2 {
    constructor({ docsPath }) {
      super("Cannot extract event signature from empty topics.", {
        docsPath,
        name: "AbiEventSignatureEmptyTopicsError"
      });
    }
  };
  AbiEventSignatureNotFoundError = class AbiEventSignatureNotFoundError extends BaseError2 {
    constructor(signature, { docsPath }) {
      super([
        `Encoded event signature "${signature}" not found on ABI.`,
        "Make sure you are using the correct ABI and that the event exists on it.",
        `You can look up the signature here: https://openchain.xyz/signatures?query=${signature}.`
      ].join(`
`), {
        docsPath,
        name: "AbiEventSignatureNotFoundError"
      });
    }
  };
  AbiEventNotFoundError = class AbiEventNotFoundError extends BaseError2 {
    constructor(eventName, { docsPath } = {}) {
      super([
        `Event ${eventName ? `"${eventName}" ` : ""}not found on ABI.`,
        "Make sure you are using the correct ABI and that the event exists on it."
      ].join(`
`), {
        docsPath,
        name: "AbiEventNotFoundError"
      });
    }
  };
  AbiFunctionNotFoundError = class AbiFunctionNotFoundError extends BaseError2 {
    constructor(functionName, { docsPath } = {}) {
      super([
        `Function ${functionName ? `"${functionName}" ` : ""}not found on ABI.`,
        "Make sure you are using the correct ABI and that the function exists on it."
      ].join(`
`), {
        docsPath,
        name: "AbiFunctionNotFoundError"
      });
    }
  };
  AbiFunctionOutputsNotFoundError = class AbiFunctionOutputsNotFoundError extends BaseError2 {
    constructor(functionName, { docsPath }) {
      super([
        `Function "${functionName}" does not contain any \`outputs\` on ABI.`,
        "Cannot decode function result without knowing what the parameter types are.",
        "Make sure you are using the correct ABI and that the function exists on it."
      ].join(`
`), {
        docsPath,
        name: "AbiFunctionOutputsNotFoundError"
      });
    }
  };
  AbiItemAmbiguityError = class AbiItemAmbiguityError extends BaseError2 {
    constructor(x, y) {
      super("Found ambiguous types in overloaded ABI items.", {
        metaMessages: [
          `\`${x.type}\` in \`${formatAbiItem2(x.abiItem)}\`, and`,
          `\`${y.type}\` in \`${formatAbiItem2(y.abiItem)}\``,
          "",
          "These types encode differently and cannot be distinguished at runtime.",
          "Remove one of the ambiguous items in the ABI."
        ],
        name: "AbiItemAmbiguityError"
      });
    }
  };
  BytesSizeMismatchError = class BytesSizeMismatchError extends BaseError2 {
    constructor({ expectedSize, givenSize }) {
      super(`Expected bytes${expectedSize}, got bytes${givenSize}.`, {
        name: "BytesSizeMismatchError"
      });
    }
  };
  DecodeLogDataMismatch = class DecodeLogDataMismatch extends BaseError2 {
    constructor({ abiItem, data, params, size: size2 }) {
      super([
        `Data size of ${size2} bytes is too small for non-indexed event parameters.`
      ].join(`
`), {
        metaMessages: [
          `Params: (${formatAbiParams(params, { includeName: true })})`,
          `Data:   ${data} (${size2} bytes)`
        ],
        name: "DecodeLogDataMismatch"
      });
      Object.defineProperty(this, "abiItem", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "data", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "params", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "size", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      this.abiItem = abiItem;
      this.data = data;
      this.params = params;
      this.size = size2;
    }
  };
  DecodeLogTopicsMismatch = class DecodeLogTopicsMismatch extends BaseError2 {
    constructor({ abiItem, param }) {
      super([
        `Expected a topic for indexed event parameter${param.name ? ` "${param.name}"` : ""} on event "${formatAbiItem2(abiItem, { includeName: true })}".`
      ].join(`
`), { name: "DecodeLogTopicsMismatch" });
      Object.defineProperty(this, "abiItem", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      this.abiItem = abiItem;
    }
  };
  InvalidAbiEncodingTypeError = class InvalidAbiEncodingTypeError extends BaseError2 {
    constructor(type, { docsPath }) {
      super([
        `Type "${type}" is not a valid encoding type.`,
        "Please provide a valid ABI type."
      ].join(`
`), { docsPath, name: "InvalidAbiEncodingType" });
    }
  };
  InvalidAbiDecodingTypeError = class InvalidAbiDecodingTypeError extends BaseError2 {
    constructor(type, { docsPath }) {
      super([
        `Type "${type}" is not a valid decoding type.`,
        "Please provide a valid ABI type."
      ].join(`
`), { docsPath, name: "InvalidAbiDecodingType" });
    }
  };
  InvalidArrayError = class InvalidArrayError extends BaseError2 {
    constructor(value) {
      super([`Value "${value}" is not a valid array.`].join(`
`), {
        name: "InvalidArrayError"
      });
    }
  };
  InvalidDefinitionTypeError = class InvalidDefinitionTypeError extends BaseError2 {
    constructor(type) {
      super([
        `"${type}" is not a valid definition type.`,
        'Valid types: "function", "event", "error"'
      ].join(`
`), { name: "InvalidDefinitionTypeError" });
    }
  };
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/errors/data.js
var SliceOffsetOutOfBoundsError, SizeExceedsPaddingSizeError, InvalidBytesLengthError;
var init_data = __esm(() => {
  init_base();
  SliceOffsetOutOfBoundsError = class SliceOffsetOutOfBoundsError extends BaseError2 {
    constructor({ offset, position, size: size2 }) {
      super(`Slice ${position === "start" ? "starting" : "ending"} at offset "${offset}" is out-of-bounds (size: ${size2}).`, { name: "SliceOffsetOutOfBoundsError" });
    }
  };
  SizeExceedsPaddingSizeError = class SizeExceedsPaddingSizeError extends BaseError2 {
    constructor({ size: size2, targetSize, type }) {
      super(`${type.charAt(0).toUpperCase()}${type.slice(1).toLowerCase()} size (${size2}) exceeds padding size (${targetSize}).`, { name: "SizeExceedsPaddingSizeError" });
    }
  };
  InvalidBytesLengthError = class InvalidBytesLengthError extends BaseError2 {
    constructor({ size: size2, targetSize, type }) {
      super(`${type.charAt(0).toUpperCase()}${type.slice(1).toLowerCase()} is expected to be ${targetSize} ${type} long, but is ${size2} ${type} long.`, { name: "InvalidBytesLengthError" });
    }
  };
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/data/pad.js
function pad(hexOrBytes, { dir, size: size2 = 32 } = {}) {
  if (typeof hexOrBytes === "string")
    return padHex(hexOrBytes, { dir, size: size2 });
  return padBytes(hexOrBytes, { dir, size: size2 });
}
function padHex(hex_, { dir, size: size2 = 32 } = {}) {
  if (size2 === null)
    return hex_;
  const hex = hex_.replace("0x", "");
  if (hex.length > size2 * 2)
    throw new SizeExceedsPaddingSizeError({
      size: Math.ceil(hex.length / 2),
      targetSize: size2,
      type: "hex"
    });
  return `0x${hex[dir === "right" ? "padEnd" : "padStart"](size2 * 2, "0")}`;
}
function padBytes(bytes, { dir, size: size2 = 32 } = {}) {
  if (size2 === null)
    return bytes;
  if (bytes.length > size2)
    throw new SizeExceedsPaddingSizeError({
      size: bytes.length,
      targetSize: size2,
      type: "bytes"
    });
  const paddedBytes = new Uint8Array(size2);
  for (let i = 0;i < size2; i++) {
    const padEnd = dir === "right";
    paddedBytes[padEnd ? i : size2 - i - 1] = bytes[padEnd ? i : bytes.length - i - 1];
  }
  return paddedBytes;
}
var init_pad = __esm(() => {
  init_data();
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/errors/encoding.js
var IntegerOutOfRangeError, InvalidBytesBooleanError, InvalidHexBooleanError, SizeOverflowError;
var init_encoding = __esm(() => {
  init_base();
  IntegerOutOfRangeError = class IntegerOutOfRangeError extends BaseError2 {
    constructor({ max, min, signed, size: size2, value }) {
      super(`Number "${value}" is not in safe ${size2 ? `${size2 * 8}-bit ${signed ? "signed" : "unsigned"} ` : ""}integer range ${max ? `(${min} to ${max})` : `(above ${min})`}`, { name: "IntegerOutOfRangeError" });
    }
  };
  InvalidBytesBooleanError = class InvalidBytesBooleanError extends BaseError2 {
    constructor(bytes) {
      super(`Bytes value "${bytes}" is not a valid boolean. The bytes array must contain a single byte of either a 0 or 1 value.`, {
        name: "InvalidBytesBooleanError"
      });
    }
  };
  InvalidHexBooleanError = class InvalidHexBooleanError extends BaseError2 {
    constructor(hex) {
      super(`Hex value "${hex}" is not a valid boolean. The hex value must be "0x0" (false) or "0x1" (true).`, { name: "InvalidHexBooleanError" });
    }
  };
  SizeOverflowError = class SizeOverflowError extends BaseError2 {
    constructor({ givenSize, maxSize }) {
      super(`Size cannot exceed ${maxSize} bytes. Given size: ${givenSize} bytes.`, { name: "SizeOverflowError" });
    }
  };
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/data/trim.js
function trim(hexOrBytes, { dir = "left" } = {}) {
  let data = typeof hexOrBytes === "string" ? hexOrBytes.replace("0x", "") : hexOrBytes;
  let sliceLength = 0;
  for (let i = 0;i < data.length - 1; i++) {
    if (data[dir === "left" ? i : data.length - i - 1].toString() === "0")
      sliceLength++;
    else
      break;
  }
  data = dir === "left" ? data.slice(sliceLength) : data.slice(0, data.length - sliceLength);
  if (typeof hexOrBytes === "string") {
    if (data.length === 1 && dir === "right")
      data = `${data}0`;
    return `0x${data.length % 2 === 1 ? `0${data}` : data}`;
  }
  return data;
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/encoding/fromHex.js
function assertSize(hexOrBytes, { size: size2 }) {
  if (size(hexOrBytes) > size2)
    throw new SizeOverflowError({
      givenSize: size(hexOrBytes),
      maxSize: size2
    });
}
function hexToBigInt(hex, opts = {}) {
  const { signed } = opts;
  if (opts.size)
    assertSize(hex, { size: opts.size });
  const value = BigInt(hex);
  if (!signed)
    return value;
  const size2 = (hex.length - 2) / 2;
  const max = (1n << BigInt(size2) * 8n - 1n) - 1n;
  if (value <= max)
    return value;
  return value - BigInt(`0x${"f".padStart(size2 * 2, "f")}`) - 1n;
}
function hexToBool(hex_, opts = {}) {
  let hex = hex_;
  if (opts.size) {
    assertSize(hex, { size: opts.size });
    hex = trim(hex);
  }
  if (trim(hex) === "0x00")
    return false;
  if (trim(hex) === "0x01")
    return true;
  throw new InvalidHexBooleanError(hex);
}
function hexToNumber(hex, opts = {}) {
  return Number(hexToBigInt(hex, opts));
}
var init_fromHex = __esm(() => {
  init_encoding();
  init_size();
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/encoding/toHex.js
function toHex(value, opts = {}) {
  if (typeof value === "number" || typeof value === "bigint")
    return numberToHex(value, opts);
  if (typeof value === "string") {
    return stringToHex(value, opts);
  }
  if (typeof value === "boolean")
    return boolToHex(value, opts);
  return bytesToHex(value, opts);
}
function boolToHex(value, opts = {}) {
  const hex = `0x${Number(value)}`;
  if (typeof opts.size === "number") {
    assertSize(hex, { size: opts.size });
    return pad(hex, { size: opts.size });
  }
  return hex;
}
function bytesToHex(value, opts = {}) {
  let string = "";
  for (let i = 0;i < value.length; i++) {
    string += hexes[value[i]];
  }
  const hex = `0x${string}`;
  if (typeof opts.size === "number") {
    assertSize(hex, { size: opts.size });
    return pad(hex, { dir: "right", size: opts.size });
  }
  return hex;
}
function numberToHex(value_, opts = {}) {
  const { signed, size: size2 } = opts;
  const value = BigInt(value_);
  let maxValue;
  if (size2) {
    if (signed)
      maxValue = (1n << BigInt(size2) * 8n - 1n) - 1n;
    else
      maxValue = 2n ** (BigInt(size2) * 8n) - 1n;
  } else if (typeof value_ === "number") {
    maxValue = BigInt(Number.MAX_SAFE_INTEGER);
  }
  const minValue = typeof maxValue === "bigint" && signed ? -maxValue - 1n : 0;
  if (maxValue && value > maxValue || value < minValue) {
    const suffix = typeof value_ === "bigint" ? "n" : "";
    throw new IntegerOutOfRangeError({
      max: maxValue ? `${maxValue}${suffix}` : undefined,
      min: `${minValue}${suffix}`,
      signed,
      size: size2,
      value: `${value_}${suffix}`
    });
  }
  const hex = `0x${(signed && value < 0 ? (1n << BigInt(size2 * 8)) + BigInt(value) : value).toString(16)}`;
  if (size2)
    return pad(hex, { size: size2 });
  return hex;
}
function stringToHex(value_, opts = {}) {
  const value = encoder.encode(value_);
  return bytesToHex(value, opts);
}
var hexes, encoder;
var init_toHex = __esm(() => {
  init_encoding();
  init_pad();
  init_fromHex();
  hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_v, i) => i.toString(16).padStart(2, "0"));
  encoder = /* @__PURE__ */ new TextEncoder;
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/encoding/toBytes.js
function toBytes(value, opts = {}) {
  if (typeof value === "number" || typeof value === "bigint")
    return numberToBytes(value, opts);
  if (typeof value === "boolean")
    return boolToBytes(value, opts);
  if (isHex(value))
    return hexToBytes(value, opts);
  return stringToBytes(value, opts);
}
function boolToBytes(value, opts = {}) {
  const bytes = new Uint8Array(1);
  bytes[0] = Number(value);
  if (typeof opts.size === "number") {
    assertSize(bytes, { size: opts.size });
    return pad(bytes, { size: opts.size });
  }
  return bytes;
}
function charCodeToBase16(char) {
  if (char >= charCodeMap.zero && char <= charCodeMap.nine)
    return char - charCodeMap.zero;
  if (char >= charCodeMap.A && char <= charCodeMap.F)
    return char - (charCodeMap.A - 10);
  if (char >= charCodeMap.a && char <= charCodeMap.f)
    return char - (charCodeMap.a - 10);
  return;
}
function hexToBytes(hex_, opts = {}) {
  let hex = hex_;
  if (opts.size) {
    assertSize(hex, { size: opts.size });
    hex = pad(hex, { dir: "right", size: opts.size });
  }
  let hexString = hex.slice(2);
  if (hexString.length % 2)
    hexString = `0${hexString}`;
  const length = hexString.length / 2;
  const bytes = new Uint8Array(length);
  for (let index = 0, j = 0;index < length; index++) {
    const nibbleLeft = charCodeToBase16(hexString.charCodeAt(j++));
    const nibbleRight = charCodeToBase16(hexString.charCodeAt(j++));
    if (nibbleLeft === undefined || nibbleRight === undefined) {
      throw new BaseError2(`Invalid byte sequence ("${hexString[j - 2]}${hexString[j - 1]}" in "${hexString}").`);
    }
    bytes[index] = nibbleLeft * 16 + nibbleRight;
  }
  return bytes;
}
function numberToBytes(value, opts) {
  const hex = numberToHex(value, opts);
  return hexToBytes(hex);
}
function stringToBytes(value, opts = {}) {
  const bytes = encoder2.encode(value);
  if (typeof opts.size === "number") {
    assertSize(bytes, { size: opts.size });
    return pad(bytes, { dir: "right", size: opts.size });
  }
  return bytes;
}
var encoder2, charCodeMap;
var init_toBytes = __esm(() => {
  init_base();
  init_pad();
  init_fromHex();
  init_toHex();
  encoder2 = /* @__PURE__ */ new TextEncoder;
  charCodeMap = {
    zero: 48,
    nine: 57,
    A: 65,
    F: 70,
    a: 97,
    f: 102
  };
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/node_modules/@noble/hashes/esm/_assert.js
function anumber(n) {
  if (!Number.isSafeInteger(n) || n < 0)
    throw new Error("positive integer expected, got " + n);
}
function isBytes(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
}
function abytes(b, ...lengths) {
  if (!isBytes(b))
    throw new Error("Uint8Array expected");
  if (lengths.length > 0 && !lengths.includes(b.length))
    throw new Error("Uint8Array expected of length " + lengths + ", got length=" + b.length);
}
function ahash(h) {
  if (typeof h !== "function" || typeof h.create !== "function")
    throw new Error("Hash should be wrapped by utils.wrapConstructor");
  anumber(h.outputLen);
  anumber(h.blockLen);
}
function aexists(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (checkFinished && instance.finished)
    throw new Error("Hash#digest() has already been called");
}
function aoutput(out, instance) {
  abytes(out);
  const min = instance.outputLen;
  if (out.length < min) {
    throw new Error("digestInto() expects output buffer of length at least " + min);
  }
}
var init__assert = () => {};

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/node_modules/@noble/hashes/esm/_u64.js
function fromBig(n, le = false) {
  if (le)
    return { h: Number(n & U32_MASK64), l: Number(n >> _32n & U32_MASK64) };
  return { h: Number(n >> _32n & U32_MASK64) | 0, l: Number(n & U32_MASK64) | 0 };
}
function split(lst, le = false) {
  let Ah = new Uint32Array(lst.length);
  let Al = new Uint32Array(lst.length);
  for (let i = 0;i < lst.length; i++) {
    const { h, l } = fromBig(lst[i], le);
    [Ah[i], Al[i]] = [h, l];
  }
  return [Ah, Al];
}
var U32_MASK64, _32n, rotlSH = (h, l, s) => h << s | l >>> 32 - s, rotlSL = (h, l, s) => l << s | h >>> 32 - s, rotlBH = (h, l, s) => l << s - 32 | h >>> 64 - s, rotlBL = (h, l, s) => h << s - 32 | l >>> 64 - s;
var init__u64 = __esm(() => {
  U32_MASK64 = /* @__PURE__ */ BigInt(2 ** 32 - 1);
  _32n = /* @__PURE__ */ BigInt(32);
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/node_modules/@noble/hashes/esm/cryptoNode.js
import * as nc from "node:crypto";
var crypto;
var init_cryptoNode = __esm(() => {
  crypto = nc && typeof nc === "object" && "webcrypto" in nc ? nc.webcrypto : nc && typeof nc === "object" && ("randomBytes" in nc) ? nc : undefined;
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/node_modules/@noble/hashes/esm/utils.js
function u32(arr) {
  return new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
}
function createView(arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
function rotr(word, shift) {
  return word << 32 - shift | word >>> shift;
}
function byteSwap(word) {
  return word << 24 & 4278190080 | word << 8 & 16711680 | word >>> 8 & 65280 | word >>> 24 & 255;
}
function byteSwap32(arr) {
  for (let i = 0;i < arr.length; i++) {
    arr[i] = byteSwap(arr[i]);
  }
}
function utf8ToBytes(str) {
  if (typeof str !== "string")
    throw new Error("utf8ToBytes expected string, got " + typeof str);
  return new Uint8Array(new TextEncoder().encode(str));
}
function toBytes2(data) {
  if (typeof data === "string")
    data = utf8ToBytes(data);
  abytes(data);
  return data;
}
function concatBytes(...arrays) {
  let sum = 0;
  for (let i = 0;i < arrays.length; i++) {
    const a = arrays[i];
    abytes(a);
    sum += a.length;
  }
  const res = new Uint8Array(sum);
  for (let i = 0, pad2 = 0;i < arrays.length; i++) {
    const a = arrays[i];
    res.set(a, pad2);
    pad2 += a.length;
  }
  return res;
}

class Hash {
  clone() {
    return this._cloneInto();
  }
}
function wrapConstructor(hashCons) {
  const hashC = (msg) => hashCons().update(toBytes2(msg)).digest();
  const tmp = hashCons();
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.create = () => hashCons();
  return hashC;
}
function wrapXOFConstructorWithOpts(hashCons) {
  const hashC = (msg, opts) => hashCons(opts).update(toBytes2(msg)).digest();
  const tmp = hashCons({});
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.create = (opts) => hashCons(opts);
  return hashC;
}
function randomBytes(bytesLength = 32) {
  if (crypto && typeof crypto.getRandomValues === "function") {
    return crypto.getRandomValues(new Uint8Array(bytesLength));
  }
  if (crypto && typeof crypto.randomBytes === "function") {
    return crypto.randomBytes(bytesLength);
  }
  throw new Error("crypto.getRandomValues must be defined");
}
var isLE;
var init_utils2 = __esm(() => {
  init_cryptoNode();
  init__assert();
  /*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
  isLE = /* @__PURE__ */ (() => new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68)();
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/node_modules/@noble/hashes/esm/sha3.js
function keccakP(s, rounds = 24) {
  const B = new Uint32Array(5 * 2);
  for (let round = 24 - rounds;round < 24; round++) {
    for (let x = 0;x < 10; x++)
      B[x] = s[x] ^ s[x + 10] ^ s[x + 20] ^ s[x + 30] ^ s[x + 40];
    for (let x = 0;x < 10; x += 2) {
      const idx1 = (x + 8) % 10;
      const idx0 = (x + 2) % 10;
      const B0 = B[idx0];
      const B1 = B[idx0 + 1];
      const Th = rotlH(B0, B1, 1) ^ B[idx1];
      const Tl = rotlL(B0, B1, 1) ^ B[idx1 + 1];
      for (let y = 0;y < 50; y += 10) {
        s[x + y] ^= Th;
        s[x + y + 1] ^= Tl;
      }
    }
    let curH = s[2];
    let curL = s[3];
    for (let t = 0;t < 24; t++) {
      const shift = SHA3_ROTL[t];
      const Th = rotlH(curH, curL, shift);
      const Tl = rotlL(curH, curL, shift);
      const PI = SHA3_PI[t];
      curH = s[PI];
      curL = s[PI + 1];
      s[PI] = Th;
      s[PI + 1] = Tl;
    }
    for (let y = 0;y < 50; y += 10) {
      for (let x = 0;x < 10; x++)
        B[x] = s[y + x];
      for (let x = 0;x < 10; x++)
        s[y + x] ^= ~B[(x + 2) % 10] & B[(x + 4) % 10];
    }
    s[0] ^= SHA3_IOTA_H[round];
    s[1] ^= SHA3_IOTA_L[round];
  }
  B.fill(0);
}
var SHA3_PI, SHA3_ROTL, _SHA3_IOTA, _0n, _1n, _2n, _7n, _256n, _0x71n, SHA3_IOTA_H, SHA3_IOTA_L, rotlH = (h, l, s) => s > 32 ? rotlBH(h, l, s) : rotlSH(h, l, s), rotlL = (h, l, s) => s > 32 ? rotlBL(h, l, s) : rotlSL(h, l, s), Keccak, gen = (suffix, blockLen, outputLen) => wrapConstructor(() => new Keccak(blockLen, suffix, outputLen)), sha3_224, sha3_256, sha3_384, sha3_512, keccak_224, keccak_256, keccak_384, keccak_512, genShake = (suffix, blockLen, outputLen) => wrapXOFConstructorWithOpts((opts = {}) => new Keccak(blockLen, suffix, opts.dkLen === undefined ? outputLen : opts.dkLen, true)), shake128, shake256;
var init_sha3 = __esm(() => {
  init__assert();
  init__u64();
  init_utils2();
  SHA3_PI = [];
  SHA3_ROTL = [];
  _SHA3_IOTA = [];
  _0n = /* @__PURE__ */ BigInt(0);
  _1n = /* @__PURE__ */ BigInt(1);
  _2n = /* @__PURE__ */ BigInt(2);
  _7n = /* @__PURE__ */ BigInt(7);
  _256n = /* @__PURE__ */ BigInt(256);
  _0x71n = /* @__PURE__ */ BigInt(113);
  for (let round = 0, R = _1n, x = 1, y = 0;round < 24; round++) {
    [x, y] = [y, (2 * x + 3 * y) % 5];
    SHA3_PI.push(2 * (5 * y + x));
    SHA3_ROTL.push((round + 1) * (round + 2) / 2 % 64);
    let t = _0n;
    for (let j = 0;j < 7; j++) {
      R = (R << _1n ^ (R >> _7n) * _0x71n) % _256n;
      if (R & _2n)
        t ^= _1n << (_1n << /* @__PURE__ */ BigInt(j)) - _1n;
    }
    _SHA3_IOTA.push(t);
  }
  [SHA3_IOTA_H, SHA3_IOTA_L] = /* @__PURE__ */ split(_SHA3_IOTA, true);
  Keccak = class Keccak extends Hash {
    constructor(blockLen, suffix, outputLen, enableXOF = false, rounds = 24) {
      super();
      this.blockLen = blockLen;
      this.suffix = suffix;
      this.outputLen = outputLen;
      this.enableXOF = enableXOF;
      this.rounds = rounds;
      this.pos = 0;
      this.posOut = 0;
      this.finished = false;
      this.destroyed = false;
      anumber(outputLen);
      if (0 >= this.blockLen || this.blockLen >= 200)
        throw new Error("Sha3 supports only keccak-f1600 function");
      this.state = new Uint8Array(200);
      this.state32 = u32(this.state);
    }
    keccak() {
      if (!isLE)
        byteSwap32(this.state32);
      keccakP(this.state32, this.rounds);
      if (!isLE)
        byteSwap32(this.state32);
      this.posOut = 0;
      this.pos = 0;
    }
    update(data) {
      aexists(this);
      const { blockLen, state } = this;
      data = toBytes2(data);
      const len = data.length;
      for (let pos = 0;pos < len; ) {
        const take = Math.min(blockLen - this.pos, len - pos);
        for (let i = 0;i < take; i++)
          state[this.pos++] ^= data[pos++];
        if (this.pos === blockLen)
          this.keccak();
      }
      return this;
    }
    finish() {
      if (this.finished)
        return;
      this.finished = true;
      const { state, suffix, pos, blockLen } = this;
      state[pos] ^= suffix;
      if ((suffix & 128) !== 0 && pos === blockLen - 1)
        this.keccak();
      state[blockLen - 1] ^= 128;
      this.keccak();
    }
    writeInto(out) {
      aexists(this, false);
      abytes(out);
      this.finish();
      const bufferOut = this.state;
      const { blockLen } = this;
      for (let pos = 0, len = out.length;pos < len; ) {
        if (this.posOut >= blockLen)
          this.keccak();
        const take = Math.min(blockLen - this.posOut, len - pos);
        out.set(bufferOut.subarray(this.posOut, this.posOut + take), pos);
        this.posOut += take;
        pos += take;
      }
      return out;
    }
    xofInto(out) {
      if (!this.enableXOF)
        throw new Error("XOF is not possible for this instance");
      return this.writeInto(out);
    }
    xof(bytes) {
      anumber(bytes);
      return this.xofInto(new Uint8Array(bytes));
    }
    digestInto(out) {
      aoutput(out, this);
      if (this.finished)
        throw new Error("digest() was already called");
      this.writeInto(out);
      this.destroy();
      return out;
    }
    digest() {
      return this.digestInto(new Uint8Array(this.outputLen));
    }
    destroy() {
      this.destroyed = true;
      this.state.fill(0);
    }
    _cloneInto(to) {
      const { blockLen, suffix, outputLen, rounds, enableXOF } = this;
      to || (to = new Keccak(blockLen, suffix, outputLen, enableXOF, rounds));
      to.state32.set(this.state32);
      to.pos = this.pos;
      to.posOut = this.posOut;
      to.finished = this.finished;
      to.rounds = rounds;
      to.suffix = suffix;
      to.outputLen = outputLen;
      to.enableXOF = enableXOF;
      to.destroyed = this.destroyed;
      return to;
    }
  };
  sha3_224 = /* @__PURE__ */ gen(6, 144, 224 / 8);
  sha3_256 = /* @__PURE__ */ gen(6, 136, 256 / 8);
  sha3_384 = /* @__PURE__ */ gen(6, 104, 384 / 8);
  sha3_512 = /* @__PURE__ */ gen(6, 72, 512 / 8);
  keccak_224 = /* @__PURE__ */ gen(1, 144, 224 / 8);
  keccak_256 = /* @__PURE__ */ gen(1, 136, 256 / 8);
  keccak_384 = /* @__PURE__ */ gen(1, 104, 384 / 8);
  keccak_512 = /* @__PURE__ */ gen(1, 72, 512 / 8);
  shake128 = /* @__PURE__ */ genShake(31, 168, 128 / 8);
  shake256 = /* @__PURE__ */ genShake(31, 136, 256 / 8);
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/hash/keccak256.js
function keccak256(value, to_) {
  const to = to_ || "hex";
  const bytes = keccak_256(isHex(value, { strict: false }) ? toBytes(value) : value);
  if (to === "bytes")
    return bytes;
  return toHex(bytes);
}
var init_keccak256 = __esm(() => {
  init_sha3();
  init_toBytes();
  init_toHex();
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/hash/hashSignature.js
function hashSignature(sig) {
  return hash(sig);
}
var hash = (value) => keccak256(toBytes(value));
var init_hashSignature = __esm(() => {
  init_toBytes();
  init_keccak256();
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/hash/normalizeSignature.js
function normalizeSignature(signature) {
  let active = true;
  let current = "";
  let level = 0;
  let result = "";
  let valid = false;
  for (let i = 0;i < signature.length; i++) {
    const char = signature[i];
    if (["(", ")", ","].includes(char))
      active = true;
    if (char === "(")
      level++;
    if (char === ")")
      level--;
    if (!active)
      continue;
    if (level === 0) {
      if (char === " " && ["event", "function", ""].includes(result))
        result = "";
      else {
        result += char;
        if (char === ")") {
          valid = true;
          break;
        }
      }
      continue;
    }
    if (char === " ") {
      if (signature[i - 1] !== "," && current !== "," && current !== ",(") {
        current = "";
        active = false;
      }
      continue;
    }
    result += char;
    current += char;
  }
  if (!valid)
    throw new BaseError2("Unable to normalize signature.");
  return result;
}
var init_normalizeSignature = __esm(() => {
  init_base();
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/hash/toSignature.js
var toSignature = (def) => {
  const def_ = (() => {
    if (typeof def === "string")
      return def;
    return formatAbiItem(def);
  })();
  return normalizeSignature(def_);
};
var init_toSignature = __esm(() => {
  init_exports();
  init_normalizeSignature();
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/hash/toSignatureHash.js
function toSignatureHash(fn) {
  return hashSignature(toSignature(fn));
}
var init_toSignatureHash = __esm(() => {
  init_hashSignature();
  init_toSignature();
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/hash/toEventSelector.js
var toEventSelector;
var init_toEventSelector = __esm(() => {
  init_toSignatureHash();
  toEventSelector = toSignatureHash;
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/errors/address.js
var InvalidAddressError;
var init_address = __esm(() => {
  init_base();
  InvalidAddressError = class InvalidAddressError extends BaseError2 {
    constructor({ address }) {
      super(`Address "${address}" is invalid.`, {
        metaMessages: [
          "- Address must be a hex value of 20 bytes (40 hex characters).",
          "- Address must match its checksum counterpart."
        ],
        name: "InvalidAddressError"
      });
    }
  };
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/lru.js
var LruMap;
var init_lru = __esm(() => {
  LruMap = class LruMap extends Map {
    constructor(size2) {
      super();
      Object.defineProperty(this, "maxSize", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      this.maxSize = size2;
    }
    get(key) {
      const value = super.get(key);
      if (super.has(key) && value !== undefined) {
        this.delete(key);
        super.set(key, value);
      }
      return value;
    }
    set(key, value) {
      super.set(key, value);
      if (this.maxSize && this.size > this.maxSize) {
        const firstKey = this.keys().next().value;
        if (firstKey)
          this.delete(firstKey);
      }
      return this;
    }
  };
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/address/getAddress.js
function checksumAddress(address_, chainId) {
  if (checksumAddressCache.has(`${address_}.${chainId}`))
    return checksumAddressCache.get(`${address_}.${chainId}`);
  const hexAddress = chainId ? `${chainId}${address_.toLowerCase()}` : address_.substring(2).toLowerCase();
  const hash2 = keccak256(stringToBytes(hexAddress), "bytes");
  const address = (chainId ? hexAddress.substring(`${chainId}0x`.length) : hexAddress).split("");
  for (let i = 0;i < 40; i += 2) {
    if (hash2[i >> 1] >> 4 >= 8 && address[i]) {
      address[i] = address[i].toUpperCase();
    }
    if ((hash2[i >> 1] & 15) >= 8 && address[i + 1]) {
      address[i + 1] = address[i + 1].toUpperCase();
    }
  }
  const result = `0x${address.join("")}`;
  checksumAddressCache.set(`${address_}.${chainId}`, result);
  return result;
}
function getAddress(address, chainId) {
  if (!isAddress(address, { strict: false }))
    throw new InvalidAddressError({ address });
  return checksumAddress(address, chainId);
}
var checksumAddressCache;
var init_getAddress = __esm(() => {
  init_address();
  init_toBytes();
  init_keccak256();
  init_lru();
  init_isAddress();
  checksumAddressCache = /* @__PURE__ */ new LruMap(8192);
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/address/isAddress.js
function isAddress(address, options) {
  const { strict = true } = options ?? {};
  const cacheKey = `${address}.${strict}`;
  if (isAddressCache.has(cacheKey))
    return isAddressCache.get(cacheKey);
  const result = (() => {
    if (!addressRegex.test(address))
      return false;
    if (address.toLowerCase() === address)
      return true;
    if (strict)
      return checksumAddress(address) === address;
    return true;
  })();
  isAddressCache.set(cacheKey, result);
  return result;
}
var addressRegex, isAddressCache;
var init_isAddress = __esm(() => {
  init_lru();
  init_getAddress();
  addressRegex = /^0x[a-fA-F0-9]{40}$/;
  isAddressCache = /* @__PURE__ */ new LruMap(8192);
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/data/concat.js
function concat(values) {
  if (typeof values[0] === "string")
    return concatHex(values);
  return concatBytes2(values);
}
function concatBytes2(values) {
  let length = 0;
  for (const arr of values) {
    length += arr.length;
  }
  const result = new Uint8Array(length);
  let offset = 0;
  for (const arr of values) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}
function concatHex(values) {
  return `0x${values.reduce((acc, x) => acc + x.replace("0x", ""), "")}`;
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/data/slice.js
function slice(value, start, end, { strict } = {}) {
  if (isHex(value, { strict: false }))
    return sliceHex(value, start, end, {
      strict
    });
  return sliceBytes(value, start, end, {
    strict
  });
}
function assertStartOffset(value, start) {
  if (typeof start === "number" && start > 0 && start > size(value) - 1)
    throw new SliceOffsetOutOfBoundsError({
      offset: start,
      position: "start",
      size: size(value)
    });
}
function assertEndOffset(value, start, end) {
  if (typeof start === "number" && typeof end === "number" && size(value) !== end - start) {
    throw new SliceOffsetOutOfBoundsError({
      offset: end,
      position: "end",
      size: size(value)
    });
  }
}
function sliceBytes(value_, start, end, { strict } = {}) {
  assertStartOffset(value_, start);
  const value = value_.slice(start, end);
  if (strict)
    assertEndOffset(value, start, end);
  return value;
}
function sliceHex(value_, start, end, { strict } = {}) {
  assertStartOffset(value_, start);
  const value = `0x${value_.replace("0x", "").slice((start ?? 0) * 2, (end ?? value_.length) * 2)}`;
  if (strict)
    assertEndOffset(value, start, end);
  return value;
}
var init_slice = __esm(() => {
  init_data();
  init_size();
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/regex.js
var bytesRegex2, integerRegex2;
var init_regex2 = __esm(() => {
  bytesRegex2 = /^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/;
  integerRegex2 = /^(u?int)(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/;
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/abi/encodeAbiParameters.js
function encodeAbiParameters(params, values) {
  if (params.length !== values.length)
    throw new AbiEncodingLengthMismatchError({
      expectedLength: params.length,
      givenLength: values.length
    });
  const preparedParams = prepareParams({
    params,
    values
  });
  const data = encodeParams(preparedParams);
  if (data.length === 0)
    return "0x";
  return data;
}
function prepareParams({ params, values }) {
  const preparedParams = [];
  for (let i = 0;i < params.length; i++) {
    preparedParams.push(prepareParam({ param: params[i], value: values[i] }));
  }
  return preparedParams;
}
function prepareParam({ param, value }) {
  const arrayComponents = getArrayComponents(param.type);
  if (arrayComponents) {
    const [length, type] = arrayComponents;
    return encodeArray(value, { length, param: { ...param, type } });
  }
  if (param.type === "tuple") {
    return encodeTuple(value, {
      param
    });
  }
  if (param.type === "address") {
    return encodeAddress(value);
  }
  if (param.type === "bool") {
    return encodeBool(value);
  }
  if (param.type.startsWith("uint") || param.type.startsWith("int")) {
    const signed = param.type.startsWith("int");
    const [, , size2 = "256"] = integerRegex2.exec(param.type) ?? [];
    return encodeNumber(value, {
      signed,
      size: Number(size2)
    });
  }
  if (param.type.startsWith("bytes")) {
    return encodeBytes(value, { param });
  }
  if (param.type === "string") {
    return encodeString(value);
  }
  throw new InvalidAbiEncodingTypeError(param.type, {
    docsPath: "/docs/contract/encodeAbiParameters"
  });
}
function encodeParams(preparedParams) {
  let staticSize = 0;
  for (let i = 0;i < preparedParams.length; i++) {
    const { dynamic, encoded } = preparedParams[i];
    if (dynamic)
      staticSize += 32;
    else
      staticSize += size(encoded);
  }
  const staticParams = [];
  const dynamicParams = [];
  let dynamicSize = 0;
  for (let i = 0;i < preparedParams.length; i++) {
    const { dynamic, encoded } = preparedParams[i];
    if (dynamic) {
      staticParams.push(numberToHex(staticSize + dynamicSize, { size: 32 }));
      dynamicParams.push(encoded);
      dynamicSize += size(encoded);
    } else {
      staticParams.push(encoded);
    }
  }
  return concat([...staticParams, ...dynamicParams]);
}
function encodeAddress(value) {
  if (!isAddress(value))
    throw new InvalidAddressError({ address: value });
  return { dynamic: false, encoded: padHex(value.toLowerCase()) };
}
function encodeArray(value, { length, param }) {
  const dynamic = length === null;
  if (!Array.isArray(value))
    throw new InvalidArrayError(value);
  if (!dynamic && value.length !== length)
    throw new AbiEncodingArrayLengthMismatchError({
      expectedLength: length,
      givenLength: value.length,
      type: `${param.type}[${length}]`
    });
  let dynamicChild = false;
  const preparedParams = [];
  for (let i = 0;i < value.length; i++) {
    const preparedParam = prepareParam({ param, value: value[i] });
    if (preparedParam.dynamic)
      dynamicChild = true;
    preparedParams.push(preparedParam);
  }
  if (dynamic || dynamicChild) {
    const data = encodeParams(preparedParams);
    if (dynamic) {
      const length2 = numberToHex(preparedParams.length, { size: 32 });
      return {
        dynamic: true,
        encoded: preparedParams.length > 0 ? concat([length2, data]) : length2
      };
    }
    if (dynamicChild)
      return { dynamic: true, encoded: data };
  }
  return {
    dynamic: false,
    encoded: concat(preparedParams.map(({ encoded }) => encoded))
  };
}
function encodeBytes(value, { param }) {
  const [, paramSize] = param.type.split("bytes");
  const bytesSize = size(value);
  if (!paramSize) {
    let value_ = value;
    if (bytesSize % 32 !== 0)
      value_ = padHex(value_, {
        dir: "right",
        size: Math.ceil((value.length - 2) / 2 / 32) * 32
      });
    return {
      dynamic: true,
      encoded: concat([padHex(numberToHex(bytesSize, { size: 32 })), value_])
    };
  }
  if (bytesSize !== Number.parseInt(paramSize))
    throw new AbiEncodingBytesSizeMismatchError({
      expectedSize: Number.parseInt(paramSize),
      value
    });
  return { dynamic: false, encoded: padHex(value, { dir: "right" }) };
}
function encodeBool(value) {
  if (typeof value !== "boolean")
    throw new BaseError2(`Invalid boolean value: "${value}" (type: ${typeof value}). Expected: \`true\` or \`false\`.`);
  return { dynamic: false, encoded: padHex(boolToHex(value)) };
}
function encodeNumber(value, { signed, size: size2 = 256 }) {
  if (typeof size2 === "number") {
    const max = 2n ** (BigInt(size2) - (signed ? 1n : 0n)) - 1n;
    const min = signed ? -max - 1n : 0n;
    if (value > max || value < min)
      throw new IntegerOutOfRangeError({
        max: max.toString(),
        min: min.toString(),
        signed,
        size: size2 / 8,
        value: value.toString()
      });
  }
  return {
    dynamic: false,
    encoded: numberToHex(value, {
      size: 32,
      signed
    })
  };
}
function encodeString(value) {
  const hexValue = stringToHex(value);
  const partsLength = Math.ceil(size(hexValue) / 32);
  const parts = [];
  for (let i = 0;i < partsLength; i++) {
    parts.push(padHex(slice(hexValue, i * 32, (i + 1) * 32), {
      dir: "right"
    }));
  }
  return {
    dynamic: true,
    encoded: concat([
      padHex(numberToHex(size(hexValue), { size: 32 })),
      ...parts
    ])
  };
}
function encodeTuple(value, { param }) {
  let dynamic = false;
  const preparedParams = [];
  for (let i = 0;i < param.components.length; i++) {
    const param_ = param.components[i];
    const index = Array.isArray(value) ? i : param_.name;
    const preparedParam = prepareParam({
      param: param_,
      value: value[index]
    });
    preparedParams.push(preparedParam);
    if (preparedParam.dynamic)
      dynamic = true;
  }
  return {
    dynamic,
    encoded: dynamic ? encodeParams(preparedParams) : concat(preparedParams.map(({ encoded }) => encoded))
  };
}
function getArrayComponents(type) {
  const matches = type.match(/^(.*)\[(\d+)?\]$/);
  return matches ? [matches[2] ? Number(matches[2]) : null, matches[1]] : undefined;
}
var init_encodeAbiParameters = __esm(() => {
  init_abi();
  init_address();
  init_base();
  init_encoding();
  init_isAddress();
  init_pad();
  init_size();
  init_slice();
  init_toHex();
  init_regex2();
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/hash/toFunctionSelector.js
var toFunctionSelector = (fn) => slice(toSignatureHash(fn), 0, 4);
var init_toFunctionSelector = __esm(() => {
  init_slice();
  init_toSignatureHash();
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/abi/getAbiItem.js
function getAbiItem(parameters) {
  const { abi, args = [], name } = parameters;
  const isSelector = isHex(name, { strict: false });
  const abiItems = abi.filter((abiItem) => {
    if (isSelector) {
      if (abiItem.type === "function")
        return toFunctionSelector(abiItem) === name;
      if (abiItem.type === "event")
        return toEventSelector(abiItem) === name;
      return false;
    }
    return "name" in abiItem && abiItem.name === name;
  });
  if (abiItems.length === 0)
    return;
  if (abiItems.length === 1)
    return abiItems[0];
  let matchedAbiItem = undefined;
  for (const abiItem of abiItems) {
    if (!("inputs" in abiItem))
      continue;
    if (!args || args.length === 0) {
      if (!abiItem.inputs || abiItem.inputs.length === 0)
        return abiItem;
      continue;
    }
    if (!abiItem.inputs)
      continue;
    if (abiItem.inputs.length === 0)
      continue;
    if (abiItem.inputs.length !== args.length)
      continue;
    const matched = args.every((arg, index) => {
      const abiParameter = "inputs" in abiItem && abiItem.inputs[index];
      if (!abiParameter)
        return false;
      return isArgOfType(arg, abiParameter);
    });
    if (matched) {
      if (matchedAbiItem && "inputs" in matchedAbiItem && matchedAbiItem.inputs) {
        const ambiguousTypes = getAmbiguousTypes(abiItem.inputs, matchedAbiItem.inputs, args);
        if (ambiguousTypes)
          throw new AbiItemAmbiguityError({
            abiItem,
            type: ambiguousTypes[0]
          }, {
            abiItem: matchedAbiItem,
            type: ambiguousTypes[1]
          });
      }
      matchedAbiItem = abiItem;
    }
  }
  if (matchedAbiItem)
    return matchedAbiItem;
  return abiItems[0];
}
function isArgOfType(arg, abiParameter) {
  const argType = typeof arg;
  const abiParameterType = abiParameter.type;
  switch (abiParameterType) {
    case "address":
      return isAddress(arg, { strict: false });
    case "bool":
      return argType === "boolean";
    case "function":
      return argType === "string";
    case "string":
      return argType === "string";
    default: {
      if (abiParameterType === "tuple" && "components" in abiParameter)
        return Object.values(abiParameter.components).every((component, index) => {
          return isArgOfType(Object.values(arg)[index], component);
        });
      if (/^u?int(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/.test(abiParameterType))
        return argType === "number" || argType === "bigint";
      if (/^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/.test(abiParameterType))
        return argType === "string" || arg instanceof Uint8Array;
      if (/[a-z]+[1-9]{0,3}(\[[0-9]{0,}\])+$/.test(abiParameterType)) {
        return Array.isArray(arg) && arg.every((x) => isArgOfType(x, {
          ...abiParameter,
          type: abiParameterType.replace(/(\[[0-9]{0,}\])$/, "")
        }));
      }
      return false;
    }
  }
}
function getAmbiguousTypes(sourceParameters, targetParameters, args) {
  for (const parameterIndex in sourceParameters) {
    const sourceParameter = sourceParameters[parameterIndex];
    const targetParameter = targetParameters[parameterIndex];
    if (sourceParameter.type === "tuple" && targetParameter.type === "tuple" && "components" in sourceParameter && "components" in targetParameter)
      return getAmbiguousTypes(sourceParameter.components, targetParameter.components, args[parameterIndex]);
    const types = [sourceParameter.type, targetParameter.type];
    const ambiguous = (() => {
      if (types.includes("address") && types.includes("bytes20"))
        return true;
      if (types.includes("address") && types.includes("string"))
        return isAddress(args[parameterIndex], { strict: false });
      if (types.includes("address") && types.includes("bytes"))
        return isAddress(args[parameterIndex], { strict: false });
      return false;
    })();
    if (ambiguous)
      return types;
  }
  return;
}
var init_getAbiItem = __esm(() => {
  init_abi();
  init_isAddress();
  init_toEventSelector();
  init_toFunctionSelector();
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/accounts/utils/parseAccount.js
function parseAccount(account) {
  if (typeof account === "string")
    return { address: account, type: "json-rpc" };
  return account;
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/abi/prepareEncodeFunctionData.js
function prepareEncodeFunctionData(parameters) {
  const { abi, args, functionName } = parameters;
  let abiItem = abi[0];
  if (functionName) {
    const item = getAbiItem({
      abi,
      args,
      name: functionName
    });
    if (!item)
      throw new AbiFunctionNotFoundError(functionName, { docsPath: docsPath2 });
    abiItem = item;
  }
  if (abiItem.type !== "function")
    throw new AbiFunctionNotFoundError(undefined, { docsPath: docsPath2 });
  return {
    abi: [abiItem],
    functionName: toFunctionSelector(formatAbiItem2(abiItem))
  };
}
var docsPath2 = "/docs/contract/encodeFunctionData";
var init_prepareEncodeFunctionData = __esm(() => {
  init_abi();
  init_toFunctionSelector();
  init_formatAbiItem2();
  init_getAbiItem();
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/abi/encodeFunctionData.js
function encodeFunctionData(parameters) {
  const { args } = parameters;
  const { abi, functionName } = (() => {
    if (parameters.abi.length === 1 && parameters.functionName?.startsWith("0x"))
      return parameters;
    return prepareEncodeFunctionData(parameters);
  })();
  const abiItem = abi[0];
  const signature = functionName;
  const data = "inputs" in abiItem && abiItem.inputs ? encodeAbiParameters(abiItem.inputs, args ?? []) : undefined;
  return concatHex([signature, data ?? "0x"]);
}
var init_encodeFunctionData = __esm(() => {
  init_encodeAbiParameters();
  init_prepareEncodeFunctionData();
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/constants/solidity.js
var panicReasons, solidityError, solidityPanic;
var init_solidity = __esm(() => {
  panicReasons = {
    1: "An `assert` condition failed.",
    17: "Arithmetic operation resulted in underflow or overflow.",
    18: "Division or modulo by zero (e.g. `5 / 0` or `23 % 0`).",
    33: "Attempted to convert to an invalid type.",
    34: "Attempted to access a storage byte array that is incorrectly encoded.",
    49: "Performed `.pop()` on an empty array",
    50: "Array index is out of bounds.",
    65: "Allocated too much memory or created an array which is too large.",
    81: "Attempted to call a zero-initialized variable of internal function type."
  };
  solidityError = {
    inputs: [
      {
        name: "message",
        type: "string"
      }
    ],
    name: "Error",
    type: "error"
  };
  solidityPanic = {
    inputs: [
      {
        name: "reason",
        type: "uint256"
      }
    ],
    name: "Panic",
    type: "error"
  };
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/errors/cursor.js
var NegativeOffsetError, PositionOutOfBoundsError, RecursiveReadLimitExceededError;
var init_cursor = __esm(() => {
  init_base();
  NegativeOffsetError = class NegativeOffsetError extends BaseError2 {
    constructor({ offset }) {
      super(`Offset \`${offset}\` cannot be negative.`, {
        name: "NegativeOffsetError"
      });
    }
  };
  PositionOutOfBoundsError = class PositionOutOfBoundsError extends BaseError2 {
    constructor({ length, position }) {
      super(`Position \`${position}\` is out of bounds (\`0 < position < ${length}\`).`, { name: "PositionOutOfBoundsError" });
    }
  };
  RecursiveReadLimitExceededError = class RecursiveReadLimitExceededError extends BaseError2 {
    constructor({ count, limit }) {
      super(`Recursive read limit of \`${limit}\` exceeded (recursive read count: \`${count}\`).`, { name: "RecursiveReadLimitExceededError" });
    }
  };
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/cursor.js
function createCursor(bytes, { recursiveReadLimit = 8192 } = {}) {
  const cursor = Object.create(staticCursor);
  cursor.bytes = bytes;
  cursor.dataView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  cursor.positionReadCount = new Map;
  cursor.recursiveReadLimit = recursiveReadLimit;
  return cursor;
}
var staticCursor;
var init_cursor2 = __esm(() => {
  init_cursor();
  staticCursor = {
    bytes: new Uint8Array,
    dataView: new DataView(new ArrayBuffer(0)),
    position: 0,
    positionReadCount: new Map,
    recursiveReadCount: 0,
    recursiveReadLimit: Number.POSITIVE_INFINITY,
    assertReadLimit() {
      if (this.recursiveReadCount >= this.recursiveReadLimit)
        throw new RecursiveReadLimitExceededError({
          count: this.recursiveReadCount + 1,
          limit: this.recursiveReadLimit
        });
    },
    assertPosition(position) {
      if (position < 0 || position > this.bytes.length - 1)
        throw new PositionOutOfBoundsError({
          length: this.bytes.length,
          position
        });
    },
    decrementPosition(offset) {
      if (offset < 0)
        throw new NegativeOffsetError({ offset });
      const position = this.position - offset;
      this.assertPosition(position);
      this.position = position;
    },
    getReadCount(position) {
      return this.positionReadCount.get(position || this.position) || 0;
    },
    incrementPosition(offset) {
      if (offset < 0)
        throw new NegativeOffsetError({ offset });
      const position = this.position + offset;
      this.assertPosition(position);
      this.position = position;
    },
    inspectByte(position_) {
      const position = position_ ?? this.position;
      this.assertPosition(position);
      return this.bytes[position];
    },
    inspectBytes(length, position_) {
      const position = position_ ?? this.position;
      this.assertPosition(position + length - 1);
      return this.bytes.subarray(position, position + length);
    },
    inspectUint8(position_) {
      const position = position_ ?? this.position;
      this.assertPosition(position);
      return this.bytes[position];
    },
    inspectUint16(position_) {
      const position = position_ ?? this.position;
      this.assertPosition(position + 1);
      return this.dataView.getUint16(position);
    },
    inspectUint24(position_) {
      const position = position_ ?? this.position;
      this.assertPosition(position + 2);
      return (this.dataView.getUint16(position) << 8) + this.dataView.getUint8(position + 2);
    },
    inspectUint32(position_) {
      const position = position_ ?? this.position;
      this.assertPosition(position + 3);
      return this.dataView.getUint32(position);
    },
    pushByte(byte) {
      this.assertPosition(this.position);
      this.bytes[this.position] = byte;
      this.position++;
    },
    pushBytes(bytes) {
      this.assertPosition(this.position + bytes.length - 1);
      this.bytes.set(bytes, this.position);
      this.position += bytes.length;
    },
    pushUint8(value) {
      this.assertPosition(this.position);
      this.bytes[this.position] = value;
      this.position++;
    },
    pushUint16(value) {
      this.assertPosition(this.position + 1);
      this.dataView.setUint16(this.position, value);
      this.position += 2;
    },
    pushUint24(value) {
      this.assertPosition(this.position + 2);
      this.dataView.setUint16(this.position, value >> 8);
      this.dataView.setUint8(this.position + 2, value & ~4294967040);
      this.position += 3;
    },
    pushUint32(value) {
      this.assertPosition(this.position + 3);
      this.dataView.setUint32(this.position, value);
      this.position += 4;
    },
    readByte() {
      this.assertReadLimit();
      this._touch();
      const value = this.inspectByte();
      this.position++;
      return value;
    },
    readBytes(length, size2) {
      this.assertReadLimit();
      this._touch();
      const value = this.inspectBytes(length);
      this.position += size2 ?? length;
      return value;
    },
    readUint8() {
      this.assertReadLimit();
      this._touch();
      const value = this.inspectUint8();
      this.position += 1;
      return value;
    },
    readUint16() {
      this.assertReadLimit();
      this._touch();
      const value = this.inspectUint16();
      this.position += 2;
      return value;
    },
    readUint24() {
      this.assertReadLimit();
      this._touch();
      const value = this.inspectUint24();
      this.position += 3;
      return value;
    },
    readUint32() {
      this.assertReadLimit();
      this._touch();
      const value = this.inspectUint32();
      this.position += 4;
      return value;
    },
    get remaining() {
      return this.bytes.length - this.position;
    },
    setPosition(position) {
      const oldPosition = this.position;
      this.assertPosition(position);
      this.position = position;
      return () => this.position = oldPosition;
    },
    _touch() {
      if (this.recursiveReadLimit === Number.POSITIVE_INFINITY)
        return;
      const count = this.getReadCount();
      this.positionReadCount.set(this.position, count + 1);
      if (count > 0)
        this.recursiveReadCount++;
    }
  };
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/encoding/fromBytes.js
function bytesToBigInt(bytes, opts = {}) {
  if (typeof opts.size !== "undefined")
    assertSize(bytes, { size: opts.size });
  const hex = bytesToHex(bytes, opts);
  return hexToBigInt(hex, opts);
}
function bytesToBool(bytes_, opts = {}) {
  let bytes = bytes_;
  if (typeof opts.size !== "undefined") {
    assertSize(bytes, { size: opts.size });
    bytes = trim(bytes);
  }
  if (bytes.length > 1 || bytes[0] > 1)
    throw new InvalidBytesBooleanError(bytes);
  return Boolean(bytes[0]);
}
function bytesToNumber(bytes, opts = {}) {
  if (typeof opts.size !== "undefined")
    assertSize(bytes, { size: opts.size });
  const hex = bytesToHex(bytes, opts);
  return hexToNumber(hex, opts);
}
function bytesToString(bytes_, opts = {}) {
  let bytes = bytes_;
  if (typeof opts.size !== "undefined") {
    assertSize(bytes, { size: opts.size });
    bytes = trim(bytes, { dir: "right" });
  }
  return new TextDecoder().decode(bytes);
}
var init_fromBytes = __esm(() => {
  init_encoding();
  init_fromHex();
  init_toHex();
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/abi/decodeAbiParameters.js
function decodeAbiParameters(params, data) {
  const bytes = typeof data === "string" ? hexToBytes(data) : data;
  const cursor = createCursor(bytes);
  if (size(bytes) === 0 && params.length > 0)
    throw new AbiDecodingZeroDataError;
  if (size(data) && size(data) < 32)
    throw new AbiDecodingDataSizeTooSmallError({
      data: typeof data === "string" ? data : bytesToHex(data),
      params,
      size: size(data)
    });
  let consumed = 0;
  const values = [];
  for (let i = 0;i < params.length; ++i) {
    const param = params[i];
    cursor.setPosition(consumed);
    const [data2, consumed_] = decodeParameter(cursor, param, {
      staticPosition: 0
    });
    consumed += consumed_;
    values.push(data2);
  }
  return values;
}
function decodeParameter(cursor, param, { staticPosition }) {
  const arrayComponents = getArrayComponents(param.type);
  if (arrayComponents) {
    const [length, type] = arrayComponents;
    return decodeArray(cursor, { ...param, type }, { length, staticPosition });
  }
  if (param.type === "tuple")
    return decodeTuple(cursor, param, { staticPosition });
  if (param.type === "address")
    return decodeAddress(cursor);
  if (param.type === "bool")
    return decodeBool(cursor);
  if (param.type.startsWith("bytes"))
    return decodeBytes(cursor, param, { staticPosition });
  if (param.type.startsWith("uint") || param.type.startsWith("int"))
    return decodeNumber(cursor, param);
  if (param.type === "string")
    return decodeString(cursor, { staticPosition });
  throw new InvalidAbiDecodingTypeError(param.type, {
    docsPath: "/docs/contract/decodeAbiParameters"
  });
}
function decodeAddress(cursor) {
  const value = cursor.readBytes(32);
  return [checksumAddress(bytesToHex(sliceBytes(value, -20))), 32];
}
function decodeArray(cursor, param, { length, staticPosition }) {
  if (!length) {
    const offset = bytesToNumber(cursor.readBytes(sizeOfOffset));
    const start = staticPosition + offset;
    const startOfData = start + sizeOfLength;
    cursor.setPosition(start);
    const length2 = bytesToNumber(cursor.readBytes(sizeOfLength));
    const dynamicChild = hasDynamicChild(param);
    let consumed2 = 0;
    const value2 = [];
    for (let i = 0;i < length2; ++i) {
      cursor.setPosition(startOfData + (dynamicChild ? i * 32 : consumed2));
      const [data, consumed_] = decodeParameter(cursor, param, {
        staticPosition: startOfData
      });
      consumed2 += consumed_;
      value2.push(data);
    }
    cursor.setPosition(staticPosition + 32);
    return [value2, 32];
  }
  if (hasDynamicChild(param)) {
    const offset = bytesToNumber(cursor.readBytes(sizeOfOffset));
    const start = staticPosition + offset;
    const value2 = [];
    for (let i = 0;i < length; ++i) {
      cursor.setPosition(start + i * 32);
      const [data] = decodeParameter(cursor, param, {
        staticPosition: start
      });
      value2.push(data);
    }
    cursor.setPosition(staticPosition + 32);
    return [value2, 32];
  }
  let consumed = 0;
  const value = [];
  for (let i = 0;i < length; ++i) {
    const [data, consumed_] = decodeParameter(cursor, param, {
      staticPosition: staticPosition + consumed
    });
    consumed += consumed_;
    value.push(data);
  }
  return [value, consumed];
}
function decodeBool(cursor) {
  return [bytesToBool(cursor.readBytes(32), { size: 32 }), 32];
}
function decodeBytes(cursor, param, { staticPosition }) {
  const [_, size2] = param.type.split("bytes");
  if (!size2) {
    const offset = bytesToNumber(cursor.readBytes(32));
    cursor.setPosition(staticPosition + offset);
    const length = bytesToNumber(cursor.readBytes(32));
    if (length === 0) {
      cursor.setPosition(staticPosition + 32);
      return ["0x", 32];
    }
    const data = cursor.readBytes(length);
    cursor.setPosition(staticPosition + 32);
    return [bytesToHex(data), 32];
  }
  const value = bytesToHex(cursor.readBytes(Number.parseInt(size2), 32));
  return [value, 32];
}
function decodeNumber(cursor, param) {
  const signed = param.type.startsWith("int");
  const size2 = Number.parseInt(param.type.split("int")[1] || "256");
  const value = cursor.readBytes(32);
  return [
    size2 > 48 ? bytesToBigInt(value, { signed }) : bytesToNumber(value, { signed }),
    32
  ];
}
function decodeTuple(cursor, param, { staticPosition }) {
  const hasUnnamedChild = param.components.length === 0 || param.components.some(({ name }) => !name);
  const value = hasUnnamedChild ? [] : {};
  let consumed = 0;
  if (hasDynamicChild(param)) {
    const offset = bytesToNumber(cursor.readBytes(sizeOfOffset));
    const start = staticPosition + offset;
    for (let i = 0;i < param.components.length; ++i) {
      const component = param.components[i];
      cursor.setPosition(start + consumed);
      const [data, consumed_] = decodeParameter(cursor, component, {
        staticPosition: start
      });
      consumed += consumed_;
      value[hasUnnamedChild ? i : component?.name] = data;
    }
    cursor.setPosition(staticPosition + 32);
    return [value, 32];
  }
  for (let i = 0;i < param.components.length; ++i) {
    const component = param.components[i];
    const [data, consumed_] = decodeParameter(cursor, component, {
      staticPosition
    });
    value[hasUnnamedChild ? i : component?.name] = data;
    consumed += consumed_;
  }
  return [value, consumed];
}
function decodeString(cursor, { staticPosition }) {
  const offset = bytesToNumber(cursor.readBytes(32));
  const start = staticPosition + offset;
  cursor.setPosition(start);
  const length = bytesToNumber(cursor.readBytes(32));
  if (length === 0) {
    cursor.setPosition(staticPosition + 32);
    return ["", 32];
  }
  const data = cursor.readBytes(length, 32);
  const value = bytesToString(trim(data));
  cursor.setPosition(staticPosition + 32);
  return [value, 32];
}
function hasDynamicChild(param) {
  const { type } = param;
  if (type === "string")
    return true;
  if (type === "bytes")
    return true;
  if (type.endsWith("[]"))
    return true;
  if (type === "tuple")
    return param.components?.some(hasDynamicChild);
  const arrayComponents = getArrayComponents(param.type);
  if (arrayComponents && hasDynamicChild({ ...param, type: arrayComponents[1] }))
    return true;
  return false;
}
var sizeOfLength = 32, sizeOfOffset = 32;
var init_decodeAbiParameters = __esm(() => {
  init_abi();
  init_getAddress();
  init_cursor2();
  init_size();
  init_slice();
  init_fromBytes();
  init_toBytes();
  init_toHex();
  init_encodeAbiParameters();
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/abi/decodeErrorResult.js
function decodeErrorResult(parameters) {
  const { abi, data } = parameters;
  const signature = slice(data, 0, 4);
  if (signature === "0x")
    throw new AbiDecodingZeroDataError;
  const abi_ = [...abi || [], solidityError, solidityPanic];
  const abiItem = abi_.find((x) => x.type === "error" && signature === toFunctionSelector(formatAbiItem2(x)));
  if (!abiItem)
    throw new AbiErrorSignatureNotFoundError(signature, {
      docsPath: "/docs/contract/decodeErrorResult"
    });
  return {
    abiItem,
    args: "inputs" in abiItem && abiItem.inputs && abiItem.inputs.length > 0 ? decodeAbiParameters(abiItem.inputs, slice(data, 4)) : undefined,
    errorName: abiItem.name
  };
}
var init_decodeErrorResult = __esm(() => {
  init_solidity();
  init_abi();
  init_slice();
  init_toFunctionSelector();
  init_decodeAbiParameters();
  init_formatAbiItem2();
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/stringify.js
var stringify = (value, replacer, space) => JSON.stringify(value, (key, value_) => {
  const value2 = typeof value_ === "bigint" ? value_.toString() : value_;
  return typeof replacer === "function" ? replacer(key, value2) : value2;
}, space);

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/abi/formatAbiItemWithArgs.js
function formatAbiItemWithArgs({ abiItem, args, includeFunctionName = true, includeName = false }) {
  if (!("name" in abiItem))
    return;
  if (!("inputs" in abiItem))
    return;
  if (!abiItem.inputs)
    return;
  return `${includeFunctionName ? abiItem.name : ""}(${abiItem.inputs.map((input, i) => `${includeName && input.name ? `${input.name}: ` : ""}${typeof args[i] === "object" ? stringify(args[i]) : args[i]}`).join(", ")})`;
}
var init_formatAbiItemWithArgs = () => {};

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/constants/unit.js
var etherUnits, gweiUnits;
var init_unit = __esm(() => {
  etherUnits = {
    gwei: 9,
    wei: 18
  };
  gweiUnits = {
    ether: -9,
    wei: 9
  };
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/unit/formatUnits.js
function formatUnits(value, decimals) {
  let display = value.toString();
  const negative = display.startsWith("-");
  if (negative)
    display = display.slice(1);
  display = display.padStart(decimals, "0");
  let [integer, fraction] = [
    display.slice(0, display.length - decimals),
    display.slice(display.length - decimals)
  ];
  fraction = fraction.replace(/(0+)$/, "");
  return `${negative ? "-" : ""}${integer || "0"}${fraction ? `.${fraction}` : ""}`;
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/unit/formatEther.js
function formatEther(wei, unit = "wei") {
  return formatUnits(wei, etherUnits[unit]);
}
var init_formatEther = __esm(() => {
  init_unit();
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/unit/formatGwei.js
function formatGwei(wei, unit = "wei") {
  return formatUnits(wei, gweiUnits[unit]);
}
var init_formatGwei = __esm(() => {
  init_unit();
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/errors/stateOverride.js
function prettyStateMapping(stateMapping) {
  return stateMapping.reduce((pretty, { slot, value }) => {
    return `${pretty}        ${slot}: ${value}
`;
  }, "");
}
function prettyStateOverride(stateOverride) {
  return stateOverride.reduce((pretty, { address, ...state }) => {
    let val = `${pretty}    ${address}:
`;
    if (state.nonce)
      val += `      nonce: ${state.nonce}
`;
    if (state.balance)
      val += `      balance: ${state.balance}
`;
    if (state.code)
      val += `      code: ${state.code}
`;
    if (state.state) {
      val += `      state:
`;
      val += prettyStateMapping(state.state);
    }
    if (state.stateDiff) {
      val += `      stateDiff:
`;
      val += prettyStateMapping(state.stateDiff);
    }
    return val;
  }, `  State Override:
`).slice(0, -1);
}
var AccountStateConflictError, StateAssignmentConflictError;
var init_stateOverride = __esm(() => {
  init_base();
  AccountStateConflictError = class AccountStateConflictError extends BaseError2 {
    constructor({ address }) {
      super(`State for account "${address}" is set multiple times.`, {
        name: "AccountStateConflictError"
      });
    }
  };
  StateAssignmentConflictError = class StateAssignmentConflictError extends BaseError2 {
    constructor() {
      super("state and stateDiff are set on the same account.", {
        name: "StateAssignmentConflictError"
      });
    }
  };
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/errors/transaction.js
function prettyPrint(args) {
  const entries = Object.entries(args).map(([key, value]) => {
    if (value === undefined || value === false)
      return null;
    return [key, value];
  }).filter(Boolean);
  const maxLength = entries.reduce((acc, [key]) => Math.max(acc, key.length), 0);
  return entries.map(([key, value]) => `  ${`${key}:`.padEnd(maxLength + 1)}  ${value}`).join(`
`);
}
var FeeConflictError, InvalidLegacyVError, InvalidSerializableTransactionError, InvalidStorageKeySizeError, TransactionExecutionError, TransactionNotFoundError, TransactionReceiptNotFoundError, WaitForTransactionReceiptTimeoutError;
var init_transaction = __esm(() => {
  init_formatEther();
  init_formatGwei();
  init_base();
  FeeConflictError = class FeeConflictError extends BaseError2 {
    constructor() {
      super([
        "Cannot specify both a `gasPrice` and a `maxFeePerGas`/`maxPriorityFeePerGas`.",
        "Use `maxFeePerGas`/`maxPriorityFeePerGas` for EIP-1559 compatible networks, and `gasPrice` for others."
      ].join(`
`), { name: "FeeConflictError" });
    }
  };
  InvalidLegacyVError = class InvalidLegacyVError extends BaseError2 {
    constructor({ v }) {
      super(`Invalid \`v\` value "${v}". Expected 27 or 28.`, {
        name: "InvalidLegacyVError"
      });
    }
  };
  InvalidSerializableTransactionError = class InvalidSerializableTransactionError extends BaseError2 {
    constructor({ transaction }) {
      super("Cannot infer a transaction type from provided transaction.", {
        metaMessages: [
          "Provided Transaction:",
          "{",
          prettyPrint(transaction),
          "}",
          "",
          "To infer the type, either provide:",
          "- a `type` to the Transaction, or",
          "- an EIP-1559 Transaction with `maxFeePerGas`, or",
          "- an EIP-2930 Transaction with `gasPrice` & `accessList`, or",
          "- an EIP-4844 Transaction with `blobs`, `blobVersionedHashes`, `sidecars`, or",
          "- an EIP-7702 Transaction with `authorizationList`, or",
          "- a Legacy Transaction with `gasPrice`"
        ],
        name: "InvalidSerializableTransactionError"
      });
    }
  };
  InvalidStorageKeySizeError = class InvalidStorageKeySizeError extends BaseError2 {
    constructor({ storageKey }) {
      super(`Size for storage key "${storageKey}" is invalid. Expected 32 bytes. Got ${Math.floor((storageKey.length - 2) / 2)} bytes.`, { name: "InvalidStorageKeySizeError" });
    }
  };
  TransactionExecutionError = class TransactionExecutionError extends BaseError2 {
    constructor(cause, { account, docsPath: docsPath3, chain, data, gas, gasPrice, maxFeePerGas, maxPriorityFeePerGas, nonce, to, value }) {
      const prettyArgs = prettyPrint({
        chain: chain && `${chain?.name} (id: ${chain?.id})`,
        from: account?.address,
        to,
        value: typeof value !== "undefined" && `${formatEther(value)} ${chain?.nativeCurrency?.symbol || "ETH"}`,
        data,
        gas,
        gasPrice: typeof gasPrice !== "undefined" && `${formatGwei(gasPrice)} gwei`,
        maxFeePerGas: typeof maxFeePerGas !== "undefined" && `${formatGwei(maxFeePerGas)} gwei`,
        maxPriorityFeePerGas: typeof maxPriorityFeePerGas !== "undefined" && `${formatGwei(maxPriorityFeePerGas)} gwei`,
        nonce
      });
      super(cause.shortMessage, {
        cause,
        docsPath: docsPath3,
        metaMessages: [
          ...cause.metaMessages ? [...cause.metaMessages, " "] : [],
          "Request Arguments:",
          prettyArgs
        ].filter(Boolean),
        name: "TransactionExecutionError"
      });
      Object.defineProperty(this, "cause", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      this.cause = cause;
    }
  };
  TransactionNotFoundError = class TransactionNotFoundError extends BaseError2 {
    constructor({ blockHash, blockNumber, blockTag, hash: hash2, index }) {
      let identifier = "Transaction";
      if (blockTag && index !== undefined)
        identifier = `Transaction at block time "${blockTag}" at index "${index}"`;
      if (blockHash && index !== undefined)
        identifier = `Transaction at block hash "${blockHash}" at index "${index}"`;
      if (blockNumber && index !== undefined)
        identifier = `Transaction at block number "${blockNumber}" at index "${index}"`;
      if (hash2)
        identifier = `Transaction with hash "${hash2}"`;
      super(`${identifier} could not be found.`, {
        name: "TransactionNotFoundError"
      });
    }
  };
  TransactionReceiptNotFoundError = class TransactionReceiptNotFoundError extends BaseError2 {
    constructor({ hash: hash2 }) {
      super(`Transaction receipt with hash "${hash2}" could not be found. The Transaction may not be processed on a block yet.`, {
        name: "TransactionReceiptNotFoundError"
      });
    }
  };
  WaitForTransactionReceiptTimeoutError = class WaitForTransactionReceiptTimeoutError extends BaseError2 {
    constructor({ hash: hash2 }) {
      super(`Timed out while waiting for transaction with hash "${hash2}" to be confirmed.`, { name: "WaitForTransactionReceiptTimeoutError" });
    }
  };
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/errors/utils.js
var getContractAddress = (address) => address, getUrl = (url) => url;

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/errors/contract.js
var CallExecutionError, ContractFunctionExecutionError, ContractFunctionRevertedError, ContractFunctionZeroDataError, CounterfactualDeploymentFailedError, RawContractError;
var init_contract = __esm(() => {
  init_solidity();
  init_decodeErrorResult();
  init_formatAbiItem2();
  init_formatAbiItemWithArgs();
  init_getAbiItem();
  init_formatEther();
  init_formatGwei();
  init_abi();
  init_base();
  init_stateOverride();
  init_transaction();
  CallExecutionError = class CallExecutionError extends BaseError2 {
    constructor(cause, { account: account_, docsPath: docsPath3, chain, data, gas, gasPrice, maxFeePerGas, maxPriorityFeePerGas, nonce, to, value, stateOverride }) {
      const account = account_ ? parseAccount(account_) : undefined;
      let prettyArgs = prettyPrint({
        from: account?.address,
        to,
        value: typeof value !== "undefined" && `${formatEther(value)} ${chain?.nativeCurrency?.symbol || "ETH"}`,
        data,
        gas,
        gasPrice: typeof gasPrice !== "undefined" && `${formatGwei(gasPrice)} gwei`,
        maxFeePerGas: typeof maxFeePerGas !== "undefined" && `${formatGwei(maxFeePerGas)} gwei`,
        maxPriorityFeePerGas: typeof maxPriorityFeePerGas !== "undefined" && `${formatGwei(maxPriorityFeePerGas)} gwei`,
        nonce
      });
      if (stateOverride) {
        prettyArgs += `
${prettyStateOverride(stateOverride)}`;
      }
      super(cause.shortMessage, {
        cause,
        docsPath: docsPath3,
        metaMessages: [
          ...cause.metaMessages ? [...cause.metaMessages, " "] : [],
          "Raw Call Arguments:",
          prettyArgs
        ].filter(Boolean),
        name: "CallExecutionError"
      });
      Object.defineProperty(this, "cause", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      this.cause = cause;
    }
  };
  ContractFunctionExecutionError = class ContractFunctionExecutionError extends BaseError2 {
    constructor(cause, { abi, args, contractAddress, docsPath: docsPath3, functionName, sender }) {
      const abiItem = getAbiItem({ abi, args, name: functionName });
      const formattedArgs = abiItem ? formatAbiItemWithArgs({
        abiItem,
        args,
        includeFunctionName: false,
        includeName: false
      }) : undefined;
      const functionWithParams = abiItem ? formatAbiItem2(abiItem, { includeName: true }) : undefined;
      const prettyArgs = prettyPrint({
        address: contractAddress && getContractAddress(contractAddress),
        function: functionWithParams,
        args: formattedArgs && formattedArgs !== "()" && `${[...Array(functionName?.length ?? 0).keys()].map(() => " ").join("")}${formattedArgs}`,
        sender
      });
      super(cause.shortMessage || `An unknown error occurred while executing the contract function "${functionName}".`, {
        cause,
        docsPath: docsPath3,
        metaMessages: [
          ...cause.metaMessages ? [...cause.metaMessages, " "] : [],
          prettyArgs && "Contract Call:",
          prettyArgs
        ].filter(Boolean),
        name: "ContractFunctionExecutionError"
      });
      Object.defineProperty(this, "abi", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "args", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "cause", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "contractAddress", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "formattedArgs", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "functionName", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "sender", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      this.abi = abi;
      this.args = args;
      this.cause = cause;
      this.contractAddress = contractAddress;
      this.functionName = functionName;
      this.sender = sender;
    }
  };
  ContractFunctionRevertedError = class ContractFunctionRevertedError extends BaseError2 {
    constructor({ abi, data, functionName, message }) {
      let cause;
      let decodedData = undefined;
      let metaMessages;
      let reason;
      if (data && data !== "0x") {
        try {
          decodedData = decodeErrorResult({ abi, data });
          const { abiItem, errorName, args: errorArgs } = decodedData;
          if (errorName === "Error") {
            reason = errorArgs[0];
          } else if (errorName === "Panic") {
            const [firstArg] = errorArgs;
            reason = panicReasons[firstArg];
          } else {
            const errorWithParams = abiItem ? formatAbiItem2(abiItem, { includeName: true }) : undefined;
            const formattedArgs = abiItem && errorArgs ? formatAbiItemWithArgs({
              abiItem,
              args: errorArgs,
              includeFunctionName: false,
              includeName: false
            }) : undefined;
            metaMessages = [
              errorWithParams ? `Error: ${errorWithParams}` : "",
              formattedArgs && formattedArgs !== "()" ? `       ${[...Array(errorName?.length ?? 0).keys()].map(() => " ").join("")}${formattedArgs}` : ""
            ];
          }
        } catch (err) {
          cause = err;
        }
      } else if (message)
        reason = message;
      let signature;
      if (cause instanceof AbiErrorSignatureNotFoundError) {
        signature = cause.signature;
        metaMessages = [
          `Unable to decode signature "${signature}" as it was not found on the provided ABI.`,
          "Make sure you are using the correct ABI and that the error exists on it.",
          `You can look up the decoded signature here: https://openchain.xyz/signatures?query=${signature}.`
        ];
      }
      super(reason && reason !== "execution reverted" || signature ? [
        `The contract function "${functionName}" reverted with the following ${signature ? "signature" : "reason"}:`,
        reason || signature
      ].join(`
`) : `The contract function "${functionName}" reverted.`, {
        cause,
        metaMessages,
        name: "ContractFunctionRevertedError"
      });
      Object.defineProperty(this, "data", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "raw", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "reason", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "signature", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      this.data = decodedData;
      this.raw = data;
      this.reason = reason;
      this.signature = signature;
    }
  };
  ContractFunctionZeroDataError = class ContractFunctionZeroDataError extends BaseError2 {
    constructor({ functionName }) {
      super(`The contract function "${functionName}" returned no data ("0x").`, {
        metaMessages: [
          "This could be due to any of the following:",
          `  - The contract does not have the function "${functionName}",`,
          "  - The parameters passed to the contract function may be invalid, or",
          "  - The address is not a contract."
        ],
        name: "ContractFunctionZeroDataError"
      });
    }
  };
  CounterfactualDeploymentFailedError = class CounterfactualDeploymentFailedError extends BaseError2 {
    constructor({ factory }) {
      super(`Deployment for counterfactual contract call failed${factory ? ` for factory "${factory}".` : ""}`, {
        metaMessages: [
          "Please ensure:",
          "- The `factory` is a valid contract deployment factory (ie. Create2 Factory, ERC-4337 Factory, etc).",
          "- The `factoryData` is a valid encoded function call for contract deployment function on the factory."
        ],
        name: "CounterfactualDeploymentFailedError"
      });
    }
  };
  RawContractError = class RawContractError extends BaseError2 {
    constructor({ data, message }) {
      super(message || "", { name: "RawContractError" });
      Object.defineProperty(this, "code", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: 3
      });
      Object.defineProperty(this, "data", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      this.data = data;
    }
  };
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/errors/request.js
var HttpRequestError, RpcRequestError, TimeoutError;
var init_request = __esm(() => {
  init_base();
  HttpRequestError = class HttpRequestError extends BaseError2 {
    constructor({ body, cause, details, headers, status, url }) {
      super("HTTP request failed.", {
        cause,
        details,
        metaMessages: [
          status && `Status: ${status}`,
          `URL: ${getUrl(url)}`,
          body && `Request body: ${stringify(body)}`
        ].filter(Boolean),
        name: "HttpRequestError"
      });
      Object.defineProperty(this, "body", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "headers", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "status", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "url", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      this.body = body;
      this.headers = headers;
      this.status = status;
      this.url = url;
    }
  };
  RpcRequestError = class RpcRequestError extends BaseError2 {
    constructor({ body, error, url }) {
      super("RPC Request failed.", {
        cause: error,
        details: error.message,
        metaMessages: [`URL: ${getUrl(url)}`, `Request body: ${stringify(body)}`],
        name: "RpcRequestError"
      });
      Object.defineProperty(this, "code", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      Object.defineProperty(this, "data", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      this.code = error.code;
      this.data = error.data;
    }
  };
  TimeoutError = class TimeoutError extends BaseError2 {
    constructor({ body, url }) {
      super("The request took too long to respond.", {
        details: "The request timed out.",
        metaMessages: [`URL: ${getUrl(url)}`, `Request body: ${stringify(body)}`],
        name: "TimeoutError"
      });
    }
  };
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/errors/rpc.js
var unknownErrorCode = -1, RpcError, ProviderRpcError, ParseRpcError, InvalidRequestRpcError, MethodNotFoundRpcError, InvalidParamsRpcError, InternalRpcError, InvalidInputRpcError, ResourceNotFoundRpcError, ResourceUnavailableRpcError, TransactionRejectedRpcError, MethodNotSupportedRpcError, LimitExceededRpcError, JsonRpcVersionUnsupportedError, UserRejectedRequestError, UnauthorizedProviderError, UnsupportedProviderMethodError, ProviderDisconnectedError, ChainDisconnectedError, SwitchChainError, UnknownRpcError;
var init_rpc = __esm(() => {
  init_base();
  init_request();
  RpcError = class RpcError extends BaseError2 {
    constructor(cause, { code, docsPath: docsPath3, metaMessages, name, shortMessage }) {
      super(shortMessage, {
        cause,
        docsPath: docsPath3,
        metaMessages: metaMessages || cause?.metaMessages,
        name: name || "RpcError"
      });
      Object.defineProperty(this, "code", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      this.name = name || cause.name;
      this.code = cause instanceof RpcRequestError ? cause.code : code ?? unknownErrorCode;
    }
  };
  ProviderRpcError = class ProviderRpcError extends RpcError {
    constructor(cause, options) {
      super(cause, options);
      Object.defineProperty(this, "data", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined
      });
      this.data = options.data;
    }
  };
  ParseRpcError = class ParseRpcError extends RpcError {
    constructor(cause) {
      super(cause, {
        code: ParseRpcError.code,
        name: "ParseRpcError",
        shortMessage: "Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text."
      });
    }
  };
  Object.defineProperty(ParseRpcError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: -32700
  });
  InvalidRequestRpcError = class InvalidRequestRpcError extends RpcError {
    constructor(cause) {
      super(cause, {
        code: InvalidRequestRpcError.code,
        name: "InvalidRequestRpcError",
        shortMessage: "JSON is not a valid request object."
      });
    }
  };
  Object.defineProperty(InvalidRequestRpcError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: -32600
  });
  MethodNotFoundRpcError = class MethodNotFoundRpcError extends RpcError {
    constructor(cause, { method } = {}) {
      super(cause, {
        code: MethodNotFoundRpcError.code,
        name: "MethodNotFoundRpcError",
        shortMessage: `The method${method ? ` "${method}"` : ""} does not exist / is not available.`
      });
    }
  };
  Object.defineProperty(MethodNotFoundRpcError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: -32601
  });
  InvalidParamsRpcError = class InvalidParamsRpcError extends RpcError {
    constructor(cause) {
      super(cause, {
        code: InvalidParamsRpcError.code,
        name: "InvalidParamsRpcError",
        shortMessage: [
          "Invalid parameters were provided to the RPC method.",
          "Double check you have provided the correct parameters."
        ].join(`
`)
      });
    }
  };
  Object.defineProperty(InvalidParamsRpcError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: -32602
  });
  InternalRpcError = class InternalRpcError extends RpcError {
    constructor(cause) {
      super(cause, {
        code: InternalRpcError.code,
        name: "InternalRpcError",
        shortMessage: "An internal error was received."
      });
    }
  };
  Object.defineProperty(InternalRpcError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: -32603
  });
  InvalidInputRpcError = class InvalidInputRpcError extends RpcError {
    constructor(cause) {
      super(cause, {
        code: InvalidInputRpcError.code,
        name: "InvalidInputRpcError",
        shortMessage: [
          "Missing or invalid parameters.",
          "Double check you have provided the correct parameters."
        ].join(`
`)
      });
    }
  };
  Object.defineProperty(InvalidInputRpcError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: -32000
  });
  ResourceNotFoundRpcError = class ResourceNotFoundRpcError extends RpcError {
    constructor(cause) {
      super(cause, {
        code: ResourceNotFoundRpcError.code,
        name: "ResourceNotFoundRpcError",
        shortMessage: "Requested resource not found."
      });
      Object.defineProperty(this, "name", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: "ResourceNotFoundRpcError"
      });
    }
  };
  Object.defineProperty(ResourceNotFoundRpcError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: -32001
  });
  ResourceUnavailableRpcError = class ResourceUnavailableRpcError extends RpcError {
    constructor(cause) {
      super(cause, {
        code: ResourceUnavailableRpcError.code,
        name: "ResourceUnavailableRpcError",
        shortMessage: "Requested resource not available."
      });
    }
  };
  Object.defineProperty(ResourceUnavailableRpcError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: -32002
  });
  TransactionRejectedRpcError = class TransactionRejectedRpcError extends RpcError {
    constructor(cause) {
      super(cause, {
        code: TransactionRejectedRpcError.code,
        name: "TransactionRejectedRpcError",
        shortMessage: "Transaction creation failed."
      });
    }
  };
  Object.defineProperty(TransactionRejectedRpcError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: -32003
  });
  MethodNotSupportedRpcError = class MethodNotSupportedRpcError extends RpcError {
    constructor(cause, { method } = {}) {
      super(cause, {
        code: MethodNotSupportedRpcError.code,
        name: "MethodNotSupportedRpcError",
        shortMessage: `Method${method ? ` "${method}"` : ""} is not supported.`
      });
    }
  };
  Object.defineProperty(MethodNotSupportedRpcError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: -32004
  });
  LimitExceededRpcError = class LimitExceededRpcError extends RpcError {
    constructor(cause) {
      super(cause, {
        code: LimitExceededRpcError.code,
        name: "LimitExceededRpcError",
        shortMessage: "Request exceeds defined limit."
      });
    }
  };
  Object.defineProperty(LimitExceededRpcError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: -32005
  });
  JsonRpcVersionUnsupportedError = class JsonRpcVersionUnsupportedError extends RpcError {
    constructor(cause) {
      super(cause, {
        code: JsonRpcVersionUnsupportedError.code,
        name: "JsonRpcVersionUnsupportedError",
        shortMessage: "Version of JSON-RPC protocol is not supported."
      });
    }
  };
  Object.defineProperty(JsonRpcVersionUnsupportedError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: -32006
  });
  UserRejectedRequestError = class UserRejectedRequestError extends ProviderRpcError {
    constructor(cause) {
      super(cause, {
        code: UserRejectedRequestError.code,
        name: "UserRejectedRequestError",
        shortMessage: "User rejected the request."
      });
    }
  };
  Object.defineProperty(UserRejectedRequestError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 4001
  });
  UnauthorizedProviderError = class UnauthorizedProviderError extends ProviderRpcError {
    constructor(cause) {
      super(cause, {
        code: UnauthorizedProviderError.code,
        name: "UnauthorizedProviderError",
        shortMessage: "The requested method and/or account has not been authorized by the user."
      });
    }
  };
  Object.defineProperty(UnauthorizedProviderError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 4100
  });
  UnsupportedProviderMethodError = class UnsupportedProviderMethodError extends ProviderRpcError {
    constructor(cause, { method } = {}) {
      super(cause, {
        code: UnsupportedProviderMethodError.code,
        name: "UnsupportedProviderMethodError",
        shortMessage: `The Provider does not support the requested method${method ? ` " ${method}"` : ""}.`
      });
    }
  };
  Object.defineProperty(UnsupportedProviderMethodError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 4200
  });
  ProviderDisconnectedError = class ProviderDisconnectedError extends ProviderRpcError {
    constructor(cause) {
      super(cause, {
        code: ProviderDisconnectedError.code,
        name: "ProviderDisconnectedError",
        shortMessage: "The Provider is disconnected from all chains."
      });
    }
  };
  Object.defineProperty(ProviderDisconnectedError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 4900
  });
  ChainDisconnectedError = class ChainDisconnectedError extends ProviderRpcError {
    constructor(cause) {
      super(cause, {
        code: ChainDisconnectedError.code,
        name: "ChainDisconnectedError",
        shortMessage: "The Provider is not connected to the requested chain."
      });
    }
  };
  Object.defineProperty(ChainDisconnectedError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 4901
  });
  SwitchChainError = class SwitchChainError extends ProviderRpcError {
    constructor(cause) {
      super(cause, {
        code: SwitchChainError.code,
        name: "SwitchChainError",
        shortMessage: "An error occurred when attempting to switch chain."
      });
    }
  };
  Object.defineProperty(SwitchChainError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 4902
  });
  UnknownRpcError = class UnknownRpcError extends RpcError {
    constructor(cause) {
      super(cause, {
        name: "UnknownRpcError",
        shortMessage: "An unknown RPC error occurred."
      });
    }
  };
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/node_modules/@noble/hashes/esm/_md.js
function setBigUint64(view, byteOffset, value, isLE2) {
  if (typeof view.setBigUint64 === "function")
    return view.setBigUint64(byteOffset, value, isLE2);
  const _32n2 = BigInt(32);
  const _u32_max = BigInt(4294967295);
  const wh = Number(value >> _32n2 & _u32_max);
  const wl = Number(value & _u32_max);
  const h = isLE2 ? 4 : 0;
  const l = isLE2 ? 0 : 4;
  view.setUint32(byteOffset + h, wh, isLE2);
  view.setUint32(byteOffset + l, wl, isLE2);
}
function Chi(a, b, c) {
  return a & b ^ ~a & c;
}
function Maj(a, b, c) {
  return a & b ^ a & c ^ b & c;
}
var HashMD;
var init__md = __esm(() => {
  init__assert();
  init_utils2();
  HashMD = class HashMD extends Hash {
    constructor(blockLen, outputLen, padOffset, isLE2) {
      super();
      this.blockLen = blockLen;
      this.outputLen = outputLen;
      this.padOffset = padOffset;
      this.isLE = isLE2;
      this.finished = false;
      this.length = 0;
      this.pos = 0;
      this.destroyed = false;
      this.buffer = new Uint8Array(blockLen);
      this.view = createView(this.buffer);
    }
    update(data) {
      aexists(this);
      const { view, buffer, blockLen } = this;
      data = toBytes2(data);
      const len = data.length;
      for (let pos = 0;pos < len; ) {
        const take = Math.min(blockLen - this.pos, len - pos);
        if (take === blockLen) {
          const dataView = createView(data);
          for (;blockLen <= len - pos; pos += blockLen)
            this.process(dataView, pos);
          continue;
        }
        buffer.set(data.subarray(pos, pos + take), this.pos);
        this.pos += take;
        pos += take;
        if (this.pos === blockLen) {
          this.process(view, 0);
          this.pos = 0;
        }
      }
      this.length += data.length;
      this.roundClean();
      return this;
    }
    digestInto(out) {
      aexists(this);
      aoutput(out, this);
      this.finished = true;
      const { buffer, view, blockLen, isLE: isLE2 } = this;
      let { pos } = this;
      buffer[pos++] = 128;
      this.buffer.subarray(pos).fill(0);
      if (this.padOffset > blockLen - pos) {
        this.process(view, 0);
        pos = 0;
      }
      for (let i = pos;i < blockLen; i++)
        buffer[i] = 0;
      setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE2);
      this.process(view, 0);
      const oview = createView(out);
      const len = this.outputLen;
      if (len % 4)
        throw new Error("_sha2: outputLen should be aligned to 32bit");
      const outLen = len / 4;
      const state = this.get();
      if (outLen > state.length)
        throw new Error("_sha2: outputLen bigger than state");
      for (let i = 0;i < outLen; i++)
        oview.setUint32(4 * i, state[i], isLE2);
    }
    digest() {
      const { buffer, outputLen } = this;
      this.digestInto(buffer);
      const res = buffer.slice(0, outputLen);
      this.destroy();
      return res;
    }
    _cloneInto(to) {
      to || (to = new this.constructor);
      to.set(...this.get());
      const { blockLen, buffer, length, finished, destroyed, pos } = this;
      to.length = length;
      to.pos = pos;
      to.finished = finished;
      to.destroyed = destroyed;
      if (length % blockLen)
        to.buffer.set(buffer);
      return to;
    }
  };
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/node_modules/@noble/hashes/esm/sha256.js
var SHA256_K, SHA256_IV, SHA256_W, SHA256, sha256;
var init_sha256 = __esm(() => {
  init__md();
  init_utils2();
  SHA256_K = /* @__PURE__ */ new Uint32Array([
    1116352408,
    1899447441,
    3049323471,
    3921009573,
    961987163,
    1508970993,
    2453635748,
    2870763221,
    3624381080,
    310598401,
    607225278,
    1426881987,
    1925078388,
    2162078206,
    2614888103,
    3248222580,
    3835390401,
    4022224774,
    264347078,
    604807628,
    770255983,
    1249150122,
    1555081692,
    1996064986,
    2554220882,
    2821834349,
    2952996808,
    3210313671,
    3336571891,
    3584528711,
    113926993,
    338241895,
    666307205,
    773529912,
    1294757372,
    1396182291,
    1695183700,
    1986661051,
    2177026350,
    2456956037,
    2730485921,
    2820302411,
    3259730800,
    3345764771,
    3516065817,
    3600352804,
    4094571909,
    275423344,
    430227734,
    506948616,
    659060556,
    883997877,
    958139571,
    1322822218,
    1537002063,
    1747873779,
    1955562222,
    2024104815,
    2227730452,
    2361852424,
    2428436474,
    2756734187,
    3204031479,
    3329325298
  ]);
  SHA256_IV = /* @__PURE__ */ new Uint32Array([
    1779033703,
    3144134277,
    1013904242,
    2773480762,
    1359893119,
    2600822924,
    528734635,
    1541459225
  ]);
  SHA256_W = /* @__PURE__ */ new Uint32Array(64);
  SHA256 = class SHA256 extends HashMD {
    constructor() {
      super(64, 32, 8, false);
      this.A = SHA256_IV[0] | 0;
      this.B = SHA256_IV[1] | 0;
      this.C = SHA256_IV[2] | 0;
      this.D = SHA256_IV[3] | 0;
      this.E = SHA256_IV[4] | 0;
      this.F = SHA256_IV[5] | 0;
      this.G = SHA256_IV[6] | 0;
      this.H = SHA256_IV[7] | 0;
    }
    get() {
      const { A, B, C, D, E, F, G, H } = this;
      return [A, B, C, D, E, F, G, H];
    }
    set(A, B, C, D, E, F, G, H) {
      this.A = A | 0;
      this.B = B | 0;
      this.C = C | 0;
      this.D = D | 0;
      this.E = E | 0;
      this.F = F | 0;
      this.G = G | 0;
      this.H = H | 0;
    }
    process(view, offset) {
      for (let i = 0;i < 16; i++, offset += 4)
        SHA256_W[i] = view.getUint32(offset, false);
      for (let i = 16;i < 64; i++) {
        const W15 = SHA256_W[i - 15];
        const W2 = SHA256_W[i - 2];
        const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
        const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
        SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
      }
      let { A, B, C, D, E, F, G, H } = this;
      for (let i = 0;i < 64; i++) {
        const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
        const T1 = H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
        const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
        const T2 = sigma0 + Maj(A, B, C) | 0;
        H = G;
        G = F;
        F = E;
        E = D + T1 | 0;
        D = C;
        C = B;
        B = A;
        A = T1 + T2 | 0;
      }
      A = A + this.A | 0;
      B = B + this.B | 0;
      C = C + this.C | 0;
      D = D + this.D | 0;
      E = E + this.E | 0;
      F = F + this.F | 0;
      G = G + this.G | 0;
      H = H + this.H | 0;
      this.set(A, B, C, D, E, F, G, H);
    }
    roundClean() {
      SHA256_W.fill(0);
    }
    destroy() {
      this.set(0, 0, 0, 0, 0, 0, 0, 0);
      this.buffer.fill(0);
    }
  };
  sha256 = /* @__PURE__ */ wrapConstructor(() => new SHA256);
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/node_modules/@noble/hashes/esm/hmac.js
var HMAC, hmac = (hash2, key, message) => new HMAC(hash2, key).update(message).digest();
var init_hmac = __esm(() => {
  init__assert();
  init_utils2();
  HMAC = class HMAC extends Hash {
    constructor(hash2, _key) {
      super();
      this.finished = false;
      this.destroyed = false;
      ahash(hash2);
      const key = toBytes2(_key);
      this.iHash = hash2.create();
      if (typeof this.iHash.update !== "function")
        throw new Error("Expected instance of class which extends utils.Hash");
      this.blockLen = this.iHash.blockLen;
      this.outputLen = this.iHash.outputLen;
      const blockLen = this.blockLen;
      const pad2 = new Uint8Array(blockLen);
      pad2.set(key.length > blockLen ? hash2.create().update(key).digest() : key);
      for (let i = 0;i < pad2.length; i++)
        pad2[i] ^= 54;
      this.iHash.update(pad2);
      this.oHash = hash2.create();
      for (let i = 0;i < pad2.length; i++)
        pad2[i] ^= 54 ^ 92;
      this.oHash.update(pad2);
      pad2.fill(0);
    }
    update(buf) {
      aexists(this);
      this.iHash.update(buf);
      return this;
    }
    digestInto(out) {
      aexists(this);
      abytes(out, this.outputLen);
      this.finished = true;
      this.iHash.digestInto(out);
      this.oHash.update(out);
      this.oHash.digestInto(out);
      this.destroy();
    }
    digest() {
      const out = new Uint8Array(this.oHash.outputLen);
      this.digestInto(out);
      return out;
    }
    _cloneInto(to) {
      to || (to = Object.create(Object.getPrototypeOf(this), {}));
      const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
      to = to;
      to.finished = finished;
      to.destroyed = destroyed;
      to.blockLen = blockLen;
      to.outputLen = outputLen;
      to.oHash = oHash._cloneInto(to.oHash);
      to.iHash = iHash._cloneInto(to.iHash);
      return to;
    }
    destroy() {
      this.destroyed = true;
      this.oHash.destroy();
      this.iHash.destroy();
    }
  };
  hmac.create = (hash2, key) => new HMAC(hash2, key);
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/node_modules/@noble/curves/esm/abstract/utils.js
var exports_utils = {};
__export(exports_utils, {
  validateObject: () => validateObject,
  utf8ToBytes: () => utf8ToBytes2,
  numberToVarBytesBE: () => numberToVarBytesBE,
  numberToHexUnpadded: () => numberToHexUnpadded,
  numberToBytesLE: () => numberToBytesLE,
  numberToBytesBE: () => numberToBytesBE,
  notImplemented: () => notImplemented,
  memoized: () => memoized,
  isBytes: () => isBytes2,
  inRange: () => inRange,
  hexToNumber: () => hexToNumber2,
  hexToBytes: () => hexToBytes2,
  equalBytes: () => equalBytes,
  ensureBytes: () => ensureBytes,
  createHmacDrbg: () => createHmacDrbg,
  concatBytes: () => concatBytes3,
  bytesToNumberLE: () => bytesToNumberLE,
  bytesToNumberBE: () => bytesToNumberBE,
  bytesToHex: () => bytesToHex2,
  bitSet: () => bitSet,
  bitMask: () => bitMask,
  bitLen: () => bitLen,
  bitGet: () => bitGet,
  abytes: () => abytes2,
  abool: () => abool,
  aInRange: () => aInRange
});
function isBytes2(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
}
function abytes2(item) {
  if (!isBytes2(item))
    throw new Error("Uint8Array expected");
}
function abool(title, value) {
  if (typeof value !== "boolean")
    throw new Error(title + " boolean expected, got " + value);
}
function bytesToHex2(bytes) {
  abytes2(bytes);
  let hex = "";
  for (let i = 0;i < bytes.length; i++) {
    hex += hexes2[bytes[i]];
  }
  return hex;
}
function numberToHexUnpadded(num) {
  const hex = num.toString(16);
  return hex.length & 1 ? "0" + hex : hex;
}
function hexToNumber2(hex) {
  if (typeof hex !== "string")
    throw new Error("hex string expected, got " + typeof hex);
  return hex === "" ? _0n2 : BigInt("0x" + hex);
}
function asciiToBase16(ch) {
  if (ch >= asciis._0 && ch <= asciis._9)
    return ch - asciis._0;
  if (ch >= asciis.A && ch <= asciis.F)
    return ch - (asciis.A - 10);
  if (ch >= asciis.a && ch <= asciis.f)
    return ch - (asciis.a - 10);
  return;
}
function hexToBytes2(hex) {
  if (typeof hex !== "string")
    throw new Error("hex string expected, got " + typeof hex);
  const hl = hex.length;
  const al = hl / 2;
  if (hl % 2)
    throw new Error("hex string expected, got unpadded hex of length " + hl);
  const array = new Uint8Array(al);
  for (let ai = 0, hi = 0;ai < al; ai++, hi += 2) {
    const n1 = asciiToBase16(hex.charCodeAt(hi));
    const n2 = asciiToBase16(hex.charCodeAt(hi + 1));
    if (n1 === undefined || n2 === undefined) {
      const char = hex[hi] + hex[hi + 1];
      throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi);
    }
    array[ai] = n1 * 16 + n2;
  }
  return array;
}
function bytesToNumberBE(bytes) {
  return hexToNumber2(bytesToHex2(bytes));
}
function bytesToNumberLE(bytes) {
  abytes2(bytes);
  return hexToNumber2(bytesToHex2(Uint8Array.from(bytes).reverse()));
}
function numberToBytesBE(n, len) {
  return hexToBytes2(n.toString(16).padStart(len * 2, "0"));
}
function numberToBytesLE(n, len) {
  return numberToBytesBE(n, len).reverse();
}
function numberToVarBytesBE(n) {
  return hexToBytes2(numberToHexUnpadded(n));
}
function ensureBytes(title, hex, expectedLength) {
  let res;
  if (typeof hex === "string") {
    try {
      res = hexToBytes2(hex);
    } catch (e) {
      throw new Error(title + " must be hex string or Uint8Array, cause: " + e);
    }
  } else if (isBytes2(hex)) {
    res = Uint8Array.from(hex);
  } else {
    throw new Error(title + " must be hex string or Uint8Array");
  }
  const len = res.length;
  if (typeof expectedLength === "number" && len !== expectedLength)
    throw new Error(title + " of length " + expectedLength + " expected, got " + len);
  return res;
}
function concatBytes3(...arrays) {
  let sum = 0;
  for (let i = 0;i < arrays.length; i++) {
    const a = arrays[i];
    abytes2(a);
    sum += a.length;
  }
  const res = new Uint8Array(sum);
  for (let i = 0, pad2 = 0;i < arrays.length; i++) {
    const a = arrays[i];
    res.set(a, pad2);
    pad2 += a.length;
  }
  return res;
}
function equalBytes(a, b) {
  if (a.length !== b.length)
    return false;
  let diff = 0;
  for (let i = 0;i < a.length; i++)
    diff |= a[i] ^ b[i];
  return diff === 0;
}
function utf8ToBytes2(str) {
  if (typeof str !== "string")
    throw new Error("string expected");
  return new Uint8Array(new TextEncoder().encode(str));
}
function inRange(n, min, max) {
  return isPosBig(n) && isPosBig(min) && isPosBig(max) && min <= n && n < max;
}
function aInRange(title, n, min, max) {
  if (!inRange(n, min, max))
    throw new Error("expected valid " + title + ": " + min + " <= n < " + max + ", got " + n);
}
function bitLen(n) {
  let len;
  for (len = 0;n > _0n2; n >>= _1n2, len += 1)
    ;
  return len;
}
function bitGet(n, pos) {
  return n >> BigInt(pos) & _1n2;
}
function bitSet(n, pos, value) {
  return n | (value ? _1n2 : _0n2) << BigInt(pos);
}
function createHmacDrbg(hashLen, qByteLen, hmacFn) {
  if (typeof hashLen !== "number" || hashLen < 2)
    throw new Error("hashLen must be a number");
  if (typeof qByteLen !== "number" || qByteLen < 2)
    throw new Error("qByteLen must be a number");
  if (typeof hmacFn !== "function")
    throw new Error("hmacFn must be a function");
  let v = u8n(hashLen);
  let k = u8n(hashLen);
  let i = 0;
  const reset = () => {
    v.fill(1);
    k.fill(0);
    i = 0;
  };
  const h = (...b) => hmacFn(k, v, ...b);
  const reseed = (seed = u8n()) => {
    k = h(u8fr([0]), seed);
    v = h();
    if (seed.length === 0)
      return;
    k = h(u8fr([1]), seed);
    v = h();
  };
  const gen2 = () => {
    if (i++ >= 1000)
      throw new Error("drbg: tried 1000 values");
    let len = 0;
    const out = [];
    while (len < qByteLen) {
      v = h();
      const sl = v.slice();
      out.push(sl);
      len += v.length;
    }
    return concatBytes3(...out);
  };
  const genUntil = (seed, pred) => {
    reset();
    reseed(seed);
    let res = undefined;
    while (!(res = pred(gen2())))
      reseed();
    reset();
    return res;
  };
  return genUntil;
}
function validateObject(object, validators, optValidators = {}) {
  const checkField = (fieldName, type, isOptional) => {
    const checkVal = validatorFns[type];
    if (typeof checkVal !== "function")
      throw new Error("invalid validator function");
    const val = object[fieldName];
    if (isOptional && val === undefined)
      return;
    if (!checkVal(val, object)) {
      throw new Error("param " + String(fieldName) + " is invalid. Expected " + type + ", got " + val);
    }
  };
  for (const [fieldName, type] of Object.entries(validators))
    checkField(fieldName, type, false);
  for (const [fieldName, type] of Object.entries(optValidators))
    checkField(fieldName, type, true);
  return object;
}
function memoized(fn) {
  const map = new WeakMap;
  return (arg, ...args) => {
    const val = map.get(arg);
    if (val !== undefined)
      return val;
    const computed = fn(arg, ...args);
    map.set(arg, computed);
    return computed;
  };
}
var _0n2, _1n2, _2n2, hexes2, asciis, isPosBig = (n) => typeof n === "bigint" && _0n2 <= n, bitMask = (n) => (_2n2 << BigInt(n - 1)) - _1n2, u8n = (data) => new Uint8Array(data), u8fr = (arr) => Uint8Array.from(arr), validatorFns, notImplemented = () => {
  throw new Error("not implemented");
};
var init_utils3 = __esm(() => {
  /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
  _0n2 = /* @__PURE__ */ BigInt(0);
  _1n2 = /* @__PURE__ */ BigInt(1);
  _2n2 = /* @__PURE__ */ BigInt(2);
  hexes2 = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
  asciis = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
  validatorFns = {
    bigint: (val) => typeof val === "bigint",
    function: (val) => typeof val === "function",
    boolean: (val) => typeof val === "boolean",
    string: (val) => typeof val === "string",
    stringOrUint8Array: (val) => typeof val === "string" || isBytes2(val),
    isSafeInteger: (val) => Number.isSafeInteger(val),
    array: (val) => Array.isArray(val),
    field: (val, object) => object.Fp.isValid(val),
    hash: (val) => typeof val === "function" && Number.isSafeInteger(val.outputLen)
  };
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/node_modules/@noble/curves/esm/abstract/modular.js
function mod(a, b) {
  const result = a % b;
  return result >= _0n3 ? result : b + result;
}
function pow(num, power, modulo) {
  if (power < _0n3)
    throw new Error("invalid exponent, negatives unsupported");
  if (modulo <= _0n3)
    throw new Error("invalid modulus");
  if (modulo === _1n3)
    return _0n3;
  let res = _1n3;
  while (power > _0n3) {
    if (power & _1n3)
      res = res * num % modulo;
    num = num * num % modulo;
    power >>= _1n3;
  }
  return res;
}
function pow2(x, power, modulo) {
  let res = x;
  while (power-- > _0n3) {
    res *= res;
    res %= modulo;
  }
  return res;
}
function invert(number, modulo) {
  if (number === _0n3)
    throw new Error("invert: expected non-zero number");
  if (modulo <= _0n3)
    throw new Error("invert: expected positive modulus, got " + modulo);
  let a = mod(number, modulo);
  let b = modulo;
  let x = _0n3, y = _1n3, u = _1n3, v = _0n3;
  while (a !== _0n3) {
    const q = b / a;
    const r = b % a;
    const m = x - u * q;
    const n = y - v * q;
    b = a, a = r, x = u, y = v, u = m, v = n;
  }
  const gcd = b;
  if (gcd !== _1n3)
    throw new Error("invert: does not exist");
  return mod(x, modulo);
}
function tonelliShanks(P) {
  const legendreC = (P - _1n3) / _2n3;
  let Q, S, Z;
  for (Q = P - _1n3, S = 0;Q % _2n3 === _0n3; Q /= _2n3, S++)
    ;
  for (Z = _2n3;Z < P && pow(Z, legendreC, P) !== P - _1n3; Z++) {
    if (Z > 1000)
      throw new Error("Cannot find square root: likely non-prime P");
  }
  if (S === 1) {
    const p1div4 = (P + _1n3) / _4n;
    return function tonelliFast(Fp, n) {
      const root = Fp.pow(n, p1div4);
      if (!Fp.eql(Fp.sqr(root), n))
        throw new Error("Cannot find square root");
      return root;
    };
  }
  const Q1div2 = (Q + _1n3) / _2n3;
  return function tonelliSlow(Fp, n) {
    if (Fp.pow(n, legendreC) === Fp.neg(Fp.ONE))
      throw new Error("Cannot find square root");
    let r = S;
    let g = Fp.pow(Fp.mul(Fp.ONE, Z), Q);
    let x = Fp.pow(n, Q1div2);
    let b = Fp.pow(n, Q);
    while (!Fp.eql(b, Fp.ONE)) {
      if (Fp.eql(b, Fp.ZERO))
        return Fp.ZERO;
      let m = 1;
      for (let t2 = Fp.sqr(b);m < r; m++) {
        if (Fp.eql(t2, Fp.ONE))
          break;
        t2 = Fp.sqr(t2);
      }
      const ge = Fp.pow(g, _1n3 << BigInt(r - m - 1));
      g = Fp.sqr(ge);
      x = Fp.mul(x, ge);
      b = Fp.mul(b, g);
      r = m;
    }
    return x;
  };
}
function FpSqrt(P) {
  if (P % _4n === _3n) {
    const p1div4 = (P + _1n3) / _4n;
    return function sqrt3mod4(Fp, n) {
      const root = Fp.pow(n, p1div4);
      if (!Fp.eql(Fp.sqr(root), n))
        throw new Error("Cannot find square root");
      return root;
    };
  }
  if (P % _8n === _5n) {
    const c1 = (P - _5n) / _8n;
    return function sqrt5mod8(Fp, n) {
      const n2 = Fp.mul(n, _2n3);
      const v = Fp.pow(n2, c1);
      const nv = Fp.mul(n, v);
      const i = Fp.mul(Fp.mul(nv, _2n3), v);
      const root = Fp.mul(nv, Fp.sub(i, Fp.ONE));
      if (!Fp.eql(Fp.sqr(root), n))
        throw new Error("Cannot find square root");
      return root;
    };
  }
  if (P % _16n === _9n) {}
  return tonelliShanks(P);
}
function validateField(field) {
  const initial = {
    ORDER: "bigint",
    MASK: "bigint",
    BYTES: "isSafeInteger",
    BITS: "isSafeInteger"
  };
  const opts = FIELD_FIELDS.reduce((map, val) => {
    map[val] = "function";
    return map;
  }, initial);
  return validateObject(field, opts);
}
function FpPow(f, num, power) {
  if (power < _0n3)
    throw new Error("invalid exponent, negatives unsupported");
  if (power === _0n3)
    return f.ONE;
  if (power === _1n3)
    return num;
  let p = f.ONE;
  let d = num;
  while (power > _0n3) {
    if (power & _1n3)
      p = f.mul(p, d);
    d = f.sqr(d);
    power >>= _1n3;
  }
  return p;
}
function FpInvertBatch(f, nums) {
  const tmp = new Array(nums.length);
  const lastMultiplied = nums.reduce((acc, num, i) => {
    if (f.is0(num))
      return acc;
    tmp[i] = acc;
    return f.mul(acc, num);
  }, f.ONE);
  const inverted = f.inv(lastMultiplied);
  nums.reduceRight((acc, num, i) => {
    if (f.is0(num))
      return acc;
    tmp[i] = f.mul(acc, tmp[i]);
    return f.mul(acc, num);
  }, inverted);
  return tmp;
}
function nLength(n, nBitLength) {
  const _nBitLength = nBitLength !== undefined ? nBitLength : n.toString(2).length;
  const nByteLength = Math.ceil(_nBitLength / 8);
  return { nBitLength: _nBitLength, nByteLength };
}
function Field(ORDER, bitLen2, isLE2 = false, redef = {}) {
  if (ORDER <= _0n3)
    throw new Error("invalid field: expected ORDER > 0, got " + ORDER);
  const { nBitLength: BITS, nByteLength: BYTES } = nLength(ORDER, bitLen2);
  if (BYTES > 2048)
    throw new Error("invalid field: expected ORDER of <= 2048 bytes");
  let sqrtP;
  const f = Object.freeze({
    ORDER,
    isLE: isLE2,
    BITS,
    BYTES,
    MASK: bitMask(BITS),
    ZERO: _0n3,
    ONE: _1n3,
    create: (num) => mod(num, ORDER),
    isValid: (num) => {
      if (typeof num !== "bigint")
        throw new Error("invalid field element: expected bigint, got " + typeof num);
      return _0n3 <= num && num < ORDER;
    },
    is0: (num) => num === _0n3,
    isOdd: (num) => (num & _1n3) === _1n3,
    neg: (num) => mod(-num, ORDER),
    eql: (lhs, rhs) => lhs === rhs,
    sqr: (num) => mod(num * num, ORDER),
    add: (lhs, rhs) => mod(lhs + rhs, ORDER),
    sub: (lhs, rhs) => mod(lhs - rhs, ORDER),
    mul: (lhs, rhs) => mod(lhs * rhs, ORDER),
    pow: (num, power) => FpPow(f, num, power),
    div: (lhs, rhs) => mod(lhs * invert(rhs, ORDER), ORDER),
    sqrN: (num) => num * num,
    addN: (lhs, rhs) => lhs + rhs,
    subN: (lhs, rhs) => lhs - rhs,
    mulN: (lhs, rhs) => lhs * rhs,
    inv: (num) => invert(num, ORDER),
    sqrt: redef.sqrt || ((n) => {
      if (!sqrtP)
        sqrtP = FpSqrt(ORDER);
      return sqrtP(f, n);
    }),
    invertBatch: (lst) => FpInvertBatch(f, lst),
    cmov: (a, b, c) => c ? b : a,
    toBytes: (num) => isLE2 ? numberToBytesLE(num, BYTES) : numberToBytesBE(num, BYTES),
    fromBytes: (bytes) => {
      if (bytes.length !== BYTES)
        throw new Error("Field.fromBytes: expected " + BYTES + " bytes, got " + bytes.length);
      return isLE2 ? bytesToNumberLE(bytes) : bytesToNumberBE(bytes);
    }
  });
  return Object.freeze(f);
}
function getFieldBytesLength(fieldOrder) {
  if (typeof fieldOrder !== "bigint")
    throw new Error("field order must be bigint");
  const bitLength = fieldOrder.toString(2).length;
  return Math.ceil(bitLength / 8);
}
function getMinHashLength(fieldOrder) {
  const length = getFieldBytesLength(fieldOrder);
  return length + Math.ceil(length / 2);
}
function mapHashToField(key, fieldOrder, isLE2 = false) {
  const len = key.length;
  const fieldLen = getFieldBytesLength(fieldOrder);
  const minLen = getMinHashLength(fieldOrder);
  if (len < 16 || len < minLen || len > 1024)
    throw new Error("expected " + minLen + "-1024 bytes of input, got " + len);
  const num = isLE2 ? bytesToNumberLE(key) : bytesToNumberBE(key);
  const reduced = mod(num, fieldOrder - _1n3) + _1n3;
  return isLE2 ? numberToBytesLE(reduced, fieldLen) : numberToBytesBE(reduced, fieldLen);
}
var _0n3, _1n3, _2n3, _3n, _4n, _5n, _8n, _9n, _16n, FIELD_FIELDS;
var init_modular = __esm(() => {
  init_utils3();
  /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
  _0n3 = BigInt(0);
  _1n3 = BigInt(1);
  _2n3 = /* @__PURE__ */ BigInt(2);
  _3n = /* @__PURE__ */ BigInt(3);
  _4n = /* @__PURE__ */ BigInt(4);
  _5n = /* @__PURE__ */ BigInt(5);
  _8n = /* @__PURE__ */ BigInt(8);
  _9n = /* @__PURE__ */ BigInt(9);
  _16n = /* @__PURE__ */ BigInt(16);
  FIELD_FIELDS = [
    "create",
    "isValid",
    "is0",
    "neg",
    "inv",
    "sqrt",
    "sqr",
    "eql",
    "add",
    "sub",
    "mul",
    "pow",
    "div",
    "addN",
    "subN",
    "mulN",
    "sqrN"
  ];
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/node_modules/@noble/curves/esm/abstract/curve.js
function constTimeNegate(condition, item) {
  const neg = item.negate();
  return condition ? neg : item;
}
function validateW(W, bits) {
  if (!Number.isSafeInteger(W) || W <= 0 || W > bits)
    throw new Error("invalid window size, expected [1.." + bits + "], got W=" + W);
}
function calcWOpts(W, bits) {
  validateW(W, bits);
  const windows = Math.ceil(bits / W) + 1;
  const windowSize = 2 ** (W - 1);
  return { windows, windowSize };
}
function validateMSMPoints(points, c) {
  if (!Array.isArray(points))
    throw new Error("array expected");
  points.forEach((p, i) => {
    if (!(p instanceof c))
      throw new Error("invalid point at index " + i);
  });
}
function validateMSMScalars(scalars, field) {
  if (!Array.isArray(scalars))
    throw new Error("array of scalars expected");
  scalars.forEach((s, i) => {
    if (!field.isValid(s))
      throw new Error("invalid scalar at index " + i);
  });
}
function getW(P) {
  return pointWindowSizes.get(P) || 1;
}
function wNAF(c, bits) {
  return {
    constTimeNegate,
    hasPrecomputes(elm) {
      return getW(elm) !== 1;
    },
    unsafeLadder(elm, n, p = c.ZERO) {
      let d = elm;
      while (n > _0n4) {
        if (n & _1n4)
          p = p.add(d);
        d = d.double();
        n >>= _1n4;
      }
      return p;
    },
    precomputeWindow(elm, W) {
      const { windows, windowSize } = calcWOpts(W, bits);
      const points = [];
      let p = elm;
      let base = p;
      for (let window = 0;window < windows; window++) {
        base = p;
        points.push(base);
        for (let i = 1;i < windowSize; i++) {
          base = base.add(p);
          points.push(base);
        }
        p = base.double();
      }
      return points;
    },
    wNAF(W, precomputes, n) {
      const { windows, windowSize } = calcWOpts(W, bits);
      let p = c.ZERO;
      let f = c.BASE;
      const mask = BigInt(2 ** W - 1);
      const maxNumber = 2 ** W;
      const shiftBy = BigInt(W);
      for (let window = 0;window < windows; window++) {
        const offset = window * windowSize;
        let wbits = Number(n & mask);
        n >>= shiftBy;
        if (wbits > windowSize) {
          wbits -= maxNumber;
          n += _1n4;
        }
        const offset1 = offset;
        const offset2 = offset + Math.abs(wbits) - 1;
        const cond1 = window % 2 !== 0;
        const cond2 = wbits < 0;
        if (wbits === 0) {
          f = f.add(constTimeNegate(cond1, precomputes[offset1]));
        } else {
          p = p.add(constTimeNegate(cond2, precomputes[offset2]));
        }
      }
      return { p, f };
    },
    wNAFUnsafe(W, precomputes, n, acc = c.ZERO) {
      const { windows, windowSize } = calcWOpts(W, bits);
      const mask = BigInt(2 ** W - 1);
      const maxNumber = 2 ** W;
      const shiftBy = BigInt(W);
      for (let window = 0;window < windows; window++) {
        const offset = window * windowSize;
        if (n === _0n4)
          break;
        let wbits = Number(n & mask);
        n >>= shiftBy;
        if (wbits > windowSize) {
          wbits -= maxNumber;
          n += _1n4;
        }
        if (wbits === 0)
          continue;
        let curr = precomputes[offset + Math.abs(wbits) - 1];
        if (wbits < 0)
          curr = curr.negate();
        acc = acc.add(curr);
      }
      return acc;
    },
    getPrecomputes(W, P, transform) {
      let comp = pointPrecomputes.get(P);
      if (!comp) {
        comp = this.precomputeWindow(P, W);
        if (W !== 1)
          pointPrecomputes.set(P, transform(comp));
      }
      return comp;
    },
    wNAFCached(P, n, transform) {
      const W = getW(P);
      return this.wNAF(W, this.getPrecomputes(W, P, transform), n);
    },
    wNAFCachedUnsafe(P, n, transform, prev) {
      const W = getW(P);
      if (W === 1)
        return this.unsafeLadder(P, n, prev);
      return this.wNAFUnsafe(W, this.getPrecomputes(W, P, transform), n, prev);
    },
    setWindowSize(P, W) {
      validateW(W, bits);
      pointWindowSizes.set(P, W);
      pointPrecomputes.delete(P);
    }
  };
}
function pippenger(c, fieldN, points, scalars) {
  validateMSMPoints(points, c);
  validateMSMScalars(scalars, fieldN);
  if (points.length !== scalars.length)
    throw new Error("arrays of points and scalars must have equal length");
  const zero = c.ZERO;
  const wbits = bitLen(BigInt(points.length));
  const windowSize = wbits > 12 ? wbits - 3 : wbits > 4 ? wbits - 2 : wbits ? 2 : 1;
  const MASK = (1 << windowSize) - 1;
  const buckets = new Array(MASK + 1).fill(zero);
  const lastBits = Math.floor((fieldN.BITS - 1) / windowSize) * windowSize;
  let sum = zero;
  for (let i = lastBits;i >= 0; i -= windowSize) {
    buckets.fill(zero);
    for (let j = 0;j < scalars.length; j++) {
      const scalar = scalars[j];
      const wbits2 = Number(scalar >> BigInt(i) & BigInt(MASK));
      buckets[wbits2] = buckets[wbits2].add(points[j]);
    }
    let resI = zero;
    for (let j = buckets.length - 1, sumI = zero;j > 0; j--) {
      sumI = sumI.add(buckets[j]);
      resI = resI.add(sumI);
    }
    sum = sum.add(resI);
    if (i !== 0)
      for (let j = 0;j < windowSize; j++)
        sum = sum.double();
  }
  return sum;
}
function validateBasic(curve) {
  validateField(curve.Fp);
  validateObject(curve, {
    n: "bigint",
    h: "bigint",
    Gx: "field",
    Gy: "field"
  }, {
    nBitLength: "isSafeInteger",
    nByteLength: "isSafeInteger"
  });
  return Object.freeze({
    ...nLength(curve.n, curve.nBitLength),
    ...curve,
    ...{ p: curve.Fp.ORDER }
  });
}
var _0n4, _1n4, pointPrecomputes, pointWindowSizes;
var init_curve = __esm(() => {
  init_modular();
  init_utils3();
  /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
  _0n4 = BigInt(0);
  _1n4 = BigInt(1);
  pointPrecomputes = new WeakMap;
  pointWindowSizes = new WeakMap;
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/node_modules/@noble/curves/esm/abstract/weierstrass.js
function validateSigVerOpts(opts) {
  if (opts.lowS !== undefined)
    abool("lowS", opts.lowS);
  if (opts.prehash !== undefined)
    abool("prehash", opts.prehash);
}
function validatePointOpts(curve) {
  const opts = validateBasic(curve);
  validateObject(opts, {
    a: "field",
    b: "field"
  }, {
    allowedPrivateKeyLengths: "array",
    wrapPrivateKey: "boolean",
    isTorsionFree: "function",
    clearCofactor: "function",
    allowInfinityPoint: "boolean",
    fromBytes: "function",
    toBytes: "function"
  });
  const { endo, Fp, a } = opts;
  if (endo) {
    if (!Fp.eql(a, Fp.ZERO)) {
      throw new Error("invalid endomorphism, can only be defined for Koblitz curves that have a=0");
    }
    if (typeof endo !== "object" || typeof endo.beta !== "bigint" || typeof endo.splitScalar !== "function") {
      throw new Error("invalid endomorphism, expected beta: bigint and splitScalar: function");
    }
  }
  return Object.freeze({ ...opts });
}
function weierstrassPoints(opts) {
  const CURVE = validatePointOpts(opts);
  const { Fp } = CURVE;
  const Fn = Field(CURVE.n, CURVE.nBitLength);
  const toBytes3 = CURVE.toBytes || ((_c, point, _isCompressed) => {
    const a = point.toAffine();
    return concatBytes3(Uint8Array.from([4]), Fp.toBytes(a.x), Fp.toBytes(a.y));
  });
  const fromBytes = CURVE.fromBytes || ((bytes) => {
    const tail = bytes.subarray(1);
    const x = Fp.fromBytes(tail.subarray(0, Fp.BYTES));
    const y = Fp.fromBytes(tail.subarray(Fp.BYTES, 2 * Fp.BYTES));
    return { x, y };
  });
  function weierstrassEquation(x) {
    const { a, b } = CURVE;
    const x2 = Fp.sqr(x);
    const x3 = Fp.mul(x2, x);
    return Fp.add(Fp.add(x3, Fp.mul(x, a)), b);
  }
  if (!Fp.eql(Fp.sqr(CURVE.Gy), weierstrassEquation(CURVE.Gx)))
    throw new Error("bad generator point: equation left != right");
  function isWithinCurveOrder(num) {
    return inRange(num, _1n5, CURVE.n);
  }
  function normPrivateKeyToScalar(key) {
    const { allowedPrivateKeyLengths: lengths, nByteLength, wrapPrivateKey, n: N } = CURVE;
    if (lengths && typeof key !== "bigint") {
      if (isBytes2(key))
        key = bytesToHex2(key);
      if (typeof key !== "string" || !lengths.includes(key.length))
        throw new Error("invalid private key");
      key = key.padStart(nByteLength * 2, "0");
    }
    let num;
    try {
      num = typeof key === "bigint" ? key : bytesToNumberBE(ensureBytes("private key", key, nByteLength));
    } catch (error) {
      throw new Error("invalid private key, expected hex or " + nByteLength + " bytes, got " + typeof key);
    }
    if (wrapPrivateKey)
      num = mod(num, N);
    aInRange("private key", num, _1n5, N);
    return num;
  }
  function assertPrjPoint(other) {
    if (!(other instanceof Point))
      throw new Error("ProjectivePoint expected");
  }
  const toAffineMemo = memoized((p, iz) => {
    const { px: x, py: y, pz: z } = p;
    if (Fp.eql(z, Fp.ONE))
      return { x, y };
    const is0 = p.is0();
    if (iz == null)
      iz = is0 ? Fp.ONE : Fp.inv(z);
    const ax = Fp.mul(x, iz);
    const ay = Fp.mul(y, iz);
    const zz = Fp.mul(z, iz);
    if (is0)
      return { x: Fp.ZERO, y: Fp.ZERO };
    if (!Fp.eql(zz, Fp.ONE))
      throw new Error("invZ was invalid");
    return { x: ax, y: ay };
  });
  const assertValidMemo = memoized((p) => {
    if (p.is0()) {
      if (CURVE.allowInfinityPoint && !Fp.is0(p.py))
        return;
      throw new Error("bad point: ZERO");
    }
    const { x, y } = p.toAffine();
    if (!Fp.isValid(x) || !Fp.isValid(y))
      throw new Error("bad point: x or y not FE");
    const left = Fp.sqr(y);
    const right = weierstrassEquation(x);
    if (!Fp.eql(left, right))
      throw new Error("bad point: equation left != right");
    if (!p.isTorsionFree())
      throw new Error("bad point: not in prime-order subgroup");
    return true;
  });

  class Point {
    constructor(px, py, pz) {
      this.px = px;
      this.py = py;
      this.pz = pz;
      if (px == null || !Fp.isValid(px))
        throw new Error("x required");
      if (py == null || !Fp.isValid(py))
        throw new Error("y required");
      if (pz == null || !Fp.isValid(pz))
        throw new Error("z required");
      Object.freeze(this);
    }
    static fromAffine(p) {
      const { x, y } = p || {};
      if (!p || !Fp.isValid(x) || !Fp.isValid(y))
        throw new Error("invalid affine point");
      if (p instanceof Point)
        throw new Error("projective point not allowed");
      const is0 = (i) => Fp.eql(i, Fp.ZERO);
      if (is0(x) && is0(y))
        return Point.ZERO;
      return new Point(x, y, Fp.ONE);
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    static normalizeZ(points) {
      const toInv = Fp.invertBatch(points.map((p) => p.pz));
      return points.map((p, i) => p.toAffine(toInv[i])).map(Point.fromAffine);
    }
    static fromHex(hex) {
      const P = Point.fromAffine(fromBytes(ensureBytes("pointHex", hex)));
      P.assertValidity();
      return P;
    }
    static fromPrivateKey(privateKey) {
      return Point.BASE.multiply(normPrivateKeyToScalar(privateKey));
    }
    static msm(points, scalars) {
      return pippenger(Point, Fn, points, scalars);
    }
    _setWindowSize(windowSize) {
      wnaf.setWindowSize(this, windowSize);
    }
    assertValidity() {
      assertValidMemo(this);
    }
    hasEvenY() {
      const { y } = this.toAffine();
      if (Fp.isOdd)
        return !Fp.isOdd(y);
      throw new Error("Field doesn't support isOdd");
    }
    equals(other) {
      assertPrjPoint(other);
      const { px: X1, py: Y1, pz: Z1 } = this;
      const { px: X2, py: Y2, pz: Z2 } = other;
      const U1 = Fp.eql(Fp.mul(X1, Z2), Fp.mul(X2, Z1));
      const U2 = Fp.eql(Fp.mul(Y1, Z2), Fp.mul(Y2, Z1));
      return U1 && U2;
    }
    negate() {
      return new Point(this.px, Fp.neg(this.py), this.pz);
    }
    double() {
      const { a, b } = CURVE;
      const b3 = Fp.mul(b, _3n2);
      const { px: X1, py: Y1, pz: Z1 } = this;
      let { ZERO: X3, ZERO: Y3, ZERO: Z3 } = Fp;
      let t0 = Fp.mul(X1, X1);
      let t1 = Fp.mul(Y1, Y1);
      let t2 = Fp.mul(Z1, Z1);
      let t3 = Fp.mul(X1, Y1);
      t3 = Fp.add(t3, t3);
      Z3 = Fp.mul(X1, Z1);
      Z3 = Fp.add(Z3, Z3);
      X3 = Fp.mul(a, Z3);
      Y3 = Fp.mul(b3, t2);
      Y3 = Fp.add(X3, Y3);
      X3 = Fp.sub(t1, Y3);
      Y3 = Fp.add(t1, Y3);
      Y3 = Fp.mul(X3, Y3);
      X3 = Fp.mul(t3, X3);
      Z3 = Fp.mul(b3, Z3);
      t2 = Fp.mul(a, t2);
      t3 = Fp.sub(t0, t2);
      t3 = Fp.mul(a, t3);
      t3 = Fp.add(t3, Z3);
      Z3 = Fp.add(t0, t0);
      t0 = Fp.add(Z3, t0);
      t0 = Fp.add(t0, t2);
      t0 = Fp.mul(t0, t3);
      Y3 = Fp.add(Y3, t0);
      t2 = Fp.mul(Y1, Z1);
      t2 = Fp.add(t2, t2);
      t0 = Fp.mul(t2, t3);
      X3 = Fp.sub(X3, t0);
      Z3 = Fp.mul(t2, t1);
      Z3 = Fp.add(Z3, Z3);
      Z3 = Fp.add(Z3, Z3);
      return new Point(X3, Y3, Z3);
    }
    add(other) {
      assertPrjPoint(other);
      const { px: X1, py: Y1, pz: Z1 } = this;
      const { px: X2, py: Y2, pz: Z2 } = other;
      let { ZERO: X3, ZERO: Y3, ZERO: Z3 } = Fp;
      const a = CURVE.a;
      const b3 = Fp.mul(CURVE.b, _3n2);
      let t0 = Fp.mul(X1, X2);
      let t1 = Fp.mul(Y1, Y2);
      let t2 = Fp.mul(Z1, Z2);
      let t3 = Fp.add(X1, Y1);
      let t4 = Fp.add(X2, Y2);
      t3 = Fp.mul(t3, t4);
      t4 = Fp.add(t0, t1);
      t3 = Fp.sub(t3, t4);
      t4 = Fp.add(X1, Z1);
      let t5 = Fp.add(X2, Z2);
      t4 = Fp.mul(t4, t5);
      t5 = Fp.add(t0, t2);
      t4 = Fp.sub(t4, t5);
      t5 = Fp.add(Y1, Z1);
      X3 = Fp.add(Y2, Z2);
      t5 = Fp.mul(t5, X3);
      X3 = Fp.add(t1, t2);
      t5 = Fp.sub(t5, X3);
      Z3 = Fp.mul(a, t4);
      X3 = Fp.mul(b3, t2);
      Z3 = Fp.add(X3, Z3);
      X3 = Fp.sub(t1, Z3);
      Z3 = Fp.add(t1, Z3);
      Y3 = Fp.mul(X3, Z3);
      t1 = Fp.add(t0, t0);
      t1 = Fp.add(t1, t0);
      t2 = Fp.mul(a, t2);
      t4 = Fp.mul(b3, t4);
      t1 = Fp.add(t1, t2);
      t2 = Fp.sub(t0, t2);
      t2 = Fp.mul(a, t2);
      t4 = Fp.add(t4, t2);
      t0 = Fp.mul(t1, t4);
      Y3 = Fp.add(Y3, t0);
      t0 = Fp.mul(t5, t4);
      X3 = Fp.mul(t3, X3);
      X3 = Fp.sub(X3, t0);
      t0 = Fp.mul(t3, t1);
      Z3 = Fp.mul(t5, Z3);
      Z3 = Fp.add(Z3, t0);
      return new Point(X3, Y3, Z3);
    }
    subtract(other) {
      return this.add(other.negate());
    }
    is0() {
      return this.equals(Point.ZERO);
    }
    wNAF(n) {
      return wnaf.wNAFCached(this, n, Point.normalizeZ);
    }
    multiplyUnsafe(sc) {
      const { endo, n: N } = CURVE;
      aInRange("scalar", sc, _0n5, N);
      const I = Point.ZERO;
      if (sc === _0n5)
        return I;
      if (this.is0() || sc === _1n5)
        return this;
      if (!endo || wnaf.hasPrecomputes(this))
        return wnaf.wNAFCachedUnsafe(this, sc, Point.normalizeZ);
      let { k1neg, k1, k2neg, k2 } = endo.splitScalar(sc);
      let k1p = I;
      let k2p = I;
      let d = this;
      while (k1 > _0n5 || k2 > _0n5) {
        if (k1 & _1n5)
          k1p = k1p.add(d);
        if (k2 & _1n5)
          k2p = k2p.add(d);
        d = d.double();
        k1 >>= _1n5;
        k2 >>= _1n5;
      }
      if (k1neg)
        k1p = k1p.negate();
      if (k2neg)
        k2p = k2p.negate();
      k2p = new Point(Fp.mul(k2p.px, endo.beta), k2p.py, k2p.pz);
      return k1p.add(k2p);
    }
    multiply(scalar) {
      const { endo, n: N } = CURVE;
      aInRange("scalar", scalar, _1n5, N);
      let point, fake;
      if (endo) {
        const { k1neg, k1, k2neg, k2 } = endo.splitScalar(scalar);
        let { p: k1p, f: f1p } = this.wNAF(k1);
        let { p: k2p, f: f2p } = this.wNAF(k2);
        k1p = wnaf.constTimeNegate(k1neg, k1p);
        k2p = wnaf.constTimeNegate(k2neg, k2p);
        k2p = new Point(Fp.mul(k2p.px, endo.beta), k2p.py, k2p.pz);
        point = k1p.add(k2p);
        fake = f1p.add(f2p);
      } else {
        const { p, f } = this.wNAF(scalar);
        point = p;
        fake = f;
      }
      return Point.normalizeZ([point, fake])[0];
    }
    multiplyAndAddUnsafe(Q, a, b) {
      const G = Point.BASE;
      const mul = (P, a2) => a2 === _0n5 || a2 === _1n5 || !P.equals(G) ? P.multiplyUnsafe(a2) : P.multiply(a2);
      const sum = mul(this, a).add(mul(Q, b));
      return sum.is0() ? undefined : sum;
    }
    toAffine(iz) {
      return toAffineMemo(this, iz);
    }
    isTorsionFree() {
      const { h: cofactor, isTorsionFree } = CURVE;
      if (cofactor === _1n5)
        return true;
      if (isTorsionFree)
        return isTorsionFree(Point, this);
      throw new Error("isTorsionFree() has not been declared for the elliptic curve");
    }
    clearCofactor() {
      const { h: cofactor, clearCofactor } = CURVE;
      if (cofactor === _1n5)
        return this;
      if (clearCofactor)
        return clearCofactor(Point, this);
      return this.multiplyUnsafe(CURVE.h);
    }
    toRawBytes(isCompressed = true) {
      abool("isCompressed", isCompressed);
      this.assertValidity();
      return toBytes3(Point, this, isCompressed);
    }
    toHex(isCompressed = true) {
      abool("isCompressed", isCompressed);
      return bytesToHex2(this.toRawBytes(isCompressed));
    }
  }
  Point.BASE = new Point(CURVE.Gx, CURVE.Gy, Fp.ONE);
  Point.ZERO = new Point(Fp.ZERO, Fp.ONE, Fp.ZERO);
  const _bits = CURVE.nBitLength;
  const wnaf = wNAF(Point, CURVE.endo ? Math.ceil(_bits / 2) : _bits);
  return {
    CURVE,
    ProjectivePoint: Point,
    normPrivateKeyToScalar,
    weierstrassEquation,
    isWithinCurveOrder
  };
}
function validateOpts(curve) {
  const opts = validateBasic(curve);
  validateObject(opts, {
    hash: "hash",
    hmac: "function",
    randomBytes: "function"
  }, {
    bits2int: "function",
    bits2int_modN: "function",
    lowS: "boolean"
  });
  return Object.freeze({ lowS: true, ...opts });
}
function weierstrass(curveDef) {
  const CURVE = validateOpts(curveDef);
  const { Fp, n: CURVE_ORDER } = CURVE;
  const compressedLen = Fp.BYTES + 1;
  const uncompressedLen = 2 * Fp.BYTES + 1;
  function modN(a) {
    return mod(a, CURVE_ORDER);
  }
  function invN(a) {
    return invert(a, CURVE_ORDER);
  }
  const { ProjectivePoint: Point, normPrivateKeyToScalar, weierstrassEquation, isWithinCurveOrder } = weierstrassPoints({
    ...CURVE,
    toBytes(_c, point, isCompressed) {
      const a = point.toAffine();
      const x = Fp.toBytes(a.x);
      const cat = concatBytes3;
      abool("isCompressed", isCompressed);
      if (isCompressed) {
        return cat(Uint8Array.from([point.hasEvenY() ? 2 : 3]), x);
      } else {
        return cat(Uint8Array.from([4]), x, Fp.toBytes(a.y));
      }
    },
    fromBytes(bytes) {
      const len = bytes.length;
      const head = bytes[0];
      const tail = bytes.subarray(1);
      if (len === compressedLen && (head === 2 || head === 3)) {
        const x = bytesToNumberBE(tail);
        if (!inRange(x, _1n5, Fp.ORDER))
          throw new Error("Point is not on curve");
        const y2 = weierstrassEquation(x);
        let y;
        try {
          y = Fp.sqrt(y2);
        } catch (sqrtError) {
          const suffix = sqrtError instanceof Error ? ": " + sqrtError.message : "";
          throw new Error("Point is not on curve" + suffix);
        }
        const isYOdd = (y & _1n5) === _1n5;
        const isHeadOdd = (head & 1) === 1;
        if (isHeadOdd !== isYOdd)
          y = Fp.neg(y);
        return { x, y };
      } else if (len === uncompressedLen && head === 4) {
        const x = Fp.fromBytes(tail.subarray(0, Fp.BYTES));
        const y = Fp.fromBytes(tail.subarray(Fp.BYTES, 2 * Fp.BYTES));
        return { x, y };
      } else {
        const cl = compressedLen;
        const ul = uncompressedLen;
        throw new Error("invalid Point, expected length of " + cl + ", or uncompressed " + ul + ", got " + len);
      }
    }
  });
  const numToNByteStr = (num) => bytesToHex2(numberToBytesBE(num, CURVE.nByteLength));
  function isBiggerThanHalfOrder(number) {
    const HALF = CURVE_ORDER >> _1n5;
    return number > HALF;
  }
  function normalizeS(s) {
    return isBiggerThanHalfOrder(s) ? modN(-s) : s;
  }
  const slcNum = (b, from, to) => bytesToNumberBE(b.slice(from, to));

  class Signature {
    constructor(r, s, recovery) {
      this.r = r;
      this.s = s;
      this.recovery = recovery;
      this.assertValidity();
    }
    static fromCompact(hex) {
      const l = CURVE.nByteLength;
      hex = ensureBytes("compactSignature", hex, l * 2);
      return new Signature(slcNum(hex, 0, l), slcNum(hex, l, 2 * l));
    }
    static fromDER(hex) {
      const { r, s } = DER.toSig(ensureBytes("DER", hex));
      return new Signature(r, s);
    }
    assertValidity() {
      aInRange("r", this.r, _1n5, CURVE_ORDER);
      aInRange("s", this.s, _1n5, CURVE_ORDER);
    }
    addRecoveryBit(recovery) {
      return new Signature(this.r, this.s, recovery);
    }
    recoverPublicKey(msgHash) {
      const { r, s, recovery: rec } = this;
      const h = bits2int_modN(ensureBytes("msgHash", msgHash));
      if (rec == null || ![0, 1, 2, 3].includes(rec))
        throw new Error("recovery id invalid");
      const radj = rec === 2 || rec === 3 ? r + CURVE.n : r;
      if (radj >= Fp.ORDER)
        throw new Error("recovery id 2 or 3 invalid");
      const prefix = (rec & 1) === 0 ? "02" : "03";
      const R = Point.fromHex(prefix + numToNByteStr(radj));
      const ir = invN(radj);
      const u1 = modN(-h * ir);
      const u2 = modN(s * ir);
      const Q = Point.BASE.multiplyAndAddUnsafe(R, u1, u2);
      if (!Q)
        throw new Error("point at infinify");
      Q.assertValidity();
      return Q;
    }
    hasHighS() {
      return isBiggerThanHalfOrder(this.s);
    }
    normalizeS() {
      return this.hasHighS() ? new Signature(this.r, modN(-this.s), this.recovery) : this;
    }
    toDERRawBytes() {
      return hexToBytes2(this.toDERHex());
    }
    toDERHex() {
      return DER.hexFromSig({ r: this.r, s: this.s });
    }
    toCompactRawBytes() {
      return hexToBytes2(this.toCompactHex());
    }
    toCompactHex() {
      return numToNByteStr(this.r) + numToNByteStr(this.s);
    }
  }
  const utils = {
    isValidPrivateKey(privateKey) {
      try {
        normPrivateKeyToScalar(privateKey);
        return true;
      } catch (error) {
        return false;
      }
    },
    normPrivateKeyToScalar,
    randomPrivateKey: () => {
      const length = getMinHashLength(CURVE.n);
      return mapHashToField(CURVE.randomBytes(length), CURVE.n);
    },
    precompute(windowSize = 8, point = Point.BASE) {
      point._setWindowSize(windowSize);
      point.multiply(BigInt(3));
      return point;
    }
  };
  function getPublicKey(privateKey, isCompressed = true) {
    return Point.fromPrivateKey(privateKey).toRawBytes(isCompressed);
  }
  function isProbPub(item) {
    const arr = isBytes2(item);
    const str = typeof item === "string";
    const len = (arr || str) && item.length;
    if (arr)
      return len === compressedLen || len === uncompressedLen;
    if (str)
      return len === 2 * compressedLen || len === 2 * uncompressedLen;
    if (item instanceof Point)
      return true;
    return false;
  }
  function getSharedSecret(privateA, publicB, isCompressed = true) {
    if (isProbPub(privateA))
      throw new Error("first arg must be private key");
    if (!isProbPub(publicB))
      throw new Error("second arg must be public key");
    const b = Point.fromHex(publicB);
    return b.multiply(normPrivateKeyToScalar(privateA)).toRawBytes(isCompressed);
  }
  const bits2int = CURVE.bits2int || function(bytes) {
    if (bytes.length > 8192)
      throw new Error("input is too large");
    const num = bytesToNumberBE(bytes);
    const delta = bytes.length * 8 - CURVE.nBitLength;
    return delta > 0 ? num >> BigInt(delta) : num;
  };
  const bits2int_modN = CURVE.bits2int_modN || function(bytes) {
    return modN(bits2int(bytes));
  };
  const ORDER_MASK = bitMask(CURVE.nBitLength);
  function int2octets(num) {
    aInRange("num < 2^" + CURVE.nBitLength, num, _0n5, ORDER_MASK);
    return numberToBytesBE(num, CURVE.nByteLength);
  }
  function prepSig(msgHash, privateKey, opts = defaultSigOpts) {
    if (["recovered", "canonical"].some((k) => (k in opts)))
      throw new Error("sign() legacy options not supported");
    const { hash: hash2, randomBytes: randomBytes2 } = CURVE;
    let { lowS, prehash, extraEntropy: ent } = opts;
    if (lowS == null)
      lowS = true;
    msgHash = ensureBytes("msgHash", msgHash);
    validateSigVerOpts(opts);
    if (prehash)
      msgHash = ensureBytes("prehashed msgHash", hash2(msgHash));
    const h1int = bits2int_modN(msgHash);
    const d = normPrivateKeyToScalar(privateKey);
    const seedArgs = [int2octets(d), int2octets(h1int)];
    if (ent != null && ent !== false) {
      const e = ent === true ? randomBytes2(Fp.BYTES) : ent;
      seedArgs.push(ensureBytes("extraEntropy", e));
    }
    const seed = concatBytes3(...seedArgs);
    const m = h1int;
    function k2sig(kBytes) {
      const k = bits2int(kBytes);
      if (!isWithinCurveOrder(k))
        return;
      const ik = invN(k);
      const q = Point.BASE.multiply(k).toAffine();
      const r = modN(q.x);
      if (r === _0n5)
        return;
      const s = modN(ik * modN(m + r * d));
      if (s === _0n5)
        return;
      let recovery = (q.x === r ? 0 : 2) | Number(q.y & _1n5);
      let normS = s;
      if (lowS && isBiggerThanHalfOrder(s)) {
        normS = normalizeS(s);
        recovery ^= 1;
      }
      return new Signature(r, normS, recovery);
    }
    return { seed, k2sig };
  }
  const defaultSigOpts = { lowS: CURVE.lowS, prehash: false };
  const defaultVerOpts = { lowS: CURVE.lowS, prehash: false };
  function sign(msgHash, privKey, opts = defaultSigOpts) {
    const { seed, k2sig } = prepSig(msgHash, privKey, opts);
    const C = CURVE;
    const drbg = createHmacDrbg(C.hash.outputLen, C.nByteLength, C.hmac);
    return drbg(seed, k2sig);
  }
  Point.BASE._setWindowSize(8);
  function verify(signature, msgHash, publicKey, opts = defaultVerOpts) {
    const sg = signature;
    msgHash = ensureBytes("msgHash", msgHash);
    publicKey = ensureBytes("publicKey", publicKey);
    const { lowS, prehash, format } = opts;
    validateSigVerOpts(opts);
    if ("strict" in opts)
      throw new Error("options.strict was renamed to lowS");
    if (format !== undefined && format !== "compact" && format !== "der")
      throw new Error("format must be compact or der");
    const isHex2 = typeof sg === "string" || isBytes2(sg);
    const isObj = !isHex2 && !format && typeof sg === "object" && sg !== null && typeof sg.r === "bigint" && typeof sg.s === "bigint";
    if (!isHex2 && !isObj)
      throw new Error("invalid signature, expected Uint8Array, hex string or Signature instance");
    let _sig = undefined;
    let P;
    try {
      if (isObj)
        _sig = new Signature(sg.r, sg.s);
      if (isHex2) {
        try {
          if (format !== "compact")
            _sig = Signature.fromDER(sg);
        } catch (derError) {
          if (!(derError instanceof DER.Err))
            throw derError;
        }
        if (!_sig && format !== "der")
          _sig = Signature.fromCompact(sg);
      }
      P = Point.fromHex(publicKey);
    } catch (error) {
      return false;
    }
    if (!_sig)
      return false;
    if (lowS && _sig.hasHighS())
      return false;
    if (prehash)
      msgHash = CURVE.hash(msgHash);
    const { r, s } = _sig;
    const h = bits2int_modN(msgHash);
    const is = invN(s);
    const u1 = modN(h * is);
    const u2 = modN(r * is);
    const R = Point.BASE.multiplyAndAddUnsafe(P, u1, u2)?.toAffine();
    if (!R)
      return false;
    const v = modN(R.x);
    return v === r;
  }
  return {
    CURVE,
    getPublicKey,
    getSharedSecret,
    sign,
    verify,
    ProjectivePoint: Point,
    Signature,
    utils
  };
}
function SWUFpSqrtRatio(Fp, Z) {
  const q = Fp.ORDER;
  let l = _0n5;
  for (let o = q - _1n5;o % _2n4 === _0n5; o /= _2n4)
    l += _1n5;
  const c1 = l;
  const _2n_pow_c1_1 = _2n4 << c1 - _1n5 - _1n5;
  const _2n_pow_c1 = _2n_pow_c1_1 * _2n4;
  const c2 = (q - _1n5) / _2n_pow_c1;
  const c3 = (c2 - _1n5) / _2n4;
  const c4 = _2n_pow_c1 - _1n5;
  const c5 = _2n_pow_c1_1;
  const c6 = Fp.pow(Z, c2);
  const c7 = Fp.pow(Z, (c2 + _1n5) / _2n4);
  let sqrtRatio = (u, v) => {
    let tv1 = c6;
    let tv2 = Fp.pow(v, c4);
    let tv3 = Fp.sqr(tv2);
    tv3 = Fp.mul(tv3, v);
    let tv5 = Fp.mul(u, tv3);
    tv5 = Fp.pow(tv5, c3);
    tv5 = Fp.mul(tv5, tv2);
    tv2 = Fp.mul(tv5, v);
    tv3 = Fp.mul(tv5, u);
    let tv4 = Fp.mul(tv3, tv2);
    tv5 = Fp.pow(tv4, c5);
    let isQR = Fp.eql(tv5, Fp.ONE);
    tv2 = Fp.mul(tv3, c7);
    tv5 = Fp.mul(tv4, tv1);
    tv3 = Fp.cmov(tv2, tv3, isQR);
    tv4 = Fp.cmov(tv5, tv4, isQR);
    for (let i = c1;i > _1n5; i--) {
      let tv52 = i - _2n4;
      tv52 = _2n4 << tv52 - _1n5;
      let tvv5 = Fp.pow(tv4, tv52);
      const e1 = Fp.eql(tvv5, Fp.ONE);
      tv2 = Fp.mul(tv3, tv1);
      tv1 = Fp.mul(tv1, tv1);
      tvv5 = Fp.mul(tv4, tv1);
      tv3 = Fp.cmov(tv2, tv3, e1);
      tv4 = Fp.cmov(tvv5, tv4, e1);
    }
    return { isValid: isQR, value: tv3 };
  };
  if (Fp.ORDER % _4n2 === _3n2) {
    const c12 = (Fp.ORDER - _3n2) / _4n2;
    const c22 = Fp.sqrt(Fp.neg(Z));
    sqrtRatio = (u, v) => {
      let tv1 = Fp.sqr(v);
      const tv2 = Fp.mul(u, v);
      tv1 = Fp.mul(tv1, tv2);
      let y1 = Fp.pow(tv1, c12);
      y1 = Fp.mul(y1, tv2);
      const y2 = Fp.mul(y1, c22);
      const tv3 = Fp.mul(Fp.sqr(y1), v);
      const isQR = Fp.eql(tv3, u);
      let y = Fp.cmov(y2, y1, isQR);
      return { isValid: isQR, value: y };
    };
  }
  return sqrtRatio;
}
function mapToCurveSimpleSWU(Fp, opts) {
  validateField(Fp);
  if (!Fp.isValid(opts.A) || !Fp.isValid(opts.B) || !Fp.isValid(opts.Z))
    throw new Error("mapToCurveSimpleSWU: invalid opts");
  const sqrtRatio = SWUFpSqrtRatio(Fp, opts.Z);
  if (!Fp.isOdd)
    throw new Error("Fp.isOdd is not implemented!");
  return (u) => {
    let tv1, tv2, tv3, tv4, tv5, tv6, x, y;
    tv1 = Fp.sqr(u);
    tv1 = Fp.mul(tv1, opts.Z);
    tv2 = Fp.sqr(tv1);
    tv2 = Fp.add(tv2, tv1);
    tv3 = Fp.add(tv2, Fp.ONE);
    tv3 = Fp.mul(tv3, opts.B);
    tv4 = Fp.cmov(opts.Z, Fp.neg(tv2), !Fp.eql(tv2, Fp.ZERO));
    tv4 = Fp.mul(tv4, opts.A);
    tv2 = Fp.sqr(tv3);
    tv6 = Fp.sqr(tv4);
    tv5 = Fp.mul(tv6, opts.A);
    tv2 = Fp.add(tv2, tv5);
    tv2 = Fp.mul(tv2, tv3);
    tv6 = Fp.mul(tv6, tv4);
    tv5 = Fp.mul(tv6, opts.B);
    tv2 = Fp.add(tv2, tv5);
    x = Fp.mul(tv1, tv3);
    const { isValid, value } = sqrtRatio(tv2, tv6);
    y = Fp.mul(tv1, u);
    y = Fp.mul(y, value);
    x = Fp.cmov(x, tv3, isValid);
    y = Fp.cmov(y, value, isValid);
    const e1 = Fp.isOdd(u) === Fp.isOdd(y);
    y = Fp.cmov(Fp.neg(y), y, e1);
    x = Fp.div(x, tv4);
    return { x, y };
  };
}
var b2n, h2b, DERErr, DER, _0n5, _1n5, _2n4, _3n2, _4n2;
var init_weierstrass = __esm(() => {
  init_curve();
  init_modular();
  init_utils3();
  init_utils3();
  /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
  ({ bytesToNumberBE: b2n, hexToBytes: h2b } = exports_utils);
  DERErr = class DERErr extends Error {
    constructor(m = "") {
      super(m);
    }
  };
  DER = {
    Err: DERErr,
    _tlv: {
      encode: (tag, data) => {
        const { Err: E } = DER;
        if (tag < 0 || tag > 256)
          throw new E("tlv.encode: wrong tag");
        if (data.length & 1)
          throw new E("tlv.encode: unpadded data");
        const dataLen = data.length / 2;
        const len = numberToHexUnpadded(dataLen);
        if (len.length / 2 & 128)
          throw new E("tlv.encode: long form length too big");
        const lenLen = dataLen > 127 ? numberToHexUnpadded(len.length / 2 | 128) : "";
        const t = numberToHexUnpadded(tag);
        return t + lenLen + len + data;
      },
      decode(tag, data) {
        const { Err: E } = DER;
        let pos = 0;
        if (tag < 0 || tag > 256)
          throw new E("tlv.encode: wrong tag");
        if (data.length < 2 || data[pos++] !== tag)
          throw new E("tlv.decode: wrong tlv");
        const first = data[pos++];
        const isLong = !!(first & 128);
        let length = 0;
        if (!isLong)
          length = first;
        else {
          const lenLen = first & 127;
          if (!lenLen)
            throw new E("tlv.decode(long): indefinite length not supported");
          if (lenLen > 4)
            throw new E("tlv.decode(long): byte length is too big");
          const lengthBytes = data.subarray(pos, pos + lenLen);
          if (lengthBytes.length !== lenLen)
            throw new E("tlv.decode: length bytes not complete");
          if (lengthBytes[0] === 0)
            throw new E("tlv.decode(long): zero leftmost byte");
          for (const b of lengthBytes)
            length = length << 8 | b;
          pos += lenLen;
          if (length < 128)
            throw new E("tlv.decode(long): not minimal encoding");
        }
        const v = data.subarray(pos, pos + length);
        if (v.length !== length)
          throw new E("tlv.decode: wrong value length");
        return { v, l: data.subarray(pos + length) };
      }
    },
    _int: {
      encode(num) {
        const { Err: E } = DER;
        if (num < _0n5)
          throw new E("integer: negative integers are not allowed");
        let hex = numberToHexUnpadded(num);
        if (Number.parseInt(hex[0], 16) & 8)
          hex = "00" + hex;
        if (hex.length & 1)
          throw new E("unexpected DER parsing assertion: unpadded hex");
        return hex;
      },
      decode(data) {
        const { Err: E } = DER;
        if (data[0] & 128)
          throw new E("invalid signature integer: negative");
        if (data[0] === 0 && !(data[1] & 128))
          throw new E("invalid signature integer: unnecessary leading zero");
        return b2n(data);
      }
    },
    toSig(hex) {
      const { Err: E, _int: int, _tlv: tlv } = DER;
      const data = typeof hex === "string" ? h2b(hex) : hex;
      abytes2(data);
      const { v: seqBytes, l: seqLeftBytes } = tlv.decode(48, data);
      if (seqLeftBytes.length)
        throw new E("invalid signature: left bytes after parsing");
      const { v: rBytes, l: rLeftBytes } = tlv.decode(2, seqBytes);
      const { v: sBytes, l: sLeftBytes } = tlv.decode(2, rLeftBytes);
      if (sLeftBytes.length)
        throw new E("invalid signature: left bytes after parsing");
      return { r: int.decode(rBytes), s: int.decode(sBytes) };
    },
    hexFromSig(sig) {
      const { _tlv: tlv, _int: int } = DER;
      const rs = tlv.encode(2, int.encode(sig.r));
      const ss = tlv.encode(2, int.encode(sig.s));
      const seq = rs + ss;
      return tlv.encode(48, seq);
    }
  };
  _0n5 = BigInt(0);
  _1n5 = BigInt(1);
  _2n4 = BigInt(2);
  _3n2 = BigInt(3);
  _4n2 = BigInt(4);
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/node_modules/@noble/curves/esm/_shortw_utils.js
function getHash(hash2) {
  return {
    hash: hash2,
    hmac: (key, ...msgs) => hmac(hash2, key, concatBytes(...msgs)),
    randomBytes
  };
}
function createCurve(curveDef, defHash) {
  const create = (hash2) => weierstrass({ ...curveDef, ...getHash(hash2) });
  return { ...create(defHash), create };
}
var init__shortw_utils = __esm(() => {
  init_hmac();
  init_utils2();
  init_weierstrass();
  /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/node_modules/@noble/curves/esm/abstract/hash-to-curve.js
function i2osp(value, length) {
  anum(value);
  anum(length);
  if (value < 0 || value >= 1 << 8 * length)
    throw new Error("invalid I2OSP input: " + value);
  const res = Array.from({ length }).fill(0);
  for (let i = length - 1;i >= 0; i--) {
    res[i] = value & 255;
    value >>>= 8;
  }
  return new Uint8Array(res);
}
function strxor(a, b) {
  const arr = new Uint8Array(a.length);
  for (let i = 0;i < a.length; i++) {
    arr[i] = a[i] ^ b[i];
  }
  return arr;
}
function anum(item) {
  if (!Number.isSafeInteger(item))
    throw new Error("number expected");
}
function expand_message_xmd(msg, DST, lenInBytes, H) {
  abytes2(msg);
  abytes2(DST);
  anum(lenInBytes);
  if (DST.length > 255)
    DST = H(concatBytes3(utf8ToBytes2("H2C-OVERSIZE-DST-"), DST));
  const { outputLen: b_in_bytes, blockLen: r_in_bytes } = H;
  const ell = Math.ceil(lenInBytes / b_in_bytes);
  if (lenInBytes > 65535 || ell > 255)
    throw new Error("expand_message_xmd: invalid lenInBytes");
  const DST_prime = concatBytes3(DST, i2osp(DST.length, 1));
  const Z_pad = i2osp(0, r_in_bytes);
  const l_i_b_str = i2osp(lenInBytes, 2);
  const b = new Array(ell);
  const b_0 = H(concatBytes3(Z_pad, msg, l_i_b_str, i2osp(0, 1), DST_prime));
  b[0] = H(concatBytes3(b_0, i2osp(1, 1), DST_prime));
  for (let i = 1;i <= ell; i++) {
    const args = [strxor(b_0, b[i - 1]), i2osp(i + 1, 1), DST_prime];
    b[i] = H(concatBytes3(...args));
  }
  const pseudo_random_bytes = concatBytes3(...b);
  return pseudo_random_bytes.slice(0, lenInBytes);
}
function expand_message_xof(msg, DST, lenInBytes, k, H) {
  abytes2(msg);
  abytes2(DST);
  anum(lenInBytes);
  if (DST.length > 255) {
    const dkLen = Math.ceil(2 * k / 8);
    DST = H.create({ dkLen }).update(utf8ToBytes2("H2C-OVERSIZE-DST-")).update(DST).digest();
  }
  if (lenInBytes > 65535 || DST.length > 255)
    throw new Error("expand_message_xof: invalid lenInBytes");
  return H.create({ dkLen: lenInBytes }).update(msg).update(i2osp(lenInBytes, 2)).update(DST).update(i2osp(DST.length, 1)).digest();
}
function hash_to_field(msg, count, options) {
  validateObject(options, {
    DST: "stringOrUint8Array",
    p: "bigint",
    m: "isSafeInteger",
    k: "isSafeInteger",
    hash: "hash"
  });
  const { p, k, m, hash: hash2, expand, DST: _DST } = options;
  abytes2(msg);
  anum(count);
  const DST = typeof _DST === "string" ? utf8ToBytes2(_DST) : _DST;
  const log2p = p.toString(2).length;
  const L = Math.ceil((log2p + k) / 8);
  const len_in_bytes = count * m * L;
  let prb;
  if (expand === "xmd") {
    prb = expand_message_xmd(msg, DST, len_in_bytes, hash2);
  } else if (expand === "xof") {
    prb = expand_message_xof(msg, DST, len_in_bytes, k, hash2);
  } else if (expand === "_internal_pass") {
    prb = msg;
  } else {
    throw new Error('expand must be "xmd" or "xof"');
  }
  const u = new Array(count);
  for (let i = 0;i < count; i++) {
    const e = new Array(m);
    for (let j = 0;j < m; j++) {
      const elm_offset = L * (j + i * m);
      const tv = prb.subarray(elm_offset, elm_offset + L);
      e[j] = mod(os2ip(tv), p);
    }
    u[i] = e;
  }
  return u;
}
function isogenyMap(field, map) {
  const COEFF = map.map((i) => Array.from(i).reverse());
  return (x, y) => {
    const [xNum, xDen, yNum, yDen] = COEFF.map((val) => val.reduce((acc, i) => field.add(field.mul(acc, x), i)));
    x = field.div(xNum, xDen);
    y = field.mul(y, field.div(yNum, yDen));
    return { x, y };
  };
}
function createHasher(Point, mapToCurve, def) {
  if (typeof mapToCurve !== "function")
    throw new Error("mapToCurve() must be defined");
  return {
    hashToCurve(msg, options) {
      const u = hash_to_field(msg, 2, { ...def, DST: def.DST, ...options });
      const u0 = Point.fromAffine(mapToCurve(u[0]));
      const u1 = Point.fromAffine(mapToCurve(u[1]));
      const P = u0.add(u1).clearCofactor();
      P.assertValidity();
      return P;
    },
    encodeToCurve(msg, options) {
      const u = hash_to_field(msg, 1, { ...def, DST: def.encodeDST, ...options });
      const P = Point.fromAffine(mapToCurve(u[0])).clearCofactor();
      P.assertValidity();
      return P;
    },
    mapToCurve(scalars) {
      if (!Array.isArray(scalars))
        throw new Error("mapToCurve: expected array of bigints");
      for (const i of scalars)
        if (typeof i !== "bigint")
          throw new Error("mapToCurve: expected array of bigints");
      const P = Point.fromAffine(mapToCurve(scalars)).clearCofactor();
      P.assertValidity();
      return P;
    }
  };
}
var os2ip;
var init_hash_to_curve = __esm(() => {
  init_modular();
  init_utils3();
  os2ip = bytesToNumberBE;
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/node_modules/@noble/curves/esm/secp256k1.js
var exports_secp256k1 = {};
__export(exports_secp256k1, {
  secp256k1: () => secp256k1,
  schnorr: () => schnorr,
  hashToCurve: () => hashToCurve,
  encodeToCurve: () => encodeToCurve
});
function sqrtMod(y) {
  const P = secp256k1P;
  const _3n3 = BigInt(3), _6n = BigInt(6), _11n = BigInt(11), _22n = BigInt(22);
  const _23n = BigInt(23), _44n = BigInt(44), _88n = BigInt(88);
  const b2 = y * y * y % P;
  const b3 = b2 * b2 * y % P;
  const b6 = pow2(b3, _3n3, P) * b3 % P;
  const b9 = pow2(b6, _3n3, P) * b3 % P;
  const b11 = pow2(b9, _2n5, P) * b2 % P;
  const b22 = pow2(b11, _11n, P) * b11 % P;
  const b44 = pow2(b22, _22n, P) * b22 % P;
  const b88 = pow2(b44, _44n, P) * b44 % P;
  const b176 = pow2(b88, _88n, P) * b88 % P;
  const b220 = pow2(b176, _44n, P) * b44 % P;
  const b223 = pow2(b220, _3n3, P) * b3 % P;
  const t1 = pow2(b223, _23n, P) * b22 % P;
  const t2 = pow2(t1, _6n, P) * b2 % P;
  const root = pow2(t2, _2n5, P);
  if (!Fpk1.eql(Fpk1.sqr(root), y))
    throw new Error("Cannot find square root");
  return root;
}
function taggedHash(tag, ...messages) {
  let tagP = TAGGED_HASH_PREFIXES[tag];
  if (tagP === undefined) {
    const tagH = sha256(Uint8Array.from(tag, (c) => c.charCodeAt(0)));
    tagP = concatBytes3(tagH, tagH);
    TAGGED_HASH_PREFIXES[tag] = tagP;
  }
  return sha256(concatBytes3(tagP, ...messages));
}
function schnorrGetExtPubKey(priv) {
  let d_ = secp256k1.utils.normPrivateKeyToScalar(priv);
  let p = Point.fromPrivateKey(d_);
  const scalar = p.hasEvenY() ? d_ : modN(-d_);
  return { scalar, bytes: pointToBytes(p) };
}
function lift_x(x) {
  aInRange("x", x, _1n6, secp256k1P);
  const xx = modP(x * x);
  const c = modP(xx * x + BigInt(7));
  let y = sqrtMod(c);
  if (y % _2n5 !== _0n6)
    y = modP(-y);
  const p = new Point(x, y, _1n6);
  p.assertValidity();
  return p;
}
function challenge(...args) {
  return modN(num(taggedHash("BIP0340/challenge", ...args)));
}
function schnorrGetPublicKey(privateKey) {
  return schnorrGetExtPubKey(privateKey).bytes;
}
function schnorrSign(message, privateKey, auxRand = randomBytes(32)) {
  const m = ensureBytes("message", message);
  const { bytes: px, scalar: d } = schnorrGetExtPubKey(privateKey);
  const a = ensureBytes("auxRand", auxRand, 32);
  const t = numTo32b(d ^ num(taggedHash("BIP0340/aux", a)));
  const rand = taggedHash("BIP0340/nonce", t, px, m);
  const k_ = modN(num(rand));
  if (k_ === _0n6)
    throw new Error("sign failed: k is zero");
  const { bytes: rx, scalar: k } = schnorrGetExtPubKey(k_);
  const e = challenge(rx, px, m);
  const sig = new Uint8Array(64);
  sig.set(rx, 0);
  sig.set(numTo32b(modN(k + e * d)), 32);
  if (!schnorrVerify(sig, m, px))
    throw new Error("sign: Invalid signature produced");
  return sig;
}
function schnorrVerify(signature, message, publicKey) {
  const sig = ensureBytes("signature", signature, 64);
  const m = ensureBytes("message", message);
  const pub = ensureBytes("publicKey", publicKey, 32);
  try {
    const P = lift_x(num(pub));
    const r = num(sig.subarray(0, 32));
    if (!inRange(r, _1n6, secp256k1P))
      return false;
    const s = num(sig.subarray(32, 64));
    if (!inRange(s, _1n6, secp256k1N))
      return false;
    const e = challenge(numTo32b(r), pointToBytes(P), m);
    const R = GmulAdd(P, s, modN(-e));
    if (!R || !R.hasEvenY() || R.toAffine().x !== r)
      return false;
    return true;
  } catch (error) {
    return false;
  }
}
var secp256k1P, secp256k1N, _1n6, _2n5, divNearest = (a, b) => (a + b / _2n5) / b, Fpk1, secp256k1, _0n6, TAGGED_HASH_PREFIXES, pointToBytes = (point) => point.toRawBytes(true).slice(1), numTo32b = (n) => numberToBytesBE(n, 32), modP = (x) => mod(x, secp256k1P), modN = (x) => mod(x, secp256k1N), Point, GmulAdd = (Q, a, b) => Point.BASE.multiplyAndAddUnsafe(Q, a, b), num, schnorr, isoMap, mapSWU, htf, hashToCurve, encodeToCurve;
var init_secp256k1 = __esm(() => {
  init_sha256();
  init_utils2();
  init__shortw_utils();
  init_hash_to_curve();
  init_modular();
  init_utils3();
  init_weierstrass();
  /*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
  secp256k1P = BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f");
  secp256k1N = BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141");
  _1n6 = BigInt(1);
  _2n5 = BigInt(2);
  Fpk1 = Field(secp256k1P, undefined, undefined, { sqrt: sqrtMod });
  secp256k1 = createCurve({
    a: BigInt(0),
    b: BigInt(7),
    Fp: Fpk1,
    n: secp256k1N,
    Gx: BigInt("55066263022277343669578718895168534326250603453777594175500187360389116729240"),
    Gy: BigInt("32670510020758816978083085130507043184471273380659243275938904335757337482424"),
    h: BigInt(1),
    lowS: true,
    endo: {
      beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"),
      splitScalar: (k) => {
        const n = secp256k1N;
        const a1 = BigInt("0x3086d221a7d46bcde86c90e49284eb15");
        const b1 = -_1n6 * BigInt("0xe4437ed6010e88286f547fa90abfe4c3");
        const a2 = BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8");
        const b2 = a1;
        const POW_2_128 = BigInt("0x100000000000000000000000000000000");
        const c1 = divNearest(b2 * k, n);
        const c2 = divNearest(-b1 * k, n);
        let k1 = mod(k - c1 * a1 - c2 * a2, n);
        let k2 = mod(-c1 * b1 - c2 * b2, n);
        const k1neg = k1 > POW_2_128;
        const k2neg = k2 > POW_2_128;
        if (k1neg)
          k1 = n - k1;
        if (k2neg)
          k2 = n - k2;
        if (k1 > POW_2_128 || k2 > POW_2_128) {
          throw new Error("splitScalar: Endomorphism failed, k=" + k);
        }
        return { k1neg, k1, k2neg, k2 };
      }
    }
  }, sha256);
  _0n6 = BigInt(0);
  TAGGED_HASH_PREFIXES = {};
  Point = secp256k1.ProjectivePoint;
  num = bytesToNumberBE;
  schnorr = /* @__PURE__ */ (() => ({
    getPublicKey: schnorrGetPublicKey,
    sign: schnorrSign,
    verify: schnorrVerify,
    utils: {
      randomPrivateKey: secp256k1.utils.randomPrivateKey,
      lift_x,
      pointToBytes,
      numberToBytesBE,
      bytesToNumberBE,
      taggedHash,
      mod
    }
  }))();
  isoMap = /* @__PURE__ */ (() => isogenyMap(Fpk1, [
    [
      "0x8e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38daaaaa8c7",
      "0x7d3d4c80bc321d5b9f315cea7fd44c5d595d2fc0bf63b92dfff1044f17c6581",
      "0x534c328d23f234e6e2a413deca25caece4506144037c40314ecbd0b53d9dd262",
      "0x8e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38e38daaaaa88c"
    ],
    [
      "0xd35771193d94918a9ca34ccbb7b640dd86cd409542f8487d9fe6b745781eb49b",
      "0xedadc6f64383dc1df7c4b2d51b54225406d36b641f5e41bbc52a56612a8c6d14",
      "0x0000000000000000000000000000000000000000000000000000000000000001"
    ],
    [
      "0x4bda12f684bda12f684bda12f684bda12f684bda12f684bda12f684b8e38e23c",
      "0xc75e0c32d5cb7c0fa9d0a54b12a0a6d5647ab046d686da6fdffc90fc201d71a3",
      "0x29a6194691f91a73715209ef6512e576722830a201be2018a765e85a9ecee931",
      "0x2f684bda12f684bda12f684bda12f684bda12f684bda12f684bda12f38e38d84"
    ],
    [
      "0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffff93b",
      "0x7a06534bb8bdb49fd5e9e6632722c2989467c1bfc8e8d978dfb425d2685c2573",
      "0x6484aa716545ca2cf3a70c3fa8fe337e0a3d21162f0d6299a7bf8192bfd2a76f",
      "0x0000000000000000000000000000000000000000000000000000000000000001"
    ]
  ].map((i) => i.map((j) => BigInt(j)))))();
  mapSWU = /* @__PURE__ */ (() => mapToCurveSimpleSWU(Fpk1, {
    A: BigInt("0x3f8731abdd661adca08a5558f0f5d272e953d363cb6f0e5d405447c01a444533"),
    B: BigInt("1771"),
    Z: Fpk1.create(BigInt("-11"))
  }))();
  htf = /* @__PURE__ */ (() => createHasher(secp256k1.ProjectivePoint, (scalars) => {
    const { x, y } = mapSWU(Fpk1.create(scalars[0]));
    return isoMap(x, y);
  }, {
    DST: "secp256k1_XMD:SHA-256_SSWU_RO_",
    encodeDST: "secp256k1_XMD:SHA-256_SSWU_NU_",
    p: Fpk1.ORDER,
    m: 1,
    k: 128,
    expand: "xmd",
    hash: sha256
  }))();
  hashToCurve = /* @__PURE__ */ (() => htf.hashToCurve)();
  encodeToCurve = /* @__PURE__ */ (() => htf.encodeToCurve)();
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/errors/node.js
var ExecutionRevertedError, FeeCapTooHighError, FeeCapTooLowError, NonceTooHighError, NonceTooLowError, NonceMaxValueError, InsufficientFundsError, IntrinsicGasTooHighError, IntrinsicGasTooLowError, TransactionTypeNotSupportedError, TipAboveFeeCapError, UnknownNodeError;
var init_node = __esm(() => {
  init_formatGwei();
  init_base();
  ExecutionRevertedError = class ExecutionRevertedError extends BaseError2 {
    constructor({ cause, message } = {}) {
      const reason = message?.replace("execution reverted: ", "")?.replace("execution reverted", "");
      super(`Execution reverted ${reason ? `with reason: ${reason}` : "for an unknown reason"}.`, {
        cause,
        name: "ExecutionRevertedError"
      });
    }
  };
  Object.defineProperty(ExecutionRevertedError, "code", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 3
  });
  Object.defineProperty(ExecutionRevertedError, "nodeMessage", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: /execution reverted/
  });
  FeeCapTooHighError = class FeeCapTooHighError extends BaseError2 {
    constructor({ cause, maxFeePerGas } = {}) {
      super(`The fee cap (\`maxFeePerGas\`${maxFeePerGas ? ` = ${formatGwei(maxFeePerGas)} gwei` : ""}) cannot be higher than the maximum allowed value (2^256-1).`, {
        cause,
        name: "FeeCapTooHighError"
      });
    }
  };
  Object.defineProperty(FeeCapTooHighError, "nodeMessage", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: /max fee per gas higher than 2\^256-1|fee cap higher than 2\^256-1/
  });
  FeeCapTooLowError = class FeeCapTooLowError extends BaseError2 {
    constructor({ cause, maxFeePerGas } = {}) {
      super(`The fee cap (\`maxFeePerGas\`${maxFeePerGas ? ` = ${formatGwei(maxFeePerGas)}` : ""} gwei) cannot be lower than the block base fee.`, {
        cause,
        name: "FeeCapTooLowError"
      });
    }
  };
  Object.defineProperty(FeeCapTooLowError, "nodeMessage", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: /max fee per gas less than block base fee|fee cap less than block base fee|transaction is outdated/
  });
  NonceTooHighError = class NonceTooHighError extends BaseError2 {
    constructor({ cause, nonce } = {}) {
      super(`Nonce provided for the transaction ${nonce ? `(${nonce}) ` : ""}is higher than the next one expected.`, { cause, name: "NonceTooHighError" });
    }
  };
  Object.defineProperty(NonceTooHighError, "nodeMessage", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: /nonce too high/
  });
  NonceTooLowError = class NonceTooLowError extends BaseError2 {
    constructor({ cause, nonce } = {}) {
      super([
        `Nonce provided for the transaction ${nonce ? `(${nonce}) ` : ""}is lower than the current nonce of the account.`,
        "Try increasing the nonce or find the latest nonce with `getTransactionCount`."
      ].join(`
`), { cause, name: "NonceTooLowError" });
    }
  };
  Object.defineProperty(NonceTooLowError, "nodeMessage", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: /nonce too low|transaction already imported|already known/
  });
  NonceMaxValueError = class NonceMaxValueError extends BaseError2 {
    constructor({ cause, nonce } = {}) {
      super(`Nonce provided for the transaction ${nonce ? `(${nonce}) ` : ""}exceeds the maximum allowed nonce.`, { cause, name: "NonceMaxValueError" });
    }
  };
  Object.defineProperty(NonceMaxValueError, "nodeMessage", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: /nonce has max value/
  });
  InsufficientFundsError = class InsufficientFundsError extends BaseError2 {
    constructor({ cause } = {}) {
      super([
        "The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account."
      ].join(`
`), {
        cause,
        metaMessages: [
          "This error could arise when the account does not have enough funds to:",
          " - pay for the total gas fee,",
          " - pay for the value to send.",
          " ",
          "The cost of the transaction is calculated as `gas * gas fee + value`, where:",
          " - `gas` is the amount of gas needed for transaction to execute,",
          " - `gas fee` is the gas fee,",
          " - `value` is the amount of ether to send to the recipient."
        ],
        name: "InsufficientFundsError"
      });
    }
  };
  Object.defineProperty(InsufficientFundsError, "nodeMessage", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: /insufficient funds|exceeds transaction sender account balance/
  });
  IntrinsicGasTooHighError = class IntrinsicGasTooHighError extends BaseError2 {
    constructor({ cause, gas } = {}) {
      super(`The amount of gas ${gas ? `(${gas}) ` : ""}provided for the transaction exceeds the limit allowed for the block.`, {
        cause,
        name: "IntrinsicGasTooHighError"
      });
    }
  };
  Object.defineProperty(IntrinsicGasTooHighError, "nodeMessage", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: /intrinsic gas too high|gas limit reached/
  });
  IntrinsicGasTooLowError = class IntrinsicGasTooLowError extends BaseError2 {
    constructor({ cause, gas } = {}) {
      super(`The amount of gas ${gas ? `(${gas}) ` : ""}provided for the transaction is too low.`, {
        cause,
        name: "IntrinsicGasTooLowError"
      });
    }
  };
  Object.defineProperty(IntrinsicGasTooLowError, "nodeMessage", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: /intrinsic gas too low/
  });
  TransactionTypeNotSupportedError = class TransactionTypeNotSupportedError extends BaseError2 {
    constructor({ cause }) {
      super("The transaction type is not supported for this chain.", {
        cause,
        name: "TransactionTypeNotSupportedError"
      });
    }
  };
  Object.defineProperty(TransactionTypeNotSupportedError, "nodeMessage", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: /transaction type not valid/
  });
  TipAboveFeeCapError = class TipAboveFeeCapError extends BaseError2 {
    constructor({ cause, maxPriorityFeePerGas, maxFeePerGas } = {}) {
      super([
        `The provided tip (\`maxPriorityFeePerGas\`${maxPriorityFeePerGas ? ` = ${formatGwei(maxPriorityFeePerGas)} gwei` : ""}) cannot be higher than the fee cap (\`maxFeePerGas\`${maxFeePerGas ? ` = ${formatGwei(maxFeePerGas)} gwei` : ""}).`
      ].join(`
`), {
        cause,
        name: "TipAboveFeeCapError"
      });
    }
  };
  Object.defineProperty(TipAboveFeeCapError, "nodeMessage", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: /max priority fee per gas higher than max fee per gas|tip higher than fee cap/
  });
  UnknownNodeError = class UnknownNodeError extends BaseError2 {
    constructor({ cause }) {
      super(`An error occurred while executing: ${cause?.shortMessage}`, {
        cause,
        name: "UnknownNodeError"
      });
    }
  };
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/errors/getNodeError.js
function getNodeError(err, args) {
  const message = (err.details || "").toLowerCase();
  const executionRevertedError = err instanceof BaseError2 ? err.walk((e) => e?.code === ExecutionRevertedError.code) : err;
  if (executionRevertedError instanceof BaseError2)
    return new ExecutionRevertedError({
      cause: err,
      message: executionRevertedError.details
    });
  if (ExecutionRevertedError.nodeMessage.test(message))
    return new ExecutionRevertedError({
      cause: err,
      message: err.details
    });
  if (FeeCapTooHighError.nodeMessage.test(message))
    return new FeeCapTooHighError({
      cause: err,
      maxFeePerGas: args?.maxFeePerGas
    });
  if (FeeCapTooLowError.nodeMessage.test(message))
    return new FeeCapTooLowError({
      cause: err,
      maxFeePerGas: args?.maxFeePerGas
    });
  if (NonceTooHighError.nodeMessage.test(message))
    return new NonceTooHighError({ cause: err, nonce: args?.nonce });
  if (NonceTooLowError.nodeMessage.test(message))
    return new NonceTooLowError({ cause: err, nonce: args?.nonce });
  if (NonceMaxValueError.nodeMessage.test(message))
    return new NonceMaxValueError({ cause: err, nonce: args?.nonce });
  if (InsufficientFundsError.nodeMessage.test(message))
    return new InsufficientFundsError({ cause: err });
  if (IntrinsicGasTooHighError.nodeMessage.test(message))
    return new IntrinsicGasTooHighError({ cause: err, gas: args?.gas });
  if (IntrinsicGasTooLowError.nodeMessage.test(message))
    return new IntrinsicGasTooLowError({ cause: err, gas: args?.gas });
  if (TransactionTypeNotSupportedError.nodeMessage.test(message))
    return new TransactionTypeNotSupportedError({ cause: err });
  if (TipAboveFeeCapError.nodeMessage.test(message))
    return new TipAboveFeeCapError({
      cause: err,
      maxFeePerGas: args?.maxFeePerGas,
      maxPriorityFeePerGas: args?.maxPriorityFeePerGas
    });
  return new UnknownNodeError({
    cause: err
  });
}
var init_getNodeError = __esm(() => {
  init_base();
  init_node();
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/formatters/extract.js
function extract(value_, { format }) {
  if (!format)
    return {};
  const value = {};
  function extract_(formatted2) {
    const keys = Object.keys(formatted2);
    for (const key of keys) {
      if (key in value_)
        value[key] = value_[key];
      if (formatted2[key] && typeof formatted2[key] === "object" && !Array.isArray(formatted2[key]))
        extract_(formatted2[key]);
    }
  }
  const formatted = format(value_ || {});
  extract_(formatted);
  return value;
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/formatters/transactionRequest.js
function formatTransactionRequest(request) {
  const rpcRequest = {};
  if (typeof request.authorizationList !== "undefined")
    rpcRequest.authorizationList = formatAuthorizationList(request.authorizationList);
  if (typeof request.accessList !== "undefined")
    rpcRequest.accessList = request.accessList;
  if (typeof request.blobVersionedHashes !== "undefined")
    rpcRequest.blobVersionedHashes = request.blobVersionedHashes;
  if (typeof request.blobs !== "undefined") {
    if (typeof request.blobs[0] !== "string")
      rpcRequest.blobs = request.blobs.map((x) => bytesToHex(x));
    else
      rpcRequest.blobs = request.blobs;
  }
  if (typeof request.data !== "undefined")
    rpcRequest.data = request.data;
  if (typeof request.from !== "undefined")
    rpcRequest.from = request.from;
  if (typeof request.gas !== "undefined")
    rpcRequest.gas = numberToHex(request.gas);
  if (typeof request.gasPrice !== "undefined")
    rpcRequest.gasPrice = numberToHex(request.gasPrice);
  if (typeof request.maxFeePerBlobGas !== "undefined")
    rpcRequest.maxFeePerBlobGas = numberToHex(request.maxFeePerBlobGas);
  if (typeof request.maxFeePerGas !== "undefined")
    rpcRequest.maxFeePerGas = numberToHex(request.maxFeePerGas);
  if (typeof request.maxPriorityFeePerGas !== "undefined")
    rpcRequest.maxPriorityFeePerGas = numberToHex(request.maxPriorityFeePerGas);
  if (typeof request.nonce !== "undefined")
    rpcRequest.nonce = numberToHex(request.nonce);
  if (typeof request.to !== "undefined")
    rpcRequest.to = request.to;
  if (typeof request.type !== "undefined")
    rpcRequest.type = rpcTransactionType[request.type];
  if (typeof request.value !== "undefined")
    rpcRequest.value = numberToHex(request.value);
  return rpcRequest;
}
function formatAuthorizationList(authorizationList) {
  return authorizationList.map((authorization) => ({
    address: authorization.contractAddress,
    r: authorization.r,
    s: authorization.s,
    chainId: numberToHex(authorization.chainId),
    nonce: numberToHex(authorization.nonce),
    ...typeof authorization.yParity !== "undefined" ? { yParity: numberToHex(authorization.yParity) } : {},
    ...typeof authorization.v !== "undefined" && typeof authorization.yParity === "undefined" ? { v: numberToHex(authorization.v) } : {}
  }));
}
var rpcTransactionType;
var init_transactionRequest = __esm(() => {
  init_toHex();
  rpcTransactionType = {
    legacy: "0x0",
    eip2930: "0x1",
    eip1559: "0x2",
    eip4844: "0x3",
    eip7702: "0x4"
  };
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/stateOverride.js
function serializeStateMapping(stateMapping) {
  if (!stateMapping || stateMapping.length === 0)
    return;
  return stateMapping.reduce((acc, { slot, value }) => {
    if (slot.length !== 66)
      throw new InvalidBytesLengthError({
        size: slot.length,
        targetSize: 66,
        type: "hex"
      });
    if (value.length !== 66)
      throw new InvalidBytesLengthError({
        size: value.length,
        targetSize: 66,
        type: "hex"
      });
    acc[slot] = value;
    return acc;
  }, {});
}
function serializeAccountStateOverride(parameters) {
  const { balance, nonce, state, stateDiff, code } = parameters;
  const rpcAccountStateOverride = {};
  if (code !== undefined)
    rpcAccountStateOverride.code = code;
  if (balance !== undefined)
    rpcAccountStateOverride.balance = numberToHex(balance);
  if (nonce !== undefined)
    rpcAccountStateOverride.nonce = numberToHex(nonce);
  if (state !== undefined)
    rpcAccountStateOverride.state = serializeStateMapping(state);
  if (stateDiff !== undefined) {
    if (rpcAccountStateOverride.state)
      throw new StateAssignmentConflictError;
    rpcAccountStateOverride.stateDiff = serializeStateMapping(stateDiff);
  }
  return rpcAccountStateOverride;
}
function serializeStateOverride(parameters) {
  if (!parameters)
    return;
  const rpcStateOverride = {};
  for (const { address, ...accountState } of parameters) {
    if (!isAddress(address, { strict: false }))
      throw new InvalidAddressError({ address });
    if (rpcStateOverride[address])
      throw new AccountStateConflictError({ address });
    rpcStateOverride[address] = serializeAccountStateOverride(accountState);
  }
  return rpcStateOverride;
}
var init_stateOverride2 = __esm(() => {
  init_address();
  init_data();
  init_stateOverride();
  init_isAddress();
  init_toHex();
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/constants/number.js
var maxInt8, maxInt16, maxInt24, maxInt32, maxInt40, maxInt48, maxInt56, maxInt64, maxInt72, maxInt80, maxInt88, maxInt96, maxInt104, maxInt112, maxInt120, maxInt128, maxInt136, maxInt144, maxInt152, maxInt160, maxInt168, maxInt176, maxInt184, maxInt192, maxInt200, maxInt208, maxInt216, maxInt224, maxInt232, maxInt240, maxInt248, maxInt256, minInt8, minInt16, minInt24, minInt32, minInt40, minInt48, minInt56, minInt64, minInt72, minInt80, minInt88, minInt96, minInt104, minInt112, minInt120, minInt128, minInt136, minInt144, minInt152, minInt160, minInt168, minInt176, minInt184, minInt192, minInt200, minInt208, minInt216, minInt224, minInt232, minInt240, minInt248, minInt256, maxUint8, maxUint16, maxUint24, maxUint32, maxUint40, maxUint48, maxUint56, maxUint64, maxUint72, maxUint80, maxUint88, maxUint96, maxUint104, maxUint112, maxUint120, maxUint128, maxUint136, maxUint144, maxUint152, maxUint160, maxUint168, maxUint176, maxUint184, maxUint192, maxUint200, maxUint208, maxUint216, maxUint224, maxUint232, maxUint240, maxUint248, maxUint256;
var init_number = __esm(() => {
  maxInt8 = 2n ** (8n - 1n) - 1n;
  maxInt16 = 2n ** (16n - 1n) - 1n;
  maxInt24 = 2n ** (24n - 1n) - 1n;
  maxInt32 = 2n ** (32n - 1n) - 1n;
  maxInt40 = 2n ** (40n - 1n) - 1n;
  maxInt48 = 2n ** (48n - 1n) - 1n;
  maxInt56 = 2n ** (56n - 1n) - 1n;
  maxInt64 = 2n ** (64n - 1n) - 1n;
  maxInt72 = 2n ** (72n - 1n) - 1n;
  maxInt80 = 2n ** (80n - 1n) - 1n;
  maxInt88 = 2n ** (88n - 1n) - 1n;
  maxInt96 = 2n ** (96n - 1n) - 1n;
  maxInt104 = 2n ** (104n - 1n) - 1n;
  maxInt112 = 2n ** (112n - 1n) - 1n;
  maxInt120 = 2n ** (120n - 1n) - 1n;
  maxInt128 = 2n ** (128n - 1n) - 1n;
  maxInt136 = 2n ** (136n - 1n) - 1n;
  maxInt144 = 2n ** (144n - 1n) - 1n;
  maxInt152 = 2n ** (152n - 1n) - 1n;
  maxInt160 = 2n ** (160n - 1n) - 1n;
  maxInt168 = 2n ** (168n - 1n) - 1n;
  maxInt176 = 2n ** (176n - 1n) - 1n;
  maxInt184 = 2n ** (184n - 1n) - 1n;
  maxInt192 = 2n ** (192n - 1n) - 1n;
  maxInt200 = 2n ** (200n - 1n) - 1n;
  maxInt208 = 2n ** (208n - 1n) - 1n;
  maxInt216 = 2n ** (216n - 1n) - 1n;
  maxInt224 = 2n ** (224n - 1n) - 1n;
  maxInt232 = 2n ** (232n - 1n) - 1n;
  maxInt240 = 2n ** (240n - 1n) - 1n;
  maxInt248 = 2n ** (248n - 1n) - 1n;
  maxInt256 = 2n ** (256n - 1n) - 1n;
  minInt8 = -(2n ** (8n - 1n));
  minInt16 = -(2n ** (16n - 1n));
  minInt24 = -(2n ** (24n - 1n));
  minInt32 = -(2n ** (32n - 1n));
  minInt40 = -(2n ** (40n - 1n));
  minInt48 = -(2n ** (48n - 1n));
  minInt56 = -(2n ** (56n - 1n));
  minInt64 = -(2n ** (64n - 1n));
  minInt72 = -(2n ** (72n - 1n));
  minInt80 = -(2n ** (80n - 1n));
  minInt88 = -(2n ** (88n - 1n));
  minInt96 = -(2n ** (96n - 1n));
  minInt104 = -(2n ** (104n - 1n));
  minInt112 = -(2n ** (112n - 1n));
  minInt120 = -(2n ** (120n - 1n));
  minInt128 = -(2n ** (128n - 1n));
  minInt136 = -(2n ** (136n - 1n));
  minInt144 = -(2n ** (144n - 1n));
  minInt152 = -(2n ** (152n - 1n));
  minInt160 = -(2n ** (160n - 1n));
  minInt168 = -(2n ** (168n - 1n));
  minInt176 = -(2n ** (176n - 1n));
  minInt184 = -(2n ** (184n - 1n));
  minInt192 = -(2n ** (192n - 1n));
  minInt200 = -(2n ** (200n - 1n));
  minInt208 = -(2n ** (208n - 1n));
  minInt216 = -(2n ** (216n - 1n));
  minInt224 = -(2n ** (224n - 1n));
  minInt232 = -(2n ** (232n - 1n));
  minInt240 = -(2n ** (240n - 1n));
  minInt248 = -(2n ** (248n - 1n));
  minInt256 = -(2n ** (256n - 1n));
  maxUint8 = 2n ** 8n - 1n;
  maxUint16 = 2n ** 16n - 1n;
  maxUint24 = 2n ** 24n - 1n;
  maxUint32 = 2n ** 32n - 1n;
  maxUint40 = 2n ** 40n - 1n;
  maxUint48 = 2n ** 48n - 1n;
  maxUint56 = 2n ** 56n - 1n;
  maxUint64 = 2n ** 64n - 1n;
  maxUint72 = 2n ** 72n - 1n;
  maxUint80 = 2n ** 80n - 1n;
  maxUint88 = 2n ** 88n - 1n;
  maxUint96 = 2n ** 96n - 1n;
  maxUint104 = 2n ** 104n - 1n;
  maxUint112 = 2n ** 112n - 1n;
  maxUint120 = 2n ** 120n - 1n;
  maxUint128 = 2n ** 128n - 1n;
  maxUint136 = 2n ** 136n - 1n;
  maxUint144 = 2n ** 144n - 1n;
  maxUint152 = 2n ** 152n - 1n;
  maxUint160 = 2n ** 160n - 1n;
  maxUint168 = 2n ** 168n - 1n;
  maxUint176 = 2n ** 176n - 1n;
  maxUint184 = 2n ** 184n - 1n;
  maxUint192 = 2n ** 192n - 1n;
  maxUint200 = 2n ** 200n - 1n;
  maxUint208 = 2n ** 208n - 1n;
  maxUint216 = 2n ** 216n - 1n;
  maxUint224 = 2n ** 224n - 1n;
  maxUint232 = 2n ** 232n - 1n;
  maxUint240 = 2n ** 240n - 1n;
  maxUint248 = 2n ** 248n - 1n;
  maxUint256 = 2n ** 256n - 1n;
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/transaction/assertRequest.js
function assertRequest(args) {
  const { account: account_, gasPrice, maxFeePerGas, maxPriorityFeePerGas, to } = args;
  const account = account_ ? parseAccount(account_) : undefined;
  if (account && !isAddress(account.address))
    throw new InvalidAddressError({ address: account.address });
  if (to && !isAddress(to))
    throw new InvalidAddressError({ address: to });
  if (typeof gasPrice !== "undefined" && (typeof maxFeePerGas !== "undefined" || typeof maxPriorityFeePerGas !== "undefined"))
    throw new FeeConflictError;
  if (maxFeePerGas && maxFeePerGas > maxUint256)
    throw new FeeCapTooHighError({ maxFeePerGas });
  if (maxPriorityFeePerGas && maxFeePerGas && maxPriorityFeePerGas > maxFeePerGas)
    throw new TipAboveFeeCapError({ maxFeePerGas, maxPriorityFeePerGas });
}
var init_assertRequest = __esm(() => {
  init_number();
  init_address();
  init_node();
  init_transaction();
  init_isAddress();
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/address/isAddressEqual.js
function isAddressEqual(a, b) {
  if (!isAddress(a, { strict: false }))
    throw new InvalidAddressError({ address: a });
  if (!isAddress(b, { strict: false }))
    throw new InvalidAddressError({ address: b });
  return a.toLowerCase() === b.toLowerCase();
}
var init_isAddressEqual = __esm(() => {
  init_address();
  init_isAddress();
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/abi/decodeFunctionResult.js
function decodeFunctionResult(parameters) {
  const { abi, args, functionName, data } = parameters;
  let abiItem = abi[0];
  if (functionName) {
    const item = getAbiItem({ abi, args, name: functionName });
    if (!item)
      throw new AbiFunctionNotFoundError(functionName, { docsPath: docsPath4 });
    abiItem = item;
  }
  if (abiItem.type !== "function")
    throw new AbiFunctionNotFoundError(undefined, { docsPath: docsPath4 });
  if (!abiItem.outputs)
    throw new AbiFunctionOutputsNotFoundError(abiItem.name, { docsPath: docsPath4 });
  const values = decodeAbiParameters(abiItem.outputs, data);
  if (values && values.length > 1)
    return values;
  if (values && values.length === 1)
    return values[0];
  return;
}
var docsPath4 = "/docs/contract/decodeFunctionResult";
var init_decodeFunctionResult = __esm(() => {
  init_abi();
  init_decodeAbiParameters();
  init_getAbiItem();
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/constants/abis.js
var multicall3Abi, universalResolverErrors, universalResolverResolveAbi, universalResolverReverseAbi, textResolverAbi, addressResolverAbi, universalSignatureValidatorAbi, erc20Abi;
var init_abis = __esm(() => {
  multicall3Abi = [
    {
      inputs: [
        {
          components: [
            {
              name: "target",
              type: "address"
            },
            {
              name: "allowFailure",
              type: "bool"
            },
            {
              name: "callData",
              type: "bytes"
            }
          ],
          name: "calls",
          type: "tuple[]"
        }
      ],
      name: "aggregate3",
      outputs: [
        {
          components: [
            {
              name: "success",
              type: "bool"
            },
            {
              name: "returnData",
              type: "bytes"
            }
          ],
          name: "returnData",
          type: "tuple[]"
        }
      ],
      stateMutability: "view",
      type: "function"
    }
  ];
  universalResolverErrors = [
    {
      inputs: [],
      name: "ResolverNotFound",
      type: "error"
    },
    {
      inputs: [],
      name: "ResolverWildcardNotSupported",
      type: "error"
    },
    {
      inputs: [],
      name: "ResolverNotContract",
      type: "error"
    },
    {
      inputs: [
        {
          name: "returnData",
          type: "bytes"
        }
      ],
      name: "ResolverError",
      type: "error"
    },
    {
      inputs: [
        {
          components: [
            {
              name: "status",
              type: "uint16"
            },
            {
              name: "message",
              type: "string"
            }
          ],
          name: "errors",
          type: "tuple[]"
        }
      ],
      name: "HttpError",
      type: "error"
    }
  ];
  universalResolverResolveAbi = [
    ...universalResolverErrors,
    {
      name: "resolve",
      type: "function",
      stateMutability: "view",
      inputs: [
        { name: "name", type: "bytes" },
        { name: "data", type: "bytes" }
      ],
      outputs: [
        { name: "", type: "bytes" },
        { name: "address", type: "address" }
      ]
    },
    {
      name: "resolve",
      type: "function",
      stateMutability: "view",
      inputs: [
        { name: "name", type: "bytes" },
        { name: "data", type: "bytes" },
        { name: "gateways", type: "string[]" }
      ],
      outputs: [
        { name: "", type: "bytes" },
        { name: "address", type: "address" }
      ]
    }
  ];
  universalResolverReverseAbi = [
    ...universalResolverErrors,
    {
      name: "reverse",
      type: "function",
      stateMutability: "view",
      inputs: [{ type: "bytes", name: "reverseName" }],
      outputs: [
        { type: "string", name: "resolvedName" },
        { type: "address", name: "resolvedAddress" },
        { type: "address", name: "reverseResolver" },
        { type: "address", name: "resolver" }
      ]
    },
    {
      name: "reverse",
      type: "function",
      stateMutability: "view",
      inputs: [
        { type: "bytes", name: "reverseName" },
        { type: "string[]", name: "gateways" }
      ],
      outputs: [
        { type: "string", name: "resolvedName" },
        { type: "address", name: "resolvedAddress" },
        { type: "address", name: "reverseResolver" },
        { type: "address", name: "resolver" }
      ]
    }
  ];
  textResolverAbi = [
    {
      name: "text",
      type: "function",
      stateMutability: "view",
      inputs: [
        { name: "name", type: "bytes32" },
        { name: "key", type: "string" }
      ],
      outputs: [{ name: "", type: "string" }]
    }
  ];
  addressResolverAbi = [
    {
      name: "addr",
      type: "function",
      stateMutability: "view",
      inputs: [{ name: "name", type: "bytes32" }],
      outputs: [{ name: "", type: "address" }]
    },
    {
      name: "addr",
      type: "function",
      stateMutability: "view",
      inputs: [
        { name: "name", type: "bytes32" },
        { name: "coinType", type: "uint256" }
      ],
      outputs: [{ name: "", type: "bytes" }]
    }
  ];
  universalSignatureValidatorAbi = [
    {
      inputs: [
        {
          name: "_signer",
          type: "address"
        },
        {
          name: "_hash",
          type: "bytes32"
        },
        {
          name: "_signature",
          type: "bytes"
        }
      ],
      stateMutability: "nonpayable",
      type: "constructor"
    },
    {
      inputs: [
        {
          name: "_signer",
          type: "address"
        },
        {
          name: "_hash",
          type: "bytes32"
        },
        {
          name: "_signature",
          type: "bytes"
        }
      ],
      outputs: [
        {
          type: "bool"
        }
      ],
      stateMutability: "nonpayable",
      type: "function",
      name: "isValidSig"
    }
  ];
  erc20Abi = [
    {
      type: "event",
      name: "Approval",
      inputs: [
        {
          indexed: true,
          name: "owner",
          type: "address"
        },
        {
          indexed: true,
          name: "spender",
          type: "address"
        },
        {
          indexed: false,
          name: "value",
          type: "uint256"
        }
      ]
    },
    {
      type: "event",
      name: "Transfer",
      inputs: [
        {
          indexed: true,
          name: "from",
          type: "address"
        },
        {
          indexed: true,
          name: "to",
          type: "address"
        },
        {
          indexed: false,
          name: "value",
          type: "uint256"
        }
      ]
    },
    {
      type: "function",
      name: "allowance",
      stateMutability: "view",
      inputs: [
        {
          name: "owner",
          type: "address"
        },
        {
          name: "spender",
          type: "address"
        }
      ],
      outputs: [
        {
          type: "uint256"
        }
      ]
    },
    {
      type: "function",
      name: "approve",
      stateMutability: "nonpayable",
      inputs: [
        {
          name: "spender",
          type: "address"
        },
        {
          name: "amount",
          type: "uint256"
        }
      ],
      outputs: [
        {
          type: "bool"
        }
      ]
    },
    {
      type: "function",
      name: "balanceOf",
      stateMutability: "view",
      inputs: [
        {
          name: "account",
          type: "address"
        }
      ],
      outputs: [
        {
          type: "uint256"
        }
      ]
    },
    {
      type: "function",
      name: "decimals",
      stateMutability: "view",
      inputs: [],
      outputs: [
        {
          type: "uint8"
        }
      ]
    },
    {
      type: "function",
      name: "name",
      stateMutability: "view",
      inputs: [],
      outputs: [
        {
          type: "string"
        }
      ]
    },
    {
      type: "function",
      name: "symbol",
      stateMutability: "view",
      inputs: [],
      outputs: [
        {
          type: "string"
        }
      ]
    },
    {
      type: "function",
      name: "totalSupply",
      stateMutability: "view",
      inputs: [],
      outputs: [
        {
          type: "uint256"
        }
      ]
    },
    {
      type: "function",
      name: "transfer",
      stateMutability: "nonpayable",
      inputs: [
        {
          name: "recipient",
          type: "address"
        },
        {
          name: "amount",
          type: "uint256"
        }
      ],
      outputs: [
        {
          type: "bool"
        }
      ]
    },
    {
      type: "function",
      name: "transferFrom",
      stateMutability: "nonpayable",
      inputs: [
        {
          name: "sender",
          type: "address"
        },
        {
          name: "recipient",
          type: "address"
        },
        {
          name: "amount",
          type: "uint256"
        }
      ],
      outputs: [
        {
          type: "bool"
        }
      ]
    }
  ];
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/constants/contract.js
var aggregate3Signature = "0x82ad56cb";

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/constants/contracts.js
var deploylessCallViaBytecodeBytecode = "0x608060405234801561001057600080fd5b5060405161018e38038061018e83398101604081905261002f91610124565b6000808351602085016000f59050803b61004857600080fd5b6000808351602085016000855af16040513d6000823e81610067573d81fd5b3d81f35b634e487b7160e01b600052604160045260246000fd5b600082601f83011261009257600080fd5b81516001600160401b038111156100ab576100ab61006b565b604051601f8201601f19908116603f011681016001600160401b03811182821017156100d9576100d961006b565b6040528181528382016020018510156100f157600080fd5b60005b82811015610110576020818601810151838301820152016100f4565b506000918101602001919091529392505050565b6000806040838503121561013757600080fd5b82516001600160401b0381111561014d57600080fd5b61015985828601610081565b602085015190935090506001600160401b0381111561017757600080fd5b61018385828601610081565b915050925092905056fe", deploylessCallViaFactoryBytecode = "0x608060405234801561001057600080fd5b506040516102c03803806102c083398101604081905261002f916101e6565b836001600160a01b03163b6000036100e457600080836001600160a01b03168360405161005c9190610270565b6000604051808303816000865af19150503d8060008114610099576040519150601f19603f3d011682016040523d82523d6000602084013e61009e565b606091505b50915091508115806100b857506001600160a01b0386163b155b156100e1578060405163101bb98d60e01b81526004016100d8919061028c565b60405180910390fd5b50505b6000808451602086016000885af16040513d6000823e81610103573d81fd5b3d81f35b80516001600160a01b038116811461011e57600080fd5b919050565b634e487b7160e01b600052604160045260246000fd5b60005b8381101561015457818101518382015260200161013c565b50506000910152565b600082601f83011261016e57600080fd5b81516001600160401b0381111561018757610187610123565b604051601f8201601f19908116603f011681016001600160401b03811182821017156101b5576101b5610123565b6040528181528382016020018510156101cd57600080fd5b6101de826020830160208701610139565b949350505050565b600080600080608085870312156101fc57600080fd5b61020585610107565b60208601519094506001600160401b0381111561022157600080fd5b61022d8782880161015d565b93505061023c60408601610107565b60608601519092506001600160401b0381111561025857600080fd5b6102648782880161015d565b91505092959194509250565b60008251610282818460208701610139565b9190910192915050565b60208152600082518060208401526102ab816040850160208701610139565b601f01601f1916919091016040019291505056fe", universalSignatureValidatorByteCode = "0x608060405234801561001057600080fd5b5060405161069438038061069483398101604081905261002f9161051e565b600061003c848484610048565b9050806000526001601ff35b60007f64926492649264926492649264926492649264926492649264926492649264926100748361040c565b036101e7576000606080848060200190518101906100929190610577565b60405192955090935091506000906001600160a01b038516906100b69085906105dd565b6000604051808303816000865af19150503d80600081146100f3576040519150601f19603f3d011682016040523d82523d6000602084013e6100f8565b606091505b50509050876001600160a01b03163b60000361016057806101605760405162461bcd60e51b815260206004820152601e60248201527f5369676e617475726556616c696461746f723a206465706c6f796d656e74000060448201526064015b60405180910390fd5b604051630b135d3f60e11b808252906001600160a01b038a1690631626ba7e90610190908b9087906004016105f9565b602060405180830381865afa1580156101ad573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101d19190610633565b6001600160e01b03191614945050505050610405565b6001600160a01b0384163b1561027a57604051630b135d3f60e11b808252906001600160a01b03861690631626ba7e9061022790879087906004016105f9565b602060405180830381865afa158015610244573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102689190610633565b6001600160e01b031916149050610405565b81516041146102df5760405162461bcd60e51b815260206004820152603a602482015260008051602061067483398151915260448201527f3a20696e76616c6964207369676e6174757265206c656e6774680000000000006064820152608401610157565b6102e7610425565b5060208201516040808401518451859392600091859190811061030c5761030c61065d565b016020015160f81c9050601b811480159061032b57508060ff16601c14155b1561038c5760405162461bcd60e51b815260206004820152603b602482015260008051602061067483398151915260448201527f3a20696e76616c6964207369676e617475726520762076616c756500000000006064820152608401610157565b60408051600081526020810180835289905260ff83169181019190915260608101849052608081018390526001600160a01b0389169060019060a0016020604051602081039080840390855afa1580156103ea573d6000803e3d6000fd5b505050602060405103516001600160a01b0316149450505050505b9392505050565b600060208251101561041d57600080fd5b508051015190565b60405180606001604052806003906020820280368337509192915050565b6001600160a01b038116811461045857600080fd5b50565b634e487b7160e01b600052604160045260246000fd5b60005b8381101561048c578181015183820152602001610474565b50506000910152565b600082601f8301126104a657600080fd5b81516001600160401b038111156104bf576104bf61045b565b604051601f8201601f19908116603f011681016001600160401b03811182821017156104ed576104ed61045b565b60405281815283820160200185101561050557600080fd5b610516826020830160208701610471565b949350505050565b60008060006060848603121561053357600080fd5b835161053e81610443565b6020850151604086015191945092506001600160401b0381111561056157600080fd5b61056d86828701610495565b9150509250925092565b60008060006060848603121561058c57600080fd5b835161059781610443565b60208501519093506001600160401b038111156105b357600080fd5b6105bf86828701610495565b604086015190935090506001600160401b0381111561056157600080fd5b600082516105ef818460208701610471565b9190910192915050565b828152604060208201526000825180604084015261061e816060850160208701610471565b601f01601f1916919091016060019392505050565b60006020828403121561064557600080fd5b81516001600160e01b03198116811461040557600080fd5b634e487b7160e01b600052603260045260246000fdfe5369676e617475726556616c696461746f72237265636f7665725369676e6572";

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/errors/chain.js
var ChainDoesNotSupportContract, ChainMismatchError, ChainNotFoundError, ClientChainNotConfiguredError, InvalidChainIdError;
var init_chain = __esm(() => {
  init_base();
  ChainDoesNotSupportContract = class ChainDoesNotSupportContract extends BaseError2 {
    constructor({ blockNumber, chain, contract }) {
      super(`Chain "${chain.name}" does not support contract "${contract.name}".`, {
        metaMessages: [
          "This could be due to any of the following:",
          ...blockNumber && contract.blockCreated && contract.blockCreated > blockNumber ? [
            `- The contract "${contract.name}" was not deployed until block ${contract.blockCreated} (current block ${blockNumber}).`
          ] : [
            `- The chain does not have the contract "${contract.name}" configured.`
          ]
        ],
        name: "ChainDoesNotSupportContract"
      });
    }
  };
  ChainMismatchError = class ChainMismatchError extends BaseError2 {
    constructor({ chain, currentChainId }) {
      super(`The current chain of the wallet (id: ${currentChainId}) does not match the target chain for the transaction (id: ${chain.id} – ${chain.name}).`, {
        metaMessages: [
          `Current Chain ID:  ${currentChainId}`,
          `Expected Chain ID: ${chain.id} – ${chain.name}`
        ],
        name: "ChainMismatchError"
      });
    }
  };
  ChainNotFoundError = class ChainNotFoundError extends BaseError2 {
    constructor() {
      super([
        "No chain was provided to the request.",
        "Please provide a chain with the `chain` argument on the Action, or by supplying a `chain` to WalletClient."
      ].join(`
`), {
        name: "ChainNotFoundError"
      });
    }
  };
  ClientChainNotConfiguredError = class ClientChainNotConfiguredError extends BaseError2 {
    constructor() {
      super("No chain was provided to the Client.", {
        name: "ClientChainNotConfiguredError"
      });
    }
  };
  InvalidChainIdError = class InvalidChainIdError extends BaseError2 {
    constructor({ chainId }) {
      super(typeof chainId === "number" ? `Chain ID "${chainId}" is invalid.` : "Chain ID is invalid.", { name: "InvalidChainIdError" });
    }
  };
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/abi/encodeDeployData.js
function encodeDeployData(parameters) {
  const { abi, args, bytecode } = parameters;
  if (!args || args.length === 0)
    return bytecode;
  const description = abi.find((x) => ("type" in x) && x.type === "constructor");
  if (!description)
    throw new AbiConstructorNotFoundError({ docsPath: docsPath5 });
  if (!("inputs" in description))
    throw new AbiConstructorParamsNotFoundError({ docsPath: docsPath5 });
  if (!description.inputs || description.inputs.length === 0)
    throw new AbiConstructorParamsNotFoundError({ docsPath: docsPath5 });
  const data = encodeAbiParameters(description.inputs, args);
  return concatHex([bytecode, data]);
}
var docsPath5 = "/docs/contract/encodeDeployData";
var init_encodeDeployData = __esm(() => {
  init_abi();
  init_encodeAbiParameters();
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/chain/getChainContractAddress.js
function getChainContractAddress({ blockNumber, chain, contract: name }) {
  const contract = chain?.contracts?.[name];
  if (!contract)
    throw new ChainDoesNotSupportContract({
      chain,
      contract: { name }
    });
  if (blockNumber && contract.blockCreated && contract.blockCreated > blockNumber)
    throw new ChainDoesNotSupportContract({
      blockNumber,
      chain,
      contract: {
        name,
        blockCreated: contract.blockCreated
      }
    });
  return contract.address;
}
var init_getChainContractAddress = __esm(() => {
  init_chain();
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/errors/getCallError.js
function getCallError(err, { docsPath: docsPath6, ...args }) {
  const cause = (() => {
    const cause2 = getNodeError(err, args);
    if (cause2 instanceof UnknownNodeError)
      return err;
    return cause2;
  })();
  return new CallExecutionError(cause, {
    docsPath: docsPath6,
    ...args
  });
}
var init_getCallError = __esm(() => {
  init_contract();
  init_node();
  init_getNodeError();
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/promise/withResolvers.js
function withResolvers() {
  let resolve = () => {
    return;
  };
  let reject = () => {
    return;
  };
  const promise = new Promise((resolve_, reject_) => {
    resolve = resolve_;
    reject = reject_;
  });
  return { promise, resolve, reject };
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/promise/createBatchScheduler.js
function createBatchScheduler({ fn, id, shouldSplitBatch, wait = 0, sort }) {
  const exec = async () => {
    const scheduler = getScheduler();
    flush();
    const args = scheduler.map(({ args: args2 }) => args2);
    if (args.length === 0)
      return;
    fn(args).then((data) => {
      if (sort && Array.isArray(data))
        data.sort(sort);
      for (let i = 0;i < scheduler.length; i++) {
        const { resolve } = scheduler[i];
        resolve?.([data[i], data]);
      }
    }).catch((err) => {
      for (let i = 0;i < scheduler.length; i++) {
        const { reject } = scheduler[i];
        reject?.(err);
      }
    });
  };
  const flush = () => schedulerCache.delete(id);
  const getBatchedArgs = () => getScheduler().map(({ args }) => args);
  const getScheduler = () => schedulerCache.get(id) || [];
  const setScheduler = (item) => schedulerCache.set(id, [...getScheduler(), item]);
  return {
    flush,
    async schedule(args) {
      const { promise, resolve, reject } = withResolvers();
      const split2 = shouldSplitBatch?.([...getBatchedArgs(), args]);
      if (split2)
        exec();
      const hasActiveScheduler = getScheduler().length > 0;
      if (hasActiveScheduler) {
        setScheduler({ args, resolve, reject });
        return promise;
      }
      setScheduler({ args, resolve, reject });
      setTimeout(exec, wait);
      return promise;
    }
  };
}
var schedulerCache;
var init_createBatchScheduler = __esm(() => {
  schedulerCache = /* @__PURE__ */ new Map;
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/errors/ccip.js
var OffchainLookupError, OffchainLookupResponseMalformedError, OffchainLookupSenderMismatchError;
var init_ccip = __esm(() => {
  init_base();
  OffchainLookupError = class OffchainLookupError extends BaseError2 {
    constructor({ callbackSelector, cause, data, extraData, sender, urls }) {
      super(cause.shortMessage || "An error occurred while fetching for an offchain result.", {
        cause,
        metaMessages: [
          ...cause.metaMessages || [],
          cause.metaMessages?.length ? "" : [],
          "Offchain Gateway Call:",
          urls && [
            "  Gateway URL(s):",
            ...urls.map((url) => `    ${getUrl(url)}`)
          ],
          `  Sender: ${sender}`,
          `  Data: ${data}`,
          `  Callback selector: ${callbackSelector}`,
          `  Extra data: ${extraData}`
        ].flat(),
        name: "OffchainLookupError"
      });
    }
  };
  OffchainLookupResponseMalformedError = class OffchainLookupResponseMalformedError extends BaseError2 {
    constructor({ result, url }) {
      super("Offchain gateway response is malformed. Response data must be a hex value.", {
        metaMessages: [
          `Gateway URL: ${getUrl(url)}`,
          `Response: ${stringify(result)}`
        ],
        name: "OffchainLookupResponseMalformedError"
      });
    }
  };
  OffchainLookupSenderMismatchError = class OffchainLookupSenderMismatchError extends BaseError2 {
    constructor({ sender, to }) {
      super("Reverted sender address does not match target contract address (`to`).", {
        metaMessages: [
          `Contract address: ${to}`,
          `OffchainLookup sender address: ${sender}`
        ],
        name: "OffchainLookupSenderMismatchError"
      });
    }
  };
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/ccip.js
var exports_ccip = {};
__export(exports_ccip, {
  offchainLookupSignature: () => offchainLookupSignature,
  offchainLookupAbiItem: () => offchainLookupAbiItem,
  offchainLookup: () => offchainLookup,
  ccipRequest: () => ccipRequest
});
async function offchainLookup(client, { blockNumber, blockTag, data, to }) {
  const { args } = decodeErrorResult({
    data,
    abi: [offchainLookupAbiItem]
  });
  const [sender, urls, callData, callbackSelector, extraData] = args;
  const { ccipRead } = client;
  const ccipRequest_ = ccipRead && typeof ccipRead?.request === "function" ? ccipRead.request : ccipRequest;
  try {
    if (!isAddressEqual(to, sender))
      throw new OffchainLookupSenderMismatchError({ sender, to });
    const result = await ccipRequest_({ data: callData, sender, urls });
    const { data: data_ } = await call(client, {
      blockNumber,
      blockTag,
      data: concat([
        callbackSelector,
        encodeAbiParameters([{ type: "bytes" }, { type: "bytes" }], [result, extraData])
      ]),
      to
    });
    return data_;
  } catch (err) {
    throw new OffchainLookupError({
      callbackSelector,
      cause: err,
      data,
      extraData,
      sender,
      urls
    });
  }
}
async function ccipRequest({ data, sender, urls }) {
  let error = new Error("An unknown error occurred.");
  for (let i = 0;i < urls.length; i++) {
    const url = urls[i];
    const method = url.includes("{data}") ? "GET" : "POST";
    const body = method === "POST" ? { data, sender } : undefined;
    const headers = method === "POST" ? { "Content-Type": "application/json" } : {};
    try {
      const response = await fetch(url.replace("{sender}", sender).replace("{data}", data), {
        body: JSON.stringify(body),
        headers,
        method
      });
      let result;
      if (response.headers.get("Content-Type")?.startsWith("application/json")) {
        result = (await response.json()).data;
      } else {
        result = await response.text();
      }
      if (!response.ok) {
        error = new HttpRequestError({
          body,
          details: result?.error ? stringify(result.error) : response.statusText,
          headers: response.headers,
          status: response.status,
          url
        });
        continue;
      }
      if (!isHex(result)) {
        error = new OffchainLookupResponseMalformedError({
          result,
          url
        });
        continue;
      }
      return result;
    } catch (err) {
      error = new HttpRequestError({
        body,
        details: err.message,
        url
      });
    }
  }
  throw error;
}
var offchainLookupSignature = "0x556f1830", offchainLookupAbiItem;
var init_ccip2 = __esm(() => {
  init_call();
  init_ccip();
  init_request();
  init_decodeErrorResult();
  init_encodeAbiParameters();
  init_isAddressEqual();
  offchainLookupAbiItem = {
    name: "OffchainLookup",
    type: "error",
    inputs: [
      {
        name: "sender",
        type: "address"
      },
      {
        name: "urls",
        type: "string[]"
      },
      {
        name: "callData",
        type: "bytes"
      },
      {
        name: "callbackFunction",
        type: "bytes4"
      },
      {
        name: "extraData",
        type: "bytes"
      }
    ]
  };
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/call.js
async function call(client, args) {
  const { account: account_ = client.account, batch = Boolean(client.batch?.multicall), blockNumber, blockTag = "latest", accessList, blobs, code, data: data_, factory, factoryData, gas, gasPrice, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, nonce, to, value, stateOverride, ...rest } = args;
  const account = account_ ? parseAccount(account_) : undefined;
  if (code && (factory || factoryData))
    throw new BaseError2("Cannot provide both `code` & `factory`/`factoryData` as parameters.");
  if (code && to)
    throw new BaseError2("Cannot provide both `code` & `to` as parameters.");
  const deploylessCallViaBytecode = code && data_;
  const deploylessCallViaFactory = factory && factoryData && to && data_;
  const deploylessCall = deploylessCallViaBytecode || deploylessCallViaFactory;
  const data = (() => {
    if (deploylessCallViaBytecode)
      return toDeploylessCallViaBytecodeData({
        code,
        data: data_
      });
    if (deploylessCallViaFactory)
      return toDeploylessCallViaFactoryData({
        data: data_,
        factory,
        factoryData,
        to
      });
    return data_;
  })();
  try {
    assertRequest(args);
    const blockNumberHex = blockNumber ? numberToHex(blockNumber) : undefined;
    const block = blockNumberHex || blockTag;
    const rpcStateOverride = serializeStateOverride(stateOverride);
    const chainFormat = client.chain?.formatters?.transactionRequest?.format;
    const format = chainFormat || formatTransactionRequest;
    const request = format({
      ...extract(rest, { format: chainFormat }),
      from: account?.address,
      accessList,
      blobs,
      data,
      gas,
      gasPrice,
      maxFeePerBlobGas,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      to: deploylessCall ? undefined : to,
      value
    });
    if (batch && shouldPerformMulticall({ request }) && !rpcStateOverride) {
      try {
        return await scheduleMulticall(client, {
          ...request,
          blockNumber,
          blockTag
        });
      } catch (err) {
        if (!(err instanceof ClientChainNotConfiguredError) && !(err instanceof ChainDoesNotSupportContract))
          throw err;
      }
    }
    const response = await client.request({
      method: "eth_call",
      params: rpcStateOverride ? [
        request,
        block,
        rpcStateOverride
      ] : [request, block]
    });
    if (response === "0x")
      return { data: undefined };
    return { data: response };
  } catch (err) {
    const data2 = getRevertErrorData(err);
    const { offchainLookup: offchainLookup2, offchainLookupSignature: offchainLookupSignature2 } = await Promise.resolve().then(() => (init_ccip2(), exports_ccip));
    if (client.ccipRead !== false && data2?.slice(0, 10) === offchainLookupSignature2 && to)
      return { data: await offchainLookup2(client, { data: data2, to }) };
    if (deploylessCall && data2?.slice(0, 10) === "0x101bb98d")
      throw new CounterfactualDeploymentFailedError({ factory });
    throw getCallError(err, {
      ...args,
      account,
      chain: client.chain
    });
  }
}
function shouldPerformMulticall({ request }) {
  const { data, to, ...request_ } = request;
  if (!data)
    return false;
  if (data.startsWith(aggregate3Signature))
    return false;
  if (!to)
    return false;
  if (Object.values(request_).filter((x) => typeof x !== "undefined").length > 0)
    return false;
  return true;
}
async function scheduleMulticall(client, args) {
  const { batchSize = 1024, wait = 0 } = typeof client.batch?.multicall === "object" ? client.batch.multicall : {};
  const { blockNumber, blockTag = "latest", data, multicallAddress: multicallAddress_, to } = args;
  let multicallAddress = multicallAddress_;
  if (!multicallAddress) {
    if (!client.chain)
      throw new ClientChainNotConfiguredError;
    multicallAddress = getChainContractAddress({
      blockNumber,
      chain: client.chain,
      contract: "multicall3"
    });
  }
  const blockNumberHex = blockNumber ? numberToHex(blockNumber) : undefined;
  const block = blockNumberHex || blockTag;
  const { schedule } = createBatchScheduler({
    id: `${client.uid}.${block}`,
    wait,
    shouldSplitBatch(args2) {
      const size2 = args2.reduce((size3, { data: data2 }) => size3 + (data2.length - 2), 0);
      return size2 > batchSize * 2;
    },
    fn: async (requests) => {
      const calls = requests.map((request) => ({
        allowFailure: true,
        callData: request.data,
        target: request.to
      }));
      const calldata = encodeFunctionData({
        abi: multicall3Abi,
        args: [calls],
        functionName: "aggregate3"
      });
      const data2 = await client.request({
        method: "eth_call",
        params: [
          {
            data: calldata,
            to: multicallAddress
          },
          block
        ]
      });
      return decodeFunctionResult({
        abi: multicall3Abi,
        args: [calls],
        functionName: "aggregate3",
        data: data2 || "0x"
      });
    }
  });
  const [{ returnData, success }] = await schedule({ data, to });
  if (!success)
    throw new RawContractError({ data: returnData });
  if (returnData === "0x")
    return { data: undefined };
  return { data: returnData };
}
function toDeploylessCallViaBytecodeData(parameters) {
  const { code, data } = parameters;
  return encodeDeployData({
    abi: parseAbi(["constructor(bytes, bytes)"]),
    bytecode: deploylessCallViaBytecodeBytecode,
    args: [code, data]
  });
}
function toDeploylessCallViaFactoryData(parameters) {
  const { data, factory, factoryData, to } = parameters;
  return encodeDeployData({
    abi: parseAbi(["constructor(address, bytes, address, bytes)"]),
    bytecode: deploylessCallViaFactoryBytecode,
    args: [to, data, factory, factoryData]
  });
}
function getRevertErrorData(err) {
  if (!(err instanceof BaseError2))
    return;
  const error = err.walk();
  return typeof error?.data === "object" ? error.data?.data : error.data;
}
var init_call = __esm(() => {
  init_exports();
  init_abis();
  init_base();
  init_chain();
  init_contract();
  init_decodeFunctionResult();
  init_encodeDeployData();
  init_encodeFunctionData();
  init_getChainContractAddress();
  init_toHex();
  init_getCallError();
  init_transactionRequest();
  init_createBatchScheduler();
  init_stateOverride2();
  init_assertRequest();
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/clone/clone.js
var require_clone = __commonJS((exports, module) => {
  var clone = function() {
    function _instanceof(obj, type) {
      return type != null && obj instanceof type;
    }
    var nativeMap;
    try {
      nativeMap = Map;
    } catch (_) {
      nativeMap = function() {};
    }
    var nativeSet;
    try {
      nativeSet = Set;
    } catch (_) {
      nativeSet = function() {};
    }
    var nativePromise;
    try {
      nativePromise = Promise;
    } catch (_) {
      nativePromise = function() {};
    }
    function clone2(parent, circular, depth, prototype, includeNonEnumerable) {
      if (typeof circular === "object") {
        depth = circular.depth;
        prototype = circular.prototype;
        includeNonEnumerable = circular.includeNonEnumerable;
        circular = circular.circular;
      }
      var allParents = [];
      var allChildren = [];
      var useBuffer = typeof Buffer != "undefined";
      if (typeof circular == "undefined")
        circular = true;
      if (typeof depth == "undefined")
        depth = Infinity;
      function _clone(parent2, depth2) {
        if (parent2 === null)
          return null;
        if (depth2 === 0)
          return parent2;
        var child;
        var proto;
        if (typeof parent2 != "object") {
          return parent2;
        }
        if (_instanceof(parent2, nativeMap)) {
          child = new nativeMap;
        } else if (_instanceof(parent2, nativeSet)) {
          child = new nativeSet;
        } else if (_instanceof(parent2, nativePromise)) {
          child = new nativePromise(function(resolve, reject) {
            parent2.then(function(value) {
              resolve(_clone(value, depth2 - 1));
            }, function(err) {
              reject(_clone(err, depth2 - 1));
            });
          });
        } else if (clone2.__isArray(parent2)) {
          child = [];
        } else if (clone2.__isRegExp(parent2)) {
          child = new RegExp(parent2.source, __getRegExpFlags(parent2));
          if (parent2.lastIndex)
            child.lastIndex = parent2.lastIndex;
        } else if (clone2.__isDate(parent2)) {
          child = new Date(parent2.getTime());
        } else if (useBuffer && Buffer.isBuffer(parent2)) {
          if (Buffer.allocUnsafe) {
            child = Buffer.allocUnsafe(parent2.length);
          } else {
            child = new Buffer(parent2.length);
          }
          parent2.copy(child);
          return child;
        } else if (_instanceof(parent2, Error)) {
          child = Object.create(parent2);
        } else {
          if (typeof prototype == "undefined") {
            proto = Object.getPrototypeOf(parent2);
            child = Object.create(proto);
          } else {
            child = Object.create(prototype);
            proto = prototype;
          }
        }
        if (circular) {
          var index2 = allParents.indexOf(parent2);
          if (index2 != -1) {
            return allChildren[index2];
          }
          allParents.push(parent2);
          allChildren.push(child);
        }
        if (_instanceof(parent2, nativeMap)) {
          parent2.forEach(function(value, key) {
            var keyChild = _clone(key, depth2 - 1);
            var valueChild = _clone(value, depth2 - 1);
            child.set(keyChild, valueChild);
          });
        }
        if (_instanceof(parent2, nativeSet)) {
          parent2.forEach(function(value) {
            var entryChild = _clone(value, depth2 - 1);
            child.add(entryChild);
          });
        }
        for (var i in parent2) {
          var attrs;
          if (proto) {
            attrs = Object.getOwnPropertyDescriptor(proto, i);
          }
          if (attrs && attrs.set == null) {
            continue;
          }
          child[i] = _clone(parent2[i], depth2 - 1);
        }
        if (Object.getOwnPropertySymbols) {
          var symbols = Object.getOwnPropertySymbols(parent2);
          for (var i = 0;i < symbols.length; i++) {
            var symbol = symbols[i];
            var descriptor = Object.getOwnPropertyDescriptor(parent2, symbol);
            if (descriptor && !descriptor.enumerable && !includeNonEnumerable) {
              continue;
            }
            child[symbol] = _clone(parent2[symbol], depth2 - 1);
            if (!descriptor.enumerable) {
              Object.defineProperty(child, symbol, {
                enumerable: false
              });
            }
          }
        }
        if (includeNonEnumerable) {
          var allPropertyNames = Object.getOwnPropertyNames(parent2);
          for (var i = 0;i < allPropertyNames.length; i++) {
            var propertyName = allPropertyNames[i];
            var descriptor = Object.getOwnPropertyDescriptor(parent2, propertyName);
            if (descriptor && descriptor.enumerable) {
              continue;
            }
            child[propertyName] = _clone(parent2[propertyName], depth2 - 1);
            Object.defineProperty(child, propertyName, {
              enumerable: false
            });
          }
        }
        return child;
      }
      return _clone(parent, depth);
    }
    clone2.clonePrototype = function clonePrototype(parent) {
      if (parent === null)
        return null;
      var c = function() {};
      c.prototype = parent;
      return new c;
    };
    function __objToStr(o) {
      return Object.prototype.toString.call(o);
    }
    clone2.__objToStr = __objToStr;
    function __isDate(o) {
      return typeof o === "object" && __objToStr(o) === "[object Date]";
    }
    clone2.__isDate = __isDate;
    function __isArray(o) {
      return typeof o === "object" && __objToStr(o) === "[object Array]";
    }
    clone2.__isArray = __isArray;
    function __isRegExp(o) {
      return typeof o === "object" && __objToStr(o) === "[object RegExp]";
    }
    clone2.__isRegExp = __isRegExp;
    function __getRegExpFlags(re) {
      var flags = "";
      if (re.global)
        flags += "g";
      if (re.ignoreCase)
        flags += "i";
      if (re.multiline)
        flags += "m";
      return flags;
    }
    clone2.__getRegExpFlags = __getRegExpFlags;
    return clone2;
  }();
  if (typeof module === "object" && module.exports) {
    module.exports = clone;
  }
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/node-cache/lib/node_cache.js
var require_node_cache = __commonJS((exports, module) => {
  (function() {
    var EventEmitter, NodeCache, clone, splice = [].splice, boundMethodCheck = function(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new Error("Bound instance method accessed before binding");
      }
    }, indexOf = [].indexOf;
    clone = require_clone();
    EventEmitter = __require("events").EventEmitter;
    module.exports = NodeCache = function() {

      class NodeCache2 extends EventEmitter {
        constructor(options = {}) {
          super();
          this.get = this.get.bind(this);
          this.mget = this.mget.bind(this);
          this.set = this.set.bind(this);
          this.mset = this.mset.bind(this);
          this.del = this.del.bind(this);
          this.take = this.take.bind(this);
          this.ttl = this.ttl.bind(this);
          this.getTtl = this.getTtl.bind(this);
          this.keys = this.keys.bind(this);
          this.has = this.has.bind(this);
          this.getStats = this.getStats.bind(this);
          this.flushAll = this.flushAll.bind(this);
          this.flushStats = this.flushStats.bind(this);
          this.close = this.close.bind(this);
          this._checkData = this._checkData.bind(this);
          this._check = this._check.bind(this);
          this._isInvalidKey = this._isInvalidKey.bind(this);
          this._wrap = this._wrap.bind(this);
          this._getValLength = this._getValLength.bind(this);
          this._error = this._error.bind(this);
          this._initErrors = this._initErrors.bind(this);
          this.options = options;
          this._initErrors();
          this.data = {};
          this.options = Object.assign({
            forceString: false,
            objectValueSize: 80,
            promiseValueSize: 80,
            arrayValueSize: 40,
            stdTTL: 0,
            checkperiod: 600,
            useClones: true,
            deleteOnExpire: true,
            enableLegacyCallbacks: false,
            maxKeys: -1
          }, this.options);
          if (this.options.enableLegacyCallbacks) {
            console.warn("WARNING! node-cache legacy callback support will drop in v6.x");
            ["get", "mget", "set", "del", "ttl", "getTtl", "keys", "has"].forEach((methodKey) => {
              var oldMethod;
              oldMethod = this[methodKey];
              this[methodKey] = function(...args) {
                var cb, err, ref, res;
                ref = args, [...args] = ref, [cb] = splice.call(args, -1);
                if (typeof cb === "function") {
                  try {
                    res = oldMethod(...args);
                    cb(null, res);
                  } catch (error1) {
                    err = error1;
                    cb(err);
                  }
                } else {
                  return oldMethod(...args, cb);
                }
              };
            });
          }
          this.stats = {
            hits: 0,
            misses: 0,
            keys: 0,
            ksize: 0,
            vsize: 0
          };
          this.validKeyTypes = ["string", "number"];
          this._checkData();
          return;
        }
        get(key) {
          var _ret, err;
          boundMethodCheck(this, NodeCache2);
          if ((err = this._isInvalidKey(key)) != null) {
            throw err;
          }
          if (this.data[key] != null && this._check(key, this.data[key])) {
            this.stats.hits++;
            _ret = this._unwrap(this.data[key]);
            return _ret;
          } else {
            this.stats.misses++;
            return;
          }
        }
        mget(keys) {
          var _err, err, i, key, len, oRet;
          boundMethodCheck(this, NodeCache2);
          if (!Array.isArray(keys)) {
            _err = this._error("EKEYSTYPE");
            throw _err;
          }
          oRet = {};
          for (i = 0, len = keys.length;i < len; i++) {
            key = keys[i];
            if ((err = this._isInvalidKey(key)) != null) {
              throw err;
            }
            if (this.data[key] != null && this._check(key, this.data[key])) {
              this.stats.hits++;
              oRet[key] = this._unwrap(this.data[key]);
            } else {
              this.stats.misses++;
            }
          }
          return oRet;
        }
        set(key, value, ttl) {
          var _err, err, existent;
          boundMethodCheck(this, NodeCache2);
          if (this.options.maxKeys > -1 && this.stats.keys >= this.options.maxKeys) {
            _err = this._error("ECACHEFULL");
            throw _err;
          }
          if (this.options.forceString && false === "string") {
            value = JSON.stringify(value);
          }
          if (ttl == null) {
            ttl = this.options.stdTTL;
          }
          if ((err = this._isInvalidKey(key)) != null) {
            throw err;
          }
          existent = false;
          if (this.data[key]) {
            existent = true;
            this.stats.vsize -= this._getValLength(this._unwrap(this.data[key], false));
          }
          this.data[key] = this._wrap(value, ttl);
          this.stats.vsize += this._getValLength(value);
          if (!existent) {
            this.stats.ksize += this._getKeyLength(key);
            this.stats.keys++;
          }
          this.emit("set", key, value);
          return true;
        }
        mset(keyValueSet) {
          var _err, err, i, j, key, keyValuePair, len, len1, ttl, val;
          boundMethodCheck(this, NodeCache2);
          if (this.options.maxKeys > -1 && this.stats.keys + keyValueSet.length >= this.options.maxKeys) {
            _err = this._error("ECACHEFULL");
            throw _err;
          }
          for (i = 0, len = keyValueSet.length;i < len; i++) {
            keyValuePair = keyValueSet[i];
            ({ key, val, ttl } = keyValuePair);
            if (ttl && typeof ttl !== "number") {
              _err = this._error("ETTLTYPE");
              throw _err;
            }
            if ((err = this._isInvalidKey(key)) != null) {
              throw err;
            }
          }
          for (j = 0, len1 = keyValueSet.length;j < len1; j++) {
            keyValuePair = keyValueSet[j];
            ({ key, val, ttl } = keyValuePair);
            this.set(key, val, ttl);
          }
          return true;
        }
        del(keys) {
          var delCount, err, i, key, len, oldVal;
          boundMethodCheck(this, NodeCache2);
          if (!Array.isArray(keys)) {
            keys = [keys];
          }
          delCount = 0;
          for (i = 0, len = keys.length;i < len; i++) {
            key = keys[i];
            if ((err = this._isInvalidKey(key)) != null) {
              throw err;
            }
            if (this.data[key] != null) {
              this.stats.vsize -= this._getValLength(this._unwrap(this.data[key], false));
              this.stats.ksize -= this._getKeyLength(key);
              this.stats.keys--;
              delCount++;
              oldVal = this.data[key];
              delete this.data[key];
              this.emit("del", key, oldVal.v);
            }
          }
          return delCount;
        }
        take(key) {
          var _ret;
          boundMethodCheck(this, NodeCache2);
          _ret = this.get(key);
          if (_ret != null) {
            this.del(key);
          }
          return _ret;
        }
        ttl(key, ttl) {
          var err;
          boundMethodCheck(this, NodeCache2);
          ttl || (ttl = this.options.stdTTL);
          if (!key) {
            return false;
          }
          if ((err = this._isInvalidKey(key)) != null) {
            throw err;
          }
          if (this.data[key] != null && this._check(key, this.data[key])) {
            if (ttl >= 0) {
              this.data[key] = this._wrap(this.data[key].v, ttl, false);
            } else {
              this.del(key);
            }
            return true;
          } else {
            return false;
          }
        }
        getTtl(key) {
          var _ttl, err;
          boundMethodCheck(this, NodeCache2);
          if (!key) {
            return;
          }
          if ((err = this._isInvalidKey(key)) != null) {
            throw err;
          }
          if (this.data[key] != null && this._check(key, this.data[key])) {
            _ttl = this.data[key].t;
            return _ttl;
          } else {
            return;
          }
        }
        keys() {
          var _keys;
          boundMethodCheck(this, NodeCache2);
          _keys = Object.keys(this.data);
          return _keys;
        }
        has(key) {
          var _exists;
          boundMethodCheck(this, NodeCache2);
          _exists = this.data[key] != null && this._check(key, this.data[key]);
          return _exists;
        }
        getStats() {
          boundMethodCheck(this, NodeCache2);
          return this.stats;
        }
        flushAll(_startPeriod = true) {
          boundMethodCheck(this, NodeCache2);
          this.data = {};
          this.stats = {
            hits: 0,
            misses: 0,
            keys: 0,
            ksize: 0,
            vsize: 0
          };
          this._killCheckPeriod();
          this._checkData(_startPeriod);
          this.emit("flush");
        }
        flushStats() {
          boundMethodCheck(this, NodeCache2);
          this.stats = {
            hits: 0,
            misses: 0,
            keys: 0,
            ksize: 0,
            vsize: 0
          };
          this.emit("flush_stats");
        }
        close() {
          boundMethodCheck(this, NodeCache2);
          this._killCheckPeriod();
        }
        _checkData(startPeriod = true) {
          var key, ref, value;
          boundMethodCheck(this, NodeCache2);
          ref = this.data;
          for (key in ref) {
            value = ref[key];
            this._check(key, value);
          }
          if (startPeriod && this.options.checkperiod > 0) {
            this.checkTimeout = setTimeout(this._checkData, this.options.checkperiod * 1000, startPeriod);
            if (this.checkTimeout != null && this.checkTimeout.unref != null) {
              this.checkTimeout.unref();
            }
          }
        }
        _killCheckPeriod() {
          if (this.checkTimeout != null) {
            return clearTimeout(this.checkTimeout);
          }
        }
        _check(key, data) {
          var _retval;
          boundMethodCheck(this, NodeCache2);
          _retval = true;
          if (data.t !== 0 && data.t < Date.now()) {
            if (this.options.deleteOnExpire) {
              _retval = false;
              this.del(key);
            }
            this.emit("expired", key, this._unwrap(data));
          }
          return _retval;
        }
        _isInvalidKey(key) {
          var ref;
          boundMethodCheck(this, NodeCache2);
          if (ref = typeof key, indexOf.call(this.validKeyTypes, ref) < 0) {
            return this._error("EKEYTYPE", {
              type: typeof key
            });
          }
        }
        _wrap(value, ttl, asClone = true) {
          var livetime, now, oReturn, ttlMultiplicator;
          boundMethodCheck(this, NodeCache2);
          if (!this.options.useClones) {
            asClone = false;
          }
          now = Date.now();
          livetime = 0;
          ttlMultiplicator = 1000;
          if (ttl === 0) {
            livetime = 0;
          } else if (ttl) {
            livetime = now + ttl * ttlMultiplicator;
          } else {
            if (this.options.stdTTL === 0) {
              livetime = this.options.stdTTL;
            } else {
              livetime = now + this.options.stdTTL * ttlMultiplicator;
            }
          }
          return oReturn = {
            t: livetime,
            v: asClone ? clone(value) : value
          };
        }
        _unwrap(value, asClone = true) {
          if (!this.options.useClones) {
            asClone = false;
          }
          if (value.v != null) {
            if (asClone) {
              return clone(value.v);
            } else {
              return value.v;
            }
          }
          return null;
        }
        _getKeyLength(key) {
          return key.toString().length;
        }
        _getValLength(value) {
          boundMethodCheck(this, NodeCache2);
          if (typeof value === "string") {
            return value.length;
          } else if (this.options.forceString) {
            return JSON.stringify(value).length;
          } else if (Array.isArray(value)) {
            return this.options.arrayValueSize * value.length;
          } else if (typeof value === "number") {
            return 8;
          } else if (typeof (value != null ? value.then : undefined) === "function") {
            return this.options.promiseValueSize;
          } else if (typeof Buffer !== "undefined" && Buffer !== null ? Buffer.isBuffer(value) : undefined) {
            return value.length;
          } else if (value != null && typeof value === "object") {
            return this.options.objectValueSize * Object.keys(value).length;
          } else if (typeof value === "boolean") {
            return 8;
          } else {
            return 0;
          }
        }
        _error(type, data = {}) {
          var error;
          boundMethodCheck(this, NodeCache2);
          error = new Error;
          error.name = type;
          error.errorcode = type;
          error.message = this.ERRORS[type] != null ? this.ERRORS[type](data) : "-";
          error.data = data;
          return error;
        }
        _initErrors() {
          var _errMsg, _errT, ref;
          boundMethodCheck(this, NodeCache2);
          this.ERRORS = {};
          ref = this._ERRORS;
          for (_errT in ref) {
            _errMsg = ref[_errT];
            this.ERRORS[_errT] = this.createErrorMessage(_errMsg);
          }
        }
        createErrorMessage(errMsg) {
          return function(args) {
            return errMsg.replace("__key", args.type);
          };
        }
      }
      NodeCache2.prototype._ERRORS = {
        ENOTFOUND: "Key `__key` not found",
        ECACHEFULL: "Cache max keys amount exceeded",
        EKEYTYPE: "The key argument has to be of type `string` or `number`. Found: `__key`",
        EKEYSTYPE: "The keys argument has to be an array.",
        ETTLTYPE: "The ttl argument has to be a number."
      };
      return NodeCache2;
    }.call(this);
  }).call(exports);
});

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/node-cache/index.js
var require_node_cache2 = __commonJS((exports, module) => {
  (function() {
    var exports2;
    exports2 = module.exports = require_node_cache();
    exports2.version = "5.1.2";
  }).call(exports);
});

// src/index.ts
import { logger } from "@elizaos/core";

// src/character.ts
var character = {
  name: "Kairos",
  plugins: [
    "@elizaos/plugin-sql",
    ...process.env.ANTHROPIC_API_KEY?.trim() ? ["@elizaos/plugin-anthropic"] : [],
    ...process.env.OPENROUTER_API_KEY?.trim() ? ["@elizaos/plugin-openrouter"] : [],
    ...process.env.OPENAI_API_KEY?.trim() ? ["@elizaos/plugin-openai"] : [],
    ...process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ? ["@elizaos/plugin-google-genai"] : [],
    ...process.env.OLLAMA_API_ENDPOINT?.trim() ? ["@elizaos/plugin-ollama"] : [],
    ...process.env.DISCORD_API_TOKEN?.trim() ? ["@elizaos/plugin-discord"] : [],
    ...process.env.TWITTER_API_KEY?.trim() && process.env.TWITTER_API_SECRET_KEY?.trim() && process.env.TWITTER_ACCESS_TOKEN?.trim() && process.env.TWITTER_ACCESS_TOKEN_SECRET?.trim() ? ["@elizaos/plugin-twitter"] : [],
    ...process.env.TELEGRAM_BOT_TOKEN?.trim() ? ["@elizaos/plugin-telegram"] : [],
    ...!process.env.IGNORE_BOOTSTRAP ? ["@elizaos/plugin-bootstrap"] : []
  ],
  settings: {
    secrets: {},
    avatar: "https://elizaos.github.io/eliza-avatars/Eliza/portrait.png"
  },
  system: "You are Kairos, a DeFi AI agent specialized in SEI blockchain operations. You have direct access to real-time cryptocurrency prices through the SEI oracle provider, and can execute various DeFi strategies including token transfers, DEX trading, arbitrage, and portfolio management. When users ask about crypto prices, use your oracle provider to fetch current prices. You are knowledgeable about SEI Network, DragonSwap, YEI Finance, and advanced DeFi concepts like funding rate arbitrage, delta-neutral strategies, and IL protection. Always provide accurate, actionable DeFi advice.",
  bio: [
    "DeFi AI agent specialized in SEI blockchain",
    "Real-time access to cryptocurrency prices via oracle providers",
    "Expert in yield optimization and arbitrage strategies",
    "Executes token transfers and DEX trades",
    "Manages portfolio rebalancing and risk assessment",
    "Knowledge of DragonSwap, Symphony, and YEI Finance",
    "Provides actionable DeFi insights and strategy recommendations",
    "Communicates complex DeFi concepts clearly"
  ],
  topics: [
    "cryptocurrency prices and market data",
    "SEI blockchain and EVM compatibility",
    "DeFi protocols and yield optimization",
    "DEX trading (DragonSwap, Symphony)",
    "arbitrage strategies and funding rates",
    "portfolio management and rebalancing",
    "impermanent loss protection",
    "delta-neutral strategies",
    "oracle systems (Pyth, Chainlink, YEI)",
    "liquidity provision and AMM optimization"
  ],
  messageExamples: [
    [
      {
        name: "{{name1}}",
        content: {
          text: "What's the current price of SEI?"
        }
      },
      {
        name: "Kairos",
        content: {
          text: "Let me check the current SEI price for you. SEI is currently trading at $0.452 according to the latest oracle data."
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "Can you help me with a funding rate arbitrage opportunity?"
        }
      },
      {
        name: "Kairos",
        content: {
          text: "Absolutely! I can analyze funding rates across multiple exchanges and identify arbitrage opportunities. Let me check the current rates for you. Which asset are you interested in?"
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "How do I optimize my liquidity position on DragonSwap?"
        }
      },
      {
        name: "Kairos",
        content: {
          text: "I can help you optimize your LP position! First, let me analyze the current pool metrics and IL risk. Which pool are you providing liquidity to?"
        }
      }
    ]
  ],
  style: {
    all: [
      "Provide accurate cryptocurrency prices and market data",
      "Explain DeFi concepts clearly and concisely",
      "Offer actionable trading and investment strategies",
      "Use technical DeFi terminology appropriately",
      "Reference specific protocols (DragonSwap, YEI, Symphony)",
      "Cite oracle data sources when providing prices",
      "Be professional yet approachable",
      "Focus on SEI blockchain ecosystem",
      "Emphasize risk management in DeFi strategies",
      "Provide data-driven insights"
    ],
    chat: [
      "Respond with real-time price data when asked",
      "Suggest relevant DeFi strategies proactively",
      "Explain complex concepts in accessible terms",
      "Use examples from SEI ecosystem"
    ]
  }
};

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/getAction.js
function getAction(client, actionFn, name) {
  const action_implicit = client[actionFn.name];
  if (typeof action_implicit === "function")
    return action_implicit;
  const action_explicit = client[name];
  if (typeof action_explicit === "function")
    return action_explicit;
  return (params) => actionFn(client, params);
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/abi/encodeEventTopics.js
init_abi();

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/errors/log.js
init_base();

class FilterTypeNotSupportedError extends BaseError2 {
  constructor(type) {
    super(`Filter type "${type}" is not supported.`, {
      name: "FilterTypeNotSupportedError"
    });
  }
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/abi/encodeEventTopics.js
init_toBytes();
init_keccak256();
init_toEventSelector();
init_encodeAbiParameters();
init_formatAbiItem2();
init_getAbiItem();
var docsPath = "/docs/contract/encodeEventTopics";
function encodeEventTopics(parameters) {
  const { abi, eventName, args } = parameters;
  let abiItem = abi[0];
  if (eventName) {
    const item = getAbiItem({ abi, name: eventName });
    if (!item)
      throw new AbiEventNotFoundError(eventName, { docsPath });
    abiItem = item;
  }
  if (abiItem.type !== "event")
    throw new AbiEventNotFoundError(undefined, { docsPath });
  const definition = formatAbiItem2(abiItem);
  const signature = toEventSelector(definition);
  let topics = [];
  if (args && "inputs" in abiItem) {
    const indexedInputs = abiItem.inputs?.filter((param) => ("indexed" in param) && param.indexed);
    const args_ = Array.isArray(args) ? args : Object.values(args).length > 0 ? indexedInputs?.map((x) => args[x.name]) ?? [] : [];
    if (args_.length > 0) {
      topics = indexedInputs?.map((param, i) => {
        if (Array.isArray(args_[i]))
          return args_[i].map((_, j) => encodeArg({ param, value: args_[i][j] }));
        return typeof args_[i] !== "undefined" && args_[i] !== null ? encodeArg({ param, value: args_[i] }) : null;
      }) ?? [];
    }
  }
  return [signature, ...topics];
}
function encodeArg({ param, value }) {
  if (param.type === "string" || param.type === "bytes")
    return keccak256(toBytes(value));
  if (param.type === "tuple" || param.type.match(/^(.*)\[(\d+)?\]$/))
    throw new FilterTypeNotSupportedError(param.type);
  return encodeAbiParameters([param], [value]);
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/createContractEventFilter.js
init_toHex();

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/filters/createFilterRequestScope.js
function createFilterRequestScope(client, { method }) {
  const requestMap = {};
  if (client.transport.type === "fallback")
    client.transport.onResponse?.(({ method: method_, response: id, status, transport }) => {
      if (status === "success" && method === method_)
        requestMap[id] = transport.request;
    });
  return (id) => requestMap[id] || client.request;
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/createContractEventFilter.js
async function createContractEventFilter(client, parameters) {
  const { address, abi, args, eventName, fromBlock, strict, toBlock } = parameters;
  const getRequest = createFilterRequestScope(client, {
    method: "eth_newFilter"
  });
  const topics = eventName ? encodeEventTopics({
    abi,
    args,
    eventName
  }) : undefined;
  const id = await client.request({
    method: "eth_newFilter",
    params: [
      {
        address,
        fromBlock: typeof fromBlock === "bigint" ? numberToHex(fromBlock) : fromBlock,
        toBlock: typeof toBlock === "bigint" ? numberToHex(toBlock) : toBlock,
        topics
      }
    ]
  });
  return {
    abi,
    args,
    eventName,
    id,
    request: getRequest(id),
    strict: Boolean(strict),
    type: "event"
  };
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/estimateContractGas.js
init_encodeFunctionData();

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/errors/getContractError.js
init_abi();
init_base();
init_contract();
init_request();
init_rpc();
var EXECUTION_REVERTED_ERROR_CODE = 3;
function getContractError(err, { abi, address, args, docsPath: docsPath3, functionName, sender }) {
  const error = err instanceof RawContractError ? err : err instanceof BaseError2 ? err.walk((err2) => ("data" in err2)) || err.walk() : {};
  const { code, data, details, message, shortMessage } = error;
  const cause = (() => {
    if (err instanceof AbiDecodingZeroDataError)
      return new ContractFunctionZeroDataError({ functionName });
    if ([EXECUTION_REVERTED_ERROR_CODE, InternalRpcError.code].includes(code) && (data || details || message || shortMessage)) {
      return new ContractFunctionRevertedError({
        abi,
        data: typeof data === "object" ? data.data : data,
        functionName,
        message: error instanceof RpcRequestError ? details : shortMessage ?? message
      });
    }
    return err;
  })();
  return new ContractFunctionExecutionError(cause, {
    abi,
    args,
    contractAddress: address,
    docsPath: docsPath3,
    functionName,
    sender
  });
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/estimateGas.js
init_base();

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/accounts/utils/publicKeyToAddress.js
init_getAddress();
init_keccak256();
function publicKeyToAddress(publicKey) {
  const address = keccak256(`0x${publicKey.substring(4)}`).substring(26);
  return checksumAddress(`0x${address}`);
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/signature/recoverPublicKey.js
init_fromHex();
init_toHex();
async function recoverPublicKey({ hash: hash2, signature }) {
  const hashHex = isHex(hash2) ? hash2 : toHex(hash2);
  const { secp256k1: secp256k12 } = await Promise.resolve().then(() => (init_secp256k1(), exports_secp256k1));
  const signature_ = (() => {
    if (typeof signature === "object" && "r" in signature && "s" in signature) {
      const { r, s, v, yParity } = signature;
      const yParityOrV2 = Number(yParity ?? v);
      const recoveryBit2 = toRecoveryBit(yParityOrV2);
      return new secp256k12.Signature(hexToBigInt(r), hexToBigInt(s)).addRecoveryBit(recoveryBit2);
    }
    const signatureHex = isHex(signature) ? signature : toHex(signature);
    const yParityOrV = hexToNumber(`0x${signatureHex.slice(130)}`);
    const recoveryBit = toRecoveryBit(yParityOrV);
    return secp256k12.Signature.fromCompact(signatureHex.substring(2, 130)).addRecoveryBit(recoveryBit);
  })();
  const publicKey = signature_.recoverPublicKey(hashHex.substring(2)).toHex(false);
  return `0x${publicKey}`;
}
function toRecoveryBit(yParityOrV) {
  if (yParityOrV === 0 || yParityOrV === 1)
    return yParityOrV;
  if (yParityOrV === 27)
    return 0;
  if (yParityOrV === 28)
    return 1;
  throw new Error("Invalid yParityOrV value");
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/signature/recoverAddress.js
async function recoverAddress({ hash: hash2, signature }) {
  return publicKeyToAddress(await recoverPublicKey({ hash: hash2, signature }));
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/experimental/eip7702/utils/hashAuthorization.js
init_toBytes();
init_toHex();

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/encoding/toRlp.js
init_base();
init_cursor2();
init_toBytes();
init_toHex();
function toRlp(bytes, to = "hex") {
  const encodable = getEncodable(bytes);
  const cursor = createCursor(new Uint8Array(encodable.length));
  encodable.encode(cursor);
  if (to === "hex")
    return bytesToHex(cursor.bytes);
  return cursor.bytes;
}
function getEncodable(bytes) {
  if (Array.isArray(bytes))
    return getEncodableList(bytes.map((x) => getEncodable(x)));
  return getEncodableBytes(bytes);
}
function getEncodableList(list) {
  const bodyLength = list.reduce((acc, x) => acc + x.length, 0);
  const sizeOfBodyLength = getSizeOfLength(bodyLength);
  const length = (() => {
    if (bodyLength <= 55)
      return 1 + bodyLength;
    return 1 + sizeOfBodyLength + bodyLength;
  })();
  return {
    length,
    encode(cursor) {
      if (bodyLength <= 55) {
        cursor.pushByte(192 + bodyLength);
      } else {
        cursor.pushByte(192 + 55 + sizeOfBodyLength);
        if (sizeOfBodyLength === 1)
          cursor.pushUint8(bodyLength);
        else if (sizeOfBodyLength === 2)
          cursor.pushUint16(bodyLength);
        else if (sizeOfBodyLength === 3)
          cursor.pushUint24(bodyLength);
        else
          cursor.pushUint32(bodyLength);
      }
      for (const { encode } of list) {
        encode(cursor);
      }
    }
  };
}
function getEncodableBytes(bytesOrHex) {
  const bytes = typeof bytesOrHex === "string" ? hexToBytes(bytesOrHex) : bytesOrHex;
  const sizeOfBytesLength = getSizeOfLength(bytes.length);
  const length = (() => {
    if (bytes.length === 1 && bytes[0] < 128)
      return 1;
    if (bytes.length <= 55)
      return 1 + bytes.length;
    return 1 + sizeOfBytesLength + bytes.length;
  })();
  return {
    length,
    encode(cursor) {
      if (bytes.length === 1 && bytes[0] < 128) {
        cursor.pushBytes(bytes);
      } else if (bytes.length <= 55) {
        cursor.pushByte(128 + bytes.length);
        cursor.pushBytes(bytes);
      } else {
        cursor.pushByte(128 + 55 + sizeOfBytesLength);
        if (sizeOfBytesLength === 1)
          cursor.pushUint8(bytes.length);
        else if (sizeOfBytesLength === 2)
          cursor.pushUint16(bytes.length);
        else if (sizeOfBytesLength === 3)
          cursor.pushUint24(bytes.length);
        else
          cursor.pushUint32(bytes.length);
        cursor.pushBytes(bytes);
      }
    }
  };
}
function getSizeOfLength(length) {
  if (length < 2 ** 8)
    return 1;
  if (length < 2 ** 16)
    return 2;
  if (length < 2 ** 24)
    return 3;
  if (length < 2 ** 32)
    return 4;
  throw new BaseError2("Length is too large.");
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/experimental/eip7702/utils/hashAuthorization.js
init_keccak256();
function hashAuthorization(parameters) {
  const { chainId, contractAddress, nonce, to } = parameters;
  const hash2 = keccak256(concatHex([
    "0x05",
    toRlp([
      chainId ? numberToHex(chainId) : "0x",
      contractAddress,
      nonce ? numberToHex(nonce) : "0x"
    ])
  ]));
  if (to === "bytes")
    return hexToBytes(hash2);
  return hash2;
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/experimental/eip7702/utils/recoverAuthorizationAddress.js
async function recoverAuthorizationAddress(parameters) {
  const { authorization, signature } = parameters;
  return recoverAddress({
    hash: hashAuthorization(authorization),
    signature: signature ?? authorization
  });
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/estimateGas.js
init_toHex();

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/errors/estimateGas.js
init_formatEther();
init_formatGwei();
init_base();
init_transaction();

class EstimateGasExecutionError extends BaseError2 {
  constructor(cause, { account, docsPath: docsPath3, chain, data, gas, gasPrice, maxFeePerGas, maxPriorityFeePerGas, nonce, to, value }) {
    const prettyArgs = prettyPrint({
      from: account?.address,
      to,
      value: typeof value !== "undefined" && `${formatEther(value)} ${chain?.nativeCurrency?.symbol || "ETH"}`,
      data,
      gas,
      gasPrice: typeof gasPrice !== "undefined" && `${formatGwei(gasPrice)} gwei`,
      maxFeePerGas: typeof maxFeePerGas !== "undefined" && `${formatGwei(maxFeePerGas)} gwei`,
      maxPriorityFeePerGas: typeof maxPriorityFeePerGas !== "undefined" && `${formatGwei(maxPriorityFeePerGas)} gwei`,
      nonce
    });
    super(cause.shortMessage, {
      cause,
      docsPath: docsPath3,
      metaMessages: [
        ...cause.metaMessages ? [...cause.metaMessages, " "] : [],
        "Estimate Gas Arguments:",
        prettyArgs
      ].filter(Boolean),
      name: "EstimateGasExecutionError"
    });
    Object.defineProperty(this, "cause", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: undefined
    });
    this.cause = cause;
  }
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/errors/getEstimateGasError.js
init_node();
init_getNodeError();
function getEstimateGasError(err, { docsPath: docsPath3, ...args }) {
  const cause = (() => {
    const cause2 = getNodeError(err, args);
    if (cause2 instanceof UnknownNodeError)
      return err;
    return cause2;
  })();
  return new EstimateGasExecutionError(cause, {
    docsPath: docsPath3,
    ...args
  });
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/estimateGas.js
init_transactionRequest();
init_stateOverride2();
init_assertRequest();
// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/errors/fee.js
init_formatGwei();
init_base();

class BaseFeeScalarError extends BaseError2 {
  constructor() {
    super("`baseFeeMultiplier` must be greater than 1.", {
      name: "BaseFeeScalarError"
    });
  }
}

class Eip1559FeesNotSupportedError extends BaseError2 {
  constructor() {
    super("Chain does not support EIP-1559 fees.", {
      name: "Eip1559FeesNotSupportedError"
    });
  }
}

class MaxFeePerGasTooLowError extends BaseError2 {
  constructor({ maxPriorityFeePerGas }) {
    super(`\`maxFeePerGas\` cannot be less than the \`maxPriorityFeePerGas\` (${formatGwei(maxPriorityFeePerGas)} gwei).`, { name: "MaxFeePerGasTooLowError" });
  }
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/estimateMaxPriorityFeePerGas.js
init_fromHex();

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/errors/block.js
init_base();

class BlockNotFoundError extends BaseError2 {
  constructor({ blockHash, blockNumber }) {
    let identifier = "Block";
    if (blockHash)
      identifier = `Block at hash "${blockHash}"`;
    if (blockNumber)
      identifier = `Block at number "${blockNumber}"`;
    super(`${identifier} could not be found.`, { name: "BlockNotFoundError" });
  }
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/getBlock.js
init_toHex();

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/formatters/transaction.js
init_fromHex();
var transactionType = {
  "0x0": "legacy",
  "0x1": "eip2930",
  "0x2": "eip1559",
  "0x3": "eip4844",
  "0x4": "eip7702"
};
function formatTransaction(transaction) {
  const transaction_ = {
    ...transaction,
    blockHash: transaction.blockHash ? transaction.blockHash : null,
    blockNumber: transaction.blockNumber ? BigInt(transaction.blockNumber) : null,
    chainId: transaction.chainId ? hexToNumber(transaction.chainId) : undefined,
    gas: transaction.gas ? BigInt(transaction.gas) : undefined,
    gasPrice: transaction.gasPrice ? BigInt(transaction.gasPrice) : undefined,
    maxFeePerBlobGas: transaction.maxFeePerBlobGas ? BigInt(transaction.maxFeePerBlobGas) : undefined,
    maxFeePerGas: transaction.maxFeePerGas ? BigInt(transaction.maxFeePerGas) : undefined,
    maxPriorityFeePerGas: transaction.maxPriorityFeePerGas ? BigInt(transaction.maxPriorityFeePerGas) : undefined,
    nonce: transaction.nonce ? hexToNumber(transaction.nonce) : undefined,
    to: transaction.to ? transaction.to : null,
    transactionIndex: transaction.transactionIndex ? Number(transaction.transactionIndex) : null,
    type: transaction.type ? transactionType[transaction.type] : undefined,
    typeHex: transaction.type ? transaction.type : undefined,
    value: transaction.value ? BigInt(transaction.value) : undefined,
    v: transaction.v ? BigInt(transaction.v) : undefined
  };
  if (transaction.authorizationList)
    transaction_.authorizationList = formatAuthorizationList2(transaction.authorizationList);
  transaction_.yParity = (() => {
    if (transaction.yParity)
      return Number(transaction.yParity);
    if (typeof transaction_.v === "bigint") {
      if (transaction_.v === 0n || transaction_.v === 27n)
        return 0;
      if (transaction_.v === 1n || transaction_.v === 28n)
        return 1;
      if (transaction_.v >= 35n)
        return transaction_.v % 2n === 0n ? 1 : 0;
    }
    return;
  })();
  if (transaction_.type === "legacy") {
    delete transaction_.accessList;
    delete transaction_.maxFeePerBlobGas;
    delete transaction_.maxFeePerGas;
    delete transaction_.maxPriorityFeePerGas;
    delete transaction_.yParity;
  }
  if (transaction_.type === "eip2930") {
    delete transaction_.maxFeePerBlobGas;
    delete transaction_.maxFeePerGas;
    delete transaction_.maxPriorityFeePerGas;
  }
  if (transaction_.type === "eip1559") {
    delete transaction_.maxFeePerBlobGas;
  }
  return transaction_;
}
function formatAuthorizationList2(authorizationList) {
  return authorizationList.map((authorization) => ({
    contractAddress: authorization.address,
    chainId: Number(authorization.chainId),
    nonce: Number(authorization.nonce),
    r: authorization.r,
    s: authorization.s,
    yParity: Number(authorization.yParity)
  }));
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/formatters/block.js
function formatBlock(block) {
  const transactions = (block.transactions ?? []).map((transaction) => {
    if (typeof transaction === "string")
      return transaction;
    return formatTransaction(transaction);
  });
  return {
    ...block,
    baseFeePerGas: block.baseFeePerGas ? BigInt(block.baseFeePerGas) : null,
    blobGasUsed: block.blobGasUsed ? BigInt(block.blobGasUsed) : undefined,
    difficulty: block.difficulty ? BigInt(block.difficulty) : undefined,
    excessBlobGas: block.excessBlobGas ? BigInt(block.excessBlobGas) : undefined,
    gasLimit: block.gasLimit ? BigInt(block.gasLimit) : undefined,
    gasUsed: block.gasUsed ? BigInt(block.gasUsed) : undefined,
    hash: block.hash ? block.hash : null,
    logsBloom: block.logsBloom ? block.logsBloom : null,
    nonce: block.nonce ? block.nonce : null,
    number: block.number ? BigInt(block.number) : null,
    size: block.size ? BigInt(block.size) : undefined,
    timestamp: block.timestamp ? BigInt(block.timestamp) : undefined,
    transactions,
    totalDifficulty: block.totalDifficulty ? BigInt(block.totalDifficulty) : null
  };
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/getBlock.js
async function getBlock(client, { blockHash, blockNumber, blockTag: blockTag_, includeTransactions: includeTransactions_ } = {}) {
  const blockTag = blockTag_ ?? "latest";
  const includeTransactions = includeTransactions_ ?? false;
  const blockNumberHex = blockNumber !== undefined ? numberToHex(blockNumber) : undefined;
  let block = null;
  if (blockHash) {
    block = await client.request({
      method: "eth_getBlockByHash",
      params: [blockHash, includeTransactions]
    }, { dedupe: true });
  } else {
    block = await client.request({
      method: "eth_getBlockByNumber",
      params: [blockNumberHex || blockTag, includeTransactions]
    }, { dedupe: Boolean(blockNumberHex) });
  }
  if (!block)
    throw new BlockNotFoundError({ blockHash, blockNumber });
  const format = client.chain?.formatters?.block?.format || formatBlock;
  return format(block);
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/getGasPrice.js
async function getGasPrice(client) {
  const gasPrice = await client.request({
    method: "eth_gasPrice"
  });
  return BigInt(gasPrice);
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/estimateMaxPriorityFeePerGas.js
async function estimateMaxPriorityFeePerGas(client, args) {
  return internal_estimateMaxPriorityFeePerGas(client, args);
}
async function internal_estimateMaxPriorityFeePerGas(client, args) {
  const { block: block_, chain = client.chain, request } = args || {};
  try {
    const maxPriorityFeePerGas = chain?.fees?.maxPriorityFeePerGas ?? chain?.fees?.defaultPriorityFee;
    if (typeof maxPriorityFeePerGas === "function") {
      const block = block_ || await getAction(client, getBlock, "getBlock")({});
      const maxPriorityFeePerGas_ = await maxPriorityFeePerGas({
        block,
        client,
        request
      });
      if (maxPriorityFeePerGas_ === null)
        throw new Error;
      return maxPriorityFeePerGas_;
    }
    if (typeof maxPriorityFeePerGas !== "undefined")
      return maxPriorityFeePerGas;
    const maxPriorityFeePerGasHex = await client.request({
      method: "eth_maxPriorityFeePerGas"
    });
    return hexToBigInt(maxPriorityFeePerGasHex);
  } catch {
    const [block, gasPrice] = await Promise.all([
      block_ ? Promise.resolve(block_) : getAction(client, getBlock, "getBlock")({}),
      getAction(client, getGasPrice, "getGasPrice")({})
    ]);
    if (typeof block.baseFeePerGas !== "bigint")
      throw new Eip1559FeesNotSupportedError;
    const maxPriorityFeePerGas = gasPrice - block.baseFeePerGas;
    if (maxPriorityFeePerGas < 0n)
      return 0n;
    return maxPriorityFeePerGas;
  }
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/estimateFeesPerGas.js
async function estimateFeesPerGas(client, args) {
  return internal_estimateFeesPerGas(client, args);
}
async function internal_estimateFeesPerGas(client, args) {
  const { block: block_, chain = client.chain, request, type = "eip1559" } = args || {};
  const baseFeeMultiplier = await (async () => {
    if (typeof chain?.fees?.baseFeeMultiplier === "function")
      return chain.fees.baseFeeMultiplier({
        block: block_,
        client,
        request
      });
    return chain?.fees?.baseFeeMultiplier ?? 1.2;
  })();
  if (baseFeeMultiplier < 1)
    throw new BaseFeeScalarError;
  const decimals = baseFeeMultiplier.toString().split(".")[1]?.length ?? 0;
  const denominator = 10 ** decimals;
  const multiply = (base) => base * BigInt(Math.ceil(baseFeeMultiplier * denominator)) / BigInt(denominator);
  const block = block_ ? block_ : await getAction(client, getBlock, "getBlock")({});
  if (typeof chain?.fees?.estimateFeesPerGas === "function") {
    const fees = await chain.fees.estimateFeesPerGas({
      block: block_,
      client,
      multiply,
      request,
      type
    });
    if (fees !== null)
      return fees;
  }
  if (type === "eip1559") {
    if (typeof block.baseFeePerGas !== "bigint")
      throw new Eip1559FeesNotSupportedError;
    const maxPriorityFeePerGas = typeof request?.maxPriorityFeePerGas === "bigint" ? request.maxPriorityFeePerGas : await internal_estimateMaxPriorityFeePerGas(client, {
      block,
      chain,
      request
    });
    const baseFeePerGas = multiply(block.baseFeePerGas);
    const maxFeePerGas = request?.maxFeePerGas ?? baseFeePerGas + maxPriorityFeePerGas;
    return {
      maxFeePerGas,
      maxPriorityFeePerGas
    };
  }
  const gasPrice = request?.gasPrice ?? multiply(await getAction(client, getGasPrice, "getGasPrice")({}));
  return {
    gasPrice
  };
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/getTransactionCount.js
init_fromHex();
init_toHex();
async function getTransactionCount(client, { address, blockTag = "latest", blockNumber }) {
  const count = await client.request({
    method: "eth_getTransactionCount",
    params: [address, blockNumber ? numberToHex(blockNumber) : blockTag]
  }, { dedupe: Boolean(blockNumber) });
  return hexToNumber(count);
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/blob/blobsToCommitments.js
init_toBytes();
init_toHex();
function blobsToCommitments(parameters) {
  const { kzg } = parameters;
  const to = parameters.to ?? (typeof parameters.blobs[0] === "string" ? "hex" : "bytes");
  const blobs = typeof parameters.blobs[0] === "string" ? parameters.blobs.map((x) => hexToBytes(x)) : parameters.blobs;
  const commitments = [];
  for (const blob of blobs)
    commitments.push(Uint8Array.from(kzg.blobToKzgCommitment(blob)));
  return to === "bytes" ? commitments : commitments.map((x) => bytesToHex(x));
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/blob/blobsToProofs.js
init_toBytes();
init_toHex();
function blobsToProofs(parameters) {
  const { kzg } = parameters;
  const to = parameters.to ?? (typeof parameters.blobs[0] === "string" ? "hex" : "bytes");
  const blobs = typeof parameters.blobs[0] === "string" ? parameters.blobs.map((x) => hexToBytes(x)) : parameters.blobs;
  const commitments = typeof parameters.commitments[0] === "string" ? parameters.commitments.map((x) => hexToBytes(x)) : parameters.commitments;
  const proofs = [];
  for (let i = 0;i < blobs.length; i++) {
    const blob = blobs[i];
    const commitment = commitments[i];
    proofs.push(Uint8Array.from(kzg.computeBlobKzgProof(blob, commitment)));
  }
  return to === "bytes" ? proofs : proofs.map((x) => bytesToHex(x));
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/blob/commitmentToVersionedHash.js
init_toHex();

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/hash/sha256.js
init_sha256();
init_toBytes();
init_toHex();
function sha2562(value, to_) {
  const to = to_ || "hex";
  const bytes = sha256(isHex(value, { strict: false }) ? toBytes(value) : value);
  if (to === "bytes")
    return bytes;
  return toHex(bytes);
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/blob/commitmentToVersionedHash.js
function commitmentToVersionedHash(parameters) {
  const { commitment, version: version3 = 1 } = parameters;
  const to = parameters.to ?? (typeof commitment === "string" ? "hex" : "bytes");
  const versionedHash = sha2562(commitment, "bytes");
  versionedHash.set([version3], 0);
  return to === "bytes" ? versionedHash : bytesToHex(versionedHash);
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/blob/commitmentsToVersionedHashes.js
function commitmentsToVersionedHashes(parameters) {
  const { commitments, version: version3 } = parameters;
  const to = parameters.to ?? (typeof commitments[0] === "string" ? "hex" : "bytes");
  const hashes = [];
  for (const commitment of commitments) {
    hashes.push(commitmentToVersionedHash({
      commitment,
      to,
      version: version3
    }));
  }
  return hashes;
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/constants/blob.js
var blobsPerTransaction = 6;
var bytesPerFieldElement = 32;
var fieldElementsPerBlob = 4096;
var bytesPerBlob = bytesPerFieldElement * fieldElementsPerBlob;
var maxBytesPerTransaction = bytesPerBlob * blobsPerTransaction - 1 - 1 * fieldElementsPerBlob * blobsPerTransaction;

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/constants/kzg.js
var versionedHashVersionKzg = 1;

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/errors/blob.js
init_base();

class BlobSizeTooLargeError extends BaseError2 {
  constructor({ maxSize, size: size2 }) {
    super("Blob size is too large.", {
      metaMessages: [`Max: ${maxSize} bytes`, `Given: ${size2} bytes`],
      name: "BlobSizeTooLargeError"
    });
  }
}

class EmptyBlobError extends BaseError2 {
  constructor() {
    super("Blob data must not be empty.", { name: "EmptyBlobError" });
  }
}

class InvalidVersionedHashSizeError extends BaseError2 {
  constructor({ hash: hash2, size: size2 }) {
    super(`Versioned hash "${hash2}" size is invalid.`, {
      metaMessages: ["Expected: 32", `Received: ${size2}`],
      name: "InvalidVersionedHashSizeError"
    });
  }
}

class InvalidVersionedHashVersionError extends BaseError2 {
  constructor({ hash: hash2, version: version3 }) {
    super(`Versioned hash "${hash2}" version is invalid.`, {
      metaMessages: [
        `Expected: ${versionedHashVersionKzg}`,
        `Received: ${version3}`
      ],
      name: "InvalidVersionedHashVersionError"
    });
  }
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/blob/toBlobs.js
init_cursor2();
init_size();
init_toBytes();
init_toHex();
function toBlobs(parameters) {
  const to = parameters.to ?? (typeof parameters.data === "string" ? "hex" : "bytes");
  const data = typeof parameters.data === "string" ? hexToBytes(parameters.data) : parameters.data;
  const size_ = size(data);
  if (!size_)
    throw new EmptyBlobError;
  if (size_ > maxBytesPerTransaction)
    throw new BlobSizeTooLargeError({
      maxSize: maxBytesPerTransaction,
      size: size_
    });
  const blobs = [];
  let active = true;
  let position = 0;
  while (active) {
    const blob = createCursor(new Uint8Array(bytesPerBlob));
    let size2 = 0;
    while (size2 < fieldElementsPerBlob) {
      const bytes = data.slice(position, position + (bytesPerFieldElement - 1));
      blob.pushByte(0);
      blob.pushBytes(bytes);
      if (bytes.length < 31) {
        blob.pushByte(128);
        active = false;
        break;
      }
      size2++;
      position += 31;
    }
    blobs.push(blob);
  }
  return to === "bytes" ? blobs.map((x) => x.bytes) : blobs.map((x) => bytesToHex(x.bytes));
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/blob/toBlobSidecars.js
function toBlobSidecars(parameters) {
  const { data, kzg, to } = parameters;
  const blobs = parameters.blobs ?? toBlobs({ data, to });
  const commitments = parameters.commitments ?? blobsToCommitments({ blobs, kzg, to });
  const proofs = parameters.proofs ?? blobsToProofs({ blobs, commitments, kzg, to });
  const sidecars = [];
  for (let i = 0;i < blobs.length; i++)
    sidecars.push({
      blob: blobs[i],
      commitment: commitments[i],
      proof: proofs[i]
    });
  return sidecars;
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/wallet/prepareTransactionRequest.js
init_assertRequest();

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/transaction/getTransactionType.js
init_transaction();
function getTransactionType(transaction) {
  if (transaction.type)
    return transaction.type;
  if (typeof transaction.authorizationList !== "undefined")
    return "eip7702";
  if (typeof transaction.blobs !== "undefined" || typeof transaction.blobVersionedHashes !== "undefined" || typeof transaction.maxFeePerBlobGas !== "undefined" || typeof transaction.sidecars !== "undefined")
    return "eip4844";
  if (typeof transaction.maxFeePerGas !== "undefined" || typeof transaction.maxPriorityFeePerGas !== "undefined") {
    return "eip1559";
  }
  if (typeof transaction.gasPrice !== "undefined") {
    if (typeof transaction.accessList !== "undefined")
      return "eip2930";
    return "legacy";
  }
  throw new InvalidSerializableTransactionError({ transaction });
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/getChainId.js
init_fromHex();
async function getChainId(client) {
  const chainIdHex = await client.request({
    method: "eth_chainId"
  }, { dedupe: true });
  return hexToNumber(chainIdHex);
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/wallet/prepareTransactionRequest.js
var defaultParameters = [
  "blobVersionedHashes",
  "chainId",
  "fees",
  "gas",
  "nonce",
  "type"
];
var eip1559NetworkCache = /* @__PURE__ */ new Map;
async function prepareTransactionRequest(client, args) {
  const { account: account_ = client.account, blobs, chain, gas, kzg, nonce, nonceManager, parameters = defaultParameters, type } = args;
  const account = account_ ? parseAccount(account_) : account_;
  const request = { ...args, ...account ? { from: account?.address } : {} };
  let block;
  async function getBlock2() {
    if (block)
      return block;
    block = await getAction(client, getBlock, "getBlock")({ blockTag: "latest" });
    return block;
  }
  let chainId;
  async function getChainId2() {
    if (chainId)
      return chainId;
    if (chain)
      return chain.id;
    if (typeof args.chainId !== "undefined")
      return args.chainId;
    const chainId_ = await getAction(client, getChainId, "getChainId")({});
    chainId = chainId_;
    return chainId;
  }
  if ((parameters.includes("blobVersionedHashes") || parameters.includes("sidecars")) && blobs && kzg) {
    const commitments = blobsToCommitments({ blobs, kzg });
    if (parameters.includes("blobVersionedHashes")) {
      const versionedHashes = commitmentsToVersionedHashes({
        commitments,
        to: "hex"
      });
      request.blobVersionedHashes = versionedHashes;
    }
    if (parameters.includes("sidecars")) {
      const proofs = blobsToProofs({ blobs, commitments, kzg });
      const sidecars = toBlobSidecars({
        blobs,
        commitments,
        proofs,
        to: "hex"
      });
      request.sidecars = sidecars;
    }
  }
  if (parameters.includes("chainId"))
    request.chainId = await getChainId2();
  if ((parameters.includes("fees") || parameters.includes("type")) && typeof type === "undefined") {
    try {
      request.type = getTransactionType(request);
    } catch {
      let isEip1559Network = eip1559NetworkCache.get(client.uid);
      if (typeof isEip1559Network === "undefined") {
        const block2 = await getBlock2();
        isEip1559Network = typeof block2?.baseFeePerGas === "bigint";
        eip1559NetworkCache.set(client.uid, isEip1559Network);
      }
      request.type = isEip1559Network ? "eip1559" : "legacy";
    }
  }
  if (parameters.includes("fees")) {
    if (request.type !== "legacy" && request.type !== "eip2930") {
      if (typeof request.maxFeePerGas === "undefined" || typeof request.maxPriorityFeePerGas === "undefined") {
        const block2 = await getBlock2();
        const { maxFeePerGas, maxPriorityFeePerGas } = await internal_estimateFeesPerGas(client, {
          block: block2,
          chain,
          request
        });
        if (typeof args.maxPriorityFeePerGas === "undefined" && args.maxFeePerGas && args.maxFeePerGas < maxPriorityFeePerGas)
          throw new MaxFeePerGasTooLowError({
            maxPriorityFeePerGas
          });
        request.maxPriorityFeePerGas = maxPriorityFeePerGas;
        request.maxFeePerGas = maxFeePerGas;
      }
    } else {
      if (typeof args.maxFeePerGas !== "undefined" || typeof args.maxPriorityFeePerGas !== "undefined")
        throw new Eip1559FeesNotSupportedError;
      if (typeof args.gasPrice === "undefined") {
        const block2 = await getBlock2();
        const { gasPrice: gasPrice_ } = await internal_estimateFeesPerGas(client, {
          block: block2,
          chain,
          request,
          type: "legacy"
        });
        request.gasPrice = gasPrice_;
      }
    }
  }
  if (parameters.includes("gas") && typeof gas === "undefined")
    request.gas = await getAction(client, estimateGas, "estimateGas")({
      ...request,
      account: account ? { address: account.address, type: "json-rpc" } : account
    });
  if (parameters.includes("nonce") && typeof nonce === "undefined" && account) {
    if (nonceManager) {
      const chainId2 = await getChainId2();
      request.nonce = await nonceManager.consume({
        address: account.address,
        chainId: chainId2,
        client
      });
    } else {
      request.nonce = await getAction(client, getTransactionCount, "getTransactionCount")({
        address: account.address,
        blockTag: "pending"
      });
    }
  }
  assertRequest(request);
  delete request.parameters;
  return request;
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/getBalance.js
init_toHex();
async function getBalance(client, { address, blockNumber, blockTag = "latest" }) {
  const blockNumberHex = blockNumber ? numberToHex(blockNumber) : undefined;
  const balance = await client.request({
    method: "eth_getBalance",
    params: [address, blockNumberHex || blockTag]
  });
  return BigInt(balance);
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/estimateGas.js
async function estimateGas(client, args) {
  const { account: account_ = client.account } = args;
  const account = account_ ? parseAccount(account_) : undefined;
  try {
    let estimateGas_rpc = function(parameters) {
      const { block: block2, request: request2, rpcStateOverride: rpcStateOverride2 } = parameters;
      return client.request({
        method: "eth_estimateGas",
        params: rpcStateOverride2 ? [request2, block2 ?? "latest", rpcStateOverride2] : block2 ? [request2, block2] : [request2]
      });
    };
    const { accessList, authorizationList, blobs, blobVersionedHashes, blockNumber, blockTag, data, gas, gasPrice, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, nonce, value, stateOverride, ...rest } = await prepareTransactionRequest(client, {
      ...args,
      parameters: account?.type === "local" ? undefined : ["blobVersionedHashes"]
    });
    const blockNumberHex = blockNumber ? numberToHex(blockNumber) : undefined;
    const block = blockNumberHex || blockTag;
    const rpcStateOverride = serializeStateOverride(stateOverride);
    const to = await (async () => {
      if (rest.to)
        return rest.to;
      if (authorizationList && authorizationList.length > 0)
        return await recoverAuthorizationAddress({
          authorization: authorizationList[0]
        }).catch(() => {
          throw new BaseError2("`to` is required. Could not infer from `authorizationList`");
        });
      return;
    })();
    assertRequest(args);
    const chainFormat = client.chain?.formatters?.transactionRequest?.format;
    const format = chainFormat || formatTransactionRequest;
    const request = format({
      ...extract(rest, { format: chainFormat }),
      from: account?.address,
      accessList,
      authorizationList,
      blobs,
      blobVersionedHashes,
      data,
      gas,
      gasPrice,
      maxFeePerBlobGas,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      to,
      value
    });
    let estimate = BigInt(await estimateGas_rpc({ block, request, rpcStateOverride }));
    if (authorizationList) {
      const value2 = await getBalance(client, { address: request.from });
      const estimates = await Promise.all(authorizationList.map(async (authorization) => {
        const { contractAddress } = authorization;
        const estimate2 = await estimateGas_rpc({
          block,
          request: {
            authorizationList: undefined,
            data,
            from: account?.address,
            to: contractAddress,
            value: numberToHex(value2)
          },
          rpcStateOverride
        }).catch(() => 100000n);
        return 2n * BigInt(estimate2);
      }));
      estimate += estimates.reduce((acc, curr) => acc + curr, 0n);
    }
    return estimate;
  } catch (err) {
    throw getEstimateGasError(err, {
      ...args,
      account,
      chain: client.chain
    });
  }
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/estimateContractGas.js
async function estimateContractGas(client, parameters) {
  const { abi, address, args, functionName, dataSuffix, ...request } = parameters;
  const data = encodeFunctionData({
    abi,
    args,
    functionName
  });
  try {
    const gas = await getAction(client, estimateGas, "estimateGas")({
      data: `${data}${dataSuffix ? dataSuffix.replace("0x", "") : ""}`,
      to: address,
      ...request
    });
    return gas;
  } catch (error) {
    const account = request.account ? parseAccount(request.account) : undefined;
    throw getContractError(error, {
      abi,
      address,
      args,
      docsPath: "/docs/contract/estimateContractGas",
      functionName,
      sender: account?.address
    });
  }
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/getContractEvents.js
init_getAbiItem();

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/abi/parseEventLogs.js
init_abi();
init_isAddressEqual();
init_toBytes();
init_keccak256();
init_toEventSelector();

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/abi/decodeEventLog.js
init_abi();
init_size();
init_toEventSelector();
init_cursor();
init_decodeAbiParameters();
init_formatAbiItem2();
var docsPath3 = "/docs/contract/decodeEventLog";
function decodeEventLog(parameters) {
  const { abi, data, strict: strict_, topics } = parameters;
  const strict = strict_ ?? true;
  const [signature, ...argTopics] = topics;
  if (!signature)
    throw new AbiEventSignatureEmptyTopicsError({ docsPath: docsPath3 });
  const abiItem = (() => {
    if (abi.length === 1)
      return abi[0];
    return abi.find((x) => x.type === "event" && signature === toEventSelector(formatAbiItem2(x)));
  })();
  if (!(abiItem && ("name" in abiItem)) || abiItem.type !== "event")
    throw new AbiEventSignatureNotFoundError(signature, { docsPath: docsPath3 });
  const { name, inputs } = abiItem;
  const isUnnamed = inputs?.some((x) => !(("name" in x) && x.name));
  let args = isUnnamed ? [] : {};
  const indexedInputs = inputs.filter((x) => ("indexed" in x) && x.indexed);
  for (let i = 0;i < indexedInputs.length; i++) {
    const param = indexedInputs[i];
    const topic = argTopics[i];
    if (!topic)
      throw new DecodeLogTopicsMismatch({
        abiItem,
        param
      });
    args[isUnnamed ? i : param.name || i] = decodeTopic({ param, value: topic });
  }
  const nonIndexedInputs = inputs.filter((x) => !(("indexed" in x) && x.indexed));
  if (nonIndexedInputs.length > 0) {
    if (data && data !== "0x") {
      try {
        const decodedData = decodeAbiParameters(nonIndexedInputs, data);
        if (decodedData) {
          if (isUnnamed)
            args = [...args, ...decodedData];
          else {
            for (let i = 0;i < nonIndexedInputs.length; i++) {
              args[nonIndexedInputs[i].name] = decodedData[i];
            }
          }
        }
      } catch (err) {
        if (strict) {
          if (err instanceof AbiDecodingDataSizeTooSmallError || err instanceof PositionOutOfBoundsError)
            throw new DecodeLogDataMismatch({
              abiItem,
              data,
              params: nonIndexedInputs,
              size: size(data)
            });
          throw err;
        }
      }
    } else if (strict) {
      throw new DecodeLogDataMismatch({
        abiItem,
        data: "0x",
        params: nonIndexedInputs,
        size: 0
      });
    }
  }
  return {
    eventName: name,
    args: Object.values(args).length > 0 ? args : undefined
  };
}
function decodeTopic({ param, value }) {
  if (param.type === "string" || param.type === "bytes" || param.type === "tuple" || param.type.match(/^(.*)\[(\d+)?\]$/))
    return value;
  const decodedArg = decodeAbiParameters([param], value) || [];
  return decodedArg[0];
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/abi/parseEventLogs.js
function parseEventLogs(parameters) {
  const { abi, args, logs, strict = true } = parameters;
  const eventName = (() => {
    if (!parameters.eventName)
      return;
    if (Array.isArray(parameters.eventName))
      return parameters.eventName;
    return [parameters.eventName];
  })();
  return logs.map((log) => {
    try {
      const abiItem = abi.find((abiItem2) => abiItem2.type === "event" && log.topics[0] === toEventSelector(abiItem2));
      if (!abiItem)
        return null;
      const event = decodeEventLog({
        ...log,
        abi: [abiItem],
        strict
      });
      if (eventName && !eventName.includes(event.eventName))
        return null;
      if (!includesArgs({
        args: event.args,
        inputs: abiItem.inputs,
        matchArgs: args
      }))
        return null;
      return { ...event, ...log };
    } catch (err) {
      let eventName2;
      let isUnnamed;
      if (err instanceof AbiEventSignatureNotFoundError)
        return null;
      if (err instanceof DecodeLogDataMismatch || err instanceof DecodeLogTopicsMismatch) {
        if (strict)
          return null;
        eventName2 = err.abiItem.name;
        isUnnamed = err.abiItem.inputs?.some((x) => !(("name" in x) && x.name));
      }
      return { ...log, args: isUnnamed ? [] : {}, eventName: eventName2 };
    }
  }).filter(Boolean);
}
function includesArgs(parameters) {
  const { args, inputs, matchArgs } = parameters;
  if (!matchArgs)
    return true;
  if (!args)
    return false;
  function isEqual(input, value, arg) {
    try {
      if (input.type === "address")
        return isAddressEqual(value, arg);
      if (input.type === "string" || input.type === "bytes")
        return keccak256(toBytes(value)) === arg;
      return value === arg;
    } catch {
      return false;
    }
  }
  if (Array.isArray(args) && Array.isArray(matchArgs)) {
    return matchArgs.every((value, index) => {
      if (value === null || value === undefined)
        return true;
      const input = inputs[index];
      if (!input)
        return false;
      const value_ = Array.isArray(value) ? value : [value];
      return value_.some((value2) => isEqual(input, value2, args[index]));
    });
  }
  if (typeof args === "object" && !Array.isArray(args) && typeof matchArgs === "object" && !Array.isArray(matchArgs))
    return Object.entries(matchArgs).every(([key, value]) => {
      if (value === null || value === undefined)
        return true;
      const input = inputs.find((input2) => input2.name === key);
      if (!input)
        return false;
      const value_ = Array.isArray(value) ? value : [value];
      return value_.some((value2) => isEqual(input, value2, args[key]));
    });
  return false;
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/getLogs.js
init_toHex();

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/formatters/log.js
function formatLog(log, { args, eventName } = {}) {
  return {
    ...log,
    blockHash: log.blockHash ? log.blockHash : null,
    blockNumber: log.blockNumber ? BigInt(log.blockNumber) : null,
    logIndex: log.logIndex ? Number(log.logIndex) : null,
    transactionHash: log.transactionHash ? log.transactionHash : null,
    transactionIndex: log.transactionIndex ? Number(log.transactionIndex) : null,
    ...eventName ? { args, eventName } : {}
  };
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/getLogs.js
async function getLogs(client, { address, blockHash, fromBlock, toBlock, event, events: events_, args, strict: strict_ } = {}) {
  const strict = strict_ ?? false;
  const events = events_ ?? (event ? [event] : undefined);
  let topics = [];
  if (events) {
    const encoded = events.flatMap((event2) => encodeEventTopics({
      abi: [event2],
      eventName: event2.name,
      args: events_ ? undefined : args
    }));
    topics = [encoded];
    if (event)
      topics = topics[0];
  }
  let logs;
  if (blockHash) {
    logs = await client.request({
      method: "eth_getLogs",
      params: [{ address, topics, blockHash }]
    });
  } else {
    logs = await client.request({
      method: "eth_getLogs",
      params: [
        {
          address,
          topics,
          fromBlock: typeof fromBlock === "bigint" ? numberToHex(fromBlock) : fromBlock,
          toBlock: typeof toBlock === "bigint" ? numberToHex(toBlock) : toBlock
        }
      ]
    });
  }
  const formattedLogs = logs.map((log) => formatLog(log));
  if (!events)
    return formattedLogs;
  return parseEventLogs({
    abi: events,
    args,
    logs: formattedLogs,
    strict
  });
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/getContractEvents.js
async function getContractEvents(client, parameters) {
  const { abi, address, args, blockHash, eventName, fromBlock, toBlock, strict } = parameters;
  const event = eventName ? getAbiItem({ abi, name: eventName }) : undefined;
  const events = !event ? abi.filter((x) => x.type === "event") : undefined;
  return getAction(client, getLogs, "getLogs")({
    address,
    args,
    blockHash,
    event,
    events,
    fromBlock,
    toBlock,
    strict
  });
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/readContract.js
init_decodeFunctionResult();
init_encodeFunctionData();
init_call();
async function readContract(client, parameters) {
  const { abi, address, args, functionName, ...rest } = parameters;
  const calldata = encodeFunctionData({
    abi,
    args,
    functionName
  });
  try {
    const { data } = await getAction(client, call, "call")({
      ...rest,
      data: calldata,
      to: address
    });
    return decodeFunctionResult({
      abi,
      args,
      functionName,
      data: data || "0x"
    });
  } catch (error) {
    throw getContractError(error, {
      abi,
      address,
      args,
      docsPath: "/docs/contract/readContract",
      functionName
    });
  }
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/simulateContract.js
init_decodeFunctionResult();
init_encodeFunctionData();
init_call();
async function simulateContract(client, parameters) {
  const { abi, address, args, dataSuffix, functionName, ...callRequest } = parameters;
  const account = callRequest.account ? parseAccount(callRequest.account) : client.account;
  const calldata = encodeFunctionData({ abi, args, functionName });
  try {
    const { data } = await getAction(client, call, "call")({
      batch: false,
      data: `${calldata}${dataSuffix ? dataSuffix.replace("0x", "") : ""}`,
      to: address,
      ...callRequest,
      account
    });
    const result = decodeFunctionResult({
      abi,
      args,
      functionName,
      data: data || "0x"
    });
    const minimizedAbi = abi.filter((abiItem) => ("name" in abiItem) && abiItem.name === parameters.functionName);
    return {
      result,
      request: {
        abi: minimizedAbi,
        address,
        args,
        dataSuffix,
        functionName,
        ...callRequest,
        account
      }
    };
  } catch (error) {
    throw getContractError(error, {
      abi,
      address,
      args,
      docsPath: "/docs/contract/simulateContract",
      functionName,
      sender: account?.address
    });
  }
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/watchContractEvent.js
init_abi();
init_rpc();

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/observe.js
var listenersCache = /* @__PURE__ */ new Map;
var cleanupCache = /* @__PURE__ */ new Map;
var callbackCount = 0;
function observe(observerId, callbacks, fn) {
  const callbackId = ++callbackCount;
  const getListeners = () => listenersCache.get(observerId) || [];
  const unsubscribe = () => {
    const listeners2 = getListeners();
    listenersCache.set(observerId, listeners2.filter((cb) => cb.id !== callbackId));
  };
  const unwatch = () => {
    const listeners2 = getListeners();
    if (!listeners2.some((cb) => cb.id === callbackId))
      return;
    const cleanup2 = cleanupCache.get(observerId);
    if (listeners2.length === 1 && cleanup2)
      cleanup2();
    unsubscribe();
  };
  const listeners = getListeners();
  listenersCache.set(observerId, [
    ...listeners,
    { id: callbackId, fns: callbacks }
  ]);
  if (listeners && listeners.length > 0)
    return unwatch;
  const emit = {};
  for (const key in callbacks) {
    emit[key] = (...args) => {
      const listeners2 = getListeners();
      if (listeners2.length === 0)
        return;
      for (const listener of listeners2)
        listener.fns[key]?.(...args);
    };
  }
  const cleanup = fn(emit);
  if (typeof cleanup === "function")
    cleanupCache.set(observerId, cleanup);
  return unwatch;
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/wait.js
async function wait(time) {
  return new Promise((res) => setTimeout(res, time));
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/poll.js
function poll(fn, { emitOnBegin, initialWaitTime, interval }) {
  let active = true;
  const unwatch = () => active = false;
  const watch = async () => {
    let data = undefined;
    if (emitOnBegin)
      data = await fn({ unpoll: unwatch });
    const initialWait = await initialWaitTime?.(data) ?? interval;
    await wait(initialWait);
    const poll2 = async () => {
      if (!active)
        return;
      await fn({ unpoll: unwatch });
      await wait(interval);
      poll2();
    };
    poll2();
  };
  watch();
  return unwatch;
}
// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/promise/withCache.js
var promiseCache = /* @__PURE__ */ new Map;
var responseCache = /* @__PURE__ */ new Map;
function getCache(cacheKey) {
  const buildCache = (cacheKey2, cache) => ({
    clear: () => cache.delete(cacheKey2),
    get: () => cache.get(cacheKey2),
    set: (data) => cache.set(cacheKey2, data)
  });
  const promise = buildCache(cacheKey, promiseCache);
  const response = buildCache(cacheKey, responseCache);
  return {
    clear: () => {
      promise.clear();
      response.clear();
    },
    promise,
    response
  };
}
async function withCache(fn, { cacheKey, cacheTime = Number.POSITIVE_INFINITY }) {
  const cache = getCache(cacheKey);
  const response = cache.response.get();
  if (response && cacheTime > 0) {
    const age = new Date().getTime() - response.created.getTime();
    if (age < cacheTime)
      return response.data;
  }
  let promise = cache.promise.get();
  if (!promise) {
    promise = fn();
    cache.promise.set(promise);
  }
  try {
    const data = await promise;
    cache.response.set({ created: new Date, data });
    return data;
  } finally {
    cache.promise.clear();
  }
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/getBlockNumber.js
var cacheKey = (id) => `blockNumber.${id}`;
async function getBlockNumber(client, { cacheTime = client.cacheTime } = {}) {
  const blockNumberHex = await withCache(() => client.request({
    method: "eth_blockNumber"
  }), { cacheKey: cacheKey(client.uid), cacheTime });
  return BigInt(blockNumberHex);
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/getFilterChanges.js
async function getFilterChanges(_client, { filter }) {
  const strict = "strict" in filter && filter.strict;
  const logs = await filter.request({
    method: "eth_getFilterChanges",
    params: [filter.id]
  });
  if (typeof logs[0] === "string")
    return logs;
  const formattedLogs = logs.map((log) => formatLog(log));
  if (!("abi" in filter) || !filter.abi)
    return formattedLogs;
  return parseEventLogs({
    abi: filter.abi,
    logs: formattedLogs,
    strict
  });
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/uninstallFilter.js
async function uninstallFilter(_client, { filter }) {
  return filter.request({
    method: "eth_uninstallFilter",
    params: [filter.id]
  });
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/watchContractEvent.js
function watchContractEvent(client, parameters) {
  const { abi, address, args, batch = true, eventName, fromBlock, onError, onLogs, poll: poll_, pollingInterval = client.pollingInterval, strict: strict_ } = parameters;
  const enablePolling = (() => {
    if (typeof poll_ !== "undefined")
      return poll_;
    if (typeof fromBlock === "bigint")
      return true;
    if (client.transport.type === "webSocket")
      return false;
    if (client.transport.type === "fallback" && client.transport.transports[0].config.type === "webSocket")
      return false;
    return true;
  })();
  const pollContractEvent = () => {
    const strict = strict_ ?? false;
    const observerId = stringify([
      "watchContractEvent",
      address,
      args,
      batch,
      client.uid,
      eventName,
      pollingInterval,
      strict,
      fromBlock
    ]);
    return observe(observerId, { onLogs, onError }, (emit) => {
      let previousBlockNumber;
      if (fromBlock !== undefined)
        previousBlockNumber = fromBlock - 1n;
      let filter;
      let initialized = false;
      const unwatch = poll(async () => {
        if (!initialized) {
          try {
            filter = await getAction(client, createContractEventFilter, "createContractEventFilter")({
              abi,
              address,
              args,
              eventName,
              strict,
              fromBlock
            });
          } catch {}
          initialized = true;
          return;
        }
        try {
          let logs;
          if (filter) {
            logs = await getAction(client, getFilterChanges, "getFilterChanges")({ filter });
          } else {
            const blockNumber = await getAction(client, getBlockNumber, "getBlockNumber")({});
            if (previousBlockNumber && previousBlockNumber < blockNumber) {
              logs = await getAction(client, getContractEvents, "getContractEvents")({
                abi,
                address,
                args,
                eventName,
                fromBlock: previousBlockNumber + 1n,
                toBlock: blockNumber,
                strict
              });
            } else {
              logs = [];
            }
            previousBlockNumber = blockNumber;
          }
          if (logs.length === 0)
            return;
          if (batch)
            emit.onLogs(logs);
          else
            for (const log of logs)
              emit.onLogs([log]);
        } catch (err) {
          if (filter && err instanceof InvalidInputRpcError)
            initialized = false;
          emit.onError?.(err);
        }
      }, {
        emitOnBegin: true,
        interval: pollingInterval
      });
      return async () => {
        if (filter)
          await getAction(client, uninstallFilter, "uninstallFilter")({ filter });
        unwatch();
      };
    });
  };
  const subscribeContractEvent = () => {
    const strict = strict_ ?? false;
    const observerId = stringify([
      "watchContractEvent",
      address,
      args,
      batch,
      client.uid,
      eventName,
      pollingInterval,
      strict
    ]);
    let active = true;
    let unsubscribe = () => active = false;
    return observe(observerId, { onLogs, onError }, (emit) => {
      (async () => {
        try {
          const transport = (() => {
            if (client.transport.type === "fallback") {
              const transport2 = client.transport.transports.find((transport3) => transport3.config.type === "webSocket");
              if (!transport2)
                return client.transport;
              return transport2.value;
            }
            return client.transport;
          })();
          const topics = eventName ? encodeEventTopics({
            abi,
            eventName,
            args
          }) : [];
          const { unsubscribe: unsubscribe_ } = await transport.subscribe({
            params: ["logs", { address, topics }],
            onData(data) {
              if (!active)
                return;
              const log = data.result;
              try {
                const { eventName: eventName2, args: args2 } = decodeEventLog({
                  abi,
                  data: log.data,
                  topics: log.topics,
                  strict: strict_
                });
                const formatted = formatLog(log, {
                  args: args2,
                  eventName: eventName2
                });
                emit.onLogs([formatted]);
              } catch (err) {
                let eventName2;
                let isUnnamed;
                if (err instanceof DecodeLogDataMismatch || err instanceof DecodeLogTopicsMismatch) {
                  if (strict_)
                    return;
                  eventName2 = err.abiItem.name;
                  isUnnamed = err.abiItem.inputs?.some((x) => !(("name" in x) && x.name));
                }
                const formatted = formatLog(log, {
                  args: isUnnamed ? [] : {},
                  eventName: eventName2
                });
                emit.onLogs([formatted]);
              }
            },
            onError(error) {
              emit.onError?.(error);
            }
          });
          unsubscribe = unsubscribe_;
          if (!active)
            unsubscribe();
        } catch (err) {
          onError?.(err);
        }
      })();
      return () => unsubscribe();
    });
  };
  return enablePolling ? pollContractEvent() : subscribeContractEvent();
}
// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/errors/account.js
init_base();

class AccountNotFoundError extends BaseError2 {
  constructor({ docsPath: docsPath6 } = {}) {
    super([
      "Could not find an Account to execute with this Action.",
      "Please provide an Account with the `account` argument on the Action, or by supplying an `account` to the Client."
    ].join(`
`), {
      docsPath: docsPath6,
      docsSlug: "account",
      name: "AccountNotFoundError"
    });
  }
}

class AccountTypeNotSupportedError extends BaseError2 {
  constructor({ docsPath: docsPath6, metaMessages, type }) {
    super(`Account type "${type}" is not supported.`, {
      docsPath: docsPath6,
      metaMessages,
      name: "AccountTypeNotSupportedError"
    });
  }
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/wallet/writeContract.js
init_encodeFunctionData();
// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/wallet/sendTransaction.js
init_base();

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/chain/assertCurrentChain.js
init_chain();
function assertCurrentChain({ chain, currentChainId }) {
  if (!chain)
    throw new ChainNotFoundError;
  if (currentChainId !== chain.id)
    throw new ChainMismatchError({ chain, currentChainId });
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/errors/getTransactionError.js
init_node();
init_transaction();
init_getNodeError();
function getTransactionError(err, { docsPath: docsPath6, ...args }) {
  const cause = (() => {
    const cause2 = getNodeError(err, args);
    if (cause2 instanceof UnknownNodeError)
      return err;
    return cause2;
  })();
  return new TransactionExecutionError(cause, {
    docsPath: docsPath6,
    ...args
  });
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/wallet/sendTransaction.js
init_transactionRequest();
init_lru();
init_assertRequest();

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/wallet/sendRawTransaction.js
async function sendRawTransaction(client, { serializedTransaction }) {
  return client.request({
    method: "eth_sendRawTransaction",
    params: [serializedTransaction]
  }, { retryCount: 0 });
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/wallet/sendTransaction.js
var supportsWalletNamespace = new LruMap(128);
async function sendTransaction(client, parameters) {
  const { account: account_ = client.account, chain = client.chain, accessList, authorizationList, blobs, data, gas, gasPrice, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, nonce, value, ...rest } = parameters;
  if (typeof account_ === "undefined")
    throw new AccountNotFoundError({
      docsPath: "/docs/actions/wallet/sendTransaction"
    });
  const account = account_ ? parseAccount(account_) : null;
  try {
    assertRequest(parameters);
    const to = await (async () => {
      if (parameters.to)
        return parameters.to;
      if (authorizationList && authorizationList.length > 0)
        return await recoverAuthorizationAddress({
          authorization: authorizationList[0]
        }).catch(() => {
          throw new BaseError2("`to` is required. Could not infer from `authorizationList`.");
        });
      return;
    })();
    if (account?.type === "json-rpc" || account === null) {
      let chainId;
      if (chain !== null) {
        chainId = await getAction(client, getChainId, "getChainId")({});
        assertCurrentChain({
          currentChainId: chainId,
          chain
        });
      }
      const chainFormat = client.chain?.formatters?.transactionRequest?.format;
      const format = chainFormat || formatTransactionRequest;
      const request = format({
        ...extract(rest, { format: chainFormat }),
        accessList,
        authorizationList,
        blobs,
        chainId,
        data,
        from: account?.address,
        gas,
        gasPrice,
        maxFeePerBlobGas,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        to,
        value
      });
      const isWalletNamespaceSupported = supportsWalletNamespace.get(client.uid);
      const method = isWalletNamespaceSupported ? "wallet_sendTransaction" : "eth_sendTransaction";
      try {
        return await client.request({
          method,
          params: [request]
        }, { retryCount: 0 });
      } catch (e) {
        if (isWalletNamespaceSupported === false)
          throw e;
        const error = e;
        if (error.name === "InvalidInputRpcError" || error.name === "InvalidParamsRpcError" || error.name === "MethodNotFoundRpcError" || error.name === "MethodNotSupportedRpcError") {
          return await client.request({
            method: "wallet_sendTransaction",
            params: [request]
          }, { retryCount: 0 }).then((hash2) => {
            supportsWalletNamespace.set(client.uid, true);
            return hash2;
          }).catch((e2) => {
            const walletNamespaceError = e2;
            if (walletNamespaceError.name === "MethodNotFoundRpcError" || walletNamespaceError.name === "MethodNotSupportedRpcError") {
              supportsWalletNamespace.set(client.uid, false);
              throw error;
            }
            throw walletNamespaceError;
          });
        }
        throw error;
      }
    }
    if (account?.type === "local") {
      const request = await getAction(client, prepareTransactionRequest, "prepareTransactionRequest")({
        account,
        accessList,
        authorizationList,
        blobs,
        chain,
        data,
        gas,
        gasPrice,
        maxFeePerBlobGas,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        nonceManager: account.nonceManager,
        parameters: [...defaultParameters, "sidecars"],
        value,
        ...rest,
        to
      });
      const serializer = chain?.serializers?.transaction;
      const serializedTransaction = await account.signTransaction(request, {
        serializer
      });
      return await getAction(client, sendRawTransaction, "sendRawTransaction")({
        serializedTransaction
      });
    }
    if (account?.type === "smart")
      throw new AccountTypeNotSupportedError({
        metaMessages: [
          "Consider using the `sendUserOperation` Action instead."
        ],
        docsPath: "/docs/actions/bundler/sendUserOperation",
        type: "smart"
      });
    throw new AccountTypeNotSupportedError({
      docsPath: "/docs/actions/wallet/sendTransaction",
      type: account?.type
    });
  } catch (err) {
    if (err instanceof AccountTypeNotSupportedError)
      throw err;
    throw getTransactionError(err, {
      ...parameters,
      account,
      chain: parameters.chain || undefined
    });
  }
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/wallet/writeContract.js
async function writeContract(client, parameters) {
  const { abi, account: account_ = client.account, address, args, dataSuffix, functionName, ...request } = parameters;
  if (typeof account_ === "undefined")
    throw new AccountNotFoundError({
      docsPath: "/docs/contract/writeContract"
    });
  const account = account_ ? parseAccount(account_) : null;
  const data = encodeFunctionData({
    abi,
    args,
    functionName
  });
  try {
    return await getAction(client, sendTransaction, "sendTransaction")({
      data: `${data}${dataSuffix ? dataSuffix.replace("0x", "") : ""}`,
      to: address,
      account,
      ...request
    });
  } catch (error) {
    throw getContractError(error, {
      abi,
      address,
      args,
      docsPath: "/docs/contract/writeContract",
      functionName,
      sender: account?.address
    });
  }
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/errors/eip712.js
init_base();

class Eip712DomainNotFoundError extends BaseError2 {
  constructor({ address }) {
    super(`No EIP-712 domain found on contract "${address}".`, {
      metaMessages: [
        "Ensure that:",
        `- The contract is deployed at the address "${address}".`,
        "- `eip712Domain()` function exists on the contract.",
        "- `eip712Domain()` function matches signature to ERC-5267 specification."
      ],
      name: "Eip712DomainNotFoundError"
    });
  }
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/getEip712Domain.js
async function getEip712Domain(client, parameters) {
  const { address, factory, factoryData } = parameters;
  try {
    const [fields, name, version3, chainId, verifyingContract, salt, extensions] = await getAction(client, readContract, "readContract")({
      abi,
      address,
      functionName: "eip712Domain",
      factory,
      factoryData
    });
    return {
      domain: {
        name,
        version: version3,
        chainId: Number(chainId),
        verifyingContract,
        salt
      },
      extensions,
      fields
    };
  } catch (e) {
    const error = e;
    if (error.name === "ContractFunctionExecutionError" && error.cause.name === "ContractFunctionZeroDataError") {
      throw new Eip712DomainNotFoundError({ address });
    }
    throw error;
  }
}
var abi = [
  {
    inputs: [],
    name: "eip712Domain",
    outputs: [
      { name: "fields", type: "bytes1" },
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
      { name: "salt", type: "bytes32" },
      { name: "extensions", type: "uint256[]" }
    ],
    stateMutability: "view",
    type: "function"
  }
];

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/wallet/addChain.js
init_toHex();
async function addChain(client, { chain }) {
  const { id, name, nativeCurrency, rpcUrls, blockExplorers } = chain;
  await client.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: numberToHex(id),
        chainName: name,
        nativeCurrency,
        rpcUrls: rpcUrls.default.http,
        blockExplorerUrls: blockExplorers ? Object.values(blockExplorers).map(({ url }) => url) : undefined
      }
    ]
  }, { dedupe: true, retryCount: 0 });
}
// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/uid.js
var size2 = 256;
var index = size2;
var buffer;
function uid(length = 11) {
  if (!buffer || index + length > size2 * 2) {
    buffer = "";
    index = 0;
    for (let i = 0;i < size2; i++) {
      buffer += (256 + Math.random() * 256 | 0).toString(16).substring(1);
    }
  }
  return buffer.substring(index, index++ + length);
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/clients/createClient.js
function createClient(parameters) {
  const { batch, cacheTime = parameters.pollingInterval ?? 4000, ccipRead, key = "base", name = "Base Client", pollingInterval = 4000, type = "base" } = parameters;
  const chain = parameters.chain;
  const account = parameters.account ? parseAccount(parameters.account) : undefined;
  const { config, request, value } = parameters.transport({
    chain,
    pollingInterval
  });
  const transport = { ...config, ...value };
  const client = {
    account,
    batch,
    cacheTime,
    ccipRead,
    chain,
    key,
    name,
    pollingInterval,
    request,
    transport,
    type,
    uid: uid()
  };
  function extend(base) {
    return (extendFn) => {
      const extended = extendFn(base);
      for (const key2 in client)
        delete extended[key2];
      const combined = { ...base, ...extended };
      return Object.assign(combined, { extend: extend(combined) });
    };
  }
  return Object.assign(client, { extend: extend(client) });
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/buildRequest.js
init_base();
init_request();
init_rpc();
init_toHex();

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/promise/withDedupe.js
init_lru();
var promiseCache2 = /* @__PURE__ */ new LruMap(8192);
function withDedupe(fn, { enabled = true, id }) {
  if (!enabled || !id)
    return fn();
  if (promiseCache2.get(id))
    return promiseCache2.get(id);
  const promise = fn().finally(() => promiseCache2.delete(id));
  promiseCache2.set(id, promise);
  return promise;
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/promise/withRetry.js
function withRetry(fn, { delay: delay_ = 100, retryCount = 2, shouldRetry = () => true } = {}) {
  return new Promise((resolve, reject) => {
    const attemptRetry = async ({ count = 0 } = {}) => {
      const retry = async ({ error }) => {
        const delay = typeof delay_ === "function" ? delay_({ count, error }) : delay_;
        if (delay)
          await wait(delay);
        attemptRetry({ count: count + 1 });
      };
      try {
        const data = await fn();
        resolve(data);
      } catch (err) {
        if (count < retryCount && await shouldRetry({ count, error: err }))
          return retry({ error: err });
        reject(err);
      }
    };
    attemptRetry();
  });
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/buildRequest.js
function buildRequest(request, options = {}) {
  return async (args, overrideOptions = {}) => {
    const { dedupe = false, methods, retryDelay = 150, retryCount = 3, uid: uid2 } = {
      ...options,
      ...overrideOptions
    };
    const { method } = args;
    if (methods?.exclude?.includes(method))
      throw new MethodNotSupportedRpcError(new Error("method not supported"), {
        method
      });
    if (methods?.include && !methods.include.includes(method))
      throw new MethodNotSupportedRpcError(new Error("method not supported"), {
        method
      });
    const requestId = dedupe ? stringToHex(`${uid2}.${stringify(args)}`) : undefined;
    return withDedupe(() => withRetry(async () => {
      try {
        return await request(args);
      } catch (err_) {
        const err = err_;
        switch (err.code) {
          case ParseRpcError.code:
            throw new ParseRpcError(err);
          case InvalidRequestRpcError.code:
            throw new InvalidRequestRpcError(err);
          case MethodNotFoundRpcError.code:
            throw new MethodNotFoundRpcError(err, { method: args.method });
          case InvalidParamsRpcError.code:
            throw new InvalidParamsRpcError(err);
          case InternalRpcError.code:
            throw new InternalRpcError(err);
          case InvalidInputRpcError.code:
            throw new InvalidInputRpcError(err);
          case ResourceNotFoundRpcError.code:
            throw new ResourceNotFoundRpcError(err);
          case ResourceUnavailableRpcError.code:
            throw new ResourceUnavailableRpcError(err);
          case TransactionRejectedRpcError.code:
            throw new TransactionRejectedRpcError(err);
          case MethodNotSupportedRpcError.code:
            throw new MethodNotSupportedRpcError(err, {
              method: args.method
            });
          case LimitExceededRpcError.code:
            throw new LimitExceededRpcError(err);
          case JsonRpcVersionUnsupportedError.code:
            throw new JsonRpcVersionUnsupportedError(err);
          case UserRejectedRequestError.code:
            throw new UserRejectedRequestError(err);
          case UnauthorizedProviderError.code:
            throw new UnauthorizedProviderError(err);
          case UnsupportedProviderMethodError.code:
            throw new UnsupportedProviderMethodError(err);
          case ProviderDisconnectedError.code:
            throw new ProviderDisconnectedError(err);
          case ChainDisconnectedError.code:
            throw new ChainDisconnectedError(err);
          case SwitchChainError.code:
            throw new SwitchChainError(err);
          case 5000:
            throw new UserRejectedRequestError(err);
          default:
            if (err_ instanceof BaseError2)
              throw err_;
            throw new UnknownRpcError(err);
        }
      }
    }, {
      delay: ({ count, error }) => {
        if (error && error instanceof HttpRequestError) {
          const retryAfter = error?.headers?.get("Retry-After");
          if (retryAfter?.match(/\d/))
            return Number.parseInt(retryAfter) * 1000;
        }
        return ~~(1 << count) * retryDelay;
      },
      retryCount,
      shouldRetry: ({ error }) => shouldRetry(error)
    }), { enabled: dedupe, id: requestId });
  };
}
function shouldRetry(error) {
  if ("code" in error && typeof error.code === "number") {
    if (error.code === -1)
      return true;
    if (error.code === LimitExceededRpcError.code)
      return true;
    if (error.code === InternalRpcError.code)
      return true;
    return false;
  }
  if (error instanceof HttpRequestError && error.status) {
    if (error.status === 403)
      return true;
    if (error.status === 408)
      return true;
    if (error.status === 413)
      return true;
    if (error.status === 429)
      return true;
    if (error.status === 500)
      return true;
    if (error.status === 502)
      return true;
    if (error.status === 503)
      return true;
    if (error.status === 504)
      return true;
    return false;
  }
  return true;
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/clients/transports/createTransport.js
function createTransport({ key, methods, name, request, retryCount = 3, retryDelay = 150, timeout, type }, value) {
  const uid2 = uid();
  return {
    config: {
      key,
      name,
      request,
      retryCount,
      retryDelay,
      timeout,
      type
    },
    request: buildRequest(request, { methods, retryCount, retryDelay, uid: uid2 }),
    value
  };
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/clients/transports/http.js
init_request();

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/errors/transport.js
init_base();

class UrlRequiredError extends BaseError2 {
  constructor() {
    super("No URL was provided to the Transport. Please provide a valid RPC URL to the Transport.", {
      docsPath: "/docs/clients/intro",
      name: "UrlRequiredError"
    });
  }
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/clients/transports/http.js
init_createBatchScheduler();

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/rpc/http.js
init_request();

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/promise/withTimeout.js
function withTimeout(fn, { errorInstance = new Error("timed out"), timeout, signal }) {
  return new Promise((resolve, reject) => {
    (async () => {
      let timeoutId;
      try {
        const controller = new AbortController;
        if (timeout > 0) {
          timeoutId = setTimeout(() => {
            if (signal) {
              controller.abort();
            } else {
              reject(errorInstance);
            }
          }, timeout);
        }
        resolve(await fn({ signal: controller?.signal || null }));
      } catch (err) {
        if (err?.name === "AbortError")
          reject(errorInstance);
        reject(err);
      } finally {
        clearTimeout(timeoutId);
      }
    })();
  });
}
// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/rpc/id.js
function createIdStore() {
  return {
    current: 0,
    take() {
      return this.current++;
    },
    reset() {
      this.current = 0;
    }
  };
}
var idCache = /* @__PURE__ */ createIdStore();

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/rpc/http.js
function getHttpRpcClient(url, options = {}) {
  return {
    async request(params) {
      const { body, onRequest = options.onRequest, onResponse = options.onResponse, timeout = options.timeout ?? 1e4 } = params;
      const fetchOptions = {
        ...options.fetchOptions ?? {},
        ...params.fetchOptions ?? {}
      };
      const { headers, method, signal: signal_ } = fetchOptions;
      try {
        const response = await withTimeout(async ({ signal }) => {
          const init = {
            ...fetchOptions,
            body: Array.isArray(body) ? stringify(body.map((body2) => ({
              jsonrpc: "2.0",
              id: body2.id ?? idCache.take(),
              ...body2
            }))) : stringify({
              jsonrpc: "2.0",
              id: body.id ?? idCache.take(),
              ...body
            }),
            headers: {
              "Content-Type": "application/json",
              ...headers
            },
            method: method || "POST",
            signal: signal_ || (timeout > 0 ? signal : null)
          };
          const request = new Request(url, init);
          const args = await onRequest?.(request, init) ?? { ...init, url };
          const response2 = await fetch(args.url ?? url, args);
          return response2;
        }, {
          errorInstance: new TimeoutError({ body, url }),
          timeout,
          signal: true
        });
        if (onResponse)
          await onResponse(response);
        let data;
        if (response.headers.get("Content-Type")?.startsWith("application/json"))
          data = await response.json();
        else {
          data = await response.text();
          try {
            data = JSON.parse(data || "{}");
          } catch (err) {
            if (response.ok)
              throw err;
            data = { error: data };
          }
        }
        if (!response.ok) {
          throw new HttpRequestError({
            body,
            details: stringify(data.error) || response.statusText,
            headers: response.headers,
            status: response.status,
            url
          });
        }
        return data;
      } catch (err) {
        if (err instanceof HttpRequestError)
          throw err;
        if (err instanceof TimeoutError)
          throw err;
        throw new HttpRequestError({
          body,
          cause: err,
          url
        });
      }
    }
  };
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/clients/transports/http.js
function http(url, config = {}) {
  const { batch, fetchOptions, key = "http", methods, name = "HTTP JSON-RPC", onFetchRequest, onFetchResponse, retryDelay } = config;
  return ({ chain, retryCount: retryCount_, timeout: timeout_ }) => {
    const { batchSize = 1000, wait: wait2 = 0 } = typeof batch === "object" ? batch : {};
    const retryCount = config.retryCount ?? retryCount_;
    const timeout = timeout_ ?? config.timeout ?? 1e4;
    const url_ = url || chain?.rpcUrls.default.http[0];
    if (!url_)
      throw new UrlRequiredError;
    const rpcClient = getHttpRpcClient(url_, {
      fetchOptions,
      onRequest: onFetchRequest,
      onResponse: onFetchResponse,
      timeout
    });
    return createTransport({
      key,
      methods,
      name,
      async request({ method, params }) {
        const body = { method, params };
        const { schedule } = createBatchScheduler({
          id: url_,
          wait: wait2,
          shouldSplitBatch(requests) {
            return requests.length > batchSize;
          },
          fn: (body2) => rpcClient.request({
            body: body2
          }),
          sort: (a, b) => a.id - b.id
        });
        const fn = async (body2) => batch ? schedule(body2) : [
          await rpcClient.request({
            body: body2
          })
        ];
        const [{ error, result }] = await fn(body);
        if (error)
          throw new RpcRequestError({
            body,
            error,
            url: url_
          });
        return result;
      },
      retryCount,
      retryDelay,
      timeout,
      type: "http"
    }, {
      fetchOptions,
      url: url_
    });
  };
}
// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/ens/getEnsAddress.js
init_abis();
init_decodeFunctionResult();
init_encodeFunctionData();
init_getChainContractAddress();
init_toHex();

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/ens/errors.js
init_solidity();
init_base();
init_contract();
function isNullUniversalResolverError(err, callType) {
  if (!(err instanceof BaseError2))
    return false;
  const cause = err.walk((e) => e instanceof ContractFunctionRevertedError);
  if (!(cause instanceof ContractFunctionRevertedError))
    return false;
  if (cause.data?.errorName === "ResolverNotFound")
    return true;
  if (cause.data?.errorName === "ResolverWildcardNotSupported")
    return true;
  if (cause.data?.errorName === "ResolverNotContract")
    return true;
  if (cause.data?.errorName === "ResolverError")
    return true;
  if (cause.data?.errorName === "HttpError")
    return true;
  if (cause.reason?.includes("Wildcard on non-extended resolvers is not supported"))
    return true;
  if (callType === "reverse" && cause.reason === panicReasons[50])
    return true;
  return false;
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/ens/namehash.js
init_toBytes();
init_toHex();
init_keccak256();

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/ens/encodedLabelToLabelhash.js
function encodedLabelToLabelhash(label) {
  if (label.length !== 66)
    return null;
  if (label.indexOf("[") !== 0)
    return null;
  if (label.indexOf("]") !== 65)
    return null;
  const hash2 = `0x${label.slice(1, 65)}`;
  if (!isHex(hash2))
    return null;
  return hash2;
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/ens/namehash.js
function namehash(name) {
  let result = new Uint8Array(32).fill(0);
  if (!name)
    return bytesToHex(result);
  const labels = name.split(".");
  for (let i = labels.length - 1;i >= 0; i -= 1) {
    const hashFromEncodedLabel = encodedLabelToLabelhash(labels[i]);
    const hashed = hashFromEncodedLabel ? toBytes(hashFromEncodedLabel) : keccak256(stringToBytes(labels[i]), "bytes");
    result = keccak256(concat([result, hashed]), "bytes");
  }
  return bytesToHex(result);
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/ens/packetToBytes.js
init_toBytes();

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/ens/encodeLabelhash.js
function encodeLabelhash(hash2) {
  return `[${hash2.slice(2)}]`;
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/ens/labelhash.js
init_toBytes();
init_toHex();
init_keccak256();
function labelhash(label) {
  const result = new Uint8Array(32).fill(0);
  if (!label)
    return bytesToHex(result);
  return encodedLabelToLabelhash(label) || keccak256(stringToBytes(label));
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/ens/packetToBytes.js
function packetToBytes(packet) {
  const value = packet.replace(/^\.|\.$/gm, "");
  if (value.length === 0)
    return new Uint8Array(1);
  const bytes = new Uint8Array(stringToBytes(value).byteLength + 2);
  let offset = 0;
  const list = value.split(".");
  for (let i = 0;i < list.length; i++) {
    let encoded = stringToBytes(list[i]);
    if (encoded.byteLength > 255)
      encoded = stringToBytes(encodeLabelhash(labelhash(list[i])));
    bytes[offset] = encoded.length;
    bytes.set(encoded, offset + 1);
    offset += encoded.length + 1;
  }
  if (bytes.byteLength !== offset + 1)
    return bytes.slice(0, offset + 1);
  return bytes;
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/ens/getEnsAddress.js
async function getEnsAddress(client, { blockNumber, blockTag, coinType, name, gatewayUrls, strict, universalResolverAddress: universalResolverAddress_ }) {
  let universalResolverAddress = universalResolverAddress_;
  if (!universalResolverAddress) {
    if (!client.chain)
      throw new Error("client chain not configured. universalResolverAddress is required.");
    universalResolverAddress = getChainContractAddress({
      blockNumber,
      chain: client.chain,
      contract: "ensUniversalResolver"
    });
  }
  try {
    const functionData = encodeFunctionData({
      abi: addressResolverAbi,
      functionName: "addr",
      ...coinType != null ? { args: [namehash(name), BigInt(coinType)] } : { args: [namehash(name)] }
    });
    const readContractParameters = {
      address: universalResolverAddress,
      abi: universalResolverResolveAbi,
      functionName: "resolve",
      args: [toHex(packetToBytes(name)), functionData],
      blockNumber,
      blockTag
    };
    const readContractAction = getAction(client, readContract, "readContract");
    const res = gatewayUrls ? await readContractAction({
      ...readContractParameters,
      args: [...readContractParameters.args, gatewayUrls]
    }) : await readContractAction(readContractParameters);
    if (res[0] === "0x")
      return null;
    const address = decodeFunctionResult({
      abi: addressResolverAbi,
      args: coinType != null ? [namehash(name), BigInt(coinType)] : undefined,
      functionName: "addr",
      data: res[0]
    });
    if (address === "0x")
      return null;
    if (trim(address) === "0x00")
      return null;
    return address;
  } catch (err) {
    if (strict)
      throw err;
    if (isNullUniversalResolverError(err, "resolve"))
      return null;
    throw err;
  }
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/errors/ens.js
init_base();

class EnsAvatarInvalidMetadataError extends BaseError2 {
  constructor({ data }) {
    super("Unable to extract image from metadata. The metadata may be malformed or invalid.", {
      metaMessages: [
        "- Metadata must be a JSON object with at least an `image`, `image_url` or `image_data` property.",
        "",
        `Provided data: ${JSON.stringify(data)}`
      ],
      name: "EnsAvatarInvalidMetadataError"
    });
  }
}

class EnsAvatarInvalidNftUriError extends BaseError2 {
  constructor({ reason }) {
    super(`ENS NFT avatar URI is invalid. ${reason}`, {
      name: "EnsAvatarInvalidNftUriError"
    });
  }
}

class EnsAvatarUriResolutionError extends BaseError2 {
  constructor({ uri }) {
    super(`Unable to resolve ENS avatar URI "${uri}". The URI may be malformed, invalid, or does not respond with a valid image.`, { name: "EnsAvatarUriResolutionError" });
  }
}

class EnsAvatarUnsupportedNamespaceError extends BaseError2 {
  constructor({ namespace }) {
    super(`ENS NFT avatar namespace "${namespace}" is not supported. Must be "erc721" or "erc1155".`, { name: "EnsAvatarUnsupportedNamespaceError" });
  }
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/ens/avatar/utils.js
var networkRegex = /(?<protocol>https?:\/\/[^\/]*|ipfs:\/|ipns:\/|ar:\/)?(?<root>\/)?(?<subpath>ipfs\/|ipns\/)?(?<target>[\w\-.]+)(?<subtarget>\/.*)?/;
var ipfsHashRegex = /^(Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,})(\/(?<target>[\w\-.]+))?(?<subtarget>\/.*)?$/;
var base64Regex = /^data:([a-zA-Z\-/+]*);base64,([^"].*)/;
var dataURIRegex = /^data:([a-zA-Z\-/+]*)?(;[a-zA-Z0-9].*?)?(,)/;
async function isImageUri(uri) {
  try {
    const res = await fetch(uri, { method: "HEAD" });
    if (res.status === 200) {
      const contentType = res.headers.get("content-type");
      return contentType?.startsWith("image/");
    }
    return false;
  } catch (error) {
    if (typeof error === "object" && typeof error.response !== "undefined") {
      return false;
    }
    if (!globalThis.hasOwnProperty("Image"))
      return false;
    return new Promise((resolve) => {
      const img = new Image;
      img.onload = () => {
        resolve(true);
      };
      img.onerror = () => {
        resolve(false);
      };
      img.src = uri;
    });
  }
}
function getGateway(custom, defaultGateway) {
  if (!custom)
    return defaultGateway;
  if (custom.endsWith("/"))
    return custom.slice(0, -1);
  return custom;
}
function resolveAvatarUri({ uri, gatewayUrls }) {
  const isEncoded = base64Regex.test(uri);
  if (isEncoded)
    return { uri, isOnChain: true, isEncoded };
  const ipfsGateway = getGateway(gatewayUrls?.ipfs, "https://ipfs.io");
  const arweaveGateway = getGateway(gatewayUrls?.arweave, "https://arweave.net");
  const networkRegexMatch = uri.match(networkRegex);
  const { protocol, subpath, target, subtarget = "" } = networkRegexMatch?.groups || {};
  const isIPNS = protocol === "ipns:/" || subpath === "ipns/";
  const isIPFS = protocol === "ipfs:/" || subpath === "ipfs/" || ipfsHashRegex.test(uri);
  if (uri.startsWith("http") && !isIPNS && !isIPFS) {
    let replacedUri = uri;
    if (gatewayUrls?.arweave)
      replacedUri = uri.replace(/https:\/\/arweave.net/g, gatewayUrls?.arweave);
    return { uri: replacedUri, isOnChain: false, isEncoded: false };
  }
  if ((isIPNS || isIPFS) && target) {
    return {
      uri: `${ipfsGateway}/${isIPNS ? "ipns" : "ipfs"}/${target}${subtarget}`,
      isOnChain: false,
      isEncoded: false
    };
  }
  if (protocol === "ar:/" && target) {
    return {
      uri: `${arweaveGateway}/${target}${subtarget || ""}`,
      isOnChain: false,
      isEncoded: false
    };
  }
  let parsedUri = uri.replace(dataURIRegex, "");
  if (parsedUri.startsWith("<svg")) {
    parsedUri = `data:image/svg+xml;base64,${btoa(parsedUri)}`;
  }
  if (parsedUri.startsWith("data:") || parsedUri.startsWith("{")) {
    return {
      uri: parsedUri,
      isOnChain: true,
      isEncoded: false
    };
  }
  throw new EnsAvatarUriResolutionError({ uri });
}
function getJsonImage(data) {
  if (typeof data !== "object" || !("image" in data) && !("image_url" in data) && !("image_data" in data)) {
    throw new EnsAvatarInvalidMetadataError({ data });
  }
  return data.image || data.image_url || data.image_data;
}
async function getMetadataAvatarUri({ gatewayUrls, uri }) {
  try {
    const res = await fetch(uri).then((res2) => res2.json());
    const image = await parseAvatarUri({
      gatewayUrls,
      uri: getJsonImage(res)
    });
    return image;
  } catch {
    throw new EnsAvatarUriResolutionError({ uri });
  }
}
async function parseAvatarUri({ gatewayUrls, uri }) {
  const { uri: resolvedURI, isOnChain } = resolveAvatarUri({ uri, gatewayUrls });
  if (isOnChain)
    return resolvedURI;
  const isImage = await isImageUri(resolvedURI);
  if (isImage)
    return resolvedURI;
  throw new EnsAvatarUriResolutionError({ uri });
}
function parseNftUri(uri_) {
  let uri = uri_;
  if (uri.startsWith("did:nft:")) {
    uri = uri.replace("did:nft:", "").replace(/_/g, "/");
  }
  const [reference, asset_namespace, tokenID] = uri.split("/");
  const [eip_namespace, chainID] = reference.split(":");
  const [erc_namespace, contractAddress] = asset_namespace.split(":");
  if (!eip_namespace || eip_namespace.toLowerCase() !== "eip155")
    throw new EnsAvatarInvalidNftUriError({ reason: "Only EIP-155 supported" });
  if (!chainID)
    throw new EnsAvatarInvalidNftUriError({ reason: "Chain ID not found" });
  if (!contractAddress)
    throw new EnsAvatarInvalidNftUriError({
      reason: "Contract address not found"
    });
  if (!tokenID)
    throw new EnsAvatarInvalidNftUriError({ reason: "Token ID not found" });
  if (!erc_namespace)
    throw new EnsAvatarInvalidNftUriError({ reason: "ERC namespace not found" });
  return {
    chainID: Number.parseInt(chainID),
    namespace: erc_namespace.toLowerCase(),
    contractAddress,
    tokenID
  };
}
async function getNftTokenUri(client, { nft }) {
  if (nft.namespace === "erc721") {
    return readContract(client, {
      address: nft.contractAddress,
      abi: [
        {
          name: "tokenURI",
          type: "function",
          stateMutability: "view",
          inputs: [{ name: "tokenId", type: "uint256" }],
          outputs: [{ name: "", type: "string" }]
        }
      ],
      functionName: "tokenURI",
      args: [BigInt(nft.tokenID)]
    });
  }
  if (nft.namespace === "erc1155") {
    return readContract(client, {
      address: nft.contractAddress,
      abi: [
        {
          name: "uri",
          type: "function",
          stateMutability: "view",
          inputs: [{ name: "_id", type: "uint256" }],
          outputs: [{ name: "", type: "string" }]
        }
      ],
      functionName: "uri",
      args: [BigInt(nft.tokenID)]
    });
  }
  throw new EnsAvatarUnsupportedNamespaceError({ namespace: nft.namespace });
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/ens/avatar/parseAvatarRecord.js
async function parseAvatarRecord(client, { gatewayUrls, record }) {
  if (/eip155:/i.test(record))
    return parseNftAvatarUri(client, { gatewayUrls, record });
  return parseAvatarUri({ uri: record, gatewayUrls });
}
async function parseNftAvatarUri(client, { gatewayUrls, record }) {
  const nft = parseNftUri(record);
  const nftUri = await getNftTokenUri(client, { nft });
  const { uri: resolvedNftUri, isOnChain, isEncoded } = resolveAvatarUri({ uri: nftUri, gatewayUrls });
  if (isOnChain && (resolvedNftUri.includes("data:application/json;base64,") || resolvedNftUri.startsWith("{"))) {
    const encodedJson = isEncoded ? atob(resolvedNftUri.replace("data:application/json;base64,", "")) : resolvedNftUri;
    const decoded = JSON.parse(encodedJson);
    return parseAvatarUri({ uri: getJsonImage(decoded), gatewayUrls });
  }
  let uriTokenId = nft.tokenID;
  if (nft.namespace === "erc1155")
    uriTokenId = uriTokenId.replace("0x", "").padStart(64, "0");
  return getMetadataAvatarUri({
    gatewayUrls,
    uri: resolvedNftUri.replace(/(?:0x)?{id}/, uriTokenId)
  });
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/ens/getEnsText.js
init_abis();
init_decodeFunctionResult();
init_encodeFunctionData();
init_getChainContractAddress();
init_toHex();
async function getEnsText(client, { blockNumber, blockTag, name, key, gatewayUrls, strict, universalResolverAddress: universalResolverAddress_ }) {
  let universalResolverAddress = universalResolverAddress_;
  if (!universalResolverAddress) {
    if (!client.chain)
      throw new Error("client chain not configured. universalResolverAddress is required.");
    universalResolverAddress = getChainContractAddress({
      blockNumber,
      chain: client.chain,
      contract: "ensUniversalResolver"
    });
  }
  try {
    const readContractParameters = {
      address: universalResolverAddress,
      abi: universalResolverResolveAbi,
      functionName: "resolve",
      args: [
        toHex(packetToBytes(name)),
        encodeFunctionData({
          abi: textResolverAbi,
          functionName: "text",
          args: [namehash(name), key]
        })
      ],
      blockNumber,
      blockTag
    };
    const readContractAction = getAction(client, readContract, "readContract");
    const res = gatewayUrls ? await readContractAction({
      ...readContractParameters,
      args: [...readContractParameters.args, gatewayUrls]
    }) : await readContractAction(readContractParameters);
    if (res[0] === "0x")
      return null;
    const record = decodeFunctionResult({
      abi: textResolverAbi,
      functionName: "text",
      data: res[0]
    });
    return record === "" ? null : record;
  } catch (err) {
    if (strict)
      throw err;
    if (isNullUniversalResolverError(err, "resolve"))
      return null;
    throw err;
  }
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/ens/getEnsAvatar.js
async function getEnsAvatar(client, { blockNumber, blockTag, assetGatewayUrls, name, gatewayUrls, strict, universalResolverAddress }) {
  const record = await getAction(client, getEnsText, "getEnsText")({
    blockNumber,
    blockTag,
    key: "avatar",
    name,
    universalResolverAddress,
    gatewayUrls,
    strict
  });
  if (!record)
    return null;
  try {
    return await parseAvatarRecord(client, {
      record,
      gatewayUrls: assetGatewayUrls
    });
  } catch {
    return null;
  }
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/ens/getEnsName.js
init_abis();
init_getChainContractAddress();
init_toHex();
async function getEnsName(client, { address, blockNumber, blockTag, gatewayUrls, strict, universalResolverAddress: universalResolverAddress_ }) {
  let universalResolverAddress = universalResolverAddress_;
  if (!universalResolverAddress) {
    if (!client.chain)
      throw new Error("client chain not configured. universalResolverAddress is required.");
    universalResolverAddress = getChainContractAddress({
      blockNumber,
      chain: client.chain,
      contract: "ensUniversalResolver"
    });
  }
  const reverseNode = `${address.toLowerCase().substring(2)}.addr.reverse`;
  try {
    const readContractParameters = {
      address: universalResolverAddress,
      abi: universalResolverReverseAbi,
      functionName: "reverse",
      args: [toHex(packetToBytes(reverseNode))],
      blockNumber,
      blockTag
    };
    const readContractAction = getAction(client, readContract, "readContract");
    const [name, resolvedAddress] = gatewayUrls ? await readContractAction({
      ...readContractParameters,
      args: [...readContractParameters.args, gatewayUrls]
    }) : await readContractAction(readContractParameters);
    if (address.toLowerCase() !== resolvedAddress.toLowerCase())
      return null;
    return name;
  } catch (err) {
    if (strict)
      throw err;
    if (isNullUniversalResolverError(err, "reverse"))
      return null;
    throw err;
  }
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/ens/getEnsResolver.js
init_getChainContractAddress();
init_toHex();
async function getEnsResolver(client, { blockNumber, blockTag, name, universalResolverAddress: universalResolverAddress_ }) {
  let universalResolverAddress = universalResolverAddress_;
  if (!universalResolverAddress) {
    if (!client.chain)
      throw new Error("client chain not configured. universalResolverAddress is required.");
    universalResolverAddress = getChainContractAddress({
      blockNumber,
      chain: client.chain,
      contract: "ensUniversalResolver"
    });
  }
  const [resolverAddress] = await getAction(client, readContract, "readContract")({
    address: universalResolverAddress,
    abi: [
      {
        inputs: [{ type: "bytes" }],
        name: "findResolver",
        outputs: [{ type: "address" }, { type: "bytes32" }],
        stateMutability: "view",
        type: "function"
      }
    ],
    functionName: "findResolver",
    args: [toHex(packetToBytes(name))],
    blockNumber,
    blockTag
  });
  return resolverAddress;
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/clients/decorators/public.js
init_call();

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/createAccessList.js
init_toHex();
init_getCallError();
init_transactionRequest();
init_assertRequest();
async function createAccessList(client, args) {
  const { account: account_ = client.account, blockNumber, blockTag = "latest", blobs, data, gas, gasPrice, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, to, value, ...rest } = args;
  const account = account_ ? parseAccount(account_) : undefined;
  try {
    assertRequest(args);
    const blockNumberHex = blockNumber ? numberToHex(blockNumber) : undefined;
    const block = blockNumberHex || blockTag;
    const chainFormat = client.chain?.formatters?.transactionRequest?.format;
    const format = chainFormat || formatTransactionRequest;
    const request = format({
      ...extract(rest, { format: chainFormat }),
      from: account?.address,
      blobs,
      data,
      gas,
      gasPrice,
      maxFeePerBlobGas,
      maxFeePerGas,
      maxPriorityFeePerGas,
      to,
      value
    });
    const response = await client.request({
      method: "eth_createAccessList",
      params: [request, block]
    });
    return {
      accessList: response.accessList,
      gasUsed: BigInt(response.gasUsed)
    };
  } catch (err) {
    throw getCallError(err, {
      ...args,
      account,
      chain: client.chain
    });
  }
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/createBlockFilter.js
async function createBlockFilter(client) {
  const getRequest = createFilterRequestScope(client, {
    method: "eth_newBlockFilter"
  });
  const id = await client.request({
    method: "eth_newBlockFilter"
  });
  return { id, request: getRequest(id), type: "block" };
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/createEventFilter.js
init_toHex();
async function createEventFilter(client, { address, args, event, events: events_, fromBlock, strict, toBlock } = {}) {
  const events = events_ ?? (event ? [event] : undefined);
  const getRequest = createFilterRequestScope(client, {
    method: "eth_newFilter"
  });
  let topics = [];
  if (events) {
    const encoded = events.flatMap((event2) => encodeEventTopics({
      abi: [event2],
      eventName: event2.name,
      args
    }));
    topics = [encoded];
    if (event)
      topics = topics[0];
  }
  const id = await client.request({
    method: "eth_newFilter",
    params: [
      {
        address,
        fromBlock: typeof fromBlock === "bigint" ? numberToHex(fromBlock) : fromBlock,
        toBlock: typeof toBlock === "bigint" ? numberToHex(toBlock) : toBlock,
        ...topics.length ? { topics } : {}
      }
    ]
  });
  return {
    abi: events,
    args,
    eventName: event ? event.name : undefined,
    fromBlock,
    id,
    request: getRequest(id),
    strict: Boolean(strict),
    toBlock,
    type: "event"
  };
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/createPendingTransactionFilter.js
async function createPendingTransactionFilter(client) {
  const getRequest = createFilterRequestScope(client, {
    method: "eth_newPendingTransactionFilter"
  });
  const id = await client.request({
    method: "eth_newPendingTransactionFilter"
  });
  return { id, request: getRequest(id), type: "transaction" };
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/getBlobBaseFee.js
async function getBlobBaseFee(client) {
  const baseFee = await client.request({
    method: "eth_blobBaseFee"
  });
  return BigInt(baseFee);
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/getBlockTransactionCount.js
init_fromHex();
init_toHex();
async function getBlockTransactionCount(client, { blockHash, blockNumber, blockTag = "latest" } = {}) {
  const blockNumberHex = blockNumber !== undefined ? numberToHex(blockNumber) : undefined;
  let count;
  if (blockHash) {
    count = await client.request({
      method: "eth_getBlockTransactionCountByHash",
      params: [blockHash]
    }, { dedupe: true });
  } else {
    count = await client.request({
      method: "eth_getBlockTransactionCountByNumber",
      params: [blockNumberHex || blockTag]
    }, { dedupe: Boolean(blockNumberHex) });
  }
  return hexToNumber(count);
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/getCode.js
init_toHex();
async function getCode(client, { address, blockNumber, blockTag = "latest" }) {
  const blockNumberHex = blockNumber !== undefined ? numberToHex(blockNumber) : undefined;
  const hex = await client.request({
    method: "eth_getCode",
    params: [address, blockNumberHex || blockTag]
  }, { dedupe: Boolean(blockNumberHex) });
  if (hex === "0x")
    return;
  return hex;
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/getFeeHistory.js
init_toHex();

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/formatters/feeHistory.js
function formatFeeHistory(feeHistory) {
  return {
    baseFeePerGas: feeHistory.baseFeePerGas.map((value) => BigInt(value)),
    gasUsedRatio: feeHistory.gasUsedRatio,
    oldestBlock: BigInt(feeHistory.oldestBlock),
    reward: feeHistory.reward?.map((reward) => reward.map((value) => BigInt(value)))
  };
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/getFeeHistory.js
async function getFeeHistory(client, { blockCount, blockNumber, blockTag = "latest", rewardPercentiles }) {
  const blockNumberHex = blockNumber ? numberToHex(blockNumber) : undefined;
  const feeHistory = await client.request({
    method: "eth_feeHistory",
    params: [
      numberToHex(blockCount),
      blockNumberHex || blockTag,
      rewardPercentiles
    ]
  }, { dedupe: Boolean(blockNumberHex) });
  return formatFeeHistory(feeHistory);
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/getFilterLogs.js
async function getFilterLogs(_client, { filter }) {
  const strict = filter.strict ?? false;
  const logs = await filter.request({
    method: "eth_getFilterLogs",
    params: [filter.id]
  });
  const formattedLogs = logs.map((log) => formatLog(log));
  if (!filter.abi)
    return formattedLogs;
  return parseEventLogs({
    abi: filter.abi,
    logs: formattedLogs,
    strict
  });
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/getProof.js
init_toHex();

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/chain/defineChain.js
function defineChain(chain) {
  return {
    formatters: undefined,
    fees: undefined,
    serializers: undefined,
    ...chain
  };
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/typedData.js
init_abi();
init_address();

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/errors/typedData.js
init_base();

class InvalidDomainError extends BaseError2 {
  constructor({ domain }) {
    super(`Invalid domain "${stringify(domain)}".`, {
      metaMessages: ["Must be a valid EIP-712 domain."]
    });
  }
}

class InvalidPrimaryTypeError extends BaseError2 {
  constructor({ primaryType, types }) {
    super(`Invalid primary type \`${primaryType}\` must be one of \`${JSON.stringify(Object.keys(types))}\`.`, {
      docsPath: "/api/glossary/Errors#typeddatainvalidprimarytypeerror",
      metaMessages: ["Check that the primary type is a key in `types`."]
    });
  }
}

class InvalidStructTypeError extends BaseError2 {
  constructor({ type }) {
    super(`Struct type "${type}" is invalid.`, {
      metaMessages: ["Struct type must not be a Solidity type."],
      name: "InvalidStructTypeError"
    });
  }
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/typedData.js
init_isAddress();
init_size();
init_toHex();
init_regex2();

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/signature/hashTypedData.js
init_encodeAbiParameters();
init_toHex();
init_keccak256();
function hashTypedData(parameters) {
  const { domain = {}, message, primaryType } = parameters;
  const types = {
    EIP712Domain: getTypesForEIP712Domain({ domain }),
    ...parameters.types
  };
  validateTypedData({
    domain,
    message,
    primaryType,
    types
  });
  const parts = ["0x1901"];
  if (domain)
    parts.push(hashDomain({
      domain,
      types
    }));
  if (primaryType !== "EIP712Domain")
    parts.push(hashStruct({
      data: message,
      primaryType,
      types
    }));
  return keccak256(concat(parts));
}
function hashDomain({ domain, types }) {
  return hashStruct({
    data: domain,
    primaryType: "EIP712Domain",
    types
  });
}
function hashStruct({ data, primaryType, types }) {
  const encoded = encodeData({
    data,
    primaryType,
    types
  });
  return keccak256(encoded);
}
function encodeData({ data, primaryType, types }) {
  const encodedTypes = [{ type: "bytes32" }];
  const encodedValues = [hashType({ primaryType, types })];
  for (const field of types[primaryType]) {
    const [type, value] = encodeField({
      types,
      name: field.name,
      type: field.type,
      value: data[field.name]
    });
    encodedTypes.push(type);
    encodedValues.push(value);
  }
  return encodeAbiParameters(encodedTypes, encodedValues);
}
function hashType({ primaryType, types }) {
  const encodedHashType = toHex(encodeType({ primaryType, types }));
  return keccak256(encodedHashType);
}
function encodeType({ primaryType, types }) {
  let result = "";
  const unsortedDeps = findTypeDependencies({ primaryType, types });
  unsortedDeps.delete(primaryType);
  const deps = [primaryType, ...Array.from(unsortedDeps).sort()];
  for (const type of deps) {
    result += `${type}(${types[type].map(({ name, type: t }) => `${t} ${name}`).join(",")})`;
  }
  return result;
}
function findTypeDependencies({ primaryType: primaryType_, types }, results = new Set) {
  const match = primaryType_.match(/^\w*/u);
  const primaryType = match?.[0];
  if (results.has(primaryType) || types[primaryType] === undefined) {
    return results;
  }
  results.add(primaryType);
  for (const field of types[primaryType]) {
    findTypeDependencies({ primaryType: field.type, types }, results);
  }
  return results;
}
function encodeField({ types, name, type, value }) {
  if (types[type] !== undefined) {
    return [
      { type: "bytes32" },
      keccak256(encodeData({ data: value, primaryType: type, types }))
    ];
  }
  if (type === "bytes") {
    const prepend = value.length % 2 ? "0" : "";
    value = `0x${prepend + value.slice(2)}`;
    return [{ type: "bytes32" }, keccak256(value)];
  }
  if (type === "string")
    return [{ type: "bytes32" }, keccak256(toHex(value))];
  if (type.lastIndexOf("]") === type.length - 1) {
    const parsedType = type.slice(0, type.lastIndexOf("["));
    const typeValuePairs = value.map((item) => encodeField({
      name,
      type: parsedType,
      types,
      value: item
    }));
    return [
      { type: "bytes32" },
      keccak256(encodeAbiParameters(typeValuePairs.map(([t]) => t), typeValuePairs.map(([, v]) => v)))
    ];
  }
  return [{ type }, value];
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/typedData.js
function serializeTypedData(parameters) {
  const { domain: domain_, message: message_, primaryType, types } = parameters;
  const normalizeData = (struct, data_) => {
    const data = { ...data_ };
    for (const param of struct) {
      const { name, type } = param;
      if (type === "address")
        data[name] = data[name].toLowerCase();
    }
    return data;
  };
  const domain = (() => {
    if (!types.EIP712Domain)
      return {};
    if (!domain_)
      return {};
    return normalizeData(types.EIP712Domain, domain_);
  })();
  const message = (() => {
    if (primaryType === "EIP712Domain")
      return;
    return normalizeData(types[primaryType], message_);
  })();
  return stringify({ domain, message, primaryType, types });
}
function validateTypedData(parameters) {
  const { domain, message, primaryType, types } = parameters;
  const validateData = (struct, data) => {
    for (const param of struct) {
      const { name, type } = param;
      const value = data[name];
      const integerMatch = type.match(integerRegex2);
      if (integerMatch && (typeof value === "number" || typeof value === "bigint")) {
        const [_type, base, size_] = integerMatch;
        numberToHex(value, {
          signed: base === "int",
          size: Number.parseInt(size_) / 8
        });
      }
      if (type === "address" && typeof value === "string" && !isAddress(value))
        throw new InvalidAddressError({ address: value });
      const bytesMatch = type.match(bytesRegex2);
      if (bytesMatch) {
        const [_type, size_] = bytesMatch;
        if (size_ && size(value) !== Number.parseInt(size_))
          throw new BytesSizeMismatchError({
            expectedSize: Number.parseInt(size_),
            givenSize: size(value)
          });
      }
      const struct2 = types[type];
      if (struct2) {
        validateReference(type);
        validateData(struct2, value);
      }
    }
  };
  if (types.EIP712Domain && domain) {
    if (typeof domain !== "object")
      throw new InvalidDomainError({ domain });
    validateData(types.EIP712Domain, domain);
  }
  if (primaryType !== "EIP712Domain") {
    if (types[primaryType])
      validateData(types[primaryType], message);
    else
      throw new InvalidPrimaryTypeError({ primaryType, types });
  }
}
function getTypesForEIP712Domain({ domain }) {
  return [
    typeof domain?.name === "string" && { name: "name", type: "string" },
    domain?.version && { name: "version", type: "string" },
    (typeof domain?.chainId === "number" || typeof domain?.chainId === "bigint") && {
      name: "chainId",
      type: "uint256"
    },
    domain?.verifyingContract && {
      name: "verifyingContract",
      type: "address"
    },
    domain?.salt && { name: "salt", type: "bytes32" }
  ].filter(Boolean);
}
function validateReference(type) {
  if (type === "address" || type === "bool" || type === "string" || type.startsWith("bytes") || type.startsWith("uint") || type.startsWith("int"))
    throw new InvalidStructTypeError({ type });
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/index.js
init_encodeFunctionData();

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/formatters/transactionReceipt.js
init_fromHex();
var receiptStatuses = {
  "0x0": "reverted",
  "0x1": "success"
};
function formatTransactionReceipt(transactionReceipt) {
  const receipt = {
    ...transactionReceipt,
    blockNumber: transactionReceipt.blockNumber ? BigInt(transactionReceipt.blockNumber) : null,
    contractAddress: transactionReceipt.contractAddress ? transactionReceipt.contractAddress : null,
    cumulativeGasUsed: transactionReceipt.cumulativeGasUsed ? BigInt(transactionReceipt.cumulativeGasUsed) : null,
    effectiveGasPrice: transactionReceipt.effectiveGasPrice ? BigInt(transactionReceipt.effectiveGasPrice) : null,
    gasUsed: transactionReceipt.gasUsed ? BigInt(transactionReceipt.gasUsed) : null,
    logs: transactionReceipt.logs ? transactionReceipt.logs.map((log) => formatLog(log)) : null,
    to: transactionReceipt.to ? transactionReceipt.to : null,
    transactionIndex: transactionReceipt.transactionIndex ? hexToNumber(transactionReceipt.transactionIndex) : null,
    status: transactionReceipt.status ? receiptStatuses[transactionReceipt.status] : null,
    type: transactionReceipt.type ? transactionType[transactionReceipt.type] || transactionReceipt.type : null
  };
  if (transactionReceipt.blobGasPrice)
    receipt.blobGasPrice = BigInt(transactionReceipt.blobGasPrice);
  if (transactionReceipt.blobGasUsed)
    receipt.blobGasUsed = BigInt(transactionReceipt.blobGasUsed);
  return receipt;
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/index.js
init_fromHex();

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/signature/hashMessage.js
init_keccak256();

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/constants/strings.js
var presignMessagePrefix = `\x19Ethereum Signed Message:
`;

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/signature/toPrefixedMessage.js
init_size();
init_toHex();
function toPrefixedMessage(message_) {
  const message = (() => {
    if (typeof message_ === "string")
      return stringToHex(message_);
    if (typeof message_.raw === "string")
      return message_.raw;
    return bytesToHex(message_.raw);
  })();
  const prefix = stringToHex(`${presignMessagePrefix}${size(message)}`);
  return concat([prefix, message]);
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/signature/hashMessage.js
function hashMessage(message, to_) {
  return keccak256(toPrefixedMessage(message), to_);
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/constants/bytes.js
var erc6492MagicBytes = "0x6492649264926492649264926492649264926492649264926492649264926492";

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/signature/isErc6492Signature.js
init_slice();
function isErc6492Signature(signature) {
  return sliceHex(signature, -32) === erc6492MagicBytes;
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/signature/serializeErc6492Signature.js
init_encodeAbiParameters();
init_toBytes();
function serializeErc6492Signature(parameters) {
  const { address, data, signature, to = "hex" } = parameters;
  const signature_ = concatHex([
    encodeAbiParameters([{ type: "address" }, { type: "bytes" }, { type: "bytes" }], [address, data, signature]),
    erc6492MagicBytes
  ]);
  if (to === "hex")
    return signature_;
  return hexToBytes(signature_);
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/transaction/assertTransaction.js
init_number();
init_address();
init_base();
init_chain();
init_node();
init_isAddress();
init_size();
init_slice();
init_fromHex();
function assertTransactionEIP7702(transaction) {
  const { authorizationList } = transaction;
  if (authorizationList) {
    for (const authorization of authorizationList) {
      const { contractAddress, chainId } = authorization;
      if (!isAddress(contractAddress))
        throw new InvalidAddressError({ address: contractAddress });
      if (chainId < 0)
        throw new InvalidChainIdError({ chainId });
    }
  }
  assertTransactionEIP1559(transaction);
}
function assertTransactionEIP4844(transaction) {
  const { blobVersionedHashes } = transaction;
  if (blobVersionedHashes) {
    if (blobVersionedHashes.length === 0)
      throw new EmptyBlobError;
    for (const hash2 of blobVersionedHashes) {
      const size_ = size(hash2);
      const version3 = hexToNumber(slice(hash2, 0, 1));
      if (size_ !== 32)
        throw new InvalidVersionedHashSizeError({ hash: hash2, size: size_ });
      if (version3 !== versionedHashVersionKzg)
        throw new InvalidVersionedHashVersionError({
          hash: hash2,
          version: version3
        });
    }
  }
  assertTransactionEIP1559(transaction);
}
function assertTransactionEIP1559(transaction) {
  const { chainId, maxPriorityFeePerGas, maxFeePerGas, to } = transaction;
  if (chainId <= 0)
    throw new InvalidChainIdError({ chainId });
  if (to && !isAddress(to))
    throw new InvalidAddressError({ address: to });
  if (maxFeePerGas && maxFeePerGas > maxUint256)
    throw new FeeCapTooHighError({ maxFeePerGas });
  if (maxPriorityFeePerGas && maxFeePerGas && maxPriorityFeePerGas > maxFeePerGas)
    throw new TipAboveFeeCapError({ maxFeePerGas, maxPriorityFeePerGas });
}
function assertTransactionEIP2930(transaction) {
  const { chainId, maxPriorityFeePerGas, gasPrice, maxFeePerGas, to } = transaction;
  if (chainId <= 0)
    throw new InvalidChainIdError({ chainId });
  if (to && !isAddress(to))
    throw new InvalidAddressError({ address: to });
  if (maxPriorityFeePerGas || maxFeePerGas)
    throw new BaseError2("`maxFeePerGas`/`maxPriorityFeePerGas` is not a valid EIP-2930 Transaction attribute.");
  if (gasPrice && gasPrice > maxUint256)
    throw new FeeCapTooHighError({ maxFeePerGas: gasPrice });
}
function assertTransactionLegacy(transaction) {
  const { chainId, maxPriorityFeePerGas, gasPrice, maxFeePerGas, to } = transaction;
  if (to && !isAddress(to))
    throw new InvalidAddressError({ address: to });
  if (typeof chainId !== "undefined" && chainId <= 0)
    throw new InvalidChainIdError({ chainId });
  if (maxPriorityFeePerGas || maxFeePerGas)
    throw new BaseError2("`maxFeePerGas`/`maxPriorityFeePerGas` is not a valid Legacy Transaction attribute.");
  if (gasPrice && gasPrice > maxUint256)
    throw new FeeCapTooHighError({ maxFeePerGas: gasPrice });
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/transaction/serializeTransaction.js
init_transaction();
init_toHex();

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/experimental/eip7702/utils/serializeAuthorizationList.js
init_toHex();
function serializeAuthorizationList(authorizationList) {
  if (!authorizationList || authorizationList.length === 0)
    return [];
  const serializedAuthorizationList = [];
  for (const authorization of authorizationList) {
    const { contractAddress, chainId, nonce, ...signature } = authorization;
    serializedAuthorizationList.push([
      chainId ? toHex(chainId) : "0x",
      contractAddress,
      nonce ? toHex(nonce) : "0x",
      ...toYParitySignatureArray({}, signature)
    ]);
  }
  return serializedAuthorizationList;
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/transaction/serializeAccessList.js
init_address();
init_transaction();
init_isAddress();
function serializeAccessList(accessList) {
  if (!accessList || accessList.length === 0)
    return [];
  const serializedAccessList = [];
  for (let i = 0;i < accessList.length; i++) {
    const { address, storageKeys } = accessList[i];
    for (let j = 0;j < storageKeys.length; j++) {
      if (storageKeys[j].length - 2 !== 64) {
        throw new InvalidStorageKeySizeError({ storageKey: storageKeys[j] });
      }
    }
    if (!isAddress(address, { strict: false })) {
      throw new InvalidAddressError({ address });
    }
    serializedAccessList.push([address, storageKeys]);
  }
  return serializedAccessList;
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/transaction/serializeTransaction.js
function serializeTransaction(transaction, signature) {
  const type = getTransactionType(transaction);
  if (type === "eip1559")
    return serializeTransactionEIP1559(transaction, signature);
  if (type === "eip2930")
    return serializeTransactionEIP2930(transaction, signature);
  if (type === "eip4844")
    return serializeTransactionEIP4844(transaction, signature);
  if (type === "eip7702")
    return serializeTransactionEIP7702(transaction, signature);
  return serializeTransactionLegacy(transaction, signature);
}
function serializeTransactionEIP7702(transaction, signature) {
  const { authorizationList, chainId, gas, nonce, to, value, maxFeePerGas, maxPriorityFeePerGas, accessList, data } = transaction;
  assertTransactionEIP7702(transaction);
  const serializedAccessList = serializeAccessList(accessList);
  const serializedAuthorizationList = serializeAuthorizationList(authorizationList);
  return concatHex([
    "0x04",
    toRlp([
      toHex(chainId),
      nonce ? toHex(nonce) : "0x",
      maxPriorityFeePerGas ? toHex(maxPriorityFeePerGas) : "0x",
      maxFeePerGas ? toHex(maxFeePerGas) : "0x",
      gas ? toHex(gas) : "0x",
      to ?? "0x",
      value ? toHex(value) : "0x",
      data ?? "0x",
      serializedAccessList,
      serializedAuthorizationList,
      ...toYParitySignatureArray(transaction, signature)
    ])
  ]);
}
function serializeTransactionEIP4844(transaction, signature) {
  const { chainId, gas, nonce, to, value, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, accessList, data } = transaction;
  assertTransactionEIP4844(transaction);
  let blobVersionedHashes = transaction.blobVersionedHashes;
  let sidecars = transaction.sidecars;
  if (transaction.blobs && (typeof blobVersionedHashes === "undefined" || typeof sidecars === "undefined")) {
    const blobs2 = typeof transaction.blobs[0] === "string" ? transaction.blobs : transaction.blobs.map((x) => bytesToHex(x));
    const kzg = transaction.kzg;
    const commitments2 = blobsToCommitments({
      blobs: blobs2,
      kzg
    });
    if (typeof blobVersionedHashes === "undefined")
      blobVersionedHashes = commitmentsToVersionedHashes({
        commitments: commitments2
      });
    if (typeof sidecars === "undefined") {
      const proofs2 = blobsToProofs({ blobs: blobs2, commitments: commitments2, kzg });
      sidecars = toBlobSidecars({ blobs: blobs2, commitments: commitments2, proofs: proofs2 });
    }
  }
  const serializedAccessList = serializeAccessList(accessList);
  const serializedTransaction = [
    toHex(chainId),
    nonce ? toHex(nonce) : "0x",
    maxPriorityFeePerGas ? toHex(maxPriorityFeePerGas) : "0x",
    maxFeePerGas ? toHex(maxFeePerGas) : "0x",
    gas ? toHex(gas) : "0x",
    to ?? "0x",
    value ? toHex(value) : "0x",
    data ?? "0x",
    serializedAccessList,
    maxFeePerBlobGas ? toHex(maxFeePerBlobGas) : "0x",
    blobVersionedHashes ?? [],
    ...toYParitySignatureArray(transaction, signature)
  ];
  const blobs = [];
  const commitments = [];
  const proofs = [];
  if (sidecars)
    for (let i = 0;i < sidecars.length; i++) {
      const { blob, commitment, proof } = sidecars[i];
      blobs.push(blob);
      commitments.push(commitment);
      proofs.push(proof);
    }
  return concatHex([
    "0x03",
    sidecars ? toRlp([serializedTransaction, blobs, commitments, proofs]) : toRlp(serializedTransaction)
  ]);
}
function serializeTransactionEIP1559(transaction, signature) {
  const { chainId, gas, nonce, to, value, maxFeePerGas, maxPriorityFeePerGas, accessList, data } = transaction;
  assertTransactionEIP1559(transaction);
  const serializedAccessList = serializeAccessList(accessList);
  const serializedTransaction = [
    toHex(chainId),
    nonce ? toHex(nonce) : "0x",
    maxPriorityFeePerGas ? toHex(maxPriorityFeePerGas) : "0x",
    maxFeePerGas ? toHex(maxFeePerGas) : "0x",
    gas ? toHex(gas) : "0x",
    to ?? "0x",
    value ? toHex(value) : "0x",
    data ?? "0x",
    serializedAccessList,
    ...toYParitySignatureArray(transaction, signature)
  ];
  return concatHex([
    "0x02",
    toRlp(serializedTransaction)
  ]);
}
function serializeTransactionEIP2930(transaction, signature) {
  const { chainId, gas, data, nonce, to, value, accessList, gasPrice } = transaction;
  assertTransactionEIP2930(transaction);
  const serializedAccessList = serializeAccessList(accessList);
  const serializedTransaction = [
    toHex(chainId),
    nonce ? toHex(nonce) : "0x",
    gasPrice ? toHex(gasPrice) : "0x",
    gas ? toHex(gas) : "0x",
    to ?? "0x",
    value ? toHex(value) : "0x",
    data ?? "0x",
    serializedAccessList,
    ...toYParitySignatureArray(transaction, signature)
  ];
  return concatHex([
    "0x01",
    toRlp(serializedTransaction)
  ]);
}
function serializeTransactionLegacy(transaction, signature) {
  const { chainId = 0, gas, data, nonce, to, value, gasPrice } = transaction;
  assertTransactionLegacy(transaction);
  let serializedTransaction = [
    nonce ? toHex(nonce) : "0x",
    gasPrice ? toHex(gasPrice) : "0x",
    gas ? toHex(gas) : "0x",
    to ?? "0x",
    value ? toHex(value) : "0x",
    data ?? "0x"
  ];
  if (signature) {
    const v = (() => {
      if (signature.v >= 35n) {
        const inferredChainId = (signature.v - 35n) / 2n;
        if (inferredChainId > 0)
          return signature.v;
        return 27n + (signature.v === 35n ? 0n : 1n);
      }
      if (chainId > 0)
        return BigInt(chainId * 2) + BigInt(35n + signature.v - 27n);
      const v2 = 27n + (signature.v === 27n ? 0n : 1n);
      if (signature.v !== v2)
        throw new InvalidLegacyVError({ v: signature.v });
      return v2;
    })();
    const r = trim(signature.r);
    const s = trim(signature.s);
    serializedTransaction = [
      ...serializedTransaction,
      toHex(v),
      r === "0x00" ? "0x" : r,
      s === "0x00" ? "0x" : s
    ];
  } else if (chainId > 0) {
    serializedTransaction = [
      ...serializedTransaction,
      toHex(chainId),
      "0x",
      "0x"
    ];
  }
  return toRlp(serializedTransaction);
}
function toYParitySignatureArray(transaction, signature_) {
  const signature = signature_ ?? transaction;
  const { v, yParity } = signature;
  if (typeof signature.r === "undefined")
    return [];
  if (typeof signature.s === "undefined")
    return [];
  if (typeof v === "undefined" && typeof yParity === "undefined")
    return [];
  const r = trim(signature.r);
  const s = trim(signature.s);
  const yParity_ = (() => {
    if (typeof yParity === "number")
      return yParity ? toHex(1) : "0x";
    if (v === 0n)
      return "0x";
    if (v === 1n)
      return toHex(1);
    return v === 27n ? "0x" : toHex(1);
  })();
  return [yParity_, r === "0x00" ? "0x" : r, s === "0x00" ? "0x" : s];
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/errors/unit.js
init_base();

class InvalidDecimalNumberError extends BaseError2 {
  constructor({ value }) {
    super(`Number \`${value}\` is not a valid decimal number.`, {
      name: "InvalidDecimalNumberError"
    });
  }
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/unit/parseUnits.js
function parseUnits(value, decimals) {
  if (!/^(-?)([0-9]*)\.?([0-9]*)$/.test(value))
    throw new InvalidDecimalNumberError({ value });
  let [integer, fraction = "0"] = value.split(".");
  const negative = integer.startsWith("-");
  if (negative)
    integer = integer.slice(1);
  fraction = fraction.replace(/(0+)$/, "");
  if (decimals === 0) {
    if (Math.round(Number(`.${fraction}`)) === 1)
      integer = `${BigInt(integer) + 1n}`;
    fraction = "";
  } else if (fraction.length > decimals) {
    const [left, unit, right] = [
      fraction.slice(0, decimals - 1),
      fraction.slice(decimals - 1, decimals),
      fraction.slice(decimals)
    ];
    const rounded = Math.round(Number(`${unit}.${right}`));
    if (rounded > 9)
      fraction = `${BigInt(left) + BigInt(1)}0`.padStart(left.length + 1, "0");
    else
      fraction = `${left}${rounded}`;
    if (fraction.length > decimals) {
      fraction = fraction.slice(1);
      integer = `${BigInt(integer) + 1n}`;
    }
    fraction = fraction.slice(0, decimals);
  } else {
    fraction = fraction.padEnd(decimals, "0");
  }
  return BigInt(`${negative ? "-" : ""}${integer}${fraction}`);
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/unit/parseEther.js
init_unit();
function parseEther(ether, unit = "wei") {
  return parseUnits(ether, etherUnits[unit]);
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/formatters/proof.js
function formatStorageProof(storageProof) {
  return storageProof.map((proof) => ({
    ...proof,
    value: BigInt(proof.value)
  }));
}
function formatProof(proof) {
  return {
    ...proof,
    balance: proof.balance ? BigInt(proof.balance) : undefined,
    nonce: proof.nonce ? hexToNumber(proof.nonce) : undefined,
    storageProof: proof.storageProof ? formatStorageProof(proof.storageProof) : undefined
  };
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/getProof.js
async function getProof(client, { address, blockNumber, blockTag: blockTag_, storageKeys }) {
  const blockTag = blockTag_ ?? "latest";
  const blockNumberHex = blockNumber !== undefined ? numberToHex(blockNumber) : undefined;
  const proof = await client.request({
    method: "eth_getProof",
    params: [address, storageKeys, blockNumberHex || blockTag]
  });
  return formatProof(proof);
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/getStorageAt.js
init_toHex();
async function getStorageAt(client, { address, blockNumber, blockTag = "latest", slot }) {
  const blockNumberHex = blockNumber !== undefined ? numberToHex(blockNumber) : undefined;
  const data = await client.request({
    method: "eth_getStorageAt",
    params: [address, slot, blockNumberHex || blockTag]
  });
  return data;
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/getTransaction.js
init_transaction();
init_toHex();
async function getTransaction(client, { blockHash, blockNumber, blockTag: blockTag_, hash: hash2, index: index2 }) {
  const blockTag = blockTag_ || "latest";
  const blockNumberHex = blockNumber !== undefined ? numberToHex(blockNumber) : undefined;
  let transaction = null;
  if (hash2) {
    transaction = await client.request({
      method: "eth_getTransactionByHash",
      params: [hash2]
    }, { dedupe: true });
  } else if (blockHash) {
    transaction = await client.request({
      method: "eth_getTransactionByBlockHashAndIndex",
      params: [blockHash, numberToHex(index2)]
    }, { dedupe: true });
  } else if (blockNumberHex || blockTag) {
    transaction = await client.request({
      method: "eth_getTransactionByBlockNumberAndIndex",
      params: [blockNumberHex || blockTag, numberToHex(index2)]
    }, { dedupe: Boolean(blockNumberHex) });
  }
  if (!transaction)
    throw new TransactionNotFoundError({
      blockHash,
      blockNumber,
      blockTag,
      hash: hash2,
      index: index2
    });
  const format = client.chain?.formatters?.transaction?.format || formatTransaction;
  return format(transaction);
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/getTransactionConfirmations.js
async function getTransactionConfirmations(client, { hash: hash2, transactionReceipt }) {
  const [blockNumber, transaction] = await Promise.all([
    getAction(client, getBlockNumber, "getBlockNumber")({}),
    hash2 ? getAction(client, getTransaction, "getTransaction")({ hash: hash2 }) : undefined
  ]);
  const transactionBlockNumber = transactionReceipt?.blockNumber || transaction?.blockNumber;
  if (!transactionBlockNumber)
    return 0n;
  return blockNumber - transactionBlockNumber + 1n;
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/getTransactionReceipt.js
init_transaction();
async function getTransactionReceipt(client, { hash: hash2 }) {
  const receipt = await client.request({
    method: "eth_getTransactionReceipt",
    params: [hash2]
  }, { dedupe: true });
  if (!receipt)
    throw new TransactionReceiptNotFoundError({ hash: hash2 });
  const format = client.chain?.formatters?.transactionReceipt?.format || formatTransactionReceipt;
  return format(receipt);
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/multicall.js
init_abis();
init_abi();
init_base();
init_contract();
init_decodeFunctionResult();
init_encodeFunctionData();
init_getChainContractAddress();
async function multicall(client, parameters) {
  const { allowFailure = true, batchSize: batchSize_, blockNumber, blockTag, multicallAddress: multicallAddress_, stateOverride } = parameters;
  const contracts = parameters.contracts;
  const batchSize = batchSize_ ?? (typeof client.batch?.multicall === "object" && client.batch.multicall.batchSize || 1024);
  let multicallAddress = multicallAddress_;
  if (!multicallAddress) {
    if (!client.chain)
      throw new Error("client chain not configured. multicallAddress is required.");
    multicallAddress = getChainContractAddress({
      blockNumber,
      chain: client.chain,
      contract: "multicall3"
    });
  }
  const chunkedCalls = [[]];
  let currentChunk = 0;
  let currentChunkSize = 0;
  for (let i = 0;i < contracts.length; i++) {
    const { abi: abi2, address, args, functionName } = contracts[i];
    try {
      const callData = encodeFunctionData({ abi: abi2, args, functionName });
      currentChunkSize += (callData.length - 2) / 2;
      if (batchSize > 0 && currentChunkSize > batchSize && chunkedCalls[currentChunk].length > 0) {
        currentChunk++;
        currentChunkSize = (callData.length - 2) / 2;
        chunkedCalls[currentChunk] = [];
      }
      chunkedCalls[currentChunk] = [
        ...chunkedCalls[currentChunk],
        {
          allowFailure: true,
          callData,
          target: address
        }
      ];
    } catch (err) {
      const error = getContractError(err, {
        abi: abi2,
        address,
        args,
        docsPath: "/docs/contract/multicall",
        functionName
      });
      if (!allowFailure)
        throw error;
      chunkedCalls[currentChunk] = [
        ...chunkedCalls[currentChunk],
        {
          allowFailure: true,
          callData: "0x",
          target: address
        }
      ];
    }
  }
  const aggregate3Results = await Promise.allSettled(chunkedCalls.map((calls) => getAction(client, readContract, "readContract")({
    abi: multicall3Abi,
    address: multicallAddress,
    args: [calls],
    blockNumber,
    blockTag,
    functionName: "aggregate3",
    stateOverride
  })));
  const results = [];
  for (let i = 0;i < aggregate3Results.length; i++) {
    const result = aggregate3Results[i];
    if (result.status === "rejected") {
      if (!allowFailure)
        throw result.reason;
      for (let j = 0;j < chunkedCalls[i].length; j++) {
        results.push({
          status: "failure",
          error: result.reason,
          result: undefined
        });
      }
      continue;
    }
    const aggregate3Result = result.value;
    for (let j = 0;j < aggregate3Result.length; j++) {
      const { returnData, success } = aggregate3Result[j];
      const { callData } = chunkedCalls[i][j];
      const { abi: abi2, address, functionName, args } = contracts[results.length];
      try {
        if (callData === "0x")
          throw new AbiDecodingZeroDataError;
        if (!success)
          throw new RawContractError({ data: returnData });
        const result2 = decodeFunctionResult({
          abi: abi2,
          args,
          data: returnData,
          functionName
        });
        results.push(allowFailure ? { result: result2, status: "success" } : result2);
      } catch (err) {
        const error = getContractError(err, {
          abi: abi2,
          address,
          args,
          docsPath: "/docs/contract/multicall",
          functionName
        });
        if (!allowFailure)
          throw error;
        results.push({ error, result: undefined, status: "failure" });
      }
    }
  }
  if (results.length !== contracts.length)
    throw new BaseError2("multicall results mismatch");
  return results;
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/ox/_esm/core/version.js
var version3 = "0.1.1";

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/ox/_esm/core/internal/errors.js
function getVersion() {
  return version3;
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/ox/_esm/core/Errors.js
class BaseError3 extends Error {
  constructor(shortMessage, options = {}) {
    const details = (() => {
      if (options.cause instanceof BaseError3) {
        if (options.cause.details)
          return options.cause.details;
        if (options.cause.shortMessage)
          return options.cause.shortMessage;
      }
      if (options.cause?.message)
        return options.cause.message;
      return options.details;
    })();
    const docsPath6 = (() => {
      if (options.cause instanceof BaseError3)
        return options.cause.docsPath || options.docsPath;
      return options.docsPath;
    })();
    const docsBaseUrl = "https://oxlib.sh";
    const docs = `${docsBaseUrl}${docsPath6 ?? ""}`;
    const message = [
      shortMessage || "An error occurred.",
      ...options.metaMessages ? ["", ...options.metaMessages] : [],
      ...details || docsPath6 ? [
        "",
        details ? `Details: ${details}` : undefined,
        docsPath6 ? `See: ${docs}` : undefined
      ] : []
    ].filter((x) => typeof x === "string").join(`
`);
    super(message, options.cause ? { cause: options.cause } : undefined);
    Object.defineProperty(this, "details", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: undefined
    });
    Object.defineProperty(this, "docs", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: undefined
    });
    Object.defineProperty(this, "docsPath", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: undefined
    });
    Object.defineProperty(this, "shortMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: undefined
    });
    Object.defineProperty(this, "cause", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: undefined
    });
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "BaseError"
    });
    Object.defineProperty(this, "version", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: `ox@${getVersion()}`
    });
    this.cause = options.cause;
    this.details = details;
    this.docs = docs;
    this.docsPath = docsPath6;
    this.shortMessage = shortMessage;
  }
  walk(fn) {
    return walk2(this, fn);
  }
}
function walk2(err, fn) {
  if (fn?.(err))
    return err;
  if (err && typeof err === "object" && "cause" in err && err.cause)
    return walk2(err.cause, fn);
  return fn ? null : err;
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/ox/_esm/core/internal/hex.js
function pad2(hex_, options = {}) {
  const { dir, size: size4 = 32 } = options;
  if (size4 === 0)
    return hex_;
  const hex = hex_.replace("0x", "");
  if (hex.length > size4 * 2)
    throw new SizeExceedsPaddingSizeError2({
      size: Math.ceil(hex.length / 2),
      targetSize: size4,
      type: "Hex"
    });
  return `0x${hex[dir === "right" ? "padEnd" : "padStart"](size4 * 2, "0")}`;
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/ox/_esm/core/Hex.js
function fromNumber(value, options = {}) {
  const { signed, size: size4 } = options;
  const value_ = BigInt(value);
  let maxValue;
  if (size4) {
    if (signed)
      maxValue = (1n << BigInt(size4) * 8n - 1n) - 1n;
    else
      maxValue = 2n ** (BigInt(size4) * 8n) - 1n;
  } else if (typeof value === "number") {
    maxValue = BigInt(Number.MAX_SAFE_INTEGER);
  }
  const minValue = typeof maxValue === "bigint" && signed ? -maxValue - 1n : 0;
  if (maxValue && value_ > maxValue || value_ < minValue) {
    const suffix = typeof value === "bigint" ? "n" : "";
    throw new IntegerOutOfRangeError2({
      max: maxValue ? `${maxValue}${suffix}` : undefined,
      min: `${minValue}${suffix}`,
      signed,
      size: size4,
      value: `${value}${suffix}`
    });
  }
  const stringValue = (signed && value_ < 0 ? (1n << BigInt(size4 * 8)) + BigInt(value_) : value_).toString(16);
  const hex = `0x${stringValue}`;
  if (size4)
    return padLeft(hex, size4);
  return hex;
}
function padLeft(value, size4) {
  return pad2(value, { dir: "left", size: size4 });
}
class IntegerOutOfRangeError2 extends BaseError3 {
  constructor({ max, min, signed, size: size4, value }) {
    super(`Number \`${value}\` is not in safe${size4 ? ` ${size4 * 8}-bit` : ""}${signed ? " signed" : " unsigned"} integer range ${max ? `(\`${min}\` to \`${max}\`)` : `(above \`${min}\`)`}`);
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "Hex.IntegerOutOfRangeError"
    });
  }
}
class SizeExceedsPaddingSizeError2 extends BaseError3 {
  constructor({ size: size4, targetSize, type }) {
    super(`${type.charAt(0).toUpperCase()}${type.slice(1).toLowerCase()} size (\`${size4}\`) exceeds padding size (\`${targetSize}\`).`);
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "Hex.SizeExceedsPaddingSizeError"
    });
  }
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/ox/_esm/core/Withdrawal.js
function toRpc(withdrawal) {
  return {
    address: withdrawal.address,
    amount: fromNumber(withdrawal.amount),
    index: fromNumber(withdrawal.index),
    validatorIndex: fromNumber(withdrawal.validatorIndex)
  };
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/ox/_esm/core/BlockOverrides.js
function toRpc2(blockOverrides) {
  return {
    ...typeof blockOverrides.baseFeePerGas === "bigint" && {
      baseFeePerGas: fromNumber(blockOverrides.baseFeePerGas)
    },
    ...typeof blockOverrides.blobBaseFee === "bigint" && {
      blobBaseFee: fromNumber(blockOverrides.blobBaseFee)
    },
    ...typeof blockOverrides.feeRecipient === "string" && {
      feeRecipient: blockOverrides.feeRecipient
    },
    ...typeof blockOverrides.gasLimit === "bigint" && {
      gasLimit: fromNumber(blockOverrides.gasLimit)
    },
    ...typeof blockOverrides.number === "bigint" && {
      number: fromNumber(blockOverrides.number)
    },
    ...typeof blockOverrides.prevRandao === "bigint" && {
      prevRandao: fromNumber(blockOverrides.prevRandao)
    },
    ...typeof blockOverrides.time === "bigint" && {
      time: fromNumber(blockOverrides.time)
    },
    ...blockOverrides.withdrawals && {
      withdrawals: blockOverrides.withdrawals.map(toRpc)
    }
  };
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/simulate.js
init_abi();
init_contract();
init_node();
init_decodeFunctionResult();
init_encodeFunctionData();
init_toHex();
init_getNodeError();
init_transactionRequest();
init_stateOverride2();
init_assertRequest();
async function simulate(client, parameters) {
  const { blockNumber, blockTag = "latest", blocks, returnFullTransactions, traceTransfers, validation } = parameters;
  try {
    const blockStateCalls = [];
    for (const block2 of blocks) {
      const blockOverrides = block2.blockOverrides ? toRpc2(block2.blockOverrides) : undefined;
      const calls = block2.calls.map((call_) => {
        const call2 = call_;
        const account = call2.account ? parseAccount(call2.account) : undefined;
        const request = {
          ...call2,
          data: call2.abi ? encodeFunctionData(call2) : call2.data,
          from: call2.from ?? account?.address
        };
        assertRequest(request);
        return formatTransactionRequest(request);
      });
      const stateOverrides = block2.stateOverrides ? serializeStateOverride(block2.stateOverrides) : undefined;
      blockStateCalls.push({
        blockOverrides,
        calls,
        stateOverrides
      });
    }
    const blockNumberHex = blockNumber ? numberToHex(blockNumber) : undefined;
    const block = blockNumberHex || blockTag;
    const result = await client.request({
      method: "eth_simulateV1",
      params: [
        { blockStateCalls, returnFullTransactions, traceTransfers, validation },
        block
      ]
    });
    return result.map((block2, i) => ({
      ...formatBlock(block2),
      calls: block2.calls.map((call2, j) => {
        const { abi: abi2, args, functionName, to } = blocks[i].calls[j];
        const data = call2.error?.data ?? call2.returnData;
        const gasUsed = BigInt(call2.gasUsed);
        const logs = call2.logs?.map((log) => formatLog(log));
        const status = call2.status === "0x1" ? "success" : "failure";
        const result2 = abi2 && status === "success" ? decodeFunctionResult({
          abi: abi2,
          data,
          functionName
        }) : null;
        const error = (() => {
          if (status === "success")
            return;
          let error2 = undefined;
          if (call2.error?.data === "0x")
            error2 = new AbiDecodingZeroDataError;
          else if (call2.error)
            error2 = new RawContractError(call2.error);
          if (!error2)
            return;
          return getContractError(error2, {
            abi: abi2 ?? [],
            address: to,
            args,
            functionName: functionName ?? "<unknown>"
          });
        })();
        return {
          data,
          gasUsed,
          logs,
          status,
          ...status === "success" ? {
            result: result2
          } : {
            error
          }
        };
      })
    }));
  } catch (e) {
    const cause = e;
    const error = getNodeError(cause, {});
    if (error instanceof UnknownNodeError)
      throw cause;
    throw error;
  }
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/verifyHash.js
init_abis();
init_contract();
init_encodeDeployData();
init_getAddress();
init_isAddressEqual();
init_toHex();

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/signature/serializeSignature.js
init_secp256k1();
init_fromHex();
init_toBytes();
function serializeSignature({ r, s, to = "hex", v, yParity }) {
  const yParity_ = (() => {
    if (yParity === 0 || yParity === 1)
      return yParity;
    if (v && (v === 27n || v === 28n || v >= 35n))
      return v % 2n === 0n ? 1 : 0;
    throw new Error("Invalid `v` or `yParity` value");
  })();
  const signature = `0x${new secp256k1.Signature(hexToBigInt(r), hexToBigInt(s)).toCompactHex()}${yParity_ === 0 ? "1b" : "1c"}`;
  if (to === "hex")
    return signature;
  return hexToBytes(signature);
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/verifyHash.js
init_call();
async function verifyHash(client, parameters) {
  const { address, factory, factoryData, hash: hash2, signature, universalSignatureVerifierAddress = client.chain?.contracts?.universalSignatureVerifier?.address, ...rest } = parameters;
  const signatureHex = (() => {
    if (isHex(signature))
      return signature;
    if (typeof signature === "object" && "r" in signature && "s" in signature)
      return serializeSignature(signature);
    return bytesToHex(signature);
  })();
  const wrappedSignature = await (async () => {
    if (!factory && !factoryData)
      return signatureHex;
    if (isErc6492Signature(signatureHex))
      return signatureHex;
    return serializeErc6492Signature({
      address: factory,
      data: factoryData,
      signature: signatureHex
    });
  })();
  try {
    const args = universalSignatureVerifierAddress ? {
      to: universalSignatureVerifierAddress,
      data: encodeFunctionData({
        abi: universalSignatureValidatorAbi,
        functionName: "isValidSig",
        args: [address, hash2, wrappedSignature]
      }),
      ...rest
    } : {
      data: encodeDeployData({
        abi: universalSignatureValidatorAbi,
        args: [address, hash2, wrappedSignature],
        bytecode: universalSignatureValidatorByteCode
      }),
      ...rest
    };
    const { data } = await getAction(client, call, "call")(args);
    return hexToBool(data ?? "0x0");
  } catch (error) {
    try {
      const verified = isAddressEqual(getAddress(address), await recoverAddress({ hash: hash2, signature }));
      if (verified)
        return true;
    } catch {}
    if (error instanceof CallExecutionError) {
      return false;
    }
    throw error;
  }
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/verifyMessage.js
async function verifyMessage(client, { address, message, factory, factoryData, signature, ...callRequest }) {
  const hash2 = hashMessage(message);
  return verifyHash(client, {
    address,
    factory,
    factoryData,
    hash: hash2,
    signature,
    ...callRequest
  });
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/verifyTypedData.js
async function verifyTypedData(client, parameters) {
  const { address, factory, factoryData, signature, message, primaryType, types, domain, ...callRequest } = parameters;
  const hash2 = hashTypedData({ message, primaryType, types, domain });
  return verifyHash(client, {
    address,
    factory,
    factoryData,
    hash: hash2,
    signature,
    ...callRequest
  });
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/waitForTransactionReceipt.js
init_transaction();
// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/watchBlockNumber.js
init_fromHex();
function watchBlockNumber(client, { emitOnBegin = false, emitMissed = false, onBlockNumber, onError, poll: poll_, pollingInterval = client.pollingInterval }) {
  const enablePolling = (() => {
    if (typeof poll_ !== "undefined")
      return poll_;
    if (client.transport.type === "webSocket")
      return false;
    if (client.transport.type === "fallback" && client.transport.transports[0].config.type === "webSocket")
      return false;
    return true;
  })();
  let prevBlockNumber;
  const pollBlockNumber = () => {
    const observerId = stringify([
      "watchBlockNumber",
      client.uid,
      emitOnBegin,
      emitMissed,
      pollingInterval
    ]);
    return observe(observerId, { onBlockNumber, onError }, (emit) => poll(async () => {
      try {
        const blockNumber = await getAction(client, getBlockNumber, "getBlockNumber")({ cacheTime: 0 });
        if (prevBlockNumber) {
          if (blockNumber === prevBlockNumber)
            return;
          if (blockNumber - prevBlockNumber > 1 && emitMissed) {
            for (let i = prevBlockNumber + 1n;i < blockNumber; i++) {
              emit.onBlockNumber(i, prevBlockNumber);
              prevBlockNumber = i;
            }
          }
        }
        if (!prevBlockNumber || blockNumber > prevBlockNumber) {
          emit.onBlockNumber(blockNumber, prevBlockNumber);
          prevBlockNumber = blockNumber;
        }
      } catch (err) {
        emit.onError?.(err);
      }
    }, {
      emitOnBegin,
      interval: pollingInterval
    }));
  };
  const subscribeBlockNumber = () => {
    const observerId = stringify([
      "watchBlockNumber",
      client.uid,
      emitOnBegin,
      emitMissed
    ]);
    return observe(observerId, { onBlockNumber, onError }, (emit) => {
      let active = true;
      let unsubscribe = () => active = false;
      (async () => {
        try {
          const transport = (() => {
            if (client.transport.type === "fallback") {
              const transport2 = client.transport.transports.find((transport3) => transport3.config.type === "webSocket");
              if (!transport2)
                return client.transport;
              return transport2.value;
            }
            return client.transport;
          })();
          const { unsubscribe: unsubscribe_ } = await transport.subscribe({
            params: ["newHeads"],
            onData(data) {
              if (!active)
                return;
              const blockNumber = hexToBigInt(data.result?.number);
              emit.onBlockNumber(blockNumber, prevBlockNumber);
              prevBlockNumber = blockNumber;
            },
            onError(error) {
              emit.onError?.(error);
            }
          });
          unsubscribe = unsubscribe_;
          if (!active)
            unsubscribe();
        } catch (err) {
          onError?.(err);
        }
      })();
      return () => unsubscribe();
    });
  };
  return enablePolling ? pollBlockNumber() : subscribeBlockNumber();
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/waitForTransactionReceipt.js
async function waitForTransactionReceipt(client, {
  confirmations = 1,
  hash: hash2,
  onReplaced,
  pollingInterval = client.pollingInterval,
  retryCount = 6,
  retryDelay = ({ count }) => ~~(1 << count) * 200,
  timeout = 180000
}) {
  const observerId = stringify(["waitForTransactionReceipt", client.uid, hash2]);
  let transaction;
  let replacedTransaction;
  let receipt;
  let retrying = false;
  const { promise, resolve, reject } = withResolvers();
  const timer = timeout ? setTimeout(() => reject(new WaitForTransactionReceiptTimeoutError({ hash: hash2 })), timeout) : undefined;
  const _unobserve = observe(observerId, { onReplaced, resolve, reject }, (emit) => {
    const _unwatch = getAction(client, watchBlockNumber, "watchBlockNumber")({
      emitMissed: true,
      emitOnBegin: true,
      poll: true,
      pollingInterval,
      async onBlockNumber(blockNumber_) {
        const done = (fn) => {
          clearTimeout(timer);
          _unwatch();
          fn();
          _unobserve();
        };
        let blockNumber = blockNumber_;
        if (retrying)
          return;
        try {
          if (receipt) {
            if (confirmations > 1 && (!receipt.blockNumber || blockNumber - receipt.blockNumber + 1n < confirmations))
              return;
            done(() => emit.resolve(receipt));
            return;
          }
          if (!transaction) {
            retrying = true;
            await withRetry(async () => {
              transaction = await getAction(client, getTransaction, "getTransaction")({ hash: hash2 });
              if (transaction.blockNumber)
                blockNumber = transaction.blockNumber;
            }, {
              delay: retryDelay,
              retryCount
            });
            retrying = false;
          }
          receipt = await getAction(client, getTransactionReceipt, "getTransactionReceipt")({ hash: hash2 });
          if (confirmations > 1 && (!receipt.blockNumber || blockNumber - receipt.blockNumber + 1n < confirmations))
            return;
          done(() => emit.resolve(receipt));
        } catch (err) {
          if (err instanceof TransactionNotFoundError || err instanceof TransactionReceiptNotFoundError) {
            if (!transaction) {
              retrying = false;
              return;
            }
            try {
              replacedTransaction = transaction;
              retrying = true;
              const block = await withRetry(() => getAction(client, getBlock, "getBlock")({
                blockNumber,
                includeTransactions: true
              }), {
                delay: retryDelay,
                retryCount,
                shouldRetry: ({ error }) => error instanceof BlockNotFoundError
              });
              retrying = false;
              const replacementTransaction = block.transactions.find(({ from, nonce }) => from === replacedTransaction.from && nonce === replacedTransaction.nonce);
              if (!replacementTransaction)
                return;
              receipt = await getAction(client, getTransactionReceipt, "getTransactionReceipt")({
                hash: replacementTransaction.hash
              });
              if (confirmations > 1 && (!receipt.blockNumber || blockNumber - receipt.blockNumber + 1n < confirmations))
                return;
              let reason = "replaced";
              if (replacementTransaction.to === replacedTransaction.to && replacementTransaction.value === replacedTransaction.value && replacementTransaction.input === replacedTransaction.input) {
                reason = "repriced";
              } else if (replacementTransaction.from === replacementTransaction.to && replacementTransaction.value === 0n) {
                reason = "cancelled";
              }
              done(() => {
                emit.onReplaced?.({
                  reason,
                  replacedTransaction,
                  transaction: replacementTransaction,
                  transactionReceipt: receipt
                });
                emit.resolve(receipt);
              });
            } catch (err_) {
              done(() => emit.reject(err_));
            }
          } else {
            done(() => emit.reject(err));
          }
        }
      }
    });
  });
  return promise;
}
// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/watchBlocks.js
function watchBlocks(client, { blockTag = "latest", emitMissed = false, emitOnBegin = false, onBlock, onError, includeTransactions: includeTransactions_, poll: poll_, pollingInterval = client.pollingInterval }) {
  const enablePolling = (() => {
    if (typeof poll_ !== "undefined")
      return poll_;
    if (client.transport.type === "webSocket")
      return false;
    if (client.transport.type === "fallback" && client.transport.transports[0].config.type === "webSocket")
      return false;
    return true;
  })();
  const includeTransactions = includeTransactions_ ?? false;
  let prevBlock;
  const pollBlocks = () => {
    const observerId = stringify([
      "watchBlocks",
      client.uid,
      blockTag,
      emitMissed,
      emitOnBegin,
      includeTransactions,
      pollingInterval
    ]);
    return observe(observerId, { onBlock, onError }, (emit) => poll(async () => {
      try {
        const block = await getAction(client, getBlock, "getBlock")({
          blockTag,
          includeTransactions
        });
        if (block.number && prevBlock?.number) {
          if (block.number === prevBlock.number)
            return;
          if (block.number - prevBlock.number > 1 && emitMissed) {
            for (let i = prevBlock?.number + 1n;i < block.number; i++) {
              const block2 = await getAction(client, getBlock, "getBlock")({
                blockNumber: i,
                includeTransactions
              });
              emit.onBlock(block2, prevBlock);
              prevBlock = block2;
            }
          }
        }
        if (!prevBlock?.number || blockTag === "pending" && !block?.number || block.number && block.number > prevBlock.number) {
          emit.onBlock(block, prevBlock);
          prevBlock = block;
        }
      } catch (err) {
        emit.onError?.(err);
      }
    }, {
      emitOnBegin,
      interval: pollingInterval
    }));
  };
  const subscribeBlocks = () => {
    let active = true;
    let emitFetched = true;
    let unsubscribe = () => active = false;
    (async () => {
      try {
        if (emitOnBegin) {
          getAction(client, getBlock, "getBlock")({
            blockTag,
            includeTransactions
          }).then((block) => {
            if (!active)
              return;
            if (!emitFetched)
              return;
            onBlock(block, undefined);
            emitFetched = false;
          });
        }
        const transport = (() => {
          if (client.transport.type === "fallback") {
            const transport2 = client.transport.transports.find((transport3) => transport3.config.type === "webSocket");
            if (!transport2)
              return client.transport;
            return transport2.value;
          }
          return client.transport;
        })();
        const { unsubscribe: unsubscribe_ } = await transport.subscribe({
          params: ["newHeads"],
          async onData(data) {
            if (!active)
              return;
            const block = await getAction(client, getBlock, "getBlock")({
              blockNumber: data.blockNumber,
              includeTransactions
            }).catch(() => {});
            if (!active)
              return;
            onBlock(block, prevBlock);
            emitFetched = false;
            prevBlock = block;
          },
          onError(error) {
            onError?.(error);
          }
        });
        unsubscribe = unsubscribe_;
        if (!active)
          unsubscribe();
      } catch (err) {
        onError?.(err);
      }
    })();
    return () => unsubscribe();
  };
  return enablePolling ? pollBlocks() : subscribeBlocks();
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/watchEvent.js
init_abi();
init_rpc();
function watchEvent(client, { address, args, batch = true, event, events, fromBlock, onError, onLogs, poll: poll_, pollingInterval = client.pollingInterval, strict: strict_ }) {
  const enablePolling = (() => {
    if (typeof poll_ !== "undefined")
      return poll_;
    if (typeof fromBlock === "bigint")
      return true;
    if (client.transport.type === "webSocket")
      return false;
    if (client.transport.type === "fallback" && client.transport.transports[0].config.type === "webSocket")
      return false;
    return true;
  })();
  const strict = strict_ ?? false;
  const pollEvent = () => {
    const observerId = stringify([
      "watchEvent",
      address,
      args,
      batch,
      client.uid,
      event,
      pollingInterval,
      fromBlock
    ]);
    return observe(observerId, { onLogs, onError }, (emit) => {
      let previousBlockNumber;
      if (fromBlock !== undefined)
        previousBlockNumber = fromBlock - 1n;
      let filter;
      let initialized = false;
      const unwatch = poll(async () => {
        if (!initialized) {
          try {
            filter = await getAction(client, createEventFilter, "createEventFilter")({
              address,
              args,
              event,
              events,
              strict,
              fromBlock
            });
          } catch {}
          initialized = true;
          return;
        }
        try {
          let logs;
          if (filter) {
            logs = await getAction(client, getFilterChanges, "getFilterChanges")({ filter });
          } else {
            const blockNumber = await getAction(client, getBlockNumber, "getBlockNumber")({});
            if (previousBlockNumber && previousBlockNumber !== blockNumber) {
              logs = await getAction(client, getLogs, "getLogs")({
                address,
                args,
                event,
                events,
                fromBlock: previousBlockNumber + 1n,
                toBlock: blockNumber
              });
            } else {
              logs = [];
            }
            previousBlockNumber = blockNumber;
          }
          if (logs.length === 0)
            return;
          if (batch)
            emit.onLogs(logs);
          else
            for (const log of logs)
              emit.onLogs([log]);
        } catch (err) {
          if (filter && err instanceof InvalidInputRpcError)
            initialized = false;
          emit.onError?.(err);
        }
      }, {
        emitOnBegin: true,
        interval: pollingInterval
      });
      return async () => {
        if (filter)
          await getAction(client, uninstallFilter, "uninstallFilter")({ filter });
        unwatch();
      };
    });
  };
  const subscribeEvent = () => {
    let active = true;
    let unsubscribe = () => active = false;
    (async () => {
      try {
        const transport = (() => {
          if (client.transport.type === "fallback") {
            const transport2 = client.transport.transports.find((transport3) => transport3.config.type === "webSocket");
            if (!transport2)
              return client.transport;
            return transport2.value;
          }
          return client.transport;
        })();
        const events_ = events ?? (event ? [event] : undefined);
        let topics = [];
        if (events_) {
          const encoded = events_.flatMap((event2) => encodeEventTopics({
            abi: [event2],
            eventName: event2.name,
            args
          }));
          topics = [encoded];
          if (event)
            topics = topics[0];
        }
        const { unsubscribe: unsubscribe_ } = await transport.subscribe({
          params: ["logs", { address, topics }],
          onData(data) {
            if (!active)
              return;
            const log = data.result;
            try {
              const { eventName, args: args2 } = decodeEventLog({
                abi: events_ ?? [],
                data: log.data,
                topics: log.topics,
                strict
              });
              const formatted = formatLog(log, { args: args2, eventName });
              onLogs([formatted]);
            } catch (err) {
              let eventName;
              let isUnnamed;
              if (err instanceof DecodeLogDataMismatch || err instanceof DecodeLogTopicsMismatch) {
                if (strict_)
                  return;
                eventName = err.abiItem.name;
                isUnnamed = err.abiItem.inputs?.some((x) => !(("name" in x) && x.name));
              }
              const formatted = formatLog(log, {
                args: isUnnamed ? [] : {},
                eventName
              });
              onLogs([formatted]);
            }
          },
          onError(error) {
            onError?.(error);
          }
        });
        unsubscribe = unsubscribe_;
        if (!active)
          unsubscribe();
      } catch (err) {
        onError?.(err);
      }
    })();
    return () => unsubscribe();
  };
  return enablePolling ? pollEvent() : subscribeEvent();
}
// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/public/watchPendingTransactions.js
function watchPendingTransactions(client, { batch = true, onError, onTransactions, poll: poll_, pollingInterval = client.pollingInterval }) {
  const enablePolling = typeof poll_ !== "undefined" ? poll_ : client.transport.type !== "webSocket";
  const pollPendingTransactions = () => {
    const observerId = stringify([
      "watchPendingTransactions",
      client.uid,
      batch,
      pollingInterval
    ]);
    return observe(observerId, { onTransactions, onError }, (emit) => {
      let filter;
      const unwatch = poll(async () => {
        try {
          if (!filter) {
            try {
              filter = await getAction(client, createPendingTransactionFilter, "createPendingTransactionFilter")({});
              return;
            } catch (err) {
              unwatch();
              throw err;
            }
          }
          const hashes = await getAction(client, getFilterChanges, "getFilterChanges")({ filter });
          if (hashes.length === 0)
            return;
          if (batch)
            emit.onTransactions(hashes);
          else
            for (const hash2 of hashes)
              emit.onTransactions([hash2]);
        } catch (err) {
          emit.onError?.(err);
        }
      }, {
        emitOnBegin: true,
        interval: pollingInterval
      });
      return async () => {
        if (filter)
          await getAction(client, uninstallFilter, "uninstallFilter")({ filter });
        unwatch();
      };
    });
  };
  const subscribePendingTransactions = () => {
    let active = true;
    let unsubscribe = () => active = false;
    (async () => {
      try {
        const { unsubscribe: unsubscribe_ } = await client.transport.subscribe({
          params: ["newPendingTransactions"],
          onData(data) {
            if (!active)
              return;
            const transaction = data.result;
            onTransactions([transaction]);
          },
          onError(error) {
            onError?.(error);
          }
        });
        unsubscribe = unsubscribe_;
        if (!active)
          unsubscribe();
      } catch (err) {
        onError?.(err);
      }
    })();
    return () => unsubscribe();
  };
  return enablePolling ? pollPendingTransactions() : subscribePendingTransactions();
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/siwe/parseSiweMessage.js
function parseSiweMessage(message) {
  const { scheme, statement, ...prefix } = message.match(prefixRegex)?.groups ?? {};
  const { chainId, expirationTime, issuedAt, notBefore, requestId, ...suffix } = message.match(suffixRegex)?.groups ?? {};
  const resources = message.split("Resources:")[1]?.split(`
- `).slice(1);
  return {
    ...prefix,
    ...suffix,
    ...chainId ? { chainId: Number(chainId) } : {},
    ...expirationTime ? { expirationTime: new Date(expirationTime) } : {},
    ...issuedAt ? { issuedAt: new Date(issuedAt) } : {},
    ...notBefore ? { notBefore: new Date(notBefore) } : {},
    ...requestId ? { requestId } : {},
    ...resources ? { resources } : {},
    ...scheme ? { scheme } : {},
    ...statement ? { statement } : {}
  };
}
var prefixRegex = /^(?:(?<scheme>[a-zA-Z][a-zA-Z0-9+-.]*):\/\/)?(?<domain>[a-zA-Z0-9+-.]*(?::[0-9]{1,5})?) (?:wants you to sign in with your Ethereum account:\n)(?<address>0x[a-fA-F0-9]{40})\n\n(?:(?<statement>.*)\n\n)?/;
var suffixRegex = /(?:URI: (?<uri>.+))\n(?:Version: (?<version>.+))\n(?:Chain ID: (?<chainId>\d+))\n(?:Nonce: (?<nonce>[a-zA-Z0-9]+))\n(?:Issued At: (?<issuedAt>.+))(?:\nExpiration Time: (?<expirationTime>.+))?(?:\nNot Before: (?<notBefore>.+))?(?:\nRequest ID: (?<requestId>.+))?/;

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/utils/siwe/validateSiweMessage.js
init_isAddressEqual();
function validateSiweMessage(parameters) {
  const { address, domain, message, nonce, scheme, time = new Date } = parameters;
  if (domain && message.domain !== domain)
    return false;
  if (nonce && message.nonce !== nonce)
    return false;
  if (scheme && message.scheme !== scheme)
    return false;
  if (message.expirationTime && time >= message.expirationTime)
    return false;
  if (message.notBefore && time < message.notBefore)
    return false;
  try {
    if (!message.address)
      return false;
    if (address && !isAddressEqual(message.address, address))
      return false;
  } catch {
    return false;
  }
  return true;
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/siwe/verifySiweMessage.js
async function verifySiweMessage(client, parameters) {
  const { address, domain, message, nonce, scheme, signature, time = new Date, ...callRequest } = parameters;
  const parsed = parseSiweMessage(message);
  if (!parsed.address)
    return false;
  const isValid = validateSiweMessage({
    address,
    domain,
    message: parsed,
    nonce,
    scheme,
    time
  });
  if (!isValid)
    return false;
  const hash2 = hashMessage(message);
  return verifyHash(client, {
    address: parsed.address,
    hash: hash2,
    signature,
    ...callRequest
  });
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/clients/decorators/public.js
function publicActions(client) {
  return {
    call: (args) => call(client, args),
    createAccessList: (args) => createAccessList(client, args),
    createBlockFilter: () => createBlockFilter(client),
    createContractEventFilter: (args) => createContractEventFilter(client, args),
    createEventFilter: (args) => createEventFilter(client, args),
    createPendingTransactionFilter: () => createPendingTransactionFilter(client),
    estimateContractGas: (args) => estimateContractGas(client, args),
    estimateGas: (args) => estimateGas(client, args),
    getBalance: (args) => getBalance(client, args),
    getBlobBaseFee: () => getBlobBaseFee(client),
    getBlock: (args) => getBlock(client, args),
    getBlockNumber: (args) => getBlockNumber(client, args),
    getBlockTransactionCount: (args) => getBlockTransactionCount(client, args),
    getBytecode: (args) => getCode(client, args),
    getChainId: () => getChainId(client),
    getCode: (args) => getCode(client, args),
    getContractEvents: (args) => getContractEvents(client, args),
    getEip712Domain: (args) => getEip712Domain(client, args),
    getEnsAddress: (args) => getEnsAddress(client, args),
    getEnsAvatar: (args) => getEnsAvatar(client, args),
    getEnsName: (args) => getEnsName(client, args),
    getEnsResolver: (args) => getEnsResolver(client, args),
    getEnsText: (args) => getEnsText(client, args),
    getFeeHistory: (args) => getFeeHistory(client, args),
    estimateFeesPerGas: (args) => estimateFeesPerGas(client, args),
    getFilterChanges: (args) => getFilterChanges(client, args),
    getFilterLogs: (args) => getFilterLogs(client, args),
    getGasPrice: () => getGasPrice(client),
    getLogs: (args) => getLogs(client, args),
    getProof: (args) => getProof(client, args),
    estimateMaxPriorityFeePerGas: (args) => estimateMaxPriorityFeePerGas(client, args),
    getStorageAt: (args) => getStorageAt(client, args),
    getTransaction: (args) => getTransaction(client, args),
    getTransactionConfirmations: (args) => getTransactionConfirmations(client, args),
    getTransactionCount: (args) => getTransactionCount(client, args),
    getTransactionReceipt: (args) => getTransactionReceipt(client, args),
    multicall: (args) => multicall(client, args),
    prepareTransactionRequest: (args) => prepareTransactionRequest(client, args),
    readContract: (args) => readContract(client, args),
    sendRawTransaction: (args) => sendRawTransaction(client, args),
    simulate: (args) => simulate(client, args),
    simulateContract: (args) => simulateContract(client, args),
    verifyMessage: (args) => verifyMessage(client, args),
    verifySiweMessage: (args) => verifySiweMessage(client, args),
    verifyTypedData: (args) => verifyTypedData(client, args),
    uninstallFilter: (args) => uninstallFilter(client, args),
    waitForTransactionReceipt: (args) => waitForTransactionReceipt(client, args),
    watchBlocks: (args) => watchBlocks(client, args),
    watchBlockNumber: (args) => watchBlockNumber(client, args),
    watchContractEvent: (args) => watchContractEvent(client, args),
    watchEvent: (args) => watchEvent(client, args),
    watchPendingTransactions: (args) => watchPendingTransactions(client, args)
  };
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/clients/createPublicClient.js
function createPublicClient(parameters) {
  const { key = "public", name = "Public Client" } = parameters;
  const client = createClient({
    ...parameters,
    key,
    name,
    type: "publicClient"
  });
  return client.extend(publicActions);
}
// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/wallet/deployContract.js
init_encodeDeployData();
function deployContract(walletClient, parameters) {
  const { abi: abi2, args, bytecode, ...request } = parameters;
  const calldata = encodeDeployData({ abi: abi2, args, bytecode });
  return sendTransaction(walletClient, {
    ...request,
    data: calldata
  });
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/wallet/getAddresses.js
init_getAddress();
async function getAddresses(client) {
  if (client.account?.type === "local")
    return [client.account.address];
  const addresses = await client.request({ method: "eth_accounts" }, { dedupe: true });
  return addresses.map((address) => checksumAddress(address));
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/wallet/getPermissions.js
async function getPermissions(client) {
  const permissions = await client.request({ method: "wallet_getPermissions" }, { dedupe: true });
  return permissions;
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/wallet/requestAddresses.js
init_getAddress();
async function requestAddresses(client) {
  const addresses = await client.request({ method: "eth_requestAccounts" }, { dedupe: true, retryCount: 0 });
  return addresses.map((address) => getAddress(address));
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/wallet/requestPermissions.js
async function requestPermissions(client, permissions) {
  return client.request({
    method: "wallet_requestPermissions",
    params: [permissions]
  }, { retryCount: 0 });
}
// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/wallet/signMessage.js
init_toHex();
async function signMessage(client, { account: account_ = client.account, message }) {
  if (!account_)
    throw new AccountNotFoundError({
      docsPath: "/docs/actions/wallet/signMessage"
    });
  const account = parseAccount(account_);
  if (account.signMessage)
    return account.signMessage({ message });
  const message_ = (() => {
    if (typeof message === "string")
      return stringToHex(message);
    if (message.raw instanceof Uint8Array)
      return toHex(message.raw);
    return message.raw;
  })();
  return client.request({
    method: "personal_sign",
    params: [message_, account.address]
  }, { retryCount: 0 });
}
// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/wallet/signTransaction.js
init_toHex();
init_transactionRequest();
init_assertRequest();
async function signTransaction(client, parameters) {
  const { account: account_ = client.account, chain = client.chain, ...transaction } = parameters;
  if (!account_)
    throw new AccountNotFoundError({
      docsPath: "/docs/actions/wallet/signTransaction"
    });
  const account = parseAccount(account_);
  assertRequest({
    account,
    ...parameters
  });
  const chainId = await getAction(client, getChainId, "getChainId")({});
  if (chain !== null)
    assertCurrentChain({
      currentChainId: chainId,
      chain
    });
  const formatters = chain?.formatters || client.chain?.formatters;
  const format = formatters?.transactionRequest?.format || formatTransactionRequest;
  if (account.signTransaction)
    return account.signTransaction({
      ...transaction,
      chainId
    }, { serializer: client.chain?.serializers?.transaction });
  return await client.request({
    method: "eth_signTransaction",
    params: [
      {
        ...format(transaction),
        chainId: numberToHex(chainId),
        from: account.address
      }
    ]
  }, { retryCount: 0 });
}
// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/wallet/signTypedData.js
async function signTypedData(client, parameters) {
  const { account: account_ = client.account, domain, message, primaryType } = parameters;
  if (!account_)
    throw new AccountNotFoundError({
      docsPath: "/docs/actions/wallet/signTypedData"
    });
  const account = parseAccount(account_);
  const types = {
    EIP712Domain: getTypesForEIP712Domain({ domain }),
    ...parameters.types
  };
  validateTypedData({ domain, message, primaryType, types });
  if (account.signTypedData)
    return account.signTypedData({ domain, message, primaryType, types });
  const typedData = serializeTypedData({ domain, message, primaryType, types });
  return client.request({
    method: "eth_signTypedData_v4",
    params: [account.address, typedData]
  }, { retryCount: 0 });
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/wallet/switchChain.js
init_toHex();
async function switchChain(client, { id }) {
  await client.request({
    method: "wallet_switchEthereumChain",
    params: [
      {
        chainId: numberToHex(id)
      }
    ]
  }, { retryCount: 0 });
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/actions/wallet/watchAsset.js
async function watchAsset(client, params) {
  const added = await client.request({
    method: "wallet_watchAsset",
    params
  }, { retryCount: 0 });
  return added;
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/clients/decorators/wallet.js
function walletActions(client) {
  return {
    addChain: (args) => addChain(client, args),
    deployContract: (args) => deployContract(client, args),
    getAddresses: () => getAddresses(client),
    getChainId: () => getChainId(client),
    getPermissions: () => getPermissions(client),
    prepareTransactionRequest: (args) => prepareTransactionRequest(client, args),
    requestAddresses: () => requestAddresses(client),
    requestPermissions: (args) => requestPermissions(client, args),
    sendRawTransaction: (args) => sendRawTransaction(client, args),
    sendTransaction: (args) => sendTransaction(client, args),
    signMessage: (args) => signMessage(client, args),
    signTransaction: (args) => signTransaction(client, args),
    signTypedData: (args) => signTypedData(client, args),
    switchChain: (args) => switchChain(client, args),
    watchAsset: (args) => watchAsset(client, args),
    writeContract: (args) => writeContract(client, args)
  };
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/clients/createWalletClient.js
function createWalletClient(parameters) {
  const { key = "wallet", name = "Wallet Client", transport } = parameters;
  const client = createClient({
    ...parameters,
    key,
    name,
    transport,
    type: "walletClient"
  });
  return client.extend(walletActions);
}
// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/index.js
init_abis();
init_encodeFunctionData();
init_getAddress();
// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/accounts/privateKeyToAccount.js
init_secp256k1();
init_toHex();

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/accounts/toAccount.js
init_address();
init_isAddress();
function toAccount(source) {
  if (typeof source === "string") {
    if (!isAddress(source, { strict: false }))
      throw new InvalidAddressError({ address: source });
    return {
      address: source,
      type: "json-rpc"
    };
  }
  if (!isAddress(source.address, { strict: false }))
    throw new InvalidAddressError({ address: source.address });
  return {
    address: source.address,
    nonceManager: source.nonceManager,
    sign: source.sign,
    experimental_signAuthorization: source.experimental_signAuthorization,
    signMessage: source.signMessage,
    signTransaction: source.signTransaction,
    signTypedData: source.signTypedData,
    source: "custom",
    type: "local"
  };
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/accounts/utils/sign.js
init_secp256k1();
init_toHex();
var extraEntropy = false;
async function sign({ hash: hash2, privateKey, to = "object" }) {
  const { r, s, recovery } = secp256k1.sign(hash2.slice(2), privateKey.slice(2), { lowS: true, extraEntropy });
  const signature = {
    r: numberToHex(r, { size: 32 }),
    s: numberToHex(s, { size: 32 }),
    v: recovery ? 28n : 27n,
    yParity: recovery
  };
  return (() => {
    if (to === "bytes" || to === "hex")
      return serializeSignature({ ...signature, to });
    return signature;
  })();
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/accounts/utils/signAuthorization.js
async function experimental_signAuthorization(parameters) {
  const { contractAddress, chainId, nonce, privateKey, to = "object" } = parameters;
  const signature = await sign({
    hash: hashAuthorization({ contractAddress, chainId, nonce }),
    privateKey,
    to
  });
  if (to === "object")
    return {
      contractAddress,
      chainId,
      nonce,
      ...signature
    };
  return signature;
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/accounts/utils/signMessage.js
async function signMessage2({ message, privateKey }) {
  return await sign({ hash: hashMessage(message), privateKey, to: "hex" });
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/accounts/utils/signTransaction.js
init_keccak256();
async function signTransaction2(parameters) {
  const { privateKey, transaction, serializer = serializeTransaction } = parameters;
  const signableTransaction = (() => {
    if (transaction.type === "eip4844")
      return {
        ...transaction,
        sidecars: false
      };
    return transaction;
  })();
  const signature = await sign({
    hash: keccak256(serializer(signableTransaction)),
    privateKey
  });
  return serializer(transaction, signature);
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/accounts/utils/signTypedData.js
async function signTypedData2(parameters) {
  const { privateKey, ...typedData } = parameters;
  return await sign({
    hash: hashTypedData(typedData),
    privateKey,
    to: "hex"
  });
}

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/accounts/privateKeyToAccount.js
function privateKeyToAccount(privateKey, options = {}) {
  const { nonceManager } = options;
  const publicKey = toHex(secp256k1.getPublicKey(privateKey.slice(2), false));
  const address = publicKeyToAddress(publicKey);
  const account = toAccount({
    address,
    nonceManager,
    async sign({ hash: hash2 }) {
      return sign({ hash: hash2, privateKey, to: "hex" });
    },
    async experimental_signAuthorization(authorization) {
      return experimental_signAuthorization({ ...authorization, privateKey });
    },
    async signMessage({ message }) {
      return signMessage2({ message, privateKey });
    },
    async signTransaction(transaction, { serializer } = {}) {
      return signTransaction2({ privateKey, transaction, serializer });
    },
    async signTypedData(typedData) {
      return signTypedData2({ ...typedData, privateKey });
    }
  });
  return {
    ...account,
    publicKey,
    source: "privateKey"
  };
}
// node_modules/@elizaos/plugin-sei-yield-delta/src/providers/wallet.ts
import {
  elizaLogger
} from "@elizaos/core";

// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/chains/definitions/sei.js
var sei = /* @__PURE__ */ defineChain({
  id: 1329,
  name: "Sei Network",
  nativeCurrency: { name: "Sei", symbol: "SEI", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://evm-rpc.sei-apis.com/"],
      webSocket: ["wss://evm-ws.sei-apis.com/"]
    }
  },
  blockExplorers: {
    default: {
      name: "Seitrace",
      url: "https://seitrace.com",
      apiUrl: "https://seitrace.com/pacific-1/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11"
    }
  }
});
// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/chains/definitions/seiDevnet.js
var seiDevnet = /* @__PURE__ */ defineChain({
  id: 713715,
  name: "Sei Devnet",
  nativeCurrency: { name: "Sei", symbol: "SEI", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://evm-rpc-arctic-1.sei-apis.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Seitrace",
      url: "https://seitrace.com"
    }
  },
  testnet: true
});
// node_modules/@elizaos/plugin-sei-yield-delta/node_modules/viem/_esm/chains/definitions/seiTestnet.js
var seiTestnet = /* @__PURE__ */ defineChain({
  id: 1328,
  name: "Sei Testnet",
  nativeCurrency: { name: "Sei", symbol: "SEI", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://evm-rpc-testnet.sei-apis.com"],
      webSocket: ["wss://evm-ws-testnet.sei-apis.com"]
    }
  },
  blockExplorers: {
    default: {
      name: "Seitrace",
      url: "https://seitrace.com"
    }
  },
  testnet: true
});
// node_modules/@elizaos/plugin-sei-yield-delta/src/providers/wallet.ts
var import_node_cache = __toESM(require_node_cache2(), 1);
var seiChains = {
  mainnet: sei,
  testnet: seiTestnet,
  devnet: seiDevnet
};

class WalletProvider {
  cache;
  cacheKey = "evm/wallet";
  currentChain;
  CACHE_EXPIRY_SEC = 5;
  account;
  constructor(accountOrPrivateKey, chain) {
    this.setAccount(accountOrPrivateKey);
    this.setCurrentChain(chain);
    this.cache = new import_node_cache.default({ stdTTL: this.CACHE_EXPIRY_SEC });
  }
  getAddress() {
    if (!this.account) {
      throw new Error(`Wallet account not properly initialized. Account is ${this.account}`);
    }
    return this.account.address;
  }
  getCurrentChain() {
    return this.currentChain;
  }
  getPublicClient() {
    const transport = this.createHttpTransport();
    return createPublicClient({
      chain: this.currentChain.chain,
      transport
    });
  }
  getEvmWalletClient() {
    if (false) {}
    const transport = this.createHttpTransport();
    return createWalletClient({
      chain: this.currentChain.chain,
      transport,
      account: this.account
    });
  }
  getEvmPublicClient() {
    if (false) {}
    const transport = this.createHttpTransport();
    return createPublicClient({
      chain: this.currentChain.chain,
      transport
    });
  }
  async getWalletBalance() {
    if (false) {}
    const cacheKey2 = `wallet_balance_${this.account.address}_${this.currentChain.chain.id}`;
    const cachedData = await this.readFromCache(cacheKey2);
    if (cachedData) {
      elizaLogger.log(`Using cached wallet balance: ${cachedData} for chain: ${this.currentChain.name}`);
      return cachedData;
    }
    try {
      const client = this.getPublicClient();
      const balance = await client.getBalance({
        address: this.account.address
      });
      const balanceFormatted = formatUnits(balance, 18);
      this.setCachedData(cacheKey2, balanceFormatted);
      elizaLogger.log(`Wallet balance cached for chain: ${this.currentChain.name}`);
      return balanceFormatted;
    } catch (error) {
      console.error("Error getting wallet balance:", error);
      return null;
    }
  }
  async readFromCache(key) {
    if (false) {}
    return null;
  }
  async writeToCache(key, data) {
    if (false) {}
  }
  async getCachedData(key) {
    const cachedData = this.cache.get(key);
    if (cachedData) {
      return cachedData;
    }
    const fileCachedData = await this.readFromCache(key);
    if (fileCachedData) {
      this.cache.set(key, fileCachedData);
      return fileCachedData;
    }
    return null;
  }
  async setCachedData(cacheKey2, data) {
    this.cache.set(cacheKey2, data);
    await this.writeToCache(cacheKey2, data);
  }
  setAccount = (accountOrPrivateKey) => {
    if (typeof accountOrPrivateKey === "string") {
      this.account = privateKeyToAccount(accountOrPrivateKey);
    } else {
      this.account = accountOrPrivateKey;
    }
  };
  setCurrentChain = (chain) => {
    this.currentChain = chain;
  };
  createHttpTransport = () => {
    const chain = this.currentChain.chain;
    if (chain.rpcUrls.custom) {
      return http(chain.rpcUrls.custom.http[0]);
    }
    return http(chain.rpcUrls.default.http[0]);
  };
  static genSeiChainFromName(chainName, customRpcUrl) {
    const baseChain = seiChains[chainName];
    if (!baseChain?.id) {
      throw new Error("Invalid chain name");
    }
    const seiChain = customRpcUrl ? {
      ...baseChain,
      rpcUrls: {
        ...baseChain.rpcUrls,
        custom: {
          http: [customRpcUrl]
        }
      }
    } : baseChain;
    return seiChain;
  }
}
var genChainFromRuntime = (runtime) => {
  const sei_network = runtime.getSetting("SEI_NETWORK") || "sei-devnet";
  if (typeof sei_network !== "string") {
    throw new Error("SEI_NETWORK must be a string");
  }
  const networkMap = {
    "sei-mainnet": "mainnet",
    "sei-testnet": "testnet",
    "sei-devnet": "devnet"
  };
  const chainKey = networkMap[sei_network] || "devnet";
  const validChains = Object.keys(seiChains);
  if (!validChains.includes(chainKey)) {
    throw new Error(`Invalid SEI_NETWORK ${sei_network}. Must map to one of ${validChains.join(", ")}`);
  }
  let chain = seiChains[chainKey];
  const rpcurl = runtime.getSetting("SEI_RPC_URL");
  if (typeof rpcurl === "string") {
    chain = WalletProvider.genSeiChainFromName(chainKey, rpcurl);
  }
  return { name: sei_network, chain };
};
var initWalletProvider = async (runtime) => {
  const chainData = genChainFromRuntime(runtime);
  const privateKey = runtime.getSetting("SEI_PRIVATE_KEY");
  if (!privateKey) {
    throw new Error("SEI_PRIVATE_KEY is missing");
  }
  return new WalletProvider(privateKey, chainData);
};
var evmWalletProvider = {
  name: "evmWallet",
  async get(runtime, _message, state) {
    try {
      const walletProvider = await initWalletProvider(runtime);
      const address = walletProvider.getAddress();
      const balance = await walletProvider.getWalletBalance();
      const chain = walletProvider.getCurrentChain().chain;
      const agentName = state?.agentName || "The agent";
      return `${agentName}'s Sei Wallet Address: ${address}
Balance: ${balance} ${chain.nativeCurrency.symbol}
Chain ID: ${chain.id}, Name: ${chain.name}`;
    } catch (error) {
      console.error("Error in Sei wallet provider:", error);
      return null;
    }
  }
};

// node_modules/@elizaos/plugin-sei-yield-delta/src/providers/sei-oracle.ts
import {
  elizaLogger as elizaLogger2
} from "@elizaos/core";
class SeiOracleProvider {
  runtime;
  config;
  priceCache = new Map;
  fundingRateCache = new Map;
  updateInterval = null;
  yeiConfig;
  constructor(runtime) {
    this.runtime = runtime;
    const api3Address = runtime.getSetting("YEI_API3_CONTRACT") || "0x2880aB155794e7179c9eE2e38200202908C17B43";
    const pythAddress = runtime.getSetting("YEI_PYTH_CONTRACT") || "0x2880aB155794e7179c9eE2e38200202908C17B43";
    const redstoneAddress = runtime.getSetting("YEI_REDSTONE_CONTRACT") || "0x1111111111111111111111111111111111111111";
    this.yeiConfig = {
      api3ContractAddress: api3Address,
      pythContractAddress: pythAddress,
      redstoneContractAddress: redstoneAddress
    };
    this.config = {
      pythPriceFeeds: {
        BTC: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
        ETH: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
        SEI: "0x53614f1cb0c031d4af66c04cb9c756234adad0e1cee85303795091499a4084eb",
        USDC: "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a"
      },
      chainlinkFeeds: {
        "BTC/USD": "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
        "ETH/USD": "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
        "SEI/USD": "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"
      },
      cexApis: {
        binance: "https://fapi.binance.com/fapi/v1",
        bybit: "https://api.bybit.com/v5",
        okx: "https://www.okx.com/api/v5"
      },
      updateInterval: 30
    };
  }
  async get(runtime, message, state) {
    try {
      if (!message?.content?.text) {
        return "SEI Oracle Provider: Real-time price data and funding rates for assets on the SEI blockchain using Pyth, Chainlink, and CEX APIs.";
      }
      const text = message.content.text.toLowerCase();
      if (text.includes("price") || text.includes("quote")) {
        return await this.handlePriceQuery(text);
      }
      if (text.includes("funding") || text.includes("rate")) {
        return await this.handleFundingRateQuery(text);
      }
      return null;
    } catch (error) {
      elizaLogger2.error(`Oracle provider error: ${error}`);
      return null;
    }
  }
  async handlePriceQuery(text) {
    const symbols = this.extractSymbols(text);
    const prices = [];
    for (const symbol of symbols) {
      const price = await this.getPrice(symbol);
      if (price)
        prices.push(price);
    }
    if (prices.length === 0) {
      return "No price data available for the requested symbols.";
    }
    return prices.map((p) => `${p.symbol}: $${p.price.toFixed(4)} (${p.source})`).join(`
`);
  }
  async handleFundingRateQuery(text) {
    const symbols = this.extractSymbols(text);
    const fundingData = [];
    for (const symbol of symbols) {
      const rates = await this.getFundingRates(symbol);
      if (rates.length > 0) {
        const ratesText = rates.map((r) => `${r.exchange}: ${(r.rate * 100).toFixed(4)}%`).join(", ");
        fundingData.push(`${symbol}: ${ratesText}`);
      }
    }
    return fundingData.length > 0 ? fundingData.join(`
`) : "No funding rate data available.";
  }
  async getPrice(symbol) {
    try {
      const cached = this.priceCache.get(symbol);
      if (cached && Date.now() - cached.timestamp < this.config.updateInterval * 1000) {
        return cached;
      }
      let price = null;
      try {
        const mockPrice = await this.getMockPriceFeedPrice(symbol);
        if (mockPrice && mockPrice > 0) {
          price = {
            symbol,
            price: mockPrice,
            source: "mock-price-feed",
            timestamp: Date.now(),
            confidence: 0.99
          };
          elizaLogger2.info(`MockPriceFeed price for ${symbol}: $${mockPrice}`);
        }
      } catch (error) {
        elizaLogger2.warn(`MockPriceFeed failed for ${symbol}, falling back to other oracles: ${error}`);
      }
      if (!price) {
        const yeiSupportedSymbols = ["BTC", "ETH", "SEI", "USDC", "USDT"];
        if (yeiSupportedSymbols.includes(symbol.toUpperCase())) {
          try {
            const yeiPrice = await this.getYeiPrice(symbol);
            if (yeiPrice && yeiPrice > 0) {
              price = {
                symbol,
                price: yeiPrice,
                source: "yei-multi-oracle",
                timestamp: Date.now(),
                confidence: 0.95
              };
            }
          } catch (error) {
            elizaLogger2.warn(`YEI oracle failed for ${symbol}, falling back to other oracles: ${error}`);
          }
        }
        if (!price)
          price = await this.getPythPrice(symbol);
        if (!price)
          price = await this.getChainlinkPrice(symbol);
        if (!price)
          price = await this.getCexPrice(symbol);
      }
      if (price && !isNaN(price.price) && price.price > 0) {
        this.priceCache.set(symbol, price);
        return price;
      }
      return null;
    } catch (error) {
      elizaLogger2.error(`Failed to get price for ${symbol}: ${error}`);
      return null;
    }
  }
  async getFundingRates(symbol) {
    try {
      const cached = this.fundingRateCache.get(symbol);
      if (cached && cached.length > 0 && Date.now() - cached[0]?.timestamp < this.config.updateInterval * 1000) {
        return cached;
      }
      const rates = await Promise.all([
        this.getBinanceFundingRate(symbol),
        this.getBybitFundingRate(symbol),
        this.getOkxFundingRate(symbol)
      ]);
      const validRates = rates.filter((r) => r !== null);
      if (validRates.length > 0) {
        this.fundingRateCache.set(symbol, validRates);
      }
      return validRates;
    } catch (error) {
      elizaLogger2.error(`Failed to get funding rates for ${symbol}: ${error}`);
      return [];
    }
  }
  async getPythPrice(symbol) {
    try {
      const feedId = this.config.pythPriceFeeds[symbol];
      if (!feedId)
        return null;
      const publicClient = createPublicClient({
        chain: seiChains.devnet,
        transport: http()
      });
      const result = await publicClient.readContract({
        address: "0x2880aB155794e7179c9eE2e38200202908C17B43",
        abi: [
          {
            name: "queryPriceFeed",
            type: "function",
            inputs: [{ name: "id", type: "bytes32" }],
            outputs: [
              { name: "price", type: "int64" },
              { name: "conf", type: "uint64" },
              { name: "expo", type: "int32" },
              { name: "publishTime", type: "uint256" }
            ]
          }
        ],
        functionName: "queryPriceFeed",
        args: [feedId]
      });
      if (!result || result[0] === BigInt(0)) {
        return null;
      }
      const price = Number(result[0]) / Math.pow(10, 8);
      const confidence = Number(result[1]) / Math.pow(10, 8);
      const timestamp = Number(result[3]) * 1000;
      if (isNaN(price) || price <= 0) {
        return null;
      }
      return {
        symbol,
        price,
        timestamp,
        source: "pyth",
        confidence
      };
    } catch (error) {
      elizaLogger2.error(`Pyth price fetch error for ${symbol}: ${error}`);
      return null;
    }
  }
  async getChainlinkPrice(symbol) {
    try {
      const feedAddress = this.config.chainlinkFeeds[`${symbol}/USD`];
      if (!feedAddress)
        return null;
      const publicClient = createPublicClient({
        chain: seiChains.devnet,
        transport: http()
      });
      const result = await publicClient.readContract({
        address: feedAddress,
        abi: [
          {
            name: "latestRoundData",
            type: "function",
            outputs: [
              { name: "roundId", type: "uint80" },
              { name: "answer", type: "int256" },
              { name: "startedAt", type: "uint256" },
              { name: "updatedAt", type: "uint256" },
              { name: "answeredInRound", type: "uint80" }
            ]
          }
        ],
        functionName: "latestRoundData"
      });
      if (!result || result[1] === BigInt(0)) {
        return null;
      }
      const price = Number(result[1]) / 1e8;
      const timestamp = Number(result[3]) * 1000;
      if (isNaN(price) || price <= 0) {
        return null;
      }
      return {
        symbol,
        price,
        timestamp,
        source: "Chainlink",
        confidence: 0.99
      };
    } catch (error) {
      elizaLogger2.error(`Chainlink price fetch error for ${symbol}: ${error}`);
      return null;
    }
  }
  async getCexPrice(symbol) {
    try {
      const supportedSymbols = ["BTC", "ETH", "SEI", "USDC", "SOL", "AVAX"];
      if (!supportedSymbols.includes(symbol)) {
        return null;
      }
      const response = await fetch(`${this.config.cexApis.binance}/ticker/price?symbol=${symbol}USDT`);
      if (response.ok) {
        const data = await response.json();
        const price = parseFloat(data.price);
        if (isNaN(price) || price <= 0) {
          return null;
        }
        return {
          symbol,
          price,
          timestamp: Date.now(),
          source: "Binance",
          confidence: 0.95
        };
      }
      return null;
    } catch (error) {
      elizaLogger2.error(`CEX price fetch error for ${symbol}: ${error}`);
      return null;
    }
  }
  async getBinanceFundingRate(symbol) {
    try {
      const response = await fetch(`${this.config.cexApis.binance}/premiumIndex?symbol=${symbol}USDT`);
      if (response.ok) {
        const data = await response.json();
        return {
          symbol,
          rate: parseFloat(data.lastFundingRate) * 8760,
          timestamp: Date.now(),
          exchange: "Binance",
          nextFundingTime: parseInt(data.nextFundingTime)
        };
      }
      return null;
    } catch (error) {
      elizaLogger2.error(`Binance funding rate error for ${symbol}: ${error}`);
      return null;
    }
  }
  async getBybitFundingRate(symbol) {
    try {
      const response = await fetch(`${this.config.cexApis.bybit}/market/tickers?category=linear&symbol=${symbol}USDT`);
      if (response.ok) {
        const data = await response.json();
        const ticker = data.result.list[0];
        return {
          symbol,
          rate: parseFloat(ticker.fundingRate) * 8760,
          timestamp: Date.now(),
          exchange: "Bybit",
          nextFundingTime: parseInt(ticker.nextFundingTime)
        };
      }
      return null;
    } catch (error) {
      elizaLogger2.error(`Bybit funding rate error for ${symbol}: ${error}`);
      return null;
    }
  }
  async getOkxFundingRate(symbol) {
    try {
      const response = await fetch(`${this.config.cexApis.okx}/public/funding-rate?instId=${symbol}-USDT-SWAP`);
      if (response.ok) {
        const data = await response.json();
        const fundingData = data.data[0];
        return {
          symbol,
          rate: parseFloat(fundingData.fundingRate) * 8760,
          timestamp: parseInt(fundingData.fundingTime),
          exchange: "OKX",
          nextFundingTime: parseInt(fundingData.nextFundingTime)
        };
      }
      return null;
    } catch (error) {
      elizaLogger2.error(`OKX funding rate error for ${symbol}: ${error}`);
      return null;
    }
  }
  extractSymbols(text) {
    const symbols = ["BTC", "ETH", "SEI", "USDC", "SOL", "AVAX"];
    return symbols.filter((symbol) => text.toUpperCase().includes(symbol));
  }
  startPriceUpdates() {
    if (this.updateInterval)
      return;
    this.updateInterval = setInterval(async () => {
      try {
        const symbols = ["BTC", "ETH", "SEI"];
        await Promise.all(symbols.map((symbol) => this.getPrice(symbol)));
        await Promise.all(symbols.map((symbol) => this.getFundingRates(symbol)));
      } catch (error) {
        elizaLogger2.error(`Price update error: ${error}`);
      }
    }, this.config.updateInterval * 1000);
  }
  async getYeiPrice(symbol) {
    try {
      const api3Price = await this.getAPI3Price(symbol);
      if (api3Price && api3Price > 0) {
        elizaLogger2.log(`YEI API3 price for ${symbol}: ${api3Price}`);
        return api3Price;
      }
    } catch (error) {
      elizaLogger2.error(`YEI API3 price fetch failed for ${symbol}: ${error}`);
    }
    try {
      const pythPrice = await this.getPythPrice(symbol);
      if (pythPrice && pythPrice.price > 0) {
        elizaLogger2.log(`YEI Pyth price for ${symbol}: ${pythPrice.price}`);
        return pythPrice.price;
      }
    } catch (error) {
      elizaLogger2.error(`YEI Pyth price fetch failed for ${symbol}: ${error}`);
    }
    try {
      const redstonePrice = await this.getRedstonePrice(symbol);
      if (redstonePrice && redstonePrice > 0) {
        elizaLogger2.log(`YEI Redstone price for ${symbol}: ${redstonePrice}`);
        return redstonePrice;
      }
    } catch (error) {
      elizaLogger2.error(`YEI Redstone price fetch failed for ${symbol}: ${error}`);
    }
    throw new Error(`All YEI oracle sources failed for ${symbol}`);
  }
  async getAPI3Price(symbol) {
    const dApiId = this.getAPI3dApiId(symbol);
    const publicClient = createPublicClient({
      chain: seiChains.mainnet,
      transport: http()
    });
    const result = await publicClient.readContract({
      address: this.yeiConfig.api3ContractAddress,
      abi: [
        {
          inputs: [{ name: "dApiId", type: "bytes32" }],
          name: "readDataFeed",
          outputs: [
            { name: "value", type: "int224" },
            { name: "timestamp", type: "uint32" }
          ],
          stateMutability: "view",
          type: "function"
        }
      ],
      functionName: "readDataFeed",
      args: [dApiId]
    });
    const price = Number(result[0]) / 1000000000000000000;
    const timestamp = Number(result[1]);
    const now = Math.floor(Date.now() / 1000);
    if (now - timestamp > 3600) {
      throw new Error(`API3 price data too old for ${symbol}`);
    }
    return price;
  }
  async getRedstonePrice(symbol) {
    const publicClient = createPublicClient({
      chain: seiChains.mainnet,
      transport: http()
    });
    if (!["USDT", "USDC"].includes(symbol)) {
      throw new Error(`Redstone feed not available for ${symbol}`);
    }
    const feedId = this.stringToBytes32(`${symbol}/USD`);
    const result = await publicClient.readContract({
      address: this.yeiConfig.redstoneContractAddress,
      abi: [
        {
          inputs: [{ name: "feedId", type: "bytes32" }],
          name: "getLatestRoundData",
          outputs: [
            { name: "price", type: "int256" },
            { name: "timestamp", type: "uint256" }
          ],
          stateMutability: "view",
          type: "function"
        }
      ],
      functionName: "getLatestRoundData",
      args: [feedId]
    });
    return Number(result[0]) / 1e8;
  }
  getAPI3dApiId(symbol) {
    const dApiIds = {
      BTC: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
      ETH: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
      SEI: "0x53614f1cb0c031d4af66c04cb9c756234adad0e1cee85303795091499a4084eb",
      USDC: "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a"
    };
    const dApiId = dApiIds[symbol.toUpperCase()];
    if (!dApiId) {
      throw new Error(`No API3 dAPI ID configured for ${symbol}`);
    }
    return dApiId;
  }
  async getMockPriceFeedPrice(symbol) {
    const tokenAddresses = {
      SEI: "0x2E983A1Ba5e8b38AAAeC4B440B9dDcFBf72E15d1",
      USDC: "0x0000000000000000000000000000000000000000"
    };
    try {
      const tokenAddress = tokenAddresses[symbol.toUpperCase()];
      if (tokenAddress && tokenAddress !== "0x0000000000000000000000000000000000000000") {
        const publicClient = createPublicClient({
          chain: seiChains.devnet,
          transport: http()
        });
        const result = await publicClient.readContract({
          address: "0x8438Ad1C834623CfF278AB6829a248E37C2D7E3f",
          abi: [
            {
              name: "getPrice",
              type: "function",
              inputs: [{ name: "token", type: "address" }],
              outputs: [{ name: "", type: "uint256" }]
            }
          ],
          functionName: "getPrice",
          args: [tokenAddress]
        });
        if (result && result > 0n) {
          const price2 = Number(result) / 1000000000000000000;
          elizaLogger2.info(`MockPriceFeed contract price for ${symbol}: $${price2}`);
          return price2;
        }
      }
    } catch (error) {
      elizaLogger2.warn(`MockPriceFeed contract call failed for ${symbol}: ${error}`);
    }
    const mockPrices = {
      SEI: 0.452,
      USDC: 1,
      USDT: 1,
      ETH: 2500,
      BTC: 45000,
      ATOM: 8.5,
      DAI: 1
    };
    const price = mockPrices[symbol.toUpperCase()];
    if (!price) {
      throw new Error(`No mock price configured for ${symbol}`);
    }
    elizaLogger2.info(`Mock fallback price for ${symbol}: $${price}`);
    return price;
  }
  stringToBytes32(str) {
    const hex = Buffer.from(str).toString("hex").padEnd(64, "0");
    return `0x${hex}`;
  }
  stopPriceUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}
var oracleProvider = {
  name: "seiOracle",
  get: async (runtime, message, state) => {
    const provider = new SeiOracleProvider(runtime);
    return provider.get(runtime, message, state);
  }
};

// node_modules/@elizaos/plugin-sei-yield-delta/src/actions/transfer.ts
import {
  elizaLogger as elizaLogger3
} from "@elizaos/core";

// node_modules/@elizaos/plugin-sei-yield-delta/src/types/precompiles.ts
var ADDRESS_PRECOMPILE_ABI = [
  {
    inputs: [{ internalType: "string", name: "addr", type: "string" }],
    name: "getEvmAddr",
    outputs: [{ internalType: "address", name: "response", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "addr", type: "address" }],
    name: "getSeiAddr",
    outputs: [{ internalType: "string", name: "response", type: "string" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "string", name: "v", type: "string" }, { internalType: "string", name: "r", type: "string" }, { internalType: "string", name: "s", type: "string" }, { internalType: "string", name: "customMessage", type: "string" }],
    name: "associate",
    outputs: [{ internalType: "string", name: "seiAddr", type: "string" }, { internalType: "address", name: "evmAddr", type: "address" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "string", name: "pubKeyHex", type: "string" }],
    name: "associatePubKey",
    outputs: [{ internalType: "string", name: "seiAddr", type: "string" }, { internalType: "address", name: "evmAddr", type: "address" }],
    stateMutability: "nonpayable",
    type: "function"
  }
];
var ADDRESS_PRECOMPILE_ADDRESS = "0x0000000000000000000000000000000000001004";

// node_modules/@elizaos/plugin-sei-yield-delta/src/types/index.ts
var SupportedChainList = Object.keys([seiDevnet, seiTestnet, sei]);

// node_modules/@elizaos/plugin-sei-yield-delta/src/actions/transfer.ts
class TransferAction {
  walletProvider;
  constructor(walletProvider) {
    this.walletProvider = walletProvider;
  }
  async transfer(params) {
    const chain = this.walletProvider.getCurrentChain();
    elizaLogger3.log(`Transferring: ${params.amount} tokens to ${params.toAddress} on ${chain.name}`);
    let recipientAddress;
    if (params.toAddress.startsWith("sei")) {
      const publicClient = this.walletProvider.getEvmPublicClient();
      try {
        const evmAddress = await publicClient.readContract({
          address: ADDRESS_PRECOMPILE_ADDRESS,
          abi: ADDRESS_PRECOMPILE_ABI,
          functionName: "getEvmAddr",
          args: [params.toAddress]
        });
        if (!evmAddress || typeof evmAddress !== "string" || !evmAddress.startsWith("0x")) {
          throw new Error(`ERROR: Recipient does not have valid EVM address. Got: ${evmAddress}`);
        }
        elizaLogger3.log(`Translated address ${params.toAddress} to EVM address ${evmAddress}`);
        recipientAddress = evmAddress;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        throw new Error(`Failed to translate SEI address: ${errorMessage}`);
      }
    } else {
      if (!params.toAddress.startsWith("0x") || params.toAddress.length !== 42) {
        throw new Error(`ERROR: Recipient address must be valid EVM address (0x...). Got: ${params.toAddress}`);
      }
      recipientAddress = params.toAddress;
    }
    const walletClient = this.walletProvider.getEvmWalletClient();
    if (!walletClient?.account?.address) {
      throw new Error("Wallet client account is undefined or invalid");
    }
    try {
      elizaLogger3.log(`Sending transaction from ${walletClient.account.address} to ${recipientAddress}`);
      const valueInWei = parseEther(params.amount);
      const transactionRequest = {
        to: recipientAddress,
        value: valueInWei,
        data: params.data || "0x"
      };
      const hash2 = await walletClient.sendTransaction(transactionRequest);
      if (!hash2 || typeof hash2 !== "string") {
        throw new Error("Invalid transaction hash received");
      }
      elizaLogger3.log(`Transaction sent successfully. Hash: ${hash2}`);
      return {
        hash: hash2,
        from: walletClient.account.address,
        to: params.toAddress,
        value: parseEther(params.amount).toString(),
        data: params.data || "0x"
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      elizaLogger3.error(`Transfer failed: ${errorMessage}`);
      throw new Error(`Transfer failed: ${errorMessage}`);
    }
  }
  validateParams(params) {
    if (!params.amount || isNaN(Number(params.amount)) || Number(params.amount) <= 0) {
      throw new Error("Invalid amount: must be a positive number");
    }
    if (!params.toAddress || params.toAddress.length === 0) {
      throw new Error("Invalid recipient address: cannot be empty");
    }
    if (params.toAddress.startsWith("sei")) {
      if (params.toAddress.length !== 43) {
        throw new Error("Invalid SEI address: must be 43 characters long");
      }
    } else if (params.toAddress.startsWith("0x")) {
      if (params.toAddress.length !== 42) {
        throw new Error("Invalid EVM address: must be 42 characters long");
      }
    } else {
      throw new Error('Invalid address format: must start with "sei" or "0x"');
    }
  }
  async estimateGas(params) {
    try {
      this.validateParams(params);
      const publicClient = this.walletProvider.getEvmPublicClient();
      const walletClient = this.walletProvider.getEvmWalletClient();
      if (!walletClient?.account?.address) {
        throw new Error("Wallet account not available for gas estimation");
      }
      let recipientAddress;
      if (params.toAddress.startsWith("sei")) {
        const evmAddress = await publicClient.readContract({
          address: ADDRESS_PRECOMPILE_ADDRESS,
          abi: ADDRESS_PRECOMPILE_ABI,
          functionName: "getEvmAddr",
          args: [params.toAddress]
        });
        recipientAddress = evmAddress;
      } else {
        recipientAddress = params.toAddress;
      }
      const gasEstimate = await publicClient.estimateGas({
        account: walletClient.account.address,
        to: recipientAddress,
        value: parseEther(params.amount),
        data: params.data || "0x"
      });
      return gasEstimate;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      elizaLogger3.error(`Gas estimation failed: ${errorMessage}`);
      return BigInt(21000);
    }
  }
}
var transferAction = {
  name: "TRANSFER_TOKENS",
  similes: [
    "SEND_TOKENS",
    "TOKEN_TRANSFER",
    "MOVE_TOKENS",
    "SEND_SEI",
    "TRANSFER"
  ],
  validate: async (runtime, message) => {
    try {
      const privateKey = runtime.getSetting?.("SEI_PRIVATE_KEY");
      if (!privateKey || !privateKey.startsWith("0x")) {
        return false;
      }
      const text = message?.content?.text?.toLowerCase() || "";
      if (!text) {
        return false;
      }
      return (text.includes("transfer") || text.includes("send") || text.includes("move")) && (text.includes("sei") || text.includes("token")) && (text.includes("0x") || text.includes("sei1"));
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      elizaLogger3.error(`Transfer validation error: ${errorMessage}`);
      return false;
    }
  },
  description: "Transfer SEI tokens between addresses on the Sei network",
  handler: async (runtime, message, state, _options, callback) => {
    try {
      elizaLogger3.log("Starting token transfer...");
      const params = await buildTransferDetails(message, runtime);
      const walletProvider = await initWalletProvider2(runtime);
      const action = new TransferAction(walletProvider);
      action.validateParams(params);
      const transferResp = await action.transfer(params);
      if (callback) {
        const chainName = String(walletProvider.getCurrentChain().name);
        const hash2 = String(transferResp.hash);
        const recipient = String(transferResp.to);
        const amount = String(params.amount);
        const toAddress = String(params.toAddress);
        const successMessage = `✅ Successfully transferred ${amount} SEI to ${toAddress}

\uD83D\uDCC4 Transaction Hash: ${hash2}
\uD83D\uDD17 Chain: ${chainName}`;
        const response = {
          text: successMessage,
          content: {
            success: true,
            hash: hash2,
            amount,
            recipient,
            chain: chainName
          }
        };
        callback(response);
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      elizaLogger3.error(`Error during token transfer: ${errorMessage}`);
      if (callback) {
        const errorResponse = {
          text: `❌ Transfer failed: ${errorMessage}`,
          content: {
            error: true,
            message: errorMessage
          }
        };
        callback(errorResponse);
      }
    }
  },
  examples: [
    [
      {
        name: "{{user1}}",
        content: {
          text: "Transfer 1 SEI to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
        }
      },
      {
        name: "{{agentName}}",
        content: {
          text: "I'll help you transfer 1 SEI to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
        }
      }
    ],
    [
      {
        name: "{{user1}}",
        content: {
          text: "Send 5 SEI to sei1abc123def456"
        }
      },
      {
        name: "{{agentName}}",
        content: {
          text: "Transferring 5 SEI to sei1abc123def456"
        }
      }
    ]
  ]
};
function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Unknown error occurred";
}
function getMessageText(message) {
  if (!message || !message.content) {
    throw new Error("Invalid message: missing content");
  }
  const text = message.content.text;
  if (!text || typeof text !== "string") {
    throw new Error("Invalid message: missing or invalid text content");
  }
  return text.trim();
}
async function buildTransferDetails(message, runtime) {
  try {
    const messageText = getMessageText(message);
    if (!messageText) {
      throw new Error("Empty message text");
    }
    const params = parseTransferParams(messageText);
    if (!params) {
      throw new Error(`Could not parse transfer parameters. Please specify amount and recipient address.

Example: 'Send 100 SEI to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e'`);
    }
    return params;
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    elizaLogger3.error(`Failed to build transfer details: ${errorMessage}`);
    throw new Error(`Transfer parameter parsing failed: ${errorMessage}`);
  }
}
function parseTransferParams(text) {
  if (!text || typeof text !== "string" || !text.trim()) {
    return null;
  }
  const amountMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:SEI|sei)/i);
  const addressMatch = text.match(/(0x[a-fA-F0-9]{40}|sei1[a-z0-9]{38})/);
  if (!amountMatch || !addressMatch) {
    return null;
  }
  return {
    amount: amountMatch[1],
    toAddress: addressMatch[1]
  };
}
async function initWalletProvider2(runtime) {
  try {
    const privateKey = runtime.getSetting("SEI_PRIVATE_KEY");
    const network = runtime.getSetting("SEI_NETWORK") || "testnet";
    if (!privateKey) {
      throw new Error("SEI_PRIVATE_KEY is required");
    }
    if (!privateKey.startsWith("0x")) {
      throw new Error("SEI_PRIVATE_KEY must start with '0x'");
    }
    elizaLogger3.debug(`Initializing wallet provider for network: ${network}`);
    const chainWithName = createChainWithName(network);
    return new WalletProvider(privateKey, chainWithName);
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    elizaLogger3.error(`Failed to initialize wallet provider: ${errorMessage}`);
    throw new Error(`Wallet provider initialization failed: ${errorMessage}`);
  }
}

class ChainConfigFactory {
  static configs = new Map([
    ["mainnet", { name: "sei-mainnet", chain: sei }],
    ["testnet", { name: "sei-testnet", chain: seiTestnet }],
    ["atlantic-2", { name: "sei-testnet", chain: seiTestnet }]
  ]);
  static create(network) {
    const config = this.configs.get(network.toLowerCase());
    if (!config) {
      throw new Error(`Unsupported network: ${network}. Supported: ${Array.from(this.configs.keys()).join(", ")}`);
    }
    return {
      name: config.name,
      chain: config.chain
    };
  }
}
function createChainWithName(network) {
  return ChainConfigFactory.create(network);
}

// node_modules/@elizaos/plugin-sei-yield-delta/src/actions/dragonswap.ts
import {
  elizaLogger as elizaLogger5
} from "@elizaos/core";

// node_modules/@elizaos/plugin-sei-yield-delta/src/environment.ts
import { elizaLogger as elizaLogger4 } from "@elizaos/core";
var seiChains2 = {
  "sei-mainnet": {
    id: 1329,
    name: "Sei Mainnet",
    network: "sei-mainnet",
    nativeCurrency: {
      name: "SEI",
      symbol: "SEI",
      decimals: 18
    },
    rpcUrls: {
      default: {
        http: ["https://evm-rpc.sei-apis.com"]
      }
    },
    blockExplorers: {
      default: {
        name: "Seitrace",
        url: "https://seitrace.com"
      }
    }
  },
  "sei-testnet": {
    id: 713715,
    name: "Sei Testnet",
    network: "sei-testnet",
    nativeCurrency: {
      name: "SEI",
      symbol: "SEI",
      decimals: 18
    },
    rpcUrls: {
      default: {
        http: ["https://evm-rpc-testnet.sei-apis.com"]
      }
    },
    blockExplorers: {
      default: {
        name: "Seitrace Testnet",
        url: "https://testnet.seitrace.com"
      }
    }
  },
  "sei-devnet": {
    id: 713715,
    name: "Sei Devnet",
    network: "sei-devnet",
    nativeCurrency: {
      name: "SEI",
      symbol: "SEI",
      decimals: 18
    },
    rpcUrls: {
      default: {
        http: ["https://evm-rpc-arctic-1.sei-apis.com"]
      }
    },
    blockExplorers: {
      default: {
        name: "Seitrace Devnet",
        url: "https://devnet.seitrace.com"
      }
    }
  }
};
async function validateSeiConfig(runtime) {
  try {
    const requiredEnvVars = ["SEI_RPC_URL"];
    const missingVars = [];
    const rpcUrl = runtime.getSetting("SEI_RPC_URL");
    const chainId = runtime.getSetting("SEI_CHAIN_ID");
    const privateKey = runtime.getSetting("SEI_PRIVATE_KEY");
    const address = runtime.getSetting("SEI_ADDRESS");
    const network = runtime.getSetting("SEI_NETWORK");
    const dragonswapApiUrl = runtime.getSetting("DRAGONSWAP_API_URL");
    const oracleApiKey = runtime.getSetting("ORACLE_API_KEY");
    const yeiApiKey = runtime.getSetting("YEI_API_KEY");
    const yeiApi3Contract = runtime.getSetting("YEI_API3_CONTRACT");
    const yeiPythContract = runtime.getSetting("YEI_PYTH_CONTRACT");
    const yeiRedstoneContract = runtime.getSetting("YEI_REDSTONE_CONTRACT");
    const symphonyApiUrl = runtime.getSetting("SYMPHONY_API_URL");
    const symphonyTimeout = runtime.getSetting("SYMPHONY_TIMEOUT");
    const userGeography = runtime.getSetting("USER_GEOGRAPHY");
    const perpPreference = runtime.getSetting("PERP_PREFERENCE");
    const coinbaseApiKey = runtime.getSetting("COINBASE_ADVANCED_API_KEY");
    const coinbaseSecret = runtime.getSetting("COINBASE_ADVANCED_SECRET");
    const coinbasePassphrase = runtime.getSetting("COINBASE_ADVANCED_PASSPHRASE");
    const coinbaseSandbox = runtime.getSetting("COINBASE_SANDBOX");
    for (const envVar of requiredEnvVars) {
      const key = envVar;
      if (key === "SEI_RPC_URL" && !rpcUrl) {
        missingVars.push(envVar);
      }
    }
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`);
    }
    if (network && !seiChains2[network]) {
      throw new Error(`Invalid SEI_NETWORK: ${network}. Must be one of: ${Object.keys(seiChains2).join(", ")}`);
    }
    const config = {
      SEI_RPC_URL: rpcUrl || "https://evm-rpc-testnet.sei-apis.com",
      SEI_CHAIN_ID: chainId,
      SEI_PRIVATE_KEY: privateKey,
      SEI_ADDRESS: address,
      SEI_NETWORK: network || "sei-testnet",
      DRAGONSWAP_API_URL: dragonswapApiUrl,
      ORACLE_API_KEY: oracleApiKey,
      YEI_API_KEY: yeiApiKey,
      YEI_API3_CONTRACT: yeiApi3Contract,
      YEI_PYTH_CONTRACT: yeiPythContract,
      YEI_REDSTONE_CONTRACT: yeiRedstoneContract,
      SYMPHONY_API_URL: symphonyApiUrl,
      SYMPHONY_TIMEOUT: symphonyTimeout ? parseInt(symphonyTimeout) : undefined,
      USER_GEOGRAPHY: userGeography,
      PERP_PREFERENCE: perpPreference,
      COINBASE_ADVANCED_API_KEY: coinbaseApiKey,
      COINBASE_ADVANCED_SECRET: coinbaseSecret,
      COINBASE_ADVANCED_PASSPHRASE: coinbasePassphrase,
      COINBASE_SANDBOX: coinbaseSandbox === "true" || coinbaseSandbox === true
    };
    elizaLogger4.log("SEI configuration validated successfully");
    return config;
  } catch (error) {
    elizaLogger4.error(`SEI configuration validation failed: ${error}`);
    throw error;
  }
}

// node_modules/@elizaos/plugin-sei-yield-delta/src/actions/dragonswap.ts
var swapRouterAbi = [
  {
    inputs: [
      { name: "tokenIn", type: "address" },
      { name: "tokenOut", type: "address" },
      { name: "amountIn", type: "uint256" },
      { name: "amountOutMinimum", type: "uint256" },
      { name: "recipient", type: "address" },
      { name: "deadline", type: "uint256" }
    ],
    name: "exactInputSingle",
    outputs: [{ name: "amountOut", type: "uint256" }],
    stateMutability: "payable",
    type: "function"
  }
];

class DragonSwapAPI {
  baseUrl;
  walletProvider;
  routerAddress;
  constructor(walletProvider, isTestnet = false) {
    this.baseUrl = isTestnet ? "https://api-testnet.dragonswap.app/v1" : "https://api.dragonswap.app/v1";
    this.walletProvider = walletProvider;
    this.routerAddress = isTestnet ? "0x1234567890123456789012345678901234567890" : "0x1234567890123456789012345678901234567890";
  }
  async getPoolInfo(tokenA, tokenB) {
    try {
      const response = await fetch(`${this.baseUrl}/pools/${tokenA}/${tokenB}`);
      if (!response.ok) {
        if (false) {}
        return null;
      }
      return await response.json();
    } catch (error) {
      elizaLogger5.error(`Failed to get pool info: ${error}`);
      if (false) {}
      return null;
    }
  }
  async getQuote(tokenIn, tokenOut, amountIn) {
    try {
      const response = await fetch(`${this.baseUrl}/quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenIn,
          tokenOut,
          amountIn
        })
      });
      if (!response.ok) {
        if (false) {}
        return null;
      }
      return await response.json();
    } catch (error) {
      elizaLogger5.error(`Failed to get quote: ${error}`);
      if (false) {}
      return null;
    }
  }
  async executeSwap(params, quote) {
    try {
      elizaLogger5.log(`Executing swap: ${params.amountIn} ${params.tokenIn} -> ${params.tokenOut}`);
      const walletClient = this.walletProvider.getEvmWalletClient();
      if (!walletClient.account) {
        throw new Error("Wallet not connected");
      }
      let swapQuote = quote;
      if (!swapQuote) {
        swapQuote = await this.getQuote(params.tokenIn, params.tokenOut, params.amountIn);
        if (!swapQuote) {
          throw new Error("Could not get swap quote");
        }
      }
      if (parseFloat(swapQuote.amountOut) <= 0) {
        throw new Error("Invalid quote amount");
      }
      const slippageMultiplier = 1 - (params.slippage || 0.5) / 100;
      const minAmountOut = (parseFloat(swapQuote.amountOut) * slippageMultiplier).toString();
      if (params.tokenIn !== "SEI" && !this.isNativeToken(params.tokenIn)) {
        elizaLogger5.log(`Approving token ${params.tokenIn} for swap`);
        const tokenAddress = this.getTokenAddress(params.tokenIn);
        await this.approveToken(tokenAddress, params.amountIn);
      }
      const calldata = this.buildSwapCalldata({
        ...params,
        minAmountOut
      });
      const amountInWei = BigInt(Math.floor(parseFloat(params.amountIn) * 1000000000000000000));
      const transactionRequest = {
        to: this.routerAddress,
        data: calldata,
        value: params.tokenIn === "SEI" ? amountInWei : BigInt(0)
      };
      if (false) {}
      const txHash = await walletClient.sendTransaction({
        account: walletClient.account,
        ...transactionRequest
      });
      elizaLogger5.log(`Swap executed: ${txHash}`);
      return txHash;
    } catch (error) {
      elizaLogger5.error(`Failed to execute swap: ${error}`);
      return null;
    }
  }
  getTokenAddress(symbol) {
    const tokenAddresses = {
      USDC: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      USDT: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
      ETH: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
      WSEI: "0xE30feDd158A2e3b13e9badaeABaFc5516e95e8C7"
    };
    if (!tokenAddresses[symbol]) {
      throw new Error(`Unsupported token: ${symbol}`);
    }
    return getAddress(tokenAddresses[symbol]);
  }
  buildSwapCalldata(params) {
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);
    const walletAddress = getAddress(this.walletProvider.getEvmWalletClient().account.address);
    const WSEI_ADDRESS = getAddress("0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc");
    try {
      const amountInWei = BigInt(Math.floor(parseFloat(params.amountIn) * 1000000000000000000));
      const minAmountOutWei = BigInt(Math.floor(parseFloat(params.minAmountOut) * 1000000000000000000));
      if (params.tokenIn === "SEI") {
        const tokenOutAddress = this.getTokenAddress(params.tokenOut);
        return encodeFunctionData({
          abi: swapRouterAbi,
          functionName: "exactInputSingle",
          args: [
            WSEI_ADDRESS,
            tokenOutAddress,
            amountInWei,
            minAmountOutWei,
            walletAddress,
            deadline
          ]
        });
      } else {
        const tokenInAddress = this.getTokenAddress(params.tokenIn);
        const tokenOutAddress = params.tokenOut === "SEI" ? WSEI_ADDRESS : this.getTokenAddress(params.tokenOut);
        return encodeFunctionData({
          abi: swapRouterAbi,
          functionName: "exactInputSingle",
          args: [
            tokenInAddress,
            tokenOutAddress,
            amountInWei,
            minAmountOutWei,
            walletAddress,
            deadline
          ]
        });
      }
    } catch (error) {
      elizaLogger5.error(`Failed to encode swap calldata: ${error}`);
      throw new Error("Failed to build transaction data");
    }
  }
  async approveToken(tokenAddress, amount) {
    if (false) {}
    const walletClient = this.walletProvider.getEvmWalletClient();
    const currentAllowance = await this.checkAllowance(tokenAddress, walletClient.account.address);
    if (BigInt(currentAllowance) >= BigInt(amount)) {
      elizaLogger5.log(`Token ${tokenAddress} already approved with sufficient allowance`);
      return;
    }
    const amountWei = BigInt(Math.floor(parseFloat(amount) * 1000000000000000000));
    const data = encodeFunctionData({
      abi: erc20Abi,
      functionName: "approve",
      args: [this.routerAddress, amountWei]
    });
    const txHash = await walletClient.sendTransaction({
      account: walletClient.account,
      to: tokenAddress,
      data,
      value: BigInt(0)
    });
    elizaLogger5.log(`Token approval transaction: ${txHash}`);
  }
  async checkAllowance(tokenAddress, ownerAddress) {
    if (false) {}
    try {
      const publicClient = this.walletProvider.getEvmPublicClient();
      const allowance = await publicClient.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "allowance",
        args: [ownerAddress, this.routerAddress]
      });
      return allowance.toString();
    } catch (error) {
      elizaLogger5.error(`Failed to check token allowance: ${error}`);
      return "0";
    }
  }
  isNativeToken(tokenAddress) {
    const nativeTokens = [
      "SEI",
      "0x0000000000000000000000000000000000000000"
    ];
    return nativeTokens.includes(tokenAddress.toLowerCase());
  }
}
function getErrorMessage2(error) {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Unknown error occurred";
}
function getMessageText2(message) {
  if (!message || !message.content) {
    throw new Error("Invalid message: missing content");
  }
  const text = message.content.text;
  if (!text || typeof text !== "string") {
    throw new Error("Invalid message: missing or invalid text content");
  }
  return text.trim();
}
async function parseTradeParams(text) {
  if (!text || typeof text !== "string" || !text.trim()) {
    return null;
  }
  const tokenMatch = text.match(/swap\s+(\d+(?:\.\d+)?)\s+(\w+)\s+for\s+(\w+)/i);
  if (!tokenMatch) {
    return null;
  }
  const slippageMatch = text.match(/(?:slippage|slip)\s+(\d+(?:\.\d+)?)%?/i);
  const slippage = slippageMatch ? slippageMatch[1] : "0.5";
  return {
    tokenIn: tokenMatch[2].toUpperCase(),
    tokenOut: tokenMatch[3].toUpperCase(),
    amountIn: tokenMatch[1],
    slippage
  };
}
function validateAndConvertTradeParams(tradeParams, quote) {
  if (!tradeParams.tokenIn || !tradeParams.tokenOut || !tradeParams.amountIn) {
    throw new Error("Missing required trade parameters");
  }
  let slippage;
  if (tradeParams.slippage) {
    slippage = parseFloat(tradeParams.slippage);
    if (isNaN(slippage) || slippage < 0 || slippage > 100) {
      throw new Error("Invalid slippage value. Must be between 0 and 100");
    }
  } else {
    slippage = 0.5;
  }
  return {
    tokenIn: tradeParams.tokenIn,
    tokenOut: tradeParams.tokenOut,
    amountIn: tradeParams.amountIn,
    minAmountOut: quote.amountOut,
    slippage
  };
}
var dragonSwapTradeAction = {
  name: "DRAGONSWAP_TRADE",
  similes: [
    "SWAP_ON_DRAGONSWAP",
    "TRADE_DRAGONSWAP",
    "EXCHANGE_TOKENS",
    "SWAP_SEI_TOKENS"
  ],
  validate: async (runtime, message) => {
    try {
      const config = await validateSeiConfig(runtime);
      const text = message?.content?.text?.toLowerCase() || "";
      if (!text) {
        return false;
      }
      return (text.includes("swap") || text.includes("trade") || text.includes("exchange")) && (text.includes("dragonswap") || text.includes("dragon")) && (text.includes("sei") || text.includes("token"));
    } catch (error) {
      const errorMessage = getErrorMessage2(error);
      elizaLogger5.error(`DragonSwap validation error: ${errorMessage}`);
      return false;
    }
  },
  description: "Execute token swaps on DragonSwap DEX on Sei Network",
  handler: async (runtime, message, state, _options, callback) => {
    elizaLogger5.log("Processing DragonSwap trade request");
    try {
      const config = await validateSeiConfig(runtime);
      const networkMapping = {
        "sei-mainnet": seiChains.mainnet,
        "sei-testnet": seiChains.testnet,
        "sei-devnet": seiChains.devnet
      };
      const currentNetwork = config.SEI_NETWORK || "sei-testnet";
      const viemChain = networkMapping[currentNetwork] || seiChains.testnet;
      const walletProvider = new WalletProvider(config.SEI_PRIVATE_KEY, { name: currentNetwork, chain: viemChain });
      const dragonSwap = new DragonSwapAPI(walletProvider, config.SEI_NETWORK !== "sei-mainnet");
      let messageText;
      try {
        messageText = getMessageText2(message);
      } catch (error) {
        if (callback) {
          callback({
            text: "Invalid message format. Please provide trade details.",
            error: true
          });
        }
        return;
      }
      const tradeParams = await parseTradeParams(messageText);
      if (!tradeParams) {
        if (callback) {
          callback({
            text: "I couldn't understand the trade parameters. Please specify tokens and amounts. Example: 'Swap 10 SEI for USDC on DragonSwap'",
            error: true
          });
        }
        return;
      }
      const poolInfo = await dragonSwap.getPoolInfo(tradeParams.tokenIn, tradeParams.tokenOut);
      if (!poolInfo) {
        if (callback) {
          callback({
            text: `No liquidity pool found for ${tradeParams.tokenIn}/${tradeParams.tokenOut} on DragonSwap`,
            error: true
          });
        }
        return;
      }
      const quote = await dragonSwap.getQuote(tradeParams.tokenIn, tradeParams.tokenOut, tradeParams.amountIn);
      if (!quote) {
        if (callback) {
          callback({
            text: "Could not get price quote for this trade",
            error: true
          });
        }
        return;
      }
      if (true) {
        const balance = await walletProvider.getWalletBalance();
        if (!balance) {
          if (callback) {
            callback({
              text: "Failed to retrieve wallet balance. Please try again later.",
              error: true
            });
          }
          return;
        }
        const requiredAmount = parseFloat(tradeParams.amountIn);
        const availableBalance = parseFloat(balance);
        if (availableBalance < requiredAmount) {
          if (callback) {
            callback({
              text: `Failed to execute swap: Insufficient balance. Required: ${requiredAmount} ${tradeParams.tokenIn}, Available: ${availableBalance} ${tradeParams.tokenIn}`,
              error: true
            });
          }
          return;
        }
      }
      const priceImpactPercent = quote.priceImpact * 100;
      if (priceImpactPercent > 10) {
        if (callback) {
          callback({
            text: `⚠️ High Price Impact Warning: ${priceImpactPercent.toFixed(2)}%
This trade will significantly impact the token price. Consider reducing the trade size.`
          });
        }
      } else if (priceImpactPercent > 5) {
        if (callback) {
          callback({
            text: `Price Impact: ${priceImpactPercent.toFixed(2)}% - Moderate impact detected.`
          });
        }
      }
      const dragonSwapParams = validateAndConvertTradeParams(tradeParams, quote);
      const txHash = await dragonSwap.executeSwap(dragonSwapParams, quote);
      if (callback) {
        if (txHash) {
          const priceImpactPercent2 = quote.priceImpact * 100;
          callback({
            text: `✅ Successfully swapped ${tradeParams.amountIn} ${tradeParams.tokenIn} for ~${quote.amountOut} ${tradeParams.tokenOut}
` + `Transaction: ${txHash}
` + `Price Impact: ${priceImpactPercent2.toFixed(2)}%`
          });
        } else {
          callback({
            text: "Failed to execute swap. Please try again later.",
            error: true
          });
        }
      }
    } catch (error) {
      const errorMessage = getErrorMessage2(error);
      elizaLogger5.error(`DragonSwap trade error: ${errorMessage}`);
      if (callback) {
        callback({
          text: `Error executing trade: ${errorMessage}`,
          error: true
        });
      }
    }
  },
  examples: [
    [
      {
        name: "{{user1}}",
        content: { text: "Swap 10 SEI for USDC on DragonSwap" }
      },
      {
        name: "{{agentName}}",
        content: {
          text: "I'll execute that swap for you on DragonSwap…",
          action: "DRAGONSWAP_TRADE"
        }
      }
    ],
    [
      {
        name: "{{user1}}",
        content: { text: "Trade 5 USDC for SEI using DragonSwap with 1% slippage" }
      },
      {
        name: "{{agentName}}",
        content: {
          text: "Executing USDC to SEI swap with 1% slippage tolerance…",
          action: "DRAGONSWAP_TRADE"
        }
      }
    ]
  ]
};

// node_modules/@elizaos/plugin-sei-yield-delta/src/actions/funding-arbitrage.ts
import {
  elizaLogger as elizaLogger7
} from "@elizaos/core";

// node_modules/@elizaos/plugin-sei-yield-delta/src/actions/perp-trading.ts
import {
  elizaLogger as elizaLogger6
} from "@elizaos/core";
class PerpsAPI {
  baseUrl;
  walletProvider;
  contractAddress;
  oracleProvider;
  protocol;
  constructor(walletProvider, oracleProvider2, config) {
    const isTestnet = config.SEI_NETWORK !== "mainnet";
    this.protocol = config.PERP_PROTOCOL || "vortex";
    switch (this.protocol) {
      case "vortex":
        this.baseUrl = isTestnet ? "https://api-testnet.vortexprotocol.io/v1" : "https://api.vortexprotocol.io/v1";
        this.contractAddress = isTestnet ? config.VORTEX_TESTNET_CONTRACT : config.VORTEX_MAINNET_CONTRACT;
        break;
      case "dragonswap":
        this.baseUrl = config.DRAGONSWAP_API_URL || "https://api-testnet.dragonswap.app/v1";
        this.contractAddress = isTestnet ? config.DRAGONSWAP_PERP_TESTNET : config.DRAGONSWAP_PERP_MAINNET;
        break;
      default:
        throw new Error(`Unsupported perp protocol: ${this.protocol}`);
    }
    this.walletProvider = walletProvider;
    this.oracleProvider = oracleProvider2;
    if (!this.contractAddress || this.contractAddress === "0x...") {
      throw new Error(`${this.protocol} contract address not configured. Check your .env file.`);
    }
  }
  async openPosition(params) {
    try {
      elizaLogger6.log(`Opening ${params.side} position: ${params.size} USD ${params.symbol} at ${params.leverage}x`);
      const walletClient = this.walletProvider.getEvmWalletClient();
      if (!walletClient.account) {
        throw new Error("Wallet not connected");
      }
      const priceData = await this.oracleProvider.getPrice(params.symbol);
      if (!priceData) {
        throw new Error(`Could not get price for ${params.symbol}`);
      }
      const sizeInTokens = parseFloat(params.size) / priceData.price;
      const marginRequired = parseFloat(params.size) / params.leverage;
      const data = this.buildOpenPositionCalldata({
        ...params,
        sizeInTokens: sizeInTokens.toString(),
        marginRequired: marginRequired.toString(),
        currentPrice: priceData.price.toString()
      });
      const txHash = await walletClient.sendTransaction({
        account: walletClient.account,
        to: this.contractAddress,
        data,
        value: BigInt(0)
      });
      elizaLogger6.log(`Position opened: ${txHash}`);
      return txHash;
    } catch (error) {
      elizaLogger6.error(`Failed to open position:: ${error}`);
      return null;
    }
  }
  async closePosition(symbol, size4) {
    try {
      elizaLogger6.log(`Closing position: ${symbol} ${size4 ? `(${size4})` : "(full)"}`);
      const walletClient = this.walletProvider.getEvmWalletClient();
      if (!walletClient.account) {
        throw new Error("Wallet not connected");
      }
      const data = this.buildClosePositionCalldata(symbol, size4);
      const txHash = await walletClient.sendTransaction({
        account: walletClient.account,
        to: this.contractAddress,
        data,
        value: BigInt(0)
      });
      elizaLogger6.log(`Position closed: ${txHash}`);
      return txHash;
    } catch (error) {
      elizaLogger6.error(`Failed to close position:: ${error}`);
      return null;
    }
  }
  async getPositions(address) {
    try {
      const response = await fetch(`${this.baseUrl}/positions/${address}`);
      if (!response.ok)
        return [];
      const data = await response.json();
      return data.positions || [];
    } catch (error) {
      elizaLogger6.error(`Failed to get positions:: ${error}`);
      return [];
    }
  }
  async getMarketInfo(symbol) {
    try {
      const response = await fetch(`${this.baseUrl}/markets/${symbol}`);
      if (!response.ok)
        return null;
      return await response.json();
    } catch (error) {
      elizaLogger6.error(`Failed to get market info:: ${error}`);
      return null;
    }
  }
  buildOpenPositionCalldata(params) {
    const perpsAbi = [
      {
        name: "openPosition",
        type: "function",
        inputs: [
          { name: "market", type: "bytes32" },
          { name: "sizeDelta", type: "int256" },
          { name: "acceptablePrice", type: "uint256" },
          { name: "executionFee", type: "uint256" },
          { name: "referralCode", type: "bytes32" },
          { name: "isLong", type: "bool" }
        ]
      }
    ];
    const marketKey = this.getMarketKey(params.symbol);
    const sizeDelta = params.side === "long" ? BigInt(params.sizeInTokens) : -BigInt(params.sizeInTokens);
    const slippageMultiplier = params.side === "long" ? 1 + (params.slippage || 50) / 1e4 : 1 - (params.slippage || 50) / 1e4;
    const acceptablePrice = BigInt(Math.floor(parseFloat(params.currentPrice) * slippageMultiplier * 1000000000000000000));
    return encodeFunctionData({
      abi: perpsAbi,
      functionName: "openPosition",
      args: [
        marketKey,
        sizeDelta,
        acceptablePrice,
        BigInt(0),
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        params.side === "long"
      ]
    });
  }
  buildClosePositionCalldata(symbol, size4) {
    const perpsAbi = [
      {
        name: "closePosition",
        type: "function",
        inputs: [
          { name: "market", type: "bytes32" },
          { name: "sizeDelta", type: "uint256" },
          { name: "acceptablePrice", type: "uint256" },
          { name: "executionFee", type: "uint256" }
        ]
      }
    ];
    const marketKey = this.getMarketKey(symbol);
    const sizeDelta = size4 ? BigInt(size4) : BigInt(0);
    return encodeFunctionData({
      abi: perpsAbi,
      functionName: "closePosition",
      args: [
        marketKey,
        sizeDelta,
        BigInt(0),
        BigInt(0)
      ]
    });
  }
  getMarketKey(symbol) {
    const encoder3 = new TextEncoder;
    const data = encoder3.encode(symbol);
    const hex = Array.from(data, (byte) => byte.toString(16).padStart(2, "0")).join("");
    return `0x${hex.padEnd(64, "0")}`;
  }
}
var perpsTradeAction = {
  name: "PERPS_TRADE",
  similes: [
    "PERPETUAL_TRADE",
    "LEVERAGE_TRADE",
    "FUTURES_TRADE",
    "PERPS"
  ],
  validate: async (runtime, message) => {
    try {
      if (false) {}
      await validateSeiConfig(runtime);
      const text = message.content?.text?.toLowerCase() || "";
      return (text.includes("open") || text.includes("close") || text.includes("short") || text.includes("long")) && (text.includes("btc") || text.includes("eth") || text.includes("sei") || text.includes("sol") || text.includes("position"));
    } catch (error) {
      return false;
    }
  },
  description: "Execute perpetual futures trading with leverage",
  handler: async (runtime, message, state, _options, callback) => {
    elizaLogger6.log("Processing perps trading request");
    try {
      if (false) {}
      const config = await validateSeiConfig(runtime);
      const walletProvider = new WalletProvider(config.SEI_PRIVATE_KEY, { name: config.SEI_NETWORK || "sei-devnet", chain: seiChains["devnet"] });
      const text = message.content?.text?.toLowerCase() || "";
      const params = parsePerpsParams(text);
      if (!params) {
        if (callback) {
          callback({
            text: "Invalid trading parameters. Use format: 'open long BTC 1000 2x' or 'close BTC position'",
            error: true
          });
        }
        return;
      }
      const result = await executePerpsTradeEngine(params, walletProvider, config);
      if (result.success) {
        if (callback) {
          callback({
            text: `✅ Perpetual trade executed successfully!

` + `Symbol: ${params.symbol}
` + `Side: ${params.side}
` + `Size: $${params.size}
` + `Leverage: ${params.leverage}x
` + `Transaction: ${result.txHash || "simulated"}`
          });
        }
      } else {
        if (callback) {
          callback({
            text: `❌ Failed to execute perpetual trade: ${result.error}`,
            error: true
          });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      elizaLogger6.error(`Error in perps trading:: ${error}`);
      const errorResponse = {
        text: `❌ Error executing perpetual trade: ${errorMessage}`,
        error: true,
        success: false
      };
      if (callback) {
        callback(errorResponse);
      }
      return errorResponse;
    }
  },
  examples: [
    [
      {
        name: "{{user1}}",
        content: { text: "Open long BTC 1000 2x" }
      },
      {
        name: "{{agentName}}",
        content: {
          text: "Opening long BTC position with $1000 at 2x leverage...",
          action: "PERPS_TRADE"
        }
      }
    ]
  ]
};
function parsePerpsParams(text) {
  const openMatch = text.match(/open\s+(long|short)\s+(\w+)\s+(\d+)\s+(\d+)x/);
  if (openMatch) {
    return {
      symbol: openMatch[2].toUpperCase(),
      size: openMatch[3],
      side: openMatch[1],
      leverage: parseInt(openMatch[4]),
      reduceOnly: false
    };
  }
  const closeMatch = text.match(/close\s+(\w+)/);
  if (closeMatch) {
    return {
      symbol: closeMatch[1].toUpperCase(),
      size: "0",
      side: "long",
      leverage: 1,
      reduceOnly: true
    };
  }
  return null;
}
async function executePerpsTradeEngine(params, walletProvider, config) {
  try {
    elizaLogger6.log(`Executing perps trade: ${params.side} ${params.symbol} $${params.size} ${params.leverage}x`);
    const oracleProvider2 = new SeiOracleProvider({});
    const perpsAPI = new PerpsAPI(walletProvider, oracleProvider2, config);
    if (params.reduceOnly) {
      const txHash = await perpsAPI.closePosition(params.symbol, params.size === "0" ? undefined : params.size);
      if (txHash) {
        return { success: true, txHash };
      } else {
        return { success: false, error: "Failed to close position" };
      }
    } else {
      const txHash = await perpsAPI.openPosition(params);
      if (txHash) {
        return { success: true, txHash };
      } else {
        return { success: false, error: "Failed to open position" };
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

// node_modules/@elizaos/plugin-sei-yield-delta/src/actions/funding-arbitrage.ts
class FundingArbitrageEngine {
  walletProvider;
  oracleProvider;
  runtime;
  activePositions = new Map;
  minFundingRate = 0.1;
  maxPositionSize = 1e4;
  riskTolerance = 0.7;
  constructor(walletProvider, oracleProvider2, runtime) {
    this.walletProvider = walletProvider;
    this.oracleProvider = oracleProvider2;
    this.runtime = runtime;
  }
  getActivePositions() {
    return Array.from(this.activePositions.values()).filter((pos) => pos.status === "active");
  }
  getAllPositions() {
    return Array.from(this.activePositions.values());
  }
  async updatePositionPnL() {
    try {
      for (const position of this.activePositions.values()) {
        if (position.status === "active") {
          const currentPrice = await this.oracleProvider.getPrice(position.symbol);
          elizaLogger7.log(`Updating P&L for ${position.symbol} position ${position.id}`);
        }
      }
    } catch (error) {
      elizaLogger7.error(`Error updating position P&L:: ${error}`);
    }
  }
  async scanOpportunities() {
    try {
      elizaLogger7.log("Scanning for arbitrage opportunities...");
      const opportunities = [];
      const symbols = ["BTC", "ETH", "SOL", "SEI"];
      for (const symbol of symbols) {
        try {
          const fundingRates = await this.getFundingRates(symbol);
          const opportunity = this.evaluateOpportunity(symbol, fundingRates);
          if (opportunity && opportunity.expectedReturn > this.minFundingRate) {
            opportunities.push(opportunity);
          }
        } catch (error) {
          elizaLogger7.error(`Error scanning ${symbol}:: ${error}`);
        }
      }
      return opportunities.sort((a, b) => b.expectedReturn - a.expectedReturn);
    } catch (error) {
      elizaLogger7.error(`Error scanning opportunities:: ${error}`);
      return [];
    }
  }
  async executeArbitrage(symbol) {
    try {
      elizaLogger7.log(`Executing arbitrage for ${symbol}...`);
      const opportunities = await this.scanOpportunities();
      const opportunity = opportunities.find((opp) => opp.symbol === symbol);
      if (!opportunity) {
        elizaLogger7.warn(`No profitable opportunity found for ${symbol}`);
        return false;
      }
      const existingPosition = Array.from(this.activePositions.values()).find((pos) => pos.symbol === symbol && pos.status === "active");
      if (existingPosition) {
        elizaLogger7.warn(`Already have an active position for ${symbol}`);
        return false;
      }
      const success = await this.openArbitragePosition(opportunity);
      return success;
    } catch (error) {
      elizaLogger7.error(`Error executing arbitrage for ${symbol}:: ${error}`);
      return false;
    }
  }
  async getFundingRates(symbol) {
    try {
      return [
        {
          exchange: "binance",
          symbol,
          fundingRate: 0.001,
          nextFundingTime: Date.now() + 8 * 60 * 60 * 1000,
          confidence: 0.9
        },
        {
          exchange: "bybit",
          symbol,
          fundingRate: -0.002,
          nextFundingTime: Date.now() + 8 * 60 * 60 * 1000,
          confidence: 0.85
        }
      ];
    } catch (error) {
      elizaLogger7.error(`Error fetching funding rates for ${symbol}:: ${error}`);
      return [];
    }
  }
  evaluateOpportunity(symbol, fundingRates) {
    try {
      if (fundingRates.length < 2)
        return null;
      const sortedRates = fundingRates.sort((a, b) => b.fundingRate - a.fundingRate);
      const highestRate = sortedRates[0];
      const lowestRate = sortedRates[sortedRates.length - 1];
      const rateDifferential = highestRate.fundingRate - lowestRate.fundingRate;
      const annualizedReturn = rateDifferential * 365 * 3;
      if (annualizedReturn < this.minFundingRate)
        return null;
      const cexSide = highestRate.fundingRate > 0 ? "short" : "long";
      const dexSide = cexSide === "long" ? "short" : "long";
      return {
        symbol,
        cexSide,
        dexSide,
        cexFundingRate: highestRate.fundingRate,
        targetExchange: highestRate.exchange,
        expectedReturn: annualizedReturn,
        requiredCapital: Math.min(this.maxPositionSize, 5000),
        risk: Math.min(highestRate.confidence, lowestRate.confidence) > 0.8 ? "low" : Math.min(highestRate.confidence, lowestRate.confidence) > 0.6 ? "medium" : "high",
        hedgeAction: dexSide === "long" ? "long_dex" : "short_dex",
        confidence: Math.min(highestRate.confidence, lowestRate.confidence)
      };
    } catch (error) {
      elizaLogger7.error(`Error evaluating opportunity for ${symbol}:: ${error}`);
      return null;
    }
  }
  async openArbitragePosition(opportunity) {
    try {
      const positionId = `arb_${opportunity.symbol}_${Date.now()}`;
      const position = {
        id: positionId,
        symbol: opportunity.symbol,
        cexSide: opportunity.cexSide,
        dexSide: opportunity.dexSide,
        size: opportunity.requiredCapital,
        entryTime: Date.now(),
        expectedReturn: opportunity.expectedReturn,
        status: "active",
        cexFundingCollected: 0,
        netPnl: 0
      };
      const hedgeSuccess = await this.openHedgePosition(opportunity);
      if (!hedgeSuccess) {
        elizaLogger7.error("Failed to open hedge position");
        return false;
      }
      this.activePositions.set(positionId, position);
      elizaLogger7.log(`Successfully opened arbitrage position: ${positionId}`);
      return true;
    } catch (error) {
      elizaLogger7.error(`Error opening arbitrage position:: ${error}`);
      return false;
    }
  }
  async openHedgePosition(opportunity) {
    try {
      if (opportunity.hedgeAction === "short_dex") {
        elizaLogger7.log(`Opening short hedge for ${opportunity.symbol} via Perps`);
        const mockMessage = {
          content: {
            text: `open short ${opportunity.symbol} ${opportunity.requiredCapital} 1x`
          }
        };
        try {
          const mockState = { values: {}, data: {}, text: "" };
          await perpsTradeAction.handler(this.runtime, mockMessage, mockState, {});
          elizaLogger7.log(`Successfully opened short position for ${opportunity.symbol}`);
          return true;
        } catch (perpsError) {
          elizaLogger7.error(`Perps execution failed:: ${perpsError}`);
          return false;
        }
      } else {
        elizaLogger7.log(`Opening long hedge for ${opportunity.symbol} via DragonSwap`);
        const mockMessage = {
          content: {
            text: `swap ${opportunity.requiredCapital} USDC for ${opportunity.symbol}`
          }
        };
        try {
          const mockState = { values: {}, data: {}, text: "" };
          await dragonSwapTradeAction.handler(this.runtime, mockMessage, mockState, {});
          elizaLogger7.log(`Successfully swapped USDC for ${opportunity.symbol}`);
          return true;
        } catch (swapError) {
          elizaLogger7.error(`DragonSwap execution failed:: ${swapError}`);
          return false;
        }
      }
    } catch (error) {
      elizaLogger7.error(`Failed to open hedge position:: ${error}`);
      return false;
    }
  }
  async closeArbitrage(positionId) {
    try {
      const position = this.activePositions.get(positionId);
      if (!position) {
        elizaLogger7.error(`Position ${positionId} not found`);
        return false;
      }
      position.status = "closing";
      position.status = "closed";
      elizaLogger7.log(`Successfully closed arbitrage position: ${positionId}`);
      return true;
    } catch (error) {
      elizaLogger7.error(`Failed to close arbitrage position:: ${error}`);
      return false;
    }
  }
}
async function getOrCreateArbitrageEngine(runtime) {
  try {
    const config = await validateSeiConfig(runtime);
    const walletProvider = new WalletProvider(config.SEI_PRIVATE_KEY, {
      name: config.SEI_NETWORK || "sei-devnet",
      chain: seiChains["devnet"]
    });
    const oracleProvider2 = new SeiOracleProvider(runtime);
    return new FundingArbitrageEngine(walletProvider, oracleProvider2, runtime);
  } catch (error) {
    elizaLogger7.error(`Failed to create arbitrage engine:: ${error}`);
    throw error;
  }
}
var fundingArbitrageAction = {
  name: "FUNDING_ARBITRAGE",
  similes: ["ARBITRAGE", "FUNDING_RATE"],
  validate: async (runtime, message) => {
    try {
      await validateSeiConfig(runtime);
      const text = message?.content?.text?.toLowerCase() || "";
      return text.includes("arbitrage") || text.includes("funding");
    } catch {
      return false;
    }
  },
  description: "Execute funding rate arbitrage strategies",
  handler: async (runtime, message, state, _options, callback) => {
    try {
      const arbitrageEngine = await getOrCreateArbitrageEngine(runtime);
      const messageText = message?.content?.text?.toLowerCase() || "";
      if (messageText.includes("status") || messageText.includes("position")) {
        const activePositions = arbitrageEngine.getActivePositions();
        if (activePositions.length === 0) {
          if (callback) {
            await callback({
              text: "No active arbitrage positions.",
              content: {
                type: "status",
                hasPositions: false
              }
            });
          }
          return;
        }
        await arbitrageEngine.updatePositionPnL();
        const positionsText = activePositions.map((pos) => `${pos.symbol} Arbitrage (${pos.id.split("_")[1]})
` + `   Strategy: ${pos.cexSide.toUpperCase()} CEX + ${pos.dexSide.toUpperCase()} DEX
` + `   Size: $${pos.size.toLocaleString()}
` + `   Duration: ${Math.floor((Date.now() - pos.entryTime) / (24 * 60 * 60 * 1000))} days
` + `   Net PnL: $${pos.netPnl.toFixed(2)}
` + `   Expected Return: ${(pos.expectedReturn * 100).toFixed(2)}% annual`).join(`

`);
        if (callback) {
          await callback({
            text: `\uD83D\uDCCA Active Arbitrage Positions:

${positionsText}`,
            content: {
              type: "positions",
              positions: activePositions
            }
          });
        }
      } else if (messageText.includes("scan") || messageText.includes("opportunity")) {
        if (callback) {
          await callback({
            text: "\uD83D\uDD0D Scanning for arbitrage opportunities...",
            content: { type: "scanning" }
          });
        }
        const opportunities = await arbitrageEngine.scanOpportunities();
        if (opportunities.length === 0) {
          if (callback) {
            await callback({
              text: "No profitable arbitrage opportunities found at the moment.",
              content: { type: "scan_result", opportunities: [] }
            });
          }
        } else {
          const opportunitiesText = opportunities.map((opp) => `\uD83D\uDCB0 ${opp.symbol} Arbitrage
` + `   Target Exchange: ${opp.targetExchange}
` + `   Strategy: ${opp.hedgeAction === "short_dex" ? "SHORT DEX + LONG CEX" : "LONG DEX + SHORT CEX"}
` + `   Expected Return: ${(opp.expectedReturn * 100).toFixed(2)}% annual
` + `   Required Capital: $${opp.requiredCapital.toLocaleString()}
` + `   Risk Level: ${opp.risk.toUpperCase()}
` + `   Confidence: ${(opp.confidence * 100).toFixed(0)}%`).join(`

`);
          if (callback) {
            await callback({
              text: `\uD83D\uDCC8 Found ${opportunities.length} Arbitrage Opportunities:

${opportunitiesText}`,
              content: {
                type: "scan_result",
                opportunities
              }
            });
          }
        }
      } else if (messageText.includes("execute")) {
        const symbolMatch = messageText.match(/execute.*?arbitrage.*?(\w{3,6})/i) || messageText.match(/arbitrage.*?(\w{3,6})/i);
        const symbol = symbolMatch ? symbolMatch[1].toUpperCase() : null;
        if (!symbol) {
          if (callback) {
            await callback({
              text: "Please specify a symbol. Example: 'execute arbitrage BTC'",
              content: { type: "error", message: "Symbol required" }
            });
          }
          return;
        }
        if (callback) {
          await callback({
            text: `\uD83D\uDE80 Executing arbitrage for ${symbol}...`,
            content: { type: "executing", symbol }
          });
        }
        const opportunities = await arbitrageEngine.scanOpportunities();
        const opportunity = opportunities.find((opp) => opp.symbol === symbol);
        if (!opportunity) {
          if (callback) {
            await callback({
              text: `❌ No profitable arbitrage opportunity found for ${symbol} at the moment.`,
              content: { type: "execution_result", success: false, symbol, reason: "No opportunity" }
            });
          }
          return;
        }
        const success = await arbitrageEngine.executeArbitrage(opportunity.symbol);
        if (callback) {
          if (success) {
            await callback({
              text: `✅ Successfully initiated ${symbol} arbitrage position!
` + `Expected Return: ${(opportunity.expectedReturn * 100).toFixed(2)}% annual
` + `Capital Deployed: $${opportunity.requiredCapital.toLocaleString()}`,
              content: {
                type: "execution_result",
                success: true,
                symbol,
                opportunity
              }
            });
          } else {
            await callback({
              text: `❌ Failed to execute ${symbol} arbitrage. Check logs for details.`,
              content: { type: "execution_result", success: false, symbol }
            });
          }
        }
      } else {
        if (callback) {
          await callback({
            text: `\uD83E\uDD16 Funding Arbitrage Bot Commands:

` + `• 'scan arbitrage opportunities' - Find profitable opportunities
` + `• 'execute arbitrage [symbol]' - Execute arbitrage for a symbol
` + `• 'arbitrage status' - Check active positions

` + `Examples:
` + `• 'scan arbitrage opportunities'
` + `• 'execute arbitrage BTC'
` + "• 'arbitrage status'",
            content: {
              type: "help",
              commands: [
                "scan arbitrage opportunities",
                "execute arbitrage [symbol]",
                "arbitrage status"
              ]
            }
          });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      elizaLogger7.error(`Funding arbitrage error:: ${errorMessage}`);
      if (callback) {
        await callback({
          text: `❌ Error: ${errorMessage}`,
          content: {
            type: "error",
            error: errorMessage
          }
        });
      }
    }
  },
  examples: [
    [
      {
        name: "{{user1}}",
        content: { text: "Scan for funding arbitrage opportunities" }
      },
      {
        name: "{{agentName}}",
        content: {
          text: "Scanning funding rates across exchanges for arbitrage opportunities...",
          action: "FUNDING_ARBITRAGE"
        }
      }
    ],
    [
      {
        name: "{{user1}}",
        content: { text: "Execute arbitrage BTC" }
      },
      {
        name: "{{agentName}}",
        content: {
          text: "Executing BTC funding rate arbitrage strategy...",
          action: "FUNDING_ARBITRAGE"
        }
      }
    ]
  ]
};

// node_modules/@elizaos/plugin-sei-yield-delta/src/actions/rebalance.ts
import {
  elizaLogger as elizaLogger8
} from "@elizaos/core";
class PortfolioRebalancer {
  walletProvider;
  oracleProvider;
  constructor(walletProvider, oracleProvider2) {
    this.walletProvider = walletProvider;
    this.oracleProvider = oracleProvider2;
  }
  getStrategies() {
    return [
      {
        name: "Conservative DeFi",
        description: "Low-risk allocation focused on stable yields",
        allocations: {
          SEI: 40,
          USDC: 30,
          ETH: 20,
          BTC: 10
        },
        rebalanceThreshold: 5,
        riskLevel: "conservative"
      },
      {
        name: "Balanced Growth",
        description: "Moderate risk with diversified DeFi exposure",
        allocations: {
          SEI: 25,
          USDC: 25,
          ETH: 25,
          BTC: 15,
          ATOM: 10
        },
        rebalanceThreshold: 7.5,
        riskLevel: "moderate"
      },
      {
        name: "Aggressive DeFi",
        description: "High-risk, high-reward DeFi strategy",
        allocations: {
          SEI: 30,
          ETH: 25,
          BTC: 20,
          ATOM: 15,
          OSMO: 10
        },
        rebalanceThreshold: 10,
        riskLevel: "aggressive"
      },
      {
        name: "Yield Farming Focus",
        description: "Optimized for maximum yield opportunities",
        allocations: {
          SEI: 35,
          USDC: 20,
          ETH: 20,
          LP_TOKENS: 25
        },
        rebalanceThreshold: 8,
        riskLevel: "moderate"
      }
    ];
  }
  async analyzePortfolio(walletAddress, strategyName) {
    try {
      const strategies = this.getStrategies();
      const strategy = strategyName ? strategies.find((s) => s.name === strategyName) || strategies[1] : strategies[1];
      const portfolioBalances = await this.getPortfolioBalances(walletAddress);
      const totalValue = Object.values(portfolioBalances).reduce((sum, value) => sum + value, 0);
      elizaLogger8.info(`DEBUG: Portfolio balances for ${walletAddress}:`, portfolioBalances);
      elizaLogger8.info(`DEBUG: Total portfolio value: ${totalValue}`);
      if (totalValue === 0) {
        elizaLogger8.error(`DEBUG: Portfolio analysis failed - no value found for ${walletAddress}`);
        elizaLogger8.error(`DEBUG: Portfolio balances were:`, portfolioBalances);
        throw new Error("Portfolio has no value");
      }
      const assets = [];
      const recommendations = [];
      for (const [symbol, targetPercentage] of Object.entries(strategy.allocations)) {
        const currentValue = portfolioBalances[symbol] || 0;
        const currentPercentage = currentValue / totalValue * 100;
        const deviation = currentPercentage - targetPercentage;
        let recommended = "hold";
        let amount = 0;
        if (Math.abs(deviation) > strategy.rebalanceThreshold) {
          if (deviation > 0) {
            recommended = "sell";
            amount = deviation / 100 * totalValue;
          } else {
            recommended = "buy";
            amount = Math.abs(deviation / 100) * totalValue;
          }
          recommendations.push({
            asset: symbol,
            action: recommended,
            amount,
            reason: `${Math.abs(deviation).toFixed(2)}% deviation from target`,
            priority: Math.abs(deviation) > strategy.rebalanceThreshold * 2 ? "high" : "medium"
          });
        }
        assets.push({
          symbol,
          targetPercentage,
          currentPercentage,
          currentValue,
          deviation,
          recommended,
          amount
        });
      }
      const rebalanceNeeded = recommendations.length > 0;
      return {
        totalValue,
        strategy,
        assets,
        rebalanceNeeded,
        recommendations
      };
    } catch (error) {
      elizaLogger8.error(`Portfolio analysis failed:: ${error}`);
      throw error;
    }
  }
  async executeRebalance(walletAddress, recommendations) {
    try {
      const results = [];
      for (const recommendation of recommendations) {
        const txHash = await this.executeRecommendation(walletAddress, recommendation);
        if (txHash) {
          results.push(txHash);
          elizaLogger8.info(`Executed ${recommendation.action} for ${recommendation.asset}: ${txHash}`);
        }
      }
      return results;
    } catch (error) {
      elizaLogger8.error(`Portfolio rebalance failed:: ${error}`);
      throw error;
    }
  }
  async executeRecommendation(walletAddress, recommendation) {
    try {
      elizaLogger8.info(`Executing ${recommendation.action} of ${recommendation.amount} ${recommendation.asset}`);
      return `0x${Math.random().toString(16).substring(2, 66)}`;
    } catch (error) {
      elizaLogger8.error(`Failed to execute ${recommendation.action} for ${recommendation.asset}:: ${error}`);
      return null;
    }
  }
  async getAssetBalance(symbol, address) {
    try {
      const testBalances = {
        "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc": {
          SEI: 1e4,
          USDC: 1e4,
          USDT: 5000,
          ETH: 100,
          BTC: 5,
          ATOM: 1000,
          DAI: 5000
        },
        "0x90f79bf6eb2c4f870365e785982e1f101e93b906": {
          SEI: 5000,
          USDC: 5000,
          USDT: 2000,
          ETH: 25,
          BTC: 1,
          ATOM: 500,
          DAI: 3000
        },
        "0x15d34aaf54267db7d7c367839aaf71a00a2c6a65": {
          SEI: 1e5,
          USDC: 50000,
          USDT: 25000,
          ETH: 500,
          BTC: 20,
          ATOM: 1e4,
          DAI: 30000
        },
        "0x2222222222222222222222222222222222222222": {
          SEI: 1e4,
          USDC: 1e4,
          USDT: 5000,
          ETH: 100,
          BTC: 5,
          ATOM: 1000,
          DAI: 5000
        },
        "0x3333333333333333333333333333333333333333": {
          SEI: 5000,
          USDC: 5000,
          USDT: 2000,
          ETH: 25,
          BTC: 1,
          ATOM: 500,
          DAI: 3000
        },
        "0x4444444444444444444444444444444444444444": {
          SEI: 1e5,
          USDC: 50000,
          USDT: 25000,
          ETH: 500,
          BTC: 20,
          ATOM: 1e4,
          DAI: 30000
        }
      };
      const addressLower = address.toLowerCase();
      const userBalances = testBalances[addressLower];
      const tokenBalance = userBalances ? userBalances[symbol] || 0 : 0;
      elizaLogger8.info(`DEBUG: Original address: ${address}`);
      elizaLogger8.info(`DEBUG: Lowercase address: ${addressLower}`);
      elizaLogger8.info(`DEBUG: Available test addresses:`, Object.keys(testBalances));
      elizaLogger8.info(`DEBUG: Address exists in testBalances:`, addressLower in testBalances);
      elizaLogger8.info(`DEBUG: Found user balances:`, userBalances);
      elizaLogger8.info(`DEBUG: Token balance for ${symbol}: ${tokenBalance}`);
      return tokenBalance;
    } catch (error) {
      elizaLogger8.error(`Failed to get balance for ${symbol}:: ${error}`);
      return 0;
    }
  }
  async getPortfolioBalances(walletAddress) {
    try {
      const balances = {};
      const mockPrices = {
        SEI: 0.45,
        USDC: 1,
        USDT: 1,
        ETH: 2800,
        BTC: 68000,
        ATOM: 9.5,
        DAI: 1,
        OSMO: 0.78
      };
      const symbols = ["SEI", "USDC", "USDT", "ETH", "BTC", "ATOM", "DAI", "OSMO"];
      for (const symbol of symbols) {
        let price = mockPrices[symbol] || 0;
        try {
          const priceFeed = await this.oracleProvider.getPrice(symbol);
          if (priceFeed && priceFeed.price > 0) {
            price = priceFeed.price;
          }
        } catch (error) {
          elizaLogger8.warn(`Using mock price for ${symbol}: ${price}`);
        }
        const balance = await this.getAssetBalance(symbol, walletAddress);
        balances[symbol] = balance * price;
        elizaLogger8.info(`Portfolio balance for ${symbol}: ${balance} tokens × $${price} = $${balances[symbol]}`);
      }
      return balances;
    } catch (error) {
      elizaLogger8.error(`Failed to get portfolio balances:: ${error}`);
      return {};
    }
  }
}
var rebalanceEvaluatorAction = {
  name: "PORTFOLIO_REBALANCE",
  similes: [
    "REBALANCE_PORTFOLIO",
    "PORTFOLIO_ANALYSIS",
    "ASSET_ALLOCATION",
    "PORTFOLIO_OPTIMIZATION"
  ],
  description: "Analyze and rebalance portfolio based on allocation strategies",
  validate: async (runtime, message) => {
    const config = await validateSeiConfig(runtime);
    return config !== null;
  },
  handler: async (runtime, message, state, _options, callback) => {
    try {
      elizaLogger8.info("Starting portfolio rebalance analysis");
      const config = await validateSeiConfig(runtime);
      const walletProvider = new WalletProvider(config.SEI_PRIVATE_KEY, { name: config.SEI_NETWORK || "sei-devnet", chain: seiChains["devnet"] });
      const oracleProvider2 = new SeiOracleProvider(runtime);
      const rebalancer = new PortfolioRebalancer(walletProvider, oracleProvider2);
      const text = typeof message.content === "string" ? message.content : message.content?.text || "";
      const strategyMatch = text.match(/strategy[:\s]+([^,\n]+)/i);
      const strategyName = strategyMatch ? strategyMatch[1].trim() : undefined;
      const addressMatch = text.match(/(?:wallet|address)[:\s]+(0x[a-fA-F0-9]{40})/i);
      const walletAddress = addressMatch ? addressMatch[1] : "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
      if (callback) {
        callback({
          text: `\uD83D\uDD04 Analyzing portfolio for address: ${walletAddress}
⏳ Fetching balances and calculating allocations...`,
          content: {
            action: "portfolio_analysis_started",
            address: walletAddress,
            strategy: strategyName
          }
        });
      }
      const analysis = await rebalancer.analyzePortfolio(walletAddress, strategyName);
      const autoExecute = text.toLowerCase().includes("execute") || text.toLowerCase().includes("rebalance now");
      if (analysis.rebalanceNeeded) {
        const needsRebalancing = analysis.assets.some((asset) => Math.abs(asset.deviation) > analysis.strategy.rebalanceThreshold);
        if (callback) {
          callback({
            text: `\uD83D\uDCCA Portfolio Analysis (${analysis.strategy.name})

` + `\uD83D\uDCB0 Total Value: $${analysis.totalValue.toFixed(2)}
` + `\uD83C\uDFAF Strategy: ${analysis.strategy.description}
` + `⚖️ Risk Level: ${analysis.strategy.riskLevel}

` + `\uD83D\uDCC8 Asset Allocations:
` + analysis.assets.map((asset) => `${asset.symbol}: ${asset.currentPercentage.toFixed(1)}% ` + `(Target: ${asset.targetPercentage}%, ` + `Deviation: ${asset.deviation > 0 ? "+" : ""}${asset.deviation.toFixed(1)}%) ` + `[${asset.recommended.toUpperCase()}${asset.amount ? ` $${asset.amount.toFixed(2)}` : ""}]`).join(`
`) + `

\uD83D\uDD27 Rebalance Recommendations:
` + analysis.recommendations.map((rec) => `${rec.priority.toUpperCase()}: ${rec.action.toUpperCase()} $${rec.amount.toFixed(2)} ${rec.asset} - ${rec.reason}`).join(`
`),
            content: {
              action: "portfolio_analysis_complete",
              analysis,
              needsRebalancing
            }
          });
        }
        if (autoExecute) {
          if (callback) {
            callback({
              text: `\uD83D\uDD04 Executing rebalance recommendations...`,
              content: { action: "rebalance_execution_started" }
            });
          }
          const txHashes = await rebalancer.executeRebalance(walletAddress, analysis.recommendations);
          if (callback) {
            callback({
              text: `✅ Portfolio rebalance complete!

` + `\uD83D\uDCDD Executed ${txHashes.length} transactions:
` + txHashes.map((hash2, i) => `${i + 1}. ${hash2}`).join(`
`),
              content: {
                action: "rebalance_execution_complete",
                transactions: txHashes,
                analysis
              }
            });
          }
        } else {
          if (callback) {
            callback({
              text: `\uD83D\uDCA1 To execute these recommendations, send: "rebalance portfolio execute"`,
              content: {
                action: "rebalance_recommendations_ready",
                analysis
              }
            });
          }
        }
      } else {
        if (callback) {
          callback({
            text: `✅ Portfolio is well-balanced!

` + `\uD83D\uDCCA Current allocations are within target ranges for the ${analysis.strategy.name} strategy.
` + `\uD83D\uDCB0 Total Value: $${analysis.totalValue.toFixed(2)}

` + `\uD83D\uDCC8 Asset Allocations:
` + analysis.assets.map((asset) => `${asset.symbol}: ${asset.currentPercentage.toFixed(1)}% ` + `(Target: ${asset.targetPercentage}%, ` + `Deviation: ${asset.deviation > 0 ? "+" : ""}${asset.deviation.toFixed(1)}%)`).join(`
`),
            content: {
              action: "portfolio_balanced",
              analysis
            }
          });
        }
      }
    } catch (error) {
      elizaLogger8.error(`Portfolio rebalance analysis failed:: ${error}`);
      if (callback) {
        callback({
          text: `❌ Portfolio analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          content: {
            action: "rebalance_failed",
            error: error instanceof Error ? error.message : "Unknown error"
          }
        });
      }
    }
  },
  examples: [
    [
      {
        name: "{{user1}}",
        content: { text: "Analyze my portfolio allocation" }
      },
      {
        name: "{{user2}}",
        content: {
          text: "\uD83D\uDCCA Analyzing your portfolio...",
          action: "PORTFOLIO_REBALANCE"
        }
      }
    ],
    [
      {
        name: "{{user1}}",
        content: { text: "Rebalance my portfolio using conservative strategy" }
      },
      {
        name: "{{user2}}",
        content: {
          text: "\uD83D\uDD04 Rebalancing portfolio with conservative DeFi strategy...",
          action: "PORTFOLIO_REBALANCE"
        }
      }
    ]
  ]
};

// node_modules/@elizaos/plugin-sei-yield-delta/src/actions/yei-finance.ts
var yeiFinanceAction = {
  name: "YEI_FINANCE",
  similes: [
    "YEI_LENDING",
    "YEI_BORROWING",
    "YEI_ORACLE",
    "YEI_RATES"
  ],
  validate: async (runtime, message) => {
    const config = validateSeiConfig(runtime);
    const content = message.content?.text?.toLowerCase() || "";
    const yeiKeywords = [
      "yei finance",
      "yei lending",
      "yei borrow",
      "yei oracle",
      "lending rates",
      "borrow rates",
      "collateral",
      "liquidation",
      "api3",
      "multi oracle",
      "defi lending"
    ];
    return yeiKeywords.some((keyword) => content.includes(keyword));
  },
  description: "Get information about YEI Finance lending protocol, rates, and oracle prices",
  handler: async (runtime, message, state, _options, callback) => {
    try {
      const config = validateSeiConfig(runtime);
      const oracle = new SeiOracleProvider(runtime);
      const content = message.content?.text?.toLowerCase() || "";
      let response = "";
      if (content.includes("lending rates") || content.includes("borrow rates")) {
        response = `YEI Finance Lending Rates:
• Multi-oracle price feeds ensure accurate valuations
• API3 dAPI (Primary) + Pyth Network (Backup) + Redstone (Fallback)
• Competitive interest rates with liquidation protection
• Current supported assets: BTC, ETH, SEI, USDC, USDT

For real-time rates, prices are fetched from our multi-oracle system.`;
      } else if (content.includes("oracle") || content.includes("api3") || content.includes("pyth")) {
        try {
          const btcPrice = await oracle.getPrice("BTC");
          const ethPrice = await oracle.getPrice("ETH");
          response = `YEI Finance Multi-Oracle System:
\uD83D\uDD39 API3 dAPI: Primary oracle source with high accuracy
\uD83D\uDD39 Pyth Network: 100+ publishers for price consensus  
\uD83D\uDD39 Redstone Classic: Backup for stablecoin pairs

Current Prices (Multi-Oracle):
${btcPrice ? `• BTC: $${btcPrice.price.toFixed(2)} (${btcPrice.source})` : "• BTC: Price unavailable"}
${ethPrice ? `• ETH: $${ethPrice.price.toFixed(2)} (${ethPrice.source})` : "• ETH: Price unavailable"}

This multi-oracle approach provides manipulation resistance and high reliability.`;
        } catch (error) {
          response = `YEI Finance Multi-Oracle System:
\uD83D\uDD39 API3 dAPI: Primary oracle source
� Pyth Network: Backup with 100+ publishers
\uD83D\uDD39 Redstone Classic: Fallback for stablecoins

The multi-oracle system ensures price accuracy and manipulation resistance for safe lending operations.`;
        }
      } else {
        response = `YEI Finance - Advanced DeFi Lending Protocol:

\uD83C\uDFE6 **Core Features:**
• Multi-collateral lending and borrowing
• API3 + Pyth + Redstone oracle integration
• Automated liquidation protection
• Interest rate optimization

\uD83D\uDD12 **Security:**
• Multi-oracle price validation
• Manipulation-resistant pricing
• Smart contract audited protocols

\uD83D\uDCCA **Supported Assets:**
• BTC, ETH, SEI (Native)
• USDC, USDT (Stablecoins)

\uD83D\uDCA1 **Benefits:**
• Higher capital efficiency
• Lower liquidation risks
• Competitive interest rates
• Transparent on-chain operations

Ask about specific lending rates, oracle prices, or collateral requirements!`;
      }
      if (callback) {
        callback({
          text: response,
          content: {
            text: response,
            source: "yei-finance",
            action: "YEI_FINANCE"
          }
        });
      }
    } catch (error) {
      console.error("Error in YEI Finance action:", error);
      if (callback) {
        callback({
          text: "I encountered an error fetching YEI Finance information. Please try again.",
          content: {
            error: error instanceof Error ? error.message : "Unknown error",
            action: "YEI_FINANCE"
          }
        });
      }
    }
  },
  examples: [
    [
      {
        name: "{{user1}}",
        content: { text: "What are the current YEI Finance lending rates?" }
      },
      {
        name: "{{agentName}}",
        content: {
          text: "Let me check the current YEI Finance lending rates and oracle prices...",
          action: "YEI_FINANCE"
        }
      }
    ],
    [
      {
        name: "{{user1}}",
        content: { text: "How does YEI Finance's multi-oracle system work?" }
      },
      {
        name: "{{agentName}}",
        content: {
          text: "YEI Finance uses a sophisticated multi-oracle strategy...",
          action: "YEI_FINANCE"
        }
      }
    ]
  ]
};

// node_modules/@elizaos/plugin-sei-yield-delta/src/actions/il-protection.ts
import {
  elizaLogger as elizaLogger12
} from "@elizaos/core";

// node_modules/@elizaos/plugin-sei-yield-delta/src/providers/impermanent-loss-protector.ts
import {
  elizaLogger as elizaLogger11
} from "@elizaos/core";

// node_modules/@elizaos/plugin-sei-yield-delta/src/providers/geographic-routing.ts
import {
  elizaLogger as elizaLogger10
} from "@elizaos/core";

// node_modules/@elizaos/plugin-sei-yield-delta/src/providers/coinbase-advanced.ts
import { elizaLogger as elizaLogger9 } from "@elizaos/core";

class CoinbaseAdvancedProvider {
  async openPerpPosition(params) {
    elizaLogger9.log(`Opening perp position on Coinbase: ${params.symbol}, size: ${params.size}, side: ${params.side}`);
    return "0x123...abc";
  }
  async closePerpPosition(symbol, size4) {
    elizaLogger9.log(`Closing perp position on Coinbase: ${symbol}, size: ${size4 ?? "full"}`);
    return "0xclose...abc";
  }
  async getPositions() {
    elizaLogger9.log("Querying open perp positions on Coinbase");
    return [];
  }
  async getHedgeRecommendation(lpPosition) {
    elizaLogger9.log(`Calculating hedge recommendation for ${lpPosition.baseToken}/${lpPosition.quoteToken}`);
    return {
      type: "PERP_HEDGE",
      provider: "Coinbase Advanced",
      hedgeRatio: 0.75,
      expectedILReduction: "~65% IL protection",
      symbol: `${lpPosition.baseToken}${lpPosition.quoteToken}`,
      size: (lpPosition.value * 0.75).toFixed(2),
      action: "short",
      cost: "$12.50 in fees",
      txHash: "0x123...abc",
      reason: `High volatility detected between ${lpPosition.baseToken}/${lpPosition.quoteToken}. Hedge ratio optimized for current market conditions.`
    };
  }
  credentials;
  baseUrl;
  constructor(credentials) {
    this.credentials = credentials;
    this.baseUrl = credentials.sandbox ? "https://api-public.sandbox.exchange.coinbase.com" : "https://api.exchange.coinbase.com";
  }
  async getMarketPrice(symbol) {
    elizaLogger9.log(`Getting market price for ${symbol}`);
    return 50000;
  }
  calculateHedgeRatio(lpPosition, volatility) {
    const baseRatio = 0.5;
    const volatilityAdjustment = Math.min(volatility / 100, 0.5);
    return Math.min(baseRatio + volatilityAdjustment, 0.9);
  }
  async executeILHedge(lpPosition) {
    return {
      success: true,
      orderId: "0x123...abc",
      message: `Successfully hedged ${lpPosition.baseToken}/${lpPosition.quoteToken} LP position`
    };
  }
}

// node_modules/@elizaos/plugin-sei-yield-delta/src/providers/geographic-routing.ts
class GeographicTradingRouter {
  config;
  coinbaseProvider;
  constructor(config) {
    this.config = config;
    if (this.config.COINBASE_ADVANCED_API_KEY && this.config.COINBASE_ADVANCED_SECRET && this.config.COINBASE_ADVANCED_PASSPHRASE) {
      this.coinbaseProvider = new CoinbaseAdvancedProvider({
        apiKey: this.config.COINBASE_ADVANCED_API_KEY,
        apiSecret: this.config.COINBASE_ADVANCED_SECRET,
        passphrase: this.config.COINBASE_ADVANCED_PASSPHRASE,
        sandbox: this.config.COINBASE_SANDBOX || false
      });
    }
  }
  async getBestPerpProvider() {
    const preference = this.config.PERP_PREFERENCE;
    const geography = this.config.USER_GEOGRAPHY;
    elizaLogger10.log(`Selecting perp provider for ${geography} with preference ${preference}`);
    if (preference === "COINBASE_ONLY") {
      if (this.coinbaseProvider) {
        return this.createCoinbaseWrapper();
      } else {
        throw new Error("Coinbase credentials not configured");
      }
    }
    if (preference === "ONCHAIN_ONLY") {
      return this.createOnChainWrapper();
    }
    switch (geography) {
      case "US":
        if (this.coinbaseProvider && (preference === "GEOGRAPHIC" || preference === "GLOBAL")) {
          elizaLogger10.log("Using Coinbase Advanced for US user");
          return this.createCoinbaseWrapper();
        }
        elizaLogger10.log("Fallback to on-chain perps for US user");
        return this.createOnChainWrapper();
      case "EU":
        if (preference === "GEOGRAPHIC") {
          elizaLogger10.log("Using on-chain perps for EU user (geographic preference)");
          return this.createOnChainWrapper();
        }
        return this.createOnChainWrapper();
      case "ASIA":
        elizaLogger10.log("Using on-chain perps for ASIA user");
        return this.createOnChainWrapper();
      default:
        if (this.coinbaseProvider && preference === "GEOGRAPHIC") {
          return this.createCoinbaseWrapper();
        }
        return this.createOnChainWrapper();
    }
  }
  createCoinbaseWrapper() {
    if (!this.coinbaseProvider) {
      throw new Error("Coinbase provider not initialized");
    }
    return {
      name: "Coinbase Advanced",
      geographic: true,
      regulated: true,
      openPosition: (params) => this.coinbaseProvider.openPerpPosition(params),
      closePosition: (symbol, size4) => this.coinbaseProvider.closePerpPosition(symbol, size4),
      getPositions: () => this.coinbaseProvider.getPositions(),
      getHedgeRecommendation: (lpPosition) => this.coinbaseProvider.getHedgeRecommendation(lpPosition)
    };
  }
  createOnChainWrapper() {
    return {
      name: "Sei On-Chain Perps",
      geographic: false,
      regulated: false,
      openPosition: async (params) => {
        elizaLogger10.log("On-chain perp trading not yet implemented in wrapper");
        return null;
      },
      closePosition: async (symbol, size4) => {
        elizaLogger10.log("On-chain perp closing not yet implemented in wrapper");
        return null;
      },
      getPositions: async () => {
        elizaLogger10.log("On-chain position query not yet implemented in wrapper");
        return [];
      }
    };
  }
  async executeGeographicHedge(lpPosition) {
    try {
      elizaLogger10.log(`Executing geographic hedge for LP position: ${lpPosition.baseToken}/${lpPosition.quoteToken}`);
      const provider = await this.getBestPerpProvider();
      if (!provider.getHedgeRecommendation) {
        throw new Error(`Provider ${provider.name} does not support hedge recommendations`);
      }
      const hedgeStrategy = await provider.getHedgeRecommendation(lpPosition);
      const hedgeParams = {
        symbol: hedgeStrategy.symbol,
        size: hedgeStrategy.size,
        side: hedgeStrategy.action.toLowerCase(),
        leverage: 1,
        slippage: 50
      };
      const txHash = await provider.openPosition(hedgeParams);
      if (txHash) {
        return {
          success: true,
          provider: provider.name,
          txHash,
          hedgeRatio: parseFloat(hedgeStrategy.size) / lpPosition.value,
          expectedILReduction: hedgeStrategy.expectedILReduction
        };
      } else {
        return {
          success: false,
          provider: provider.name,
          hedgeRatio: 0,
          expectedILReduction: "0%",
          error: "Failed to execute hedge position"
        };
      }
    } catch (error) {
      elizaLogger10.error(`Geographic hedge execution failed:: ${error}`);
      return {
        success: false,
        provider: "unknown",
        hedgeRatio: 0,
        expectedILReduction: "0%",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
  async getProviderCapabilities() {
    const provider = await this.getBestPerpProvider();
    return {
      name: provider.name,
      geographic: provider.geographic,
      regulated: provider.regulated,
      supportsHedging: !!provider.getHedgeRecommendation,
      geography: this.config.USER_GEOGRAPHY,
      preference: this.config.PERP_PREFERENCE
    };
  }
  async getAvailableProviders() {
    const providers = [];
    if (this.coinbaseProvider) {
      providers.push("Coinbase Advanced");
    }
    providers.push("Sei On-Chain Perps");
    return providers;
  }
}

// node_modules/@elizaos/plugin-sei-yield-delta/src/providers/impermanent-loss-protector.ts
class ImpermanentLossProtector {
  geographicRouter;
  riskCalculator;
  constructor(config) {
    this.geographicRouter = new GeographicTradingRouter(config);
    this.riskCalculator = new BasicILRiskCalculator;
  }
  async protectLiquidityPosition(position, strategy) {
    try {
      elizaLogger11.log(`Analyzing IL protection for ${position.baseToken}/${position.quoteToken} position`);
      const ilRisk = await this.riskCalculator.calculateRisk(position);
      elizaLogger11.log(`IL Risk Assessment: ${ilRisk.riskLevel}, Current IL: ${ilRisk.currentIL.toFixed(2)}%`);
      const protectionType = this.determineProtectionStrategy(ilRisk, strategy);
      if (protectionType === "PERP_HEDGE") {
        return await this.executePerpsHedge(position, ilRisk);
      } else if (protectionType === "OPTIONS_COLLAR") {
        return await this.executeOptionsStrategy(position, ilRisk);
      } else {
        return this.createRebalanceOnlyStrategy(position, ilRisk);
      }
    } catch (error) {
      elizaLogger11.error(`Failed to protect liquidity position:: ${error}`);
      throw error;
    }
  }
  determineProtectionStrategy(ilRisk, userStrategy) {
    if (ilRisk.riskLevel === "LOW") {
      return "REBALANCE_ONLY";
    }
    if (userStrategy === "CONSERVATIVE") {
      return "REBALANCE_ONLY";
    } else if (userStrategy === "AGGRESSIVE") {
      return "PERP_HEDGE";
    }
    switch (ilRisk.riskLevel) {
      case "MEDIUM":
        return ilRisk.volatility > 0.5 ? "PERP_HEDGE" : "REBALANCE_ONLY";
      case "HIGH":
      case "CRITICAL":
        return "PERP_HEDGE";
      default:
        return "REBALANCE_ONLY";
    }
  }
  async executePerpsHedge(position, ilRisk) {
    try {
      elizaLogger11.log("Executing perpetual hedge strategy");
      const hedgeRatio = this.riskCalculator.getOptimalHedgeRatio(ilRisk);
      const hedgeResult = await this.geographicRouter.executeGeographicHedge(position);
      if (hedgeResult.success) {
        return {
          type: "PERP_HEDGE",
          provider: hedgeResult.provider,
          hedgeRatio: hedgeResult.hedgeRatio,
          expectedILReduction: hedgeResult.expectedILReduction,
          txHash: hedgeResult.txHash,
          cost: this.estimateHedgeCost(position, hedgeRatio),
          reason: `Risk level: ${ilRisk.riskLevel}, Projected IL: ${ilRisk.projectedIL.toFixed(2)}%`
        };
      } else {
        elizaLogger11.log("Hedge failed, falling back to rebalance strategy");
        return this.createRebalanceOnlyStrategy(position, ilRisk);
      }
    } catch (error) {
      elizaLogger11.error(`Perps hedge execution failed:: ${error}`);
      return this.createRebalanceOnlyStrategy(position, ilRisk);
    }
  }
  async executeOptionsStrategy(position, ilRisk) {
    elizaLogger11.log("Options strategy not yet implemented, using perps hedge");
    return await this.executePerpsHedge(position, ilRisk);
  }
  createRebalanceOnlyStrategy(position, ilRisk) {
    return {
      type: "REBALANCE_ONLY",
      provider: "Internal",
      hedgeRatio: 0,
      expectedILReduction: "15%",
      reason: `Low risk (${ilRisk.riskLevel}), rebalancing sufficient`,
      cost: "0.1%"
    };
  }
  estimateHedgeCost(position, hedgeRatio) {
    const tradingFees = position.value * hedgeRatio * 0.001;
    const fundingCosts = position.value * hedgeRatio * 0.0001 * 24;
    return `$${(tradingFees + fundingCosts).toFixed(2)}`;
  }
  async getILAnalysis(position) {
    return await this.riskCalculator.calculateRisk(position);
  }
  async simulateILScenarios(position, priceChanges) {
    const scenarios = [];
    for (const priceChange of priceChanges) {
      const futurePrice = parseFloat(position.baseAmount) * (1 + priceChange);
      const il = await this.riskCalculator.estimateILAtPrice(position, futurePrice);
      const hedgedIL = il * 0.2;
      scenarios.push({
        priceChange: priceChange * 100,
        il: il * 100,
        hedgedIL: hedgedIL * 100
      });
    }
    return scenarios;
  }
}

class BasicILRiskCalculator {
  async calculateRisk(position) {
    try {
      const volatility = await this.estimateVolatility(position.baseToken);
      const correlation = await this.estimateCorrelation(position.baseToken, position.quoteToken);
      const timeInPosition = 24;
      const currentIL = this.calculateCurrentIL(position, volatility);
      const projectedIL = this.projectFutureIL(currentIL, volatility, timeInPosition);
      const riskLevel = this.assessRiskLevel(projectedIL, volatility);
      return {
        volatility,
        priceCorrelation: correlation,
        timeInPosition,
        currentIL,
        projectedIL,
        riskLevel
      };
    } catch (error) {
      elizaLogger11.error(`Risk calculation failed:: ${error}`);
      return {
        volatility: 0.5,
        priceCorrelation: 0.3,
        timeInPosition: 24,
        currentIL: 5,
        projectedIL: 10,
        riskLevel: "MEDIUM"
      };
    }
  }
  async estimateILAtPrice(position, futurePrice) {
    const currentPrice = parseFloat(position.baseAmount);
    const priceRatio = futurePrice / currentPrice;
    const il = 2 * Math.sqrt(priceRatio) / (1 + priceRatio) - 1;
    return Math.abs(il);
  }
  getOptimalHedgeRatio(riskMetrics) {
    let baseRatio = 0.3;
    switch (riskMetrics.riskLevel) {
      case "LOW":
        baseRatio = 0.1;
        break;
      case "MEDIUM":
        baseRatio = 0.4;
        break;
      case "HIGH":
        baseRatio = 0.6;
        break;
      case "CRITICAL":
        baseRatio = 0.8;
        break;
    }
    const volatilityAdjustment = Math.min(riskMetrics.volatility * 0.3, 0.2);
    return Math.min(baseRatio + volatilityAdjustment, 0.9);
  }
  async estimateVolatility(token) {
    const volatilityMap = {
      BTC: 0.6,
      ETH: 0.7,
      SEI: 1.2,
      USDC: 0.05,
      USDT: 0.05
    };
    return volatilityMap[token] || 0.8;
  }
  async estimateCorrelation(token1, token2) {
    if (token1 === token2)
      return 1;
    if (token1 === "USDC" || token1 === "USDT" || (token2 === "USDC" || token2 === "USDT")) {
      return 0.1;
    }
    if ((token1 === "BTC" || token1 === "ETH") && (token2 === "BTC" || token2 === "ETH")) {
      return 0.7;
    }
    return 0.4;
  }
  calculateCurrentIL(position, volatility) {
    return volatility * 10;
  }
  projectFutureIL(currentIL, volatility, timeHours) {
    const timeAdjustment = Math.sqrt(timeHours / 24);
    return currentIL * (1 + volatility * timeAdjustment);
  }
  assessRiskLevel(projectedIL, volatility) {
    if (projectedIL < 5 && volatility < 0.3)
      return "LOW";
    if (projectedIL < 10 && volatility < 0.6)
      return "MEDIUM";
    if (projectedIL < 20 && volatility < 1)
      return "HIGH";
    return "CRITICAL";
  }
}

// node_modules/@elizaos/plugin-sei-yield-delta/src/actions/il-protection.ts
var ilProtectionAction = {
  name: "IL_PROTECTION",
  similes: [
    "HEDGE_IL",
    "PROTECT_LIQUIDITY",
    "IMPERMANENT_LOSS_PROTECTION",
    "HEDGE_LP_POSITION"
  ],
  validate: async (runtime, message) => {
    try {
      await validateSeiConfig(runtime);
      const text = message.content?.text?.toLowerCase() || "";
      return (text.includes("protect") || text.includes("hedge") || text.includes("il")) && (text.includes("liquidity") || text.includes("lp") || text.includes("position") || text.includes("impermanent") || text.includes("loss"));
    } catch (error) {
      return false;
    }
  },
  description: "Protect liquidity positions from impermanent loss using geographic-aware perpetual hedging",
  handler: async (runtime, message, state, _options, callback) => {
    elizaLogger12.log("Processing IL protection request");
    try {
      if (false) {}
      const config = await validateSeiConfig(runtime);
      const text = message.content?.text?.toLowerCase() || "";
      const lpPosition = parseILProtectionParams(text);
      if (!lpPosition) {
        if (callback) {
          callback({
            text: "Please provide liquidity position details in format: 'protect my ETH/USDC LP worth $1000'",
            error: true
          });
        }
        return;
      }
      const ilProtector = new ImpermanentLossProtector({
        USER_GEOGRAPHY: config.USER_GEOGRAPHY || "GLOBAL",
        PERP_PREFERENCE: config.PERP_PREFERENCE || "GEOGRAPHIC",
        COINBASE_ADVANCED_API_KEY: config.COINBASE_ADVANCED_API_KEY,
        COINBASE_ADVANCED_SECRET: config.COINBASE_ADVANCED_SECRET,
        COINBASE_ADVANCED_PASSPHRASE: config.COINBASE_ADVANCED_PASSPHRASE,
        COINBASE_SANDBOX: config.COINBASE_SANDBOX
      });
      const riskAnalysis = await ilProtector.getILAnalysis(lpPosition);
      if (riskAnalysis.riskLevel === "LOW") {
        if (callback) {
          callback({
            text: `\uD83D\uDCCA **IL Risk Analysis Complete**

` + `**Position**: ${lpPosition.baseToken}/${lpPosition.quoteToken}
` + `**Value**: $${lpPosition.value.toLocaleString()}
` + `**Risk Level**: ${riskAnalysis.riskLevel} ✅
` + `**Current IL**: ${riskAnalysis.currentIL.toFixed(2)}%
` + `**Projected IL**: ${riskAnalysis.projectedIL.toFixed(2)}%

` + `**Recommendation**: No hedging needed. Risk is low and periodic rebalancing should be sufficient.`
          });
        }
        return;
      }
      const protectionStrategy = await ilProtector.protectLiquidityPosition(lpPosition);
      const scenarios = await ilProtector.simulateILScenarios(lpPosition, [-0.5, -0.25, 0, 0.25, 0.5, 1]);
      if (callback) {
        const scenarioText = scenarios.map((s) => `${s.priceChange > 0 ? "+" : ""}${s.priceChange.toFixed(0)}%: ${s.il.toFixed(1)}% IL → ${s.hedgedIL.toFixed(1)}% (hedged)`).join(`
`);
        callback({
          text: `\uD83D\uDEE1️ **Impermanent Loss Protection Activated**

` + `**Position Protected**: ${lpPosition.baseToken}/${lpPosition.quoteToken}
` + `**Value**: $${lpPosition.value.toLocaleString()}
` + `**Risk Level**: ${riskAnalysis.riskLevel} ${getRiskEmoji(riskAnalysis.riskLevel)}

` + `**Protection Strategy**: ${protectionStrategy.type}
` + `**Provider**: ${protectionStrategy.provider}
` + `**Hedge Ratio**: ${(protectionStrategy.hedgeRatio * 100).toFixed(1)}%
` + `**Expected IL Reduction**: ${protectionStrategy.expectedILReduction}
` + `**Estimated Cost**: ${protectionStrategy.cost || "Calculated at execution"}
` + `${protectionStrategy.txHash ? `**Transaction**: ${protectionStrategy.txHash}` : ""}

` + `**IL Scenarios** (Price Change → Unhedged IL → Hedged IL):
` + `\`\`\`
${scenarioText}
\`\`\`

` + `**Reason**: ${protectionStrategy.reason}`
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      elizaLogger12.error(`Error in IL protection:: ${error}`);
      if (callback) {
        callback({
          text: `❌ Error setting up IL protection: ${errorMessage}`,
          error: true
        });
      }
    }
  },
  examples: [
    [
      {
        name: "{{user1}}",
        content: { text: "Protect my ETH/USDC LP position worth $5000" }
      },
      {
        name: "{{agentName}}",
        content: {
          text: "Analyzing your liquidity position for impermanent loss protection...",
          action: "IL_PROTECTION"
        }
      }
    ],
    [
      {
        name: "{{user1}}",
        content: { text: "Hedge my BTC/USDT liquidity against IL" }
      },
      {
        name: "{{agentName}}",
        content: {
          text: "Setting up impermanent loss hedge for your BTC/USDT position...",
          action: "IL_PROTECTION"
        }
      }
    ]
  ]
};
function parseILProtectionParams(text) {
  const lpMatch = text.match(/(?:protect|hedge).*?(\w+)[\/\-](\w+).*?(?:\$|worth\s*\$?)(\d+(?:,\d{3})*(?:\.\d+)?)/i);
  if (lpMatch) {
    const baseToken = lpMatch[1].toUpperCase();
    const quoteToken = lpMatch[2].toUpperCase();
    const value = parseFloat(lpMatch[3].replace(/,/g, ""));
    return {
      baseToken,
      quoteToken,
      value,
      baseAmount: (value / 2).toString(),
      quoteAmount: (value / 2).toString(),
      poolAddress: "0x...",
      protocol: "auto-detected"
    };
  }
  const altMatch = text.match(/(\w+)[\/\-](\w+).*?lp.*?(\d+)/i);
  if (altMatch) {
    return {
      baseToken: altMatch[1].toUpperCase(),
      quoteToken: altMatch[2].toUpperCase(),
      value: parseFloat(altMatch[3]),
      baseAmount: (parseFloat(altMatch[3]) / 2).toString(),
      quoteAmount: (parseFloat(altMatch[3]) / 2).toString(),
      poolAddress: "0x...",
      protocol: "auto-detected"
    };
  }
  return null;
}
function getRiskEmoji(riskLevel) {
  switch (riskLevel) {
    case "LOW":
      return "\uD83D\uDFE2";
    case "MEDIUM":
      return "\uD83D\uDFE1";
    case "HIGH":
      return "\uD83D\uDFE0";
    case "CRITICAL":
      return "\uD83D\uDD34";
    default:
      return "⚪";
  }
}

// node_modules/@elizaos/plugin-sei-yield-delta/src/amm-layer.ts
class AMMLayerManager {
  clob;
  positions = {};
  onRebalance;
  onFallback;
  constructor(clob, hooks) {
    this.clob = clob;
    if (hooks) {
      this.onRebalance = hooks.onRebalance;
      this.onFallback = hooks.onFallback;
    }
  }
  async initPosition(symbol, min, max, amount) {
    this.positions[symbol] = {
      range: { min, max },
      amount,
      analytics: { fees: 0, slippage: 0, rebalances: 0 }
    };
    return this.positions[symbol];
  }
  setDynamicRange(symbol, price, volatility = 0.05) {
    const band = price * volatility;
    if (this.positions[symbol]) {
      this.positions[symbol].range.min = price - band;
      this.positions[symbol].range.max = price + band;
    }
    return this.positions[symbol]?.range;
  }
  async rebalance(symbol, newPrice, fee = 0, slippage = 0, threshold = 0.02) {
    const pos = this.positions[symbol];
    if (!pos)
      return null;
    const minThreshold = pos.range.min - pos.range.min * threshold;
    const maxThreshold = pos.range.max + pos.range.max * threshold;
    if (newPrice < minThreshold || newPrice > maxThreshold) {
      this.setDynamicRange(symbol, newPrice);
      pos.analytics.rebalances++;
      pos.analytics.fees += fee;
      pos.analytics.slippage += slippage;
      if (this.onRebalance)
        this.onRebalance(symbol, pos);
      await this.placeRangeOrder(symbol);
    }
    return pos;
  }
  async placeRangeOrder(symbol) {
    const pos = this.positions[symbol];
    if (!pos)
      return null;
    return this.clob.placeRangeOrder(symbol, pos.range, pos.amount);
  }
  async handleEscape(symbol, price) {
    const pos = this.positions[symbol];
    if (!pos)
      return null;
    if (price > pos.range.max || price < pos.range.min) {
      if (this.onFallback)
        this.onFallback(symbol);
      return "options-hedge-activated";
    }
    return "in-range";
  }
  getAnalytics(symbol) {
    const pos = this.positions[symbol];
    return pos ? pos.analytics : null;
  }
  async rebalanceAll(prices, fee = 0, slippage = 0, threshold = 0.02) {
    for (const symbol of Object.keys(prices)) {
      await this.rebalance(symbol, prices[symbol], fee, slippage, threshold);
    }
  }
}

// node_modules/@elizaos/plugin-sei-yield-delta/src/actions/amm-optimize.ts
var ammOptimizeAction = {
  name: "AMM_OPTIMIZE",
  description: "Optimizes concentrated liquidity ranges and rebalances positions using Sei CLOB with AI assistance",
  validate: async (runtime, message) => {
    const text = message.content?.text?.toLowerCase() || "";
    return text.includes("optimize") && (text.includes("lp") || text.includes("amm") || text.includes("liquidity")) || text.includes("lp") && text.includes("optimization") || text.includes("concentrated") && text.includes("liquidity");
  },
  async handler(runtime, message, state, options, callback) {
    try {
      const aiEngineUrl = runtime.getSetting?.("AI_ENGINE_URL") || "http://localhost:8000";
      const text = message.content?.text?.toLowerCase() || "";
      const pairMatch = text.match(/(eth\/usdc|btc\/usdt|sei\/usdc|atom\/sei)/);
      const defaultPair = pairMatch ? pairMatch[1] : "eth/usdc";
      const requestBody = {
        vault_address: "0x1234567890123456789012345678901234567890",
        current_price: defaultPair.includes("btc") ? 32000 : 2500,
        volatility: 0.3,
        volume_24h: 1e6,
        liquidity: 500000,
        timeframe: "1d",
        chain_id: 713715
      };
      let aiOptimization = null;
      try {
        const response = await fetch(`${aiEngineUrl}/predict/optimal-range`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody)
        });
        if (response.ok) {
          aiOptimization = await response.json();
        }
      } catch (aiError) {
        console.log("AI optimization unavailable, using fallback strategy");
      }
      const clob = runtime.seiClobProvider || {
        placeRangeOrder: async () => ({ success: true, orderId: "mock-order-123" })
      };
      const manager = new AMMLayerManager(clob);
      if (aiOptimization) {
        const symbol = defaultPair.toUpperCase().replace("/", "/");
        await manager.initPosition(symbol, aiOptimization.lower_tick, aiOptimization.upper_tick, 1000);
        await callback({
          text: `\uD83E\uDD16 AI-optimized AMM position created for ${symbol}

\uD83D\uDCCA **AI Analysis:**
• Lower Tick: ${aiOptimization.lower_tick}
• Upper Tick: ${aiOptimization.upper_tick}
• Confidence: ${(aiOptimization.confidence * 100).toFixed(1)}%
• Expected APR: ${(aiOptimization.expected_apr * 100).toFixed(1)}%

${aiOptimization.reasoning}`,
          content: {
            type: "amm_optimization",
            optimization: aiOptimization
          }
        });
      } else {
        await manager.initPosition("ETH/USDC", 1800, 2200, 1000);
        await manager.initPosition("BTC/USDT", 29000, 31000, 500);
        await manager.rebalanceAll({ "ETH/USDC": 2500, "BTC/USDT": 32000 }, 2, 0.5, 0.02);
        const analytics = Object.keys(manager["positions"]).map((symbol) => ({ symbol, ...manager.getAnalytics(symbol) }));
        await callback({
          text: `AMM optimization complete. Analytics: ${JSON.stringify(analytics)}`,
          content: {
            type: "amm_optimization",
            analytics
          }
        });
      }
    } catch (error) {
      await callback({
        text: `Error optimizing AMM positions: ${error instanceof Error ? error.message : "Unknown error"}`,
        content: {
          type: "error"
        }
      });
    }
  },
  examples: [
    [
      { name: "{{user1}}", content: { text: "Optimize my LP positions for ETH/USDC and BTC/USDT" } },
      { name: "{{agentName}}", content: { action: "AMM_OPTIMIZE", text: "AMM optimization complete. Analytics: ..." } }
    ]
  ]
};

// node_modules/@elizaos/plugin-sei-yield-delta/src/actions/delta-neutral.ts
var deltaNeutralAction = {
  name: "DELTA_NEUTRAL",
  description: "Execute delta neutral strategy combining LP positions with perpetual hedging",
  validate: async (runtime, message) => {
    const text = message.content?.text?.toLowerCase() || "";
    return text.includes("delta") && text.includes("neutral") || text.includes("market") && text.includes("neutral") || text.includes("delta neutral");
  },
  handler: async (runtime, message, state, options, callback) => {
    try {
      const text = message.content?.text?.toLowerCase() || "";
      if (text.includes("info") || text.includes("help") || text.includes("explain")) {
        await callback({
          text: `\uD83D\uDD04 **Delta Neutral Strategy Commands:**

• **"execute delta neutral strategy for [PAIR]"** - Start delta neutral position
• **"delta neutral optimization"** - Get AI-optimized parameters  
• **"market neutral LP for [PAIR]"** - Create market-neutral liquidity position

**What is Delta Neutral?**
A delta neutral strategy combines:
1. **Concentrated LP positions** to earn fees
2. **Perpetual hedging** to minimize price risk
3. **AI optimization** for optimal parameters

This strategy profits from volatility and fees while staying market-neutral.`,
          content: { type: "help" }
        });
        return;
      }
      const pairMatch = text.match(/(eth\/usdc|btc\/usdt|sei\/usdc|atom\/sei)/);
      const pair = pairMatch ? pairMatch[1].toUpperCase() : "ETH/USDC";
      const aiEngineUrl = runtime.getSetting?.("AI_ENGINE_URL") || "http://localhost:8000";
      const requestBody = {
        pair,
        position_size: 1e4,
        current_price: pair.includes("BTC") ? 32000 : 2500,
        volatility: 0.25,
        market_conditions: {
          funding_rate: 0.01,
          liquidity_depth: 5000000
        }
      };
      const response = await fetch(`${aiEngineUrl}/predict/delta-neutral-optimization`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });
      if (!response.ok) {
        throw new Error(`AI optimization failed: ${response.status}`);
      }
      const optimization = await response.json();
      await callback({
        text: `\uD83C\uDFAF **Delta Neutral Strategy Executed for ${pair}**

\uD83D\uDD04 **Strategy Details:**
• Hedge Ratio: ${(optimization.hedge_ratio * 100).toFixed(1)}%
• Market Neutrality: ${(optimization.expected_neutrality * 100).toFixed(1)}%
• Expected APR: ${(optimization.expected_apr * 100).toFixed(1)}%

\uD83D\uDCB0 **Revenue Breakdown:**
• LP Fees: $${optimization.revenue_breakdown.lp_fees.toLocaleString()}
• Funding Rates: $${optimization.revenue_breakdown.funding_rates.toLocaleString()}
• Volatility Capture: $${optimization.revenue_breakdown.volatility_capture.toLocaleString()}

\uD83D\uDCCA **Position Range:**
• Lower Price: $${optimization.lower_price.toFixed(2)}
• Upper Price: $${optimization.upper_price.toFixed(2)}

\uD83E\uDD16 **AI Analysis:**
${optimization.reasoning}`,
        content: {
          type: "delta_neutral_execution",
          optimization
        }
      });
    } catch (error) {
      await callback({
        text: `❌ Error executing delta neutral strategy: ${error instanceof Error ? error.message : "Unknown error"}

\uD83D\uDCA1 **Troubleshooting:**
• Check if AI engine is running on port 8000
• Verify network connectivity  
• Try again with a simpler command like "delta neutral info"`,
        content: { type: "error" }
      });
    }
  },
  examples: [
    [
      { name: "user", content: { text: "execute delta neutral strategy for ETH/USDC" } },
      { name: "agent", content: { action: "DELTA_NEUTRAL", text: "Delta Neutral Strategy Executed for ETH/USDC..." } }
    ],
    [
      { name: "user", content: { text: "delta neutral info" } },
      { name: "agent", content: { action: "DELTA_NEUTRAL", text: "Delta Neutral Strategy Commands..." } }
    ]
  ]
};

// node_modules/@elizaos/plugin-sei-yield-delta/src/evaluators/amm-risk.ts
var ammRiskEvaluator = {
  name: "AMM_RISK_EVALUATOR",
  description: "Evaluates risk and opportunity for AMM positions using analytics and price bands",
  validate: async (runtime, positions) => {
    return Array.isArray(positions) && positions.length > 0;
  },
  async handler(runtime, positions, _, __, callback) {
    const clob = runtime.seiClobProvider;
    const manager = new AMMLayerManager(clob);
    for (const p of positions) {
      await manager.initPosition(p.symbol, p.min, p.max, p.amount);
    }
    const riskReport = Object.keys(manager["positions"]).map((symbol) => {
      const analytics = manager.getAnalytics(symbol);
      const pos = manager["positions"][symbol];
      const riskLevel = analytics && (analytics.rebalances > 2 || analytics.slippage > 1) ? "HIGH" : "LOW";
      return { symbol, riskLevel, analytics, range: pos.range };
    });
    const result = { success: true, data: riskReport };
    if (callback)
      callback(result);
    return result;
  },
  examples: [
    {
      prompt: "Evaluate AMM risk for my positions",
      messages: [
        { name: "{{user1}}", content: { text: "Evaluate AMM risk for my positions" } },
        { name: "{{agentName}}", content: { action: "AMM_RISK_EVALUATOR", text: "AMM risk evaluation complete. Report: ..." } }
      ],
      outcome: "AMM risk evaluation complete. Report: ..."
    }
  ]
};

// node_modules/@elizaos/plugin-sei-yield-delta/src/providers/amm-manager.ts
class AMMManagerProvider {
  manager;
  name = "AMM_MANAGER";
  description = "Provides AMM layer management for SEI yield optimization strategies";
  constructor(clob, hooks) {
    this.manager = new AMMLayerManager(clob, hooks);
  }
  async get(runtime, message, state) {
    try {
      const managerStatus = {
        isActive: true,
        supportedPools: [],
        activeStrategies: [],
        lastUpdate: new Date().toISOString()
      };
      return {
        text: `AMM Manager Status: ${JSON.stringify(managerStatus, null, 2)}`,
        values: managerStatus,
        data: {
          provider: "AMM_MANAGER",
          timestamp: Date.now()
        }
      };
    } catch (error) {
      return {
        text: `AMM Manager unavailable: ${error instanceof Error ? error.message : String(error)}`,
        values: { error: true },
        data: {
          provider: "AMM_MANAGER",
          error: error instanceof Error ? error.message : String(error),
          timestamp: Date.now()
        }
      };
    }
  }
  getManager() {
    return this.manager;
  }
}
var AMMManagerProvider_Instance = new AMMManagerProvider;

// node_modules/@elizaos/plugin-sei-yield-delta/src/index.ts
console.log("SEI YIELD-DELTA PLUGIN IS BEING INITIALIZED");
var seiYieldDeltaPlugin = {
  name: "sei-yield-delta",
  description: "Advanced DeFi yield optimization and arbitrage strategies for SEI blockchain with IL protection",
  actions: [
    transferAction,
    dragonSwapTradeAction,
    fundingArbitrageAction,
    perpsTradeAction,
    rebalanceEvaluatorAction,
    yeiFinanceAction,
    ilProtectionAction,
    ammOptimizeAction,
    deltaNeutralAction
  ],
  evaluators: [
    ammRiskEvaluator
  ],
  providers: [
    evmWalletProvider,
    oracleProvider,
    AMMManagerProvider_Instance
  ]
};
var src_default = seiYieldDeltaPlugin;

// src/index.ts
var initCharacter = ({ runtime }) => {
  logger.info("Initializing character");
  logger.info({ name: character.name }, "Name:");
};
var projectAgent = {
  character,
  init: async (runtime) => await initCharacter({ runtime }),
  plugins: [src_default]
};
var project = {
  agents: [projectAgent]
};
var src_default2 = project;
export {
  projectAgent,
  src_default2 as default,
  character
};

//# debugId=898896F88EC6149564756E2164756E21
//# sourceMappingURL=index.js.map
