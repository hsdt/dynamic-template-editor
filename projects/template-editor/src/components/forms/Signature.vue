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

    <ContextMenu ref="signatureMenu">
      <template #default="{ subject }">
        <li @click="openSignatureHistory">
          <i class="fa fa-search text-warning"></i>
          Lịch sử ký
        </li>
      </template>
    </ContextMenu>
  </div>
</template>

<script lang="ts">
import { computed, getCurrentInstance, ref } from 'vue';
import ContextMenu from '../ContextMenu.vue';

type SignatureItem = {
  Active?: boolean;
  AnhChuKy?: string;
  ViTri?: string;
};

type SignatureHandler = (code: string) => void;

export default {
  name: 'Signature',
  components: {
    ContextMenu
  },
  props: {
    code: { type: String, default: '' }
  },
  setup(props) {
    const instance = getCurrentInstance();
    const signatureMenu = ref<InstanceType<typeof ContextMenu> | null>(null);

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
      event.preventDefault();
      signatureMenu.value?.showFromEvent?.(event, signatureCode.value);
    };

    return {
      activeSignature,
      codeLine,
      openSignatureHistory,
      handleSign,
      openContextMenu,
      signatureMenu
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
