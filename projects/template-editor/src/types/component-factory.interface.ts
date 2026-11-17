export interface PreviewSelection {
  id: string;
  name: string;
  tagName: string;
  label?: string;
  model?: string;
  html: string;
}

export interface ScriptReadyPayload {
  scope: Record<string, any>;
  actions: any[];
}

export interface PreviewMountOptions {
  template: string;
  script?: string;
  context?: any;
  editMode?: boolean;
  onTemplateChange?: (val: string) => void;
  onScriptChange?: (val: string) => void;
  onContextChange?: (val: any) => void;
  onEditModeChange?: (val: boolean) => void;
  onScriptError?: (err: string) => void;
  onScriptReady?: (payload: ScriptReadyPayload) => void;
  onSelectionChange?: (selection: PreviewSelection | null) => void;
}

export interface PreviewMountInstance {
  app: any;
  context: any;
  updateProps: (props: Partial<PreviewMountOptions>) => void;
  unmount: () => void;
  getScriptScope?: () => Record<string, any>;
  getScriptActions?: () => any[];
  validateBeforeSave?: () => Promise<{ valid: boolean; message?: string }>;
}
