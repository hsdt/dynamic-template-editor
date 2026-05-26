# Shape Patterns for Component Mapping

Tài liệu này định nghĩa các mẫu ký tự thường gặp và component Vue tương ứng.

## 1) Checkbox

Patterns:
- `[ ] Nội dung`
- `☐ Nội dung`
- `[x] Nội dung` (nếu cần thể hiện trạng thái có sẵn)

Mapping:
- `<Checkbox v-model="data.Field" :true-value="true" :false-value="false" afterText="Nội dung" />`

## 2) Text input một dòng

Patterns:
- `Họ tên: _____________`
- `Chẩn đoán: .............`

Mapping:
- `<Textarea label="Họ tên:" v-model="data.HoTen" line :rows="1" />`

Lưu ý:
- Không dùng `:suffix` với `Textarea`.

## 3) Date input

Patterns:
- `__/__/____`
- `Ngày ___ tháng ___ năm ___`

Mapping:
- `<DatePicker label="Ngày sinh:" v-model="data.NgaySinh" format="DD/MM/YYYY" />`

## 4) Select

Patterns:
- `Giới tính: [v]`
- `Khoa: [chọn ▼]`

Mapping:
- `<Select label="Giới tính:" v-model="data.GioiTinh" :items="data.GioiTinhItems" />`

## 5) InputOTP

Patterns:
- `[ ][ ][ ][ ]`
- `Mã: |_|_|_|_|_|_`

Mapping:
- `<InputOTP v-model="data.Ma" :maskLength="[1,1,1,1]" />`

## 6) ICD

Patterns:
- `Bệnh chính: [ICD] ...`
- `Bệnh kèm theo: [ICD LIST]`

Mapping:
- `<IcdGroupItem label="Bệnh chính:" v-model="data.IcdRaVienBenhChinh" v-model:ten="data.IcdRaVienBenhChinhTen" v-model:ma="data.IcdRaVienBenhChinhMa" />`
- `<IcdList :items="data.IcdList" />`

## 7) Signature

Patterns:
- `[SIGN] Bác sĩ`
- `Ký tên`

Mapping:
- `<Signature code="BacSi" />`

## 8) Paint

Patterns:
- Khung viền rộng để viết/vẽ:

```text
+-----------------------+
|                       |
|                       |
+-----------------------+
```

Mapping:
- `<Paint v-model="data.GhiChuVeTay" />`

## 9) Box layout

Patterns:
- Bảng/khung tạo bởi `+`, `-`, `|`

Mapping:
- Dùng `div` có border và chia cột bằng `display:grid` hoặc `display:flex`.

## 10) Quy tắc bổ sung

- Chỉ sử dụng binding `data.*` một lớp.
- Không thêm field không có trong mô tả.
- Không suy diễn section nếu mô tả không có.