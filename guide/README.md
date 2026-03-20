# Guide

Guide này là tài liệu dành cho bộ component Vue trong `template-editor`.

Mục tiêu của guide:

- Hướng dẫn viết template cho bộ component Vue mới trong `template-editor`
- Chuẩn hóa cách dùng component và pattern trong template
- Cung cấp ví dụ ngắn gọn, trực tiếp theo đúng cú pháp Vue

## Guide này dùng khi nào

- Khi tạo template mới cho editor
- Khi cần tra cứu nhanh props và ví dụ sử dụng component
- Khi cần dựng layout và pattern thường dùng trong template

## Nội dung chính

1. Overview: bối cảnh và nguyên tắc dùng guide mới
2. Components: tài liệu cho từng component
3. Patterns: các pattern thường dùng trong template

## Ví dụ ngắn

```vue
<PageA4 style="padding: 3mm 15mm;">
  <div>Họ tên: {{ data.hoTen }}</div>
  <Textarea v-model="data.diaChi" label="Địa chỉ" />
  <Checkbox v-model="data.gioiTinh" :value="true" afterText="Nam" />
  <Checkbox v-model="data.gioiTinh" :value="false" afterText="Nữ" />
  <DatePicker v-model="data.ngaySinh" format="DD/MM/YYYY" label="Ngày sinh" />
</PageA4>
```
