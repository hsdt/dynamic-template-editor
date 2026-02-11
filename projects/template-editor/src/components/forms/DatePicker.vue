<template>
  <div class="datepicker-wrapper" ref="wrapperRef">
    <input
      ref="inputRef"
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
    const inputRef = ref<HTMLInputElement | null>(null);
    const displayValue = ref('');
    const selectedMoment = ref<moment.Moment | null>(null);
    const { open, syncValue } = useDatePickerService();

    const tokenRegex = /[YyMDHhms]/;
    const expectedDigits = props.format.split('').reduce((acc, ch) => acc + (tokenRegex.test(ch) ? 1 : 0), 0);

    const onInput = () => {
      const masked = displayValue.value;
      const digitCount = masked.replace(/\D/g, '').length;
      const m = digitCount === expectedDigits
        ? moment(masked, props.format, true)
        : moment.invalid();
      if (m.isValid()) {
        selectedMoment.value = m;
        emit('update:modelValue', m.format(props.format));
        syncValue(displayValue.value, wrapperRef.value);
      }
    };

    // Khi modelValue thay đổi từ ngoài
    watch(
      () => props.modelValue,
      (val) => {
        const parsed = val
          ? moment(val, props.format, true).isValid()
            ? moment(val, props.format, true)
            : moment(val)
          : null;
        if (parsed && parsed.isValid()) {
          selectedMoment.value = parsed;
          displayValue.value = parsed.format(props.format);
        } else {
          selectedMoment.value = null;
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
          displayValue.value = val;
          emit('update:modelValue', val);
        }
      });
    };

    return {
      wrapperRef,
      inputRef,
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
  padding: 6px 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
