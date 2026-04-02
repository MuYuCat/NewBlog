import React from 'react';
import { ProLayout } from '@ant-design/pro-components';
import { Outlet, Link, useLocation } from '@umijs/max';
import '../../tailwind.css';

export default function Layout() {
  const location = useLocation();

  return (
    <div style={{ height: '100vh' }}>
      <ProLayout
        title="NewBlog Admin"
        logo="https://gw.alipayobjects.com/zos/antfincdn/upFE76qqKE/21591244-7274-4c54-b5c0-6d3614607635.png"
        layout="mix"
        location={location}
        menuItemRender={(item, dom) => <Link to={item.path || '/'}>{dom}</Link>}
      >
        <div style={{ minHeight: 'calc(100vh - 120px)' }}>
          <Outlet />
        </div>
      </ProLayout>
    </div>
  );
}
