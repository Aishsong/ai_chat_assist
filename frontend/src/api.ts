export interface ChatResponse {
  reply: string;
  retrieval: string;
  entities: {
    order_number: string;
    phone_number: string;
    address: string;
  };
}

// 发送聊天消息到后端
export async function sendChatMessage(
  conversationId: string,
  message: string,
  context: string = ""
): Promise<ChatResponse> {
  const payload = {
    conversation_id: conversationId,
    message: message,
    // `context` 字段用于后端决定是否结合历史对话生成回复（如果后端支持），
    // 如果后端未做处理，该字段可以忽略。
    context,
  };

  const response = await fetch("http://127.0.0.1:8000/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("网络响应异常");
  }
  return response.json();
}