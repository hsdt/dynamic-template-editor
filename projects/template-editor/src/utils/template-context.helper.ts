import { VirtualHTMLParser } from './virtual-html-parser';
import type { VirtualNode } from './virtual-node';

interface PathTrieNode {
  keepAll?: boolean;
  children: Record<string, PathTrieNode>;
}

const DATA_PATH_REGEX = /\bdata(?:\.[A-Za-z_$][\w$]*|\[['"][^'"\]]+['"]\]|\[\d+\])+/g;

function extractPathsFromExpression(expr: string, out: Set<string>) {
  if (!expr) return;
  let match: RegExpExecArray | null;
  DATA_PATH_REGEX.lastIndex = 0;

  while ((match = DATA_PATH_REGEX.exec(expr)) !== null) {
    const raw = match[0]
      .replace(/\[['"]([^'"\]]+)['"]\]/g, '.$1')
      .replace(/\[\d+\]/g, '');
    const stripped = raw.slice('data.'.length);
    if (stripped) {
      out.add(stripped);
    }
  }
}

/**
 * Extracts unique property paths under `data.` referenced in a Vue template string.
 */
export function extractTemplateDataPaths(templateHtml: string): string[] {
  if (!templateHtml || !templateHtml.trim()) {
    return [];
  }

  const root = VirtualHTMLParser.parseToTree(templateHtml);
  const paths = new Set<string>();

  const walk = (node: VirtualNode) => {
    if (node.tagName === '#text') {
      const mustacheMatches = node.textContent?.matchAll(/\{\{([\s\S]*?)\}\}/g);
      if (mustacheMatches) {
        for (const m of mustacheMatches) {
          extractPathsFromExpression(m[1], paths);
        }
      }
      return;
    }

    for (const [key, value] of Object.entries(node.attributes || {})) {
      if (typeof value !== 'string') continue;
      if (
        key === 'v-model' ||
        key.startsWith('v-model:') ||
        key.startsWith('v-model.') ||
        key.startsWith(':') ||
        key.startsWith('v-if') ||
        key.startsWith('v-else-if') ||
        key.startsWith('v-show') ||
        key.startsWith('v-for')
      ) {
        extractPathsFromExpression(value, paths);
      }
    }

    for (const child of node.childNodes || []) {
      walk(child);
    }
  };

  walk(root);
  return Array.from(paths);
}

function buildPathTrie(paths: string[]): PathTrieNode {
  const root: PathTrieNode = { children: {} };
  for (const path of paths) {
    const parts = path.split('.').filter(Boolean);
    let cursor = root;
    for (let i = 0; i < parts.length; i++) {
      const seg = parts[i];
      if (!cursor.children[seg]) {
        cursor.children[seg] = { children: {} };
      }
      cursor = cursor.children[seg];
      if (i === parts.length - 1) {
        cursor.keepAll = true;
      }
    }
  }
  return root;
}

function pickByTrie(source: any, trie: PathTrieNode): any {
  if (trie.keepAll || source === null || typeof source !== 'object' || Array.isArray(source)) {
    return source;
  }

  const result: Record<string, any> = {};
  for (const [key, childTrie] of Object.entries(trie.children)) {
    if (key in source) {
      result[key] = pickByTrie(source[key], childTrie);
    }
  }
  return result;
}

/**
 * Filters `data` to keep only fields referenced in `templateHtml`.
 * If no explicit `data.*` references exist in the template, returns `data` unchanged.
 */
export function filterDataByTemplate<T extends Record<string, any>>(data: T, templateHtml: string): T {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return data;
  }

  const paths = extractTemplateDataPaths(templateHtml);
  if (paths.length === 0) {
    return data;
  }

  const trie = buildPathTrie(paths);
  return pickByTrie(data, trie) as T;
}

/**
 * Deeply clones a sample `Context.data` schema object while clearing leaf values for a blank form.
 */
export function blankFormData<T>(value: T): T {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return [] as unknown as T;
  if (typeof value === 'string') return '' as unknown as T;
  if (typeof value === 'boolean') return false as unknown as T;
  if (typeof value === 'number') return null as unknown as T;

  if (typeof value === 'object') {
    const out: Record<string, any> = {};
    for (const [key, val] of Object.entries(value as Record<string, any>)) {
      out[key] = blankFormData(val);
    }
    return out as T;
  }

  return value;
}
