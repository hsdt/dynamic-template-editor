<template>
  <div class="checkbox-wrapper" :class="[`size-${size}`, { disabled, readonly }]">
    <label class="checkbox-container">
      <span v-if="beforeText" class="before-text">{{ beforeText }}</span>
      <input
        ref="checkboxInput"
        type="checkbox"
        class="checkbox-input"
        :checked="modelValue === value"
        :disabled="disabled || readonly"
        @click="handleClick"
      />
      <span class="checkbox-mark"></span>
      <span v-if="afterText" class="after-text">{{ afterText }}</span>
    </label>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue'

export default {
  name: 'Checkbox',
  props: {
    modelValue: {
      type: [String, Number, Boolean, null],
      default: null
    },
    value: {
      type: [String, Number, Boolean],
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    beforeText: {
      type: String,
      default: ''
    },
    afterText: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'sm',
      validator: (value: string) => ['sm', 'md', 'lg', 'xl'].includes(value)
    }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const checkboxInput = ref<HTMLInputElement | null>(null)

    const handleClick = (e: MouseEvent) => {
      if (props.disabled || props.readonly) return
      if (props.modelValue === props.value) {
        // Uncheck: set to null
        emit('update:modelValue', null)
        emit('change', null)
      } else {
        // Check: set to value
        emit('update:modelValue', props.value)
        emit('change', props.value)
      }
    }

    return {
      checkboxInput,
      handleClick,
      emit
    }
  }
}
</script>

<style scoped lang="scss">
.checkbox-wrapper {
  display: inline-flex;
  align-items: center;
}

.checkbox-container {
  display: flex;
  align-items: center;
}

.checkbox-input {
  display: none;
}

.checkbox-mark {
  width: 20px;
  height: 20px;
  border: 1px solid black;
  background-color: #fff;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  user-select: none;
  margin: 0;
  font-size: 12pt;
  transition: border-color 0.2s;
}

.checkbox-wrapper .checkbox-mark:hover {
  border-color: #4A90E2;
}

.checkbox-input:checked + .checkbox-mark {
  border-color: #4A90E2;
}
.checkbox-input:checked + .checkbox-mark::after {
  content: 'X';
  font-family: Helvetica, Arial, sans-serif;
  position: absolute;
  color: black;
}

.checkbox-input:disabled + .checkbox-mark {
  background-color: #E5E5E5;
  border-color: #C4C4C4;
  cursor: not-allowed;
}

.checkbox-wrapper.readonly {
  pointer-events: none;
}

/* Size variants */
.checkbox-wrapper.size-xl .checkbox-mark {
  width: 24px;
  height: 24px;
  font-size: 14pt;
}
.checkbox-wrapper.size-lg .checkbox-mark {
  width: 20px;
  height: 20px;
  flex: 0 0 20px;
  font-size: 12pt;
}
.checkbox-wrapper.size-md .checkbox-mark {
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
  font-size: 10pt;
}
.checkbox-wrapper.size-sm .checkbox-mark {
  width: 12px;
  height: 12px;
  flex: 0 0 12px;
  font-size: 8pt;
}
</style>
