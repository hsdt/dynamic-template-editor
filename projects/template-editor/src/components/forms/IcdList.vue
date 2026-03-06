<template>
  <div>
    <IcdGroupItem
      v-if="!items?.length"
      :path="path"
      :type="type"
      :index="0"
      ten=""
      ma=""
    />
    <IcdGroupItem
      v-for="(item, index) in items"
      :key="index"
      :path="path"
      :type="type"
      :index="index"
      v-model:ten="item.TenVN"
      v-model:ma="item.Ma"
    />
  </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';

type IcdItem = { TenVN?: string; Ma?: string; [key: string]: any };

export default {
  name: 'IcdList',
  props: {
    path: { type: String, required: true },
    type: { type: String, default: 'YHHD' },
    items: { type: Array as PropType<IcdItem[]>, default: () => [] },
  },
};
</script>
