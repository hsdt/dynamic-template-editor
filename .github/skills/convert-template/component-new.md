---
name: Component usage skill
---

# Component Usage Skill

Tài liệu này cung cấp ví dụ sử dụng và mô tả props cho các component trong thư mục `forms` và `layouts`.

## Checkbox

### Mô tả
Checkbox cho phép chọn hoặc bỏ chọn một giá trị. Hỗ trợ trạng thái disabled, readonly, hiển thị text trước/sau, và nhiều kích thước.

### Props
- `modelValue`: Giá trị hiện tại của checkbox (String, Number, Boolean, null)
- `value`: Giá trị của checkbox khi được chọn (String, Number, Boolean) **(bắt buộc)**
- `native`: Bật chế độ checkbox native, `modelValue` sẽ toggle kiểu Boolean (Boolean)
- `disabled`: Vô hiệu hóa checkbox (Boolean)
- `readonly`: Chỉ đọc, không cho phép thay đổi (Boolean)
- `beforeText`: Text hiển thị trước checkbox (String) hoặc slot `#beforeText`
- `afterText`: Text hiển thị sau checkbox (String) hoặc slot `#afterText`
- `size`: Kích thước: 'sm', 'md', 'lg', 'xl' (String)

### Ví dụ
```vue
<Checkbox v-model="checked" value="yes" size="md" beforeText="Chọn" afterText="Xong" />
<Checkbox v-model="checked" value="1" disabled />
<Checkbox v-model="checked" value="A" readonly size="xl" />
<Checkbox v-model="checked" native />
```

---

## DatePicker

### Mô tả
DatePicker nhập ngày/thời gian với định dạng tùy chỉnh, hỗ trợ mask, disabled, readonly, bước phút. Có thể truyền nhãn qua prop `label` hoặc slot `label`.

### Props
- `modelValue`: Giá trị ngày (String)
- `format`: Định dạng ngày, ví dụ 'YYYY-MM-DD' hoặc 'YYYY-MM-DD HH:mm' (String)
- `placeholder`: Placeholder hiển thị (String)
- `disabled`: Vô hiệu hóa (Boolean)
- `readonly`: Chỉ đọc (Boolean)
- `minuteStep`: Bước phút khi chọn thời gian (Number)
- `label`: Nhãn hiển thị (String)

### Ví dụ
```vue
<DatePicker v-model="date" format="YYYY-MM-DD" label="Ngày sinh" />
<DatePicker v-model="date" format="YYYY-MM-DD HH:mm" minuteStep="15">
  <template #label>
    <b>Ngày/giờ</b>
  </template>
</DatePicker>
<DatePicker v-model="date" disabled />
```

---

## DatePickerPortal

### Mô tả
Popup chọn ngày/thời gian, dùng nội bộ cho DatePicker. Không dùng trực tiếp.

---

## InputOTP

### Mô tả
Nhập mã OTP hoặc chuỗi ký tự theo pattern, hỗ trợ mask, pad, kiểu số hoặc text, disabled, readonly.

### Props
- `modelValue`: Giá trị hiện tại (String)
- `type`: Kiểu nhập ('text' | 'number')
- `readonly`: Chỉ đọc (Boolean)
- `disabled`: Vô hiệu hóa (Boolean)
- `maskLength`: Mảng độ dài từng ô (Array)
- `padChar`: Ký tự pad cho từng ô (String)
- `padStart`: Ký tự pad đầu chuỗi (String)
- `style`: CSS style cho wrapper (String)
- `class`: CSS class cho wrapper (String)

### Ví dụ
```vue
<InputOTP v-model="otp" :maskLength="[1,1,1,1]" type="number" />
<InputOTP v-model="otp" :maskLength="[2,2]" padChar="*" padStart="0" />
<InputOTP v-model="otp" disabled />
```

---

## IcdGroupItem

### Mô tả
Hiển thị một dòng chọn/chỉnh sửa mã ICD, gồm tên bệnh và mã bệnh. Component hỗ trợ mở form chọn ICD bằng double click hoặc context menu.

### Props
- `path`: Đường dẫn dữ liệu dùng cho thao tác thêm, sửa, xóa ICD **(bắt buộc)**
- `type`: Loại ICD, mặc định `'YHHD'` (String)
- `index`: Vị trí phần tử trong danh sách ICD, dùng khi edit/remove trong list (Number | null)
- `label`: Nhãn hiển thị cho trường tên bệnh (String)
- `ten`: Tên bệnh ICD, dùng với `v-model:ten` (String)
- `ma`: Mã ICD, dùng với `v-model:ma` (String)

### Ví dụ
```vue
<IcdGroupItem
  label="+ Bệnh chính:"
  path="hsBenhAn.BenhAnChiTietObj.IcdRaVienBenhChinh"
  v-model:ten="hsBenhAn.BenhAnChiTietObj.IcdRaVienBenhChinhTen"
  v-model:ma="hsBenhAn.BenhAnChiTietObj.IcdRaVienBenhChinhMa"
/>

<IcdGroupItem
  path="hsBenhAn.BenhAnChiTietObj.IcdYHCT"
  type="YHCT"
  v-model:ten="hsBenhAn.BenhAnChiTietObj.IcdYHCTTen"
  v-model:ma="hsBenhAn.BenhAnChiTietObj.IcdYHCTMa"
/>
```

---

## IcdList

### Mô tả
Hiển thị danh sách ICD. Khi danh sách rỗng, component vẫn render sẵn một `IcdGroupItem` để người dùng có thể mở form thêm mã bệnh.

### Props
- `path`: Đường dẫn dữ liệu của danh sách ICD **(bắt buộc)**
- `type`: Loại ICD cho các phần tử trong danh sách, mặc định `'YHHD'` (String)
- `items`: Mảng ICD, mỗi phần tử thường có `TenVN` và `Ma` (Array)

### Ví dụ
```vue
<div>+ Bệnh kèm theo:</div>
<IcdList
  path="hsBenhAn.BenhAnChiTietObj.ListIcdRaVienBenhKemTheo"
  :items="hsBenhAn.BenhAnChiTietObj.ListIcdRaVienBenhKemTheo"
/>

<div>+ ICD YHCT:</div>
<IcdList
  path="hsBenhAn.BenhAnChiTietObj.ListIcdYHCT"
  type="YHCT"
  :items="hsBenhAn.BenhAnChiTietObj.ListIcdYHCT"
/>
```

---

## Paint

### Mô tả
Canvas vẽ, hỗ trợ chọn màu, độ dày nét, ảnh nền, chế độ bút/tẩy, xuất ảnh.

### Props
- `modelValue`: Ảnh vẽ (base64) (String)
- `lineWidth`: Độ dày nét vẽ (Number)
- `color`: Màu nét vẽ (String)
- `src`: Ảnh nền (String)

### Ví dụ
```vue
<Paint v-model="drawing" lineWidth="5" color="#ff0000" />
<Paint v-model="drawing" src="/assets/bg.png" />
```

---

## Select

### Mô tả
Select nhiều hoặc một giá trị, hỗ trợ tìm kiếm, custom label/value, disabled, readonly. Có thể truyền nhãn qua prop `label` hoặc slot `label`.

### Props
- `modelValue`: Giá trị hiện tại (String, Number, Array)
- `items`: Danh sách lựa chọn (Array)
- `bindLabel`: Tên trường hiển thị (String)
- `bindValue`: Tên trường giá trị (String)
- `placeholder`: Placeholder (String)
- `multiple`: Chọn nhiều (Boolean)
- `disabled`: Vô hiệu hóa (Boolean)
- `readonly`: Chỉ đọc (Boolean)
- `label`: Nhãn hiển thị (String)

### Ví dụ
```vue
<Select v-model="selected" :items="options" bindLabel="name" bindValue="id" label="Loại" />
<Select v-model="selected" :items="options" multiple placeholder="Chọn nhiều">
  <template #label>
    <span style="color:red">Chọn mục</span>
  </template>
</Select>
<Select v-model="selected" :items="['A','B','C']" readonly />
```

---

## Signature

### Mô tả
Hiển thị và ký tên số, hỗ trợ xem lịch sử ký, truyền code vị trí ký.

### Props
- `code`: Mã vị trí ký (String)

### Ví dụ
```vue
<Signature code="K1" />
<Signature code="K2" />
```

---

## Textarea

### Mô tả
Textarea nhập nhiều dòng, hỗ trợ nhãn qua prop hoặc slot, placeholder, disabled, readonly, maxlength, rows, line, suffix, style.

### Props
- `modelValue`: Giá trị hiện tại (String)
- `type`: Kiểu nhập ('text' | 'number')
- `label`: Nhãn hiển thị (String)
- `placeholder`: Placeholder (String)
- `disabled`: Vô hiệu hóa (Boolean)
- `readonly`: Chỉ đọc (Boolean)
- `maxlength`: Độ dài tối đa (Number, String)
- `rows`: Số dòng mặc định (Number)
- `line`: Hiển thị dòng kẻ (Boolean)
- `suffix`: Đối tượng `{ length, char }` pad cuối (Object)
- `style`: Style cho wrapper (String/Object)

### Ví dụ
```vue
<Textarea v-model="text" label="Ghi chú" rows="3" maxlength="500" />
<Textarea v-model="text" placeholder="Nhập nội dung" :suffix="{length:5,char:'_'}">
  <template #label>
    <span style="color:blue">Nội dung</span>
  </template>
</Textarea>
<Textarea v-model="text" readonly />
```

---

## PageA4

### Mô tả
Khung trang A4, hỗ trợ style và chế độ landscape.

### Props
- `style`: Style cho trang (Object/String)
- `landscape`: Trang ngang (Boolean)

### Ví dụ
```vue
<PageA4 style="padding:20px" landscape>
  <!-- Nội dung trang -->
</PageA4>
```

---

## PageA5

### Mô tả
Khung trang A5, hỗ trợ style và chế độ landscape.

### Props
- `style`: Style cho trang (Object/String)
- `landscape`: Trang ngang (Boolean)

### Ví dụ
```vue
<PageA5 style="padding:10px" landscape>
  <!-- Nội dung trang -->
</PageA5>
```

---
