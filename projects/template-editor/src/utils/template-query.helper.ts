import { VirtualHTMLParser } from './virtual-html-parser';

export type TemplateQueryInclude = 'attributes' | 'innerHTML' | 'outerHTML';

export interface TemplateElementQuery {
  tag: string;
  attributes?: Record<string, unknown>;
  include?: TemplateQueryInclude[];
  limit?: number;
}

export interface TemplateElementQueryItem {
  cid: string;
  tagName: string;
  attributes?: Record<string, unknown>;
  innerHTML?: string;
  outerHTML?: string;
}

export interface TemplateElementQueryResult {
  normalizedTemplate: string;
  count: number;
  returnedCount: number;
  truncated: boolean;
  items: TemplateElementQueryItem[];
}

export interface TemplateElementInspectResult {
  normalizedTemplate: string;
  cid: string;
  tagName: string;
  attributes: Record<string, unknown>;
  innerHTML: string;
  outerHTML: string;
}

/**
 * Truy vấn các phần tử theo tag và thuộc tính lọc, trả về danh sách phẳng kèm c-id.
 */
export function queryTemplateElements(
  templateHtml: string,
  query: TemplateElementQuery
): TemplateElementQueryResult {
  const tag = String(query?.tag || '').trim();
  if (!tag) {
    throw new Error('Thiếu tag/component cần tìm');
  }

  const filters =
    query.attributes && typeof query.attributes === 'object' && !Array.isArray(query.attributes)
      ? query.attributes
      : {};
  const requestedIncludes =
    Array.isArray(query.include) && query.include.length > 0
      ? query.include
      : ['attributes' as TemplateQueryInclude];
  const include = new Set<TemplateQueryInclude>(requestedIncludes);
  const requestedLimit = Number(query.limit);
  const limit =
    Number.isFinite(requestedLimit) && requestedLimit > 0
      ? Math.min(Math.trunc(requestedLimit), 100)
      : 100;

  const root = VirtualHTMLParser.parseToTree(templateHtml || '');
  const matched = root.querySelectorAll(tag).filter((node) =>
    Object.entries(filters).every(([name, expected]) => {
      if (!node.hasAttribute(name)) return false;
      return String(node.getAttribute(name)) === String(expected);
    })
  );

  const items = matched.slice(0, limit).map((node) => {
    const item: TemplateElementQueryItem = {
      cid: String(node.getAttribute('c-id') || ''),
      tagName: node.tagName,
    };
    if (include.has('attributes')) item.attributes = { ...node.attributes };
    if (include.has('innerHTML')) item.innerHTML = node.innerHTML;
    if (include.has('outerHTML')) item.outerHTML = node.outerHTML;
    return item;
  });

  return {
    normalizedTemplate: root.innerHTML,
    count: matched.length,
    returnedCount: items.length,
    truncated: matched.length > items.length,
    items,
  };
}

/**
 * Trích xuất thông tin chi tiết một phần tử theo c-id từ cây AST mẫu biểu.
 */
export function inspectTemplateElement(
  templateHtml: string,
  cid: string
): TemplateElementInspectResult {
  const normalizedCid = String(cid || '').trim();
  if (!normalizedCid) {
    throw new Error('Thiếu c-id của phần tử cần kiểm tra');
  }

  const root = VirtualHTMLParser.parseToTree(templateHtml || '');
  const target = root.querySelector(`[c-id="${normalizedCid}"]`);
  if (!target) {
    throw new Error(`Không tìm thấy phần tử c-id="${normalizedCid}"`);
  }

  return {
    normalizedTemplate: root.innerHTML,
    cid: normalizedCid,
    tagName: target.tagName,
    attributes: { ...target.attributes },
    innerHTML: target.innerHTML,
    outerHTML: target.outerHTML,
  };
}
