# Interpolation

## Mô tả

Interpolation là cách hiển thị dữ liệu trực tiếp trong template bằng cú pháp Vue `{{ }}`.

## Quy tắc cơ bản

- Dùng `{{ expression }}` để render text
- Nếu cần style hoặc cấu trúc, bọc expression bằng `span`, `strong`, `div` hoặc thẻ phù hợp
- Nếu cần format ngày giờ, dùng expression phù hợp với dữ liệu đang có

## Ví dụ

```vue
{{ data.hoTen }}
```

```vue
{{ moment(data.ngaySinh).format('DD/MM/YYYY') }}
```
