<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { request } from '../../utils/request';
import MarkdownIt from 'markdown-it';
import Matter from 'matter-js';
import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext';

const props = defineProps<{
  initialId?: string | null;
}>();

const article = ref<any>(null);
const loading = ref(true);
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
});

// 安全的 ID 生成函数
const generateSafeId = (text: string, fallback: string) => {
  if (!text) return fallback;
  // 移除 Word 特殊符号（如 \uf06c ）和非标准字符
  const cleanText = text.replace(/[\uf000-\uf0ff]/g, '').trim();
  const slug = cleanText
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug ? `heading-${slug}` : fallback;
};

// 自定义标题渲染规则
const defaultRender =
  md.renderer.rules.heading_open ||
  function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };

md.renderer.rules.heading_open = function (tokens, idx, options, env, self) {
  const token = tokens[idx];
  const inlineToken = tokens[idx + 1];
  const text = inlineToken ? inlineToken.content : '';
  token.attrPush(['id', generateSafeId(text, `h-${idx}`)]);
  return defaultRender(tokens, idx, options, env, self);
};

// 目录相关状态
const toc = ref<{ id: string; text: string; level: number }[]>([]);
const activeId = ref('');

// 特效相关状态
const contentRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const isEffectActive = ref(false);
const isReturning = ref(false);
const showContent = ref(true);

let idleTimer: any = null;
const IDLE_TIME = 30000;

const extractTOC = () => {
  if (!article.value?.content) return;
  const tokens = md.parse(article.value.content, {});
  const headings: { id: string; text: string; level: number }[] = [];

  tokens.forEach((token, index) => {
    if (token.type === 'heading_open') {
      const level = parseInt(token.tag.slice(1));
      // 安全地查找下一个 inline 类型的 token
      let inlineToken = null;
      for (let i = index + 1; i < tokens.length; i++) {
        if (tokens[i].type === 'inline') {
          inlineToken = tokens[i];
          break;
        }
        if (tokens[i].type === 'heading_close') break;
      }

      if (inlineToken) {
        const text = inlineToken.content;
        const id = generateSafeId(text, `h-${index}`);
        headings.push({ id, text, level });
      }
    }
  });
  toc.value = headings;
  console.log(`[精英目录] 提取完成: ${headings.length} 个标题`);
};

// 滚动监听：高亮当前目录项
const initScrollSpy = () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeId.value = entry.target.id;
        }
      });
    },
    { rootMargin: '-10% 0px -80% 0px' },
  );

  nextTick(() => {
    const headings = document.querySelectorAll(
      '.markdown-body h1, .markdown-body h2, .markdown-body h3',
    );
    headings.forEach((h) => observer.observe(h));
  });

  onUnmounted(() => observer.disconnect());
};

const scrollToHeading = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    const offset = 100; // 留出 Header 空间
    const bodyRect = document.body.getBoundingClientRect().top;
    const elementRect = el.getBoundingClientRect().top;
    const elementPosition = elementRect - bodyRect;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
  }
};

const fetchArticle = async () => {
  const id = props.initialId || new URLSearchParams(window.location.search).get('id');
  if (!id) return;

  loading.value = true;
  try {
    const data = await request(`/article/${id}`);
    article.value = data;
    extractTOC();

    // 增加点击量
    request(`/article/${id}/click`, { method: 'PATCH' }).catch(() => {});

    // 数据加载后，确保 DOM 渲染完成再启动计时
    nextTick(() => {
      console.log('文章内容已渲染，静置计时开始...');
      resetIdleTimer();
      initScrollSpy();
    });
  } catch (e) {
    console.error('获取文章失败:', e);
  } finally {
    loading.value = false;
  }
};

// --- 物理特效核心逻辑 ---
let engine: Matter.Engine;
let animationId: number | null = null;

const initEffect = () => {
  if (!contentRef.value || !canvasRef.value || !article.value) return;
  document.body.classList.add('lock-scroll');
  isReturning.value = false;

  const canvas = canvasRef.value;
  const container = contentRef.value;
  const rect = container.getBoundingClientRect();
  const text = container.innerText;
  if (!text.trim()) return;

  const computedStyle = window.getComputedStyle(container);
  const font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;
  const prepared = prepareWithSegments(text, font);
  const maxWidth = rect.width;
  const lineHeight = parseFloat(computedStyle.lineHeight || '24');
  const layoutResult = layoutWithLines(prepared, maxWidth, lineHeight);

  engine = Matter.Engine.create({ enableSleeping: true });
  const world = engine.world;
  world.gravity.y = 1.8;

  const wallOptions = { isStatic: true, restitution: 0.2, friction: 0.05 };
  Matter.World.add(world, [
    Matter.Bodies.rectangle(
      window.innerWidth / 2,
      window.innerHeight + 25,
      window.innerWidth,
      50,
      wallOptions,
    ),
    Matter.Bodies.rectangle(-25, window.innerHeight / 2, 50, window.innerHeight, wallOptions),
    Matter.Bodies.rectangle(
      window.innerWidth + 25,
      window.innerHeight / 2,
      50,
      window.innerHeight,
      wallOptions,
    ),
  ]);

  const measureCtx = document.createElement('canvas').getContext('2d')!;
  measureCtx.font = font;

  const bodies: any[] = [];
  const MAX_BODIES = 600;

  for (let lineIndex = 0; lineIndex < layoutResult.lines.length; lineIndex++) {
    if (bodies.length >= MAX_BODIES) break;
    const line = layoutResult.lines[lineIndex];
    const lineY = rect.top + lineIndex * lineHeight;
    if (lineY > window.innerHeight || lineY < -window.innerHeight) continue;

    const chars = Array.from(line.text);
    let currentX = rect.left;
    const chunkSize = 3;

    for (let i = 0; i < chars.length; i += chunkSize) {
      if (bodies.length >= MAX_BODIES) break;
      const chunk = chars.slice(i, i + chunkSize).join('');
      const chunkWidth = measureCtx.measureText(chunk).width;
      if (chunk.trim() !== '') {
        const body = Matter.Bodies.rectangle(
          currentX + chunkWidth / 2,
          lineY + lineHeight / 2,
          chunkWidth,
          lineHeight * 0.7,
          {
            restitution: 0.1,
            friction: 0.02,
            chamfer: { radius: 4 },
          },
        );
        Matter.Body.setVelocity(body, { x: (Math.random() - 0.5) * 2, y: 8 + Math.random() * 6 });
        bodies.push({
          body,
          char: chunk,
          size: parseFloat(computedStyle.fontSize),
          color: computedStyle.color,
          font: computedStyle.fontFamily,
          relX: currentX + chunkWidth / 2 - rect.left,
          relY: lineY + lineHeight / 2 - rect.top,
        });
      }
      currentX += chunkWidth;
    }
  }

  Matter.World.add(
    world,
    bodies.map((b) => b.body),
  );
  const ctx = canvas.getContext('2d')!;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const run = () => {
    if (!isEffectActive.value) return;
    if (!isReturning.value) Matter.Engine.update(engine, 16.666);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let allHome = true;
    const currentRect = isReturning.value ? contentRef.value?.getBoundingClientRect() : null;

    bodies.forEach((b) => {
      let { position, angle } = b.body;
      if (isReturning.value && currentRect) {
        const targetX = currentRect.left + b.relX;
        const targetY = currentRect.top + b.relY;
        const dx = targetX - position.x,
          dy = targetY - position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 1) {
          allHome = false;
          Matter.Body.setPosition(b.body, { x: position.x + dx * 0.45, y: position.y + dy * 0.45 });
          Matter.Body.setAngle(b.body, angle * 0.6);
          if (dist < 50 && !showContent.value) showContent.value = true;
        } else {
          Matter.Body.setPosition(b.body, { x: targetX, y: targetY });
          Matter.Body.setAngle(b.body, 0);
        }
      } else {
        if (position.y > window.innerHeight - 300) {
          Matter.Body.applyForce(b.body, position, {
            x: Math.sin(Date.now() * 0.0015) * 0.0018,
            y: -0.0002,
          });
        }
      }
      ctx.save();
      ctx.translate(position.x, position.y);
      if (angle !== 0 || isReturning.value) ctx.rotate(angle);
      ctx.globalAlpha = isReturning.value ? 0.8 : 1;
      ctx.fillStyle = b.color;
      ctx.font = `${b.size}px ${b.font}`;
      ctx.fillText(b.char, 0, 0);
      ctx.restore();
    });

    if (isReturning.value && allHome) {
      finishEffect();
      return;
    }
    animationId = requestAnimationFrame(run);
  };
  showContent.value = false;
  isEffectActive.value = true;
  run();
};

const finishEffect = () => {
  document.body.classList.remove('lock-scroll');
  isEffectActive.value = false;
  isReturning.value = false;
  showContent.value = true;
  if (animationId) cancelAnimationFrame(animationId);
  if (engine) {
    Matter.World.clear(engine.world, false);
    Matter.Engine.clear(engine);
  }
  resetIdleTimer();
};

const resetIdleTimer = () => {
  if (isEffectActive.value) return;
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => initEffect(), IDLE_TIME);
};

const handleActivity = () => {
  if (isEffectActive.value && !isReturning.value) {
    isReturning.value = true;
    engine.world.bodies.forEach((b) => (b.collisionFilter = { group: -1, mask: 0, category: 0 }));
  }
  resetIdleTimer();
};

onMounted(() => {
  fetchArticle();
  window.addEventListener('mousemove', handleActivity);
  window.addEventListener('keydown', handleActivity);
  window.addEventListener('click', handleActivity);
  window.addEventListener('scroll', handleActivity, { passive: true });
});

onUnmounted(() => {
  clearTimeout(idleTimer);
  if (animationId) cancelAnimationFrame(animationId);
  window.removeEventListener('mousemove', handleActivity);
  window.removeEventListener('keydown', handleActivity);
  window.removeEventListener('click', handleActivity);
  window.removeEventListener('scroll', handleActivity);
});

const formatDate = (date: string) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
</script>

<template>
  <div class="article-page-wrapper" :class="{ 'effect-running': isEffectActive }">
    <canvas v-show="isEffectActive" ref="canvasRef" class="effect-canvas"></canvas>

    <div v-if="loading" class="loading-state">
      <div class="skeleton-title"></div>
      <div class="skeleton-meta"></div>
      <div class="skeleton-content"></div>
    </div>

    <div v-else-if="article" class="article-layout">
      <article class="article-content-wrapper" :style="{ opacity: showContent ? 1 : 0 }">
        <header class="article-header">
          <div class="category-tags">
            <span v-for="cat in article.categories" :key="cat.id" class="cat-tag">{{
              cat.name
            }}</span>
          </div>
          <h1 class="title">{{ article.title }}</h1>
          <div class="meta-info">
            <span class="date">{{ formatDate(article.createdAt) }}</span>
            <span class="dot">·</span>
            <span class="clicks">{{ article.clicks }} 次阅读</span>
          </div>
        </header>

        <div ref="contentRef" class="markdown-body" v-html="md.render(article.content)"></div>

        <footer class="article-footer">
          <div class="tags-row">
            <span v-for="tag in article.tags" :key="tag.id" class="tag-item">
              # {{ tag.name }}
            </span>
          </div>
        </footer>
      </article>

      <aside v-if="toc.length > 0" class="article-sidebar">
        <div class="toc-container">
          <div class="toc-title">目录索引</div>
          <nav class="toc-list">
            <div
              v-for="item in toc"
              :key="item.id"
              class="toc-item"
              :class="[`level-${item.level}`, { active: activeId === item.id }]"
              @click="scrollToHeading(item.id)"
            >
              <span class="toc-text">{{ item.text }}</span>
              <div class="active-indicator"></div>
            </div>
          </nav>
        </div>
      </aside>
    </div>

    <div v-else class="error-state">
      <p>协议数据丢失，无法解析文章镜像</p>
      <button @click="fetchArticle" class="retry-btn">重新同步数据</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.article-page-wrapper {
  max-width: 1300px;
  margin: 0 auto;
  padding: 60px 24px 120px;
  min-height: 100vh;
  position: relative;
  &.effect-running {
    overflow: hidden;
  }
}

.article-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px;
  gap: 60px;
  align-items: flex-start;
  @media (max-width: 1024px) {
    display: block;
  }
}

.article-content-wrapper {
  min-width: 0;
  max-width: 900px;
  transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.effect-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
  pointer-events: none;
}

.article-sidebar {
  width: 260px;
  position: sticky;
  top: 120px;
  height: calc(100vh - 160px);
  padding-left: 20px;
  border-left: 1px solid var(--border);
  @media (max-width: 1024px) {
    display: none;
  }
}

.toc-container {
  .toc-title {
    font-size: 0.75rem;
    color: var(--text);
    opacity: 0.3;
    letter-spacing: 0.2em;
    margin-bottom: 24px;
    font-family: var(--body);
  }
}

.toc-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.toc-item {
  position: relative;
  cursor: pointer;
  padding: 4px 0;
  transition: all 0.3s ease;
  color: var(--text);
  opacity: 0.5;
  font-size: 0.9rem;
  line-height: 1.4;
  &.level-1 {
    font-weight: 600;
    font-size: 1rem;
    opacity: 0.7;
  }
  &.level-2 {
    padding-left: 16px;
  }
  &.level-3 {
    padding-left: 32px;
    font-size: 0.85rem;
  }
  &:hover {
    opacity: 1;
    color: var(--accent);
  }
  &.active {
    opacity: 1;
    color: var(--accent);
    transform: translateX(4px);
    .active-indicator {
      transform: scaleY(1);
    }
  }
  .toc-text {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .active-indicator {
    position: absolute;
    left: -21px;
    top: 0;
    width: 2px;
    height: 100%;
    background: var(--accent);
    transform: scaleY(0);
    transition: transform 0.3s ease;
  }
}

.article-header {
  margin-bottom: 60px;
  text-align: left;
  .category-tags {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    .cat-tag {
      font-size: 0.8rem;
      color: var(--accent);
      text-transform: uppercase;
      letter-spacing: 0.2em;
      font-family: var(--mono);
    }
  }
  .title {
    font-size: 3.5rem;
    font-family: var(--heading);
    color: var(--text-h);
    line-height: 1.2;
    margin-bottom: 24px;
    font-weight: 500;
  }
  .meta-info {
    font-size: 0.9rem;
    color: var(--text);
    opacity: 0.5;
    font-family: var(--mono);
    display: flex;
    align-items: center;
    gap: 10px;
  }
}

.markdown-body {
  font-size: 1.15rem;
  line-height: 2;
  color: var(--text);
  font-family: var(--body);
  overflow-wrap: break-word;
  word-break: break-word;
  :deep(p) {
    margin-bottom: 2rem;
  }
  :deep(h2) {
    font-size: 2rem;
    color: var(--text-h);
    margin: 4rem 0 1.5rem;
    font-family: var(--heading);
  }
  :deep(h3) {
    font-size: 1.5rem;
    color: var(--text-h);
    margin: 3rem 0 1rem;
    font-family: var(--heading);
  }
  :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 12px;
    margin: 2rem 0;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }
  :deep(blockquote) {
    border-left: 4px solid var(--accent);
    padding: 1rem 2rem;
    margin: 2rem 0;
    background: var(--code-bg);
    border-radius: 0 12px 12px 0;
    font-style: italic;
    opacity: 0.8;
  }
  :deep(pre) {
    background: #1a1a1a;
    padding: 2rem;
    border-radius: 16px;
    overflow-x: auto;
    max-width: 100%;
    margin: 2rem 0;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  :deep(code) {
    font-family: var(--mono);
    background: var(--code-bg);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.9em;
    word-break: break-all;
  }
}

.article-footer {
  margin-top: 80px;
  padding-top: 40px;
  border-top: 1px solid var(--border);
  .tags-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    .tag-item {
      font-size: 0.9rem;
      color: var(--text);
      opacity: 0.4;
      font-family: var(--mono);
      transition: opacity 0.3s;
      &:hover {
        opacity: 0.8;
        color: var(--accent);
      }
    }
  }
}

.skeleton-title {
  height: 60px;
  background: var(--border);
  margin-bottom: 30px;
  border-radius: 12px;
}
.skeleton-meta {
  height: 20px;
  width: 200px;
  background: var(--border);
  margin: 0 auto 60px;
  border-radius: 10px;
}
.skeleton-content {
  height: 400px;
  background: var(--border);
  border-radius: 20px;
}

.error-state {
  text-align: center;
  padding: 100px 0;
  .retry-btn {
    margin-top: 20px;
    padding: 10px 24px;
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: 30px;
    cursor: pointer;
  }
}

@media (max-width: 768px) {
  .article-header .title {
    font-size: 2.2rem;
  }
  .markdown-body {
    font-size: 1.05rem;
  }
}
</style>
