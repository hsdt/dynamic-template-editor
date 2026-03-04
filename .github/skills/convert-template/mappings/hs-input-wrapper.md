# hs-input-wrapper → div with v-model

**Old:** `<hs-input-wrapper [value]="..." update="...">`  
**New:** `<div>` + `v-model` trên `<input>`

## Props Mapping

- `value` + `update` → `v-model` trên thẻ `<input>` con
- `style` → `style` (chuyển lên div)
- `class` → `class` (chuyển lên div)
- Tất cả các attributes của `<input>` con → giữ nguyên

## Lưu ý về binding

- `[value]="context.email"` + `update="email"` → Chuyển thành `v-model="data.email"` trên thẻ `<input>`
- Bỏ wrapper, chỉ giữ lại thẻ `<div>` bao ngoài
- `v-model` của Vue tự xử lý two-way binding cho cả `text` và `checkbox`

## Công thức chuyển đổi

**Input text:**
```vue
<div>
  <input type="text" v-model="data.email" />
</div>
```

**Input checkbox:**
```vue
<div>
  <input type="checkbox" v-model="data.isActive" />
</div>
```

**Với style/class:**
```vue
<div style="width: 200px;" class="my-input">
  <input type="text" v-model="data.hoTen" placeholder="Nhập họ tên" />
</div>
```
