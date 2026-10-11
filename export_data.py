import os
import json
import time
import pandas as pd

t0 = time.time()
csv_path = "ufc-master.csv"
if not os.path.exists(csv_path):
    raise FileNotFoundError("ufc-master.csv not found")

df = pd.read_csv(csv_path)

features = [
    "R_age", "B_age", 
    "R_Height_cms", "B_Height_cms", 
    "R_Reach_cms", "B_Reach_cms",
    "R_wins", "B_wins", 
    "R_losses", "B_losses",
    "R_current_win_streak", "B_current_win_streak",
    "R_current_lose_streak", "B_current_lose_streak",
    "R_win_by_KO/TKO", "B_win_by_KO/TKO",
    "R_win_by_Submission", "B_win_by_Submission",
    "R_avg_SUB_ATT", "B_avg_SUB_ATT",
    "R_avg_SIG_STR_pct", "B_avg_SIG_STR_pct",
    "R_avg_SIG_STR_landed", "B_avg_SIG_STR_landed",
    "R_avg_TD_pct", "B_avg_TD_pct",
    "R_avg_TD_landed", "B_avg_TD_landed",
    "R_odds", "B_odds"
]
existing_features = [col for col in features if col in df.columns]

raw_classes = sorted([str(wc) for wc in df["weight_class"].dropna().unique()])
all_weight_classes = ["All Weight Classes"] + raw_classes

rosters = {}
for wc in all_weight_classes:
    filtered = df if wc == "All Weight Classes" else df[df["weight_class"] == wc]
    roster = sorted(list(set(filtered["R_fighter"].dropna()).union(set(filtered["B_fighter"].dropna()))))
    rosters[wc] = roster

all_fighters = rosters["All Weight Classes"]

r_first = df.drop_duplicates(subset=["R_fighter"]).set_index("R_fighter")
b_first = df.drop_duplicates(subset=["B_fighter"]).set_index("B_fighter")
medians = df[existing_features].median().to_dict()

fighter_stats = {}
for name in all_fighters:
    stats = {}
    r_row = r_first.loc[name] if name in r_first.index else None
    b_row = b_first.loc[name] if name in b_first.index else None
    
    for col in existing_features:
        if col.startswith("R_"):
            clean = col[2:]
            b_col = f"B_{clean}"
            val = None
            if r_row is not None and col in r_row and pd.notna(r_row[col]):
                val = r_row[col]
            elif b_row is not None and b_col in b_row and pd.notna(b_row[b_col]):
                val = b_row[b_col]
            else:
                val = medians.get(col, 0.0)
            stats[clean] = round(float(val), 2)
            stats[clean.lower()] = round(float(val), 2)
    fighter_stats[name] = stats

data = {
    "weight_classes": all_weight_classes,
    "rosters": rosters,
    "fighter_stats": fighter_stats,
    "total_bouts": len(df),
    "features_count": len(existing_features)
}

output_file = "static_data.json"
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(data, f)

size_kb = os.path.getsize(output_file) / 1024
print(f"Export completed in {time.time()-t0:.2f}s! Size: {size_kb:.1f} KB")
