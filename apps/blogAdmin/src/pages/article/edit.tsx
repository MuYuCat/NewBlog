import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Space, Select, Form, message, Row, Col, Tooltip, Switch } from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  RocketOutlined,
  LoadingOutlined,
  LayoutOutlined,
  InfoCircleOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import { history, request, useParams } from '@umijs/max';
import UniversalEditor from '@/components/Editor';
import gsap from 'gsap';
import './edit.scss';

const { Option } = Select;

const ArticleEditPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;

  const [form] = Form.useForm();
  const [content, setContent] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 获取所有维度
    request('/category').then((res) => {
      const categoryList = Array.isArray(res) ? res : res?.data || [];
      setCategories(categoryList);
    });

    if (isEdit) {
      request(`/article/${id}`).then((res) => {
        const data = res?.data || res;

        // 适配多选维度回显与展示状态回显
        const initialValues = {
          ...data,
          categoryIds: data.categories?.map((c: any) => c.id) || [],
          status: data.status === 1, // 1 为 true (公开), 否则为 false
        };

        form.setFieldsValue(initialValues);
        setContent(data.content || '');
      });
    }

    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, { y: -20, opacity: 0, duration: 0.6, ease: 'power2.out' });
      gsap.from(mainRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.8,
        delay: 0.1,
        ease: 'power3.out',
      });
      gsap.from(sidebarRef.current, {
        x: 20,
        opacity: 0,
        duration: 0.8,
        delay: 0.2,
        ease: 'power3.out',
      });
    });
    return () => ctx.revert();
  }, [id, form]);

  const handlePublish = async (explicitStatus?: number) => {
    try {
      const values = await form.validateFields();
      if (!content) return message.warning('无法发布空内容');

      setLoading(true);

      // 如果明确传了 0 (存为草稿)，则使用 0；否则根据 Switch 值决定 1 (公开) 或 2 (私密)
      const finalStatus = explicitStatus === 0 ? 0 : values.status ? 1 : 2;

      const data = {
        ...values,
        content,
        status: finalStatus,
      };

      if (isEdit) {
        await request(`/article/${id}`, { method: 'PATCH', data });
        message.success('内容修订已保存');
      } else {
        await request('/article', { method: 'POST', data });
        message.success('新内容已发布');
      }
      history.push('/article/index');
    } catch (e: any) {
      console.error(e);
      message.error(e.data?.message || e.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="article-edit-container-v2">
      {/* 顶部操作中心 */}
      <header className="v2-header" ref={headerRef}>
        <div className="header-left">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => history.back()}
            className="back-btn"
          />
          <nav className="breadcrumb-nav">
            <span className="nav-active">{isEdit ? '修订协议' : '草拟新篇'}</span>
          </nav>
        </div>

        <div className="header-right">
          <Space size={12}>
            <div className="status-badge">
              <span className="dot" />
              <span className="text">{isEdit ? '同步就绪' : '本地暂存'}</span>
            </div>
            <Button
              icon={loading ? <LoadingOutlined /> : <SaveOutlined />}
              disabled={loading}
              onClick={() => handlePublish(0)}
              className="btn-ghost"
            >
              存为草稿
            </Button>
            <Button
              type="primary"
              icon={loading ? <LoadingOutlined /> : <RocketOutlined />}
              loading={loading}
              onClick={() => handlePublish()}
              className="btn-primary"
            >
              {isEdit ? '更新协议' : '发布内容'}
            </Button>
          </Space>
        </div>
      </header>

      <main className="v2-main-layout">
        <Form form={form} layout="vertical" autoComplete="off" className="v2-form">
          <Row gutter={32} className="layout-row">
            {/* 主创作区 */}
            <Col span={18} className="content-column" ref={mainRef}>
              <div className="editor-card">
                <Form.Item
                  name="title"
                  rules={[{ required: true, message: '请输入内容标题' }]}
                  className="title-field"
                >
                  <Input.TextArea
                    placeholder="在此输入协议识别标题..."
                    variant="borderless"
                    autoSize
                    className="title-textarea"
                  />
                </Form.Item>

                <div className="editor-wrapper-v2">
                  <UniversalEditor value={content} onChange={setContent} />
                </div>
              </div>
            </Col>

            {/* 配置面板 */}
            <Col span={6} className="sidebar-column" ref={sidebarRef}>
              <div className="sidebar-card">
                <div className="section-box">
                  <div className="section-header">
                    <LayoutOutlined className="icon" />
                    <span>元数据配置</span>
                  </div>

                  <Form.Item
                    name="categoryIds"
                    label="归属维度"
                    rules={[{ required: true, message: '请至少指定一个维度' }]}
                    className="sidebar-item"
                  >
                    <Select
                      mode="multiple"
                      placeholder="选择内容维度 (支持多选)"
                      className="v2-select"
                      maxTagCount="responsive"
                    >
                      {categories.map((c) => (
                        <Option key={c.id} value={c.id}>
                          {c.label || c.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="status"
                    label="前台展示"
                    valuePropName="checked"
                    initialValue={true}
                    className="sidebar-item"
                  >
                    <Switch
                      checkedChildren={
                        <Space>
                          <EyeOutlined />
                          <span>公开</span>
                        </Space>
                      }
                      unCheckedChildren={
                        <Space>
                          <EyeInvisibleOutlined />
                          <span>私密</span>
                        </Space>
                      }
                      className="v2-status-switch"
                    />
                  </Form.Item>

                  <Form.Item name="summary" label="内容摘要" className="sidebar-item">
                    <Input.TextArea
                      placeholder="概括该内容协议的核心逻辑..."
                      className="v2-textarea"
                      rows={6}
                    />
                  </Form.Item>

                  <div className="sidebar-info">
                    <InfoCircleOutlined className="info-icon" />
                    <p>摘要将作为预览片段显示，建议字数控制在 150 以内以获得最佳展示效果。</p>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Form>
      </main>
    </div>
  );
};

export default ArticleEditPage;
