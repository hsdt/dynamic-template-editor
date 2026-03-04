# hs-signature → Signature

**Old:** `<hs-signature ...>`  
**New:** `<Signature ...>`

## Props Mapping

- `signaturePositionCode` → `code`
- `signatureHistory` → ❌ Bỏ (xử lý tự động bên trong component)

## Lưu ý

Component Vue `<Signature>` chỉ cần prop `code`. Việc quản lý `signatureHistory` được xử lý tự động bên trong component, không cần truyền từ bên ngoài.

## Công thức chuyển đổi

**Old (Angular):**
```html
<hs-signature signaturePositionCode="GiamDoc" 
  [signatureHistory]="context.tempData.DSHSLichSuKySos['GiamDoc']">
</hs-signature>
```

**New (Vue):**
```vue
<Signature code="GiamDoc" />
```
