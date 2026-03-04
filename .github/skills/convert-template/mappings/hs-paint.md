# hs-paint → Paint

**Old:** `<hs-paint ...>`  
**New:** `<Paint ...>`

## Props Mapping

- `value` + `update` → `v-model` (ảnh vẽ base64, two-way binding)
- `style` → `style`

## Lưu ý về binding

Trong ngx-dynamic-hooks:
- `[value]="context.drawing"` + `update="drawing"` = two-way binding → `v-model="context.drawing"`
- Chỉ có `[value]="context.drawing"` (không có `update`) = one-way binding → `:modelValue="context.drawing"`
- **Lưu ý:** `update` nhận path không có prefix `context.`

## Công thức chuyển đổi

```vue
<Paint v-model="drawing" style="height:300px;" />
```
