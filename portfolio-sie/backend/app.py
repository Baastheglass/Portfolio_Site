import fastapi
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from haystack_rag import RagAgent


app = fastapi.FastAPI()

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Next.js default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

agent = RagAgent()
agent.add_resume()
class SearchQuery(BaseModel):
    query: str

@app.get("/")
def health():
    return {"status": "ok"}

@app.post("/search")
def search(request: SearchQuery):
    try:
        results = agent.ask_question(request.query)
        return {"results": results}
    except Exception as e:
        return {"error": str(e), "results": "Sorry, I encountered an error processing your request."}

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000)