# Textarea

## Mô tả

`Textarea` dùng cho cả input một dòng và nhiều dòng trong guide. Component hỗ trợ nhãn bằng prop hoặc slot, placeholder, readonly, disabled, số dòng, dòng kẻ và padding ký tự cuối.

## Props

- `modelValue`: Giá trị hiện tại, kiểu `String`
- `type`: Kiểu nhập, `'text'` hoặc `'number'`
- `label`: Nhãn hiển thị
- `placeholder`: Placeholder
- `disabled`: Vô hiệu hóa
- `readonly`: Chỉ đọc
- `maxlength`: Độ dài tối đa
- `rows`: Số dòng mặc định
- `line`: Hiển thị dòng kẻ
- `suffix`: Đối tượng `{ length, char }` để pad cuối chuỗi
- `textareaStyle`: Style cho vùng nhập
- `style`: Style cho wrapper

## Ví dụ

```vue
<Textarea v-model="data.hoTen" label="Họ tên" type="text" />
```

```vue
<Textarea v-model="data.ghiChu" label="Ghi chú" rows="3" maxlength="500" />
```

```vue
<Textarea v-model="data.noiDung" :suffix="{ length: 5, char: '_' }">
  <template #label>
    <span style="color: blue;">Nội dung</span>
  </template>
</Textarea>
```
