import { Injectable } from '@angular/core';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { ComponentFactory } from 'shared/types';
import { App } from 'vue';
@Injectable({ providedIn: 'root' })
export class VueLoader {
  module: ComponentFactory | null = null;
  private async _initComponentFactory() {
    if (this.module) return;
    try {
      this.module = await loadRemoteModule({
        remoteName: 'templateEditor',
        exposedModule: './component-factory',
      });
    } catch (error) {
      console.error('[VueLoader] Failed to load Vue remote module:', error);
      this.module = null;
    }
  }

  async createPreview(): Promise<App | null> {
    await this._initComponentFactory();
    try {
      if (!this.module?.createPreview) {
        throw new Error('Component factory does not export createPreview.');
      }
      return this.module.createPreview();
    } catch(error) {
      console.log(error);
      return null;
    }
  }
}
