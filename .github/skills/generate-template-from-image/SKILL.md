---
name: generate-template-from-image
description: Generate Vue template from medical form images using available components
---

# Skill: Generate Template from Image

## Mục đích
Skill này giúp AI phân tích ảnh mẫu biểu mẫu y tế (form) và tạo ra template Vue tương ứng sử dụng các component có sẵn.

## Quy tắc chung
1. **Strict visibility rule** - Do not infer or add any content not explicitly visible in the image, even if it is commonly expected in similar forms.
2. **Chỉ trả về template Vue** - không kèm script, style, hoặc logic JS/TS
3. **Sử dụng component có sẵn** - tham khảo [component-mapping.md](component-mapping.md), [template-capture/manifest.json](template-capture/manifest.json), [template-capture/components](template-capture/components)
4. **Layout Rules** - giữ đúng bố cục và thứ tự theo ảnh, ưu tiên flex/grid khi phù hợp.
5. **Data Binding Rules** - chỉ dùng path dạng `data.TenTruong` (không dùng `hsBenhAn`, `context`, `data.obj.field`).
6. **Không tạo file tool** - chỉ generate template string, không viết script automation

---

## Quy trình phân tích ảnh

### Bước 1: Phân tích cấu trúc tổng thể
- **Xác định phạm vi ảnh**: Xem kỹ ảnh bắt đầu và kết thúc ở đâu. Nếu ảnh bị cắt hoặc không đầy đủ, chỉ convert đến nơi ảnh kết thúc.
- Xác định loại trang: A4, A5
- Xác định hướng: portrait (dọc) hoặc landscape (ngang)
- Phân tích layout: header (tiêu đề, logo), body (nội dung chính), footer (chữ ký) - **CHỈ nếu có trong ảnh**
- Xác định các section/block chính trong form
- **KHÔNG tự thêm**: Không tự suy luận để thêm các phần thường có trong form (như chữ ký, ngày tháng) nếu ảnh không có

### Bước 2: Xác định các thành phần UI
Dựa trên ảnh, xác định từng loại component:

#### Input Components
- **Checkbox** `☐` - ô checkbox vuông, thường có text đi kèm ở bên phải
  - Example: `☐ Cấp cứu ☐ Bán cấp ☐ Chương trình/Phiên`
  - Component ưu tiên: `<Checkbox v-model="..." value="..." afterText="..." />`
  - Nếu label checkbox phức tạp hoặc cần chống xuống dòng: dùng slot `#afterText`

- **Dòng gạch dưới ______** - input text hoặc textarea
  - Nếu ngắn (< 200px): có thể là InputOTP hoặc inline text
  - Nếu là chỗ điền 1 dòng: ưu tiên `Textarea` với `line :rows="1"`
  - Nếu dài, nhiều dòng: sử dụng `Textarea` với số hàng phù hợp
  - Component: `<Textarea v-model="..." line :rows="1" />`

- **Dấu chấm dài .............** - chỗ trống để điền thông tin
  - **KHÔNG để nguyên text dấu chấm**, phải convert thành `Textarea`
  - Luôn ưu tiên `line :rows="1"` cho dạng 1 dòng
  - **KHÔNG dùng `:suffix` cho `Textarea`**
  - **Ưu tiên dùng prop `label`** khi field đứng độc lập theo dòng
  - Component chuẩn: `<Textarea label="Nhãn:" v-model="data.Field" line :rows="1" />`
  - Nếu field nằm cùng checkbox hoặc text khác trên một hàng: dùng wrapper `display:flex` hoặc `grid`, vẫn giữ `Textarea` không có `:suffix`

- **Ô nhập ngày** - DatePicker
  - Pattern: `__/__/____` hoặc text "Ngày ... tháng ... năm ..."
  - Component: `<DatePicker v-model="..." format="..." />`

- **Dropdown/Select** - Select
  - Thường có icon dropdown ▼ hoặc danh sách lựa chọn
  - Component: `<Select v-model="..." :items="..." />`

- **Ô số OTP/mã** - InputOTP
  - Nhiều ô nhỏ liền kề để nhập từng ký tự
  - Component: `<InputOTP v-model="..." :maskLength="[...]" />`

- **Khu vực vẽ/ghi chú bằng tay** - Paint
  - Hình chữ nhật trống có border để vẽ
  - Component: `<Paint v-model="..." />`

- **Chữ ký** - Signature
  - Thường có text "Ký tên", "Bác sĩ", "Người bệnh"...
  - Component: `<Signature code="..." />`

#### Medical Specific
- **Mã ICD** - IcdGroupItem hoặc IcdList
  - Text dạng "Bệnh chính:", "Bệnh kèm theo:"
  - Component: `<IcdGroupItem label="..." v-model="..." v-model:ten="..." v-model:ma="..." />`
  - List: `<IcdList :items="..." />`

### Bước 3: Xác định data binding paths
- **Quy tắc**: Chỉ dùng binding 1 lớp với format `data.TenTruong`
- **Cấm tuyệt đối**: Không dùng `hsBenhAn.*`, `BenhNhan.*`, `context.*`, `data.obj.field`, hoặc bất kỳ path lồng nhau nào
- Các trường thông tin: `data.BenhNhanHoTen`, `data.BenhNhanNgaySinh`, `data.BenhNhanDiaChi`
- Các trường khám bệnh: `data.TrieuChung`, `data.ChanDoan`, `data.DieuTri`
- Các trường ICD: `data.IcdRaVienBenhChinh`, `data.IcdRaVienBenhChinhTen`, `data.IcdRaVienBenhChinhMa`
- Checkbox: các field boolean như `data.CapCuu`, `data.CoPhauThuat`, `data.LoaiPhauThuat`

### Bước 4: Tạo template structure

#### Page wrapper
```vue
<PageA4 style="padding:20px; font-size:12pt"> <!-- font-size mặc định 12pt -->
  <!-- Header section -->
  <div class="header">
    <!-- Logo, tiêu đề, mã số... -->
  </div>
  
  <!-- Body section -->
  <div class="body">
    <!-- Form fields -->
  </div>
  
  <!-- Footer section -->
  <div class="footer">
    <!-- Chữ ký, ngày tháng... -->
  </div>
</PageA4>
```

#### Layout patterns
- **Flexbox row**: `<div style="display:flex; gap:10px">`
- **Three columns header**: `<div style="display:flex; justify-content:space-between; align-items:flex-start">...`
- **Grid checkbox rows**: `<div class="grid grid-cols-12" style="gap:20px; align-items:start">...`
- **Label + Input**: Sử dụng prop `label` của component: `<Textarea label="Label:" v-model="..." line :rows="1" />`
- **Checkbox group**: Ưu tiên `afterText` và sắp xếp bằng `grid` hoặc `flex` để giữ đúng vị trí trong scan

---

## Component Reference Quick Guide

- Ưu tiên tra cứu props/slots từ [component-mapping.md](component-mapping.md) thay vì ghi nhớ thủ công.
- Dùng [template-capture/manifest.json](template-capture/manifest.json) và [template-capture/components](template-capture/components) để đối chiếu component thực tế.
- Với ICD component, bám đúng mapping hiện có trong `component-mapping.md`.

---

## Best Practices

### 1. Đọc kỹ component-mapping.md
Trước khi generate, hãy đọc [component-mapping.md](component-mapping.md) để hiểu:
- Props bắt buộc và optional
- Cách sử dụng slots
- Examples cụ thể

### 2. Tham khảo ảnh capture mới
Xem các file trong [template-capture/components](template-capture/components) để:
- So sánh giao diện component với ảnh mẫu
- Xác định component phù hợp nhất
- Hiểu kích thước và style mặc định

Đọc thêm:
- [template-capture/manifest.json](template-capture/manifest.json) để map tên component -> file ảnh
- [template-capture/node-structure.json](template-capture/node-structure.json) để xem cây node thực tế khi render template mẫu

### 3. Giữ đúng semantics
- Label text giữ nguyên từ ảnh
- Thứ tự fields giữ đúng layout
- Spacing và alignment tương tự ảnh mẫu

### 4. Data binding convention
- **Chỉ dùng 1 lớp**: `data.TenTruong` (KHÔNG dùng nested như data.obj.field)
- **Không dùng bất kỳ object nào ngoài `data`** trong template generate ra
- Thông tin bệnh nhân: `data.BenhNhanHoTen`, `data.BenhNhanNgaySinh`, `data.BenhNhanDiaChi`
- Chi tiết bệnh án: `data.ChanDoan`, `data.TrieuChung`, `data.DieuTri`
- Danh mục: `data.DanToc`, `data.NgheNghiep`
- Boolean fields: `data.CoPhauThuat`, `data.LaCapCuu`

### 5. Style inline khi cần
- **Font-size mặc định**: `12pt` cho toàn bộ form (đặt ở PageA4/PageA5)
- Có thể dùng `line-height: 1` cho form scan dày chữ nếu mẫu cần sát ảnh
- Sử dụng style inline cho layout: `style="display:flex; gap:10px"`
- Header giấy tờ hành chính thường dùng bố cục 3 cột với `justify-content:space-between`
- Font size, weight cho tiêu đề: `style="font-size:14pt; font-weight:bold"` hoặc `font-size:16pt`
- **Margin**: Có thể dùng margin hợp lý (5-15px) để tạo spacing giữa các section, nhưng cẩn thận với margin lớn có thể gây tràn trang
- **Gap**: Ưu tiên dùng `gap` cho flex layout thay vì margin giữa các items

### 6. Sử dụng label prop thay vì wrapper
- **ĐÚNG**: `<Textarea label="Họ tên:" v-model="data.HoTen" />`
- **SAI**: `<div><span>Họ tên:</span><Textarea v-model="data.HoTen" /></div>`
- Áp dụng cho: Textarea, DatePicker, Select có hỗ trợ prop `label`
- **Lưu ý**: Chỉ dùng wrapper khi cần layout phức tạp, ví dụ checkbox + textarea trên cùng một hàng, hoặc nhiều field song song

### 7. Quy tắc riêng cho Textarea và Checkbox
- `Textarea` 1 dòng: luôn ưu tiên `line :rows="1"`
- **Không dùng `:suffix` cho `Textarea` trong bất kỳ trường hợp nào**
- Checkbox có text bên phải: ưu tiên `afterText` thay vì `beforeText`
- Checkbox có nội dung dài hoặc cần giữ layout: dùng `class="col-span-*"` + `afterText` hoặc slot `#afterText`

### 8. TODO khi không chắc chắn
Nếu không xác định được chính xác component hoặc binding:
```vue
<!-- TODO: Xác nhận component và data binding cho trường này -->
<div>...</div>
```

### 9. Self-check trước khi trả kết quả
- Kiểm tra toàn bộ template và đảm bảo mọi `v-model`, interpolation `{{ }}`, `:items`, `:value` đều chỉ tham chiếu `data.*`
- Nếu còn xuất hiện `hsBenhAn`, `context`, hoặc `data.` nhiều hơn một dấu chấm như `data.a.b`, phải sửa lại trước khi trả kết quả

---

## Example Workflow

1. Xác định phạm vi ảnh: chỉ convert phần nhìn thấy, ảnh dừng ở đâu thì template dừng ở đó.
2. Nhận diện component theo [component-mapping.md](component-mapping.md) và đối chiếu [template-capture/components](template-capture/components).
3. Generate template Vue theo đúng layout ảnh, dùng binding `data.*`, không thêm phần không xuất hiện trong ảnh.

---

## Tips

1. Chỉ convert nội dung thấy rõ trong ảnh; không thêm footer/chữ ký/ngày tháng nếu ảnh không có.
2. Ưu tiên đối chiếu ảnh component trong [template-capture/components](template-capture/components) trước khi chọn component.
3. Dùng đúng props theo [component-mapping.md](component-mapping.md) và giữ layout bằng flex/grid.
4. Binding chỉ dùng `data.*` một lớp; không dùng `hsBenhAn`, `context`, hoặc `data.a.b`.
5. Dòng chấm/gạch dưới phải convert thành `Textarea` và không dùng `:suffix`.
6. Với checkbox, ưu tiên `afterText`; chỉ dùng slot khi nhãn phức tạp.

---

## Resources

- [Component Mapping & Props](component-mapping.md) - Chi tiết về mỗi component
- [Capture Components](template-capture/components) - Ảnh component từ template mẫu hiện tại
- [Capture Manifest](template-capture/manifest.json) - Ánh xạ component -> ảnh capture
- [Capture Node Structure](template-capture/node-structure.json) - Cấu trúc node sau render

---

## Notes

- **CHỈ generate nội dung có trong ảnh** - Không tự bổ sung footer, chữ ký, ngày tháng nếu ảnh không có
- Skill này không tạo script logic, chỉ generate template
- Không validation, chỉ generate UI structure
- Data binding paths có thể cần điều chỉnh theo context thực tế
- Style inline để dễ maintain, có thể extract thành class sau
