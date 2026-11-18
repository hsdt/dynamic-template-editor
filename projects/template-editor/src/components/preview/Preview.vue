<template>
  <DatePickerPortal />
  <div class="preview-editor-layout">
    <div class="preview-editor-main">
      <!-- Top Action Bar (Print & Script toggle) -->
      <div class="preview-top-bar" v-if="editMode">
        <div class="top-bar-left">
          <span class="preview-title"><i class="fa fa-television"></i> Xem trước Mẫu biểu & Giao diện</span>
        </div>
        <div class="top-bar-right">
          <button
            class="top-bar-action-btn print-btn"
            @click="printPreview"
            title="In mẫu biểu (Ctrl + P)"
          >
            <i class="fa fa-print"></i>
            <span>In bản in</span>
          </button>
          <button
            class="script-toggle-btn"
            :class="{ active: showScriptEditor, 'has-error': !!scriptError }"
            @click="showScriptEditor = !showScriptEditor"
            title="Mở / Đóng trình soạn thảo JavaScript Logic"
          >
            <i class="fa fa-code"></i>
            <span>JS Script</span>
            <span class="err-badge" v-if="scriptError">!</span>
          </button>
        </div>
      </div>

      <!-- Script Error Banner (if any) -->
      <div class="script-error-banner" v-if="scriptError && editMode">
        <i class="fa fa-exclamation-triangle"></i>
        <span>{{ scriptError }}</span>
      </div>

      <!-- Script Editor Drawer (Collapsible) -->
      <div class="script-editor-drawer" v-if="showScriptEditor && editMode">
        <div class="script-drawer-header">
          <div class="drawer-title">
            <span class="js-badge">JS</span>
            <span class="drawer-heading">JavaScript Scope & Logic</span>
            <span class="status-pill" :class="scriptError ? 'status-error' : 'status-ready'">
              <i class="fa" :class="scriptError ? 'fa-times-circle' : 'fa-check-circle'"></i>
              {{ scriptError ? 'Có lỗi Script' : 'Scope Sẵn Sàng' }}
            </span>
          </div>

          <div class="drawer-tools">
            <button class="tool-btn format-btn" @click="formatScript" title="Định dạng mã JavaScript tự động">
              <i class="fa fa-magic"></i> Format Code
            </button>
            <button class="drawer-close-btn" @click="showScriptEditor = false" title="Đóng">✕</button>
          </div>
        </div>

        <div class="script-drawer-body">
          <Codemirror
            :value="localScript"
            :options="cmScriptOptions"
            height="100%"
            :border="false"
            @change="onScriptEditorChange"
          />
        </div>

        <div class="script-drawer-footer" :class="{ 'has-error': !!scriptError }">
          <template v-if="scriptError">
            <i class="fa fa-exclamation-triangle footer-err-icon"></i>
            <span class="footer-err-text">{{ scriptError }}</span>
          </template>
          <template v-else>
            <i class="fa fa-lightbulb-o footer-tip-icon"></i>
            <span class="footer-tip-text">
              Hỗ trợ: <code>reactive()</code>, <code>computed()</code>, <code>watch()</code>, <code>ref()</code>, <code>$context</code>, top-level <code>await</code>. Hãy <code>return</code> các biến cần dùng trong template.
            </span>
          </template>
        </div>
      </div>

      <!-- Context Menu Component -->
      <ImContextMenu v-model:show="ContextMenuVisible" :options="contextMenuOption">
        <context-menu-group label="Insert">
          <template #icon>
            <i class="fa fa-plus"></i>
          </template>
          <context-menu-item v-if="!isClosingTag(selectedCid)" label="Insert inside" @click="openInsertMenu('inside')">
            <template #icon>
              <i class="fa fa-level-down"></i>
            </template>
          </context-menu-item>
          <context-menu-item v-if="selectedCid != rootId" label="Insert before" @click="openInsertMenu('before')">
            <template #icon>
              <i class="fa fa-level-up"></i>
            </template>
          </context-menu-item>
          <context-menu-item v-if="selectedCid != rootId" label="Insert after" @click="openInsertMenu('after')">
            <template #icon>
              <i class="fa fa-level-down"></i>
            </template>
          </context-menu-item>
        </context-menu-group>
        <context-menu-item label="Edit" @click="openEditPanel">
          <template #icon>
            <i class="fa fa-pencil-square-o"></i>
          </template>
        </context-menu-item>
        <context-menu-item v-if="selectedCid != rootId" label="Copy" @click="copyElement">
          <template #icon>
            <i class="fa fa-copy"></i>
          </template>
        </context-menu-item>
        <context-menu-group v-if="elementCopied" label="Paste">
          <template #icon>
            <i class="fa fa-paste"></i>
          </template>
          <context-menu-item v-if="!isClosingTag(selectedCid)" label="Paste inside" @click="pasteElement('inside')">
            <template #icon>
              <i class="fa fa-level-down"></i>
            </template>
          </context-menu-item>
          <context-menu-item v-if="selectedCid != rootId" label="Paste before" @click="pasteElement('before')">
            <template #icon>
              <i class="fa fa-level-up"></i>
            </template>
          </context-menu-item>
          <context-menu-item v-if="selectedCid != rootId" label="Paste after" @click="pasteElement('after')">
            <template #icon>
              <i class="fa fa-level-down"></i>
            </template>
          </context-menu-item>
        </context-menu-group>

        <context-menu-item v-if="selectedCid != rootId" label="Delete" @click="removeElement">
          <template #icon>
            <i class="fa fa-trash"></i>
          </template>
        </context-menu-item>
      </ImContextMenu>

      <!-- Insert Template Menu -->
      <ImContextMenu v-model:show="insertMenuVisible" :options="insertMenuOption">
        <context-menu-group
          v-for="(category, categoryIndex) in templateCategories"
          :key="categoryIndex"
          :label="category.label"
        >
          <context-menu-item
            v-for="(component, componentIndex) in category.templates"
            :key="componentIndex"
            :label="component.label"
            @click="insertElement(component)"
          >
            <template #icon>
              <i :class="component.icon"></i>
            </template>
          </context-menu-item>
        </context-menu-group>
      </ImContextMenu>

      <!-- Overlay -->
      <div v-if="selectedNode" class="editor-overlay" @click="selectedNode = null; unHighlightElement()"></div>

      <!-- Panel chỉnh sửa -->
      <EditElementPanel :selectedNode="selectedNode" @close="closeEditPanel" />

      <!-- Preview container with canvas drop & contextmenu support -->
      <div
        class="preview-container"
        ref="container"
        @click="onCanvasClick"
        @contextmenu="onCanvasContextMenu"
        @dblclick="onCanvasDblClick"
        @dragover="onCanvasDragOver"
        @dragleave="onCanvasDragLeave"
        @drop="onCanvasDrop"
      >
        <div class="content-root" ref="content"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  createApp,
  type App,
  type ComponentPublicInstance,
  effectScope,
  type EffectScope,
  isReactive,
  markRaw,
  reactive,
  toRefs
} from 'vue';
import Codemirror from 'codemirror-editor-vue3';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/theme/dracula.css';
import 'codemirror/addon/edit/closebrackets.js';
import 'codemirror/addon/edit/matchbrackets.js';
import 'codemirror/addon/selection/active-line.js';
import 'codemirror/addon/comment/comment.js';
import jsBeautify from 'js-beautify';
import PageA4 from '../layouts/PageA4.vue';
import PageA5 from '../layouts/PageA5.vue';
import Textarea from '../forms/Textarea.vue';
import InputOTP from '../forms/InputOTP.vue';
import Signature from '../forms/Signature.vue';
import { VirtualHTMLParser, VirtualNode, evalScriptScope, createTrackedState } from '@/utils';
import EditElementPanel from '../EditElementPanel.vue';
import { handlePrint, printElement } from '@/helpers';
import { ContextMenu as ImContextMenu, ContextMenuItem as ImContextMenuItem } from '@imengyu/vue3-context-menu';
import { templateCategories } from '@/constants';
import type { TemplateItem } from '@/types';
import Select from '../forms/Select.vue';
import Checkbox from '../forms/Checkbox.vue';
import DatePicker from '../forms/DatePicker.vue';
import DatePickerPortal from '../forms/DatePickerPortal.vue';
import { installMaskDirective } from '../../directives/mask-datetime';
import Paint from '../forms/Paint.vue';
import SimpleContextMenu from '../ContextMenu.vue';
import { installContextMenuDirective } from '../../directives/context-menu';
import IcdGroupItem from '../forms/IcdGroupItem.vue';
import IcdList from '../forms/IcdList.vue';
import XmlViewer from './XmlViewer.vue';

export default {
  name: 'Preview',
  components: {
    EditElementPanel,
    ImContextMenu,
    ImContextMenuItem,
    DatePickerPortal,
    Codemirror
  },
  props: {
    template: {
      type: String,
      required: true
    },
    script: {
      type: String,
      default: ''
    },
    context: {
      type: Object,
      default: () => ({})
    },
    editMode: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:template', 'update:context', 'update:editMode', 'update:script', 'script-error', 'script-ready', 'selection-change'],
  data() {
    const rootId = '123456';
    const rootNode = VirtualHTMLParser.parseToTree(this.template, 'Root', { 'c-id': rootId });
    rootNode.innerHTML = this.template;
    return {
      app: null as App<any> | null,
      vm: null as ComponentPublicInstance | null,
      rootId,
      rootNode,
      selectedNode: null as VirtualNode | null,
      processedTemplate: '',
      selectedCid: '',
      lastDblClickOriginCid: '',
      insertPosition: '',
      ContextMenuVisible: false,
      contextMenuOption: {
        x: 0,
        y: 0,
        minWidth: 100,
        zIndex: 100005
      },
      insertMenuVisible: false,
      insertMenuOption: {
        x: 0,
        y: 0,
        minWidth: 180,
        zIndex: 100005
      },
      elementCopied: null as VirtualNode | null,
      templateCategories: templateCategories,
      currentDropTarget: null as { cid: string; position: string } | null,
      localScript: this.script || '',
      showScriptEditor: false,
      scriptError: null as string | null,
      evaluatedScope: {} as Record<string, any>,
      activeScriptScope: null as EffectScope | null,
      evalScriptId: 0,
      runtimeState: markRaw({
        source: null as any,
        tracked: null as any,
        isEvaluatingInitialScript: false,
        isHandlingScriptFieldChange: false,
      }),
      cmScriptOptions: {
        mode: 'javascript',
        theme: 'dracula',
        lineNumbers: true,
        lineWrapping: true,
        tabSize: 2,
        indentUnit: 2,
        autoCloseBrackets: true,
        matchBrackets: true,
        styleActiveLine: true,
      },
      scriptDebounceTimer: null as ReturnType<typeof setTimeout> | null,
      clickTimeout: null as ReturnType<typeof setTimeout> | null,
    };
  },
  watch: {
    template: {
      handler(newVal) {
        if (newVal !== this.rootNode.innerHTML) {
          this.processTemplate();
        }
      }
    },
    script: {
      async handler(newVal) {
        if (newVal !== this.localScript) {
          this.localScript = newVal || '';
          await this.evalScript();
        }
      }
    },
    context: {
      async handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          await this.evalScript();
        }
      }
    },
    editMode: {
      handler(newVal) {
        if (!newVal) {
          this.selectedCid = '';
          this.lastDblClickOriginCid = '';
          this.selectedNode = null;
          this.unHighlightElement();
          this.$emit('selection-change', null);
        }
        if (this.$refs['content']) {
          this.attachEventListeners(this.$refs['content'] as HTMLElement);
        }
      }
    }
  },
  async mounted() {
    document.addEventListener('keydown', this.onPrintShortcut);
    this.rootNode.innerHTML = this.template;
    this.rootNode.genComponentId();
    this.rootNode.setAttribute('c-id', this.rootId);
    this.processedTemplate = this.rootNode.outerHTML;
    await this.evalScript();
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.onPrintShortcut);
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
      this.clickTimeout = null;
    }
    if (this.scriptDebounceTimer) {
      clearTimeout(this.scriptDebounceTimer);
      this.scriptDebounceTimer = null;
    }
    if (this.activeScriptScope) {
      this.activeScriptScope.stop();
      this.activeScriptScope = null;
    }
    if (this.app) {
      this.app.unmount();
      this.app = null;
    }
  },
  methods: {
    onPrintShortcut(event: KeyboardEvent) {
      if (this.editMode) {
        handlePrint(event);
      }
    },

    ensureRuntimeContext() {
      const source = this.context || {};
      if (!this.runtimeState.tracked || this.runtimeState.source !== source) {
        const reactiveBase = isReactive(source) ? source : reactive(source);
        this.runtimeState.source = source;
        this.runtimeState.tracked = createTrackedState(reactiveBase, (path, val, oldVal) => {
          this.handleTrackedFieldChange(path, val, oldVal);
        });
      }
      return this.runtimeState.tracked;
    },

    handleTrackedFieldChange(path: string, value: any, oldValue?: any) {
      if (this.runtimeState.isEvaluatingInitialScript) return;
      this.context?.['onFieldChange']?.(path, value, oldValue);

      const scriptHook = this.evaluatedScope?.['onFieldChange'];
      if (typeof scriptHook === 'function' && !this.runtimeState.isHandlingScriptFieldChange) {
        this.runtimeState.isHandlingScriptFieldChange = true;
        try {
          scriptHook(path, value, oldValue);
        } catch (err) {
          console.error('[Preview Script] Lỗi trong onFieldChange:', err);
        } finally {
          this.runtimeState.isHandlingScriptFieldChange = false;
        }
      }
    },

    getScriptScope(): Record<string, any> {
      return this.evaluatedScope || {};
    },

    getScriptActions(): any[] {
      const actions = this.evaluatedScope?.['actions'];
      return Array.isArray(actions) ? actions : [];
    },

    async validateBeforeSave(): Promise<{ valid: boolean; message?: string }> {
      if (this.scriptError) {
        return { valid: false, message: this.scriptError };
      }
      const hook = this.evaluatedScope?.['beforeSave'] ?? this.evaluatedScope?.['validate'];
      if (typeof hook !== 'function') {
        return { valid: true };
      }
      try {
        const trackedCtx = this.ensureRuntimeContext();
        const result = await hook(trackedCtx);
        if (result === false) {
          return { valid: false, message: 'Dữ liệu phiếu chưa hợp lệ theo kiểm tra nghiệp vụ.' };
        }
        if (typeof result === 'string' && result.trim()) {
          return { valid: false, message: result.trim() };
        }
        if (result && typeof result === 'object' && result.valid === false) {
          return { valid: false, message: result.message || 'Dữ liệu phiếu chưa hợp lệ.' };
        }
        return { valid: true };
      } catch (err: any) {
        return { valid: false, message: `Lỗi kiểm tra script: ${err?.message || String(err)}` };
      }
    },

    async evalScript() {
      if (!this.localScript || !this.localScript.trim()) {
        if (this.activeScriptScope) {
          this.activeScriptScope.stop();
          this.activeScriptScope = null;
        }
        this.evaluatedScope = {};
        this.scriptError = null;
        this.ensureRuntimeContext();
        this.$emit('script-ready', { scope: {}, actions: [] });
        this.renderPreview();
        return;
      }

      if (this.activeScriptScope) {
        this.activeScriptScope.stop();
        this.activeScriptScope = null;
      }

      this.evalScriptId = (this.evalScriptId || 0) + 1;
      const currentId = this.evalScriptId;

      const trackedContext = this.ensureRuntimeContext();
      const scopeRunner = effectScope();
      this.activeScriptScope = scopeRunner;
      this.runtimeState.isEvaluatingInitialScript = true;
      let evalResult: { scope: Record<string, any>; error: string | null };
      try {
        evalResult = await (scopeRunner.run(() =>
          evalScriptScope(this.localScript, trackedContext)
        ) as ReturnType<typeof evalScriptScope>);
      } finally {
        if (this.evalScriptId === currentId) {
          this.runtimeState.isEvaluatingInitialScript = false;
        }
      }

      if (this.evalScriptId !== currentId) return;

      const { scope, error } = evalResult;
      this.scriptError = error;
      if (error) {
        this.evaluatedScope = {};
        this.$emit('script-error', error);
        this.renderPreview();
      } else {
        this.evaluatedScope = markRaw(scope);
        this.$emit('script-ready', { scope: this.evaluatedScope, actions: this.getScriptActions() });
        this.renderPreview();
      }
    },

    onScriptEditorChange(val: string) {
      if (this.localScript === val) return;
      this.localScript = val;
      this.$emit('update:script', val);
      if (this.scriptDebounceTimer) clearTimeout(this.scriptDebounceTimer);
      this.scriptDebounceTimer = setTimeout(() => {
        this.evalScript();
      }, 250);
    },

    formatScript() {
      if (!this.localScript) return;
      try {
        const beautifyFn = (jsBeautify as any).js || (jsBeautify as any).js_beautify || jsBeautify;
        const formatted = beautifyFn(this.localScript, {
          indent_size: 2,
          space_in_empty_paren: false,
          preserve_newlines: true,
          max_preserve_newlines: 2
        });
        if (formatted && formatted !== this.localScript) {
          this.localScript = formatted;
          this.$emit('update:script', formatted);
          this.evalScript();
        }
      } catch (err) {
        console.error('Format script error:', err);
      }
    },

    processTemplate() {
      this.rootNode.innerHTML = this.template;
      this.rootNode.genComponentId();
      this.rootNode.setAttribute('c-id', this.rootId);
      if (this.selectedCid && this.selectedCid !== this.rootId && !this.rootNode.querySelector(`[c-id=${this.selectedCid}]`)) {
        this.selectedCid = '';
        this.lastDblClickOriginCid = '';
      }
      // Use outerHTML to keep the Root wrapper for single root element requirement
      this.processedTemplate = this.rootNode.outerHTML;
      this.renderPreview();
    },

    renderPreview() {
      const contentEl = this.$refs['content'] as HTMLElement;
      if (!contentEl) return;

      if (this.app) this.app.unmount();

      try {
        const self = this;
        const trackedContext = self.ensureRuntimeContext();
        const hasCustomScript = Boolean(
          self.localScript && self.localScript.trim() && !self.scriptError
        );
        const DynamicComponent = {
          template: this.processedTemplate,
          setup() {
            if (!hasCustomScript) {
              return trackedContext;
            }
            return {
              ...toRefs(trackedContext),
              ...self.evaluatedScope
            };
          }
        };

        contentEl.innerHTML = '';
        this.app = createApp(DynamicComponent);
        this.app.config.compilerOptions.isCustomElement = (tag) => tag === 'Root' || tag === 'root';

        this.app.config.errorHandler = (err: any, _instance, info) => {
          console.error('[Preview Vue Error]:', err, info);
          const errMsg = err?.message || String(err);
          contentEl.innerHTML = `
            <div style="padding: 24px; margin: 30px auto; max-width: 600px; background: #fff1f2; border: 1.5px solid #fca5a5; border-radius: 12px; color: #9f1239; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.08);">
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px; font-weight: 700; font-size: 16px;">
                <i class="fa fa-exclamation-triangle" style="font-size: 20px; color: #e11d48;"></i>
                Không thể hiển thị Template do lỗi Runtime / Cú pháp
              </div>
              <div style="background: #ffffff; padding: 12px 14px; border-radius: 8px; border: 1px solid #fecdd3; font-family: monospace; font-size: 13px; color: #be123c; word-break: break-all; margin-bottom: 12px;">
                ${errMsg}
              </div>
              <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">
                💡 <b>Gợi ý khắc phục:</b> Kiểm tra <b>JS Script</b> hoặc dữ liệu <code>context</code> xem các biến hoặc hàm được gọi trong template đã được khai báo và return đầy đủ chưa.
              </p>
            </div>
          `;
        };

        const logFn = (key: string) => (...args: any[]) => console.warn(`[Preview] context.${key} chưa được cung cấp`, ...args);
        const hasFieldChangeHandler = Boolean(this.context?.['onFieldChange'] || this.evaluatedScope?.['onFieldChange']);
        this.app.provide(
          'onFieldChange',
          hasFieldChangeHandler
            ? (path: string, val: any, oldVal?: any) => this.handleTrackedFieldChange(path, val, oldVal)
            : logFn('onFieldChange')
        );
        const hostSelectSearch = this.context?.['onSelectSearch'];
        const scriptSelectSearch = this.evaluatedScope?.['onSelectSearch'];
        this.app.provide(
          'onSelectSearch',
          hostSelectSearch || scriptSelectSearch
            ? (path: string, payload: { term: string; items: any[] }) => {
                scriptSelectSearch?.(path, payload);
                hostSelectSearch?.(path, payload);
              }
            : logFn('onSelectSearch')
        );
        this.app.provide('signature', this.context?.['signature'] ?? null);
        this.app.provide('MauHoSo', this.context?.['MauHoSo'] ?? null);
        this.app.provide('openSignatureHistory', this.context?.['openSignatureHistory'] ?? logFn('openSignatureHistory'));
        this.app.provide('handleSign', this.context?.['handleSign'] ?? logFn('handleSign'));
        this.app.provide('insertICD', this.context?.['insertICD'] ?? logFn('insertICD'));
        this.app.provide('editICD', this.context?.['editICD'] ?? logFn('editICD'));
        this.app.provide('removeICD', this.context?.['removeICD'] ?? logFn('removeICD'));
        this.app.provide('openPopupBuongGiuong', this.context?.['openPopupBuongGiuong'] ?? logFn('openPopupBuongGiuong'));

        installMaskDirective(this.app);
        installContextMenuDirective(this.app);

        this.app
          .component('PageA4', PageA4)
          .component('PageA5', PageA5)
          .component('Textarea', Textarea)
          .component('InputOTP', InputOTP)
          .component('Signature', Signature)
          .component('Select', Select)
          .component('Checkbox', Checkbox)
          .component('DatePicker', DatePicker)
          .component('Paint', Paint)
          .component('XmlViewer', XmlViewer)
          .component('ContextMenu', SimpleContextMenu)
          .component('ImContextMenu', ImContextMenu)
          .component('ImContextMenuItem', ImContextMenuItem)
          .component('IcdGroupItem', IcdGroupItem)
          .component('IcdList', IcdList);

        this.vm = this.app.mount(contentEl);

        this.attachEventListeners(contentEl);

      } catch (e: any) {
        console.error('Render error:', e);
        const errMsg = e?.message || String(e);
        contentEl.innerHTML = `
          <div style="padding: 24px; margin: 30px auto; max-width: 600px; background: #fff1f2; border: 1.5px solid #fca5a5; border-radius: 12px; color: #9f1239; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.08);">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px; font-weight: 700; font-size: 16px;">
              <i class="fa fa-exclamation-circle" style="font-size: 20px; color: #e11d48;"></i>
              Lỗi cú pháp Template / Không thể biên dịch
            </div>
            <div style="background: #ffffff; padding: 12px 14px; border-radius: 8px; border: 1px solid #fecdd3; font-family: monospace; font-size: 13px; color: #be123c; word-break: break-all;">
              ${errMsg}
            </div>
          </div>
        `;
      }
    },

    attachEventListeners(rootEl: HTMLElement) {
      const elements = rootEl.querySelectorAll('[c-id]');

      // Remove existing listeners
      rootEl.removeEventListener('contextmenu', this.contextMenuHandler);
      elements.forEach((el) => {
        el.classList.remove('empty-placeholder');
        el.removeEventListener('click', this.elementClickHandler as EventListener);
        el.removeEventListener('dblclick', this.elementDblClickHandler as EventListener);
        el.removeEventListener('contextmenu', this.contextMenuHandler as EventListener);
        el.removeEventListener('dragover', this.elementDragOverHandler as EventListener);
        el.removeEventListener('dragleave', this.elementDragLeaveHandler as EventListener);
        el.removeEventListener('drop', this.elementDropHandler as EventListener);
      });

      // Add new contextmenu & drag listeners
      rootEl.addEventListener('contextmenu', this.contextMenuHandler);
      elements.forEach(el => {
        const cid = el.getAttribute('c-id');
        const fakeElement = this.rootNode.querySelector(`[c-id=${cid}]`);
        if (
          this.editMode &&
          fakeElement?.childNodes.length === 0 &&
          !fakeElement.isClosingTag &&
          (!el.getAttribute('style') || el.getAttribute('style')?.trim() === '') &&
          (!el.getAttribute('class') || el.getAttribute('class')?.trim() === '') &&
          fakeElement?.getAttribute('c-name') === 'div'
        ) {
          el.classList.add('empty-placeholder');
        }

        el.addEventListener('contextmenu', this.contextMenuHandler as EventListener);
        if (this.editMode) {
          el.addEventListener('click', this.elementClickHandler as EventListener);
          el.addEventListener('dblclick', this.elementDblClickHandler as EventListener);
          el.addEventListener('dragover', this.elementDragOverHandler as EventListener);
          el.addEventListener('dragleave', this.elementDragLeaveHandler as EventListener);
          el.addEventListener('drop', this.elementDropHandler as EventListener);
        }
      });
    },

    isSameOrAncestorCid(ancestorCid: string, childCid: string): boolean {
      if (!ancestorCid || !childCid || ancestorCid === this.rootId) return false;
      if (ancestorCid === childCid) return true;
      let node = this.rootNode.querySelector(`[c-id=${childCid}]`)?.parentNode || null;
      while (node) {
        const cid = node.getAttribute('c-id');
        if (cid === ancestorCid) return true;
        if (cid === this.rootId) break;
        node = node.parentNode;
      }
      return false;
    },

    elementClickHandler(e: MouseEvent) {
      if (!this.editMode) return;
      e.preventDefault();
      e.stopPropagation();
      const targetEl = e.currentTarget as HTMLElement;
      const cid = targetEl?.getAttribute('c-id');
      if (!cid) return;

      if (this.clickTimeout) {
        clearTimeout(this.clickTimeout);
        this.clickTimeout = null;
      }

      this.clickTimeout = setTimeout(() => {
        this.selectedCid = cid;
        this.lastDblClickOriginCid = cid;
        this.emitSelection(cid);
        if (cid === this.rootId) this.unHighlightElement();
        else this.highlightElement(targetEl);
        this.clickTimeout = null;
      }, 200);
    },

    elementDblClickHandler(e: MouseEvent) {
      if (!this.editMode) return;
      e.preventDefault();
      e.stopPropagation();

      if (this.clickTimeout) {
        clearTimeout(this.clickTimeout);
        this.clickTimeout = null;
      }

      const targetEl = e.currentTarget as HTMLElement;
      const clickedCid = targetEl?.getAttribute('c-id') || undefined;
      this.targetParentElement(clickedCid);
    },

    onCanvasClick(e: MouseEvent) {
      if (!this.editMode) return;
      const target = e.target as HTMLElement | null;
      const hitCidEl = target?.closest?.('[c-id]') as HTMLElement | null;
      if (!hitCidEl || hitCidEl.getAttribute('c-id') === this.rootId) {
        if (this.clickTimeout) {
          clearTimeout(this.clickTimeout);
          this.clickTimeout = null;
        }
        this.selectedCid = this.rootId;
        this.lastDblClickOriginCid = '';
        this.selectedNode = null;
        this.unHighlightElement();
        this.emitSelection(this.rootId);
      }
    },

    onCanvasDblClick() {
      if (!this.editMode) return;
      if (this.clickTimeout) {
        clearTimeout(this.clickTimeout);
        this.clickTimeout = null;
      }
      this.targetParentElement();
    },

    targetParentElement(fallbackCid?: string) {
      let currentCid: string | undefined;

      if (fallbackCid) {
        const hasValidSelection =
          Boolean(this.selectedCid) &&
          this.selectedCid !== this.rootId &&
          Boolean(this.rootNode.querySelector(`[c-id=${this.selectedCid}]`));

        const shouldContinueClimbing =
          hasValidSelection &&
          (this.selectedCid === fallbackCid ||
            (this.lastDblClickOriginCid === fallbackCid &&
              this.isSameOrAncestorCid(this.selectedCid, fallbackCid)));

        if (shouldContinueClimbing) {
          currentCid = this.selectedCid;
        } else {
          this.lastDblClickOriginCid = fallbackCid;
          currentCid = fallbackCid;
        }
      } else if (this.selectedCid && this.selectedCid !== this.rootId) {
        currentCid = this.selectedCid;
      }

      if (!currentCid || currentCid === this.rootId) return;

      const contentRoot = (this.$refs['content'] as HTMLElement) || document;

      // 1. Tìm node cha trong virtual tree
      let parentCid: string | null = null;
      let parentNode: VirtualNode | null = null;

      const currentNode = this.rootNode.querySelector(`[c-id=${currentCid}]`);
      if (currentNode && currentNode.parentNode) {
        parentNode = currentNode.parentNode;
        parentCid = parentNode.getAttribute('c-id') || null;
      }

      // 2. Fallback tìm qua real DOM nếu virtual tree chưa liên kết
      if (!parentCid) {
        const domEl = contentRoot.querySelector(`[c-id="${currentCid}"]`);
        const domParent = domEl?.parentElement?.closest('[c-id]');
        parentCid = domParent?.getAttribute('c-id') || null;
        if (parentCid) {
          parentNode = this.rootNode.querySelector(`[c-id=${parentCid}]`);
        }
      }

      if (!parentCid || parentCid === this.rootId) {
        this.selectedCid = this.rootId;
        this.lastDblClickOriginCid = '';
        this.selectedNode = null;
        this.unHighlightElement();
        this.emitSelection(this.rootId);
        return;
      }

      this.selectedCid = parentCid;
      if (this.selectedNode) {
        this.selectedNode = parentNode;
      }
      this.emitSelection(parentCid);

      this.$nextTick(() => {
        const el = contentRoot.querySelector(`[c-id="${parentCid}"]`) as HTMLElement | null;
        if (el) {
          this.highlightElement(el);
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    },

    onCanvasContextMenu(e: MouseEvent) {
      if (!this.editMode) return;
      if (this.clickTimeout) {
        clearTimeout(this.clickTimeout);
        this.clickTimeout = null;
      }
      e.preventDefault();
      e.stopPropagation();
      this.onContextMenu(e);
    },

    contextMenuHandler(e: MouseEvent) {
      if (!this.editMode) return;
      if (this.clickTimeout) {
        clearTimeout(this.clickTimeout);
        this.clickTimeout = null;
      }
      e.preventDefault();
      e.stopPropagation();
      this.onContextMenu(e);
    },

    onContextMenu(e: MouseEvent) {
      e.preventDefault();
      this.contextMenuOption.x = e.clientX;
      this.contextMenuOption.y = e.clientY;
      this.ContextMenuVisible = true;
      // Chuột phải không tự động target, hoàn toàn dựa vào target đã chọn bởi chuột trái (hoặc click đúp)
      if (!this.selectedCid) {
        this.selectedCid = this.rootId;
      }
    },

    // --- Drag & Drop Handlers ---
    elementDragOverHandler(e: DragEvent) {
      if (!this.editMode) return;
      e.preventDefault();
      e.stopPropagation();

      const targetEl = e.currentTarget as HTMLElement;
      const cid = targetEl.getAttribute('c-id');
      if (!cid) return;

      const rect = targetEl.getBoundingClientRect();
      const relY = (e.clientY - rect.top) / (rect.height || 1);

      let position = 'inside';
      if (cid !== this.rootId) {
        if (relY < 0.25) position = 'before';
        else if (relY > 0.75) position = 'after';
      }

      this.clearDropIndicators();
      targetEl.classList.add(`drop-target-${position}`);
      this.currentDropTarget = { cid, position };
    },

    elementDragLeaveHandler(e: DragEvent) {
      const targetEl = e.currentTarget as HTMLElement;
      targetEl.classList.remove('drop-target-before', 'drop-target-after', 'drop-target-inside');
    },

    elementDropHandler(e: DragEvent) {
      if (!this.editMode) return;
      e.preventDefault();
      e.stopPropagation();
      this.clearDropIndicators();

      const rawTemplate = e.dataTransfer?.getData('text/plain');
      if (!rawTemplate) return;

      const targetCid = (e.currentTarget as HTMLElement).getAttribute('c-id') || this.currentDropTarget?.cid;
      const position = this.currentDropTarget?.position || 'inside';

      this.insertTemplateAt(rawTemplate, targetCid, position);
    },

    onCanvasDragOver(e: DragEvent) {
      if (!this.editMode) return;
      e.preventDefault();
    },

    onCanvasDragLeave() {
      this.clearDropIndicators();
    },

    onCanvasDrop(e: DragEvent) {
      if (!this.editMode) return;
      e.preventDefault();
      this.clearDropIndicators();
      const rawTemplate = e.dataTransfer?.getData('text/plain');
      if (rawTemplate) {
        this.insertTemplateAt(rawTemplate, this.rootId, 'inside');
      }
    },

    clearDropIndicators() {
      document.querySelectorAll('.drop-target-before, .drop-target-after, .drop-target-inside').forEach((el) => {
        el.classList.remove('drop-target-before', 'drop-target-after', 'drop-target-inside');
      });
    },

    emitSelection(cid: string) {
      if (!cid || cid === this.rootId) {
        this.$emit('selection-change', null);
        return;
      }
      const node = this.rootNode.querySelector(`[c-id=${cid}]`);
      if (!node) {
        this.$emit('selection-change', null);
        return;
      }
      const label = this.normalizeSelectionText(node.getAttribute('label'));
      const componentName = this.normalizeSelectionText(node.getAttribute('c-name'));
      const model = this.normalizeSelectionText(node.getAttribute('v-model'));
      const modelName = model ? model.split('.').filter(Boolean).pop() || '' : '';
      const name = label || componentName || modelName || this.getFriendlyTagName(node.tagName);
      this.$emit('selection-change', {
        id: cid,
        name,
        tagName: node.tagName,
        label,
        model,
        html: node.outerHTML
      });
    },

    normalizeSelectionText(value: unknown) {
      if (value === undefined || value === null) return '';
      const textarea = document.createElement('textarea');
      textarea.innerHTML = String(value);
      return textarea.value.replace(/\s+/g, ' ').trim();
    },

    getFriendlyTagName(tagName: string) {
      const names: Record<string, string> = {
        pagea4: 'Trang A4',
        pagea5: 'Trang A5',
        textarea: 'Trường văn bản',
        datepicker: 'Trường ngày tháng',
        inputotp: 'Trường mã số',
        select: 'Danh sách lựa chọn',
        checkbox: 'Ô lựa chọn',
        signature: 'Vị trí chữ ký',
        paint: 'Vùng vẽ',
        icdgroupitem: 'Nhóm mã bệnh ICD',
        icdlist: 'Danh sách mã bệnh ICD',
        xmlviewer: 'Trình xem XML',
        table: 'Bảng dữ liệu',
        tr: 'Hàng trong bảng',
        td: 'Ô trong bảng',
        th: 'Tiêu đề cột',
        section: 'Phần nội dung',
        div: 'Khối nội dung',
        p: 'Đoạn văn',
        h1: 'Tiêu đề',
        h2: 'Tiêu đề',
        h3: 'Tiêu đề'
      };
      return names[String(tagName || '').toLowerCase()] || tagName || 'Thành phần';
    },

    insertTemplateAt(templateStr: string, targetCid?: string, position: string = 'inside') {
      const newElement = VirtualHTMLParser.parseToElement(templateStr);
      if (!targetCid || targetCid === this.rootId) {
        this.rootNode.appendChild(newElement);
      } else {
        const target = this.rootNode.querySelector(`[c-id=${targetCid}]`);
        if (!target) {
          this.rootNode.appendChild(newElement);
        } else if (position === 'before' && target.parentNode) {
          target.parentNode.insertBefore(newElement, target);
        } else if (position === 'after' && target.parentNode) {
          target.parentNode.insertAfter(newElement, target);
        } else {
          target.appendChild(newElement);
        }
      }

      this.updateTemplate();

      const newCid = newElement.getAttribute('c-id');
      if (newCid) {
        this.selectedCid = newCid;
        this.$nextTick(() => {
          const el = document.querySelector(`[c-id="${newCid}"]`) as HTMLElement;
          if (el) this.highlightElement(el);
        });
      }
    },

    openInsertMenu(position: string) {
      this.insertPosition = position;
      this.ContextMenuVisible = false;

      // Position the insert menu near the context menu
      this.insertMenuOption.x = this.contextMenuOption.x + 100;
      this.insertMenuOption.y = this.contextMenuOption.y;
      this.insertMenuVisible = true;
    },

    insertElement(templateConfig: TemplateItem) {
      if (!this.selectedCid) return;
      this.insertTemplateAt(templateConfig.template, this.selectedCid, this.insertPosition || 'inside');
      this.insertMenuVisible = false;
    },

    openEditPanel() {
      if (this.selectedCid) {
        this.selectedNode = this.rootNode.querySelector(`[c-id=${this.selectedCid}]`);
      }
    },

    copyElement() {
      if (!this.selectedCid) return;

      const selectedElement = this.rootNode.querySelector(`[c-id=${this.selectedCid}]`) as VirtualNode;
      if (!selectedElement) return;
      this.elementCopied = selectedElement.cloneNode(true);
    },

    pasteElement(pastePosition: string) {
      if (!this.selectedCid || !this.elementCopied) return;

      const selectedElement = this.rootNode.querySelector(`[c-id=${this.selectedCid}]`);
      if (!selectedElement) return;
      const clone = this.elementCopied.cloneNode(true);
      clone.genComponentId(true);
      const parent = selectedElement.parentNode;
      if (pastePosition === 'before' && parent) {
        parent.insertBefore(clone, selectedElement);
      } else if (pastePosition === 'after' && parent) {
        parent.insertAfter(clone, selectedElement);
      } else if (pastePosition === 'inside') {
        selectedElement.appendChild(clone);
      }
      this.updateTemplate();
    },

    removeElement() {
      if (this.selectedCid) {
        const el = this.rootNode.querySelector(`[c-id=${this.selectedCid}]`) as VirtualNode;
        el?.remove();
        this.updateTemplate();
      }
    },

    highlightElement(el: HTMLElement) {
      this.unHighlightElement();
      el.classList.add('element-highlight');
    },

    unHighlightElement() {
      document.querySelectorAll('.element-highlight').forEach(item => {
        item.classList.remove('element-highlight');
      });
    },

    updateTemplate() {
      const newHTML = this.rootNode.innerHTML;
      this.processedTemplate = this.rootNode.outerHTML;
      this.$emit('update:template', newHTML);
      this.renderPreview();
    },

    closeEditPanel() {
      this.selectedNode = null;
      this.updateTemplate();
      this.unHighlightElement();
    },

    isClosingTag(cid: string) {
      return this.rootNode.querySelector(`[c-id=${cid}]`)?.isClosingTag;
    },

    printPreview() {
      printElement('[c-id="123456"], .content-root, Root, root');
    }
  }
};
</script>

<style scoped>
.preview-editor-layout {
  display: flex;
  height: 100%;
  max-height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
}

.preview-editor-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100%;
  overflow: auto;
  position: relative;
  min-height: 0;
}

.preview-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 42px;
  box-sizing: border-box;
  padding: 0 16px;
  background: #0f172a;
  border-bottom: 1px solid #1e293b;
  color: #f8fafc;
  z-index: 10;
  flex-shrink: 0;
}

.preview-title {
  font-size: 13px;
  font-weight: 600;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 8px;
}

.top-bar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.top-bar-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  background: #1e293b;
  color: #cbd5e1;
  border: 1px solid #334155;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.top-bar-action-btn:hover {
  background: #334155;
  color: #ffffff;
  border-color: #475569;
}

.print-btn {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border-color: rgba(16, 185, 129, 0.35);
}

.print-btn:hover {
  background: #10b981;
  color: #ffffff;
  border-color: #10b981;
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
}

.script-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  background: #1e293b;
  color: #cbd5e1;
  border: 1px solid #334155;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.script-toggle-btn:hover {
  background: #334155;
  color: #ffffff;
}

.script-toggle-btn.active {
  background: #0284c7;
  color: #ffffff;
  border-color: #38bdf8;
  box-shadow: 0 0 12px rgba(2, 132, 199, 0.4);
}

.script-toggle-btn.has-error {
  border-color: #ef4444;
  color: #fca5a5;
}

.err-badge {
  background: #ef4444;
  color: #fff;
  font-size: 10px;
  font-weight: bold;
  padding: 1px 5px;
  border-radius: 10px;
  line-height: 1;
}

/* Script Error Banner */
.script-error-banner {
  background: #fef2f2;
  border-bottom: 1px solid #fecaca;
  color: #991b1b;
  padding: 8px 16px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: monospace;
}

/* Script Editor Drawer */
.script-editor-drawer {
  background: #0f172a;
  border-bottom: 2px solid #1e293b;
  display: flex;
  flex-direction: column;
  height: 520px;
  min-height: 280px;
  max-height: 85vh;
  resize: vertical;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  z-index: 15;
  flex-shrink: 0;
}

.script-drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 14px;
  background: #0f172a;
  border-bottom: 1px solid #1e293b;
  flex-wrap: wrap;
  gap: 8px;
}

.drawer-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.js-badge {
  background: #f59e0b;
  color: #0f172a;
  font-weight: 800;
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 4px;
  letter-spacing: 0.5px;
}

.drawer-heading {
  font-size: 13px;
  font-weight: 600;
  color: #f1f5f9;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.status-ready {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.status-error {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.drawer-tools {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tool-btn {
  background: #1e293b;
  color: #94a3b8;
  border: 1px solid #334155;
  padding: 3px 9px;
  font-size: 11.5px;
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 0.15s ease;
}

.tool-btn:hover {
  background: #334155;
  color: #38bdf8;
  border-color: #38bdf8;
}

.format-btn {
  background: rgba(14, 165, 233, 0.15);
  color: #38bdf8;
  border-color: rgba(14, 165, 233, 0.35);
}

.format-btn:hover {
  background: #0ea5e9;
  color: #ffffff;
  border-color: #0ea5e9;
}

.drawer-close-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 14px;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.drawer-close-btn:hover {
  background: #1e293b;
  color: #ffffff;
}

.script-drawer-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.script-drawer-body :deep(.vue-codemirror),
.script-drawer-body :deep(.CodeMirror) {
  height: 100% !important;
  font-family: 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.55;
}

.script-drawer-body :deep(.cm-s-dracula.CodeMirror) {
  background: #0b1120 !important;
}

.script-drawer-body :deep(.cm-s-dracula .CodeMirror-gutters) {
  background: #070a13 !important;
  border-right: 1px solid #1e293b !important;
}

.script-drawer-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 14px;
  background: #090d16;
  border-top: 1px solid #1e293b;
  font-size: 11.5px;
}

.script-drawer-footer.has-error {
  background: #450a0a;
  border-top-color: #7f1d1d;
}

.footer-tip-icon {
  color: #f59e0b;
}

.footer-tip-text {
  color: #94a3b8;
}

.footer-tip-text code {
  background: #1e293b;
  color: #38bdf8;
  padding: 1px 4px;
  border-radius: 3px;
  font-family: monospace;
}

.footer-err-icon {
  color: #ef4444;
}

.footer-err-text {
  color: #fca5a5;
  font-family: monospace;
}

.preview-container {
  flex: 1;
  overflow: auto;
  display: flex;
  justify-content: center;
  background: #868e96;
  width: 100%;
  box-sizing: border-box;
}

.content-root {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 100%;
}

:deep([c-id="123456"]) {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  width: 100%;
  min-height: 100%;
  padding: 16px 0;
  box-sizing: border-box;
}

/* Drop targets & selection visual feedback */
:deep(.drop-target-inside) {
  outline: 2px dashed #0288d1 !important;
  outline-offset: 2px !important;
  background-color: rgba(2, 136, 209, 0.08) !important;
}

:deep(.drop-target-before) {
  position: relative;
  box-shadow: 0 -4px 0 0 #0288d1 !important;
}

:deep(.drop-target-after) {
  position: relative;
  box-shadow: 0 4px 0 0 #0288d1 !important;
}

:deep(.element-highlight) {
  outline: 2px solid #0288d1 !important;
  outline-offset: 1px !important;
  box-shadow: 0 0 0 4px rgba(2, 136, 209, 0.15) !important;
}

/* Overlay */
.editor-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100002;
  animation: fadeIn 0.2s ease-in-out;
}

@media print {
  .preview-editor-layout {
    display: block;
  }
  .preview-top-bar,
  .script-editor-drawer,
  .script-error-banner {
    display: none !important;
  }
  .preview-container {
    padding: 0;
    background: transparent;
  }
  .content-root {
    padding: 0;
  }
  :deep([c-id="123456"]) {
    box-shadow: none;
    padding: 0;
  }
}
</style>
