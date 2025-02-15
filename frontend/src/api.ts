export async function sendMessage(message: string): Promise<any> {
  const payload = {
    conversation_id: 'default', // 简化处理，默认会话ID
    message
  };

  const response = await fetch('http://127.0.0.1:8000/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
}

export async function streamMessage(
  message: string,
  onChunk: (chunk: string) => void
): Promise<void> {
  const payload = {
    conversation_id: 'default',
    message
  };

  const response = await fetch('http://127.0.0.1:8000/chat_stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  // 浏览器环境下必须确保 response.body 可读（例如 Chrome 支持 ReadableStream）
  if (!response.body) {
    throw new Error('ReadableStream not supported in this browser.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let accumulatedData = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    // 将所有接收到的数据累加
    accumulatedData += chunk;
    // SSE 格式的数据通常以两个换行符分隔
    const parts = accumulatedData.split('\n\n');
    // 最后一块可能不完整，保存以备下次拼接
    accumulatedData = parts.pop() || '';
    for (const part of parts) {
      if (part.startsWith('data:')) {
        // 去掉 "data:" 前缀后将文本传递给回调
        const data = part.slice(5).trim();
        onChunk(data);
      }
    }
  }
}