# Checkbox

## Mô tả

`Checkbox` cho phép chọn hoặc bỏ chọn một giá trị. Component hỗ trợ chế độ literal value, chế độ native boolean, disabled, readonly và hiển thị text trước hoặc sau checkbox.

## Props

- `modelValue`: Giá trị hiện tại của checkbox
- `value`: Giá trị khi được chọn
- `native`: Bật chế độ checkbox native, `modelValue` sẽ toggle kiểu Boolean
- `disabled`: Vô hiệu hóa
- `readonly`: Chỉ đọc
- `beforeText`: Text hiển thị trước checkbox
- `afterText`: Text hiển thị sau checkbox
- `size`: Kích thước `sm`, `md`, `lg`, `xl`

## Ví dụ

```vue
<Checkbox v-model="data.checked" value="yes" size="md" beforeText="Chọn" afterText="Xong" />
```

```vue
<Checkbox v-model="data.gioiTinh" :value="true" afterText="Nam" />
<Checkbox v-model="data.gioiTinh" :value="false" afterText="Nữ" />
```

```vue
<Checkbox v-model="data.isActive" native />
```
