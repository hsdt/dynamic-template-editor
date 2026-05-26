---
name: generate-template-from-shape-text
description: Generate Vue template from medical form shape descriptions written with characters instead of images
---

# Skill: Generate Template from Shape Text

## Mục đích
Skill này giúp AI phân tích mô tả biểu mẫu y tế bằng ký tự (ASCII/text sketch) và tạo template Vue tương ứng sử dụng các component có sẵn.

## Quy tắc chung
1. **Strict visibility rule** - Chỉ tạo nội dung xuất hiện rõ ràng trong mô tả ký tự, không suy diễn thêm.
2. **Chỉ trả về template Vue** - không kèm script, style, hoặc logic JS/TS.
3. **Sử dụng component có sẵn** - tham khảo [component-mapping.md](component-mapping.md), [shape-patterns.md](shape-patterns.md), [template-capture/manifest.json](template-capture/manifest.json).
4. **Layout Rules** - giữ đúng bố cục và thứ tự theo mô tả ký tự, ưu tiên flex/grid khi phù hợp.
5. **Data Binding Rules** - chỉ dùng path dạng `data.TenTruong` (không dùng `hsBenhAn`, `context`, `data.obj.field`).
6. **Không tạo file tool** - chỉ generate template string, không viết script automation.

---

## Định dạng input được hỗ trợ

Input có thể là một hoặc nhiều khối văn bản mô tả giao diện bằng ký tự, ví dụ:

```text
================ PHIẾU KHÁM ================
Họ tên: ______________________   Năm sinh: __/__/____
Địa chỉ: ____________________________________________

[ ] Cấp cứu   [ ] Bán cấp   [ ] Khám thường

Chẩn đoán: ...........................................
```

Hoặc:

```text
+------------------------------------------+
| Bệnh chính: [ICD] ________  Tên: _______ |
| Bệnh kèm theo: [ICD LIST]               |
+------------------------------------------+
```

---

## Quy trình phân tích mô tả ký tự

### Bước 1: Phân tích cấu trúc tổng thể
- Xác định phạm vi nội dung text được cung cấp: chỉ convert trong phạm vi này.
- Xác định loại trang: A4, A5 (nếu mô tả có nhắc; nếu không thì mặc định A4).
- Xác định hướng trang: portrait/landscape nếu có dấu hiệu trong mô tả.
- Nhận diện các block: header, body, footer chỉ khi mô tả thể hiện rõ.
- Không tự thêm các phần thường gặp nếu mô tả không có.

### Bước 2: Mapping ký tự sang component
Được ưu tiên theo [shape-patterns.md](shape-patterns.md):

- `[ ]` hoặc `☐` -> `Checkbox`
- `__/__/____` hoặc `Ngày ... tháng ... năm ...` -> `DatePicker`
- `________` hoặc `........` -> `Textarea` (`line :rows="1"`)
- `[v]`, `▼`, `... (chon)` -> `Select`
- `[ ][ ][ ]` (nhiều ô nhỏ liền nhau) -> `InputOTP`
- `[ICD]` / `[ICD LIST]` / `Bệnh chính:` / `Bệnh kèm theo:` -> `IcdGroupItem` hoặc `IcdList`
- `[SIGN]` / `Ký tên` / `Bác sĩ` / `Người bệnh` -> `Signature`
- Khung trống có viền để viết/vẽ -> `Paint`

### Bước 3: Xác định data binding paths
- Chỉ dùng 1 lớp: `data.TenTruong`
- Cấm tuyệt đối: `hsBenhAn.*`, `BenhNhan.*`, `context.*`, `data.obj.field`, bất kỳ path lồng nhau nào.
- Đặt tên field theo nhãn gần nhất trong mô tả text.

### Bước 4: Tạo template structure

```vue
<PageA4 style="padding:20px; font-size:12pt">
  <!-- Header chỉ nếu có trong mô tả -->
  <div>
    <!-- Nội dung header -->
  </div>

  <!-- Body -->
  <div>
    <!-- Form fields -->
  </div>

  <!-- Footer chỉ nếu có trong mô tả -->
  <div>
    <!-- Chữ ký / thông tin cuối trang -->
  </div>
</PageA4>
```

---

## Layout Rules từ mô tả ký tự

1. Các dòng cùng hàng trong sketch -> cùng `display:flex` hoặc cùng một row grid.
2. Ký tự canh cột (`|`) -> ưu tiên grid/flex có cột canh thẳng.
3. Đường viền (`+---+`, `| |`) -> wrapper `div` có border.
4. Khoảng trắng giữa các cụm text -> `gap` hoặc chia cột hợp lý.
5. Tiêu đề viết hoa, can giữa trong mô tả -> text center, font-weight đậm.

---

## Component Rules quan trọng

1. `Textarea` 1 dòng: luôn ưu tiên `line :rows="1"`.
2. Không dùng `:suffix` cho `Textarea` trong bất kỳ trường hợp nào.
3. Checkbox có text bên phải: ưu tiên `afterText`.
4. Ưu tiên dùng prop `label` của component khi field đứng độc lập theo dòng.
5. Chỉ dùng wrapper khi cần layout phức tạp (nhiều field trên cùng hàng, checkbox + textarea, ...).

---

## Self-check trước khi trả kết quả

1. Toàn bộ `v-model`, interpolation `{{ }}`, `:items`, `:value` chỉ tham chiếu `data.*`.
2. Không còn `hsBenhAn`, `context`, hoặc dạng nested `data.a.b`.
3. Không để nguyên chuỗi dấu chấm/dấu gạch dưới để mô tả ô nhập; đã đổi sang component phù hợp.
4. Không thêm section không tồn tại trong mô tả ký tự.

---

## TODO khi không chắc chắn

Nếu mô tả ký tự mơ hồ hoặc xung đột:

```vue
<!-- TODO: Xác nhận component và data binding cho trường này -->
<div>...</div>
```

---

## Resources

- [Component Mapping and Props](component-mapping.md)
- [Shape Patterns](shape-patterns.md)
- [Capture Manifest](template-capture/manifest.json)
- [Capture Components](template-capture/components)

---

## Notes

- Skill này đọc mô tả text/ASCII, không cần ảnh.
- Chỉ generate template, không bao gồm script/style.
- Mặc định giữ phong cách đơn giản, dễ map lại với bộ component hiện tại.