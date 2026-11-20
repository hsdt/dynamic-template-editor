<template>
  <div class="textarea-wrapper" :style="style">
    <!-- Slot cho nhãn hoặc dùng prop label -->
    <span
      v-if="$slots['label'] || label"
      class="hs-label-span"
      ref="labelSpan"
      :style="labelStyleComputed"
    >
      <template v-if="$slots['label']">
        <slot name="label"></slot>
      </template>
      <template v-else>{{ label }}&nbsp;</template>
    </span>

    <!-- Textarea nhập -->
    <textarea
      ref="textarea"
      class="textarea-line"
      :class="{ 'textarea-line-none': !line }"
      v-model="input"
      :style="[
        wrapperLineHeightStyle,
        textareaStyleNormalized,
        {
          textIndent: ($slots['label'] || label) ? labelSpanWidth + 'px' : undefined,
          minHeight: textareaHeight + 'px',
          backgroundSize: line ? `136px ${lineHeightPx}px` : undefined
        }
      ]"
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
    style: { type: [String, Object], default: '' },
    path: { type: String, default: '' },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const normalizeValue = (val: unknown) => {
      const str = val == null ? '' : String(val)
      return props.type === 'number' ? str.replace(/[^0-9]/g, '') : str
    }

    const computePad = () => {
      const char = props.suffix.char ?? '\u00A0'
      return char.repeat(props.suffix.length || 0)
    }

    // --- Elements
    const labelSpan = ref<HTMLElement>()
    const padEnd = ref(computePad())
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

    // --- Reactive binding (keep internal ref non-nullable for helpers)
    const input = ref<string>(ensurePad(normalizeValue(props.modelValue)))
    const textarea = ref<HTMLTextAreaElement | null>(null)
    const textareaHeight = ref(20)
    const lineHeightPx = ref(20)
    const labelTopPx = ref(0)
    const textareaFontSize = ref('12pt')
    const textareaFontFamily = ref('')
    const labelSpanWidth = ref(0)
    let resizeObserver: ResizeObserver | null = null

    const extractLineHeightFromStyle = (rawStyle: unknown): string | undefined => {
      if (!rawStyle) return undefined
      if (typeof rawStyle === 'string') {
        const match = rawStyle.match(/(?:^|;)\s*line-height\s*:\s*([^;]+)/i)
        return match?.[1]?.trim() || undefined
      }
      if (typeof rawStyle === 'object' && !Array.isArray(rawStyle)) {
        const val = (rawStyle as Record<string, unknown>)['lineHeight'] ?? (rawStyle as Record<string, unknown>)['line-height']
        return val != null && String(val).trim() ? String(val).trim() : undefined
      }
      return undefined
    }

    const wrapperLineHeightStyle = computed(() => {
      const lh = extractLineHeightFromStyle(props.style)
      return lh ? { lineHeight: lh } : undefined
    })

    const labelStyleComputed = computed(() => ({
      top: `${labelTopPx.value}px`,
      lineHeight: `${lineHeightPx.value}px`,
      fontSize: textareaFontSize.value,
      ...(textareaFontFamily.value ? { fontFamily: textareaFontFamily.value } : {})
    }))

    const textareaStyleNormalized = computed(() => props.textareaStyle)

    const syncLayoutMetrics = () => {
      labelSpanWidth.value = labelSpan.value?.offsetWidth ?? 0
      if (textarea.value) {
        const computedStyle = window.getComputedStyle(textarea.value)
        const lh = parseFloat(computedStyle.lineHeight) || 20
        const padTop = parseFloat(computedStyle.paddingTop) || 0
        const borderTop = parseFloat(computedStyle.borderTopWidth) || 0
        lineHeightPx.value = lh
        labelTopPx.value = padTop + borderTop
        textareaFontSize.value = computedStyle.fontSize || '12pt'
        textareaFontFamily.value = computedStyle.fontFamily || ''

        const singleHeight = getSingleLineHeight(textarea.value)
        if (singleHeight > 0) {
          textareaHeight.value = singleHeight
        }
        autosize.update(textarea.value)
      }
    }

    const getSingleLineHeight = (el: HTMLTextAreaElement) => {
      const style = window.getComputedStyle(el)
      const lineHeight = parseFloat(style.lineHeight) || 20
      const paddingTop = parseFloat(style.paddingTop) || 0
      const paddingBottom = parseFloat(style.paddingBottom) || 0
      const borderTop = parseFloat(style.borderTopWidth) || 0
      const borderBottom = parseFloat(style.borderBottomWidth) || 0
      return Math.max(0, Math.ceil(lineHeight + paddingTop + paddingBottom + borderTop + borderBottom - 4))
    }

    // --- Init
    onMounted(() => {
      nextTick(() => {
        if (textarea.value) {
          autosize(textarea.value)
        }
        syncLayoutMetrics()
        if (typeof ResizeObserver !== 'undefined') {
          resizeObserver = new ResizeObserver(() => {
            syncLayoutMetrics()
          })
          if (labelSpan.value) resizeObserver.observe(labelSpan.value)
          if (textarea.value) resizeObserver.observe(textarea.value)
        }
      })
    })

    watch(
      [() => props.label, () => props.style, () => props.textareaStyle],
      () => {
        nextTick(() => syncLayoutMetrics())
      },
      { deep: true }
    )

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
      const nextValue = stripPad(padded)
      const currentValue = props.modelValue == null ? '' : String(props.modelValue)
      if (nextValue !== currentValue) {
        emit('update:modelValue', nextValue)
      }
      nextTick(() => {
        if (textarea.value) autosize.update(textarea.value)
      })
    })

    onUnmounted(() => {
      if (resizeObserver) {
        resizeObserver.disconnect()
        resizeObserver = null
      }
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
      lineHeightPx,
      wrapperLineHeightStyle,
      labelStyleComputed,
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
  z-index: 1;
  position: absolute;
  background: white;
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
</style>
