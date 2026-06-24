"""
Export confirmed host stars (with clean Gaia params + names) to a JSON the
frontend ships with. Both the Star Catalog and Exoplanet panels read this:
the catalog browses it; the exoplanet page looks up a planet's host by name.
"""
import json
import pandas as pd

# host params (Gaia) keyed by source_id
params = pd.read_csv("data/hosts_gaia.csv")
# source_id -> hostname mapping
names = pd.read_csv("data/host_gaia_ids.csv")

df = params.merge(names, on="source_id", how="inner")

records = []
for _, r in df.iterrows():
    records.append({
        "name": r["hostname"],
        "teff": round(float(r["teff_gspphot"]), 1),
        "radius": round(float(r["radius_gspphot"]), 4),
        "mass": round(float(r["mass_flame"]), 4),
        "metallicity": round(float(r["mh_gspphot"]), 4),
        "luminosity": round(float(r["lum_flame"]), 4),
    })
    
# Sort by name for a tidy browsable list
records.sort(key=lambda x: x["name"])

out = "data/curated_stars.json"
with open(out, "w") as f:
    json.dump(records, f, indent=2)
print(f"Exported {len(records)} curated host stars -> {out}")