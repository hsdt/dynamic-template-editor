# Generate Template from Image Skill

## Tổng quan
Skill này giúp AI phân tích ảnh form y tế và generate template Vue bằng các component có sẵn.

## Tài nguyên hiện tại

### 1. SKILL.md
Hướng dẫn chi tiết về quy trình nhận diện layout, mapping component, rule binding và output template.

### 2. component-mapping.md
Mô tả props, slot, cách dùng của các component forms/layouts.

### 3. Capture artifacts (nguồn ảnh mới)
Ảnh component được lấy trực tiếp từ template mặc định đang render (được sinh lại mỗi lần chạy capture):
- `template-capture/components/`

File map component -> ảnh:
- `template-capture/manifest.json`

Node tree sau render:
- `template-capture/node-structure.json`

## Cách sử dụng

### Bước 1
Upload ảnh biểu mẫu cần convert.

### Bước 2
Yêu cầu AI generate template từ ảnh.

### Bước 3
AI sẽ:
1. Phân tích cấu trúc ảnh.
2. Đối chiếu component dựa vào `component-mapping.md` + capture artifacts.
3. Tạo template Vue theo đúng layout nhìn thấy.

### Bước 4
Review lại layout, binding và spacing.

## Bảo trì nguồn ảnh tham chiếu

Chạy lại capture khi template mặc định thay đổi:

```bash
npm run capture:template
```

## Tham khảo
- [SKILL.md](SKILL.md)
- [component-mapping.md](component-mapping.md)
- [template-capture/manifest.json](template-capture/manifest.json)
- [template-capture/node-structure.json](template-capture/node-structure.json)
