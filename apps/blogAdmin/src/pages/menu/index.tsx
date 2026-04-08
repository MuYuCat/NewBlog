import React, { useState, useEffect } from 'react';
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

const { Title, Text } = Typography;

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
    } catch (e) {}
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
    } catch (e) {}
  };

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
                <span className="panel-title">{selectedMenu.name} · 节点详情</span>
                <Space size={16}>
                  <Switch
                    checked={selectedMenu.status === 1}
                    onChange={(val) => handleStatusChange(selectedMenu, val)}
                  />
                  <Button
                    type="text"
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
                    <Button type="text" danger shape="circle" icon={<DeleteOutlined />} />
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
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                opacity: 0.2,
              }}
            >
              <Empty description="请从左侧轨道网格中选择模块" />
            </div>
          )}
        </div>
      </div>

      <Modal
        title={editingItem ? '编辑轨道节点' : '发射新节点'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        centered
        width={500}
        footer={[
          <Button key="back" onClick={() => setIsModalOpen(false)}>
            放弃
          </Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()}>
            确认发射
          </Button>,
        ]}
        className="elite-glass-modal"
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="parentId" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="name" label="节点名称" rules={[{ required: true }]}>
            <Input className="elite-input" placeholder="例如：首页" />
          </Form.Item>
          <Form.Item name="path" label="路由路径" rules={[{ required: true }]}>
            <Input className="elite-input" placeholder="例如：/" />
          </Form.Item>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item name="i18nKey" label="英文标识 (Key / 英文名)" style={{ flex: 1.5 }}>
              <Input className="elite-input" placeholder="例如：Home" />
            </Form.Item>
            <Form.Item name="order" label="排序权重" style={{ flex: 1 }}>
              <InputNumber className="elite-input" style={{ width: '100%' }} />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default MenuManagement;
