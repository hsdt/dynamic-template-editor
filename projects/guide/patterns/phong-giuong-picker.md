# Phong Giuong Picker

## Mô tả

Pattern này dùng để dựng vùng nhập buồng và giường bằng layout tùy biến kết hợp với `Textarea`.

## Quy tắc cơ bản

- Giữ đúng thứ tự `phòng` rồi `giường`
- Dùng 2 `Textarea` để hiển thị dữ liệu
- Gắn sự kiện `@dblclick` cho wrapper nếu cần mở popup buồng giường

## Ví dụ

```vue
<div class="d-flex" @dblclick="openPopupBuongGiuong('data.phong', 'data.giuong')">
  <Textarea label="Buồng: " v-model="data.phong" />
  <Textarea label="Giường: " v-model="data.giuong" />
</div>
```
