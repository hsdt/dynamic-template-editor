<template>
  <div class="ctx-tree-node">
    <div
      class="ctx-tree-row"
      :class="{ 'is-branch': isBranch }"
      :style="{ paddingLeft: `${depth * 16 + 8}px` }"
      @click="isBranch && toggle()"
    >
      <span class="ctx-tree-caret">
        <template v-if="isBranch">{{ isOpen ? '▾' : '▸' }}</template>
      </span>

      <span class="ctx-tree-key">{{ node.key }}</span>

      <template v-if="isBranch">
        <span class="ctx-tree-badge" :class="`type-${node.valueType}`">
          {{ node.valueType === 'array' ? `Array${node.summary}` : `Object${node.summary}` }}
        </span>
        <span v-if="!isOpen && node.sample" class="ctx-tree-preview">{{ node.sample }}</span>
      </template>

      <template v-else>
        <span class="ctx-tree-colon">:</span>
        <span class="ctx-tree-val" :class="`val-${node.valueType}`">{{ formattedLeaf }}</span>
      </template>

      <div class="ctx-tree-actions" @click.stop>
        <button
          type="button"
          class="tool-btn"
          :class="{ 'is-copied': copiedKey === `${node.path}:path` }"
          @click="$emit('copy-path', node.path)"
        >
          {{ copiedKey === `${node.path}:path` ? 'Đã copy' : 'Path' }}
        </button>
        <button
          v-if="!isBranch"
          type="button"
          class="tool-btn"
          :class="{ 'is-copied': copiedKey === `${node.path}:interp` }"
          @click="$emit('copy-interp', node.path)"
        >
          {{ copiedKey === `${node.path}:interp` ? 'Đã copy' : '{' + '{ }' + '}' }}
        </button>
        <button
          v-if="!isBranch"
          type="button"
          class="tool-btn format-btn"
          :class="{ 'is-copied': copiedKey === `${node.path}:ta` }"
          @click="$emit('copy-textarea', node)"
        >
          {{ copiedKey === `${node.path}:ta` ? 'Đã copy' : 'Textarea' }}
        </button>
      </div>
    </div>

    <div v-if="isBranch && isOpen && node.children?.length" class="ctx-tree-children">
      <ContextTreeNode
        v-for="child in node.children"
        :key="child.path"
        :node="child"
        :depth="depth + 1"
        :copiedKey="copiedKey"
        :expandSignal="expandSignal"
        :forceExpand="forceExpand"
        @copy-path="$emit('copy-path', $event)"
        @copy-interp="$emit('copy-interp', $event)"
        @copy-textarea="$emit('copy-textarea', $event)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import type { ContextTreeEntry } from '@/utils';

export default defineComponent({
  name: 'ContextTreeNode',
  props: {
    node: {
      type: Object as PropType<ContextTreeEntry>,
      required: true,
    },
    depth: {
      type: Number,
      default: 0,
    },
    copiedKey: {
      type: String,
      default: '',
    },
    expandSignal: {
      type: Number,
      default: 0,
    },
    forceExpand: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['copy-path', 'copy-interp', 'copy-textarea'],
  data() {
    return {
      isOpen: this.forceExpand || this.depth < 1,
    };
  },
  computed: {
    isBranch(): boolean {
      return this.node.valueType === 'object' || this.node.valueType === 'array';
    },
    formattedLeaf(): string {
      if (this.node.valueType === 'null') return 'null';
      if (this.node.valueType === 'string') return `"${this.node.sample ?? ''}"`;
      return String(this.node.sample ?? '');
    },
  },
  watch: {
    forceExpand(val: boolean) {
      if (val) {
        this.isOpen = true;
      }
    },
    expandSignal(val: number) {
      if (val > 0) {
        this.isOpen = true;
      } else if (val < 0) {
        this.isOpen = this.depth < 1;
      }
    },
  },
  methods: {
    toggle() {
      this.isOpen = !this.isOpen;
    },
  },
});
</script>

<style scoped>
.ctx-tree-row {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 28px;
  padding: 3px 10px;
  border-bottom: 1px solid rgba(30, 41, 59, 0.7);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  line-height: 1.4;
}

.ctx-tree-row.is-branch {
  cursor: pointer;
}

.ctx-tree-row:hover {
  background: rgba(30, 41, 59, 0.7);
}

.ctx-tree-caret {
  width: 12px;
  flex-shrink: 0;
  color: #94a3b8;
  font-size: 11px;
  user-select: none;
}

.ctx-tree-key {
  color: #38bdf8;
  font-weight: 600;
  flex-shrink: 0;
}

.ctx-tree-colon {
  color: #64748b;
}

.ctx-tree-badge {
  display: inline-block;
  padding: 0 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}

.ctx-tree-badge.type-array {
  background: rgba(168, 85, 247, 0.18);
  color: #c084fc;
}

.ctx-tree-badge.type-object {
  background: rgba(251, 191, 36, 0.16);
  color: #fbbf24;
}

.ctx-tree-preview {
  color: #64748b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.ctx-tree-val {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.ctx-tree-val.val-string {
  color: #86efac;
}

.ctx-tree-val.val-number {
  color: #fcd34d;
}

.ctx-tree-val.val-boolean {
  color: #c084fc;
}

.ctx-tree-val.val-null {
  color: #64748b;
  font-style: italic;
}

.ctx-tree-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 5px;
  flex-shrink: 0;
}

.ctx-tree-actions .tool-btn {
  padding: 1px 7px;
  font-size: 11px;
  white-space: nowrap;
  border-radius: 4px;
  border: 1px solid #334155;
  background: #1e293b;
  color: #cbd5e1;
  cursor: pointer;
  outline: none;
}

.ctx-tree-actions .tool-btn:hover {
  border-color: #38bdf8;
  color: #e0f2fe;
}

.ctx-tree-actions .tool-btn.format-btn {
  color: #38bdf8;
  border-color: #0369a1;
  background: rgba(14, 165, 233, 0.12);
}

.ctx-tree-actions .tool-btn.is-copied {
  background: #064e3b;
  border-color: #10b981;
  color: #6ee7b7;
}
</style>
