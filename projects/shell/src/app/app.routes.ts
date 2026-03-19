import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { Home } from './pages/home/home';
import { createVueWrapperComponent } from '../helpers';
import { VUE_REMOTE_ENTRY } from '../constants/vue-remote-entry';
import { ComponentFactory } from 'shared/types';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'vue-page',
    loadComponent: () =>
      loadRemoteModule({
        type: 'module',
        remoteEntry: VUE_REMOTE_ENTRY,
        exposedModule: './component-factory',
      }).then((m: ComponentFactory) =>
        createVueWrapperComponent(m.createRoot)
      ),
  },
  { path: '**', component: Home },
];
