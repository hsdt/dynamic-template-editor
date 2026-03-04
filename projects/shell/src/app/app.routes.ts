import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { Home } from './pages/home/home';
import { createVueWrapperComponent } from '../helpers';
import { ComponentFactory } from 'shared/types';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'vue-page',
    loadComponent: () =>
      // loadRemoteModule({
      //   // remoteEntry: 'http://localhost:4202/assets/remoteEntry.js',
      //   remoteName: 'templateEditor',
      //   exposedModule: './component-factory',
      // }).then((m: ComponentFactory) =>
      //   createVueWrapperComponent(m.createApp)
      // ),
      loadRemoteModule('templateEditor', './component-factory').then((m: ComponentFactory) =>
        createVueWrapperComponent(m.createRoot)
      ),
  },
  { path: '**', component: Home },
];
