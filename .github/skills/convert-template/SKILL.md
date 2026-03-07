---
name: convert-template
description: Convert template khi người dùng nhập nội dung về convert template
---

# Skill Map: Convert Old Components to New (Auto)

## Quy tắc chung
- Template này sử dụng ngx-dynamic-hooks (Angular) với custom components
- Ràng buộc 2 chiều trong ngx-dynamic-hooks sử dụng attribute `update="propertyPath"`
- Chỉ trả về template string Vue (không kèm script, style, hoặc logic JS/TS)
- Nếu không có component tương ứng, ghi chú TODO để xử lý thủ công
- Props binding Angular `[prop]` chuyển sang Vue `:prop`
- Không tạo file tool để convert, không chạy lệnh batch, không run pư
---

## Component Mappings

**LƯU Ý QUAN TRỌNG:** Bạn PHẢI đọc file mapping tương ứng từ link để hiểu cách chuyển đổi chính xác mỗi component.

### Layout Components
- [hoso-page → PageA4/PageA5](mappings/hoso-page.md)

### Text & Display
- [hs → Interpolation](mappings/hs-interpolation.md)

### Input Components
- [hs-input-check → Checkbox](mappings/hs-input-check.md)
- [hs-input-otp → InputOTP](mappings/hs-input-otp.md)
- [hs-input-text → Textarea](mappings/hs-input-text.md)
- [hs-input-wrapper → Custom Layout](mappings/hs-input-wrapper.md)
- [hs-textarea-line → Textarea](mappings/hs-textarea-line.md)

### Date & Time
- [hs-datepicker → DatePicker](mappings/hs-datepicker.md)

### Selection & Picker
- [hs-select-line → Select](mappings/hs-select-line.md)
- [hs-phong-giuong-picker → Custom Layout](mappings/hs-phong-giuong-picker.md)

### Drawing & Signature
- [hs-paint → Paint](mappings/hs-paint.md)
- [hs-signature → Signature](mappings/hs-signature.md)

### Medical Components
- [hs-icd-group → Custom Layout](mappings/hs-icd-group.md)

---

---

## Tối ưu hóa Context Path

- Áp dụng theo thứ tự:
1. `context.tempData.xxx.yyy` → `xxx.yyy`
2. `context.value` → `data.value`
3. `context.xxx` (1 cấp, không qua `tempData`) → `data.xxx`

**Ví dụ nhanh:**
```
context.tempData.hsBenhAn.HoTen -> hsBenhAn.HoTen
context.value -> data.value
context.hoTen -> data.hoTen
```

---

## Xử lý Binding Expressions

### Không dùng `concatWith()`, dùng nối chuỗi trực tiếp

**Đúng:**
```vue
{{hsBenhAn.MaKhoaBanDau + ' - ' + hsBenhAn.TenKhoaBanDau}}
```

Hoặc trong prop binding:
```vue
:modelValue="hsBenhAn.MaKhoaBanDau + ' - ' + hsBenhAn.TenKhoaBanDau"
```

## Convert sau khi đã convert xong toàn bộ template
- Sử dụng skill [Rescan Business Template (Fixed Rules)](../rescan-convert-template/SKILL.md)