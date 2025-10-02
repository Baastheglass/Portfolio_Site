import fastapi
from pydantic import BaseModel
import uvicorn
from haystack_rag import RagAgent


app = fastapi.FastAPI()
agent = RagAgent()

class SearchQuery(BaseModel):
    query: str

@app.get("/")
def health():
    return {"status": "ok"}

@app.post("/search")
def search(request: SearchQuery):
    results = agent.ask_question(request.query)
    return {"results": results}

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000)