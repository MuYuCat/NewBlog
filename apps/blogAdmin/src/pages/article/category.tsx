import React, { useState, useEffect, useMemo } from 'react';
import {
  Typography,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Skeleton,
  Radio,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ClusterOutlined,
  EyeOutlined,
  HeartOutlined,
} from '@ant-design/icons';
import { request } from '@umijs/max';
import { gsap } from 'gsap';
import './article.scss';

const { Title } = Typography;

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  type: number;
  order: number;
  _count?: {
    articles: number;
  };
  createdAt: string;
}

const CategoryPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CategoryItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await request<CategoryItem[]>('/category');
      setCategories(res);
      if (selectedCategory) {
        const updated = res.find((c) => c.id === selectedCategory.id);
        setSelectedCategory(updated || null);
      }
    } catch (error) {
      console.error('获取维度失败:', error);
      message.error('维度信号同步异常');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    gsap.from('.article-header-glass', { opacity: 0, y: -20, duration: 1, ease: 'expo.out' });
  }, []);

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({ order: 0, type: 1 });
    setIsModalOpen(true);
  };

  const handleEdit = (item: CategoryItem) => {
    setEditingItem(item);
    form.setFieldsValue(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await request(`/category/${id}`, { method: 'DELETE' });
      message.success('维度已抹除');
      if (selectedCategory?.id === id) setSelectedCategory(null);
      fetchCategories();
    } catch (e: any) {
      message.error(e.message || '抹除失败，可能存在关联数据');
    }
  };

  const onFinish = async (values: any) => {
    try {
      if (editingItem) {
        await request(`/category/${editingItem.id}`, { method: 'PATCH', data: values });
        message.success('维度协议已更新');
      } else {
        await request('/category', { method: 'POST', data: values });
        message.success('新维度已部署');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('维度部署失败:', error);
    }
  };

  const stats = useMemo(() => {
    const total = categories.length;
    const totalArticles = categories.reduce((acc, curr) => acc + (curr._count?.articles || 0), 0);
    return { total, totalArticles };
  }, [categories]);

  const toggleSelect = (item: CategoryItem) => {
    const isDeselecting = selectedCategory?.id === item.id;
    const tl = gsap.timeline();
    tl.to('.detail-panel-glass', {
      x: isDeselecting ? 30 : -30,
      opacity: 0,
      filter: 'blur(10px)',
      duration: 0.3,
      ease: 'power2.in',
    });
    tl.add(() => setSelectedCategory(isDeselecting ? null : item));
    tl.to('.detail-panel-glass', {
      x: 0,
      opacity: 1,
      filter: 'blur(0px)',
      duration: 0.5,
      ease: 'power2.out',
    });
  };

  return (
    <div className="article-management-container animate-fade-in">
      <div className="article-header-glass">
        <div className="title-area">
          <Title level={2}>主题维度</Title>
          <span>内容聚合与分类轨道控制</span>
        </div>
        <div className="global-actions">
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            style={{ borderRadius: '16px', height: '56px', padding: '0 24px' }}
          >
            部署新维度
          </Button>
        </div>
      </div>

      <div className="article-main-content">
        <div className="bento-grid">
          {loading ? (
            Array(4)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="bento-card skeleton-card">
                  <Skeleton active paragraph={{ rows: 2 }} title={false} />
                </div>
              ))
          ) : (
            <>
              {categories.map((item) => (
                <div
                  key={item.id}
                  className={`bento-card ${selectedCategory?.id === item.id ? 'active' : ''}`}
                  onClick={() => toggleSelect(item)}
                >
                  <div className="card-head">
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <span className="name">{item.name}</span>
                      {item.type === 2 ? (
                        <HeartOutlined style={{ color: '#ff4d4f', fontSize: '14px' }} />
                      ) : (
                        <EyeOutlined style={{ opacity: 0.3, fontSize: '14px' }} />
                      )}
                    </div>
                    <span className="slug">{item.slug}</span>
                  </div>
                  <div className="card-foot">
                    <div className="count">
                      <strong>{item._count?.articles || 0}</strong> 内容镜像
                    </div>
                    <div className="order-tag">W-{item.order}</div>
                  </div>
                </div>
              ))}
              <div className="add-card-btn" onClick={handleAdd}>
                <PlusOutlined style={{ fontSize: '24px' }} />
                <span>发射新维度</span>
              </div>
            </>
          )}
        </div>

        <div className="detail-panel-glass">
          {selectedCategory ? (
            <>
              <div className="panel-header">
                <span className="panel-title">{selectedCategory.name}</span>
                <Space size={16}>
                  <Button
                    type="text"
                    size="large"
                    shape="circle"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(selectedCategory)}
                  />
                  <Popconfirm
                    title="确定抹除此维度？"
                    onConfirm={() => handleDelete(selectedCategory.id)}
                  >
                    <Button
                      size="large"
                      type="text"
                      danger
                      shape="circle"
                      icon={<DeleteOutlined />}
                    />
                  </Popconfirm>
                </Space>
              </div>
              <div className="panel-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <div
                    className="stat-row"
                    style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}
                  >
                    <div
                      style={{
                        background: 'rgba(var(--text-color-rgb), 0.02)',
                        padding: '1.5rem',
                        borderRadius: '20px',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.7rem',
                          color: 'var(--text-secondary)',
                          textTransform: 'uppercase',
                          marginBottom: '8px',
                        }}
                      >
                        关联内容
                      </div>
                      <div
                        style={{
                          fontSize: '2rem',
                          fontWeight: 800,
                          fontFamily: 'Cormorant Garamond',
                        }}
                      >
                        {selectedCategory._count?.articles || 0}
                      </div>
                    </div>
                    <div
                      style={{
                        background: 'rgba(var(--text-color-rgb), 0.02)',
                        padding: '1.5rem',
                        borderRadius: '20px',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.7rem',
                          color: 'var(--text-secondary)',
                          textTransform: 'uppercase',
                          marginBottom: '8px',
                        }}
                      >
                        排序权重
                      </div>
                      <div
                        style={{
                          fontSize: '2rem',
                          fontWeight: 800,
                          fontFamily: 'Cormorant Garamond',
                        }}
                      >
                        {selectedCategory.order}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '1.5rem',
                      borderRadius: '20px',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '1rem',
                      }}
                    >
                      维度元数据
                    </div>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ opacity: 0.5 }}>唯一标识:</span>
                        <code style={{ color: 'var(--text-main)' }}>{selectedCategory.slug}</code>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ opacity: 0.5 }}>属性归类:</span>
                        <Tag
                          color={selectedCategory.type === 2 ? 'magenta' : 'blue'}
                          bordered={false}
                          style={{ borderRadius: '4px', margin: 0 }}
                        >
                          {selectedCategory.type === 2 ? '心语' : '大众'}
                        </Tag>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ opacity: 0.5 }}>创建时间:</span>
                        <span>{new Date(selectedCategory.createdAt).toLocaleString()}</span>
                      </div>
                    </Space>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div
              className="panel-body"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                opacity: 0.5,
              }}
            >
              <ClusterOutlined style={{ fontSize: '48px', marginBottom: '1rem' }} />
              <div style={{ textAlign: 'center' }}>
                <Title level={4}>维度概览</Title>
                <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
                  <div>
                    <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.total}</div>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>总维度数</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.totalArticles}</div>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>总内容量</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        title={editingItem ? '重构维度属性' : '部署新维度'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        className="article-elite-modal"
        footer={null}
        centered
        width={480}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input className="elite-input" placeholder="输入维度名称" />
          </Form.Item>
          <Form.Item name="slug" label="标识 (Slug)" rules={[{ required: true }]}>
            <Input className="elite-input" placeholder="如: frontend" />
          </Form.Item>
          <Form.Item name="type" label="维度属性" rules={[{ required: true }]}>
            <Radio.Group className="elite-radio-group">
              <Radio.Button value={1}>
                <Space>
                  <EyeOutlined /> 大众
                </Space>
              </Radio.Button>
              <Radio.Button value={2}>
                <Space>
                  <HeartOutlined /> 心语
                </Space>
              </Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="order" label="排序权重">
            <InputNumber className="elite-input" style={{ width: '100%' }} />
          </Form.Item>
          <div style={{ marginTop: '2rem', display: 'flex', gap: '12px' }}>
            <Button
              size="large"
              style={{ flex: 1, borderRadius: '12px' }}
              onClick={() => setIsModalOpen(false)}
            >
              取消
            </Button>
            <Button
              size="large"
              type="primary"
              style={{ flex: 1, borderRadius: '12px' }}
              htmlType="submit"
            >
              同步协议
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryPage;
