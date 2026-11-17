import * as Vue from 'vue';

export interface EvalScriptResult {
  scope: Record<string, any>;
  error: string | null;
}

// Constructor chuẩn cho hàm Async trong JS Engine
const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;

/**
 * Thực thi chuỗi mã JavaScript trong Async Sandbox khép kín với đầy đủ Vue 3 Composition APIs
 * Hỗ trợ TOP-LEVEL AWAIT trực tiếp trong Script!
 * @param scriptStr Chuỗi mã JavaScript người dùng nhập
 * @param contextObj Đối tượng context chứa data và metadata từ Host truyền vào
 */
export async function evalScriptScope(
  scriptStr: string,
  contextObj?: Record<string, any>
): Promise<EvalScriptResult> {
  if (!scriptStr || !scriptStr.trim()) {
    return { scope: {}, error: null };
  }

  try {
    let body = scriptStr.trim();
    let usesOptionsApi = false;

    // Tự động chuẩn hóa nếu script chứa cú pháp 'export default defineComponent' hoặc 'export default'
    if (body.startsWith('export default')) {
      body = body.replace(/^export\s+default\s+/, '').trim();
      if (body.startsWith('defineComponent(') && body.endsWith(');')) {
        body = body.slice('defineComponent('.length, -2).trim();
      } else if (body.startsWith('defineComponent(') && body.endsWith(')')) {
        body = body.slice('defineComponent('.length, -1).trim();
      }
      const setupMatch = body.match(/setup\s*\([^)]*\)\s*\{([\s\S]*)\}/);
      if (setupMatch) {
        body = setupMatch[1].trim();
      } else {
        usesOptionsApi = true;
        body = 'return (' + body.replace(/;\s*$/, '') + ')';
      }
    } else if (/^\{[\s\S]*\};?$/.test(body)) {
      const candidateExpr = body.replace(/;\s*$/, '');
      try {
        // Compile-test to distinguish an object literal ({ data() ..., methods: ... }) from a statement block
        new AsyncFunction('return (' + candidateExpr + ')');
        body = 'return (' + candidateExpr + ')';
        usesOptionsApi = true;
      } catch {
        // Treat as regular statement block when not a valid object expression
      }
    }

    // 1. Kiểm tra an toàn trước khi thực thi: Chặn các mẫu nguy hiểm
    const dangerousPatterns = [
      /\bFunction\s*\(/,
      /\beval\s*\(/,
      /\bconstructor\s*\.\s*constructor\b/,
      /\bimport\s*\(/,
      /__proto__/,
      /document\s*\.\s*cookie/
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(body)) {
        return {
          scope: {},
          error: 'Lỗi bảo mật Script: Phát hiện cú pháp không được phép trong mẫu biểu'
        };
      }
    }

    const {
      reactive,
      ref,
      computed,
      watch,
      watchEffect,
      nextTick,
      h,
      shallowRef,
      shallowReactive,
      toRef,
      toRefs,
      unref,
      isRef,
      isReactive
    } = Vue;

    const $context = contextObj || {};

    // Danh sách biến toàn cục nhạy cảm cần cách ly (shadowing) để bảo vệ trình duyệt và token
    const sandboxBlocklist = [
      'window',
      'document',
      'globalThis',
      'localStorage',
      'sessionStorage',
      'indexedDB',
      'fetch',
      'XMLHttpRequest',
      'WebSocket',
      'location',
      'navigator',
      'top',
      'parent'
    ];

    // Sử dụng AsyncFunction để hỗ trợ Top-Level Await trực tiếp trong script
    const fn = new AsyncFunction(
      'Vue',
      'reactive',
      'ref',
      'computed',
      'watch',
      'watchEffect',
      'nextTick',
      'h',
      'shallowRef',
      'shallowReactive',
      'toRef',
      'toRefs',
      'unref',
      'isRef',
      'isReactive',
      '$context',
      ...sandboxBlocklist,
      body
    );

    const result = await fn(
      Vue,
      reactive,
      ref,
      computed,
      watch,
      watchEffect,
      nextTick,
      h,
      shallowRef,
      shallowReactive,
      toRef,
      toRefs,
      unref,
      isRef,
      isReactive,
      $context,
      ...sandboxBlocklist.map(() => undefined)
    );

    if (usesOptionsApi && result && typeof result === 'object') {
      const options = result as Record<string, any>;
      const hasOptionsSections =
        typeof options['data'] === 'function' ||
        (options['methods'] && typeof options['methods'] === 'object') ||
        (options['computed'] && typeof options['computed'] === 'object');

      if (!hasOptionsSections) {
        return { scope: options, error: null };
      }

      const dataState = typeof options['data'] === 'function'
        ? options['data'].call($context) || {}
        : {};
      const optionScope: Record<string, any> = Object.assign(Object.create($context), dataState);

      for (const [key, val] of Object.entries(options)) {
        if (key !== 'data' && key !== 'methods' && key !== 'computed') {
          optionScope[key] = typeof val === 'function' ? val.bind(optionScope) : val;
        }
      }

      if (options['methods'] && typeof options['methods'] === 'object') {
        for (const [name, method] of Object.entries(options['methods'])) {
          if (typeof method === 'function') {
            optionScope[name] = method.bind(optionScope);
          }
        }
      }

      if (options['computed'] && typeof options['computed'] === 'object') {
        for (const [name, definition] of Object.entries(options['computed'])) {
          const getter = typeof definition === 'function'
            ? definition
            : (definition as any)?.get;
          if (typeof getter === 'function') {
            Object.defineProperty(optionScope, name, {
              enumerable: true,
              configurable: true,
              get: () => getter.call(optionScope)
            });
          }
        }
      }

      return { scope: optionScope, error: null };
    }

    return { scope: result ?? {}, error: null };
  } catch (err: any) {
    return {
      scope: {},
      error: `Lỗi Script: ${err.message || String(err)}`
    };
  }
}
