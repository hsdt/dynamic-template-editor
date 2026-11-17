export interface PageFormatConfig {
  sizeRule: string;
  widthMm: number;
  heightMm: number;
  isLandscape: boolean;
  type: 'a4' | 'a5' | 'custom';
  layoutMode: 'paged' | 'adaptive';
}

/**
 * Phát hiện loại khổ giấy và định hướng in dựa vào DOM của phần tử được in
 */
export function detectPageFormat(element: Element): PageFormatConfig {
  const pageA5El = element.matches?.('.page-a5-sheet, .page-a5-wrapper')
    ? element
    : element.querySelector('.page-a5-sheet, .page-a5-wrapper');

  const pageA4El = element.matches?.('.page-a4-sheet, .page-a4-wrapper')
    ? element
    : element.querySelector('.page-a4-sheet, .page-a4-wrapper');

  if (pageA5El) {
    const isLandscape = pageA5El.classList.contains('landscape');
    return {
      sizeRule: isLandscape ? 'A5 landscape' : 'A5 portrait',
      widthMm: isLandscape ? 210 : 148,
      heightMm: isLandscape ? 148 : 210,
      isLandscape,
      type: 'a5',
      layoutMode: 'paged',
    };
  }

  if (pageA4El) {
    const isLandscape = pageA4El.classList.contains('landscape');
    return {
      sizeRule: isLandscape ? 'A4 landscape' : 'A4 portrait',
      widthMm: isLandscape ? 297 : 210,
      heightMm: isLandscape ? 210 : 297,
      isLandscape,
      type: 'a4',
      layoutMode: 'paged',
    };
  }

  // Template tự do vẫn được in trên A4 portrait, nhưng không bị ép vào layout PageA4.
  return {
    sizeRule: 'A4 portrait',
    widthMm: 210,
    heightMm: 297,
    isLandscape: false,
    type: 'custom',
    layoutMode: 'adaptive',
  };
}

export const DEFAULT_PRINT_SELECTOR =
  '.page-a4-wrapper, .page-a5-wrapper, .editor-host-container, template-editor, [c-id="123456"], .content-root, Root, root, .preview-container';

function measureAdaptiveContentWidth(element: HTMLElement): number {
  const rootRect = element.getBoundingClientRect();
  const visibleChildren = Array.from(element.children).filter((child) => {
    const htmlChild = child as HTMLElement;
    const style = window.getComputedStyle(htmlChild);
    const rect = htmlChild.getBoundingClientRect();
    return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0;
  }) as HTMLElement[];

  if (visibleChildren.length === 0) {
    return Math.max(element.scrollWidth || 0, rootRect.width || 0, 1);
  }

  const childRects = visibleChildren.map((child) => child.getBoundingClientRect());
  const left = Math.min(...childRects.map((rect) => rect.left));
  const right = Math.max(...childRects.map((rect) => rect.right));
  const visualSpan = Math.max(0, right - left);
  const widestChild = Math.max(
    ...visibleChildren.map((child, index) => Math.max(child.scrollWidth || 0, childRects[index].width || 0))
  );

  // Root của Preview luôn rộng 100% editor. Lấy bounding box của nội dung con giúp
  // tránh co hai lần khi template thực tế có max-width nhỏ hơn vùng làm việc.
  return Math.max(visualSpan, widestChild, 1);
}

export const handleBeforePrint = (selector: string = DEFAULT_PRINT_SELECTOR) => {
  let elContainer = document.querySelector('#print-container') as HTMLElement;
  if (!elContainer) {
    elContainer = document.createElement('div');
    elContainer.id = 'print-container';
    document.body.appendChild(elContainer);
  }

  // Với selector mặc định, ưu tiên nội dung thật thay vì clone toàn bộ editor host.
  // Điều này đặc biệt quan trọng cho template tự do vì editor host thường có height/overflow cố định.
  const elToPrint = selector === DEFAULT_PRINT_SELECTOR
    ? document.querySelector('.page-a4-wrapper, .page-a5-wrapper') ||
    document.querySelector('[c-id="123456"], .content-root, Root, root') ||
    document.querySelector('.editor-host-container template-editor') ||
    document.querySelector(DEFAULT_PRINT_SELECTOR)
    : document.querySelector(selector) ||
    document.querySelector('.page-a4-wrapper, .page-a5-wrapper') ||
    document.querySelector('[c-id="123456"], .content-root, Root, root') ||
    document.querySelector(DEFAULT_PRINT_SELECTOR);

  if (!elToPrint) return;

  const pageFormat = detectPageFormat(elToPrint);
  const cloned = elToPrint.cloneNode(true) as HTMLElement;
  const isAdaptive = pageFormat.layoutMode === 'adaptive';
  // Template tự do để trình duyệt quyết định khổ giấy/hướng giấy và hiển thị
  // các tùy chọn tương ứng trong print preview. PageA4/PageA5 vẫn khóa khổ chuẩn.
  const browserPageSizeRule = isAdaptive ? 'auto' : pageFormat.sizeRule;

  // A4 trừ lề 10mm mỗi bên, quy đổi tại 96 DPI.
  const adaptivePrintableWidthPx = (pageFormat.widthMm - 20) * (96 / 25.4);
  const sourceWidthPx = isAdaptive
    ? measureAdaptiveContentWidth(elToPrint as HTMLElement)
    : Math.max(
      (elToPrint as HTMLElement).scrollWidth || 0,
      (elToPrint as HTMLElement).getBoundingClientRect?.().width || 0,
      1
    );
  const adaptiveScale = isAdaptive
    ? Math.min(1, adaptivePrintableWidthPx / sourceWidthPx)
    : 1;

  if (isAdaptive) {
    cloned.classList.add('print-adaptive-root');
    cloned.setAttribute('data-print-layout', 'adaptive');
  }

  // Đồng bộ giá trị và style của input / textarea / select
  const getVisibleInputs = (root: Element) => {
    return Array.from(root.querySelectorAll('input, textarea, select')).filter((el) => {
      return !el.closest('.page-a4-source, .page-a5-source');
    }) as (HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)[];
  };

  const originalInputs = getVisibleInputs(elToPrint);
  const clonedInputs = getVisibleInputs(cloned);

  originalInputs.forEach((orig, idx) => {
    const clone = clonedInputs[idx];
    if (clone && orig) {
      if ((orig as HTMLInputElement).type === 'checkbox' || (orig as HTMLInputElement).type === 'radio') {
        (clone as HTMLInputElement).checked = (orig as HTMLInputElement).checked;
      }
      clone.value = orig.value;
      if (orig.style.height) clone.style.height = orig.style.height;
      if (orig.style.minHeight) clone.style.minHeight = orig.style.minHeight;
    }
  });

  // Đồng bộ dữ liệu vẽ từ thẻ <canvas> (chữ ký, Paint component)
  const getVisibleCanvases = (root: Element) => {
    return Array.from(root.querySelectorAll('canvas')).filter((el) => {
      return !el.closest('.page-a4-source, .page-a5-source');
    }) as HTMLCanvasElement[];
  };

  const originalCanvases = getVisibleCanvases(elToPrint);
  const clonedCanvases = getVisibleCanvases(cloned);

  originalCanvases.forEach((origCanvas, idx) => {
    const cloneCanvas = clonedCanvases[idx];
    if (cloneCanvas && origCanvas && origCanvas.width > 0 && origCanvas.height > 0) {
      cloneCanvas.width = origCanvas.width;
      cloneCanvas.height = origCanvas.height;
      const ctx = cloneCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(origCanvas, 0, 0);
      }
    }
  });

  // Loại bỏ các container nguồn ẩn sau khi đã đồng bộ
  cloned.querySelectorAll('.page-a4-source, .page-a5-source').forEach((el) => el.remove());

  // Gắn clone vào container in
  elContainer.innerHTML = '';
  elContainer.classList.toggle('print-layout-adaptive', isAdaptive);
  elContainer.classList.toggle('print-layout-paged', !isAdaptive);
  elContainer.appendChild(cloned);

  document.body.classList.add('printing-mode');

  // Tạo style in chuẩn: khống chế chiều cao chính xác mm và font-size: 0 để triệt tiêu 100% trang trắng thừa
  const styleId = 'vue-template-editor-print-styles';
  let style = document.getElementById(styleId) as HTMLStyleElement;
  if (!style) {
    style = document.createElement('style');
    style.id = styleId;
    document.head.appendChild(style);
  }

  style.textContent = `
    #print-container {
      display: none;
    }
    @media print {
      @page {
        size: ${browserPageSizeRule};
        margin: ${isAdaptive ? '10mm' : '0mm'} !important;
      }
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        box-sizing: border-box !important;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        overflow: visible !important;
        width: 100% !important;
        height: auto !important;
        font-size: ${isAdaptive ? 'initial' : '0'} !important;
        line-height: ${isAdaptive ? 'normal' : '0'} !important;
      }
      body > *:not(#print-container) {
        display: none !important;
      }
      #print-container {
        display: block !important;
        position: static !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: visible !important;
        width: 100% !important;
        font-size: ${isAdaptive ? 'initial' : '0'} !important;
        line-height: ${isAdaptive ? 'normal' : '0'} !important;
      }
      #print-container.print-layout-adaptive .print-adaptive-root {
        display: block !important;
        position: static !important;
        width: ${sourceWidthPx}px !important;
        height: auto !important;
        min-height: 0 !important;
        max-height: none !important;
        margin: 0 !important;
        overflow: visible !important;
        zoom: ${adaptiveScale};
        transform-origin: top left !important;
        break-inside: auto !important;
      }
      #print-container.print-layout-adaptive .editor-host-container,
      #print-container.print-layout-adaptive template-editor,
      #print-container.print-layout-adaptive .template-editor-host,
      #print-container.print-layout-adaptive .preview-editor-layout,
      #print-container.print-layout-adaptive .preview-editor-main,
      #print-container.print-layout-adaptive .preview-container {
        display: block !important;
        position: static !important;
        width: 100% !important;
        height: auto !important;
        min-height: 0 !important;
        max-height: none !important;
        overflow: visible !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      #print-container.print-layout-adaptive .preview-top-bar,
      #print-container.print-layout-adaptive .component-palette-sidebar,
      #print-container.print-layout-adaptive .edit-element-panel,
      #print-container.print-layout-adaptive .script-editor-drawer,
      #print-container.print-layout-adaptive .script-error-banner,
      #print-container.print-layout-adaptive .editor-overlay,
      #print-container.print-layout-adaptive .canvas-floating-toolbar {
        display: none !important;
      }
      #print-container.print-layout-adaptive img,
      #print-container.print-layout-adaptive svg,
      #print-container.print-layout-adaptive canvas {
        max-width: 100%;
      }
      .page-a4-sheet {
        margin: 0 !important;
        box-sizing: border-box !important;
        width: 209.8mm !important;
        max-width: 210mm !important;
        height: 296.6mm !important;
        max-height: 296.8mm !important;
        overflow: hidden !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        box-shadow: none !important;
        font-size: initial !important;
        line-height: normal !important;
      }
      .page-a4-sheet.landscape {
        width: 296.8mm !important;
        max-width: 297mm !important;
        height: 209.6mm !important;
        max-height: 209.8mm !important;
      }
      .page-a5, .page-a5-sheet {
        margin: 0 !important;
        box-sizing: border-box !important;
        width: 147.8mm !important;
        max-width: 148mm !important;
        height: 209.6mm !important;
        max-height: 209.8mm !important;
        overflow: hidden !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        box-shadow: none !important;
        font-size: initial !important;
        line-height: normal !important;
      }
      .page-a5.landscape, .page-a5-sheet.landscape {
        width: 209.8mm !important;
        max-width: 210mm !important;
        height: 147.8mm !important;
        max-height: 148mm !important;
      }
      .page-a4-sheet:not(:last-child), .page-a5:not(:last-child), .page-a5-sheet:not(:last-child) {
        page-break-after: always !important;
        break-after: page !important;
      }
      .page-a4-sheet:last-child, .page-a5:last-child, .page-a5-sheet:last-child {
        page-break-after: avoid !important;
        break-after: avoid !important;
      }
    }
  `;

  // Dọn dẹp an toàn khi người dùng in xong hoặc hủy hộp thoại
  const cleanup = () => {
    window.removeEventListener('afterprint', cleanup);
    document.body.classList.remove('printing-mode');
    if (elContainer) elContainer.innerHTML = '';
    if (style && style.parentNode) style.remove();
  };

  window.addEventListener('afterprint', cleanup, { once: true });
};

export function printElement(selector: string = DEFAULT_PRINT_SELECTOR) {
  handleBeforePrint(selector);
  window.print();
}

export const handlePrint = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
    e.preventDefault();
    printElement();
  }
};
