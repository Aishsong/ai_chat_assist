import React, { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import { sendChatMessage } from '../api';
import { Entities } from './EntityPanel';

interface ChatBoxProps {
  // 当接收到后端返回的实体数据时调用，类型为 Entities
  onExtractEntities: React.Dispatch<React.SetStateAction<Entities>>;
}

interface Message {
  sender: 'user' | 'bot';
  content: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({ onExtractEntities }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [contextEnabled, setContextEnabled] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = input.trim();
    setInput('');
    // 注意这里我们用类型断言确保 sender 类型为字面量 "user"
    const newMessages: Message[] = [
      ...messages,
      { sender: 'user' as const, content: userMessage },
    ];
    setMessages(newMessages);
    setIsSending(true);

    const context = contextEnabled
      ? newMessages
          .map((msg) => (msg.sender === 'user' ? '我' : '客服') + '：' + msg.content)
          .join('\n')
      : '';

    try {
      const response = await sendChatMessage('default', userMessage, context);
      // 注意这里也做了类型断言，确保 sender 为 "bot"
      setMessages((prev) => [
        ...prev,
        { sender: 'bot' as const, content: response.reply },
      ]);
      onExtractEntities(response.entities);
    } catch (error: any) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { sender: 'bot' as const, content: '请求出错，请稍后再试。' },
      ]);
    }
    setIsSending(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>聊天机器人</h2>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={contextEnabled}
            onChange={(e) => setContextEnabled(e.target.checked)}
          />
          连续对话
        </label>
      </div>
      <div style={styles.chatWindow}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              ...styles.messageBubble,
              // 用户消息显示在右边，客服回复显示在左边
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: msg.sender === 'user' ? '#DCF8C6' : '#FFF',
            }}
          >
            {msg.content}
          </div>
        ))}
        <div ref={chatEndRef}></div>
      </div>
      <div style={styles.inputSection}>
        <textarea
          style={styles.textArea}
          placeholder="问我任何问题...（Shift+Enter换行，Enter发送）"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        ></textarea>
        <button style={styles.sendButton} onClick={handleSend} disabled={isSending}>
          {isSending ? '发送中...' : '发送'}
        </button>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: '100%',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #D8BFD8',
    borderRadius: 8,
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  header: {
    backgroundColor: '#D8BFD8',
    color: '#fff',
    padding: '10px 15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
  },
  checkboxLabel: {
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  chatWindow: {
    flex: 1,
    padding: '15px',
    backgroundImage:
      'linear-gradient(0deg, transparent 74%, rgba(0,0,0,0.05) 75%, rgba(0,0,0,0.05) 76%, transparent 77%), ' +
      'linear-gradient(90deg, transparent 74%, rgba(0,0,0,0.05) 75%, rgba(0,0,0,0.05) 76%, transparent 77%)',
    backgroundSize: '50px 50px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    overflowY: 'auto',
  },
  messageBubble: {
    maxWidth: '70%',
    padding: '10px 15px',
    borderRadius: 20,
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    wordBreak: 'break-word',
  },
  inputSection: {
    padding: '10px',
    borderTop: '1px solid #D8BFD8',
    display: 'flex',
    flexDirection: 'column',
  },
  textArea: {
    width: '100%',
    resize: 'none',
    borderRadius: 5,
    border: '1px solid #ccc',
    padding: '10px',
    boxSizing: 'border-box',
    marginBottom: '10px',
  },
  sendButton: {
    alignSelf: 'flex-end',
    padding: '8px 16px',
    backgroundColor: '#D8BFD8',
    color: '#fff',
    border: 'none',
    borderRadius: 5,
    cursor: 'pointer',
  },
};

export default ChatBox;