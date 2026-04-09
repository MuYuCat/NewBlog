import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Space,
  Input,
  Button,
  Select,
  message,
  Pagination,
  DatePicker,
  Tooltip,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  CloseOutlined,
  ExportOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  ClusterOutlined,
} from '@ant-design/icons';
import { request } from '@umijs/max';
import { gsap } from 'gsap';
import dayjs from 'dayjs';
import './index.scss';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface AuditLog {
  id: string;
  logType: string;
  method: string;
  status: number;
  path: string;
  ip: string;
  location: string;
  duration: number;
  userAgent: string;
  createdAt: string;
  query?: any;
  body?: any;
}

const AnalyticsPage: React.FC = () => {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // 筛选状态
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchTypes, setSearchTypes] = useState<string[]>(['ALL']);
  const [statusFilter, setStatusFilter] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [dateRange, setDateRange] = useState<any>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: pageSize,
        search: keyword || undefined,
        type:
          searchTypes.includes('ALL') || searchTypes.length === 0
            ? undefined
            : searchTypes.join(','),
        status: statusFilter !== 'all' ? statusFilter : undefined,
      };
      if (dateRange) {
        params.startTime = dateRange[0].toISOString();
        params.endTime = dateRange[1].toISOString();
      }
      const res = await request('/analytics/logs', { params });
      setLogs(res.items);
      setTotal(res.total);
    } catch (e) {
      message.error('信号同步中断');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, keyword, searchTypes, statusFilter, dateRange]);

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    const hide = message.loading('正在提取数据轨道...', 0);
    try {
      const params: any = {
        search: keyword || undefined,
        type:
          searchTypes.includes('ALL') || searchTypes.length === 0
            ? undefined
            : searchTypes.join(','),
        status: statusFilter !== 'all' ? statusFilter : undefined,
      };
      if (dateRange) {
        params.startTime = dateRange[0].toISOString();
        params.endTime = dateRange[1].toISOString();
      }

      // 关键：指定 responseType 为 blob，且必须等待后端完成流式写入
      const res = await request('/analytics/export', {
        params,
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([res]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs-${dayjs().format('YYYYMMDD-HHmm')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      message.success('航行日志已下载至本地');
    } catch (e) {
      message.error('数据提取链路异常，请重试');
    } finally {
      hide();
      setExporting(false);
    }
  };

  const handleTypeChange = (values: string[]) => {
    if (values.length === 0) {
      setSearchTypes(['ALL']);
      return;
    }
    const lastSelected = values[values.length - 1];
    if (lastSelected === 'ALL') {
      setSearchTypes(['ALL']);
    } else {
      setSearchTypes(values.filter((v) => v !== 'ALL'));
    }
  };

  useEffect(() => {
    setPage(1);
    const timer = setTimeout(() => {
      fetchLogs();
    }, 300);
    return () => clearTimeout(timer);
  }, [keyword, searchTypes, statusFilter, dateRange, pageSize, fetchLogs]);

  useEffect(() => {
    fetchLogs();
  }, [page, fetchLogs]);

  useEffect(() => {
    gsap.from('.header-top', { opacity: 0, y: -20, duration: 0.8, ease: 'expo.out' });
    gsap.from('.search-ribbon', {
      opacity: 0,
      scale: 0.98,
      delay: 0.2,
      duration: 0.8,
      ease: 'expo.out',
    });
  }, []);

  const openDetail = (log: AuditLog) => {
    setSelectedLog(log);
    gsap.to('.log-detail-drawer', { x: 0, duration: 0.6, ease: 'expo.out' });
  };

  const closeDetail = () => {
    gsap.to('.log-detail-drawer', {
      x: '100%',
      duration: 0.5,
      ease: 'expo.in',
      onComplete: () => setSelectedLog(null),
    });
  };

  const renderPath = (log: AuditLog) => {
    if (log.path.includes('/public-menu/visit') && log.query?.from) {
      const isWeb = log.logType === 'PAGE_WEB';
      return {
        main: `${isWeb ? '前台' : '后台'}: ${log.query.from}`,
        sub: log.path,
        type: isWeb ? 'pv' : 'admin',
      };
    }
    return { main: log.path, sub: `${log.method} API`, type: 'api' };
  };

  const getDurationClass = (ms: number) => {
    if (ms < 100) return 'dur-fast';
    if (ms < 500) return 'dur-slow';
    return 'dur-bottleneck';
  };

  const shouldShowStatus = searchTypes.includes('ALL') || searchTypes.includes('API');

  return (
    <div className="analytics-container animate-fade-in">
      <div className="analytics-header">
        <div className="header-top">
          <div className="title-area">
            <Title level={2}>全栈审计中心</Title>
            <span>实时观测系统脉络与多端用户行为足迹。</span>
          </div>
        </div>

        <div className="search-ribbon">
          <Select
            mode="multiple"
            maxTagCount="responsive"
            value={searchTypes}
            onChange={handleTypeChange}
            className="filter-item type-select"
            variant="borderless"
            prefix={<ClusterOutlined style={{ opacity: 0.4 }} />}
            popupClassName="elite-dropdown"
          >
            <Option value="ALL">全部端数据</Option>
            <Option value="API">业务接口</Option>
            <Option value="PAGE_WEB">前台访问</Option>
            <Option value="PAGE_ADMIN">后台访问</Option>
          </Select>

          {shouldShowStatus && (
            <>
              <div className="divider" />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                className="filter-item status-select"
                variant="borderless"
                prefix={<CheckCircleOutlined style={{ opacity: 0.4 }} />}
                popupClassName="elite-dropdown"
              >
                <Option value="all">所有状态</Option>
                <Option value="success">成功 (2xx)</Option>
                <Option value="error">异常 (4xx+)</Option>
              </Select>
            </>
          )}

          <div className="divider" />
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            className="filter-item date-picker"
            variant="borderless"
            placeholder={['起始时间', '结束时间']}
          />

          <div className="divider" />
          <Input
            prefix={<SearchOutlined style={{ opacity: 0.3 }} />}
            placeholder="搜索路径/IP/位置"
            className="filter-item keyword-input"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            allowClear
            variant="borderless"
          />

          <div className="divider" />
          <Space size={12}>
            <Tooltip title="刷新数据">
              <Button
                icon={<ReloadOutlined />}
                loading={loading ? true : undefined}
                onClick={fetchLogs}
                className="action-btn"
              />
            </Tooltip>
            <Tooltip title="导出报表">
              <Button
                icon={<ExportOutlined />}
                loading={exporting ? true : undefined}
                onClick={handleExport}
                className="action-btn"
              />
            </Tooltip>
          </Space>
        </div>
      </div>

      <div className="logs-main-content">
        <div className="table-header-row">
          <span>来源 / 方法</span>
          <span>状态</span>
          <span>观测目标 / 路径</span>
          <span>访问者 (IP & 位置)</span>
          <span>响应耗时</span>
          <span style={{ textAlign: 'right' }}>捕获时间</span>
        </div>
        <div className="table-body">
          {logs.map((log) => {
            const pathInfo = renderPath(log);
            const dt = dayjs(log.createdAt);
            const typeLabel =
              log.logType === 'PAGE_WEB' ? 'WEB' : log.logType === 'PAGE_ADMIN' ? 'ADMIN' : 'API';
            const typeClass =
              log.logType === 'PAGE_WEB' ? 'pv' : log.logType === 'PAGE_ADMIN' ? 'admin' : 'api';

            return (
              <div
                key={log.id}
                className={`log-row ${typeClass} ${log.status >= 400 ? 'status-error' : 'status-success'} ${selectedLog?.id === log.id ? 'active' : ''}`}
                onClick={() => openDetail(log)}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="type-tag">{typeLabel}</div>
                  <div className="method">{log.method}</div>
                </div>
                <div className="status">{log.status}</div>
                <div className="path-group">
                  <div className="path-main">{pathInfo.main}</div>
                  <div className="path-sub">{pathInfo.sub}</div>
                </div>
                <div className="ip-group">
                  <div className="ip-addr">{log.ip}</div>
                  <div className="ip-loc">{log.location || '未知位置'}</div>
                </div>
                <div className={`duration ${getDurationClass(log.duration)}`}>{log.duration}ms</div>
                <div className="time-group">
                  <span className="t-date">{dt.format('YYYY-MM-DD')}</span>
                  <span className="t-time">{dt.format('HH:mm:ss')}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pagination-footer">
          <span className="total-text">共捕获 {total} 条跨端数据记录</span>
          <Pagination
            total={total}
            current={page}
            pageSize={pageSize}
            onChange={(p, s) => {
              setPage(p);
              setPageSize(s);
            }}
            showSizeChanger
            pageSizeOptions={['20', '50', '100']}
          />
        </div>
      </div>

      <div className="log-detail-drawer">
        {selectedLog && (
          <>
            <div className="drawer-header">
              <Title level={4} style={{ margin: 0 }}>
                日志深度透视
              </Title>
              <Button type="text" shape="circle" icon={<CloseOutlined />} onClick={closeDetail} />
            </div>
            <div className="drawer-body">
              <div className="detail-section">
                <h4>元数据概览</h4>
                <pre>
                  事件 ID: {selectedLog.id}
                  {'\n'}
                  日志类型: {selectedLog.logType}
                  {'\n'}
                  触发时间: {dayjs(selectedLog.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                  {'\n'}
                  访问 IP: {selectedLog.ip}
                  {'\n'}
                  地理位置: {selectedLog.location}
                  {'\n'}
                  请求路径: {selectedLog.path}
                  {'\n'}
                  执行耗时: {selectedLog.duration}ms
                </pre>
              </div>
              <div className="detail-section">
                <h4>设备指纹 (UA)</h4>
                <pre>{selectedLog.userAgent}</pre>
              </div>
              {selectedLog.query && Object.keys(selectedLog.query).length > 0 && (
                <div className="detail-section">
                  <h4>查询参数 (Query)</h4>
                  <pre>{JSON.stringify(selectedLog.query, null, 2)}</pre>
                </div>
              )}
              {selectedLog.body && Object.keys(selectedLog.body).length > 0 && (
                <div className="detail-section">
                  <h4>提交负载 (Payload)</h4>
                  <pre>{JSON.stringify(selectedLog.body, null, 2)}</pre>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
