"""
Train the host-vs-nonhost classifier on the matched dataset.
"""

import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import roc_auc_score, classification_report, roc_curve
from sklearn.calibration import calibration_curve
import xgboost as xgb
import matplotlib.pyplot as plt

FEATURES = ["teff", "radius", "mass", "metallicity", "luminosity"]

def main():
    df = pd.read_csv("data/training_data.csv")
    X = df[FEATURES].values
    y = df["label"].values
    print(f"dataset: {len(df)} rows, {y.sum()} hosts, {(y==0).sum()} non-hosts")
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, stratify=y, random_state=42
    )
    
    model = xgb.XGBClassifier(
        n_estimators=300,
        max_depth=4,
        learning_rate=0.05,
        subsample=0.9,
        colsample_bytree=0.9,
        eval_metric="logloss",
        random_state=42,
    )
    
    # Cross-validated AUC on the training set (robustness check)
    cv_auc = cross_val_score(model, X_train, y_train, cv=5, scoring="roc_auc")
    print(f"\n5-fold CV ROC-AUC (train): {cv_auc.mean():.3f} +/- {cv_auc.std():.3f}")
    
    model.fit(X_train, y_train)
    
    # Held-out test performance
    proba = model.predict_proba(X_test)[:, 1]
    preds = (proba >= 0.5).astype(int)
    test_auc = roc_auc_score(y_test, proba)
    print(f"Held-out test ROC-AUC: {test_auc:.3f}\n")
    print(classification_report(y_test, preds, target_names=["non-host", "host"]))
    
    # Feature importance
    importances = model.feature_importances_
    order = np.argsort(importances)[::-1]
    print("--- Feature importance ---")
    for i in order:
        print(f" {FEATURES[i]:12s} {importances[i]:.3f}")
        
    # Save importance plot
    plt.figure(figsize=(7, 4))
    plt.barh([FEATURES[i] for i in order][::-1], [importances[i] for i in order][::-1], color="#4dd9ff")
    plt.xlabel("Importance")
    plt.title("Feature importance: what drives host prediction")
    plt.tight_layout()
    plt.savefig("data/feature_importance.png", dpi=130)
    print("\nSaved data/feature_importance.png")
    
    # Calibration check
    frac_pos, mean_pred = calibration_curve(y_test, proba, n_bins=10)
    plt.figure(figsize=(5, 5))
    plt.plot([0, 1], [0, 1], "--", color="gray", label="perfect")
    plt.plot(mean_pred, frac_pos, "o-", color="#4dd9ff", label="model")
    plt.xlabel("Mean predicted probability")
    plt.ylabel("Observed fraction of hosts")
    plt.title("Calibration")
    plt.legend()
    plt.tight_layout()
    plt.savefig("data/calibration.png", dpi=130)
    print("Saved data/calibration.png")
    
    # Persist model + metadata for the serving layer
    model.save_model("data/host_model.json")
    meta = {
        "features": FEATURES,
        "test_auc": float(test_auc),
        "cv_auc_mean": float(cv_auc.mean()),
        "n_train": int(len(X_train)),
        "n_test": int(len(X_test)),
    }
    with open("data/model_meta.json", "w") as f:
        json.dump(meta, f, indent=2)
    print("Saved data/host_model.json and data/model_meta.json")
    
if __name__ == "__main__":
    main()