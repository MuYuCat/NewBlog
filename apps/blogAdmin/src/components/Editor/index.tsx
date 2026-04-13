import React, { useMemo } from 'react';
import { Editor } from '@bytemd/react';
import gfm from '@bytemd/plugin-gfm';
import highlight from '@bytemd/plugin-highlight';
import mammoth from 'mammoth';
import 'bytemd/dist/index.css';
import 'highlight.js/styles/github.css';
import './index.scss';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const plugins = [gfm(), highlight()];

const UniversalEditor: React.FC<Props> = ({ value, onChange }) => {
  // 核心逻辑：拦截 Word 粘贴并转换
  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;

    // 检查是否有 Word 的特殊 HTML 标记
    const html = e.clipboardData.getData('text/html');
    if ((html && html.includes('v:shape')) || html.includes('mso-')) {
      // 说明是 Word 粘贴，尝试特殊处理
      console.log('检测到 Word 数据镜像，正在启动协议转换...');
    }

    // 针对文件的处理（如直接拖入 .docx）
    for (let i = 0; i < items.length; i++) {
      if (
        items[i].type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          const reader = new FileReader();
          reader.onload = async (event) => {
            const arrayBuffer = event.target?.result as ArrayBuffer;
            const result = await mammoth.convertToMarkdown({ arrayBuffer });
            onChange(value + '\n' + result.value);
          };
          reader.readAsArrayBuffer(file);
        }
      }
    }
  };

  return (
    <div className="universal-editor-wrapper" onPaste={handlePaste}>
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
            // ByteMD 的默认语言包补全
          } as any
        }
      />
    </div>
  );
};

export default UniversalEditor;
