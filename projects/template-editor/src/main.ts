import { createApp } from "vue";
import App from "./App.vue";
import { InstallCodeMirror } from "codemirror-editor-vue3";
import ContextMenuPlugin from "@imengyu/vue3-context-menu";
import { installContextMenuDirective } from "./directives/context-menu";
import "./assets/main.css";

const app = createApp(App);
installContextMenuDirective(app);
app
  .use(InstallCodeMirror)
  .use(ContextMenuPlugin)
  .mount("#app");