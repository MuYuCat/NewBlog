import React from 'react';
import { Editor } from '@bytemd/react';
import gfm from '@bytemd/plugin-gfm';
import highlight from '@bytemd/plugin-highlight';
import breaks from '@bytemd/plugin-breaks';
import * as mammoth from 'mammoth';
import TurndownService from 'turndown';
import 'bytemd/dist/index.css';
import 'highlight.js/styles/github.css';
import './index.scss';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

// 初始化 Turndown 转换器
const turndownService = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
});

// 核心功能：清洗 Word 粘贴过来的脏 HTML
const cleanWordHtml = (html: string): string => {
  // 1. 暴力正则清洗：移除所有的 <style>, <meta>, <link>, 以及 Word 的 XML 条件注释
  const cleaned = html
    .replace(/<style[\s\S]*?<\/style>/gi, '') // 移除整个 style 块
    .replace(/<meta[\s\S]*?>/gi, '') // 移除 meta 标签
    .replace(/<link[\s\S]*?>/gi, '') // 移除 link 标签
    .replace(/<!--[\s\S]*?-->/g, '') // 移除所有注释 (包括 Word 的 XML 元数据)
    .replace(/<![\s\S]*?>/g, ''); // 移除所有 DTD 声明

  const container = document.createElement('div');
  container.innerHTML = cleaned;

  // 2. 识别并转换 Word 特有的标题类名
  const headings = container.querySelectorAll('[class^="MsoHeading"], [style*="font-weight:bold"]');
  headings.forEach((el) => {
    const className = el.className || '';
    const style = (el as HTMLElement).style.fontSize || '';

    let level = 0;
    if (className.includes('Heading1')) level = 1;
    else if (className.includes('Heading2')) level = 2;
    else if (className.includes('Heading3')) level = 3;
    else if (style.includes('pt')) {
      const pt = parseFloat(style);
      if (pt >= 20) level = 1;
      else if (pt >= 16) level = 2;
      else if (pt >= 14) level = 3;
    }

    if (level > 0) {
      const h = document.createElement(`h${level}`);
      h.innerHTML = el.innerHTML;
      el.parentNode?.replaceChild(h, el);
    }
  });

  // 3. 移除残留的类名和 Mso 开头的内联样式，保持 HTML 纯净
  const allElements = container.querySelectorAll('*');
  allElements.forEach((el) => {
    el.removeAttribute('class');
    const styleAttr = el.getAttribute('style') || '';
    if (styleAttr.toLowerCase().includes('mso-')) {
      el.removeAttribute('style');
    }
  });

  return container.innerHTML;
};

const UniversalEditor: React.FC<Props> = ({ value, onChange }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const valueRef = React.useRef(value);
  const onChangeRef = React.useRef(onChange);

  // 同步 Ref，确保监听器内能拿到最新状态
  React.useEffect(() => {
    valueRef.current = value;
    onChangeRef.current = onChange;
  }, [value, onChange]);

  // 核心转换逻辑：Docx ArrayBuffer -> Markdown
  const convertDocxToMarkdown = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    try {
      const result = await mammoth.convertToHtml({
        arrayBuffer,
        styleMap: [
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh",
          "p[style-name='Heading 3'] => h3:fresh",
        ],
      });
      const html = result.value;
      return turndownService.turndown(html);
    } catch (error) {
      console.error('Word 协议解析失败:', error);
      throw error;
    }
  };

  // 拦截粘贴事件 (使用捕获模式优先于编辑器执行)
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleCapturePaste = async (e: ClipboardEvent) => {
      const clipboardData = e.clipboardData;
      if (!clipboardData) return;

      const types = clipboardData.types;
      const html = clipboardData.getData('text/html');

      // 判定是否为 Word 内容 (基于典型标识符)
      const isWord =
        html.includes('MsoNormal') ||
        html.includes('word-specific') ||
        html.includes('font-family');

      if (isWord && types.includes('text/html')) {
        // 1. 立即停止一切后续行为（阻止 ByteMD 的默认粘贴）
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        console.log('[Elite Editor] 检测到 Word 协议，启动深度清洗...');
        const cleanedHtml = cleanWordHtml(html);
        const markdown = turndownService.turndown(cleanedHtml);

        // 2. 更新内容 (追加到末尾)
        const currentValue = valueRef.current;
        onChangeRef.current(currentValue ? `${currentValue}\n\n${markdown}` : markdown);
        return;
      }

      // 处理 Word 文件粘贴 (.docx 实体直接粘贴)
      const fileItem = Array.from(clipboardData.items).find(
        (item) =>
          item.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      );

      if (fileItem) {
        const file = fileItem.getAsFile();
        if (file) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();

          const reader = new FileReader();
          reader.onload = async (event) => {
            const buffer = event.target?.result as ArrayBuffer;
            const markdown = await convertDocxToMarkdown(buffer);
            const currentValue = valueRef.current;
            onChangeRef.current(currentValue ? `${currentValue}\n\n${markdown}` : markdown);
          };
          reader.readAsArrayBuffer(file);
        }
      }
    };

    el.addEventListener('paste', handleCapturePaste, true);
    return () => el.removeEventListener('paste', handleCapturePaste, true);
  }, []);

  // 自定义 Word 导入插件
  const wordImportPlugin = () => {
    return {
      toolbarItems: [
        {
          tooltip: '导入 Word (.docx)',
          icon: '<svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor"><path d="M854.6 288.7L639.4 73.5c-4.3-4.3-10.1-6.7-16.3-6.7H280c-35.3 0-64 28.7-64 64v785.4c0 35.3 28.7 64 64 64h464c35.3 0 64-28.7 64-64V305c0-6.2-2.4-12-6.7-16.3zM640 144.1l141.2 141.2H640V144.1zM744 862.7H280V130.7h296v188.7c0 17.7 14.3 32 32 32h188.7v511.3h-52.7z"></path><path d="M384 480.7h256v64H384zM384 608.7h256v64H384zM384 736.7h128v64H384z"></path></svg>',
          onClick() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.docx';
            input.onchange = async (e: any) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = async (event) => {
                  const buffer = event.target?.result as ArrayBuffer;
                  const markdown = await convertDocxToMarkdown(buffer);
                  const currentValue = valueRef.current;
                  onChangeRef.current(currentValue ? `${currentValue}\n\n${markdown}` : markdown);
                };
                reader.readAsArrayBuffer(file);
              }
            };
            input.click();
          },
        },
      ],
    };
  };

  const plugins = [gfm(), highlight(), breaks(), wordImportPlugin()];

  return (
    <div className="universal-editor-wrapper" ref={containerRef}>
      <Editor
        value={value}
        plugins={plugins}
        onChange={onChange}
        placeholder="在此注入您的意识碎片或深度协议..."
        locale={
          {
            write: '编辑',
            preview: '预览',
            help: '帮助',
            toc: '目录',
          } as any
        }
      />
    </div>
  );
};

export default UniversalEditor;
