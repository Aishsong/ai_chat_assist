import React, { useState } from 'react';
import ChatBox from './components/ChatBox';
import EntityPanel, { Entities } from './components/EntityPanel';

const App: React.FC = () => {
  // 初始化实体，确保包含 order_number、phone_number 和 address 三个字段
  const [entities, setEntities] = useState<Entities>({
    order_number: '',
    phone_number: '',
    address: '',
  });

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* 聊天面板 */}
      <div style={{ flex: 2, borderRight: '1px solid #ccc', padding: '20px' }}>
        <ChatBox onExtractEntities={setEntities} />
      </div>
      {/* 实体展示面板 */}
      <div style={{ flex: 1, padding: '20px' }}>
        <EntityPanel entities={entities} />
      </div>
    </div>
  );
};

export default App;