# hs → Interpolation

**Old:** `<hs [text]="..." />`  
**New:** `{{ ... }}`

## Quy tắc chuyển đổi

- `<hs [text]="context.value"/>` → `{{context.value}}`
- `<hs [text]="context.value"></hs>` → `{{context.value}}`
- Nếu có style, bọc trong thẻ `<span>` với style tương ứng

## Ví dụ

```vue
<!-- Cũ -->
<hs [text]="context.hoTen"/>
<!-- Mới -->
{{context.hoTen}}

<!-- Cũ - có style -->
<hs [text]="context.value" style="color: red"/>
<!-- Mới -->
<span style="color: red">{{context.value}}</span>
```

## Lưu ý

**Vue 3 không hỗ trợ pipe `|`** - Để format date/time, dùng `moment()` trực tiếp:
```vue
<!-- Cũ - Angular pipe -->
{{value | date : 'HH:mm dd/MM/yyyy'}}
<!-- Mới - Vue 3 -->
{{moment(value).format('HH:mm DD/MM/YYYY')}}
```
