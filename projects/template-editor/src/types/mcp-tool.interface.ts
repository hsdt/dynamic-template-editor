export interface ToolExecutionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  changed?: boolean;
  saved?: boolean;
}

export interface CanonicalToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface ComponentCatalogItem {
  description: string;
  props?: Record<string, string>;
  example?: string;
}

export type ComponentCatalog = Record<string, ComponentCatalogItem>;

export function validateCanonicalTools(tools: CanonicalToolDefinition[]): void {
  const seenNames = new Set<string>();
  for (const tool of tools) {
    if (!tool.name) {
      throw new Error('Tool contract invalid: tool must have a non-empty name');
    }
    if (seenNames.has(tool.name)) {
      throw new Error(`Tool contract invalid: duplicate tool name "${tool.name}"`);
    }
    seenNames.add(tool.name);
    if (!tool.inputSchema || tool.inputSchema.type !== 'object') {
      throw new Error(`Tool contract invalid: tool "${tool.name}" inputSchema must have type: "object"`);
    }
  }
}
