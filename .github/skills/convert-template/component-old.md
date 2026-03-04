# SKILL.md

Tài liệu này tổng hợp các ví dụ sử dụng và mô tả các props cho từng component trong thư mục `templates`.

---

## 1. hoso-page
**Selector:** `hoso-page`

### Props
- `style` *(string)*: CSS style cho component.
- `pageA4` *(boolean, mặc định: true)*: Hiển thị layout A4.
- `readonly` *(boolean, mặc định: false)*: Chế độ chỉ đọc.

### Ví dụ
```html
<hoso-page style="border:1px solid #ccc;" [pageA4]="true" [readonly]="false">
  <!-- Nội dung hồ sơ -->
</hoso-page>
```

---

## 2. hs
**Selector:** `hs`

### Props
- `if` *(boolean, mặc định: true)*: Điều kiện hiển thị.
- `style` *(string)*: CSS style cho component.
- `class` *(string)*: CSS class cho component.
- `span`, `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `b`, `i`, `small`, `div`, `pre` *(boolean)*: Thêm class tương ứng.
- `text` *(string)*: Nội dung hiển thị.
- `tag` *(string, mặc định: 'div')*: Tag HTML.
- `pipeName` *(string)*: Tên pipe áp dụng cho text.
- `pipeArgs` *(any[])*: Tham số cho pipe.

### Ví dụ
```html
<hs text="Họ tên bệnh nhân" h1></hs>
<hs [if]="context.isShow" text="Thông tin" b></hs>
<hs [pipeName]="'uppercase'" [text]="'abc'"/>
```


---

## 5. hs-datepicker
**Selector:** `hs-datepicker`

### Props
- `label` *(string)*: Nhãn cho input.
- `labelStyle` *(string)*: Style cho nhãn.
- `inputStyle` *(string)*: Style cho input.
- `value` *(Date|string)*: Giá trị ngày tháng.
- `format` *(string)*: Định dạng ngày tháng.
- `placeholder` *(string)*: Placeholder cho input.
- `disabled` *(boolean)*: Vô hiệu hóa.

### Ví dụ
```html
<hs-datepicker label="Ngày sinh" [value]="context.ngaySinh" update="ngaySinh" format="dd/MM/yyyy" [disabled]="false"></hs-datepicker>
```

---

## 6. hs-icd-group
**Selector:** `hs-icd-group`

### Props
- `label` *(string)*: Nhãn.
- `labelStyle` *(string)*: Style cho nhãn.
- `textareaStyle` *(string)*: Style cho textarea.
- `multiple` *(boolean)*: Chọn nhiều ICD.
- `icdTen` *(string)*: Tên ICD.
- `icdMa` *(string)*: Mã ICD.
- `icd` *(any[])*: Danh sách ICD.

### Ví dụ
```html
<hs-icd-group label="Chẩn đoán" [multiple]="false" [icdTen]="context.tenICD" [icdMa]="context.maICD"></hs-icd-group>
<hs-icd-group label="Chẩn đoán" [multiple]="true" [icd]="context.dsICD"></hs-icd-group>
```


---

## 8. hs-input-check
**Selector:** `hs-input-check`

### Props
- `inputId` *(string)*: Id cho input.
- `inputName` *(string)*: Tên input.
- `disabled` *(boolean)*: Vô hiệu hóa.
- `readonly` *(boolean)*: Chế độ chỉ đọc.
- `beforeText` *(string)*: Text trước checkbox.
- `afterText` *(string)*: Text sau checkbox.
- `value` *(any)*: Giá trị checkbox.
- `oneCheck` *(boolean)*: Chỉ chọn một.
- `selectedValue` *(any)*: Giá trị được chọn.
- `size` *('sm'|'md'|'lg'|'xl')*: Kích thước.
- `style` *(string)*: Style.
- `class` *(string)*: Class.

### Ví dụ
```html
<hs-input-check inputId="chk1" [value]="true" update="chk1" beforeText="Đồng ý" afterText="(bắt buộc)"></hs-input-check>
```

---

## 9. hs-input-otp
**Selector:** `hs-input-otp`

### Props
- `value` *(string)*: Giá trị OTP.
- `maskLength` *(number[])*: Độ dài từng ô nhập.
- `readonly` *(boolean)*: Chế độ chỉ đọc.
- `disabled` *(boolean)*: Vô hiệu hóa.

### Ví dụ
```html
<hs-input-otp [value]="context.maOTP" update="maOTP" [maskLength]="[1,1,1,1]" [readonly]="false"></hs-input-otp>
```

---

## 10. hs-input-text
**Selector:** `hs-input-text`

### Props
- `label` *(string)*: Nhãn.
- `labelStyle` *(string)*: Style cho nhãn.
- `inputStyle` *(string)*: Style cho input.
- `value` *(string)*: Giá trị.
- `type` *(string)*: Loại input.
- `maxlength` *(number)*: Độ dài tối đa.
- `disabled` *(boolean)*: Vô hiệu hóa.

### Ví dụ
```html
<hs-input-text label="Họ tên" [value]="context.hoTen" update="hoTen" type="text" maxlength="50"></hs-input-text>
```

---

## 11. hs-input-wrapper
**Selector:** `hs-input-wrapper`

`<hs-input-wrapper>` là một component dùng để bao bọc thẻ `<input>` (hoặc `<input type="checkbox">`). Component này hoạt động như một bridge giữa input HTML và cơ chế binding Angular.

### Props
- `value` *(string)*: Giá trị được truyền vào cho thẻ input con.
- `update` *(string)*: Tên trường dữ liệu sẽ cập nhật khi giá trị thay đổi.
- `style` *(string)*: Inline style cho element.
- `class` *(string)*: Class CSS cho element.

### Ví dụ
```html
<hs-input-wrapper [value]="context.email" update="email">
  <input type="text" />
</hs-input-wrapper>

<hs-input-wrapper [value]="context.isActive" update="isActive">
  <input type="checkbox" />
</hs-input-wrapper>
```

> 📌 **Lưu ý:** Component chỉ hoạt động với 1 phần tử `<input>` duy nhất được bao bọc trong hs-input-wrapper.

---

## 12. hs-paint
**Selector:** `hs-paint`

### Props
- `style` *(string)*: Style.
- `class` *(string)*: Class.

### Ví dụ
```html
<hs-paint style="height:300px;"></hs-paint>
```

---

## 13. hs-phong-giuong-picker
**Selector:** `hs-phong-giuong-picker`

### Props
- `style` *(string)*: Style.
- `class` *(string)*: Class.
- `soGiuong` *(string)*: Số giường.
- `soGiuongUpdate` *(string)*: Biến cập nhật số giường.
- `soPhong` *(string)*: Số phòng.
- `soPhongUpdate` *(string)*: Biến cập nhật số phòng.

### Ví dụ
```html
<hs-phong-giuong-picker [soPhong]="context.phong" soPhongUpdate="phong" [soGiuong]="context.giuong" soGiuongUpdate="giuong"></hs-phong-giuong-picker>
```

---

## 14. hs-select-line
**Selector:** `hs-select-line`

### Props
- `label` *(string)*: Nhãn.
- `labelStyle` *(string)*: Style cho nhãn.
- `items` *(any[])*: Danh sách chọn.
- `bindLabel` *(string)*: Thuộc tính hiển thị.
- `bindValue` *(string)*: Thuộc tính giá trị.
- `multiple` *(boolean)*: Chọn nhiều.
- `value` *(any)*: Giá trị.
- `placeholder` *(string)*: Placeholder.
- `disabled` *(boolean)*: Vô hiệu hóa.
- `readonly` *(boolean)*: Chế độ chỉ đọc.
- `searchByKeys` *(string[])*: Danh sách các keys để tìm kiếm. Mặc định nếu không có thì search theo label.

### Ví dụ
```html
<hs-select-line label="Khoa" [items]="context.dsKhoa" bindLabel="Ten" bindValue="Ma" [value]="context.maKhoa" update="maKhoa"></hs-select-line>
<hs-select-line label="Tìm theo nhiều trường" [items]="context.dsKhoa" bindLabel="Ten" bindValue="Ma" [searchByKeys]="['MaTuDien', 'Ten']" [value]="context.maKhoa" update="maKhoa"></hs-select-line>
```

---

## 15. hs-signature
**Selector:** `hs-signature`

### Props
- `signaturePositionCode` *(string)*: Mã vị trí ký.
- `signatureHistory` *(any[])*: Lịch sử ký.
- `valueChange` *(EventEmitter<any>)*: Sự kiện thay đổi giá trị.

### Ví dụ
```html
<hs-signature signaturePositionCode="BacSi" [signatureHistory]="context.lichSuKy"></hs-signature>
```

---

## 16. hs-textarea-line
**Selector:** `hs-textarea-line`

### Props
- `label` *(string)*: Nhãn.
- `labelStyle` *(string)*: Style cho nhãn.
- `textareaStyle` *(string)*: Style cho textarea.
- `value` *(string)*: Giá trị.
- `placeholder` *(string)*: Placeholder.
- `disabled` *(boolean)*: Vô hiệu hóa.
- `readonly` *(boolean)*: Chế độ chỉ đọc.
- `maxlength` *(number)*: Độ dài tối đa.
- `rows` *(number)*: Số dòng.
- `line` *(boolean)*: Hiển thị dòng kẻ.

### Ví dụ
```html
<hs-textarea-line label="Ghi chú" [value]="context.ghiChu" update="ghiChu" rows="3" [line]="true"></hs-textarea-line>
```

---

*Các ví dụ trên đều có thể kết hợp các props để tạo biến thể phù hợp với nhu cầu sử dụng thực tế.*
