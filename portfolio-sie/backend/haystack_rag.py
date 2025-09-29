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

load_dotenv()  # This loads your .env file into environment variables
api_key = Secret.from_env_var("OPENROUTER_API_KEY")

print("API Key:", api_key)  # Debugging line to check if the key is loaded
chat_generator = OpenRouterChatGenerator(model="deepseek/deepseek-chat-v3.1:free", api_key=api_key)

template = [
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

prompt_builder = ChatPromptBuilder(template=template)

text_embedder = SentenceTransformersTextEmbedder(model="sentence-transformers/all-MiniLM-L6-v2")

document_store = InMemoryDocumentStore()

retriever = InMemoryEmbeddingRetriever(document_store)

# Suppose `resume` is your Python string:
# e.g. resume = "This is my resume text ..."

# Create a Document
doc = Document(content=resume)

# Initialize a cleaner
cleaner = DocumentCleaner(
    remove_empty_lines=True,
    remove_extra_whitespaces=True
)

# Clean the document(s) — note: cleaner.run expects *list of Documents*
cleaned_output = cleaner.run([doc])
# cleaned_output is a dict, with cleaned_output["documents"] being the cleaned list
cleaned_docs = cleaned_output["documents"]

# Now split
splitter = DocumentSplitter(
    split_by="sentence",     # you used "sentence" in your code, better than default?
    split_length=3,
    split_overlap=1
)

splitter.warm_up()

split_output = splitter.run(cleaned_docs)
split_docs = split_output["documents"]   # this is a list of smaller Document objects

doc_embedder = SentenceTransformersDocumentEmbedder(model="sentence-transformers/all-MiniLM-L6-v2")
doc_embedder.warm_up()

docs_with_embeddings = doc_embedder.run(split_docs)
document_store.write_documents(docs_with_embeddings["documents"])

basic_rag_pipeline = Pipeline()
# Add components to your pipeline
basic_rag_pipeline.add_component("text_embedder", text_embedder)
basic_rag_pipeline.add_component("retriever", retriever)
basic_rag_pipeline.add_component("prompt_builder", prompt_builder)
basic_rag_pipeline.add_component("llm", chat_generator)

basic_rag_pipeline.connect("text_embedder.embedding", "retriever.query_embedding")
basic_rag_pipeline.connect("retriever", "prompt_builder")
basic_rag_pipeline.connect("prompt_builder.prompt", "llm.messages")

question = "Tell me about Baasil's work experience"

response = basic_rag_pipeline.run({"text_embedder": {"text": question}, "prompt_builder": {"question": question}})

print(response["llm"]["replies"][0].text)