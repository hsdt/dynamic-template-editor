# hs-input-text → Textarea

**Old:** `<hs-input-text ...>`  
**New:** `<Textarea ...>`

## Props Mapping

- `label` → `label` (hoặc slot)
- `value` + `update` → `v-model` (two-way binding)
- `type` → `type`
- `maxlength` → `maxlength`
- `disabled` → `disabled`
- `labelStyle` → slot `#label` với style tương ứng

## Lưu ý về binding

Trong ngx-dynamic-hooks:
- `[value]="context.text"` + `update="text"` = two-way binding → `v-model="context.text"`
- Chỉ có `[value]="context.text"` (không có `update`) = one-way binding → `:modelValue="context.text"`
- **Lưu ý:** `update` nhận path không có prefix `context.`

## Công thức chuyển đổi

```vue
<Textarea v-model="context.hoTen" label="Họ tên" type="text" maxlength="50" :disabled="false" />

<!-- Với labelStyle -->
<Textarea v-model="context.hoTen" maxlength="50">
  <template #label>
    <span style="...">Họ tên</span>
  </template>
</Textarea>
```
