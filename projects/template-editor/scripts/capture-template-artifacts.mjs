import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const PROJECT_DIR = process.cwd();
const TEMPLATE_FILE = path.resolve(PROJECT_DIR, 'src/components/preview/default-template.html');
const OUTPUT_DIR = path.resolve(PROJECT_DIR, '../../.github/skills/generate-template-from-image/template-capture');
const COMPONENT_DIR = path.resolve(OUTPUT_DIR, 'components');
const DEV_SERVER_URL = process.env.CAPTURE_URL || 'http://127.0.0.1:4203';
const DEV_SERVER_HOST = '127.0.0.1';
const DEV_SERVER_PORT = '4203';

function parseComponentTagsFromTemplate(templateHtml) {
  const tagRegex = /<([A-Z][A-Za-z0-9]*)\b/g;
  const result = [];
  const seenCount = new Map();

  let match;
  while ((match = tagRegex.exec(templateHtml)) !== null) {
    const componentName = match[1];
    const currentIndex = (seenCount.get(componentName) || 0) + 1;
    seenCount.set(componentName, currentIndex);

    result.push({
      componentName,
      occurrence: currentIndex,
      key: `${componentName}-${currentIndex}`,
    });
  }

  return result;
}

function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function toOutputRelativePath(filePath) {
  return path.relative(OUTPUT_DIR, filePath).replace(/\\/g, '/');
}

function filterExportAttributes(attributes) {
  const result = {};
  if (!attributes || typeof attributes !== 'object') {
    return result;
  }

  for (const [name, value] of Object.entries(attributes)) {
    if (
      name === 'c-id' ||
      name === 'c-name' ||
      name.startsWith('data-') ||
      name.startsWith('path')
    ) {
      continue;
    }
    result[name] = value;
  }

  return result;
}

async function readPreviewRootNode(page) {
  return page.evaluate(() => {
    const visited = new Set();
    const queue = [];
    const elements = document.querySelectorAll('*');

    for (const el of Array.from(elements)) {
      const instance = el.__vueParentComponent;
      if (instance && !visited.has(instance)) {
        visited.add(instance);
        queue.push(instance);
      }
    }

    const findPreviewProxy = () => {
      while (queue.length > 0) {
        const instance = queue.shift();
        if (!instance) {
          continue;
        }

        const name = instance.type?.name || instance.proxy?.$options?.name;
        if (name === 'Preview' && instance.proxy?.rootNode) {
          return instance.proxy;
        }

        if (instance.parent && !visited.has(instance.parent)) {
          visited.add(instance.parent);
          queue.push(instance.parent);
        }
      }

      return null;
    };

    const previewProxy = findPreviewProxy();
    if (!previewProxy || !previewProxy.rootNode) {
      throw new Error('Cannot access Preview.rootNode from Vue instance');
    }

    const toPlainNode = (node) => {
      if (!node || typeof node !== 'object') {
        return null;
      }

      if (node.tagName === '#text') {
        return {
          tagName: '#text',
          textContent: node.textContent || '',
        };
      }

      const attributes = {};
      if (node.attributes && typeof node.attributes === 'object') {
        Object.assign(attributes, node.attributes);
      }

      const childNodes = Array.isArray(node.childNodes)
        ? node.childNodes.map((child) => toPlainNode(child)).filter(Boolean)
        : [];

      return {
        tagName: String(node.tagName || ''),
        attributes,
        textContent: node.textContent || '',
        childNodes,
      };
    };

    return toPlainNode(previewProxy.rootNode);
  });
}

function buildCaptureSourceByComponent(rootNode) {
  const byComponent = new Map();

  const visit = (node) => {
    if (!node || node.tagName === '#text') {
      return;
    }

    const attributes = node.attributes || {};
    const componentName = attributes['c-name'];
    if (componentName) {
      if (!byComponent.has(componentName)) {
        byComponent.set(componentName, []);
      }
      byComponent.get(componentName).push(node);
    }

    for (const child of node.childNodes || []) {
      visit(child);
    }
  };

  visit(rootNode);
  return byComponent;
}

function buildNodeStructureFromRoot(rootNode, captures) {
  const imageByCid = new Map(
    captures
      .filter((item) => item && item.cid && item.file)
      .map((item) => [item.cid, item.file])
  );

  const collectQualifiedNodes = (node) => {
    if (!node || node.tagName === '#text') {
      return [];
    }

    const attrs = node.attributes || {};
    const cid = attrs['c-id'];
    const cname = attrs['c-name'];
    const hasRequiredAttrs = Boolean(cid && cname);

    const descendantNodes = [];
    for (const child of node.childNodes || []) {
      if (child?.tagName !== '#text') {
        descendantNodes.push(...collectQualifiedNodes(child));
      }
    }

    if (!hasRequiredAttrs) {
      return descendantNodes;
    }

    const children = [];
    for (const child of node.childNodes || []) {
      if (child?.tagName === '#text') {
        const text = child.textContent || '';
        if (text.trim()) {
          children.push({
            tagName: '#text',
            textContent: text,
          });
        }
      } else {
        children.push(...collectQualifiedNodes(child));
      }
    }

    const nodeObject = {
      tagName: node.tagName,
      attributes: filterExportAttributes(attrs),
      children,
    };

    if (imageByCid.has(cid)) {
      nodeObject.image = imageByCid.get(cid);
    }

    return [nodeObject];
  };

  return {
    tagName: 'ROOT',
    attributes: {},
    children: collectQualifiedNodes(rootNode),
  };
}

function toPublicCapture(capture) {
  if (!capture || typeof capture !== 'object') {
    return capture;
  }

  const { cid, ...publicCapture } = capture;
  return publicCapture;
}

async function run() {
  const templateHtml = await readFile(TEMPLATE_FILE, 'utf8');
  const componentNodes = parseComponentTagsFromTemplate(templateHtml);

  await mkdir(COMPONENT_DIR, { recursive: true });

  const viteServer = await createServer({
    root: PROJECT_DIR,
    configFile: path.resolve(PROJECT_DIR, 'vite.config.js'),
    server: {
      host: DEV_SERVER_HOST,
      port: Number(DEV_SERVER_PORT),
      strictPort: true,
    },
    clearScreen: false,
  });

  await viteServer.listen();

  let browser;
  try {
    browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1800, height: 2400 } });
    await page.goto(DEV_SERVER_URL, { waitUntil: 'networkidle' });
    await page.waitForSelector('.content-root [c-id]');
    const rootNode = await readPreviewRootNode(page);
    const componentSource = buildCaptureSourceByComponent(rootNode);

    const captureResults = [];

    for (const node of componentNodes) {
      const selector = `.content-root [c-name="${node.componentName}"]`;
      const candidates = componentSource.get(node.componentName) || [];
      const sourceNode = candidates[node.occurrence - 1];

      if (!sourceNode) {
        captureResults.push({
          ...node,
          selector,
          found: false,
          error: `Cannot find occurrence ${node.occurrence} for component ${node.componentName} in rootNode`,
        });
        continue;
      }

      const cid = sourceNode.attributes?.['c-id'];
      if (!cid) {
        captureResults.push({
          ...node,
          selector,
          found: false,
          error: `Component ${node.componentName}-${node.occurrence} does not have c-id in rootNode`,
        });
        continue;
      }

      const attributes = filterExportAttributes(sourceNode.attributes);
      const targetSelector = `.content-root [c-id="${cid}"]`;
      const target = page.locator(targetSelector).first();
      const count = await target.count();

      if (count < 1) {
        captureResults.push({
          ...node,
          selector,
          cid,
          attributes,
          found: false,
          error: `Cannot find DOM node by c-id ${cid} for ${node.componentName}-${node.occurrence}`,
        });
        continue;
      }

      await target.scrollIntoViewIfNeeded();
      const outputFileName = sanitizeFileName(`${node.componentName}-${node.occurrence}.png`);
      const outputFilePath = path.resolve(COMPONENT_DIR, outputFileName);
      await target.screenshot({ path: outputFilePath });

      captureResults.push({
        ...node,
        selector,
        cid,
        attributes,
        found: true,
        file: toOutputRelativePath(outputFilePath),
      });
    }

    const nodeStructure = buildNodeStructureFromRoot(rootNode, captureResults);
    const nodeFilePath = path.resolve(OUTPUT_DIR, 'node-structure.json');
    await writeFile(nodeFilePath, `${JSON.stringify(nodeStructure, null, 2)}\n`, 'utf8');

    const manifest = {
      templateFile: path.relative(PROJECT_DIR, TEMPLATE_FILE).replace(/\\/g, '/'),
      generatedAt: new Date().toISOString(),
      captures: captureResults.map(toPublicCapture),
      nodeStructureFile: toOutputRelativePath(nodeFilePath),
    };

    const manifestPath = path.resolve(OUTPUT_DIR, 'manifest.json');
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

    process.stdout.write(`Capture completed.\n`);
    process.stdout.write(`- Manifest: ${path.relative(PROJECT_DIR, manifestPath)}\n`);
    process.stdout.write(`- Node structure: ${path.relative(PROJECT_DIR, nodeFilePath)}\n`);
    process.stdout.write(`- Component images: ${path.relative(PROJECT_DIR, COMPONENT_DIR)}\n`);
  } finally {
    if (browser) {
      await browser.close();
    }

    await viteServer.close();
  }
}

run().catch((error) => {
  process.stderr.write(`${error?.stack || error}\n`);
  process.exit(1);
});
