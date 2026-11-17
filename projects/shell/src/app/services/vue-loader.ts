import { Injectable } from '@angular/core';
import { mountPreview as mountVuePreview } from '@hsdt/vue-template-editor';
import type { PreviewMountOptions, PreviewMountInstance } from '@hsdt/vue-template-editor/types';

@Injectable({ providedIn: 'root' })
export class VueLoader {
  async mountPreview(
    container: HTMLElement | string,
    options: PreviewMountOptions
  ): Promise<PreviewMountInstance | null> {
    try {
      return mountVuePreview(container, options);
    } catch (error) {
      console.error('[VueLoader] Failed to mount preview:', error);
      return null;
    }
  }
}
