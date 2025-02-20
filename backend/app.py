import asyncio
import openai
from fastapi import FastAPI, HTTPException, Depends
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict
from sqlalchemy.orm import Session
import uvicorn
import os

from . import crud, models, utils, database

app = FastAPI(title="Chat Bot with RAG and Entity Extraction")

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境中请修改为允许的前端地址
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 创建所有数据库表
models.Base.metadata.create_all(bind=database.engine)

# 更新后的请求模型，增加了 context 字段
class ChatRequest(BaseModel):
    conversation_id: str
    message: str
    context: str = ""   # 新增 context 字段，默认为空

class ChatResponse(BaseModel):
    reply: str
    retrieval: str
    entities: Dict[str, str]

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    try:
        # 将 request.context 传递到 chat_completion 中
        reply = await utils.chat_completion(request.message, request.context)
        # 保存聊天记录等操作（简化示例）
        crud.create_chat_history(db, request.conversation_id, request.message, reply)
        return ChatResponse(reply=reply, retrieval="", entities={ "order_number": "", "phone_number": "", "address": "" })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history")
def history(conversation_id: str = None, db: Session = Depends(get_db)):
    histories = crud.get_chat_history(db, conversation_id)
    return histories

@app.post("/chat_stream")
async def chat_stream(request: ChatRequest):
    async def event_generator():
        # 示例代码：流式返回回复
        try:
            response = await asyncio.to_thread(
                openai.ChatCompletion.create,
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": f"请结合以下上下文信息回答问题：{request.context}"},
                    {"role": "user", "content": request.message}
                ],
                stream=True,
                temperature=0.7,
            )
            for chunk in response:
                if "choices" in chunk:
                    delta = chunk["choices"][0]["delta"]
                    if "content" in delta:
                        content = delta["content"]
                        yield f"data: {content}\n\n"
        except Exception as e:
            yield f"data: Error: {str(e)}\n\n"
    return StreamingResponse(event_generator(), media_type="text/event-stream")

if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)