# hs-datepicker → DatePicker

**Old:** `<hs-datepicker ...>`  
**New:** `<DatePicker .../>` (self-closing tag)

## Props Mapping

- `label` → `label` (hoặc slot)
- `value` + `update` → `v-model` (two-way binding)
- `format` → `format` ⚠️ **Lưu ý:** hs-datepicker dùng format pipe của Angular, DatePicker dùng moment
- `placeholder` → `placeholder`
- `disabled` → `disabled`

## Lưu ý về binding

Trong ngx-dynamic-hooks:
- `[value]="context.date"` + `update="date"` = two-way binding → `v-model="context.date"`
- Chỉ có `[value]="context.date"` (không có `update`) = one-way binding → `:modelValue="context.date"`
- **Lưu ý:** `update` nhận path không có prefix `context.`

## Công thức chuyển đổi

```vue
<DatePicker v-model="context.ngaySinh" format="DD/MM/YYYY" placeholder="..." :disabled="false" label="Nhãn" />
```

## Lưu ý format
- Không được xuống dòng chuỗi format
- Angular format pipe: `dd/MM/yyyy` → Moment format: `DD/MM/YYYY`
- Angular format pipe: `yyyy-MM-dd` → Moment format: `YYYY-MM-DD`
- Angular format pipe: `dd/MM/yyyy HH:mm` → Moment format: `DD/MM/YYYY HH:mm`
- Angular format pipe: `dd/MM/yyyy HH:mm:ss` → Moment format: `DD/MM/YYYY HH:mm:ss`
- Angular format pipe: `yyyy-MM-dd HH:mm:ss` → Moment format: `YYYY-MM-DD HH:mm:ss`
- Angular format pipe: dd 'tháng' MM 'năm' yyyy → Moment format: DD [tháng] MM [năm] YYYY

- Angular format pipe: HH 'giờ' mm 'phút,' 'ngày' dd 'tháng' MM 'năm' yyyy → Moment format: HH [giờ] mm [phút,] [ngày] DD [tháng] MM [năm] YYYY

- Angular format pipe: HH'h'mm 'ngày' dd 'tháng' MM 'năm' yyyy → Moment format: HH[h]mm [ngày] DD [tháng] MM [năm] YYYY

- Angular format pipe: HH 'giờ' mm 'phút, ngày' dd/MM/yyyy → Moment format: HH [giờ] mm [phút, ngày] DD/MM/YYYY
