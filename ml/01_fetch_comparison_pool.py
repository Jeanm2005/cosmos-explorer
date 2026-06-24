"""Fetch a pool of candidate non-host (comparison) stars from Gaia DR3."""
import os
import pandas as pd
from astroquery.gaia import Gaia

Gaia.login(user=os.environ["GAIA_USER"], password=os.environ["GAIA_PASS"])

# Observable bounds (central bulk of the host distribution; extremes dropped)
G_MAG_MIN, G_MAG_MAX = 5.0, 16.0
DIST_MIN_PC, DIST_MAX_PC = 10.0, 600.0
POOL_LIMIT = 20000

ADQL = f"""
SELECT TOP {POOL_LIMIT}
    gs.source_id,
    gs.phot_g_mean_mag,
    ap.teff_gspphot,
    ap.radius_gspphot,
    ap.mass_flame,
    ap.mh_gspphot,
    ap.lum_flame,
    ap.distance_gspphot
FROM gaiadr3.gaia_source AS gs
JOIN gaiadr3.astrophysical_parameters AS ap
    ON gs.source_id = ap.source_id
WHERE gs.phot_g_mean_mag BETWEEN {G_MAG_MIN} AND {G_MAG_MAX}
    AND ap.distance_gspphot BETWEEN {DIST_MIN_PC} AND {DIST_MAX_PC}
    AND ap.teff_gspphot   IS NOT NULL
    AND ap.radius_gspphot IS NOT NULL
    AND ap.mass_flame     IS NOT NULL
    AND ap.mh_gspphot     IS NOT NULL
    AND ap.lum_flame      IS NOT NULL
"""

def main():
    print("Launching Gaia DR3 query (this can take a few minutes)...")
    job = Gaia.launch_job_async(ADQL)
    table = job.get_results()
    df = table.to_pandas()
    print(f" returned {len(df)} candidate stars")
    
    os.makedirs("data", exist_ok=True)
    out = "data/gaia_pool.csv"
    df.to_csv(out, index=False)
    print(f"Saved -> {out}")
    print(df.describe())
    
if __name__ == "__main__":
    main()