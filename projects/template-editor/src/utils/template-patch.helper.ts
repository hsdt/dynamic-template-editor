import { VirtualHTMLParser } from './virtual-html-parser';
import type { VirtualNode } from './virtual-node';

export type TemplateInsertPosition = 'before' | 'after' | 'append' | 'prepend';

export interface TemplateElementPatch {
  cid: string;
  attributes?: Record<string, unknown>;
  removeAttributes?: string[];
  textContent?: string;
  innerHtml?: string;
}

export interface TemplateInsertPayload {
  targetCid?: string;
  position?: TemplateInsertPosition;
  tag?: string;
  attributes?: Record<string, unknown>;
  textContent?: string;
  rawInnerHtml?: string;
  html?: string;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function escapeHtmlAttribute(value: unknown): string {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function placeNodeRelativeToTarget(
  root: VirtualNode,
  node: VirtualNode,
  target: VirtualNode | null,
  position: TemplateInsertPosition = 'append'
): void {
  if (!target) {
    root.appendChild(node);
    return;
  }

  if (position === 'before' && target.parentNode) {
    target.parentNode.insertBefore(node, target);
    return;
  }
  if (position === 'after' && target.parentNode) {
    target.parentNode.insertAfter(node, target);
    return;
  }
  if (position === 'prepend') {
    if (target.childNodes.length > 0) {
      target.insertBefore(node, target.childNodes[0]);
    } else {
      target.appendChild(node);
    }
    return;
  }

  target.appendChild(node);
}

/**
 * Kiểm tra tính hợp lệ của một đối tượng patch phần tử theo c-id.
 */
export function validateTemplateElementPatch(value: unknown): TemplateElementPatch {
  if (!isPlainObject(value)) {
    throw new Error('Patch phải là một object hợp lệ');
  }

  const cid = typeof value['cid'] === 'string' ? value['cid'].trim() : '';
  if (!cid) {
    throw new Error('Mỗi patch phải có c-id hợp lệ');
  }

  const attributes = value['attributes'];
  if (attributes !== undefined && !isPlainObject(attributes)) {
    throw new Error(`Patch c-id="${cid}": attributes phải là object`);
  }

  const removeAttributes = value['removeAttributes'];
  if (
    removeAttributes !== undefined &&
    (!Array.isArray(removeAttributes) || removeAttributes.some((name) => typeof name !== 'string' || !name.trim()))
  ) {
    throw new Error(`Patch c-id="${cid}": removeAttributes phải là danh sách tên thuộc tính`);
  }

  if (value['textContent'] !== undefined && typeof value['textContent'] !== 'string') {
    throw new Error(`Patch c-id="${cid}": textContent phải là chuỗi`);
  }
  if (value['innerHtml'] !== undefined && typeof value['innerHtml'] !== 'string') {
    throw new Error(`Patch c-id="${cid}": innerHtml phải là chuỗi`);
  }
  if (value['textContent'] !== undefined && value['innerHtml'] !== undefined) {
    throw new Error(`Patch c-id="${cid}": chỉ được dùng textContent hoặc innerHtml, không dùng đồng thời`);
  }

  const hasAttributes = isPlainObject(attributes) && Object.keys(attributes).length > 0;
  const hasRemovedAttributes = Array.isArray(removeAttributes) && removeAttributes.length > 0;
  const hasTextContent = typeof value['textContent'] === 'string';
  const hasInnerHtml = typeof value['innerHtml'] === 'string';
  if (!hasAttributes && !hasRemovedAttributes && !hasTextContent && !hasInnerHtml) {
    throw new Error(`Patch c-id="${cid}" không chứa thay đổi nào`);
  }

  return {
    cid,
    ...(hasAttributes ? { attributes } : {}),
    ...(hasRemovedAttributes ? { removeAttributes: removeAttributes as string[] } : {}),
    ...(hasTextContent ? { textContent: value['textContent'] as string } : {}),
    ...(hasInnerHtml ? { innerHtml: value['innerHtml'] as string } : {}),
  };
}

/**
 * Áp dụng thay đổi thuộc tính hoặc nội dung lên một VirtualNode đích.
 */
export function applyTemplateElementPatch(target: VirtualNode, patch: TemplateElementPatch): boolean {
  const before = target.outerHTML;

  if (patch.attributes) {
    for (const [name, value] of Object.entries(patch.attributes)) {
      if (value === null || value === undefined) {
        target.removeAttribute(name);
      } else {
        target.setAttribute(name, String(value));
      }
    }
  }
  if (patch.removeAttributes) {
    for (const name of patch.removeAttributes) {
      target.removeAttribute(name);
    }
  }
  if (patch.textContent !== undefined) target.textContent = patch.textContent;
  if (patch.innerHtml !== undefined) target.innerHTML = patch.innerHtml;

  return target.outerHTML !== before;
}

/**
 * Áp dụng một patch vào chuỗi HTML mẫu biểu và trả về HTML đã cập nhật.
 */
export function patchTemplateHtml(
  templateHtml: string,
  rawPatch: unknown
): { changed: boolean; cid: string; template: string } {
  const patch = validateTemplateElementPatch(rawPatch);
  const root = VirtualHTMLParser.parseToTree(templateHtml || '');
  const target = root.querySelector(`[c-id="${patch.cid}"]`);
  if (!target) {
    throw new Error(`Không tìm thấy phần tử c-id="${patch.cid}"`);
  }

  const changed = applyTemplateElementPatch(target, patch);
  return {
    changed,
    cid: patch.cid,
    template: changed ? root.innerHTML : templateHtml,
  };
}

/**
 * Áp dụng hàng loạt tối đa 100 patch lên cây AST mẫu biểu theo nguyên tắc toàn bộ cùng thành công.
 */
export function batchPatchTemplateHtml(
  templateHtml: string,
  rawPatches: unknown[]
): {
  changed: boolean;
  updatedCount: number;
  results: Array<{ cid: string; success: true; changed: boolean }>;
  template: string;
} {
  if (!Array.isArray(rawPatches) || rawPatches.length === 0) {
    throw new Error('Danh sách patches phải có ít nhất một phần tử');
  }
  if (rawPatches.length > 100) {
    throw new Error('Mỗi lần chỉ được chỉnh sửa tối đa 100 phần tử');
  }

  const patches = rawPatches.map((patch) => validateTemplateElementPatch(patch));
  const root = VirtualHTMLParser.parseToTree(templateHtml || '');
  const results: Array<{ cid: string; success: true; changed: boolean }> = [];

  for (const patch of patches) {
    const target = root.querySelector(`[c-id="${patch.cid}"]`);
    if (!target) {
      throw new Error(`Không tìm thấy phần tử c-id="${patch.cid}"`);
    }
    const changed = applyTemplateElementPatch(target, patch);
    results.push({ cid: patch.cid, success: true, changed });
  }

  const updatedCount = results.filter((r) => r.changed).length;
  return {
    changed: updatedCount > 0,
    updatedCount,
    results,
    template: updatedCount > 0 ? root.innerHTML : templateHtml,
  };
}

/**
 * Chèn phần tử mới vào mẫu theo targetCid và position.
 */
export function insertTemplateHtml(
  templateHtml: string,
  payload: TemplateInsertPayload
): { cid: string; template: string } {
  const root = VirtualHTMLParser.parseToTree(templateHtml || '');
  let newElem: VirtualNode | null = null;

  if (payload.html) {
    newElem = VirtualHTMLParser.parseToElement(payload.html);
  } else if (payload.tag) {
    const attrs = payload.attributes || {};
    const attrStr = Object.entries(attrs)
      .map(([k, v]) => ` ${k}="${escapeHtmlAttribute(v)}"`)
      .join('');
    const inner = payload.rawInnerHtml || payload.textContent || '';
    newElem = VirtualHTMLParser.parseToElement(`<${payload.tag}${attrStr}>${inner}</${payload.tag}>`);
  }

  if (!newElem) {
    throw new Error('HTML hoặc thẻ component cần chèn không hợp lệ');
  }

  if (!newElem.getAttribute('c-id')) {
    newElem.setAttribute('c-id', `cid_${Math.random().toString(36).substring(2, 8)}`);
  }
  const newCid = String(newElem.getAttribute('c-id'));
  const target = payload.targetCid ? root.querySelector(`[c-id="${payload.targetCid}"]`) : null;
  placeNodeRelativeToTarget(root, newElem, target, payload.position || 'append');

  return {
    cid: newCid,
    template: root.innerHTML,
  };
}

/**
 * Di chuyển một phần tử đến vị trí tương quan so với targetCid.
 */
export function moveTemplateHtml(
  templateHtml: string,
  cid: string,
  targetCid: string,
  position: TemplateInsertPosition = 'append'
): { cid: string; template: string } {
  const root = VirtualHTMLParser.parseToTree(templateHtml || '');
  const node = root.querySelector(`[c-id="${cid}"]`);
  const target = root.querySelector(`[c-id="${targetCid}"]`);
  if (!node) {
    throw new Error(`Không tìm thấy phần tử c-id="${cid}"`);
  }
  if (!target) {
    throw new Error(`Không tìm thấy target c-id="${targetCid}"`);
  }

  node.remove();
  placeNodeRelativeToTarget(root, node, target, position);

  return {
    cid,
    template: root.innerHTML,
  };
}

/**
 * Xóa bỏ phần tử theo c-id khỏi mẫu HTML.
 */
export function removeTemplateHtml(
  templateHtml: string,
  cid: string
): { cid: string; template: string } {
  const root = VirtualHTMLParser.parseToTree(templateHtml || '');
  const target = root.querySelector(`[c-id="${cid}"]`);
  if (!target) {
    throw new Error(`Không tìm thấy phần tử c-id="${cid}"`);
  }

  target.remove();
  return {
    cid,
    template: root.innerHTML,
  };
}
