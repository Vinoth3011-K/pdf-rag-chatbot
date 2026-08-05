from typing import List

from app.config.settings import get_settings
from app.modules.vector_store import RetrievedChunk, vector_store


settings = get_settings()


class Retriever:

    def retrieve(
        self,
        query: str,
        top_k: int = None
    ) -> List[RetrievedChunk]:

        k = top_k or settings.retrieval_top_k


        # Improve search accuracy by adding related keywords
        enhanced_query = f"""
User Question:
{query}

Related information:
education, qualification, skills, technical skills,
certifications, training, experience, projects,
activities, achievements
"""


        return vector_store.query(
            enhanced_query,
            k
        )


retriever = Retriever()