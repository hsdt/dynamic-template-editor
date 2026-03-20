# DatePicker

## Mô tả

`DatePicker` dùng để nhập ngày hoặc ngày giờ với định dạng tùy chỉnh. Component hỗ trợ mask nhập liệu, disabled, readonly, bước phút và nhãn bằng prop hoặc slot.

## Props

- `modelValue`: Giá trị ngày giờ hiện tại
- `format`: Định dạng ngày, ví dụ `DD/MM/YYYY` hoặc `DD/MM/YYYY HH:mm`
- `placeholder`: Placeholder hiển thị
- `disabled`: Vô hiệu hóa
- `readonly`: Chỉ đọc
- `minuteStep`: Bước phút khi chọn thời gian
- `label`: Nhãn hiển thị
- `inputStyle`: Style cho input

## Ví dụ

```vue
<DatePicker v-model="data.ngaySinh" format="DD/MM/YYYY" label="Ngày sinh" />
```

```vue
<DatePicker v-model="data.ngayGio" format="DD/MM/YYYY HH:mm" :minuteStep="15">
  <template #label>
    <b>Ngày/giờ</b>
  </template>
</DatePicker>
```

```vue
<DatePicker v-model="data.ngaySinh" disabled />
```

## Lưu ý

- Component dùng format kiểu `moment`, ví dụ `DD/MM/YYYY`
- Nếu có cả ngày và giờ, dùng format như `DD/MM/YYYY HH:mm`
