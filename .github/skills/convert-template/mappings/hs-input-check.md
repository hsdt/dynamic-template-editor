# hs-input-check → Checkbox

**Old:** `<hs-input-check ...>`  
**New:** `<Checkbox ...>`

## Props Mapping

- `value` → `value` hoặc `:value` (giá trị literal: bool hoặc string - không phải binding động)
- `selectedValue` + `update` → `v-model` (two-way binding)
- `disabled` → `disabled`
- `readonly` → `readonly`
- `beforeText` → `beforeText` (hoặc slot `#beforeText`)
- `afterText` → `afterText` (hoặc slot `#afterText`)
- `size` → `size`

## Lưu ý về binding

Trong ngx-dynamic-hooks:
- `[selectedValue]="context.path"` + `update="path"` = two-way binding → `v-model="context.path"`
- Chỉ có `[selectedValue]="context.path"` (không có `update`) = one-way binding → `v-model="context.path"` + `:readonly="true"`
- **Lưu ý về `value`:** Prop `value` của `hs-input-check` luôn là giá trị literal (bool hoặc string), không phải binding động:
  - `[value]="true"` → `:value="true"` (boolean)
  - `[value]="false"` → `:value="false"` (boolean)
  - `[value]="'ABC'"` → `value="ABC"` (string literal)
- **Lưu ý về `update`:** `update` nhận path không có prefix `context.`

## Công thức chuyển đổi

```vue
<!-- Dùng props như cũ -->
<Checkbox v-model="checked" value="..." size="..." beforeText="..." afterText="..." :disabled="..." :readonly="..." />

<!-- Dùng slot cho beforeText/afterText -->
<Checkbox v-model="checked" value="...">
  <template #beforeText>
    <!-- Nội dung tuỳ chỉnh trước checkbox -->
  </template>
  <template #afterText>
    <!-- Nội dung tuỳ chỉnh sau checkbox -->
  </template>
</Checkbox>
```

## Quy tắc chuyển đổi chi tiết

- `selectedValue` → `v-model`
- `[value]` → `:value` (nếu là boolean) hoặc `value` (nếu là string)
- `size`, `readonly`, `class` giữ nguyên tên props
- `beforeText`:
  - Nếu chỉ là text, dùng prop `beforeText`
  - Nếu có style, chuyển sang slot `#beforeText` và bọc nội dung bằng thẻ có style
- `inputStyle`, `labelStyle`:
  - Nếu có style cho label/text, chuyển sang slot và bọc bằng thẻ có style tương ứng
  - Nếu có style cho input, có thể bỏ qua

## Ví dụ chuyển đổi

```vue
<!-- Cũ -->
<hs-input-check inputStyle="border-color: #0078B6" class="mr-2" labelStyle="color: #0078B6; margin-right: 3px" size="xl" name="gender" [selectedValue]="context.tempData.hsBenhAn.BenhNhan.GioiTinh" [value]="false" beforeText="Nữ" [readonly]="true"></hs-input-check>

<!-- Mới -->
<Checkbox v-model="context.tempData.hsBenhAn.BenhNhan.GioiTinh" :value="false" size="xl" readonly class="mr-2">
  <template #beforeText>
    <span style="color: #0078B6; margin-right: 3px">Nữ</span>
  </template>
</Checkbox>
```

## ⚠️ Trường hợp đặc biệt - Expression phức tạp

Nếu `[selectedValue]` có expression như `.isIn()`, `.includes()`, hãy đơn giản hóa:

```vue
<!-- Cũ - SAI CÁCH -->
<hs-input-check [selectedValue]="context.hsBenhAn.DoiTuong.isIn('BHYT')" [value]="true" afterText="Bảo hiểm y tế"></hs-input-check>

<!-- Chuyển đổi SAI -->
<Checkbox v-model="context.hsBenhAn.DoiTuong.isIn('BHYT')" :value="true" afterText="Bảo hiểm y tế" />

<!-- Chuyển đổi ĐÚNG -->
<Checkbox v-model="context.hsBenhAn.DoiTuong" value="BHYT" afterText="Bảo hiểm y tế" />
```

**Quy tắc:** v-model trỏ đến object gốc, value là string literal (không binding)
