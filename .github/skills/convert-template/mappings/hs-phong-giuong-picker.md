# hs-phong-giuong-picker → Custom Layout

**Old:** `<hs-phong-giuong-picker [phongValue]="..." [giuongValue]="..." />`  
**New:** Dùng 2 Textarea trong div với `@dblclick`

## Công thức chuyển đổi

```vue
<!-- [phongValue]="context.soPhong" [giuongValue]="context.soGiuong" -->
<div class="d-flex" @dblclick="openPopupBuongGiuong('context.soPhong', 'context.soGiuong')">
  <Textarea label="Buồng: " v-model="context.soPhong"/>
  <Textarea label="Giường: " v-model="context.soGiuong"/>
</div>
```

## Lưu ý

- Giữ đúng thứ tự phòng → giường
- Truyền full expression string vào `openPopupBuongGiuong()`
