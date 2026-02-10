import { Component, ViewChild } from '@angular/core';
import { TemplateEditor } from '../../components/template-editor/template-editor';
import { FormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-shell-home',
  imports: [FormsModule, TemplateEditor, JsonPipe],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home{
  template = `<PageA4 style="padding: 3mm 15mm 3mm 15mm;">
  <div>{{ data.name }}</div>
  <p>Tuổi: {{ data.age }}</p>
  <Textarea v-model="data.name" label="Họ và tên:" :line="true"
    :suffix="{ length: 1, char: '❤️' }" />
  <Textarea v-model="data.age" label="Tuổi:" :line="true" />
  <InputOTP v-model="data.age" :maskLength="[1,1,1]" pad-start="0" />
  <Select v-model="data.category" label="Danh mục:" placeholder="Chọn danh mục"
    bindLabel="name" bindValue="id" :items="categoryList" />
  <Select v-model="data.tags" label="Tags:" placeholder="Chọn tags" @search="log($event)"
    bindLabel="label" bindValue="value" :items="tagList" :multiple="true" />
    {{data.tags}}
</PageA4>`;
  editMode = true;
  context = {
    log: console.log,
    data: {
      name: "Nguyễn Ngọc Duy",
      age: "18",
      tags: ['vue', 'typescript' ],
      category: 'tech'
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
