from app.modules.vector_store import vector_store

result = vector_store.collection.get(limit=3)

print(result["metadatas"])