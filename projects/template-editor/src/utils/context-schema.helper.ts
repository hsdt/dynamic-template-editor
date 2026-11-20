export type ContextValueType = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'null';

export interface ContextFieldSchema {
  path: string;
  group: string;
  valueType: ContextValueType;
  sample?: unknown;
}

export interface ContextTreeEntry {
  key: string;
  path: string;
  valueType: ContextValueType;
  sample?: unknown;
  summary?: string;
  children?: ContextTreeEntry[];
}

export interface ExtractContextSchemaOptions {
  prefix?: string;
  keyword?: string;
  maxDepth?: number;
  maxItems?: number;
}

export interface BuildContextTreeOptions {
  group?: string;
  keyword?: string;
  maxDepth?: number;
  maxArrayPreviewItems?: number;
}

function getValueType(value: unknown): ContextValueType {
  if (value === null || value === undefined) return 'null';
  if (Array.isArray(value)) return 'array';
  const t = typeof value;
  if (t === 'string' || t === 'number' || t === 'boolean') return t;
  return 'object';
}

function getCleanDataKeys(obj: Record<string, unknown>): string[] {
  return Object.keys(obj).filter(
    (k) => !k.startsWith('__') && k.toLowerCase() !== 'token' && typeof obj[k] !== 'function' && obj[k] !== undefined
  );
}

function formatArrayStructure(arr: unknown[]): string {
  if (arr.length === 0) return '[]';
  const first = arr[0];
  if (first && typeof first === 'object' && !Array.isArray(first)) {
    const record = first as Record<string, unknown>;
    const keys = getCleanDataKeys(record);
    const shape = keys.map((k) => `${k}: ${getValueType(record[k])}`).join(', ');
    return `[{ ${shape} }]`;
  }
  const previewVals = arr
    .slice(0, 3)
    .map((item) => (typeof item === 'string' ? `"${item.length > 24 ? `${item.slice(0, 24)}…` : item}"` : String(item)))
    .join(', ');
  return `[${previewVals}${arr.length > 3 ? ', …' : ''}]`;
}

function formatSample(value: unknown): unknown {
  if (value === null || value === undefined) return null;
  if (Array.isArray(value)) return formatArrayStructure(value);
  if (typeof value === 'string') {
    return value.length > 60 ? `${value.slice(0, 60)}…` : value;
  }
  return value;
}

/**
 * Làm phẳng cây dữ liệu context (hsBenhAn, phieuVaoVien, data...) thành danh sách path chuẩn để hiển thị và gợi ý binding.
 */
export function extractContextSchema(
  context: Record<string, any> | undefined,
  options: ExtractContextSchemaOptions = {}
): ContextFieldSchema[] {
  if (!context || typeof context !== 'object') {
    return [];
  }

  const maxDepth = Number.isFinite(Number(options.maxDepth)) && Number(options.maxDepth) > 0
    ? Number(options.maxDepth)
    : 6;
  const maxItems = Number.isFinite(Number(options.maxItems)) && Number(options.maxItems) > 0
    ? Number(options.maxItems)
    : 300;
  const prefixFilter = String(options.prefix || '').trim().toLowerCase();
  const keywordFilter = String(options.keyword || '').trim().toLowerCase();

  const allItems: ContextFieldSchema[] = [];
  const ancestors = new Set<object>();

  const pushIfMatched = (item: ContextFieldSchema) => {
    if (allItems.length >= maxItems) return;
    if (prefixFilter && !item.path.toLowerCase().startsWith(prefixFilter)) return;
    if (keywordFilter) {
      const haystack = `${item.path} ${item.sample ?? ''}`.toLowerCase();
      if (!haystack.includes(keywordFilter)) return;
    }
    allItems.push(item);
  };

  const walk = (value: unknown, currentPath: string, group: string, depth: number) => {
    if (allItems.length >= maxItems) return;
    if (typeof value === 'function' || value === undefined) return;

    const valueType = getValueType(value);
    if (valueType !== 'object' && valueType !== 'array') {
      pushIfMatched({ path: currentPath, group, valueType, sample: formatSample(value) });
      return;
    }

    if (value && typeof value === 'object') {
      if (ancestors.has(value)) return;
      ancestors.add(value);
    }

    try {
      if (valueType === 'array') {
        const arr = value as unknown[];
        pushIfMatched({ path: currentPath, group, valueType: 'array', sample: formatArrayStructure(arr) });
        return;
      }

      const obj = value as Record<string, unknown>;
      const keys = Object.keys(obj).filter((k) => !k.startsWith('__'));
      const dataKeys = keys.filter((k) => typeof obj[k] !== 'function' && obj[k] !== undefined);
      if (keys.length === 0) {
        pushIfMatched({ path: currentPath, group, valueType: 'object', sample: '{}' });
        return;
      }
      if (dataKeys.length === 0) {
        return;
      }
      if (depth >= maxDepth) {
        pushIfMatched({ path: currentPath, group, valueType: 'object', sample: `{${dataKeys.length} keys}` });
        return;
      }

      for (const key of dataKeys) {
        if (allItems.length >= maxItems) break;
        if (key.toLowerCase() === 'token') continue;
        walk(obj[key], `${currentPath}.${key}`, group, depth + 1);
      }
    } finally {
      if (value && typeof value === 'object') {
        ancestors.delete(value);
      }
    }
  };

  for (const rootKey of Object.keys(context)) {
    if (rootKey.startsWith('__')) continue;
    const val = context[rootKey];
    if (typeof val === 'function' || val === undefined) continue;
    walk(val, rootKey, rootKey, 0);
  }

  return allItems;
}

/**
 * Tóm tắt nhanh các nhóm biến cấp 1 trong context để đưa vào outline mà không làm phình kích thước payload.
 */
export function buildContextSummary(context: Record<string, any> | undefined): Record<string, { fieldCount: number; topKeys: string[] }> {
  if (!context || typeof context !== 'object') {
    return {};
  }

  const schema = extractContextSchema(context, { maxItems: 5000 });
  const summary: Record<string, { fieldCount: number; topKeys: string[] }> = {};

  for (const rootKey of Object.keys(context)) {
    if (rootKey.startsWith('__')) continue;
    const val = context[rootKey];
    if (typeof val === 'function' || val === undefined) continue;
    const count = schema.filter((item) => item.group === rootKey).length;
    if (count === 0) continue;
    const topKeys = val && typeof val === 'object' && !Array.isArray(val)
      ? Object.keys(val).filter((k) => !k.startsWith('__') && k.toLowerCase() !== 'token' && typeof val[k] !== 'function').slice(0, 12)
      : [];
    summary[rootKey] = { fieldCount: count, topKeys };
  }

  return summary;
}

/**
 * Xây dựng cây phân cấp JSON sạch (đã loại bỏ key nội bộ, function, token và vòng lặp)
 * để hiển thị cấu trúc lồng nhau của Object và Array trong drawer Dữ liệu Context.
 */
export function buildContextTree(
  context: Record<string, any> | undefined,
  options: BuildContextTreeOptions = {}
): ContextTreeEntry[] {
  if (!context || typeof context !== 'object') {
    return [];
  }

  const maxDepth = Number.isFinite(Number(options.maxDepth)) && Number(options.maxDepth) > 0
    ? Number(options.maxDepth)
    : 6;
  const maxArrayPreviewItems = Number.isFinite(Number(options.maxArrayPreviewItems)) && Number(options.maxArrayPreviewItems) > 0
    ? Number(options.maxArrayPreviewItems)
    : 5;
  const groupFilter = options.group && options.group !== 'ALL' ? options.group : '';
  const keyword = String(options.keyword || '').trim().toLowerCase();
  const ancestors = new Set<object>();

  const buildNode = (key: string, value: unknown, currentPath: string, depth: number): ContextTreeEntry | null => {
    if (typeof value === 'function' || value === undefined) return null;

    const valueType = getValueType(value);
    if (valueType !== 'object' && valueType !== 'array') {
      const sample = formatSample(value);
      if (keyword && !`${currentPath} ${sample ?? ''}`.toLowerCase().includes(keyword)) {
        return null;
      }
      return { key, path: currentPath, valueType, sample };
    }

    if (value && typeof value === 'object') {
      if (ancestors.has(value)) return null;
      ancestors.add(value);
    }

    try {
      if (valueType === 'array') {
        const arr = value as unknown[];
        const sample = formatSample(arr);
        const selfMatches = !keyword || `${currentPath} ${sample ?? ''}`.toLowerCase().includes(keyword);
        const children: ContextTreeEntry[] = [];

        if (depth < maxDepth && arr.length > 0) {
          const limit = Math.min(arr.length, maxArrayPreviewItems);
          for (let i = 0; i < limit; i++) {
            const child = buildNode(`[${i}]`, arr[i], `${currentPath}[${i}]`, depth + 1);
            if (child) children.push(child);
          }
        }

        if (keyword && !selfMatches && children.length === 0) {
          return null;
        }

        return {
          key,
          path: currentPath,
          valueType: 'array',
          sample,
          summary: `[${arr.length}]`,
          children,
        };
      }

      const obj = value as Record<string, unknown>;
      const allNonInternalKeys = Object.keys(obj).filter((k) => !k.startsWith('__'));
      const dataKeys = getCleanDataKeys(obj);

      if (allNonInternalKeys.length > 0 && dataKeys.length === 0) {
        return null;
      }

      const selfMatches = !keyword || currentPath.toLowerCase().includes(keyword);
      const children: ContextTreeEntry[] = [];

      if (depth < maxDepth) {
        for (const childKey of dataKeys) {
          const child = buildNode(childKey, obj[childKey], `${currentPath}.${childKey}`, depth + 1);
          if (child) children.push(child);
        }
      }

      if (keyword && !selfMatches && children.length === 0) {
        return null;
      }

      return {
        key,
        path: currentPath,
        valueType: 'object',
        summary: `{${dataKeys.length}}`,
        children,
      };
    } finally {
      if (value && typeof value === 'object') {
        ancestors.delete(value);
      }
    }
  };

  const roots: ContextTreeEntry[] = [];
  for (const rootKey of Object.keys(context)) {
    if (rootKey.startsWith('__')) continue;
    if (groupFilter && rootKey !== groupFilter) continue;
    const node = buildNode(rootKey, context[rootKey], rootKey, 0);
    if (node) roots.push(node);
  }
  return roots;
}
