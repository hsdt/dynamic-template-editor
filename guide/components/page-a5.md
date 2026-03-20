# PageA5

## Mô tả

`PageA5` là layout khổ giấy A5 cho template.

## Props

- `style`: Style cho trang, nhận `Object` hoặc `String`
- `landscape`: Bật chế độ ngang, mặc định `false`

## Ví dụ

```vue
<PageA5 style="padding: 10px;">
  <div>Nội dung trang A5</div>
</PageA5>
```

```vue
<PageA5 :style="{ padding: '8mm' }" landscape>
  <div>Trang A5 nằm ngang</div>
</PageA5>
```
