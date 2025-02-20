import React from 'react';

export interface Entities {
  order_number: string;
  phone_number: string;
  address: string;
}

interface EntityPanelProps {
  entities: Entities;
}

const EntityPanel: React.FC<EntityPanelProps> = ({ entities }) => {
  return (
    <div style={styles.container}>
      <div style={styles.details}>
        <h3 style={styles.title}>抽取的实体信息</h3>
        <div style={styles.item}>
          <strong>订单号：</strong> {entities.order_number || '-'}
        </div>
        <div style={styles.item}>
          <strong>电话号码：</strong> {entities.phone_number || '-'}
        </div>
        <div style={styles.item}>
          <strong>地址：</strong> {entities.address || '-'}
        </div>
      </div>
      <div style={styles.robotContainer}>
        {/* 使用内联 SVG 绘制一个可爱的机器人 */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 64 64"
          style={styles.robotSvg}
        >
          {/* 机器人头部 */}
          <rect x="12" y="16" width="40" height="32" rx="4" ry="4" fill="#D8BFD8" />
          {/* 机器人眼睛 */}
          <circle cx="26" cy="30" r="4" fill="#FFF" />
          <circle cx="38" cy="30" r="4" fill="#FFF" />
          {/* 机器人嘴巴 */}
          <rect x="26" y="38" width="12" height="4" fill="#FFF" />
          {/* 机器人天线 */}
          <line x1="32" y1="16" x2="32" y2="8" stroke="#D8BFD8" strokeWidth="2" />
          <circle cx="32" cy="6" r="2" fill="#D8BFD8" />
        </svg>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    border: '1px solid #D8BFD8', // 淡紫色边框
    borderRadius: '8px',
    padding: '15px',
    margin: '20px',
    backgroundColor: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    height: '100%', // 充满父容器分配的高度
  },
  details: {
    flex: 1, // 占据上半部分
  },
  title: {
    marginTop: 0,
  },
  item: {
    marginBottom: '10px',
  },
  robotContainer: {
    flex: 1, // 占据下半部分
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderTop: '1px dashed #ccc',
    marginTop: '10px',
  },
  robotSvg: {
    width: '80%', // 根据需要调整大小
    height: '80%',
  },
};

export default EntityPanel;