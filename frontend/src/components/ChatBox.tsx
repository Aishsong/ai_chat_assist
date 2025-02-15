import React, { useState } from 'react';
import { streamMessage } from '../api';

interface ChatBoxProps {
  onExtractEntities: (entities: { [key: string]: string }) => void;
}

interface Message {
  sender: string;
  text: string;
  final?: boolean;
}

const ChatBox: React.FC<ChatBoxProps> = ({ onExtractEntities }) => {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<Message[]>([]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = message.trim();
    // 将用户消息添加到对话记录中
    setConversation((prev) => [...prev, { sender: 'User', text: userMessage }]);
    setMessage('');

    // 准备一个空的 Assistant 回复，待后续更新
    setConversation((prev) => [...prev, { sender: 'Assistant', text: '', final: false }]);

    let accumulated = '';

    try {
      await streamMessage(userMessage, (chunk: string) => {
        const marker = "[ENTITIES]";
        if (chunk.includes(marker)) {
          // 如果当前 chunk 包含 [ENTITIES] 标记，则分离出回复文本和实体信息
          const index = chunk.indexOf(marker);
          const textBefore = chunk.substring(0, index);
          const entityPart = chunk.substring(index + marker.length).trim();

          // 累加之前的文本
          accumulated += textBefore;
          // 更新对话中最后一条 Assistant 消息（设置为最终回复）
          setConversation((prev) => {
            const newConv = [...prev];
            newConv[newConv.length - 1] = { sender: 'Assistant', text: accumulated, final: true };
            return newConv;
          });

          // 尝试解析实体 JSON，并传递给父组件（EntityPanel）
          try {
            const entities = JSON.parse(entityPart);
            onExtractEntities(entities);
          } catch (err) {
            console.error("解析实体 JSON 失败", err);
          }
        } else {
          // 普通回复文本累加
          accumulated += chunk;
          setConversation((prev) => {
            const newConv = [...prev];
            newConv[newConv.length - 1] = { sender: 'Assistant', text: accumulated, final: false };
            return newConv;
          });
        }
      });

      // 流式结束后，若最后一条消息还未标记为 final，则进行标记
      setConversation((prev) => {
        const newConv = [...prev];
        const lastMsg = newConv[newConv.length - 1];
        if (!lastMsg.final) {
          newConv[newConv.length - 1] = { ...lastMsg, final: true };
        }
        return newConv;
      });
    } catch (error) {
      setConversation((prev) => [...prev, { sender: 'Error', text: '发送消息出错' }]);
    }
  };

  return (
    <div>
      <div
        style={{
          height: '70vh',
          overflowY: 'auto',
          border: '1px solid #ccc',
          padding: '10px'
        }}
      >
        {conversation.map((msg, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <div style={{ marginTop: '10px' }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ width: '80%', padding: '10px' }}
          placeholder="输入消息..."
        />
        <button onClick={handleSend} style={{ padding: '10px 20px', marginLeft: '10px' }}>
          发送
        </button>
      </div>
    </div>
  );
};

export default ChatBox;