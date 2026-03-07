# hs-icd-group → IcdGroupItem / IcdList

## Quy tắc chuyển đổi

- Có `[multiple]="true"` → đổi thành `IcdList`
- Không có `multiple` hoặc `multiple=false` → đổi thành `IcdGroupItem`
- `update="tempData.xxx"` hoặc `update="xxx"` → `path="xxx"`
- `[icdTen]="context.tempData.xxxTen"` → `v-model:ten="xxxTen"`
- `[icdMa]="context.tempData.xxxMa"` → `v-model:ma="xxxMa"`
- `label` chỉ gắn trực tiếp cho `IcdGroupItem`; với `IcdList` thì giữ label ở thẻ ngoài như `<div>`
- Với `IcdList`, dùng `[icd]` làm `:items`

## Công thức ngắn gọn

```vue
<!-- Single ICD -->
<IcdGroupItem
  label="..."
  path="data.path"
  v-model:ten="data.ten"
  v-model:ma="data.ma"
/>

<!-- Multiple ICD -->
<div>...</div>
<IcdList
  path="data.listPath"
  :items="data.listPath"
/>
```

## Business Case chuẩn

**Input:**

```html
<hs-icd-group label="+ Bệnh chính:"
	[icd]="context.tempData.hsBenhAn.BenhAnChiTietObj.IcdRaVienBenhChinh"
	[icdMa]="context.tempData.hsBenhAn.BenhAnChiTietObj.IcdRaVienBenhChinhMa"
	[icdTen]="context.tempData.hsBenhAn.BenhAnChiTietObj.IcdRaVienBenhChinhTen"
	update="tempData.hsBenhAn.BenhAnChiTietObj.IcdRaVienBenhChinh"></hs-icd-group>
<div>+ Bệnh kèm theo:</div>
<hs-icd-group
	[icd]="context.tempData.hsBenhAn.BenhAnChiTietObj.ListIcdRaVienBenhKemTheo"
	update="tempData.hsBenhAn.BenhAnChiTietObj.ListIcdRaVienBenhKemTheo"
	[multiple]="true"></hs-icd-group>
```

**Output:**

```vue
<IcdGroupItem
  label="+ Bệnh chính:"
  path="hsBenhAn.BenhAnChiTietObj.IcdRaVienBenhChinh"
  v-model:ten="hsBenhAn.BenhAnChiTietObj.IcdRaVienBenhChinhTen"
  v-model:ma="hsBenhAn.BenhAnChiTietObj.IcdRaVienBenhChinhMa"
/>
<div>+ Bệnh kèm theo:</div>
<IcdList
  path="hsBenhAn.BenhAnChiTietObj.ListIcdRaVienBenhKemTheo"
  :items="hsBenhAn.BenhAnChiTietObj.ListIcdRaVienBenhKemTheo"
/>
```