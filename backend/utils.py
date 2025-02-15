import openai
import os
from typing import Dict
import asyncio
import pickle
import numpy as np
import re
import traceback
from dotenv import load_dotenv

load_dotenv()

# 设置自定义的 API 基本地址
openai.api_base = "https://api.openai-hk.com/v1"
openai.base_url = "https://api.openai-hk.com/v1"
openai.api_key = os.environ["OPENAI_API_KEY"]

# 设置 OpenAI API 密钥（请确保已设置环境变量 OPENAI_API_KEY）
openai.api_key = os.getenv("OPENAI_API_KEY")

async def chat_completion(user_message: str, context: str = "") -> str:
    """
    调用 OpenAI ChatCompletion API，并传入检索到的上下文信息。
    """
    messages = [
        {"role": "system", "content": f"请结合以下上下文信息回答问题：{context}"},
        {"role": "user", "content": user_message}
    ]
    try:
        response = await asyncio.to_thread(
            openai.ChatCompletion.create,
            model="gpt-3.5-turbo",
            messages=messages,
            temperature=0.7,
        )
        answer = response["choices"][0]["message"]["content"].strip()
        return answer
    except Exception as e:
        # 打印完整的错误堆栈信息，方便调试
        traceback.print_exc()
        return f"Error in chat completion: {str(e)}"

def cosine_similarity(vec1: np.ndarray, vec2: np.ndarray) -> float:
    return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))

async def retrieve_documents(query: str) -> str:
    """
    自定义检索工具：从事先构建的文档向量索引中，找到与查询最相关的文档。
    向量索引存储在 'vector_index.pkl' 文件中。
    """
    index_file = os.path.join(os.path.dirname(__file__), "vector_index.pkl")
    try:
        with open(index_file, "rb") as f:
            document_index = pickle.load(f)
    except Exception as e:
        return ""
    
    # 调用 OpenAI Embedding API 获取查询的向量表示
    try:
        response = await asyncio.to_thread(
            openai.Embedding.create,
            model="text-embedding-ada-002",
            input=query
        )
        query_embedding = np.array(response["data"][0]["embedding"])
    except Exception as e:
        return ""
    
    # document_index 为一个列表，元素格式为：{"text": str, "embedding": np.ndarray}
    best_score = -1
    best_doc = ""
    for doc in document_index:
        doc_embedding = doc["embedding"]
        score = cosine_similarity(query_embedding, doc_embedding)
        if score > best_score:
            best_score = score
            best_doc = doc["text"]
    return best_doc

async def extract_entities(text: str) -> Dict[str, str]:
    """
    实体抽取工具：从文本中抽取 hard code 的实体（订单号、电话号码、地址）
    """
    entities = {"order_number": "", "phone_number": "", "address": ""}

    # 订单号：假设格式为 "order" 后跟至少6位数字
    order_pattern = re.compile(r"order[^\d]*(\d{6,})", re.IGNORECASE)
    order_match = order_pattern.search(text)
    if order_match:
        entities["order_number"] = order_match.group(1)
    
    # 电话号码：匹配 10 至 15 位数字，可选 "+" 开头
    phone_pattern = re.compile(r"(\+?\d{10,15})")
    phone_match = phone_pattern.search(text)
    if (phone_match):
        entities["phone_number"] = phone_match.group(1)
    
    # 地址：查找包含 “地址” 等关键字后的字符（简单示例）
    address_pattern = re.compile(r"地址[:：\s]*([\u4e00-\u9fa5a-zA-Z0-9\s,，。]+)")
    address_match = address_pattern.search(text)
    if address_match:
        entities["address"] = address_match.group(1).strip()
    
    return entities