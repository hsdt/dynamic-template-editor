<template>
  <div class="xml-viewer-container">
    <div v-if="loading">Đang tải...</div>
    <template v-else>
      <TreeView v-if="parsedObject" :data="parsedObject" />
    </template>
  </div>
</template>

<style scoped>
.xml-viewer-container {
  overflow-y: auto;
  max-height: 100%;
  border-radius: 6px;
  font-size: 15px;
  height: 100%;
  box-sizing: border-box;
  scrollbar-width: thin;
  width: 100%;
  max-width: 100%;
}
</style>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import TreeView from './TreeView.vue';

export default defineComponent({
  name: 'XmlViewer',
  components: { TreeView },
  props: {
    url: { type: String, required: true }
  },
  setup(props) {
    const xmlContent = ref('');
    const parsedObject = ref<any>(null);
    const loading = ref(true);
    const error = ref('');

    function domToObj(node: Node): any {
      if (node.nodeType === 8) {
        const comment = node.nodeValue?.trim();
        return comment ? { '#comment': comment } : undefined;
      }
      if (node.nodeType === 3) {
        const text = node.nodeValue?.trim();
        return text ? text : undefined;
      }
      if (node.nodeType === 1) {
        const obj: any = {};
        const el = node as Element;

        if (el.attributes && el.attributes.length > 0) {
          obj['@attributes'] = {};
          for (let attr of Array.from(el.attributes)) {
            obj['@attributes'][attr.name] = attr.value;
          }
        }

        for (let child of Array.from(node.childNodes)) {
          const childObj = domToObj(child);
          if (childObj === undefined) continue;

          if (child.nodeType === 3) {
            if (!obj['#text']) obj['#text'] = '';
            obj['#text'] += childObj;
          } else if (child.nodeType === 1) {
            const tag = (child as Element).tagName;
            if (!obj[tag]) obj[tag] = [];
            obj[tag].push(childObj);
          } else if (child.nodeType === 8) {
            if (!obj['#comment']) obj['#comment'] = [];
            obj['#comment'].push(childObj['#comment']);
          }
        }

        for (let key in obj) {
          if (Array.isArray(obj[key]) && obj[key].length === 1) {
            obj[key] = obj[key][0];
          }
        }

        return obj;
      }
      return undefined;
    }

    function domListToArray(nodeList: NodeList): any {
      const arr: any[] = [];
      let elementCount = 0;

      for (let node of Array.from(nodeList)) {
        if (node.nodeType === 1) {
          elementCount++;
          arr.push({ [node.nodeName]: domToObj(node) });
        } else {
          const obj = domToObj(node);
          if (obj !== undefined) arr.push(obj);
        }
      }

      if (elementCount === 1 && arr.length === 1) {
        return arr[0];
      }
      return arr;
    }

    const fetchXml = async () => {
      loading.value = true;
      error.value = '';
      try {
        const res = await fetch(props.url);
        if (!res.ok) throw new Error('Không thể tải XML');

        xmlContent.value = await res.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlContent.value, 'text/xml');

        parsedObject.value = domListToArray(xmlDoc.childNodes);
      } catch (e: any) {
        error.value = e.message || 'Lỗi không xác định';
      } finally {
        loading.value = false;
      }
    };

    onMounted(fetchXml);

    return { xmlContent, parsedObject, loading, error };
  }
});
</script>