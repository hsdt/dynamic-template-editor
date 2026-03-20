# InputOTP

## Mô tả

`InputOTP` dùng để nhập mã OTP hoặc chuỗi ký tự theo pattern cố định. Component hỗ trợ mask theo từng ô, pad ký tự, kiểu số hoặc text, disabled và readonly.

## Props

- `modelValue`: Giá trị hiện tại
- `type`: Kiểu nhập, `'text'` hoặc `'number'`
- `readonly`: Chỉ đọc
- `disabled`: Vô hiệu hóa
- `maskLength`: Mảng độ dài cho từng ô
- `padChar`: Ký tự pad trong từng ô
- `padStart`: Ký tự pad đầu chuỗi
- `style`: Style cho wrapper
- `class`: Class cho wrapper

## Ví dụ

```vue
<InputOTP v-model="data.otp" :maskLength="[1, 1, 1, 1]" type="number" />
```

```vue
<InputOTP v-model="data.maBenh" :maskLength="[2, 2]" padChar="*" padStart="0" />
```

```vue
<InputOTP v-model="data.otp" disabled />
```
