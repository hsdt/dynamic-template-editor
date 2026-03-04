# Quy tắc chuyển đổi hs-icd-group

## I. Quy tắc chung

### 1️⃣ Loại bỏ hoàn toàn `<hs-icd-group>`

- Không giữ lại bất kỳ attribute cũ nào
- Không giữ `update`, `[icd]`, `[icdMa]`, `[icdTen]`, `[multiple]`

---

## II. Trường hợp ICD đơn (single object)

### Điều kiện nhận diện

- Không có `[multiple]="true"`
- `[icd]` là object đơn

### Mapping chuẩn


| Old | New |
|-----|-----|
| `[icdTen]` | `v-model` cho `<Textarea>` |
| `[icdMa]` | `:model-value` cho `<InputOTP>` |
| `[icd]` (full path) | dùng làm `propPath` (full path, giống hệt giá trị [icd]) |
| `label="..."` | `label="..."` trong `<Textarea>` |

**Bắt buộc:**
- Luôn có `v-context-menu:ctxMenu="{ propPath: '[icd]', type: 'YHHD', index?: number }"` (propPath là full path giống [icd])
- Luôn có `@dblclick="openPopupICD('[icd]', 'YHHD', index?)"` (propPath là full path giống [icd])

**Lưu ý:** Không dùng `update="xxx"` để làm propPath nữa. Luôn lấy full path từ `[icd]` hoặc `[icd]` array.

### Cấu trúc chuẩn

```vue
<div class="icd-group"
    v-context-menu:ctxMenu="{ propPath: '[icd]', type: 'YHHD' }"
    @dblclick="openPopupICD('[icd]', 'YHHD')">

    <Textarea 
        label="..."
        v-model="[icd]Ten"
        :suffix="{ length: 23 }"/>

    <InputOTP 
        :model-value="[icd]Ma?.replace('.', '')"
        readonly/>
</div>
```

### Chuẩn hóa bắt buộc

**InputOTP luôn:**
- `readonly`
- loại bỏ dấu `.` bằng `.replace('.', '')`

**Textarea luôn có:**
- `:suffix="{ length: 23 }"`

---

## III. Trường hợp ICD multiple (array)

### Điều kiện nhận diện

Có:
- `[multiple]="true"` hoặc
- `[icd]` là mảng

### Quy tắc render

#### 1️⃣ Khi mảng rỗng

Phải render 1 dòng trống:
- `v-if="!array?.length"`
- `Textarea` → `model-value=""`
- `InputOTP` → `model-value=""`

#### 2️⃣ Khi có dữ liệu

Dùng:
```vue
v-for="(item, index) in array"
:key="index"
```

#### 3️⃣ Mapping field

| Field | Textarea | InputOTP |
|-------|----------|----------|
| Tên bệnh | `item.TenVN` | |
| Mã bệnh | | `item.Ma?.replace('.', '')` |

#### 4️⃣ Cấu trúc chuẩn multiple

```vue
<div>
    <div v-if="!array?.length" class="icd-group"
        @dblclick="openPopupICD('propPath', 'YHHD', 0)">
        <Textarea model-value="" />
        <InputOTP model-value="" readonly/>
    </div>

    <template v-else>
        <template v-for="(item, index) in array" :key="index">
            <div class="icd-group"
                v-context-menu:ctxMenu="{ propPath: 'propPath', index: index, type: 'YHHD' }"
                @dblclick="openPopupICD('propPath', 'YHHD', index)">

                <Textarea v-model="item.TenVN" :suffix="{ length: 23 }"/>
                <InputOTP :model-value="item.Ma?.replace('.', '')" readonly/>
            </div>
        </template>
    </template>
</div>
```

---

## IV. ContextMenu chuẩn (dùng chung)

```vue
<ContextMenu ref="ctxMenu">
    <template #default="{ subject }">
        <li @click="openPopupICD(subject.propPath, subject.type || 'YHHD', subject.index ?? null)">
            <i class="fa fa-plus text-primary"></i> Thêm mã bệnh
        </li>

        <li @click="removeICD(subject.propPath, subject.index)">
            <i class="fa fa-trash text-danger"></i> Xóa mã bệnh
        </li>
    </template>
</ContextMenu>
```

---

## V. Chuẩn hóa bắt buộc (rất quan trọng)

### ✅ Luôn:

- ✅ Dùng `v-model` cho tên
- ✅ Dùng `v-model` cho mã
- ✅ `readonly` cho `InputOTP`
- ✅ Có `:suffix="{ length: 23 }"`

---

## VI. Ví dụ thực tế

### ICD đơn (single object)

**Old:** 
```html
<hs-icd-group label="+ Bệnh chính(tổn thương):"
    [icd]="context.tempData.hsBenhAn.BenhAnChiTietObj.IcdRaVienBenhChinh"
    [icdMa]="context.tempData.hsBenhAn.BenhAnChiTietObj.IcdRaVienBenhChinhMa"
    [icdTen]="context.tempData.hsBenhAn.BenhAnChiTietObj.IcdRaVienBenhChinhTen"
    update="tempData.hsBenhAn.BenhAnChiTietObj.IcdRaVienBenhChinh"></hs-icd-group>
```

**New:** 
```vue
<div class="icd-group" 
    v-context-menu:ctxMenu="{ propPath: 'context.tempData.hsBenhAn.BenhAnChiTietObj.IcdRaVienBenhChinh', type: 'YHHD' }"
    @dblclick="openPopupICD('context.tempData.hsBenhAn.BenhAnChiTietObj.IcdRaVienBenhChinh', 'YHHD')">
    <Textarea label="+ Bệnh chính(tổn thương):" 
        v-model="context.tempData.hsBenhAn.BenhAnChiTietObj.IcdRaVienBenhChinhTen" 
        :suffix="{ length: 23 }"/>
    <InputOTP :model-value="context.tempData.hsBenhAn.BenhAnChiTietObj.IcdRaVienBenhChinhMa?.replace('.', '')" readonly/>
</div>
```

### ICD multiple (array)

**Old:**
```vue
<div>+ Bệnh kèm theo:</div>
<hs-icd-group [icd]="context.tempData.hsBenhAn.BenhAnChiTietObj.ListIcdRaVienBenhKemTheo"
    update="tempData.hsBenhAn.BenhAnChiTietObj.ListIcdRaVienBenhKemTheo" 
    [multiple]="true">
</hs-icd-group>
```

**New:**
```vue
<div>+ Bệnh kèm theo:</div>
<div>
    <div v-if="!tempData.hsBenhAn.BenhAnChiTietObj.ListIcdRaVienBenhKemTheo?.length" class="icd-group"
        @dblclick="openPopupICD('tempData.hsBenhAn.BenhAnChiTietObj.ListIcdRaVienBenhKemTheo', 'YHHD', 0)">
        <Textarea model-value="" />
        <InputOTP model-value="" readonly/>
    </div>
    <template v-else>
        <template v-for="(item, index) in tempData.hsBenhAn.BenhAnChiTietObj.ListIcdRaVienBenhKemTheo" :key="index">
            <div class="icd-group"
                v-context-menu:ctxMenu="{ propPath: 'tempData.hsBenhAn.BenhAnChiTietObj.ListIcdRaVienBenhKemTheo', index: index, type: 'YHHD' }"
                @dblclick="openPopupICD('tempData.hsBenhAn.BenhAnChiTietObj.ListIcdRaVienBenhKemTheo', 'YHHD', index)">
                <Textarea v-model="item.TenVN" :suffix="{ length: 23 }"/>
                <InputOTP :model-value="item.Ma?.replace('.', '')" readonly/>
            </div>
        </template>
    </template>
</div>
```
