# PageA4

## Mô tả

`PageA4` là layout khổ giấy A4 cho template.

## Props

- `style`: Style cho trang, nhận `Object` hoặc `String`
- `landscape`: Bật chế độ ngang, mặc định `false`

## Ví dụ

```vue
<PageA4 style="padding: 20px;">
  <div>Nội dung trang A4</div>
</PageA4>
```

```vue
<PageA4 :style="{ padding: '12mm' }" landscape>
  <div>Trang A4 nằm ngang</div>
</PageA4>
```
