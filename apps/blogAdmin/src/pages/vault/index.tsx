import React, { useState, useEffect, useMemo } from 'react';
import {
  Button,
  Input,
  Tag,
  Popconfirm,
  Modal,
  Form,
  Select,
  message,
  Tooltip,
  Typography,
  Space,
  Empty,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  GlobalOutlined,
  FilterOutlined,
  ArrowRightOutlined,
  ThunderboltFilled,
  CloseOutlined,
} from '@ant-design/icons';
import { gsap } from 'gsap';
import './index.scss';

const { Title, Text, Paragraph } = Typography;

// --- 系统预设色谱 ---
const ELITE_COLORS = [
  { name: '品红', value: 'magenta', hex: '#eb2f96' },
  { name: '靛蓝', value: 'blue', hex: '#1677ff' },
  { name: '青瓷', value: 'cyan', hex: '#13c2c2' },
  { name: '极客蓝', value: 'geekblue', hex: '#2f54eb' },
  { name: '紫色', value: 'purple', hex: '#722ed1' },
  { name: '赤橙', value: 'orange', hex: '#fa8c16' },
  { name: '极光绿', value: 'green', hex: '#52c41a' },
];

// --- 类型定义 ---
interface VaultTag {
  id: string;
  name: string;
  color: string;
}

interface VaultResource {
  id: string;
  title: string;
  url: string;
  tagIds: string[];
  description?: string;
}

const VaultPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const [resources, setResources] = useState<VaultResource[]>([
    {
      id: '1',
      title: 'GSAP 官方文档与动画生态指南',
      url: 'https://gsap.com/',
      tagIds: ['t1', 't3'],
      description:
        '业界最强大的 Web 动画引擎。支持时间轴控制、SVG 变形、滚动联动等顶级动效特性，是构建高奢交互的首选方案。',
    },
    {
      id: '2',
      title: 'Astro Islands 架构深度解析',
      url: 'https://astro.build/',
      tagIds: ['t2'],
      description:
        '探索革命性的孤岛架构（Islands Architecture）。通过按需加载交互组件，实现极致的性能优化与极速的 FCP 体验。',
    },
    {
      id: '3',
      title: 'Ant Design 5.0 设计规范',
      url: 'https://ant.design/',
      tagIds: ['t2', 't3'],
      description:
        '基于 Design Token 的全新响应式设计系统。通过动态主题引擎实现高效的 UI 风格定制与全栈色彩管理。',
    },
  ]);

  const [tags, setTags] = useState<VaultTag[]>([
    { id: 't1', name: '动效灵感', color: 'magenta' },
    { id: 't2', name: '前端基建', color: 'blue' },
    { id: 't3', name: '官方文档', color: 'cyan' },
  ]);

  const [isResModalOpen, setIsResModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [editingResId, setEditingResId] = useState<string | null>(null);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);

  const [resForm] = Form.useForm();
  const [tagForm] = Form.useForm();

  useEffect(() => {
    gsap.from('.vault-header-glass', { opacity: 0, y: -20, duration: 1, ease: 'expo.out' });
    gsap.from('.vault-resource-card', {
      opacity: 0,
      y: 20,
      stagger: 0.08,
      duration: 0.8,
      ease: 'power2.out',
    });
  }, []);

  const openResModal = (res?: VaultResource) => {
    setEditingResId(res ? res.id : null);
    if (res) resForm.setFieldsValue(res);
    else resForm.resetFields();
    setIsResModalOpen(true);
  };

  const handleSaveResource = (values: any) => {
    if (editingResId) {
      setResources((prev) => prev.map((r) => (r.id === editingResId ? { ...r, ...values } : r)));
      message.success('协议同步成功');
    } else {
      setResources([{ id: Date.now().toString(), ...values }, ...resources]);
      message.success('新资源已入库');
    }
    setIsResModalOpen(false);
  };

  const handleDeleteResource = (id: string) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
    message.success('资源已移除');
  };

  const openTagModal = (tag?: VaultTag) => {
    setEditingTagId(tag ? tag.id : null);
    if (tag) {
      tagForm.setFieldsValue(tag);
    } else {
      tagForm.resetFields();
    }
    setIsTagModalOpen(true);
  };

  const handleSaveTag = (values: any) => {
    if (editingTagId) {
      // 编辑时保留原有颜色
      const existingColor = tags.find((t) => t.id === editingTagId)?.color || 'blue';
      const finalTag = { ...values, color: existingColor };
      setTags((prev) => prev.map((t) => (t.id === editingTagId ? { ...t, ...finalTag } : t)));
      message.success('维度已重构');
    } else {
      // 新建时随机分配预设颜色
      const randomColor = ELITE_COLORS[Math.floor(Math.random() * ELITE_COLORS.length)].value;
      const finalTag = { ...values, color: randomColor };
      setTags([...tags, { id: Date.now().toString(), ...finalTag }]);
      message.success('新维度已部署');
    }
    setIsTagModalOpen(false);
  };

  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      const matchSearch =
        r.title.toLowerCase().includes(searchText.toLowerCase()) ||
        r.url.toLowerCase().includes(searchText.toLowerCase()) ||
        (r.description || '').toLowerCase().includes(searchText.toLowerCase());
      const matchTags =
        selectedTagIds.length === 0 || selectedTagIds.every((id) => r.tagIds.includes(id));
      return matchSearch && matchTags;
    });
  }, [resources, searchText, selectedTagIds]);

  const getFavicon = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } catch {
      return null;
    }
  };

  return (
    <div className="vault-page-container animate-fade-in">
      {/* 1. 顶部标题 */}
      <div className="vault-header-glass">
        <div className="title-area">
          <Title level={2}>剪藏空间站</Title>
          <span>NETWORK HOLOGRAPHIC ARCHIVE</span>
        </div>
        <div className="global-actions">
          <Button
            type="primary"
            size="large"
            icon={<ThunderboltFilled />}
            onClick={() => openResModal()}
            className="elite-launch-btn"
          >
            收录资源镜像
          </Button>
        </div>
      </div>

      {/* 2. 主体内容 */}
      <div className="vault-main-content">
        <div className="vault-left-rail">
          <div className="vault-bento-search">
            <Input
              prefix={<SearchOutlined />}
              placeholder="全量索引搜索..."
              variant="borderless"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="search-input"
            />
            <div className="divider" />
            <Select
              mode="multiple"
              placeholder="多维过滤"
              variant="borderless"
              className="tag-select"
              suffixIcon={<FilterOutlined />}
              maxTagCount="responsive"
              value={selectedTagIds}
              onChange={setSelectedTagIds}
              allowClear
            />
          </div>

          <div className="vault-resource-grid">
            {filteredResources.length > 0 ? (
              filteredResources.map((item) => (
                <div className="vault-resource-card" key={item.id}>
                  <div className="card-header">
                    <div className="brand-box">
                      <img
                        src={getFavicon(item.url) || ''}
                        alt="icon"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                      <GlobalOutlined className="fallback-icon" />
                    </div>
                    <div className="info-area">
                      <Title level={5} ellipsis={{ tooltip: item.title }} className="res-title">
                        {item.title}
                      </Title>
                      <div className="tag-orbit">
                        {item.tagIds.map((tid) => {
                          const t = tags.find((tag) => tag.id === tid);
                          return t ? (
                            <Tag key={t.id} color={t.color} bordered={false}>
                              {t.name}
                            </Tag>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="card-body">
                    <Paragraph ellipsis={{ rows: 2 }} className="res-desc">
                      {item.description || '该资源链路处于待机状态，暂无深度协议解析内容。'}
                    </Paragraph>
                  </div>

                  <div className="card-actions-dock">
                    <Tooltip title="访问原站">
                      <Button
                        type="text"
                        shape="circle"
                        icon={<ArrowRightOutlined />}
                        href={item.url}
                        target="_blank"
                      />
                    </Tooltip>
                    <Button
                      type="text"
                      shape="circle"
                      icon={<EditOutlined />}
                      onClick={() => openResModal(item)}
                    />
                    <Popconfirm
                      title="销毁此镜像？"
                      onConfirm={() => handleDeleteResource(item.id)}
                      placement="top"
                    >
                      <Button type="text" shape="circle" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </div>
                </div>
              ))
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="轨道空旷，无匹配数据" />
            )}
          </div>
        </div>

        <div className="vault-right-panel">
          <div className="panel-header">
            <span className="panel-title">维度空间</span>
          </div>
          <div className="panel-scroll-content">
            {tags.map((tag) => (
              <div className="tag-orbit-card" key={tag.id}>
                <div className="tag-info">
                  <div
                    className="status-dot"
                    style={{ backgroundColor: `var(--ant-${tag.color}-5)` }}
                  />
                  <span className="tag-name">{tag.name}</span>
                </div>
                <div className="tag-actions">
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => openTagModal(tag)}
                  />
                  <Popconfirm title="确认抹除？" onConfirm={() => message.info('仅演示')}>
                    <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </div>
              </div>
            ))}
            <Button
              type="dashed"
              block
              icon={<PlusOutlined />}
              onClick={() => openTagModal()}
              className="add-dim-btn"
            >
              部署新维度
            </Button>
          </div>
        </div>
      </div>

      {/* --- 资源镜像弹窗 --- */}
      <Modal
        title={editingResId ? '校准资源协议' : '收录资源镜像'}
        open={isResModalOpen}
        onCancel={() => setIsResModalOpen(false)}
        onOk={() => resForm.submit()}
        destroyOnClose
        centered
        width={560}
        okText={editingResId ? '确认校准' : '确认收录'}
        cancelText="取消"
      >
        <Form
          form={resForm}
          layout="vertical"
          onFinish={handleSaveResource}
          style={{ marginTop: 24 }}
        >
          <Form.Item
            name="title"
            label="镜像名称"
            rules={[{ required: true, message: '请输入资源名称' }]}
          >
            <Input placeholder="输入资源显示标题，例如：React 官方文档" />
          </Form.Item>
          <Form.Item
            name="url"
            label="资源链路"
            rules={[{ required: true, message: '请输入资源链接' }]}
          >
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="tagIds" label="注入维度">
            <Select mode="multiple" placeholder="请选择关联的维度标签" allowClear>
              {tags.map((t) => (
                <Select.Option key={t.id} value={t.id}>
                  {t.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="description" label="协议简介" style={{ marginBottom: 0 }}>
            <Input.TextArea rows={4} placeholder="输入对此资源的描述或用途..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* --- 维度空间弹窗 --- */}
      <Modal
        title={editingTagId ? '重构维度属性' : '部署全新维度'}
        open={isTagModalOpen}
        onCancel={() => setIsTagModalOpen(false)}
        onOk={() => tagForm.submit()}
        destroyOnClose
        centered
        width={400}
        okText="确认部署"
        cancelText="取消"
      >
        <Form
          form={tagForm}
          layout="vertical"
          onFinish={handleSaveTag}
          style={{ marginTop: 24, marginBottom: -8 }}
        >
          <Form.Item
            name="name"
            label="标识名称"
            rules={[{ required: true, message: '请输入维度名称' }]}
          >
            <Input placeholder="例如：交互灵感" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VaultPage;
