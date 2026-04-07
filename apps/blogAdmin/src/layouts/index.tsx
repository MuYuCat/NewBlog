import React, { useState } from 'react';
import { ProLayout } from '@ant-design/pro-components';
import { Outlet, Link, useLocation, useModel, history } from '@umijs/max';
import { Avatar, Modal, Form, Input, message, Button, Space } from 'antd';
import { UserOutlined, MailOutlined, KeyOutlined, LogoutOutlined } from '@ant-design/icons';
import './index.scss';

export default function Layout() {
  const location = useLocation();
  const { initialState, setInitialState } = useModel('@@initialState');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  if (!initialState?.isLoggedIn && location.pathname !== '/login') {
    return null; // app.ts handles the redirection
  }

  const currentUser = initialState?.currentUser;

  const handleLogout = () => {
    Modal.confirm({
      title: '确认退出',
      content: '确定要退出管理系统吗？',
      centered: true,
      onOk: () => {
        localStorage.removeItem('admin-token');
        setInitialState({ isLoggedIn: false });
        history.push('/login');
        message.success('已安全退出');
      },
    });
  };

  const handleUpdateProfile = (values: any) => {
    // 实际应请求接口
    setInitialState({
      ...initialState,
      isLoggedIn: true,
      currentUser: {
        ...currentUser!,
        username: values.username,
      },
    });
    message.success('个人信息已更新');
    setIsModalOpen(false);
  };

  return (
    <div style={{ height: '100vh' }}>
      <ProLayout
        title="MuYuCat Admin"
        logo="https://gw.alipayobjects.com/zos/antfincdn/upFE76qqKE/21591244-7274-4c54-b5c0-6d3614607635.png"
        layout="side"
        location={location}
        menuItemRender={(item, dom) => <Link to={item.path || '/'}>{dom}</Link>}
        // 侧边栏底部渲染
        menuFooterRender={(props) => {
          if (props?.collapsed) return null;
          return (
            <div className="sidebar-footer">
              <div className="sidebar-profile" onClick={() => setIsModalOpen(true)}>
                <Avatar
                  src={currentUser?.avatar}
                  icon={<UserOutlined />}
                  className="profile-avatar"
                  style={{ border: '1px solid rgba(138, 43, 226, 0.2)' }}
                />
                <div className="profile-info">
                  <span className="profile-name">{currentUser?.username || '管理员'}</span>
                  <span className="profile-role">Elite Administrator</span>
                </div>
              </div>
              <div className="logout-btn-container">
                <Button
                  icon={<LogoutOutlined />}
                  className="logout-btn"
                  onClick={handleLogout}
                  ghost
                >
                  安全退出
                </Button>
              </div>
            </div>
          );
        }}
      >
        <div style={{ minHeight: 'calc(100vh - 120px)', padding: '24px' }}>
          <Outlet />
        </div>
      </ProLayout>

      {/* 个人信息修改弹窗 */}
      <Modal
        title="管理账号设置"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
        width={400}
        styles={{ body: { paddingTop: '24px' } }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ username: currentUser?.username }}
          onFinish={handleUpdateProfile}
          requiredMark={false}
        >
          <Form.Item name="username" label="管理员姓名" rules={[{ required: true }]}>
            <Input prefix={<UserOutlined style={{ opacity: 0.3 }} />} />
          </Form.Item>
          <Form.Item name="password" label="新安全密钥 (不修改请留空)">
            <Input.Password
              prefix={<KeyOutlined style={{ opacity: 0.3 }} />}
              placeholder="留空则保持原密钥"
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, marginTop: '32px' }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              style={{ background: '#8a2be2', borderRadius: '10px', height: '40px' }}
            >
              保存全局配置
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
