<template>
  <div class="datepicker-wrapper" ref="wrapperRef">
    <input
      type="text"
      class="datepicker-input"
      :placeholder="placeholder"
      v-model="displayValue"
      v-mask-datetime="format"
      @focus="openPicker"
      @click="openPicker"
      @input="onInput"
      :disabled="disabled"
      :readonly="readonly"
      autocomplete="off"
    />
  </div>
</template>

<script lang="ts">
import { ref, watch } from 'vue';
import moment from 'moment';
import mask from '../../directives/mask-datetime';
import { useDatePickerService } from '../../services/datePickerService';

export default {
  name: 'DatePicker',
  directives: { mask, 'mask-datetime': mask },
  props: {
    modelValue: { type: String, default: '' },
    format: { type: String, default: 'YYYY-MM-DD' },
    placeholder: { type: String, default: 'Chọn ngày' },
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    mode: { type: String, default: 'date' }, // 'date' | 'datetime'
    minuteStep: { type: Number, default: 5 }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const wrapperRef = ref<HTMLElement | null>(null);
    const displayValue = ref('');
    const { open, syncValue } = useDatePickerService();

    const tokenRegex = /[YyMDHhms]/;
    const literalStrippedFormat = props.format.replace(/\[[^\]]*]/g, '');
    const expectedDigits = literalStrippedFormat
      .split('')
      .reduce((acc, ch) => acc + (tokenRegex.test(ch) ? 1 : 0), 0);

    const onInput = () => {
      const masked = displayValue.value;
      const digitCount = masked.replace(/\D/g, '').length;
      const m = digitCount === expectedDigits
        ? moment(masked, props.format, true)
        : moment.invalid();
      if (m.isValid()) {
        const display = m.format(props.format);
        displayValue.value = display;
        emit('update:modelValue', m.format());
        syncValue(display, wrapperRef.value);
      }
    };

    // Khi modelValue thay đổi từ ngoài
    watch(
      () => props.modelValue,
      (val) => {
        const parsed = val
          ? moment(val).isValid()
            ? moment(val)
            : moment(val, props.format, true)
          : null;
        if (parsed && parsed.isValid()) {
          displayValue.value = parsed.format(props.format);
        } else {
          displayValue.value = '';
        }
        syncValue(displayValue.value, wrapperRef.value);
      },
      { immediate: true }
    );
    const openPicker = () => {
      if (props.disabled || props.readonly || !wrapperRef.value) return;
      open({
        anchor: wrapperRef.value,
        value: displayValue.value,
        format: props.format,
        mode: props.mode as 'date' | 'datetime',
        minuteStep: props.minuteStep,
        onSelect: (val: string) => {
          const parsed = moment(val, props.format, true).isValid()
            ? moment(val, props.format, true)
            : moment(val);
          if (parsed.isValid()) {
            const display = parsed.format(props.format);
            displayValue.value = display;
            emit('update:modelValue', parsed.format());
            syncValue(display, wrapperRef.value);
          }
        }
      });
    };

    return {
      wrapperRef,
      displayValue,
      onInput,
      openPicker
    };
  }
};

</script>

<style scoped>
.datepicker-wrapper {
  position: relative;
  display: inline-block;
  width: 200px;
}
.datepicker-input {
  width: 100%;
  padding: 2px 4px;
  font-size: 12pt;
  line-height: 20px;
  border: none;
  border-radius: 0;
  background: url(@/assets/img/icon/bg-line-textarea.png);
  background-position-y: 1px;
}
.datepicker-input:focus {
  outline: none;
  box-shadow: none;
}
</style>
