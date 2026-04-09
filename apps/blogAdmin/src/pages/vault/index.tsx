import React, { useState, useRef, useMemo } from 'react';
import { Typography, Button, Space, Input, Modal, Form, Empty } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  LinkOutlined,
  SettingOutlined,
  ThunderboltFilled,
} from '@ant-design/icons';
import { gsap } from 'gsap';
import './vault.scss';

const { Text } = Typography;

// --- 类型定义 ---
interface Resource {
  id: number;
  title: string;
  url: string;
  desc: string;
  tags: string[];
  status: 'online' | 'paused';
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color?: string;
  matchTags?: string[];
}

// --- 初始 Mock 数据 ---
const INITIAL_CATEGORIES: Category[] = [
  { id: 'all', name: '全部资源', icon: 'AppstoreFilled' },
  {
    id: 'inspiration',
    name: '灵感策展',
    icon: 'StarFilled',
    color: '#f5222d',
    matchTags: ['UI', '设计', '动效'],
  },
  {
    id: 'tech',
    name: '技术智库',
    icon: 'ThunderboltFilled',
    color: '#1890ff',
    matchTags: ['后端', '框架', 'Web', '数据库', 'React', 'TS'],
  },
];

const INITIAL_RESOURCES: Resource[] = [
  {
    id: 1,
    title: 'Astro Framework',
    url: 'https://astro.build',
    desc: '面向内容驱动型网站的 Web 框架。默认零 JS 加载的孤岛架构。',
    tags: ['Web', 'Static', 'JS'],
    status: 'online',
  },
  {
    id: 2,
    title: 'GSAP Animation',
    url: 'https://gsap.com',
    desc: '为现代 Web 设计的专业级 JavaScript 动画引擎。',
    tags: ['动效', 'JS'],
    status: 'online',
  },
  {
    id: 3,
    title: 'Prisma ORM',
    url: 'https://prisma.io',
    desc: '面向 Node.js 和 TypeScript 的下一代 ORM 框架。',
    tags: ['后端', '数据库'],
    status: 'online',
  },
  {
    id: 4,
    title: 'UmiJS',
    url: 'https://umijs.org',
    desc: '可扩展的企业级前端应用框架，内置插件体系。',
    tags: ['React', '框架'],
    status: 'online',
  },
];

const VaultPage: React.FC = () => {
  const [resources] = useState<Resource[]>(INITIAL_RESOURCES);
  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 弹窗状态
  const [isResModalOpen, setIsResModalOpen] = useState(false);

  const detailPanelRef = useRef<HTMLDivElement>(null);

  // --- 过滤逻辑 ---
  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase());
      const cat = categories.find((c) => c.id === activeCategory);
      const matchesCategory =
        activeCategory === 'all' ||
        (cat?.matchTags && res.tags.some((t) => cat.matchTags?.includes(t)));
      return matchesSearch && matchesCategory;
    });
  }, [resources, activeCategory, searchQuery, categories]);

  // --- 交互动效：详情面板切入 ---
  const toggleSelectResource = (res: Resource) => {
    const isDeselecting = selectedResource?.id === res.id;
    const tl = gsap.timeline();

    tl.to('.detail-panel-glass', {
      x: isDeselecting ? 40 : -20,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        setSelectedResource(isDeselecting ? null : res);
        if (!isDeselecting) {
          gsap.fromTo(
            '.detail-panel-glass',
            { x: 40, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.6, ease: 'expo.out' },
          );
        }
      },
    });
  };

  // --- 获取 Favicon ---
  const getFavicon = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return '';
    }
  };

  return (
    <div className="vault-management-container">
      {/* 1. 沉浸式标题栏 */}
      <header className="vault-header-glass">
        <div className="title-area">
          <h2>Resource Vault</h2>
          <span>个人灵感智库与资源策展中心</span>
        </div>
        <div className="action-area">
          <div className="vault-search">
            <Input
              prefix={<SearchOutlined style={{ opacity: 0.3 }} />}
              placeholder="搜索数据轨道..."
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
            />
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            style={{ borderRadius: '16px', height: '50px', fontWeight: 700 }}
            onClick={() => setIsResModalOpen(true)}
          >
            捕获资源
          </Button>
        </div>
      </header>

      <div className="vault-main-content">
        {/* 2. 左侧：资源轨道网格 */}
        <div className="resource-track-grid">
          {filteredResources.map((res) => (
            <div
              key={res.id}
              className={`resource-card-bento ${selectedResource?.id === res.id ? 'active' : ''}`}
              onClick={() => toggleSelectResource(res)}
            >
              <div className="card-header">
                <div className="favicon-box">
                  <img
                    src={getFavicon(res.url)}
                    alt=""
                    onError={(e) =>
                      (e.currentTarget.src =
                        'https://api.dicebear.com/7.x/initials/svg?seed=' + res.title)
                    }
                  />
                </div>
                <div className={`status-indicator ${res.status}`}>{res.status.toUpperCase()}</div>
              </div>
              <div className="card-body">
                <span className="card-title">{res.title}</span>
                <span className="card-tags">{res.tags.join(' · ')}</span>
              </div>
            </div>
          ))}
          <div className="add-resource-placeholder" onClick={() => setIsResModalOpen(true)}>
            <PlusOutlined style={{ fontSize: '1.5rem' }} />
            <span>捕获新灵感</span>
          </div>
        </div>

        {/* 3. 右侧：磨砂玻璃详情面板 */}
        <div
          className="detail-panel-glass"
          ref={detailPanelRef}
          style={{
            opacity: selectedResource ? 1 : 0,
            transform: selectedResource ? 'none' : 'translateX(40px)',
          }}
        >
          {selectedResource ? (
            <>
              <div className="panel-header">
                <div className="panel-title">{selectedResource.title}</div>
                <div className="panel-actions">
                  <Space size={12}>
                    <Button
                      shape="circle"
                      icon={<EditOutlined />}
                      onClick={() => setIsResModalOpen(true)}
                    />
                    <Button shape="circle" icon={<DeleteOutlined />} danger />
                  </Space>
                </div>
              </div>
              <div className="panel-body">
                <div className="detail-section">
                  <span className="section-label">Core Protocol / 核心协议</span>
                  <div className="info-list">
                    <div className="info-item">
                      <span className="label">接入地址</span>
                      <span className="value">{selectedResource.url}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">同步状态</span>
                      <span className="value">
                        {selectedResource.status === 'online'
                          ? '已挂载 (ONLINE)'
                          : '待校准 (PAUSED)'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <span className="section-label">Metadata / 元数据摘要</span>
                  <Text style={{ opacity: 0.6, lineHeight: 1.8 }}>{selectedResource.desc}</Text>
                </div>

                <div className="detail-section">
                  <span className="section-label">Taxonomy / 分类频道</span>
                  <div className="category-tag-cloud">
                    {categories.map((cat) => (
                      <div
                        key={cat.id}
                        className={`cat-pill ${activeCategory === cat.id ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat.id)}
                      >
                        <SettingOutlined /> {cat.name}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: 'auto', padding: '2rem 0' }}>
                  <Button
                    type="primary"
                    block
                    size="large"
                    shape="round"
                    icon={<LinkOutlined />}
                    onClick={() => window.open(selectedResource.url)}
                  >
                    跳跃至源轨道
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.2,
              }}
            >
              <Empty description="选择一个数据信号以解码详情" />
            </div>
          )}
        </div>
      </div>

      {/* 4. 资源捕获弹窗 (对齐 Menu Modal) */}
      <Modal
        title="捕获新资源协议"
        open={isResModalOpen}
        onCancel={() => setIsResModalOpen(false)}
        className="elite-glass-modal elite-vault-modal"
        width={600}
        footer={[
          <Button key="cancel" onClick={() => setIsResModalOpen(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={() => setIsResModalOpen(false)}>
            确认同步
          </Button>,
        ]}
      >
        <Form layout="vertical">
          <Form.Item label="标识名">
            <Input className="elite-input" placeholder="输入资源名称" />
          </Form.Item>
          <Form.Item label="访问链路">
            <Input
              className="elite-input"
              placeholder="https://..."
              prefix={<ThunderboltFilled style={{ color: '#faad14' }} />}
            />
          </Form.Item>
          <Form.Item label="功能描述">
            <Input.TextArea
              className="elite-input"
              rows={4}
              style={{ height: 'auto' }}
              placeholder="描述该资源的独特价值..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VaultPage;
