# Paint

## Mô tả

`Paint` là canvas vẽ cho template. Component hỗ trợ chọn màu, độ dày nét, ảnh nền và xuất ảnh base64 qua `v-model`.

## Props

- `modelValue`: Ảnh vẽ dạng base64
- `lineWidth`: Độ dày nét vẽ
- `color`: Màu nét vẽ
- `src`: Ảnh nền

## Ví dụ

```vue
<Paint v-model="data.drawing" :lineWidth="5" color="#ff0000" />
```

```vue
<Paint v-model="data.drawing" src="/assets/bg.png" />
```
