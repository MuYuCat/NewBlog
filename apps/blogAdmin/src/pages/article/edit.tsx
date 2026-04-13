import React, { useState, useEffect } from 'react';
import {
  Button,
  Input,
  Space,
  Select,
  Form,
  message,
  Typography,
  Tooltip,
  Drawer,
  Radio,
} from 'antd';
import {
  ArrowLeftOutlined,
  SendOutlined,
  SettingOutlined,
  SaveOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import { history, request, useParams } from '@umijs/max';
import UniversalEditor from '@/components/Editor';
import './edit.scss';

const { Title } = Typography;
const { Option } = Select;

const ArticleEditPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;

  const [form] = Form.useForm();
  const [content, setContent] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // 初始化获取分类
  useEffect(() => {
    request('/category').then((res) => setCategories(res));
    if (isEdit) {
      request(`/article/${id}`).then((res) => {
        form.setFieldsValue(res);
        setContent(res.content);
      });
    }
  }, [id]);

  const handlePublish = async (status: number = 1) => {
    try {
      const values = await form.validateFields();
      if (!content) return message.warning('无法发射空内容镜像');

      setLoading(true);
      const data = { ...values, content, status };

      if (isEdit) {
        await request(`/article/${id}`, { method: 'PATCH', data });
        message.success('内容协议已修订');
      } else {
        await request('/article', { method: 'POST', data });
        message.success('新内容已成功发射至轨道');
      }
      history.push('/article');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="article-edit-container animate-fade-in">
      {/* 顶部指挥栏 */}
      <div className="edit-header">
        <div className="left-area">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => history.back()}
            className="back-btn"
          />
          <Form form={form} layout="inline" className="title-form">
            <Form.Item name="title" rules={[{ required: true, message: '请输入标题' }]}>
              <Input
                placeholder="在此输入协议标题..."
                variant="borderless"
                className="title-input"
              />
            </Form.Item>
          </Form>
        </div>

        <div className="right-area">
          <Space size={12}>
            <Tooltip title="存为草稿">
              <Button
                icon={<SaveOutlined />}
                onClick={() => handlePublish(0)}
                className="action-btn"
              />
            </Tooltip>
            <Button
              icon={<SettingOutlined />}
              onClick={() => setIsDrawerOpen(true)}
              className="action-btn"
            >
              配置
            </Button>
            <Button
              type="primary"
              icon={<RocketOutlined />}
              loading={loading}
              onClick={() => handlePublish(1)}
              className="launch-btn"
            >
              立即发射
            </Button>
          </Space>
        </div>
      </div>

      {/* 编辑区域 */}
      <div className="edit-main">
        <UniversalEditor value={content} onChange={setContent} />
      </div>

      {/* 配置抽屉 */}
      <Drawer
        title="内容发射配置"
        placement="right"
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        width={400}
        className="edit-drawer"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="type" label="内容形态" initialValue="KNOWLEDGE">
            <Radio.Group optionType="button" buttonStyle="solid">
              <Radio value="KNOWLEDGE">智库博文</Radio>
              <Radio value="JOURNAL">随笔日志</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item name="categoryId" label="所属维度" rules={[{ required: true }]}>
            <Select placeholder="请选择内容归属维度">
              {categories.map((c) => (
                <Option key={c.id} value={c.id}>
                  {c.label || c.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="slug" label="标识 (Slug)" rules={[{ required: true }]}>
            <Input placeholder="如: my-new-article" />
          </Form.Item>

          <Form.Item name="summary" label="内容摘要">
            <Input.TextArea rows={4} placeholder="简述该内容镜像的核心逻辑..." />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default ArticleEditPage;
