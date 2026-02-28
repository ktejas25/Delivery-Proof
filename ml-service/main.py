from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn

app = FastAPI(title="DeliveryProof ML Service")

class ImageAnalysisRequest(BaseModel):
    image_url: str
    gps_lat: float
    gps_lng: float

@app.get("/")
async def root():
    return {"message": "DeliveryProof ML Service is running"}

@app.post("/analyze-image")
async def analyze_image(request: ImageAnalysisRequest):
    # Mocking AI analysis
    return {
        "authenticity_score": 95.5,
        "flags": [],
        "gps_match": True,
        "tampering_detected": False
    }

@app.post("/detect-fraud")
async def detect_fraud(proof_package: dict):
    # Mocking fraud detection
    return {
        "fraud_probability": 0.05,
        "explanation": "High proof quality and GPS match."
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
