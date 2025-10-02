import os
from haystack import Document
from haystack.components.preprocessors import DocumentCleaner, DocumentSplitter
from haystack.document_stores.in_memory import InMemoryDocumentStore
from haystack.components.embedders import SentenceTransformersDocumentEmbedder
from haystack.components.embedders import SentenceTransformersTextEmbedder
from haystack.components.retrievers.in_memory import InMemoryEmbeddingRetriever
from constants import resume
from haystack.components.builders import ChatPromptBuilder
from haystack.dataclasses import ChatMessage
from haystack_integrations.components.generators.openrouter import OpenRouterChatGenerator
from haystack import Pipeline
from haystack.utils import Secret
from dotenv import load_dotenv

class RagAgent:
    def __init__(self):
        load_dotenv()
        self.api_key = Secret.from_env_var("OPENROUTER_API_KEY")
        self.chat_generator = OpenRouterChatGenerator(model="deepseek/deepseek-chat-v3.1:free", api_key=self.api_key)
        self.template = [
            ChatMessage.from_user(
                """
                Given the following information, answer the question.

                Context:
                {% for document in documents %}
                    {{ document.content }}
                {% endfor %}

                Question: {{question}}
                Answer:
                """
            )
        ]
        self.prompt_builder = ChatPromptBuilder(template=self.template)
        self.text_embedder = SentenceTransformersTextEmbedder(model="sentence-transformers/all-MiniLM-L6-v2")
        self.document_store = InMemoryDocumentStore()
        self.retriever = InMemoryEmbeddingRetriever(self.document_store)
        self.basic_rag_pipeline = Pipeline()
        self.basic_rag_pipeline.add_component("text_embedder", self.text_embedder)
        self.basic_rag_pipeline.add_component("retriever", self.retriever)
        self.basic_rag_pipeline.add_component("prompt_builder", self.prompt_builder)
        self.basic_rag_pipeline.add_component("llm", self.chat_generator)
        # Now, connect the components to each other
        self.basic_rag_pipeline.connect("text_embedder.embedding", "retriever.query_embedding")
        self.basic_rag_pipeline.connect("retriever", "prompt_builder")
        self.basic_rag_pipeline.connect("prompt_builder.prompt", "llm.messages")

    def add_resume(self):
        doc = Document(content=resume)
        cleaner = DocumentCleaner(
            remove_empty_lines=True,
            remove_extra_whitespaces=True
        )
        cleaned_output = cleaner.run([doc])
        cleaned_docs = cleaned_output["documents"]
        splitter = DocumentSplitter(
            split_by="sentence",
            split_length=3,
            split_overlap=1
        )
        splitter.warm_up()
        split_output = splitter.run(cleaned_docs)
        split_docs = split_output["documents"]
        doc_embedder = SentenceTransformersDocumentEmbedder(model="sentence-transformers/all-MiniLM-L6-v2")
        doc_embedder.warm_up()
        docs_with_embeddings = doc_embedder.run(split_docs)
        self.document_store.write_documents(docs_with_embeddings["documents"])

    def ask_question(self, question):
        response = self.basic_rag_pipeline.run({"text_embedder": {"text": question}, "prompt_builder": {"question": question}})
        return response["llm"]["replies"][0].text

if __name__ == "__main__":
    agent = RagAgent()
    agent.add_resume()
    question = "Can you summarize my resume?"
    answer = agent.ask_question(question)
    print("Question:", question)
    print("Answer:", answer)