# Native Input

## Mô tả

Native input là cách dùng trực tiếp thẻ `input` của HTML trong template Vue.

## Quy tắc cơ bản

- Đặt `v-model` trực tiếp lên `input`
- Có thể bọc trong `div` để kiểm soát layout nếu cần
- Dùng đúng `type` theo nhu cầu nhập liệu

## Ví dụ

```vue
<div>
  <input type="text" v-model="data.email" />
</div>
```

```vue
<div>
  <input type="checkbox" v-model="data.isActive" />
</div>
```
