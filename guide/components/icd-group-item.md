# IcdGroupItem

## Mô tả

`IcdGroupItem` hiển thị một dòng ICD gồm tên bệnh và mã bệnh. Component hỗ trợ thao tác thêm, sửa, xóa ICD qua double click hoặc context menu.

## Props

- `modelValue`: Đường dẫn dữ liệu dùng cho thao tác thêm, sửa, xóa ICD, dùng với `v-model`
- `type`: Loại ICD, mặc định `YHHD`
- `index`: Vị trí phần tử trong danh sách ICD
- `label`: Nhãn hiển thị cho trường tên bệnh
- `ten`: Tên bệnh ICD, dùng với `v-model:ten`
- `ma`: Mã ICD, dùng với `v-model:ma`

## Ví dụ

```vue
<IcdGroupItem
  label="+ Bệnh chính:"
  v-model="hsBenhAn.BenhAnChiTietObj.IcdRaVienBenhChinh"
  v-model:ten="hsBenhAn.BenhAnChiTietObj.IcdRaVienBenhChinhTen"
  v-model:ma="hsBenhAn.BenhAnChiTietObj.IcdRaVienBenhChinhMa"
/>
```
