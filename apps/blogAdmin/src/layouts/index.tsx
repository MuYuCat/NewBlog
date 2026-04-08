import { history, Outlet, useModel, useLocation } from '@umijs/max';
import { Layout, Menu, Button, Avatar, Modal, ConfigProvider, theme } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  SunOutlined,
  MoonOutlined,
  DashboardOutlined,
  MenuOutlined,
  PlaySquareOutlined,
  ReadOutlined,
  FolderOpenOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import React, { useEffect } from 'react';

// 导入 PITAO 系列头像
import pitao01 from '@/assets/PITAO-baomao.png';
import pitao02 from '@/assets/PITAO-beijixiong.png';
import pitao03 from '@/assets/PITAO-cangshu.png';
import pitao04 from '@/assets/PITAO-heimao.png';
import pitao05 from '@/assets/PITAO-huli.png';
import pitao06 from '@/assets/PITAO-jumao.png';
import pitao07 from '@/assets/PITAO-kaola.png';
import pitao08 from '@/assets/PITAO-lang.png';
import pitao09 from '@/assets/PITAO-mao-01.png';
import pitao10 from '@/assets/PITAO-meiduan.png';
import pitao11 from '@/assets/PITAO-quan.png';
import pitao12 from '@/assets/PITAO-shanxiao.png';
import pitao13 from '@/assets/PITAO-sheli.png';
import pitao14 from '@/assets/PITAO-shi.png';
import pitao15 from '@/assets/PITAO-shulan.png';
import pitao16 from '@/assets/PITAO-tuboshu.png';
import pitao17 from '@/assets/PITAO-xiongmao.png';
import pitao18 from '@/assets/PITAO-yezhu.png';
import pitao19 from '@/assets/PITAO-zhu-01.png';

import darkLogo from '@/assets/dark.png';
import lightLogo from '@/assets/light.png';

import './index.scss';

const { Sider, Content } = Layout;

const PITAO_AVATARS = [
  pitao01,
  pitao02,
  pitao03,
  pitao04,
  pitao05,
  pitao06,
  pitao07,
  pitao08,
  pitao09,
  pitao10,
  pitao11,
  pitao12,
  pitao13,
  pitao14,
  pitao15,
  pitao16,
  pitao17,
  pitao18,
  pitao19,
];
const RANDOM_AVATAR = PITAO_AVATARS[Math.floor(Math.random() * PITAO_AVATARS.length)];

const MainLayout: React.FC = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const location = useLocation();
  const navTheme = initialState?.settings?.navTheme || 'light';
  const isDark = navTheme === 'dark';

  // 极致同步逻辑
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }

    if (!initialState?.isLoggedIn && location.pathname !== '/login') {
      history.push('/login');
    }
  }, [isDark, initialState?.isLoggedIn, location.pathname]);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';

    // 立即反馈：在 React 状态更新前先修改 DOM 类名
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    localStorage.setItem('admin-theme', newTheme);
    setInitialState((s: any) => ({
      ...s,
      settings: { ...s?.settings, navTheme: newTheme },
    }));
  };

  const menuItems = [
    { key: '/dashboard', label: '仪表盘', icon: <DashboardOutlined /> },
    { key: '/menu', label: '菜单管理', icon: <MenuOutlined /> },
    { key: '/game', label: '游戏管理', icon: <PlaySquareOutlined /> },
    { key: '/article', label: '文章管理', icon: <ReadOutlined /> },
    { key: '/vault', label: '资源宝库', icon: <FolderOpenOutlined /> },
    { key: '/analytics', label: '日志管理', icon: <LineChartOutlined /> },
  ];

  // 共享样式配置
  const themeConfig = {
    algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    cssVar: true, // 开启 CSS 变量模式，大幅提升切换性能
    token: {
      colorPrimary: isDark ? '#ffffff' : '#8a2be2',
      borderRadius: 16,
      colorTextBase: isDark ? '#f3f4f6' : '#08060d',
      colorBgBase: isDark ? '#0a0a0c' : '#ffffff',
      colorBgLayout: isDark ? '#0a0a0c' : '#ffffff',
      colorBgContainer: isDark ? '#0a0a0c' : '#ffffff',
      colorBorder: isDark ? '#2e303a' : '#e5e4e7',
    },
  };

  if (location.pathname === '/login') {
    return (
      <ConfigProvider theme={themeConfig}>
        <Outlet />
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider theme={themeConfig}>
      <Layout hasSider className="main-app-layout">
        <Sider width={280} theme={isDark ? 'dark' : 'light'} className="luxury-sider">
          <div className="sidebar-header">
            <div className="sidebar-brand">
              <img src={isDark ? darkLogo : lightLogo} alt="logo" />
              <h1 className="luxury-title">MuYuCat</h1>
            </div>
            <Button
              type="text"
              icon={isDark ? <SunOutlined /> : <MoonOutlined />}
              onClick={toggleTheme}
              className="theme-toggle-btn"
            />
          </div>

          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => history.push(key)}
            className="color-block-menu"
          />

          <div className="sidebar-footer">
            <div className="sidebar-profile">
              <Avatar
                src={initialState?.currentUser?.avatar || RANDOM_AVATAR}
                icon={<UserOutlined />}
                className="profile-avatar"
              />
              <div className="profile-info">
                <span className="profile-name">
                  {initialState?.currentUser?.username || '管理员'}
                </span>
                <span className="profile-role">Edit Admin</span>
              </div>
            </div>
            <div className="logout-btn-container">
              <Button
                icon={<LogoutOutlined />}
                className="logout-btn"
                onClick={() => {
                  Modal.confirm({
                    title: '确认退出',
                    content: '确定要退出管理系统吗？',
                    onOk: () => {
                      localStorage.removeItem('admin-token');
                      setInitialState((s: any) => ({ ...s, isLoggedIn: false }));
                      history.push('/login');
                    },
                  });
                }}
                ghost
              >
                安全退出
              </Button>
            </div>
          </div>
        </Sider>

        <Layout className="content-layout">
          <Content className="main-content-area">
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default MainLayout;
