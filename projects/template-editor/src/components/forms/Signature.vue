<template>
  <div class="hs-signature" @contextmenu.prevent="openContextMenu">
    <div v-if="codeLine" class="signature-code">{{ codeLine }}</div>

    <div v-if="activeSignature && activeSignature.Active">
      <div class="signature-preview">
        <img
          :src="activeSignature.AnhChuKy"
          alt="signature"
          @click="openSignatureHistory"
        />
      </div>
    </div>

    <div v-else class="text-center">
      <span
        class="click-to-sign no-print"
        title="Click để ký tên"
        @click="handleSign"
      >
        Ký tên
      </span>
    </div>

    <ContextMenu v-model:show="menuVisible" :options="menuOption">
      <ContextMenuItem label="Lịch sử ký" @click="openSignatureHistory">
        <template #icon>
          <i class="fa fa-search text-warning"></i>
        </template>
      </ContextMenuItem>
    </ContextMenu>
  </div>
</template>

<script lang="ts">
import { computed, getCurrentInstance, PropType, ref } from 'vue';
import { ContextMenu, ContextMenuItem } from '@imengyu/vue3-context-menu';

type SignatureItem = {
  Active?: boolean;
  AnhChuKy?: string;
  ViTri?: string;
};

type SignatureHandler = (code: string) => void;

export default {
  name: 'HsSignature',
  components: {
    ContextMenu,
    ContextMenuItem
  },
  props: {
    code: { type: String, default: '' }
  },
  setup(props) {
    const instance = getCurrentInstance();
    const menuVisible = ref(false);
    const menuOption = ref({ x: 0, y: 0, minWidth: 140 });

    const rootData = computed(() =>
      ((instance?.proxy?.$root as any)?.$data ?? {}) as Record<string, unknown>
    );

    const history = computed<SignatureItem[]>(() => {
      const source = (rootData.value as any)?.signature ?? {};
      const groups = Object.values(source).filter(Array.isArray) as SignatureItem[][];
      const flat = groups.flat();
      if (!props.code) return flat;
      return flat.filter(item => item?.ViTri === props.code);
    });

    const activeSignature = computed<SignatureItem | null>(() => {
      return history.value.find(sig => sig?.Active) ?? null;
    });

    const signatureForCode = computed<SignatureItem | null>(() => {
      return activeSignature.value ?? history.value[0] ?? null;
    });

    const signatureCode = computed(() => props.code || signatureForCode.value?.ViTri || '');

    const codeLine = computed(() => {
      const mauHoSo = (rootData.value as any)?.MauHoSo || '';
      const parts = [mauHoSo, signatureCode.value].filter(Boolean);
      return parts.join('_');
    });

    const openSignatureHistory = () => {
      const handler = (rootData.value as any)?.openSignatureHistory as SignatureHandler | undefined;
      handler?.(signatureCode.value);
    };

    const handleSign = () => {
      const handler = (rootData.value as any)?.handleSign as SignatureHandler | undefined;
      handler?.(signatureCode.value);
    };

    const openContextMenu = (event: MouseEvent) => {
      menuOption.value.x = event.clientX;
      menuOption.value.y = event.clientY;
      menuVisible.value = true;
    };

    return {
      activeSignature,
      codeLine,
      openSignatureHistory,
      handleSign,
      menuVisible,
      menuOption,
      openContextMenu
    };
  }
};
</script>

<style scoped>
.hs-signature {
  display: block;
  pointer-events: auto !important;
}
.signature-code {
  font-style: italic;
  color: #ffffff;
  font-size: 0.5px;
  text-align: center;
}
.signature-preview {
  text-align: center;
}
.signature-preview img {
  max-width: 100%;
  max-height: 69px;
  cursor: pointer;
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
