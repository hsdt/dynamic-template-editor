import { App } from 'vue';
export interface ComponentFactory {
  createPreview: () => App; // Function that creates and returns a Vue instance
  createRoot: () => App;
}
