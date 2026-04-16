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
});

// 特效相关状态
const contentRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const isEffectActive = ref(false);
const isReturning = ref(false);
const showContent = ref(true);

let idleTimer: any = null;
const IDLE_TIME = 30000;
// 3 秒触发测试

const fetchArticle = async () => {
  const id = props.initialId || new URLSearchParams(window.location.search).get('id');
  if (!id) return;

  loading.value = true;
  try {
    const data = await request(`/article/${id}`);
    article.value = data;

    // 增加点击量
    request(`/article/${id}/click`, { method: 'PATCH' }).catch(() => {});

    // 数据加载后，确保 DOM 渲染完成再启动计时
    nextTick(() => {
      console.log('文章内容已渲染，静置计时开始 (3s)...');
      resetIdleTimer();
    });
  } catch (e) {
    console.error('获取文章失败:', e);
  } finally {
    loading.value = false;
  }
};

// --- 物理特效核心逻辑 (Matter.js + Pretext) ---

let engine: Matter.Engine;
let animationId: number | null = null;

const initEffect = () => {
  if (!contentRef.value || !canvasRef.value || !article.value) return;

  // 锁定 body 滚动并隐藏其他元素
  document.body.classList.add('lock-scroll');
  isReturning.value = false;

  const canvas = canvasRef.value;
  const container = contentRef.value;
  const rect = container.getBoundingClientRect();

  // 1. 使用 Pretext 高性能测量文本
  const text = container.innerText;
  if (!text.trim()) return;

  const computedStyle = window.getComputedStyle(container);
  const font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;
  const prepared = prepareWithSegments(text, font);
  const maxWidth = rect.width;
  const lineHeight = parseFloat(computedStyle.lineHeight || '24');
  const layoutResult = layoutWithLines(prepared, maxWidth, lineHeight);

  // 2. 初始化 Matter.js 物理引擎
  engine = Matter.Engine.create({ enableSleeping: true });
  const world = engine.world;
  world.gravity.y = 1.8;
  engine.constraintIterations = 1;
  engine.positionIterations = 2;
  engine.velocityIterations = 2;

  // 1. 物理容器
  const wallOptions = { isStatic: true, restitution: 0.2, friction: 0.05 };
  const ground = Matter.Bodies.rectangle(
    window.innerWidth / 2,
    window.innerHeight + 25,
    window.innerWidth,
    50,
    wallOptions,
  );
  const leftWall = Matter.Bodies.rectangle(
    -25,
    window.innerHeight / 2,
    50,
    window.innerHeight,
    wallOptions,
  );
  const rightWall = Matter.Bodies.rectangle(
    window.innerWidth + 25,
    window.innerHeight / 2,
    50,
    window.innerHeight,
    wallOptions,
  );
  Matter.World.add(world, [ground, leftWall, rightWall]);

  const measureCtx = document.createElement('canvas').getContext('2d')!;
  measureCtx.font = font;

  const bodies: {
    body: Matter.Body;
    char: string;
    size: number;
    color: string;
    font: string;
    relX: number;
    relY: number;
  }[] = [];
  const color = computedStyle.color;
  const containerLeft = rect.left;
  const containerTop = rect.top;
  const MAX_BODIES = 600;

  for (let lineIndex = 0; lineIndex < layoutResult.lines.length; lineIndex++) {
    if (bodies.length >= MAX_BODIES) break;
    const line = layoutResult.lines[lineIndex];
    const lineY = containerTop + lineIndex * lineHeight;
    if (lineY > window.innerHeight || lineY < -window.innerHeight) continue;

    const chars = Array.from(line.text);
    let currentX = containerLeft;
    const chunkSize = 3;

    for (let i = 0; i < chars.length; i += chunkSize) {
      if (bodies.length >= MAX_BODIES) break;
      const chunk = chars.slice(i, i + chunkSize);
      const chunkText = chunk.join('');
      const chunkWidth = measureCtx.measureText(chunkText).width;

      if (chunkText.trim() !== '') {
        const tx = currentX + chunkWidth / 2;
        const ty = lineY + lineHeight / 2;
        const relX = tx - containerLeft;
        const relY = ty - containerTop;

        const body = Matter.Bodies.rectangle(tx, ty, chunkWidth, lineHeight * 0.7, {
          restitution: 0.1,
          friction: 0.02,
          frictionAir: 0.002,
          slop: 0.5,
          chamfer: { radius: 4 },
        });

        Matter.Body.setVelocity(body, { x: (Math.random() - 0.5) * 2, y: 8 + Math.random() * 6 });
        bodies.push({
          body,
          char: chunkText,
          size: parseFloat(computedStyle.fontSize),
          color,
          font: computedStyle.fontFamily,
          relX,
          relY,
        });
      }
      currentX += chunkWidth;
    }
  }

  Matter.World.add(
    world,
    bodies.map((b) => b.body),
  );

  // 3. 自定义 Canvas 渲染循环
  const ctx = canvas.getContext('2d')!;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const run = () => {
    if (!isEffectActive.value) return;

    if (!isReturning.value) {
      Matter.Engine.update(engine, 16.666);
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const time = Date.now();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let allHome = true;
    const currentRect = isReturning.value ? contentRef.value?.getBoundingClientRect() : null;

    bodies.forEach((b) => {
      let { position, angle } = b.body;

      if (isReturning.value && currentRect) {
        const targetX = currentRect.left + b.relX;
        const targetY = currentRect.top + b.relY;
        const dx = targetX - position.x;
        const dy = targetY - position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // 归位逻辑：极速磁吸
        if (dist > 1) {
          allHome = false;
          const speed = 0.45; // 进一步提速
          Matter.Body.setPosition(b.body, {
            x: position.x + dx * speed,
            y: position.y + dy * speed,
          });
          Matter.Body.setAngle(b.body, angle * 0.6); // 更快摆正

          // 视觉掩护：当文字快飞到家时，提前淡入底层 DOM
          if (dist < 50 && !showContent.value) {
            showContent.value = true;
          }
        } else {
          Matter.Body.setPosition(b.body, { x: targetX, y: targetY });
          Matter.Body.setAngle(b.body, 0);
        }
      } else {
        // ...潮汐力场逻辑不变...
        if (position.y > window.innerHeight - 300) {
          const tideFreq = 0.0015;
          const tideForce = Math.sin(time * tideFreq) * 0.0018;
          Matter.Body.applyForce(b.body, position, {
            x: tideForce,
            y: Math.cos(time * 0.0012) * 0.0006 - 0.0004,
          });
          if (position.y > window.innerHeight - 80) {
            Matter.Body.setVelocity(b.body, {
              x: b.body.velocity.x * 0.98,
              y: b.body.velocity.y * 0.96,
            });
          }
        }
      }

      ctx.save();
      ctx.translate(position.x, position.y);
      if (angle !== 0 || isReturning.value) ctx.rotate(angle);
      // 归位末尾轻微淡出 Canvas 上的字，让衔接更柔和
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
  // 关键：归位结束后，重新开始静置计时
  resetIdleTimer();
};

const resetIdleTimer = () => {
  if (isEffectActive.value) return;
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    initEffect();
  }, IDLE_TIME);
};

const handleActivity = () => {
  if (isEffectActive.value && !isReturning.value) {
    isReturning.value = true;
    // 归位时关闭碰撞，防止回飞过程中“打架”
    engine.world.bodies.forEach((b) => {
      b.collisionFilter = { group: -1, mask: 0, category: 0 };
    });
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
  <div class="article-detail-container" :class="{ 'effect-running': isEffectActive }">
    <!-- 物理特效画布 -->
    <canvas v-show="isEffectActive" ref="canvasRef" class="effect-canvas"></canvas>

    <div v-if="loading" class="loading-state">
      <div class="skeleton-title"></div>
      <div class="skeleton-meta"></div>
      <div class="skeleton-content"></div>
    </div>

    <article
      v-else-if="article"
      class="article-content-wrapper"
      :style="{ opacity: showContent ? 1 : 0 }"
    >
      <header class="article-header">
        <div class="category-tags">
          <span v-for="cat in article.categories" :key="cat.id" class="cat-tag">
            {{ cat.name }}
          </span>
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
          <span v-for="tag in article.tags" :key="tag.id" class="tag-item"> # {{ tag.name }} </span>
        </div>
      </footer>
    </article>

    <div v-else class="error-state">
      <p>协议数据丢失，无法解析镜像</p>
      <button @click="fetchArticle" class="retry-btn">重试同步</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.article-detail-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 24px 120px;
  min-height: 100vh;
  position: relative;
  transition: background 1s ease;

  &.effect-running {
    overflow: hidden;
  }
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

.article-content-wrapper {
  transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.article-header {
  margin-bottom: 60px;
  text-align: center;

  .category-tags {
    display: flex;
    justify-content: center;
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
    justify-content: center;
    align-items: center;
    gap: 10px;
  }
}

.markdown-body {
  font-size: 1.15rem;
  line-height: 2;
  color: var(--text);
  font-family: var(--body);

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
    margin: 2rem 0;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  :deep(code) {
    font-family: var(--mono);
    background: var(--code-bg);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.9em;
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

/* Skeleton Loading */
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
