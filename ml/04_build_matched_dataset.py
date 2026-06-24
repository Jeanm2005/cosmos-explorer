"""
Build the matched dataset — v2, leak-free.

Both classes now come from Gaia (identical pipeline & columns):
  positives = hosts_gaia.csv   (confirmed hosts, Gaia params)
  negatives = gaia_pool.csv    (comparison pool, Gaia params)

Matched 1:1 on standardized (G magnitude, distance). Physics features carried
into the model; magnitude/distance used ONLY for matching.
"""
import numpy as np
import pandas as pd
from scipy.spatial import cKDTree

FEATURES = ["teff_gspphot", "radius_gspphot", "mass_flame", "mh_gspphot", "lum_flame"]
OUT_NAMES = {"teff_gspphot": "teff", "radius_gspphot": "radius", "mass_flame": "mass",
             "mh_gspphot": "metallicity", "lum_flame": "luminosity"}
MATCH = ["phot_g_mean_mag", "distance_gspphot"]
MAX_MATCH_DIST = 0.5

def main():
    hosts = pd.read_csv("data/hosts_gaia.csv")
    pool = pd.read_csv("data/gaia_pool.csv")

    need = FEATURES + MATCH
    hosts = hosts.dropna(subset=need).reset_index(drop=True)
    pool = pool.dropna(subset=need).reset_index(drop=True)

    # Don't let a pool star that is actually a known host sneak in as a negative
    pool = pool[~pool["source_id"].isin(set(hosts["source_id"]))].reset_index(drop=True)
    print(f"hosts: {len(hosts)}   pool (after removing any hosts): {len(pool)}")

    host_m = hosts[MATCH].values.astype(float)
    pool_m = pool[MATCH].values.astype(float)
    combined = np.vstack([host_m, pool_m])
    mean, std = combined.mean(0), combined.std(0)
    host_s = (host_m - mean) / std
    pool_s = (pool_m - mean) / std

    tree = cKDTree(pool_s)
    k = min(20, len(pool_s))
    dists, idxs = tree.query(host_s, k=k)

    used, h_keep, p_keep = set(), [], []
    for hi in range(len(hosts)):
        for rank in range(k):
            pj = int(idxs[hi, rank])
            if pj in used:
                continue
            if dists[hi, rank] > MAX_MATCH_DIST:
                break
            used.add(pj); h_keep.append(hi); p_keep.append(pj); break

    print(f"matched pairs: {len(h_keep)} (dropped {len(hosts) - len(h_keep)} unmatched hosts)")

    rows = []
    for hi, pj in zip(h_keep, p_keep):
        r = {OUT_NAMES[c]: hosts.iloc[hi][c] for c in FEATURES}; r["label"] = 1; rows.append(r)
        r = {OUT_NAMES[c]: pool.iloc[pj][c] for c in FEATURES}; r["label"] = 0; rows.append(r)

    data = pd.DataFrame(rows).sample(frac=1, random_state=42).reset_index(drop=True)
    data.to_csv("data/training_data.csv", index=False)
    print(f"Saved {len(data)} rows ({int(data.label.sum())} hosts, "
          f"{int((data.label==0).sum())} non-hosts) -> data/training_data.csv")

    print("\n--- Match quality (means should be close) ---")
    for col in MATCH:
        hm = hosts.iloc[h_keep][col].mean()
        pm = pool.iloc[p_keep][col].mean()
        print(f"{col:18s} host={hm:9.2f}  nonhost={pm:9.2f}")

if __name__ == "__main__":
    main()