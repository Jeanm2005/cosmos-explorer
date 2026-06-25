Exoplanet Host-Likelihood Model

A machine-learning pipeline that estimates how likely a star is to host planets, based purely on its physical stellar parameters. The model is served as a FastAPI microservice and consumed live by the Cosmos Explorer frontend.

The question:
Given a star's physical properties (temperature, radius, mass, metallicity, luminosity), can we distinguish confirmed exoplanet hosts from otherwise-similar stars? If so, which properties carry the signal?

This is a binary classification problem: host (1) vs. non-host (0).


The hard part: detection bias

The naive approach — take confirmed hosts as positives, random field stars as negatives — produces a model that looks excellent and means nothing.

The reason is detection bias. Confirmed exoplanet hosts are overwhelmingly the stars that surveys like Kepler and TESS could observe well: bright, relatively nearby, photometrically quiet. A planet around a faint, distant star is simply harder to detect. So "known host" is heavily confounded with "easy to observe."

If the negative class is random field stars (which skew fainter and farther), the model learns the shortcut: bright and nearby → host. It scores high accuracy by recovering the survey's selection function, not any property of planet formation. That's a useless model dressed up as a good one.

The fix: a matched comparison sample

To force the model toward real stellar physics, the non-host sample is nearest-neighbor matched to the hosts on the two main bias channels — apparent magnitude and distance — in standardized space (1:1, without replacement, via a KD-tree).

After matching, the two classes are statistically indistinguishable on those observables:

PropertyHost meanNon-host meanApparent magnitude (G)12.4812.47Distance (pc)319.6319.3

Because magnitude and distance are now equalized, the model cannot use them to cheat — they're matched away. Critically, magnitude and distance are used only for matching; they are excluded from the model's feature set. The model sees only the five physics parameters. Any signal it finds has to come from stellar physics, not observability.


The leak: a perfect score is a red flag

The first trained model returned ROC-AUC = 1.000. Perfect separation.

This is not a success — it's impossible. Real stellar physics does not let you separate planet hosts from matched twins with 100% accuracy; if it did, planet detection wouldn't require telescopes. A perfect score means the model found a shortcut the experiment was supposed to prevent.

Diagnosis

Comparing the feature distributions of the two classes revealed the culprit. The host parameters had been pulled from the NASA Exoplanet Archive, while the non-host parameters came from Gaia DR3 — two different measurement pipelines. Luminosity was the smoking gun:

SourceColumnRangeMedianExoplanet Archive (hosts)st_lum−3.26 to +3.26−0.02Gaia DR3 (non-hosts)lum_flame0.04 to 14820.69

The Archive reports luminosity as log₁₀(L/L☉) (centered near 0, the Sun). Gaia reports it as linear L/L☉ (strictly positive, large tail). These aren't the same quantity. The model wasn't learning "hosts are more luminous" — it was learning "is this number negative or huge?", which perfectly encodes which catalog the row came from, which perfectly encodes the label.

This is catalog-source leakage: when the two classes are measured by different pipelines, the pipeline itself becomes a proxy for the label. Metallicity showed a milder version of the same problem (different zero-points between sources).

The fix

Source both classes from the identical Gaia DR3 pipeline. The host stars' Gaia DR3 source IDs were pulled from the Exoplanet Archive, then their parameters were re-fetched from the same Gaia columns (teff_gspphot, radius_gspphot, mass_flame, mh_gspphot, lum_flame) used for the comparison pool. With both classes measured the same way, there is no source fingerprint to leak.


The honest result

After removing the leak, performance dropped to a believable range:


5-fold CV ROC-AUC: 0.717 ± 0.021
Held-out test ROC-AUC: 0.69–0.71


An AUC near 0.70 means: given a host and a matched non-host, the model ranks the host as more likely about 70% of the time. Better than chance, nowhere near the impossible 1.0 — exactly what a real, weak-but-present physical signal looks like.

Feature importance recovers known astrophysics

The validation that this is real: metallicity is the dominant feature.

FeatureImportanceMetallicity0.297Luminosity0.182Radius0.180Temperature0.177Mass0.165

Given only stellar parameters and no knowledge of planet-formation theory, the model independently rediscovered the metallicity–planet correlation (the Fischer–Valenti relation): metal-rich stars preferentially host planets. The before/after contrast is the whole story — in the leaked model, the broken-units luminosity feature dominated at 0.477; once the leak was removed, the physically meaningful feature rose to the top.

Calibration

The raw classifier was overconfident (its calibration curve was flatter than the diagonal — it pushed probabilities toward the extremes). It was wrapped in an isotonic CalibratedClassifierCV so that a served probability of 0.7 corresponds to roughly a 70% observed host frequency. Calibration corrects probabilities without changing ranking, so AUC was unaffected (0.713 → 0.703).


Pipeline

The scripts run in order; they communicate through CSVs in data/.

ScriptPurpose01_fetch_comparison_pool.pyPull the Gaia DR3 comparison-star pool (observable-range bounded)02_fetch_host_ids.pyGet confirmed-host names + Gaia DR3 source IDs from the Exoplanet Archive03_fetch_host_params.pyRe-fetch host parameters from Gaia (identical columns to the pool)04_build_matched_dataset.pyNearest-neighbor match on (magnitude, distance); build the labeled set05_train_model.pyTrain XGBoost; evaluate AUC, feature importance, calibration06_calibrate_model.pyIsotonic calibration; save the served model07_export_curated_stars.pyExport host stars + parameters as JSON for the frontend

Model choice: XGBoost (gradient-boosted trees). For tabular data with a handful of numeric features, boosted trees outperform neural networks, need no feature scaling, capture non-linear interactions automatically, and provide feature importances for free — which is exactly the interpretability this project's validation depends on.


Serving

api/main.py is a FastAPI service exposing POST /predict: it takes the five stellar parameters, returns the calibrated host-likelihood plus per-feature importances. Deployed on Render; consumed live by the Cosmos Explorer Exoplanet page.


Honest limitations


AUC ≈ 0.70 is a weak signal. This is a correlational, exploratory model, not a planet detector. The matched design deliberately removes the easy (biased) signal, leaving only the genuine-but-modest physical one.
Coverage is partial. Gaia's gspphot/flame pipeline does not produce complete parameters for every star — notably for many of the brightest, nearest hosts. The model covers ~1,300 confirmed hosts with complete Gaia DR3 parameters; planets whose hosts fall outside this set are honestly marked as unavailable in the UI rather than scored on mismatched inputs.
Magnitude bands differ slightly between the matching sources (Johnson V vs. Gaia G), an approximation noted for completeness.


The limitations are stated plainly because the integrity of the result depends on them being understood — a model that knows what it doesn't know is more useful than one that overclaims.