<template>
  <div class="textarea-wrapper" :style="style">
    <!-- Nhãn -->
    <span
      class="hs-label-span"
      :style="labelStyle"
      ref="labelSpan"
      v-html="label ? label + '&nbsp;' : ''"
    ></span>

    <!-- Textarea nhập -->
    <textarea
      ref="textarea"
      class="textarea-line no-print"
      :class="{ 'textarea-line-none': !line }"
      v-model="input"
      :style="[textareaStyleNormalized, { textIndent: labelSpanWidth + 'px', minHeight: input ? undefined : textareaHeight + 'px' }]"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxlength"
      :rows="rows"
      spellcheck="false"
      @keydown="setCaretPosition"
      @click="setCaretPosition"
      @select="limitSelection"
    ></textarea>

    <!-- Bản in -->
    <template v-if="!input">
      <div
        class="textarea-line yes-print"
        :style="[textareaStyleNormalized, { textIndent: labelSpanWidth + 'px', height: textareaHeight + 'px' }]"
      ></div>
    </template>
    <template v-else>
      <div
        v-for="(lineText, i) in splitString(input)"
        :key="i"
        class="textarea-line yes-print"
        :style="[textareaStyleNormalized, { textIndent: i === 0 ? labelSpanWidth + 'px' : '0px' }]"
      >
        {{ lineText }}
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted, PropType } from 'vue'
// @ts-ignore
import autosize from 'autosize'

export default {
  name: 'HsTextarea',
  props: {
    modelValue: { type: String as PropType<string | null>, default: null },
    type: { type: String as PropType<'text' | 'number'>, default: 'text' },
    label: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    maxlength: { type: [Number, String], default: 2000 },
    rows: { type: Number, default: 1 },
    line: { type: Boolean, default: true },
    suffix: {
      type: Object as PropType<{ length?: number; char?: string }>,
      default: () => ({ length: 0, char: '\u00A0' })
    },
    textareaStyle: { type: [String, Object], default: '' },
    labelStyle: { type: [String, Object], default: '' },
    style: { type: [String, Object], default: '' }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    // --- Reactive binding (keep internal ref non-nullable for helpers)
    const input = ref<string>(props.modelValue ?? '')
    const textarea = ref<HTMLTextAreaElement | null>(null)

    // --- Elements
    const labelSpan = ref<HTMLElement>()
    const padEnd = ref('')
    const textareaHeight = ref(20)

    const labelSpanWidth = computed(() => labelSpan.value?.offsetWidth ?? 0)
    const textareaStyleNormalized = computed(() => props.textareaStyle)

    const normalizeValue = (val: string) =>
      props.type === 'number' ? (val ?? '').replace(/[^0-9]/g, '') : val ?? ''

    const computePad = () => {
      const char = props.suffix.char ?? '\u00A0'
      return char.repeat(props.suffix.length || 0)
    }
    const ensurePad = (val: string) => {
      const pad = padEnd.value
      if (!pad) return val
      return val.endsWith(pad) ? val : val + pad
    }
    const stripPad = (val: string) => {
      const pad = padEnd.value
      if (!pad) return val
      return val.endsWith(pad) ? val.slice(0, -pad.length) : val
    }

    // --- Init
    onMounted(() => {
      padEnd.value = computePad()
      input.value = ensurePad(normalizeValue(props.modelValue ?? ''))
      nextTick(() => {
        textareaHeight.value = textarea.value?.offsetHeight ?? 20
        if (textarea.value) autosize(textarea.value)
      })
    })

    watch(
      () => props.suffix,
      () => {
        padEnd.value = computePad()
        input.value = ensurePad(normalizeValue(stripPad(input.value)))
        nextTick(() => setCaretPosition())
      },
      { deep: true }
    )

    // --- Watch: external -> internal
    watch(
      () => props.modelValue,
      newVal => {
        const padded = ensurePad(normalizeValue(newVal ?? ''))
        if (padded !== input.value) {
          input.value = padded
        }
      }
    )

    // --- Watch: internal -> emit
    watch(input, newVal => {
      const padded = ensurePad(normalizeValue(stripPad(newVal ?? '')))
      if (padded !== newVal) {
        input.value = padded
        nextTick(() => setCaretPosition())
        return
      }
      emit('update:modelValue', stripPad(padded))
      nextTick(() => {
        textareaHeight.value = textarea.value?.offsetHeight ?? textareaHeight.value
        if (textarea.value) autosize.update(textarea.value)
      })
    })

    onUnmounted(() => {
      if (textarea.value) autosize.destroy(textarea.value)
    })

    // --- Caret control
    const setCaretPosition = () => {
      const el = textarea.value
      if (!el) return
      const caret = el.selectionStart
      const actualLength = stripPad(el.value).length
      if (caret > actualLength) el.setSelectionRange(actualLength, actualLength)
    }

    const limitSelection = () => {
      const el = textarea.value
      if (!el) return
      const start = el.selectionStart
      const end = el.selectionEnd
      const actualLength = stripPad(el.value).length
      const maxLen = actualLength - start
      if (end - start > maxLen) el.setSelectionRange(start, start + maxLen)
    }

    const splitString = (val: string) => val?.split('\n') ?? []

    return {
      input,
      textarea,
      labelSpan,
      labelSpanWidth,
      textareaHeight,
      textareaStyleNormalized,
      setCaretPosition,
      limitSelection,
      splitString
    }
  }
};
</script>

<style scoped>
.textarea-wrapper {
  display: block;
  width: 100%;
  position: relative;
  height: auto;
}
.textarea-line-none {
  background: none !important;
}
.hs-label-span {
  position: absolute;
  background: white;
  line-height: 1;
  bottom: calc(100% - 20px);
  left: 0;
}
.textarea-line {
  outline: none;
  background: url(@/assets/img/icon/bg-line-textarea.png);
  background-position-y: 1px;
  border: none;
  line-height: 20px;
  font-size: 12pt;
  width: 100%;
  color: #00a;
  resize: none;
  display: block;
  overflow: hidden;
}
.textarea-line.yes-print {
  white-space: pre-wrap;
  padding: 2px;
  display: none;
}
@media print {
  .no-print {
    display: none !important;
  }
  .yes-print {
    display: block !important;
  }
}
</style>
