import os
import sys
import pickle
import numpy as np
import openai

def get_embedding(text: str) -> np.ndarray:
    """
    利用 OpenAI Embedding API 获取文本的向量表示
    """
    try:
        response = openai.Embedding.create(
            model="text-embedding-ada-002",
            input=text
        )
        embedding = np.array(response["data"][0]["embedding"])
        return embedding
    except Exception as e:
        print("Error getting embedding:", str(e))
        # 如果出错返回维度为768的零向量（注：可根据实际 embedding 维度调整）
        return np.zeros(768)

def index_documents(docs_folder: str):
    """
    遍历指定目录下所有txt文件，对每个文件计算 embedding，并保存到向量索引文件 vector_index.pkl 中
    """
    document_index = []
    
    for filename in os.listdir(docs_folder):
        if filename.lower().endswith(".txt"):
            file_path = os.path.join(docs_folder, filename)
            with open(file_path, "r", encoding="utf-8") as f:
                text = f.read()
            embedding = get_embedding(text)
            document_index.append({
                "text": text,
                "embedding": embedding
            })
            print(f"Indexed: {filename}")
    
    # 将索引保存到 backend 文件夹下的 vector_index.pkl
    index_file = os.path.join(os.path.dirname(__file__), "vector_index.pkl")
    with open(index_file, "wb") as f:
        pickle.dump(document_index, f)
    print(f"Document index saved to {index_file}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python index_docs.py <docs_folder>")
        sys.exit(1)
    docs_folder = sys.argv[1]
    index_documents(docs_folder)