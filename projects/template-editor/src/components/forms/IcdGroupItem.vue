<template>
  <div class="icd-group" v-context-menu:ctxMenu="{ path, type, index }" @dblclick="onDblclick">
    <Textarea :label="label" v-model="tenModel" :suffix="{ length: 23 }" />
    <div class="icd-otp-wrapper">
      <InputOTP v-model="maModel" readonly />
    </div>
    <ContextMenu ref="ctxMenu">
      <template #default="{ subject }">
        <li @click="onOpen(subject)">
          <i class="fa fa-plus text-primary"></i> Thêm mã bệnh
        </li>
        <li @click="onRemove(subject)">
          <i class="fa fa-trash text-danger"></i> Xóa mã bệnh
        </li>
      </template>
    </ContextMenu>
  </div>
</template>

<script lang="ts">
import { computed, inject } from 'vue';

export default {
  name: 'IcdGroupItem',
  props: {
    path: { type: String, required: true },
    type: { type: String, default: 'YHHD' },
    index: { type: Number, default: null },
    label: { type: String, default: '' },
    ten: { type: String, default: '' },
    ma: { type: String, default: '' },
  },
  emits: ['update:ten', 'update:ma'],
  setup(props, { emit }) {
    const tenModel = computed({
      get: () => props.ten,
      set: (val) => emit('update:ten', val),
    });

    const maModel = computed({
      get: () => props.ma?.replace('.', ''),
      set: (val) => emit('update:ma', val),
    });

    const removeICD = inject<((path: string, index?: number | null) => void) | null>('removeICD', null);
    const insertICD = inject<((propPath: string, index: number | null, icdType: string) => void) | null>('insertICD', null);
    const editICD = inject<((propPath: string, index: number | null, icdType: string) => void) | null>('editICD', null);

    const onDblclick = () => editICD?.(props.path, props.index, props.type);
    const onOpen = (subject: any) => insertICD?.(subject.path, subject.index ?? null, subject.type ?? 'YHHD');
    const onRemove = (subject: any) => removeICD?.(subject.path, subject.index);

    return { tenModel, maModel, onDblclick, onOpen, onRemove, index: props.index };
  }
};
</script>
<style scoped>
.icd-group {
  position: relative;
}

.icd-group > .icd-otp-wrapper {
  position: absolute;
  right: 0;
  bottom: 5px;
}
</style>
