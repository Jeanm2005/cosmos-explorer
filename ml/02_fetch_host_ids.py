"""
Fetch confirmed host stars and their Gaia DR3 source IDs from the Exoplanet
Archive. We then pull these hosts' STELLAR PARAMETERS FROM GAIA (not the
Archive), so hosts and non-hosts are measured by the identical Gaia pipeline.
"""
import os
import re
import pandas as pd
from astroquery.ipac.nexsci.nasa_exoplanet_archive import NasaExoplanetArchive

def main():
    print("Querying Exoplanet Archive for host names + Gaia DR3 IDs...")
    table = NasaExoplanetArchive.query_criteria(
        table="pscomppars",
        select="hostname,gaia_dr3_id",
    )
    df = table.to_pandas().drop_duplicates(subset="hostname").reset_index(drop=True)
    print(f"  unique hosts: {len(df)}")

    def parse_gaia(s):
        if not isinstance(s, str):
            return None
        # Grab the LAST run of digits (the source id), not the "3" in "DR3"
        matches = re.findall(r"\d+", s)
        if not matches:
            return None
        # the source id is the long trailing number
        return int(matches[-1])

    df["source_id"] = df["gaia_dr3_id"].apply(parse_gaia)
    before = len(df)
    df = df.dropna(subset=["source_id"]).reset_index(drop=True)
    df["source_id"] = df["source_id"].astype("int64")
    print(f"  hosts with a Gaia DR3 id: {len(df)} (dropped {before - len(df)})")

    os.makedirs("data", exist_ok=True)
    df[["hostname", "source_id"]].to_csv("data/host_gaia_ids.csv", index=False)
    print("Saved -> data/host_gaia_ids.csv")

if __name__ == "__main__":
    main()