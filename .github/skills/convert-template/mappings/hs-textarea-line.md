# hs-textarea-line → Textarea

**Old:** `<hs-textarea-line ...>`  
**New:** `<Textarea ...>`

## Props Mapping

- `label` → `label` prop nếu là plain text; dùng slot `#label` nếu label chứa HTML tag
- `value` + `update` → `v-model` (two-way binding)
- `placeholder` → `placeholder`
- `disabled` → `disabled`
- `readonly` → `readonly`
- `maxlength` → `maxlength`
- `rows` → `rows`
- `line` → `line`
- `textareaStyle` → `textareaStyle`

## Lưu ý về binding

Trong ngx-dynamic-hooks:
- `[value]="context.text"` + `update="text"` = two-way binding → `v-model="context.text"`
- Chỉ có `[value]="context.text"` (không có `update`) = one-way binding → `:modelValue="context.text"`
- **Lưu ý:** `update` nhận path không có prefix `context.`

## Công thức chuyển đổi

```vue
<!-- Label plain text → dùng prop -->
<Textarea v-model="text" label="Ghi chú" rows="3" maxlength="500" :line="true" />

<!-- Label có HTML tag → dùng slot #label -->
<Textarea v-model="text">
  <template #label>+ Bệnh kèm theo<i>(nếu có):</i></template>
</Textarea>

<!-- Label có style → dùng slot #label với thẻ bọc -->
<Textarea v-model="text">
  <template #label>
    <span style="color:blue">Nội dung</span>
  </template>
</Textarea>
```
