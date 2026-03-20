# IcdList

## Mô tả

`IcdList` hiển thị danh sách ICD. Khi danh sách rỗng, component vẫn render sẵn một `IcdGroupItem` để người dùng có thể mở form thêm mã bệnh.

## Props

- `type`: Loại ICD cho các phần tử trong danh sách, mặc định `YHHD`
- `items`: Mảng ICD, mỗi phần tử thường có `TenVN` và `Ma`
- `pathItems`: Đường dẫn dữ liệu cho thao tác thêm hoặc xóa ICD khi cần

## Ví dụ

```vue
<div>+ Bệnh kèm theo:</div>
<IcdList :items="hsBenhAn.BenhAnChiTietObj.ListIcdRaVienBenhKemTheo" />
```

```vue
<div>+ ICD YHCT:</div>
<IcdList type="YHCT" :items="hsBenhAn.BenhAnChiTietObj.ListIcdYHCT" />
```
