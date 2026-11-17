import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  NgZone
} from '@angular/core';
import { VueLoader } from '../../services/vue-loader';
import type { PreviewMountInstance, PreviewSelection } from '@hsdt/vue-template-editor/types';

@Component({
  selector: 'template-editor',
  standalone: true,
  template: `<div #container class="template-editor-host" style="width: 100%; height: 100%; display: flex; flex-direction: column;"></div>`,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      min-height: 0;
    }
  `]
})
export class TemplateEditor implements OnInit, OnChanges, OnDestroy {
  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>;

  private previewInstance: PreviewMountInstance | null = null;

  @Input('template') template = '';
  @Output() templateChange = new EventEmitter<string>();

  @Input('script') script = '';
  @Output() scriptChange = new EventEmitter<string>();

  @Input('context') context: any = {};
  @Output() contextChange = new EventEmitter<any>();

  @Input('editMode') editMode = true;
  @Output() editModeChange = new EventEmitter<boolean>();

  @Output() scriptError = new EventEmitter<string>();
  @Output() selectionChange = new EventEmitter<PreviewSelection | null>();

  constructor(private vueLoader: VueLoader, private ngZone: NgZone) {}

  async ngOnInit() {
    const el = this.containerRef?.nativeElement;
    if (!el) return;
    this.previewInstance = await this.vueLoader.mountPreview(el, {
      template: this.template,
      script: this.script,
      context: this.context,
      editMode: this.editMode,
      onTemplateChange: (val: string) => {
        this.template = val;
        this.templateChange.emit(val);
      },
      onScriptChange: (val: string) => {
        this.script = val;
        this.scriptChange.emit(val);
      },
      onContextChange: (val: any) => {
        this.context = val;
        this.contextChange.emit(val);
      },
      onEditModeChange: (val: boolean) => {
        this.editMode = val;
        this.editModeChange.emit(val);
      },
      onScriptError: (err: string) => {
        this.scriptError.emit(err);
      },
      onSelectionChange: (selection: PreviewSelection | null) => {
        this.ngZone.run(() => this.selectionChange.emit(selection));
      },
    });

    if (!this.previewInstance) {
      console.error('[TemplateEditor] Failed to load & mount Vue Preview component.');
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.previewInstance) return;

    const updatedProps: Record<string, any> = {};
    if (changes['template']) updatedProps['template'] = this.template;
    if (changes['script']) updatedProps['script'] = this.script;
    if (changes['context']) updatedProps['context'] = this.context;
    if (changes['editMode']) updatedProps['editMode'] = this.editMode;

    if (Object.keys(updatedProps).length > 0) {
      this.previewInstance.updateProps(updatedProps);
    }
  }

  ngOnDestroy(): void {
    this.previewInstance?.unmount();
    this.previewInstance = null;
  }
}
