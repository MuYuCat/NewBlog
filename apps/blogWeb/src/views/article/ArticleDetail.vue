<script setup lang="ts">
import { ref, onMounted } from 'vue';

// 1. 定义 Props，接收从 Astro 传进来的初始值
const props = defineProps<{
  initialId?: string | null;
  initialTitle?: string | null;
}>();

const currentId = ref(props.initialId);
const currentTitle = ref(props.initialTitle);

onMounted(() => {
  // 2. 在客户端使用 URLSearchParams 读取
  const params = new URLSearchParams(window.location.search);
  console.log('%c [ params ]-16', 'font-size:13px; background:#56f39e; color:#9affe2;', params);

  // 如果 Astro 传进来的是空的（在 SSG 模式下常见），则从客户端获取
  if (!currentId.value) currentId.value = params.get('id');
  console.log(
    '%c [ currentId.value  ]-20',
    'font-size:13px; background:#e5ecf2; color:#ffffff;',
    currentId.value,
  );
  if (!currentTitle.value) currentTitle.value = params.get('title');
  console.log(
    '%c [ currentTitle.value ]-22',
    'font-size:13px; background:#4c5733; color:#909b77;',
    currentTitle.value,
  );
});
</script>

<template>
  <div class="article-info reveal">
    <div class="header-box">
      <span class="tag">QUERY PARAMS DEMO</span>
      <h1>路由参数解析测试</h1>
    </div>

    <div class="data-box">
      <div class="item">
        <label>ID 参数</label>
        <p>{{ currentId || '未识别 (请在 URL 中添加 ?id=xxx)' }}</p>
      </div>
      <div class="item">
        <label>TITLE 参数</label>
        <p>{{ currentTitle || '未识别 (请在 URL 中添加 &title=xxx)' }}</p>
      </div>
    </div>

    <div class="tip-box">
      <p>
        💡 提示：在浏览器地址栏末尾尝试输入 <code>?id=123&title=AstroVue</code> 即可实时同步数据。
      </p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.article-info {
  padding: 120px 24px;
  max-width: 700px;
  margin: 0 auto;
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.header-box {
  margin-bottom: 40px;
  text-align: center;

  h1 {
    font-size: 2.5rem;
    font-weight: 800;
    margin: 12px 0;
    color: #fff;
  }
  .tag {
    font-size: 0.75rem;
    color: #666;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }
}

.data-box {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 40px;
  backdrop-filter: blur(10px);

  .item {
    margin-bottom: 32px;
    &:last-child {
      margin-bottom: 0;
    }

    label {
      font-size: 0.7rem;
      color: #444;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-weight: 700;
    }
    p {
      font-size: 1.2rem;
      color: #fff;
      margin: 8px 0 0;
      font-family: 'Inter', monospace;
    }
  }
}

.tip-box {
  margin-top: 40px;
  text-align: center;
  color: #555;
  font-size: 0.9rem;

  code {
    background: #1a1a1a;
    padding: 4px 8px;
    border-radius: 6px;
    color: #888;
  }
}

/* 简单的渐入动效 */
.reveal {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeIn 0.8s forwards ease-out;
}

@keyframes fadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
