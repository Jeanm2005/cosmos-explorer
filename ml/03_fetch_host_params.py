import os
import pandas as pd
from astroquery.gaia import Gaia

Gaia.login(user=os.environ["GAIA_USER"], password=os.environ["GAIA_PASS"])

BATCH = 500  # source_ids per query

COLS = ("gs.source_id, gs.phot_g_mean_mag, "
        "ap.teff_gspphot, ap.radius_gspphot, ap.mass_flame, "
        "ap.mh_gspphot, ap.lum_flame, ap.distance_gspphot")

def fetch_batch(ids):
    id_list = ",".join(str(i) for i in ids)
    adql = f"""
        SELECT {COLS}
        FROM gaiadr3.gaia_source AS gs
        JOIN gaiadr3.astrophysical_parameters AS ap
          ON gs.source_id = ap.source_id
        WHERE gs.source_id IN ({id_list})
    """
    job = Gaia.launch_job_async(adql)
    return job.get_results().to_pandas()

def main():
    ids = pd.read_csv("data/host_gaia_ids.csv")["source_id"].tolist()
    print(f"fetching Gaia params for {len(ids)} host source_ids in batches of {BATCH}...")

    frames = []
    for start in range(0, len(ids), BATCH):
        batch = ids[start:start + BATCH]
        df = fetch_batch(batch)
        frames.append(df)
        print(f"  batch {start//BATCH + 1}: requested {len(batch)}, got {len(df)}")

    result = pd.concat(frames, ignore_index=True).drop_duplicates(subset="source_id")
    print(f"\ntotal host stars with Gaia params: {len(result)}")

    # Require the five physics features present
    feat = ["teff_gspphot", "radius_gspphot", "mass_flame", "mh_gspphot", "lum_flame"]
    before = len(result)
    result = result.dropna(subset=feat).reset_index(drop=True)
    print(f"after requiring all 5 features: {len(result)} (dropped {before - len(result)})")

    os.makedirs("data", exist_ok=True)
    result.to_csv("data/hosts_gaia.csv", index=False)
    print("Saved -> data/hosts_gaia.csv")

if __name__ == "__main__":
    main()