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
  Switch,
  Empty,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { request } from '@umijs/max';
import { gsap } from 'gsap';
import './index.scss';

const { Title } = Typography;

interface MenuItem {
  id: number;
  name: string;
  path: string;
  i18nKey?: string;
  order: number;
  status: number;
  parentId?: number;
  children?: MenuItem[];
}

const MenuManagement: React.FC = () => {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [form] = Form.useForm();

  const fetchMenus = async () => {
    try {
      const res = await request('/menu/tree');
      setMenus(res);
      if (selectedMenu) {
        const updated = res.find((m: MenuItem) => m.id === selectedMenu.id);
        setSelectedMenu(updated || null);
      }
    } catch (error) {
      console.error('获取菜单轨道失败:', error);
    }
  };

  useEffect(() => {
    fetchMenus();
    gsap.from('.menu-header-glass', { opacity: 0, y: -20, duration: 1, ease: 'expo.out' });
  }, []);

  const handleAdd = (parentId?: number) => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({ parentId, order: 0 });
    setIsModalOpen(true);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    form.setFieldsValue(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    await request(`/menu/${id}`, { method: 'DELETE' });
    message.success('节点已移除');
    if (selectedMenu?.id === id) setSelectedMenu(null);
    fetchMenus();
  };

  const handleStatusChange = async (item: MenuItem, status: boolean) => {
    await request(`/menu/${item.id}`, { method: 'PATCH', data: { status: status ? 1 : 0 } });
    message.success(`节点已${status ? '上线' : '下线'}`);
    fetchMenus();
  };

  const onFinish = async (values: any) => {
    try {
      if (editingItem) {
        await request(`/menu/${editingItem.id}`, { method: 'PATCH', data: values });
        message.success('节点已同步');
      } else {
        await request('/menu', { method: 'POST', data: values });
        message.success('节点已发射');
      }
      setIsModalOpen(false);
      fetchMenus();
    } catch (error) {
      console.error('节点同步失败:', error);
    }
  };

  // --- 统计数据深度计算 ---
  const stats = useMemo(() => {
    let total = 0;
    let online = 0;
    let paused = 0;
    let subNodes = 0;

    const traverse = (items: MenuItem[], isRoot = true) => {
      items.forEach((item) => {
        total++;
        if (item.status === 1) online++;
        else paused++;
        if (!isRoot) subNodes++;
        if (item.children && item.children.length > 0) {
          traverse(item.children, false);
        }
      });
    };
    traverse(menus);
    return { total, online, paused, subNodes };
  }, [menus]);

  const toggleSelectMenu = (item: MenuItem) => {
    const isDeselecting = selectedMenu?.id === item.id;
    const tl = gsap.timeline();
    tl.to('.detail-panel-glass', {
      x: isDeselecting ? 30 : -30,
      opacity: 0,
      filter: 'blur(10px)',
      duration: 0.3,
      ease: 'power2.in',
    });
    tl.add(() => setSelectedMenu(isDeselecting ? null : item));
    tl.to('.detail-panel-glass', {
      x: 0,
      opacity: 1,
      filter: 'blur(0px)',
      duration: 0.5,
      ease: 'power2.out',
    });
  };

  return (
    <div className="menu-management-container animate-fade-in">
      <div className="menu-header-glass">
        <div className="title-area">
          <Title level={2}>菜单空间站</Title>
          <span>全栈路由轨道控制系统</span>
        </div>
      </div>

      <div className="menu-main-content">
        <div className="top-menu-grid">
          {menus.map((item) => (
            <div
              key={item.id}
              className={`menu-card-bento ${selectedMenu?.id === item.id ? 'active' : ''} ${item.status === 1 ? 'status-active' : 'status-inactive'}`}
              onClick={() => toggleSelectMenu(item)}
            >
              <div className="card-info">
                <span className="card-name">{item.name}</span>
                <span className="card-path">{item.path}</span>
              </div>
              <div className="weight-tag">W-{item.order}</div>
            </div>
          ))}
          <div className="add-card-placeholder" onClick={() => handleAdd()}>
            <PlusOutlined /> <span>发射节点</span>
          </div>
        </div>

        <div className="detail-panel-glass">
          {selectedMenu ? (
            <>
              <div className="panel-header">
                <span className="panel-title">{selectedMenu.name}</span>
                <Space size={16}>
                  <Switch
                    checked={selectedMenu.status === 1}
                    onChange={(val) => handleStatusChange(selectedMenu, val)}
                  />
                  <Button
                    type="text"
                    size="large"
                    shape="circle"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(selectedMenu)}
                  />
                  <Popconfirm
                    title="确定删除节点？"
                    onConfirm={() => handleDelete(selectedMenu.id)}
                    okText="确定"
                    cancelText="取消"
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
                <div className="detail-info-section">
                  <div className="info-item">
                    <span className="label">路由路径</span>
                    <span className="value">{selectedMenu.path}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">英文标识 (Key)</span>
                    <span className="value">{selectedMenu.i18nKey || '未配置'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">排序权重</span>
                    <span className="value">{selectedMenu.order}</span>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <Title level={5}>子级节点管理</Title>
                </div>

                <div className="sub-menu-list">
                  {selectedMenu.children?.map((sub) => (
                    <div key={sub.id} className="sub-item-card">
                      <div className="sub-info">
                        <div className="sub-name">{sub.name}</div>
                        <div className="sub-path-tag">{sub.path}</div>
                      </div>
                      <Space>
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => handleEdit(sub)}
                        />
                        <Popconfirm title="确认删除？" onConfirm={() => handleDelete(sub.id)}>
                          <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                      </Space>
                    </div>
                  ))}
                  <Button
                    type="dashed"
                    block
                    icon={<PlusOutlined />}
                    style={{ borderRadius: '16px', height: '54px', marginTop: '1rem' }}
                    onClick={() => handleAdd(selectedMenu.id)}
                  >
                    发射子级节点
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="panel-body stats-panel">
              <div className="stats-header">
                <span className="label">矩阵概览 </span>
              </div>
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="val">{stats.total}</span>
                  <span className="lab">节点总数</span>
                </div>
                <div className="stat-card">
                  <span className="val" style={{ color: '#52c41a' }}>
                    {stats.online}
                  </span>
                  <span className="lab">已发射(开启)</span>
                </div>
                <div className="stat-card">
                  <span className="val" style={{ opacity: 0.4 }}>
                    {stats.paused}
                  </span>
                  <span className="lab">待命(关闭)</span>
                </div>
                <div className="stat-card">
                  <span className="val">{stats.subNodes}</span>
                  <span className="lab">二级子轨道</span>
                </div>
              </div>
              <div style={{ marginTop: '1rem', textAlign: 'center', opacity: 0.3 }}>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="请从左侧选择一个数据轨道进行配置"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        title={editingItem ? '校准节点协议' : '发射新节点'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        className="elite-glass-modal"
        width={600}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input className="elite-input" placeholder="输入节点显示名称" />
          </Form.Item>
          <Form.Item name="path" label="路径" rules={[{ required: true }]}>
            <Input className="elite-input" placeholder="例如: /dashboard" />
          </Form.Item>
          <Form.Item name="i18nKey" label="多语言键 (可选)">
            <Input className="elite-input" placeholder="英文标识名" />
          </Form.Item>
          <Form.Item name="order" label="排序权重">
            <InputNumber className="elite-input" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="parentId" hidden>
            <Input />
          </Form.Item>
          <div style={{ marginTop: '2rem', display: 'flex', gap: '16px' }}>
            <Button
              size="large"
              style={{ flex: 1, borderRadius: '16px' }}
              onClick={() => setIsModalOpen(false)}
            >
              取消
            </Button>
            <Button
              size="large"
              type="primary"
              style={{ flex: 1, borderRadius: '16px' }}
              htmlType="submit"
            >
              同步轨道
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default MenuManagement;
