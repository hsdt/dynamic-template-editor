import { nextTick, type Ref } from 'vue';

interface ScrollSnapshot {
  el: HTMLElement;
  top: number;
  left: number;
}

export interface CommitPaginationOptions {
  wrapperEl: HTMLElement | null;
  pageBuckets: HTMLElement[][];
  pageCount: Ref<number>;
  pageRefs: Ref<HTMLElement[]>;
  activeEl: HTMLElement | null;
  caretStart: number | null;
  caretEnd: number | null;
  onComplete: () => void;
}

/**
 * Di chuyển node sang container đích, ưu tiên `moveBefore` để giữ nguyên focus và trạng thái DOM.
 */
export function moveChildNode(
  parent: HTMLElement,
  node: HTMLElement,
  referenceNode: Node | null,
): void {
  const parentWithMoveBefore = parent as HTMLElement & {
    moveBefore?: (movedNode: Node, child: Node | null) => void;
  };
  if (typeof parentWithMoveBefore.moveBefore === 'function' && node.isConnected && parent.isConnected) {
    parentWithMoveBefore.moveBefore(node, referenceNode);
  } else {
    parent.insertBefore(node, referenceNode);
  }
}

/**
 * Tạo ResizeObserver chỉ kích hoạt phân trang khi chiều cao phần tử con thực sự thay đổi,
 * tránh lặp vô hạn khi `observeChildren()` gọi `disconnect()` + `observe()` lại.
 */
export function createPaginationResizeObserver(
  shouldTrigger: () => boolean,
  onResize: () => void,
): ResizeObserver | null {
  if (typeof ResizeObserver === 'undefined') {
    return null;
  }

  const lastHeights = new WeakMap<Element, number>();

  return new ResizeObserver((entries) => {
    if (!shouldTrigger()) return;

    let hasSizeChanged = false;
    for (const entry of entries) {
      const target = entry.target;
      const nextHeight = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
      const prevHeight = lastHeights.get(target);

      if (prevHeight === undefined) {
        lastHeights.set(target, nextHeight);
      } else if (Math.abs(nextHeight - prevHeight) > 0.5) {
        lastHeights.set(target, nextHeight);
        hasSizeChanged = true;
      }
    }

    if (hasSizeChanged) {
      onResize();
    }
  });
}

function captureScrollSnapshots(wrapperEl: HTMLElement | null): ScrollSnapshot[] {
  const snapshots: ScrollSnapshot[] = [];
  const seen = new Set<HTMLElement>();

  let current = wrapperEl?.parentElement ?? null;
  while (current) {
    const style = window.getComputedStyle(current);
    const hasScrollStyle =
      style.overflowY === 'auto' ||
      style.overflowY === 'scroll' ||
      style.overflowX === 'auto' ||
      style.overflowX === 'scroll';

    if (hasScrollStyle && !seen.has(current)) {
      seen.add(current);
      snapshots.push({ el: current, top: current.scrollTop, left: current.scrollLeft });
    }
    current = current.parentElement;
  }

  const docEl = document.scrollingElement as HTMLElement | null;
  if (docEl && !seen.has(docEl)) {
    snapshots.push({ el: docEl, top: docEl.scrollTop, left: docEl.scrollLeft });
  }

  return snapshots;
}

function syncPageBuckets(pageBuckets: HTMLElement[][], pageRefs: HTMLElement[]): boolean {
  let hasMovedAnyNode = false;

  pageBuckets.forEach((bucket, pIdx) => {
    const targetPage = pageRefs[pIdx];
    if (!targetPage) return;

    bucket.forEach((child, index) => {
      const currentChildAtIndex = targetPage.children[index];
      if (currentChildAtIndex !== child) {
        moveChildNode(targetPage, child, currentChildAtIndex || null);
        hasMovedAnyNode = true;
      }
    });
  });

  return hasMovedAnyNode;
}

/**
 * Cập nhật số trang và phân phối các block con vào từng sheet, đồng thời giữ ổn định
 * focus, vị trí con trỏ và vị trí cuộn của người dùng khi sinh thêm hoặc thu gọn trang.
 */
export function commitPaginationLayout({
  wrapperEl,
  pageBuckets,
  pageCount,
  pageRefs,
  activeEl,
  caretStart,
  caretEnd,
  onComplete,
}: CommitPaginationOptions): void {
  const newPageCount = Math.max(1, pageBuckets.length);
  const snapshots = captureScrollSnapshots(wrapperEl);

  const isTrackableActive = Boolean(
    activeEl && activeEl !== document.body && wrapperEl?.contains(activeEl),
  );
  const prevActiveRect = isTrackableActive && activeEl ? activeEl.getBoundingClientRect() : null;
  const hasPrevActiveRect = Boolean(
    prevActiveRect && (prevActiveRect.width > 0 || prevActiveRect.height > 0),
  );

  // Khi giảm số trang, di chuyển node về trang giữ lại trước khi unmount sheet dư để không mất focus
  let movedBeforeShrink = false;
  if (newPageCount < pageCount.value) {
    movedBeforeShrink = syncPageBuckets(pageBuckets, pageRefs.value);
  }

  pageCount.value = newPageCount;

  nextTick(() => {
    if (pageRefs.value.length > newPageCount) {
      pageRefs.value.length = newPageCount;
    }

    const movedInNextTick = syncPageBuckets(pageBuckets, pageRefs.value);
    const hasMovedAnyNode = movedBeforeShrink || movedInNextTick;

    if (hasMovedAnyNode && activeEl && document.contains(activeEl) && document.activeElement !== activeEl) {
      try {
        activeEl.focus({ preventScroll: true });
        if (
          caretStart !== null &&
          caretEnd !== null &&
          typeof (activeEl as HTMLInputElement).setSelectionRange === 'function'
        ) {
          (activeEl as HTMLInputElement).setSelectionRange(caretStart, caretEnd);
        }
      } catch (_) {}
    }

    snapshots.forEach(({ el, top, left }) => {
      if (el.scrollTop !== top) el.scrollTop = top;
      if (el.scrollLeft !== left) el.scrollLeft = left;
    });

    if (hasMovedAnyNode && hasPrevActiveRect && prevActiveRect && activeEl && document.contains(activeEl)) {
      const deltaY = activeEl.getBoundingClientRect().top - prevActiveRect.top;
      if (Math.abs(deltaY) > 1) {
        const primaryScroller = snapshots.find((s) => s.el.scrollHeight > s.el.clientHeight)?.el;
        if (primaryScroller) {
          primaryScroller.scrollTop += deltaY;
        }
      }
    }

    onComplete();
  });
}
