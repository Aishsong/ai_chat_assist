import React, { useState } from 'react';
import ChatBox from './components/ChatBox';
import EntityPanel from './components/EntityPanel';

const App: React.FC = () => {
  const [entities, setEntities] = useState<{ [key: string]: string }>({});

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