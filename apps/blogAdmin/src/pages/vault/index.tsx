import React, { useState, useEffect } from 'react';
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
  Skeleton,
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
  SyncOutlined,
} from '@ant-design/icons';
import { request } from '@umijs/max';
import { gsap } from 'gsap';
import './index.scss';

const { Title, Paragraph } = Typography;

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
  id: number;
  name: string;
  color: string;
}

interface VaultResource {
  id: number;
  title: string;
  url: string;
  tags: VaultTag[];
  description?: string;
  coverUrl?: string;
}

const VaultPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const [resources, setResources] = useState<VaultResource[]>([]);
  const [tags, setTags] = useState<VaultTag[]>([]);

  const [isResModalOpen, setIsResModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [editingResId, setEditingResId] = useState<number | null>(null);
  const [editingTagId, setEditingTagId] = useState<number | null>(null);

  const [resForm] = Form.useForm();
  const [tagForm] = Form.useForm();

  const fetchTags = async () => {
    try {
      const res = await request('/vault/tags');
      setTags(res);
    } catch (error) {
      console.error('获取维度失败:', error);
    }
  };

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchText) params.search = searchText;
      if (selectedTagIds.length > 0) params.tagIds = selectedTagIds.join(',');
      const res = await request('/vault/bookmarks', { params });
      setResources(res);
    } catch (error) {
      console.error('获取资源失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    await Promise.all([fetchTags(), fetchResources()]);
    setTimeout(() => {
      setSyncing(false);
      message.success('全量索引同步完成');
    }, 800);
  };

  useEffect(() => {
    fetchTags();
    gsap.from('.vault-header-glass', { opacity: 0, y: -20, duration: 1, ease: 'expo.out' });
  }, []);

  useEffect(() => {
    fetchResources();
  }, [searchText, selectedTagIds]);

  const openResModal = (res?: VaultResource) => {
    setEditingResId(res ? res.id : null);
    if (res) {
      resForm.setFieldsValue({
        ...res,
        tagIds: res.tags.map((t) => t.id),
      });
    } else {
      resForm.resetFields();
    }
    setIsResModalOpen(true);
  };

  const handleSaveResource = async (values: any) => {
    try {
      if (editingResId) {
        await request(`/vault/bookmarks/${editingResId}`, { method: 'PATCH', data: values });
        message.success('协议同步成功');
      } else {
        await request('/vault/bookmarks', { method: 'POST', data: values });
        message.success('新资源已入库');
      }
      setIsResModalOpen(false);
      fetchResources();
    } catch (error) {
      console.error('保存资源失败:', error);
    }
  };

  const handleDeleteResource = async (id: number) => {
    try {
      await request(`/vault/bookmarks/${id}`, { method: 'DELETE' });
      message.success('资源已移除');
      fetchResources();
    } catch (error) {
      console.error('删除资源失败:', error);
    }
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

  const handleSaveTag = async (values: any) => {
    try {
      if (editingTagId) {
        await request(`/vault/tags/${editingTagId}`, { method: 'PATCH', data: values });
        message.success('维度已重构');
      } else {
        const randomColor = ELITE_COLORS[Math.floor(Math.random() * ELITE_COLORS.length)].value;
        await request('/vault/tags', { method: 'POST', data: { ...values, color: randomColor } });
        message.success('新维度已部署');
      }
      setIsTagModalOpen(false);
      fetchTags();
    } catch (error) {
      console.error('保存标签失败:', error);
    }
  };

  const handleDeleteTag = async (id: number) => {
    try {
      await request(`/vault/tags/${id}`, { method: 'DELETE' });
      message.success('维度已抹除');
      fetchTags();
      fetchResources();
    } catch (error) {
      console.error('删除标签失败:', error);
    }
  };

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
          <Title level={2}>资源宝库</Title>
          <span>剪藏空间站</span>
        </div>
        <div className="global-actions">
          <Space size={16}>
            <Button
              size="large"
              icon={<SyncOutlined spin={syncing} />}
              onClick={handleSync}
              style={{ borderRadius: '16px', height: '56px', padding: '0 20px' }}
            >
              刷新同步
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<ThunderboltFilled />}
              onClick={() => openResModal()}
              className="elite-launch-btn"
            >
              收录资源镜像
            </Button>
          </Space>
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
            >
              {tags.map((t) => (
                <Select.Option key={t.id} value={t.id}>
                  {t.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div className="vault-resource-grid">
            {loading ? (
              Array(6)
                .fill(0)
                .map((_, i) => (
                  <div className="vault-resource-card" key={i}>
                    <Skeleton active paragraph={{ rows: 3 }} />
                  </div>
                ))
            ) : resources.length > 0 ? (
              resources.map((item) => (
                <div className="vault-resource-card" key={item.id}>
                  <div className="card-header">
                    <div className="brand-box">
                      <img
                        src={getFavicon(item.url) || ''}
                        alt="icon"
                        onLoad={(e) => (e.currentTarget.nextElementSibling!.style.display = 'none')}
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                      <GlobalOutlined className="fallback-icon" />
                    </div>
                    <div className="info-area">
                      <Title level={5} ellipsis={{ tooltip: item.title }} className="res-title">
                        {item.title}
                      </Title>
                      <div className="tag-orbit">
                        {item.tags.map((t) => (
                          <Tag key={t.id} color={t.color} bordered={false}>
                            {t.name}
                          </Tag>
                        ))}
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
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="轨道空旷，无匹配数据"
                style={{ gridColumn: '1 / -1', marginTop: '2rem' }}
              />
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
                  <Popconfirm title="确认抹除？" onConfirm={() => handleDeleteTag(tag.id)}>
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
