---
name: Convert Old Components to New (Auto)
description: Chuyển đổi các component cũ (Angular) sang component mới (Vue)
---

# Skill Map: Convert Old Components to New (Auto)

## Quy tắc chung
- Template này sử dụng ngx-dynamic-hooks (Angular) với custom components
- Ràng buộc 2 chiều trong ngx-dynamic-hooks sử dụng attribute `update="propertyPath"`
- Chỉ trả về template string Vue (không kèm script, style, hoặc logic JS/TS)
- Nếu không có component tương ứng, ghi chú TODO để xử lý thủ công
- Props binding Angular `[prop]` chuyển sang Vue `:prop`
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

## Bước cuối cùng: Tối ưu hóa Context Path

### 1. Xử lý `context.tempData`

Nếu gặp `context.tempData.xxx.yyy`

👉 Bỏ `context.tempData.`

👉 Giữ lại `xxx.yyy`

**Ví dụ:**
```
context.tempData.hsBenhAn.HoTen
→ hsBenhAn.HoTen
```

### 2. Xử lý `context.value`

Nếu là `context.value` (chỉ 1 cấp)

👉 Đổi thành `data.value`

**Ví dụ:**
```
context.value
→ data.value
```

### 3. Xử lý `context.xxx`

Nếu là `context.xxx` (không qua tempData, chỉ 1 cấp)

👉 Đổi thành `data.xxx`

**Ví dụ:**
```
context.hoTen
→ data.hoTen
```

---

## Xử lý Binding Expressions

### Không dùng `concatWith()` - Dùng phép cộng chuỗi trực tiếp

**Old:**
```
hsBenhAn.MaKhoaBanDau?.concatWith(' - ')?.concatWith(hsBenhAn.TenKhoaBanDau)
```

**New:**
```vue
{{hsBenhAn.MaKhoaBanDau + ' - ' + hsBenhAn.TenKhoaBanDau}}
```

Hoặc trong prop binding:
```vue
:modelValue="hsBenhAn.MaKhoaBanDau + ' - ' + hsBenhAn.TenKhoaBanDau"
```

