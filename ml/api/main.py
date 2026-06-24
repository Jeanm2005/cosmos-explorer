"""
FastAPI service: serves calibrated exoplanet-host-likelihood predictions.

POST /predict with the five Gaia stellar parameters -> calibrated probability
plus per-feature global importance (so the UI can show what drives the model).
"""
import os
import numpy as np
import joblib
import xgboost as xgb
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


FEATURES = ["teff", "radius", "mass", "metallicity", "luminosity"]
DATA = os.path.join(os.path.dirname(__file__), "..", "data")

app = FastAPI(title="Stellar Host Likelihood API", version="1.0")

# CORS: lock to your deployed frontend in production; localhost for dev.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://cosmos-explorer-kappa.vercel.app",
    ],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

# Load models once at startup
calibrated = joblib.load(os.path.join(DATA, "host_model_calibrated.joblib"))
base = xgb.XGBClassifier()
base.load_model(os.path.join(DATA, "host_model_base.json"))
importances = dict(zip(FEATURES, [float(x) for x in base.feature_importances_]))

class StarParams(BaseModel):
    teff: float = Field(..., description="Effective temperature [K]")
    radius: float = Field(..., description="Stellar radius [solar radii]")
    mass: float = Field(..., description="Stellar mass [solar masses]")
    metallicity: float = Field(..., description="Metallicity [M/H], dex")
    luminosity: float = Field(..., description="Luminosity [solar units]")
    
@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict")
def predict(p: StarParams):
    x = np.array([[p.teff, p.radius, p.mass, p.metallicity, p.luminosity]])
    prob = float(calibrated.predict_proba(x)[0, 1])
    return {
        "host_likelihood": round(prob, 4),
        "feature_importance": importances,
        "note": "Correlational estimate from a matched-sample classifier; not a planet detector.",
    }