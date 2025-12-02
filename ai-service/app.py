from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import pandas as pd
from model import ProjectHealthAnalyzer, CompletionEstimator, TeamAnalyzer

app = FastAPI(title="GitInsights AI Service")

# Initialize models
health_analyzer = ProjectHealthAnalyzer()
estimator = CompletionEstimator()
team_analyzer = TeamAnalyzer()

class CommitData(BaseModel):
    date: str
    message: str
    additions: int
    deletions: int
    author: str

class RepoRequest(BaseModel):
    commits: List[CommitData]
    total_scope: Optional[int] = None
    start_date: Optional[str] = None

@app.get("/")
def health_check():
    return {"status": "AI Service is running"}

@app.post("/analyze/health")
def analyze_health(data: RepoRequest):
    try:
        df = pd.DataFrame([c.dict() for c in data.commits])
        if df.empty:
            return {"score": 0, "status": "No data"}
        
        result = health_analyzer.analyze(df)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/completion")
def estimate_completion(data: RepoRequest):
    try:
        df = pd.DataFrame([c.dict() for c in data.commits])
        if df.empty:
            return {"estimated_date": None, "days_remaining": None}
            
        result = estimator.predict(df, data.total_scope)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/team")
def analyze_team(data: RepoRequest):
    try:
        df = pd.DataFrame([c.dict() for c in data.commits])
        if df.empty:
            return []
            
        result = team_analyzer.analyze(df)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
