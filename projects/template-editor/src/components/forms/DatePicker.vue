<template>
  <div class="datepicker-wrapper" ref="wrapperRef">
    <input
      ref="inputRef"
      type="text"
      class="datepicker-input"
      :placeholder="placeholder"
      v-model="displayValue"
      v-mask="format"
      @click="showPicker = true"
      @input="onInput"
      @blur="onBlur"
      :disabled="disabled"
      :readonly="readonly"
      autocomplete="off"
    />
    <div
      v-if="showPicker"
      class="datepicker-popup"
      @mousedown.stop
      ref="popupRef"
      :style="popupStyle"
    >
      <div class="calendar-header">
        <button type="button" class="calendar-nav" @click="prevMonth">&#60;</button>
        <span class="calendar-label">
          <select :value="calendarMonth" @change="onMonthChange($event)">
            <option v-for="(m, i) in 12" :key="i" :value="i">{{ moment().month(i).format('MM') }}</option>
          </select>
          <select :value="calendarYear" @change="onYearChange($event)">
            <option v-for="y in yearRange" :key="y" :value="y">{{ y }}</option>
          </select>
        </span>
        <button type="button" class="calendar-nav" @click="nextMonth">&#62;</button>
      </div>
      <table class="calendar-table">
        <thead>
          <tr>
            <th v-for="d in 7" :key="d">{{ moment().weekday(d % 7).format('dd') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(week, wIdx) in weeks" :key="wIdx">
            <td v-for="(day, dIdx) in week" :key="dIdx">
              <button
                :class="[
                  'calendar-day',
                  { selected: isSelected(day), today: isToday(day), outsideMonth: isOutside(day) }
                ]"
                @mousedown.prevent="selectDay(day)"
              >{{ day.date() }}</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="isDateTime" class="time-row">
        <label class="time-field">
          <span>Giờ</span>
          <select :value="hours" @change="onHourChange($event)">
            <option v-for="h in 24" :key="h" :value="h - 1">{{ String(h - 1).padStart(2, '0') }}</option>
          </select>
        </label>
        <label class="time-field">
          <span>Phút</span>
          <select :value="minutes" @change="onMinuteChange($event)">
            <option v-for="m in minuteOptions" :key="m" :value="m">{{ String(m).padStart(2, '0') }}</option>
          </select>
        </label>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, watch, computed, nextTick, onMounted, onBeforeUnmount } from 'vue';
import moment from 'moment';
import mask from '../../directives/mask';

export default {
  name: 'DatePicker',
  directives: { mask },
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
    const showPicker = ref(false);
    const wrapperRef = ref<HTMLElement | null>(null);
    const inputRef = ref<HTMLInputElement | null>(null);
    const popupRef = ref<HTMLDivElement | null>(null);
    const popupStyle = ref<Record<string, string>>({});
    const displayValue = ref('');
    const calendarMonth = ref(moment().month());
    const calendarYear = ref(moment().year());
    const selectedMoment = ref<moment.Moment | null>(null);
    const pointerInside = ref(false);
    const isDateTime = computed(() => props.mode === 'datetime');
    const tokenRegex = computed(() => isDateTime.value ? /[YyMDHhms]/ : /[YyMD]/);
    const expectedDigits = computed(() => props.format.split('').reduce((acc, ch) => acc + (tokenRegex.value.test(ch) ? 1 : 0), 0));

    const minuteOptions = computed(() => {
      const step = Math.max(1, Math.min(60, props.minuteStep));
      const result: number[] = [];
      for (let m = 0; m < 60; m += step) result.push(m);
      if (!result.includes(59)) result.push(59);
      return result;
    });

    const hours = ref(moment().hours());
    const minutes = ref(moment().minutes());

    // Năm hiển thị
    // Dải năm trượt theo năm đang hiển thị (21 năm quanh calendarYear)
    const yearRange = computed(() => {
      const center = calendarYear.value;
      const start = center - 10;
      return Array.from({ length: 21 }, (_, i) => start + i);
    });

    const onInput = () => {
      const masked = displayValue.value;
      const digitCount = masked.replace(/\D/g, '').length;
      const m = digitCount === expectedDigits.value
        ? moment(masked, props.format, true)
        : moment.invalid();
      if (m.isValid()) {
        selectedMoment.value = m;
        if (isDateTime.value) {
          hours.value = m.hours();
          minutes.value = m.minutes();
        }
        emit('update:modelValue', m.format(props.format));
        calendarMonth.value = m.month();
        calendarYear.value = m.year();
      }
    };

    const updateFromParts = () => {
      if (!isDateTime.value) return;
      const base = selectedMoment.value ? selectedMoment.value.clone() : moment();
      base.hours(hours.value).minutes(minutes.value);
      displayValue.value = base.format(props.format);
      selectedMoment.value = base;
      emit('update:modelValue', displayValue.value);
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
          calendarMonth.value = parsed.month();
          calendarYear.value = parsed.year();
          if (isDateTime.value) {
            hours.value = parsed.hours();
            minutes.value = parsed.minutes();
          }
        } else {
          selectedMoment.value = null;
          displayValue.value = '';
        }
      },
      { immediate: true }
    );

    // Ẩn popup khi blur, nhưng giữ mở nếu click/focus vẫn trong wrapper
    const onBlur = () => {
      nextTick(() => {
        if (pointerInside.value) {
          pointerInside.value = false;
          return;
        }
        const wrapper = wrapperRef.value;
        const active = document.activeElement;
        if (!wrapper || !active || !wrapper.contains(active)) {
          showPicker.value = false;
        }
      });
    };

    const markPointerInside = (e: MouseEvent) => {
      const wrapper = wrapperRef.value;
      const target = e.target as Node | null;
      pointerInside.value = Boolean(wrapper && target && wrapper.contains(target));
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (!showPicker.value) return;
      const wrapper = wrapperRef.value;
      const target = e.target as Node | null;
      if (wrapper && target && !wrapper.contains(target)) {
        showPicker.value = false;
      }
    };

    const positionPopup = () => {
      if (!showPicker.value) return;
      const wrapper = wrapperRef.value;
      const popup = popupRef.value;
      if (!wrapper || !popup) return;

      const wrapperRect = wrapper.getBoundingClientRect();
      const popupRect = popup.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const gap = 6;
      const placeBelow = wrapperRect.bottom + gap + popupRect.height <= viewportH;
      const top = placeBelow ? wrapperRect.height + gap : -(popupRect.height + gap);

      popupStyle.value = {
        top: `${top}px`,
        left: '0px'
      };
    };

    onMounted(() => {
      document.addEventListener('mousedown', markPointerInside, true);
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', positionPopup, true);
      window.addEventListener('resize', positionPopup);
    });

    onBeforeUnmount(() => {
      document.removeEventListener('mousedown', markPointerInside, true);
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', positionPopup, true);
      window.removeEventListener('resize', positionPopup);
    });

    // Tạo lịch tháng
    const weeks = computed(() => {
      const first = moment().year(calendarYear.value).month(calendarMonth.value).startOf('month');
      const last = moment().year(calendarYear.value).month(calendarMonth.value).endOf('month');
      const start = first.clone().startOf('week');
      const end = last.clone().endOf('week');
      const days: Array<moment.Moment> = [];
      let day = start.clone();
      while (day.isBefore(end) || day.isSame(end, 'day')) {
        days.push(day.clone());
        day.add(1, 'day');
      }
      const weeks: Array<Array<moment.Moment>> = [];
      for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7));
      }
      return weeks;
    });

    // Chọn ngày
    const selectDay = (day: moment.Moment) => {
      const base = isDateTime.value
        ? day.clone().hours(hours.value).minutes(minutes.value)
        : day;
      selectedMoment.value = base;
      displayValue.value = base.format(props.format);
      emit('update:modelValue', displayValue.value);
      showPicker.value = false;
    };

    // Kiểm tra ngày đang chọn
    const isSelected = (day: moment.Moment) => {
      return Boolean(selectedMoment.value && selectedMoment.value.isSame(day, 'day'));
    };
    // Kiểm tra ngày hôm nay
    const isToday = (day: moment.Moment) => {
      return moment().isSame(day, 'day');
    };

    const isOutside = (day: moment.Moment) => {
      return day.month() !== calendarMonth.value;
    };

    // Chuyển tháng
    const prevMonth = () => {
      if (calendarMonth.value === 0) {
        calendarMonth.value = 11;
        calendarYear.value--;
      } else {
        calendarMonth.value--;
      }
    };
    const nextMonth = () => {
      if (calendarMonth.value === 11) {
        calendarMonth.value = 0;
        calendarYear.value++;
      } else {
        calendarMonth.value++;
      }
    };

    // Xử lý đổi tháng/năm từ select
    const onMonthChange = (e: Event) => {
      const val = Number((e.target as HTMLSelectElement).value);
      calendarMonth.value = val;
    };
    const onYearChange = (e: Event) => {
      const val = Number((e.target as HTMLSelectElement).value);
      calendarYear.value = val;
    };

    const onHourChange = (e: Event) => {
      hours.value = Number((e.target as HTMLSelectElement).value);
      updateFromParts();
    };

    const onMinuteChange = (e: Event) => {
      minutes.value = Number((e.target as HTMLSelectElement).value);
      updateFromParts();
    };

    watch(showPicker, async (val) => {
      if (val) {
        await nextTick();
        positionPopup();
      }
    });

    return {
      showPicker,
      wrapperRef,
      inputRef,
      popupRef,
      popupStyle,
      displayValue,
      calendarMonth,
      calendarYear,
      yearRange,
      weeks,
      selectDay,
      isSelected,
      isToday,
      isOutside,
      prevMonth,
      nextMonth,
      onMonthChange,
      onYearChange,
      onInput,
      onBlur,
      onHourChange,
      onMinuteChange,
      hours,
      minutes,
      minuteOptions,
      isDateTime,
      moment
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
  .datepicker-popup {
    position: absolute;
    top: 110%;
    left: 0;
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    padding: 8px;
    z-index: 10;
  }
  .calendar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;
  }
  .calendar-label {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .calendar-label select {
    margin: 0 2px;
    font-size: 14px;
    padding: 2px 4px;
    min-width: 56px;
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 4px;
    appearance: auto;
    color: #222;
    scrollbar-width: thin;
    scrollbar-color: #0a6cff #f2f6ff;
  }
  .calendar-label select::-webkit-scrollbar {
    width: 2px;
  }
  .calendar-label select::-webkit-scrollbar-track {
    background: #f2f6ff;
  }
  .calendar-label select::-webkit-scrollbar-thumb {
    background: #0a6cff;
    border-radius: 999px;
  }
  .calendar-label select::-webkit-scrollbar-thumb:hover {
    background: #0857cc;
  }
  .calendar-nav {
    background: #97c1ff;
    border: 1px solid #0a6cff;
    color: #fff;
    font-size: 14px;
    cursor: pointer;
    padding: 4px 10px;
    border-radius: 6px;
    transition: transform 0.1s ease, box-shadow 0.15s ease, background 0.15s ease;
  }
  .calendar-nav:hover {
    background: #3d8bff;
    border-color: #085ad1;
    box-shadow: 0 2px 6px rgba(8, 90, 209, 0.25);
  }
  .calendar-nav:active {
    transform: translateY(1px);
    box-shadow: 0 1px 3px rgba(8, 90, 209, 0.35);
  }
  .calendar-table {
    width: 100%;
    border-collapse: collapse;
    text-align: center;
    font-size: 14px;
  }
  .calendar-table th {
    color: #888;
    font-weight: 500;
    padding: 2px 0;
  }
  .calendar-table td {
    padding: 0;
  }
  .calendar-day {
    width: 28px;
    height: 28px;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: 4px;
    margin: 1px;
    font-size: 14px;
    transition: background 0.15s;
  }
  .calendar-day.selected {
    background: #409ffd;
    color: #fff;
  }
  .calendar-day.today {
    border: 1px solid #0066cc;
  }
  .calendar-day:hover {
    background: #e6f0fa;
  }
  .calendar-day.outsideMonth {
    color: #aaa;
  }
  .time-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
    gap: 8px;
  }
  .time-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 13px;
    color: #333;
  }
  .time-field select {
    padding: 4px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
    background: #fff;
    scrollbar-width: thin;
    scrollbar-color: #0a6cff #f2f6ff;
  }
  .time-field select::-webkit-scrollbar {
    width: 2px;
  }
  .time-field select::-webkit-scrollbar-track {
    background: #f2f6ff;
  }
  .time-field select::-webkit-scrollbar-thumb {
    background: #0a6cff;
    border-radius: 999px;
  }
  .time-field select::-webkit-scrollbar-thumb:hover {
    background: #0857cc;
  }
</style>
