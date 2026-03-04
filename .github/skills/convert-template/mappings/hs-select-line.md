# hs-select-line → Select

**Old:** `<hs-select-line ...>`  
**New:** `<Select ...>`

## Props Mapping

- `items` → `items`
- `bindLabel` → `bindLabel`
- `bindValue` → `bindValue`
- `multiple` → `multiple`
- `value` + `update` → `v-model` (two-way binding)
- `placeholder` → `placeholder`
- `disabled` → `disabled`
- `readonly` → `readonly`
- `label` → `label` (hoặc slot)
- `searchByKeys` → `searchByKeys` (array of keys to search in)

## Lưu ý về binding

Trong ngx-dynamic-hooks:
- `[value]="context.selected"` + `update="selected"` = two-way binding → `v-model="context.selected"`
- Chỉ có `[value]="context.selected"` (không có `update`) = one-way binding → `:modelValue="context.selected"`
- **Lưu ý:** `update` nhận path không có prefix `context.`

## Công thức chuyển đổi

```vue
<Select v-model="selected" :items="options" bindLabel="Ten" bindValue="Ma" :multiple="false" label="Khoa" />
<Select v-model="selected" :items="options" bindLabel="Ten" bindValue="Ma" :searchByKeys="['MaTuDien', 'Ten']" label="Tìm theo nhiều trường" />
```

## Quy tắc chuyển đổi tổng quát

Nếu gặp:
```vue
<span ...>LABEL_TEXT&nbsp;</span>
<hs-select-line ... [items]="context.tempData.xxx" [value]="context.tempData.yyy" ... update="tempData.yyy"></hs-select-line>
```
Thì chuyển thành:
```vue
<Select
  label="LABEL_TEXT"
  ...
  :items="context.tempData.xxx"
  v-model="context.tempData.yyy"
  ...
/>
```
