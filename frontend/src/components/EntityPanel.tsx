import React from 'react';

interface EntityPanelProps {
  entities: { [key: string]: string };
}

const EntityPanel: React.FC<EntityPanelProps> = ({ entities }) => {
  return (
    <div>
      <h3>提取的实体</h3>
      {Object.keys(entities).length === 0 ? (
        <p>暂无数据</p>
      ) : (
        <ul>
          {Object.entries(entities).map(([key, value]) => (
            <li key={key}>
              <strong>{key}:</strong> {value || '无'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EntityPanel;