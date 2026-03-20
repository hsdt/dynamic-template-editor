# Overview

Guide là bộ tài liệu mới dành cho template Vue trong `template-editor`.

Guide tập trung vào cách viết template bằng component Vue và các pattern dựng giao diện thường dùng.

Nguyên tắc chính:

- Dùng component Vue như `PageA4`, `Textarea`, `Checkbox`, `DatePicker`
- Dùng `v-model`, `:modelValue`, `:items` và cú pháp Vue chuẩn
- Tách rõ nhóm component và nhóm pattern để dễ tra cứu
- Ưu tiên ví dụ ngắn, có thể dùng trực tiếp trong template

## Nhóm nội dung trong guide mới

1. Component layout: `PageA4`, `PageA5`
2. Component nhập liệu: `Textarea`, `Checkbox`, `Select`, `InputOTP`, `DatePicker`
3. Component nghiệp vụ: `Paint`, `Signature`, `IcdGroupItem`, `IcdList`
4. Pattern thay thế: text interpolation, input native, buồng giường picker

## Mục tiêu

- Giúp viết template mới đúng chuẩn
- Giúp tra cứu nhanh component và pattern đang dùng trong editor
- Giữ tài liệu gọn và tập trung hoàn toàn vào bộ component này
