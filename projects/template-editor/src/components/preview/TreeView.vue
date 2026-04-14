<template>
  <ul class="tree-view">
    <template v-for="(value, key) in data">
      <li v-if="key === '#text'" :key="key + '-text'">
        <span
          v-if="typeof value === 'string' && value.length > 80"
          class="tree-value-block"
          >{{ value }}</span
        >
        <span v-else class="tree-value">{{ value }}</span>
      </li>
      <template v-else-if="Array.isArray(value)">
        <li v-for="(item, idx) in value" :key="key + '-' + idx">
          <span @click="toggle(key + '-' + idx)" class="tree-key">
            <span class="arrow" :class="{ open: isOpen(key + '-' + idx) }"
              >▶</span
            >
            &lt;{{ key }}&gt;
          </span>
          <template v-if="isOpen(key + '-' + idx)">
            <TreeView :data="item" />
            <span class="tree-key tree-close">&lt;/{{ key }}&gt;</span>
          </template>
          <template v-else>
            <div class="tree-collapsed">
              ...<br />
              <span class="tree-key tree-close">&lt;/{{ key }}&gt;</span>
            </div>
          </template>
        </li>
      </template>
      <li v-else-if="isObject(value)" :key="key + '-obj'">
        <template v-if="Object.keys(value).length === 0">
          <span class="tree-key">&lt;{{ key }}/&gt;</span>
        </template>
        <template v-else-if="Object.keys(value).length === 1 && value['#text']">
          <span class="tree-key">&lt;{{ key }}&gt;</span>
          <span class="tree-value">{{ value['#text'] }}</span>
          <span class="tree-key tree-close">&lt;/{{ key }}&gt;</span>
        </template>
        <template v-else>
          <span @click="toggle(key)" class="tree-key">
            <span class="arrow" :class="{ open: isOpen(key) }">▶</span>
            &lt;{{ key }}&gt;
          </span>
          <template v-if="isOpen(key)">
            <TreeView :data="value" />
            <span class="tree-key tree-close">&lt;/{{ key }}&gt;</span>
          </template>
          <template v-else>
            <div class="tree-collapsed">
              ...<br />
              <span class="tree-key tree-close">&lt;/{{ key }}&gt;</span>
            </div>
          </template>
        </template>
      </li>
      <li v-else :key="key + '-val'">
        <span class="tree-key">&lt;{{ key }}&gt;:</span>
        <span
          v-if="typeof value === 'string' && value.length > 80"
          class="tree-value-block"
          >{{ value }}</span
        >
        <span v-else class="tree-value">{{ value }}</span>
      </li>
    </template>
  </ul>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "TreeView",
  props: {
    data: { type: [Object, Array], required: true },
  },
  setup(props) {
    const openKeys = ref<Record<string, boolean>>({});
    const isObject = (val: any) =>
      val && typeof val === "object" && !Array.isArray(val);
    const isOpen = (key: string | number) => openKeys.value[String(key)];
    const toggle = (key: string | number) => {
      const k = String(key);
      openKeys.value[k] = !openKeys.value[k];
    };
    return { isObject, isOpen, toggle };
  },
});
</script>

<style scoped>
.tree-view {
  list-style: none;
  padding-left: 18px;
  font-family: "Fira Mono", "Consolas", "Menlo", "Monaco", monospace;
  font-size: 16px;
}
.tree-key {
  cursor: pointer;
  color: #8e24aa;
  user-select: none;
  font-weight: 500;
  transition: color 0.2s;
}
.tree-value {
  color: #333;
}
.arrow {
  display: inline-block;
  width: 1em;
  color: #888;
  transition:
    transform 0.2s,
    color 0.2s;
  vertical-align: middle;
  margin-right: 2px;
  font-size: 1em;
}
.arrow.open {
  transform: rotate(90deg);
  color: #8e24aa;
}
.tree-key {
  display: inline-flex;
  align-items: center;
}
.tree-value-block {
  display: block;
  background: #f8f8f8;
  color: #444;
  border-radius: 4px;
  padding: 8px;
  margin: 4px 0 4px 16px;
  font-family: inherit;
  font-size: 15px;
  white-space: pre-wrap;
  overflow-x: auto;
  max-width: 100%;
}
</style>
