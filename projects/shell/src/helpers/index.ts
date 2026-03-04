import { Component, OnInit, OnDestroy } from '@angular/core';
import { App, ComponentPublicInstance, CreateAppFunction } from 'vue';

// A helper function to create an Angular component that wraps a Vue component
export function createVueWrapperComponent(createVueInstance: Function, props: any = {}) {
  @Component({
    template: '<div id="vueContainer"></div>'
  })
  class VueWrapperComponent implements OnInit, OnDestroy {
    private vueApp: App | null = null;
    private vm: ComponentPublicInstance | null = null;

    ngOnInit() {
      this.vueApp = createVueInstance();
      if (!this.vueApp) return console.error('Failed to load Vue preview component.');
      this.vm = this.vueApp.mount('#vueContainer');
      const data = this.vm.$data as any;
      Object.entries(props).forEach(([key, value]) => {
        data[key] = value;
      });
    }

    ngOnDestroy() {
      this.vueApp?.unmount();
    }
  }
  return VueWrapperComponent;
}
