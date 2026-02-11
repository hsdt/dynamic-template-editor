<template>
  <DatePickerPortal />
  <Preview v-model:template="template" v-model:editMode="editMode" :context="context" />
  <!-- <Codemirror v-model:value="template" :options="{ mode: 'text/html', theme: 'default', tabSize: 2 }" height="400px" :border="true" /> -->
</template>

<script lang="ts">
import Preview from './Preview.vue';
import "codemirror/mode/htmlmixed/htmlmixed.js"
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'
import DatePickerPortal from '../forms/DatePickerPortal.vue';

export default {
  name: 'PreviewWrapper',
  components: { Preview, DatePickerPortal },
  data() {
    return {
      editMode: true,
            template: `
      <PageA4 style="padding:3mm 15mm">
        <div><b>Textarea</b></div>
        <Textarea v-model="data.name" label="Họ và tên:" line :suffix="{ length:1, char:'❤️' }" />

        <div><b>InputOTP</b></div>
        <InputOTP v-model="data.age" :maskLength="[1,1,1]" pad-start="0" />

        <div><b>Select one</b></div>
        <Select v-model="data.category" label="Danh mục:" placeholder="Chọn danh mục"
          bindLabel="name" bindValue="id" :items="categoryList" />

        <div><b>Select multiple</b></div>
        <Select v-model="data.tags" label="Tags:" placeholder="Chọn tags"
          bindLabel="label" bindValue="value" :items="tagList" multiple />
        <div style="color:#0066cc">Tags đã chọn {{ data.tags }}</b></div>

        <div><b>DatePicker - Chọn ngày sinh</b></div>
        <DatePicker v-model="data.birthday" placeholder="Chọn ngày sinh" format="DD/MM/YYYY" />
        <div style="color:#0066cc">Ngày sinh đã chọn: <b>{{ data.birthday }}</b></div>

        <div><b>DatePicker - Định dạng chữ</b></div>
        <DatePicker
          v-model="data.birthdayText"
          placeholder="DD tháng MM năm YYYY"
          format="DD [tháng] MM [năm] YYYY"
        />
        <div style="color:#0066cc">Giá trị: <b>{{ data.birthdayText }}</b></div>

        <div><b>DatePicker (datetime) - Giờ hẹn</b></div>
        <DatePicker v-model="data.appointment" mode="datetime" placeholder="Chọn ngày giờ"
          format="DD/MM/YYYY HH:mm" :minute-step="15"
        />
        <div style="color:#0066cc">Ngày giờ đã chọn: <b>{{ data.appointment }}</b></div>

        <div><b>Checkbox - Size</b></div>
        <Checkbox v-model="data.sizeTest" value="small"  beforeText="[sm]" afterText="Small" size="sm" />
        <Checkbox v-model="data.sizeTest" value="medium" beforeText="[md]" afterText="Medium" size="md" />
        <Checkbox v-model="data.sizeTest" value="large"  beforeText="[lg]" afterText="Large" size="lg" />
        <Checkbox v-model="data.sizeTest" value="xlarge" beforeText="[xl]" afterText="X-Large" size="xl" />

        <div style="color:#0066cc">Giá trị: <b>{{ data.sizeTest }}</b></div>

        <div><b>Paint - Chữ ký</b></div>
        <Paint style="width:400px; height:150px;" v-model="data.signature"
          src="https://fastly.picsum.photos/id/237/250/250.jpg?hmac=tNmO3YWXALG9JM81cghI9nflo3dWc3e5vlNsf_jmKWw"
        />
        <div v-if="data.signature">
          <div>Ảnh đã lưu:</div>
          <img :src="data.signature" alt="signature" style="max-width:200px;border:1px solid #ccc;" />
        </div>
      </PageA4>
      `,
      context: {
        data: {
          name: "duynnz",
          age: "18",
          tags: ['vue', 'typescript' ],
          category: 'tech',
          gender: 'male',
          sizeTest: 'large',
          birthday: '',
          birthdayText: '',
          appointment: '',
          signature: ''
        },
        categoryList: [
          { id: 'tech', name: 'Công Nghệ' },
          { id: 'business', name: 'Kinh Doanh' },
          { id: 'other', name: 'Khác' }
        ],
        tagList: [
          { value: 'vue', label: 'Vue' },
          { value: 'typescript', label: 'TypeScript' },
          { value: 'tailwind', label: 'Tailwind' },
          { value: 'react', label: 'React' }
        ]
      }
    }
  }
}
</script>
