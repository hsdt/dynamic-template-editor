# Shape Patterns for Component Mapping

Tài liệu này định nghĩa các mẫu ký tự thường gặp trong mô tả biểu mẫu bằng ký tự (ASCII sketch / text shape) và các component Vue tương ứng, dựa trên cấu trúc component thực tế.

## 1) Checkbox

Patterns:
- `[ ] Nội dung` hoặc `☐ Nội dung` (Chưa chọn)
- `[x] Nội dung` hoặc `[v] Nội dung` hoặc `☒ Nội dung` hoặc `☑ Nội dung` (Đã chọn)
- `Nội dung [ ]` hoặc `Nội dung ☐` (Nhãn nằm trước checkbox)

Mapping:
- Chọn một giá trị cố định (String/Number/Boolean):
  `<Checkbox v-model="data.Field" value="GiaTri" after-text="Nội dung" />`
  `
  <Checkbox v-model="data.sizeTest" value="small" afterText="Small" />
  <Checkbox v-model="data.sizeTest" value="medium" afterText="Medium" />
  `
- Toggle dạng Boolean trực tiếp (dùng native checkbox):
  `<Checkbox v-model="data.Field" native after-text="Nội dung" />`
- Nhãn hiển thị trước:
  `<Checkbox v-model="data.Field" value="GiaTri" before-text="Nội dung" />`
- Các tùy chọn kích thước (`size`): `'sm'`, `'md'`, `'lg'`, `'xl'` (mặc định `'md'`).

---

## 2) Text input và Textarea

Patterns:
- Một dòng: `Họ tên: _______________` hoặc `Chẩn đoán: ...................`
- Nhiều dòng:
  ```text
  Mô tả bệnh lý: .......................................
  ......................................................
  ```
  hoặc
  ```text
  ______________________________________________________
  ______________________________________________________
  ```

Mapping:
- Input 1 dòng:
  `<Textarea label="Họ tên:" v-model="data.HoTen" :rows="1" />`
- Input nhiều dòng:
  `<Textarea label="Mô tả bệnh lý:" v-model="data.MoTa" :rows="3" />`


## 3) DatePicker (Chọn ngày / giờ)

Patterns:
- Định dạng ngày chuẩn: `__/__/____` hoặc `../../....`
- Định dạng ngày kèm chữ tiếng Việt: `Ngày ___ tháng ___ năm ___`
- Định dạng ngày giờ: `__ giờ __ ngày __/__/____` hoặc `__h__ ngày __/__/____`

Mapping:
- Ngày chuẩn:
  `<DatePicker v-model="data.NgaySinh" format="DD/MM/YYYY" placeholder="Chọn ngày" />`
- Ngày kèm chữ tiếng Việt:
  `<DatePicker v-model="data.NgayKham" format="DD [tháng] MM [năm] YYYY" placeholder="DD tháng MM năm YYYY" />`
- Ngày và giờ (datetime - tự động kích hoạt khi định dạng format chứa giờ/phút/giây):
  `<DatePicker v-model="data.GioHen" format="HH:mm DD/MM/YYYY" placeholder="Chọn ngày giờ" :minute-step="15" />`

---

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
- `<InputOTP v-model="data.Ma" :mask-length="[1,1,1,1]" />`

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