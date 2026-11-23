<template>
  <div class="hs-signature">
    <div v-if="codeLine" class="signature-code">{{ codeLine }}</div>

    <div class="text-center">
      <span
        class="click-to-sign no-print noprint"
        title="Chuyển bản ký PDF để thực hiện ký số"
        @click="handleClick"
      >
        Ký tên
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, inject } from 'vue';

type NotifyApi = {
  info?: (message: string, title?: string) => void;
};

export default {
  name: 'Signature',
  props: {
    code: { type: String, default: '' }
  },
  setup(props) {
    const MauHoSo = inject<string | null>('MauHoSo', null);
    const notify = inject<NotifyApi | null>('notify', null);

    const codeLine = computed(() => {
      const parts = [MauHoSo, props.code].filter(Boolean);
      return parts.join('_');
    });

    const handleClick = () => {
      notify?.info?.('Vui lòng chuyển bản ký PDF để thực hiện ký số.');
    };

    return {
      codeLine,
      handleClick
    };
  }
};
</script>

<style scoped>
.hs-signature {
  display: block;
  pointer-events: auto !important;
  line-height: 1.5;
}
.signature-code {
  font-style: italic;
  color: #ffffff;
  font-size: 0.5px;
  text-align: center;
}
.click-to-sign {
  cursor: pointer;
  color: rgba(107, 170, 231, 0.5);
  padding: 10px 0 !important;
  font-family: Florence, cursive;
  font-size: 15px;
  text-align: center;
  pointer-events: auto;
}
.text-center {
  text-align: center;
}
</style>
