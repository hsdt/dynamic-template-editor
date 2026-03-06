---
name: rescan-convert-template
description: Convert template khi người dùng nhập nội dung về rescan convert template
---

# Skill Map: Rescan Business Template (Fixed Rules)


## Quy tắc
1. Không rewrite toàn file, chỉ sửa block mục tiêu.
3. Ngoài rule thì ghi `TODO(rescan-manual): ...`.
4. Chỉ trả về template (không script/style), ưu tiên chuẩn Vue 3 template.
5. Nếu phát hiện cú pháp Handlebars thì convert sang cú pháp Vue 3 tương đương khi có thể map an toàn.
6. Nếu không thể convert an toàn trong 1 bước, giữ nguyên block đó và ghi `TODO(rescan-manual): ...`.

## Rule bổ sung: Block có Handlebars

- Nhận diện token Handlebars hợp lệ: `{{...}}`, `{{{...}}}`, `{{#each ...}}`, `{{#if ...}}`, `{{else}}`, `{{/each}}`, `{{/if}}`.
- Mapping mặc định Handlebars -> Vue 3:
	- `{{value}}` -> `{{ value }}`
	- `{{{value}}}` -> `v-html="value"` (chỉ dùng khi block cũ đang render HTML raw)
	- `{{#if cond}}...{{/if}}` -> `<template v-if="cond">...</template>`
	- `{{#if cond}}...{{else}}...{{/if}}` -> `<template v-if="cond">...</template><template v-else>...</template>`
	- `{{#each list}}...{{/each}}` -> `<template v-for="(item, index) in list" :key="index">...</template>`
	- Trong block `each`, các field trần như `{{MaKhoa}}` đổi thành `{{ item.MaKhoa }}`.
- Khi thay block UI, phải map expression sang Vue 3 tương ứng (ví dụ `{{NgayChuyen}}` -> `{{ item.NgayChuyen }}` nếu nằm trong `v-for`).
- Nếu rule nghiệp vụ yêu cầu đổi component nhưng expression phức tạp, ưu tiên giữ dữ liệu đúng nghĩa trước rồi mới tối ưu cú pháp.
- Nếu không thể map an toàn trong 1 bước, trả về `TODO(rescan-manual): kiểm tra mapping expression Handlebars -> Vue trong block ...`.

## Rule mẫu: Checkbox block

Từ:
```vue
<div>
	<label for="i3">- Thủ thuật </label>
	<input id="i3" type="checkbox" v-model="hsBenhAn.CoThuThuat" />
</div>
```

Thành:
```vue
<Checkbox size="md" v-model="hsBenhAn.CoThuThuat" beforeText="- Thủ thuật" native/>
```

## Rule mẫu: Span label + Select block

Từ:
```vue
<span class="text-nowrap" style="line-height: 25px"></span>
<Select style="width: 0; flex: 1" :items="dmDanToc"
	v-model="hsBenhAn.BenhNhan.IdDanToc" bindLabel="Ten" bindValue="Id"></Select>
```
Thành:
```vue
<Select label="5. Dân tộc:" style="flex: 1" :items="dmDanToc"
	v-model="hsBenhAn.BenhNhan.IdDanToc" bindLabel="Ten" bindValue="Id" @change="handleSelect('hsBenhAn.BenhNhan.IdDanToc', $event)" @search="handleSearch('hsBenhAn.BenhNhan.IdDanToc', $event.term)" ></Select>
```


## Rule mẫu: Age block (input + unit)

Từ:
```vue
<InputOTP v-model="hsBenhAn.Tuoi" :maskLength="[1,1]"></InputOTP>
```
Thành:
```vue
<InputOTP :modelValue="moment().diff(moment(hsBenhAn.BenhNhan.NgaySinh), 'years') > 0 ? moment().diff(moment(hsBenhAn.BenhNhan.NgaySinh), 'years') : moment().diff(moment(hsBenhAn.BenhNhan.NgaySinh), 'months') > 0 ? moment().diff(moment(hsBenhAn.BenhNhan.NgaySinh), 'months') : moment().diff(moment(hsBenhAn.BenhNhan.NgaySinh), 'days')" :readonly="true" :maskLength="[1,1]"></InputOTP>
```

Từ
```vue
{{hsBenhAn.DonViTuoi}}
```
Thành
```vue
<span v-if="moment().diff(moment(hsBenhAn.BenhNhan.NgaySinh), 'years') > 0"></span>
<span v-else-if="moment().diff(moment(hsBenhAn.BenhNhan.NgaySinh), 'months') > 0">(tháng)</span>
<span v-else>(ngày)</span>
```

