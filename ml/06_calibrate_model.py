"""
Calibrate the trained classifier's probabilities.
"""
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.calibration import CalibratedClassifierCV, calibration_curve
from sklearn.frozen import FrozenEstimator
from sklearn.metrics import roc_auc_score
import xgboost as xgb
import matplotlib.pyplot as plt
import joblib

FEATURES = ["teff", "radius", "mass", "metallicity", "luminosity"]

def main():
    df = pd.read_csv("data/training_data.csv")
    X = df[FEATURES].values
    y = df["label"].values

    # Split: train the base model on one part, calibrate on held-out, test on a third
    X_tr, X_tmp, y_tr, y_tmp = train_test_split(X, y, test_size=0.40, stratify=y, random_state=42)
    X_cal, X_test, y_cal, y_test = train_test_split(X_tmp, y_tmp, test_size=0.50, stratify=y_tmp, random_state=42)
    print(f"train={len(X_tr)}  calibrate={len(X_cal)}  test={len(X_test)}")

    base = xgb.XGBClassifier(
        n_estimators=300, max_depth=4, learning_rate=0.05,
        subsample=0.9, colsample_bytree=0.9, eval_metric="logloss", random_state=42,
    )
    base.fit(X_tr, y_tr)

    # Isotonic calibration on the held-out calibration set
    calibrated = CalibratedClassifierCV(FrozenEstimator(base), method="isotonic")
    calibrated.fit(X_cal, y_cal)

    # Compare AUC (should be ~unchanged) and calibration (should improve)
    raw_auc = roc_auc_score(y_test, base.predict_proba(X_test)[:, 1])
    cal_auc = roc_auc_score(y_test, calibrated.predict_proba(X_test)[:, 1])
    print(f"test ROC-AUC  raw={raw_auc:.3f}  calibrated={cal_auc:.3f}")

    # Plot before/after calibration
    plt.figure(figsize=(5, 5))
    plt.plot([0, 1], [0, 1], "--", color="gray", label="perfect")
    for proba, lbl, color in [
        (base.predict_proba(X_test)[:, 1], "raw", "#ff8a65"),
        (calibrated.predict_proba(X_test)[:, 1], "calibrated", "#4dd9ff"),
    ]:
        fp, mp = calibration_curve(y_test, proba, n_bins=10)
        plt.plot(mp, fp, "o-", color=color, label=lbl)
    plt.xlabel("Mean predicted probability")
    plt.ylabel("Observed fraction of hosts")
    plt.title("Calibration: raw vs calibrated")
    plt.legend()
    plt.tight_layout()
    plt.savefig("data/calibration_comparison.png", dpi=130)
    print("Saved data/calibration_comparison.png")

    # Persist the calibrated model for serving (joblib handles the sklearn wrapper)
    joblib.dump(calibrated, "data/host_model_calibrated.joblib")
    base.save_model("data/host_model_base.json")
    print("Saved data/host_model_base.json")
    with open("data/model_meta.json", "w") as f:
        json.dump({"features": FEATURES, "test_auc": float(cal_auc)}, f, indent=2)
    print("Saved data/host_model_calibrated.joblib and model_meta.json")

if __name__ == "__main__":
    main()