<template>
  <Preview v-model:template="template" v-model:editMode="editMode" :context="context" />
  <!-- <Codemirror v-model:value="template" :options="{ mode: 'text/html', theme: 'default', tabSize: 2 }" height="400px" :border="true" /> -->
</template>

<script lang="ts">
import Preview from './Preview.vue';
import "codemirror/mode/htmlmixed/htmlmixed.js"
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'

export default {
  name: 'PreviewWrapper',
  components: { Preview },
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

  <div><b>Checkbox - Size</b></div>
  <Checkbox v-model="data.sizeTest" value="small"  beforeText="[sm]" afterText="Small" size="sm" />
  <Checkbox v-model="data.sizeTest" value="medium" beforeText="[md]" afterText="Medium" size="md" />
  <Checkbox v-model="data.sizeTest" value="large"  beforeText="[lg]" afterText="Large" size="lg" />
  <Checkbox v-model="data.sizeTest" value="xlarge" beforeText="[xl]" afterText="X-Large" size="xl" />

  <div style="color:#0066cc">Giá trị: <b>{{ data.sizeTest }}</b></div>
</PageA4>
`,
      context: {
        data: {
          name: "duynnz",
          age: "18",
          tags: ['vue', 'typescript' ],
          category: 'tech',
          gender: 'male',
          sizeTest: 'large'
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
