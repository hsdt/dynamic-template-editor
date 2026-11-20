import moment from 'moment';
import { VirtualHTMLParser } from './virtual-html-parser';
import type { VirtualNode } from './virtual-node';

const FORM_CONTROL_TAGS = new Set([
  'Textarea',
  'DatePicker',
  'InputOTP',
  'Select',
  'Checkbox',
  'Paint',
  'Signature',
  'IcdGroupItem',
  'IcdList',
  'input',
  'textarea',
  'select',
]);

const DANGEROUS_SCRIPT_PATTERNS = [
  /\bFunction\s*\(/,
  /\beval\s*\(/,
  /\bconstructor\s*\.\s*constructor\b/,
  /\bimport\s*\(/,
  /__proto__/,
  /document\s*\.\s*cookie/,
];

/**
 * Trích xuất scope biến tĩnh đồng bộ từ script của template để phục vụ dựng outline cho AI.
 */
export function evaluateOutlineScriptScope(
  scriptStr?: string,
  contextObj?: Record<string, unknown>
): Record<string, unknown> {
  if (!scriptStr || !scriptStr.trim()) {
    return {};
  }

  let body = scriptStr.trim();
  if (body.startsWith('export default')) {
    body = body.replace(/^export\s+default\s+/, '').trim();
    if (body.startsWith('defineComponent(') && body.endsWith(');')) {
      body = body.slice('defineComponent('.length, -2).trim();
    } else if (body.startsWith('defineComponent(') && body.endsWith(')')) {
      body = body.slice('defineComponent('.length, -1).trim();
    }
    const setupMatch = body.match(/setup\s*\([^)]*\)\s*\{([\s\S]*)\}/);
    body = setupMatch ? setupMatch[1].trim() : `return (${body.replace(/;\s*$/, '')})`;
  }

  if (!body.includes('return')) {
    body = `return (${body})`;
  }

  if (DANGEROUS_SCRIPT_PATTERNS.some((pattern) => pattern.test(body))) {
    return {};
  }

  try {
    const $context = contextObj && typeof contextObj === 'object' ? contextObj : { data: {} };
    const identity = <T>(val: T): T => val;
    const computed = (fnOrObj: unknown) => {
      if (typeof fnOrObj === 'function') return fnOrObj();
      if (fnOrObj && typeof (fnOrObj as { get?: () => unknown }).get === 'function') {
        return (fnOrObj as { get: () => unknown }).get();
      }
      return undefined;
    };
    const noopUnsub = () => () => {};
    const resolvedPromise = () => Promise.resolve();
    const toRef = (obj: Record<string, unknown> | undefined, key: string) => obj?.[key];
    const falseFn = () => false;

    const fn = new Function(
      '$context',
      'moment',
      'reactive',
      'ref',
      'shallowRef',
      'shallowReactive',
      'computed',
      'watch',
      'watchEffect',
      'nextTick',
      'toRef',
      'toRefs',
      'unref',
      'isRef',
      'isReactive',
      `"use strict";\n${body}`
    );

    const rawScope = fn(
      $context,
      ($context as Record<string, unknown>)['moment'] || moment,
      identity,
      identity,
      identity,
      identity,
      computed,
      noopUnsub,
      noopUnsub,
      resolvedPromise,
      toRef,
      identity,
      identity,
      falseFn,
      falseFn
    );

    if (rawScope && typeof rawScope === 'object') {
      if (typeof rawScope.data === 'function') {
        return rawScope.data.call(rawScope) || {};
      }
      return rawScope as Record<string, unknown>;
    }
  } catch {
    return {};
  }

  return {};
}

function resolveSelectOptions(itemsAttr: string, scriptScope: Record<string, unknown>): unknown[] | undefined {
  const trimmed = String(itemsAttr || '').trim();
  if (!trimmed) return undefined;

  if (Object.prototype.hasOwnProperty.call(scriptScope, trimmed)) {
    const val = scriptScope[trimmed];
    if (Array.isArray(val)) {
      return val.slice(0, 50);
    }
  }

  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = new Function(`"use strict"; return (${trimmed});`)();
      if (Array.isArray(parsed)) {
        return parsed.slice(0, 50);
      }
    } catch {
      return undefined;
    }
  }

  return undefined;
}

function getOutlineFieldValue(context: Record<string, any> | undefined, vModel: string): unknown {
  if (!vModel || !context || typeof context !== 'object') return undefined;
  const segments = vModel
    .replace(/\[['"]?([^'"\]]+)['"]?\]/g, '.$1')
    .split('.')
    .filter(Boolean);

  let value: any = context;
  for (const segment of segments) {
    if (
      value === null ||
      value === undefined ||
      typeof value !== 'object' ||
      !Object.prototype.hasOwnProperty.call(value, segment)
    ) {
      return undefined;
    }
    value = value[segment];
  }

  return typeof value === 'string' && value.length > 300 ? `${value.slice(0, 300)}…` : value;
}

function subtreeHasInteractiveNode(node: VirtualNode): boolean {
  if (!node || node.tagName === '#text') return false;
  if (node.attributes?.['v-model'] || FORM_CONTROL_TAGS.has(node.tagName)) {
    return true;
  }
  return Array.isArray(node.childNodes) && node.childNodes.some((child) => subtreeHasInteractiveNode(child));
}

function enrichControlOutline(
  item: Record<string, unknown>,
  node: VirtualNode,
  scriptScope: Record<string, unknown>
): void {
  const attrs = node.attributes || {};

  if (node.tagName === 'Select' || node.tagName === 'select') {
    const itemsAttr = attrs[':items'] ?? attrs['items'];
    if (itemsAttr !== undefined) {
      item['itemsExpr'] = String(itemsAttr);
      const resolvedOptions = resolveSelectOptions(String(itemsAttr), scriptScope);
      if (resolvedOptions) item['options'] = resolvedOptions;
    }
    const bindLabel = attrs['bind-label'] ?? attrs['bindLabel'];
    if (bindLabel) item['bindLabel'] = bindLabel;
    const bindValue = attrs['bind-value'] ?? attrs['bindValue'];
    if (bindValue) item['bindValue'] = bindValue;
    if (attrs['multiple'] !== undefined || attrs[':multiple'] === 'true' || attrs[':multiple'] === true) {
      item['multiple'] = true;
    }
    return;
  }

  if (node.tagName === 'Checkbox') {
    const afterText = attrs['afterText'] ?? attrs['after-text'];
    if (afterText) item['afterText'] = afterText;
    const beforeText = attrs['beforeText'] ?? attrs['before-text'];
    if (beforeText) item['beforeText'] = beforeText;
    if (attrs['size']) item['size'] = attrs['size'];
    return;
  }

  if (node.tagName === 'DatePicker') {
    if (attrs['format']) item['format'] = attrs['format'];
    return;
  }

  if (node.tagName === 'InputOTP') {
    const maskLength =
      attrs[':mask-length'] ?? attrs[':maskLength'] ?? attrs['mask-length'] ?? attrs['maskLength'];
    if (maskLength !== undefined) item['maskLength'] = maskLength;
    return;
  }

  if (node.tagName === 'Signature') {
    if (attrs['code']) item['code'] = attrs['code'];
    if (attrs['label']) item['label'] = attrs['label'];
    return;
  }

  if (node.tagName === 'Paint') {
    if (attrs['src']) item['src'] = attrs['src'];
    if (attrs['color']) item['color'] = attrs['color'];
    const lineWidth = attrs['line-width'] ?? attrs['lineWidth'] ?? attrs[':line-width'];
    if (lineWidth !== undefined) item['lineWidth'] = lineWidth;
    return;
  }

  if (node.tagName === 'IcdGroupItem' || node.tagName === 'IcdList') {
    if (attrs['type']) item['type'] = attrs['type'];
    if (attrs['v-model:ten']) item['vModelTen'] = attrs['v-model:ten'];
    if (attrs['v-model:ma']) item['vModelMa'] = attrs['v-model:ma'];
    const pathItems = attrs['path-items'] ?? attrs['pathItems'];
    if (pathItems) item['pathItems'] = pathItems;
    return;
  }

  if (node.tagName === 'input' && attrs['type']) {
    item['type'] = attrs['type'];
  }
}

export function buildOutlineNode(
  node: VirtualNode,
  context: Record<string, any> | undefined,
  scriptScope: Record<string, unknown> = {},
  depth = 0,
  maxDepth = 8
): Record<string, unknown> | null {
  if (!node || node.tagName === '#text') return null;

  const attrs = node.attributes || {};
  const item: Record<string, unknown> = {
    tag: node.tagName,
    cid: attrs['c-id'] || '',
  };

  if (attrs['label']) item['label'] = attrs['label'];
  if (attrs['placeholder']) item['placeholder'] = attrs['placeholder'];

  if (attrs['v-model']) {
    const vModel = String(attrs['v-model']);
    item['vModel'] = vModel;
    const currentValue = getOutlineFieldValue(context, vModel);
    item['currentValue'] = currentValue ?? null;
    item['isEmpty'] =
      currentValue === undefined ||
      currentValue === null ||
      currentValue === '' ||
      (Array.isArray(currentValue) && currentValue.length === 0);
  }

  if (attrs['class']) item['class'] = attrs['class'];
  if (attrs[':line']) item['line'] = true;
  if (attrs['landscape'] || attrs[':landscape'] === 'true' || attrs[':landscape'] === true) {
    item['landscape'] = true;
  }

  enrichControlOutline(item, node, scriptScope);

  const directText = (node.childNodes || [])
    .filter((c) => c?.tagName === '#text')
    .map((c) => String(c.textContent || '').replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join(' ')
    .trim();
  if (directText) {
    item['text'] = directText.length > 140 ? `${directText.slice(0, 140)}…` : directText;
  }

  const nonTextChildren = (node.childNodes || []).filter((c) => c && c.tagName !== '#text');
  if (nonTextChildren.length > 0) {
    const shouldTraverse =
      depth < maxDepth ||
      (depth < 14 && nonTextChildren.some((c) => subtreeHasInteractiveNode(c)));

    if (shouldTraverse) {
      const children = nonTextChildren
        .map((c) => buildOutlineNode(c, context, scriptScope, depth + 1, maxDepth))
        .filter((c): c is Record<string, unknown> => c !== null);
      if (children.length > 0) item['children'] = children;
    } else {
      item['childCount'] = nonTextChildren.length;
    }
  }

  return item;
}

/**
 * Xây dựng cây outline rút gọn kèm danh sách node và c-id để AI đọc hiểu cấu trúc template.
 */
export function buildTemplateOutline(
  templateHtml: string,
  context: Record<string, any> | undefined,
  scriptStr = '',
  maxDepth = 8,
  liveScriptScope?: Record<string, unknown>
): { root: Record<string, unknown> | null; normalizedTemplate: string } {
  const root = VirtualHTMLParser.parseToTree(templateHtml || '');
  const normalizedTemplate = root.innerHTML;
  const scriptScope =
    liveScriptScope && Object.keys(liveScriptScope).length > 0
      ? liveScriptScope
      : evaluateOutlineScriptScope(scriptStr, context);
  const parsedMaxDepth = Number(maxDepth);
  const effectiveMaxDepth =
    Number.isFinite(parsedMaxDepth) && parsedMaxDepth > 0 ? parsedMaxDepth : 8;

  return {
    root: buildOutlineNode(root, context, scriptScope, 0, effectiveMaxDepth),
    normalizedTemplate,
  };
}
