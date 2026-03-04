# hs-input-otp → InputOTP

**Old:** `<hs-input-otp ...>`  
**New:** `<InputOTP ... />` (self-closing tag)

## Props Mapping

- `value` + `update` → `v-model` (two-way binding)
- `maskLength` → `maskLength`
- `readonly` → `readonly`
- `disabled` → `disabled`

## Lưu ý về binding

Trong ngx-dynamic-hooks:
- `[value]="context.otp"` + `update="otp"` = two-way binding → `v-model="context.otp"`
- Chỉ có `[value]="context.otp"` (không có `update`) = one-way binding → `:modelValue="context.otp"`

## Công thức chuyển đổi

```vue
<InputOTP v-model="otp" :maskLength="[1,1,1,1]" :readonly="false" :disabled="false" />
```
