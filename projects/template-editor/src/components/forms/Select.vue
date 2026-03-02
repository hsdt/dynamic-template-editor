<template>
  <div
    class="select-wrapper"
    ref="wrapperRef"
    :class="{ disabled, readonly }"
  >
    <!-- Slot cho nhãn hoặc dùng prop label -->
    <span
      v-if="$slots['label'] || label"
      class="hs-label-span"
      ref="labelSpan"
    >
      <template v-if="$slots['label']">
        <slot name="label"></slot>
      </template>
      <template v-else>{{ label }}&nbsp;</template>
    </span>

    <!-- Input + tags -->
    <div class="input-container" @click="focusInput">
      <span class="tag" :style="{ width: ($slots['label'] || label) ? labelSpanWidth + 'px' : undefined }"></span>
      <span
        v-for="(item, i) in selectedItems"
        :key="i"
        class="tag"
      >
        {{ getItemLabel(item) }}
        <span
          v-if="!readonly && !disabled"
          class="remove"
          @click.stop="removeItem(item)"
        >❌</span>
      </span>

      <input
        ref="inputRef"
        v-model="search"
        class="input"
        :placeholder="placeholderText"
        :disabled="disabled || readonly"
        @focus="open"
      />
    </div>

    <!-- Dropdown -->
    <div v-if="isOpen" class="dropdown">
      <div
        v-for="(item, i) in filteredItems"
        :key="i"
        class="option"
        :class="{ selected: isSelected(item) }"
        @click="select(item)"
      >
        <input
          v-if="multiple"
          type="checkbox"
          :checked="isSelected(item)"
          @click.stop
        />
        {{ getItemLabel(item) }}
      </div>

      <div v-if="filteredItems.length === 0" class="empty">
        Không tìm thấy kết quả
      </div>
    </div>
  </div>
</template>


<script lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, PropType, nextTick } from 'vue';

export default {
  name: 'Select',
  props: {
    modelValue: [String, Number, Array] as PropType<any>,
    items: { type: Array as PropType<any[]>, default: () => [] },
    bindLabel: { type: String, default: '' },
    bindValue: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    multiple: Boolean,
    disabled: Boolean,
    readonly: Boolean,
    label: { type: String, default: '' },
  },
  emits: ['update:modelValue', 'search'],
  setup(props, { emit }) {
    const isOpen = ref(false);
    const search = ref('');
    const selectedItems = ref<any[]>([]);

    const wrapperRef = ref<HTMLElement | null>(null);
    const inputRef = ref<HTMLInputElement | null>(null);
    const labelSpan = ref<HTMLElement | null>(null);
    const labelSpanWidth = computed(() => labelSpan.value?.offsetWidth ?? 0);

    /* ---------------- helpers ---------------- */

    const getItemLabel = (item: any) =>
      props.bindLabel && typeof item === 'object'
        ? String(item[props.bindLabel])
        : String(item);

    const getItemValue = (item: any) =>
      props.bindValue && typeof item === 'object'
        ? item[props.bindValue]
        : item;

    const isEqual = (a: any, b: any): boolean => {
      // If bindValue is set, compare extracted values as strings
      if (props.bindValue) {
        return String(getItemValue(a)) === String(getItemValue(b));
      }
      // If both are objects and bindValue is not set, use JSON comparison
      if (typeof a === 'object' && a !== null && typeof b === 'object' && b !== null) {
        return JSON.stringify(a) === JSON.stringify(b);
      }
      // Otherwise compare as primitives
      return String(a) === String(b);
    };

    const isSelected = (item: any) =>
      selectedItems.value.some(s => isEqual(s, item));

    /* ---------------- computed ---------------- */

    const filteredItems = computed(() => {
      if (!search.value.trim()) return props.items;
      const q = search.value.toLowerCase();
      return props.items.filter(i =>
        getItemLabel(i).toLowerCase().includes(q)
      );
    });

    const placeholderText = computed(() =>
      selectedItems.value.length === 0
        ? props.placeholder || 'Chọn...'
        : ''
    );

    /* ---------------- actions ---------------- */

    const open = () => {
      if (!props.disabled && !props.readonly) isOpen.value = true;
    };

    const focusInput = () => {
      open();
      inputRef.value?.focus();
    };

    const select = (item: any) => {
      if (props.disabled || props.readonly) return;

      if (props.multiple) {
        if (isSelected(item)) {
          selectedItems.value = selectedItems.value.filter(
            s => !isEqual(s, item)
          );
        } else {
          selectedItems.value.push(item);
        }
      } else {
        selectedItems.value = [item];
        isOpen.value = false;
      }

      syncModel();
      nextTick(() => inputRef.value?.focus());
    };

    const removeItem = (item: any) => {
      selectedItems.value = selectedItems.value.filter(
        s => !isEqual(s, item)
      );
      syncModel();
    };

    const syncModel = () => {
      emit(
        'update:modelValue',
        props.multiple
          ? selectedItems.value.map(getItemValue)
          : getItemValue(selectedItems.value[0] || '')
      );
    };

    /* ---------------- outside click ---------------- */

    const onClickOutside = (e: MouseEvent) => {
      if (!wrapperRef.value?.contains(e.target as Node)) {
        isOpen.value = false;
      }
    };

    /* ---------------- sync from v-model ---------------- */

    const initSelected = () => {
      selectedItems.value = [];

      if (props.multiple && Array.isArray(props.modelValue)) {
        selectedItems.value = props.items.filter(i =>
          props.modelValue.some((v: any) => isEqual(i, v))
        );
      }

      if (!props.multiple && props.modelValue != null) {
        const found = props.items.find(
          i => isEqual(i, props.modelValue)
        );
        if (found) selectedItems.value = [found];
      }
    };

    watch(() => props.modelValue, initSelected);
    watch(() => props.items, initSelected);
    watch(search, (value) => {
      emit('search', {
        term: value,
        items: filteredItems.value
      });
    });

    onMounted(() => {
      initSelected();
      document.addEventListener('mousedown', onClickOutside);
    });

    onBeforeUnmount(() => {
      document.removeEventListener('mousedown', onClickOutside);
    });

    return {
      isOpen,
      search,
      selectedItems,
      filteredItems,
      wrapperRef,
      inputRef,
      labelSpan,
      labelSpanWidth,
      getItemLabel,
      getItemValue,
      isSelected,
      select,
      removeItem,
      focusInput,
      open,
      placeholderText,
    };
  },
};
</script>


<style scoped>
.select-wrapper {
  position: relative;
  font-size: 12pt;
}

.input-container {
  border-radius: 4px;
  padding: 4px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  cursor: text;
}

.hs-label-span {
  position: absolute;
  background: white;
  line-height: 1;
  bottom: calc(100% - 20px);
}

.input-container {
  background: url(@/assets/img/icon/bg-line-textarea.png);
  background-position-y: 1px;
  border: none;
  line-height: 18px;
  font-size: 12pt;
  color: #00a;
}

.input-container:focus-within {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24,144,255,.2);
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 1px;
  border-radius: 2px;
  transform: translateY(-2px);
}

.remove {
  margin-left: 2px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.12s ease;
  pointer-events: none;
  font-size: 8px;
}

.tag:hover .remove {
  opacity: 1;
  pointer-events: auto;
}

.input {
  border: none;
  outline: none;
  flex: 1;
  min-width: 100px;
  background-color: transparent;
  transform: translateY(-2px);
  line-height: 19px;
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #d9d9d9;
  max-height: 240px;
  overflow: auto;
  z-index: 10;
}

.option {
  padding: 6px 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.option:hover {
  background: #f5f5f5;
}

.option.selected {
  background: #e6f7ff;
}

.empty {
  padding: 10px;
  color: #999;
  text-align: center;
}
</style>

