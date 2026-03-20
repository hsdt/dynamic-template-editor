# Select

## Mô tả

`Select` hỗ trợ chọn một hoặc nhiều giá trị, tìm kiếm, custom `bindLabel` và `bindValue`, đồng thời có thể hiển thị nhãn bằng prop hoặc slot.

## Props

- `modelValue`: Giá trị hiện tại, có thể là `String`, `Number` hoặc `Array`
- `items`: Danh sách lựa chọn
- `bindLabel`: Tên trường hiển thị
- `bindValue`: Tên trường giá trị
- `placeholder`: Placeholder
- `multiple`: Chọn nhiều
- `disabled`: Vô hiệu hóa
- `readonly`: Chỉ đọc
- `label`: Nhãn hiển thị
- `searchByKeys`: Danh sách key để tìm kiếm ngoài label

## Ví dụ

```vue
<Select
  v-model="data.maKhoa"
  :items="data.dsKhoa"
  bindLabel="Ten"
  bindValue="Ma"
  label="Khoa"
/>
```

```vue
<Select
  v-model="data.dsChon"
  :items="data.options"
  multiple
  placeholder="Chọn nhiều"
/>
```

```vue
<Select
  v-model="data.maKhoa"
  :items="data.dsKhoa"
  bindLabel="Ten"
  bindValue="Ma"
  :searchByKeys="['MaTuDien', 'Ten']"
>
  <template #label>
    <span style="color: red;">Chọn mục</span>
  </template>
</Select>
```
