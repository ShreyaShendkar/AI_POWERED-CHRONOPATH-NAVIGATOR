"""
ChronoPath Navigator — ML API Service  (port 8001)
Serves predictions from all 5 trained models to the UI frontend.
"""
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

import sys, os, pickle, warnings
import numpy as np
import pandas as pd

warnings.filterwarnings("ignore")

# ── Paths ────────────────────────────────────────────────────────────
BASE   = os.path.dirname(os.path.abspath(__file__))
ML_DIR = os.path.join(BASE, "..", "ml_data")
OUT    = os.path.join(ML_DIR, "outputs")

# ── FastAPI ──────────────────────────────────────────────────────────
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="ChronoPath Navigator ML API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Global model store ───────────────────────────────────────────────
MODELS = {}

def load_pkl(path):
    with open(path, "rb") as f:
        return pickle.load(f)

@app.on_event("startup")
def load_models():
    print("[ML-API] Loading models…")

    # 1. XGBoost Time Estimator
    te_dir = os.path.join(OUT, "time_estimator")
    MODELS["time_model"]    = load_pkl(os.path.join(te_dir, "xgb_time_estimator.pkl"))
    MODELS["time_encoders"] = load_pkl(os.path.join(te_dir, "label_encoders.pkl"))
    with open(os.path.join(te_dir, "feature_columns.txt")) as f:
        MODELS["time_features"] = [l.strip() for l in f if l.strip()]

    # 2. Crowd Forecaster (Random Forest)
    cf_dir = os.path.join(OUT, "crowd_forecaster")
    MODELS["crowd_model"]    = load_pkl(os.path.join(cf_dir, "rf_crowd_forecaster.pkl"))
    MODELS["crowd_encoders"] = load_pkl(os.path.join(cf_dir, "crowd_label_encoders.pkl"))
    with open(os.path.join(cf_dir, "crowd_feature_columns.txt")) as f:
        MODELS["crowd_features"] = [l.strip() for l in f if l.strip()]

    # 3. Food Recommender (SVD)
    fr_dir = os.path.join(OUT, "food_recommender")
    MODELS["food_svd"]        = load_pkl(os.path.join(fr_dir, "svd_food_model.pkl"))
    MODELS["food_matrix"]     = load_pkl(os.path.join(fr_dir, "user_restaurant_matrix.pkl"))
    MODELS["food_recon"]      = load_pkl(os.path.join(fr_dir, "reconstructed_ratings.pkl"))
    MODELS["food_similarity"] = np.load(os.path.join(fr_dir, "restaurant_similarity.npy"))
    MODELS["restaurant_profiles"] = pd.read_csv(os.path.join(fr_dir, "restaurant_profiles.csv"))

    # 4. Route Recommender (SVD)
    rr_dir = os.path.join(OUT, "route_recommender")
    MODELS["route_svd"]      = load_pkl(os.path.join(rr_dir, "svd_route_model.pkl"))
    MODELS["route_recon"]    = load_pkl(os.path.join(rr_dir, "route_reconstructed.pkl"))
    MODELS["route_profiles"] = pd.read_csv(os.path.join(rr_dir, "route_profiles.csv"))
    MODELS["user_pref"]      = pd.read_csv(os.path.join(rr_dir, "user_pref_profiles.csv"))
    MODELS["persona_defaults"] = pd.read_csv(os.path.join(rr_dir, "persona_route_defaults.csv"))

    # 5. Persona CSV (for lookups)
    MODELS["user_personas"] = pd.read_csv(os.path.join(OUT, "clustering", "user_personas.csv"))

    print("[ML-API] All 5 models loaded OK")


# ════════════════════════════════════════════════════════════════════
#  HEALTH
# ════════════════════════════════════════════════════════════════════
@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "models_loaded": list(MODELS.keys()),
        "version": "1.0.0"
    }


# ════════════════════════════════════════════════════════════════════
#  1. PERSONA DETECTION
# ════════════════════════════════════════════════════════════════════
class PersonaRequest(BaseModel):
    user_id: Optional[str] = None
    # Behavioral signals when user_id not in DB (new/guest user)
    heritage_sessions: int = 0
    food_sessions: int = 0
    nature_sessions: int = 0
    audio_plays_avg: float = 0
    completion_rate: float = 0.5
    avg_spend: float = 300

@app.post("/api/persona/detect")
def detect_persona(req: PersonaRequest):
    personas = MODELS["user_personas"]

    # Returning user — look up saved persona
    if req.user_id and req.user_id in personas["user_id"].values:
        row = personas[personas["user_id"] == req.user_id].iloc[0]
        return {
            "persona_label": row["persona_label"],
            "cluster_id": int(row["cluster_id"]),
            "is_returning": True
        }

    # New/guest user — rule-based mapping from signals
    total = req.heritage_sessions + req.food_sessions + req.nature_sessions or 1
    heritage_r = req.heritage_sessions / total
    food_r     = req.food_sessions / total
    nature_r   = req.nature_sessions / total

    if heritage_r >= 0.5 and req.audio_plays_avg >= 2:
        label = "Heritage Scholar"
    elif food_r >= 0.4 or req.avg_spend >= 400:
        label = "Foodie Explorer"
    elif nature_r >= 0.4:
        label = "Nature & Adventure Walker"
    elif req.completion_rate >= 0.85:
        label = "Diligent Planner"
    else:
        label = "Casual Visitor"

    return {"persona_label": label, "cluster_id": -1, "is_returning": False}


# ════════════════════════════════════════════════════════════════════
#  2. ROUTE RECOMMENDATIONS
# ════════════════════════════════════════════════════════════════════
ROUTE_META = {
    "route_heritage_a":   {"name": "Peshwa Heritage Deep Dive",    "emoji": "🏛️",  "image": "heritage",  "stops": 5},
    "route_heritage_b":   {"name": "Old Peth Wada Walk",           "emoji": "🏰",  "image": "heritage",  "stops": 3},
    "route_food_trail":   {"name": "Street Food Trail",            "emoji": "🍲",  "image": "food",      "stops": 6},
    "route_nature_a":     {"name": "Tekdi Nature & Hills",         "emoji": "🌿",  "image": "nature",    "stops": 4},
    "route_wada_loop":    {"name": "Wadas & Forts Loop",           "emoji": "⚔️",  "image": "heritage",  "stops": 5},
    "route_mixed_a":      {"name": "Pune All-In-One Grand Tour",   "emoji": "✨",  "image": "mixed",     "stops": 7},
    "route_express_1h":   {"name": "1-Hour Express Heritage",      "emoji": "⚡",  "image": "heritage",  "stops": 2},
    "route_fort_trail":   {"name": "Fort & Hills Adventure",       "emoji": "🏔️",  "image": "nature",    "stops": 3},
    "route_food_b":       {"name": "Irani Chai & Bakery Trail",    "emoji": "☕",  "image": "food",      "stops": 5},
    "route_grand_day":    {"name": "Grand Heritage Full Day",      "emoji": "👑",  "image": "mixed",     "stops": 9},
    "route_peth_walk":    {"name": "Laxmi Road Heritage Walk",     "emoji": "🚶",  "image": "heritage",  "stops": 4},
    "route_chai_trail":   {"name": "Chai & Snacks Trail",          "emoji": "🧋",  "image": "food",      "stops": 4},
    "route_kolhapur_day": {"name": "Deccan Heritage Explorer",     "emoji": "🗿",  "image": "heritage",  "stops": 3},
}

WHY_FIT = {
    "Heritage Scholar":          "Perfect for history lovers — rich audio stories",
    "Foodie Explorer":           "Curated food stops match your taste profile",
    "Nature & Adventure Walker": "Outdoor trails aligned with your active style",
    "Diligent Planner":          "High completion rate route fits your style",
    "Casual Visitor":            "Easy paced route for a relaxed Pune visit",
}

class RouteRequest(BaseModel):
    user_id: Optional[str] = None
    persona_label: Optional[str] = "Casual Visitor"
    group_type: str = "solo"
    time_available_h: float = 3.5
    budget_tier: str = "mid"
    interests: List[str] = []
    top_n: int = 4

@app.post("/api/route/recommend")
def recommend_routes(req: RouteRequest):
    route_profiles = MODELS["route_profiles"]
    route_recon    = MODELS["route_recon"]
    persona_def    = MODELS["persona_defaults"]

    candidates = []

    # CF personalisation for known users
    if req.user_id and req.user_id in route_recon.index:
        scores_row = route_recon.loc[req.user_id].copy()
        top_cf = scores_row.sort_values(ascending=False).head(8).index.tolist()
    else:
        # Persona-based cold start
        if req.persona_label and req.persona_label in persona_def.get("persona_label", pd.Series()).values:
            p_routes = persona_def[persona_def["persona_label"] == req.persona_label]["route_id"].tolist()
        else:
            p_routes = []
        top_cf = p_routes + [r for r in route_profiles["route_id"].tolist() if r not in p_routes]

    # Score each candidate
    interest_flag_map = {
        "history": "heritage_flag",
        "heritage": "heritage_flag",
        "food": "food_flag",
        "culture": "heritage_flag",
        "nature": "nature_flag",
        "adventure": "nature_flag",
        "photography": "mixed_flag",
        "shopping": "food_flag",
        "entertainment": "mixed_flag",
        "art": "mixed_flag"
    }

    # Score ALL routes (not just CF top-10) so time proximity always wins
    all_route_ids = route_profiles["route_id"].tolist()
    # Put CF top picks first, then remaining routes
    ordered_ids = top_cf + [r for r in all_route_ids if r not in top_cf]

    import math
    for rid in ordered_ids:
        rp = route_profiles[route_profiles["route_id"] == rid]
        if rp.empty:
            continue
        rp = rp.iloc[0]

        route_time = float(rp.get("avg_time_h", 3.5))

        # ── Time proximity score (Gaussian) ──────────────────────────────
        # Routes CLOSEST to user's requested duration score highest.
        # sigma=1.5h: at 0h diff → 1.0, at 1.5h diff → 0.61, at 3h diff → 0.14
        time_diff = abs(route_time - req.time_available_h)
        time_s = math.exp(-0.5 * (time_diff / 1.5) ** 2)

        # ── Interest score ────────────────────────────────────────────────
        int_s = 0.0
        if req.interests:
            matches = 0
            for interest in req.interests:
                flag_col = interest_flag_map.get(interest.lower().strip())
                if flag_col and flag_col in rp.index and float(rp[flag_col]) > 0:
                    matches += 1
            int_s = min(1.0, matches / max(1, len(req.interests)))

        # ── Group score ───────────────────────────────────────────────────
        grp_s = 1.0 if req.group_type in ("family", "friends") and rp.get("mixed_flag", 0) > 0 else 0.8

        # ── CF / popularity score ─────────────────────────────────────────
        if req.user_id and req.user_id in route_recon.index and rid in route_recon.columns:
            cf_raw = float(route_recon.loc[req.user_id, rid])
            cf_max = route_recon.loc[req.user_id].max() or 1
            cf_s   = max(0.0, cf_raw / cf_max)
        else:
            cf_s = float(rp.get("popularity", 0.5))

        # Balanced weights: Time (0.35), Interests (0.35), CF (0.20), Group (0.10)
        hybrid = 0.20 * cf_s + 0.35 * time_s + 0.35 * int_s + 0.10 * grp_s

        meta = ROUTE_META.get(rid, {"name": rid, "emoji": "🗺️", "image": "heritage", "stops": 4})
        time_label = f"{route_time}h"
        diff_label = ""
        if abs(route_time - req.time_available_h) < 0.1:
            diff_label = "exact match"
        elif route_time < req.time_available_h:
            diff_label = f"{req.time_available_h - route_time:.1f}h shorter"
        else:
            diff_label = f"{route_time - req.time_available_h:.1f}h longer"

        candidates.append({
            "route_id":        rid,
            "name":            meta["name"],
            "emoji":           meta["emoji"],
            "route_type":      str(rp.get("route_type_name", "mixed")),
            "avg_time_h":      round(route_time, 1),
            "time_label":      time_label,
            "time_fit_label":  diff_label,
            "stops_count":     meta["stops"],
            "completion_rate": round(float(rp.get("completion_rate", 0.7)), 2),
            "avg_rating":      round(float(rp.get("avg_rating", 3.8)), 1),
            "hybrid_score":    round(hybrid, 3),
            "time_score":      round(time_s, 3),
            "why_fits":        WHY_FIT.get(req.persona_label, "Recommended based on your preferences"),
        })

    candidates.sort(key=lambda x: x["hybrid_score"], reverse=True)
    return {
        "recommendations": candidates[:req.top_n],
        "persona_used":    req.persona_label,
        "model":           "SVD_CF + Content_Hybrid",
        "total_candidates": len(candidates)
    }


# ════════════════════════════════════════════════════════════════════
#  3. TIME ESTIMATION
# ════════════════════════════════════════════════════════════════════
class TimeRequest(BaseModel):
    stops_count: int = 4
    total_distance_km: float = 8.0
    time_estimated_h: float = 3.5
    hour_of_day: int = 9
    day_of_week: int = 6
    month: int = 10
    audio_plays: int = 3
    photos_taken: int = 5
    avg_time_available: float = 4.0
    visit_count: int = 2
    badges_earned: int = 3
    route_type: str = "heritage"
    weather_condition: str = "sunny"
    traffic_level: str = "low"
    group_type: str = "solo"
    budget_tier: str = "mid"
    tourist_type: str = "domestic"
    season: str = "winter"
    is_weekend: int = 1
    is_festival_season: int = 0
    history_layer_used: int = 1
    history_layer_on: int = 1

@app.post("/api/time/predict")
def predict_time(req: TimeRequest):
    model    = MODELS["time_model"]
    encoders = MODELS["time_encoders"]
    features = MODELS["time_features"]

    cat_cols  = ["route_type","weather_condition","traffic_level",
                 "group_type","budget_tier","tourist_type","season"]
    bool_cols = ["is_weekend","is_festival_season","history_layer_used","history_layer_on"]
    num_cols  = ["stops_count","total_distance_km","time_estimated_h","hour_of_day",
                 "day_of_week","month","audio_plays","photos_taken",
                 "avg_time_available","visit_count","badges_earned"]

    row = req.dict()
    for col in cat_cols:
        le = encoders.get(col)
        if le:
            val = row[col]
            if val not in le.classes_:
                val = le.classes_[0]
            row[col] = int(le.transform([val])[0])

    for col in bool_cols:
        row[col] = int(row[col])

    X = np.array([[row[f] for f in features]], dtype=float)
    pred_h = float(model.predict(X)[0])
    pred_h = max(0.5, round(pred_h, 2))

    hours   = int(pred_h)
    minutes = int((pred_h - hours) * 60)
    diff    = round(pred_h - req.time_estimated_h, 2)

    return {
        "predicted_hours":   pred_h,
        "display":           f"{hours}h {minutes:02d}m",
        "vs_estimate":       diff,
        "accuracy_note":     "XGBoost R²=0.987 | RMSE=0.297h",
        "model":             "XGBoost_Regressor"
    }


# ════════════════════════════════════════════════════════════════════
#  4. CROWD PREDICTION
# ════════════════════════════════════════════════════════════════════
STOP_TYPE_MAP = {
    "shaniwar_wada": "fort",      "aga_khan_palace": "palace",
    "sinhagad_fort": "fort",      "raja_dinkar": "museum",
    "parvati_hill": "temple",     "osho_ashram": "ashram",
    "vetal_tekdi": "park",        "fc_road_market": "market",
    "dagdusheth_ganpati": "temple","laxmi_road": "market",
    "kasba_ganpati": "temple",    "saras_baug": "park",
    "tribal_museum": "museum",    "chatushringi": "temple",
    "mandai_market": "market",    "bhau_daji_wada": "wada",
    "deccan_gymkhana": "heritage","aundh_museum": "museum",
    "pm_vishram_baug": "wada",    "tambdi_jogeshwari": "temple",
}

class CrowdRequest(BaseModel):
    stop_id: str = "kasba_ganpati"
    hour: int = 11
    day_of_week: int = 6
    month: int = 10
    is_weekend: int = 1
    is_festival_season: int = 0
    weather: str = "sunny"
    tourist_type: str = "local"

@app.post("/api/crowd/predict")
def predict_crowd(req: CrowdRequest):
    model    = MODELS["crowd_model"]
    encoders = MODELS["crowd_encoders"]
    features = MODELS["crowd_features"]

    stop_type = STOP_TYPE_MAP.get(req.stop_id, "heritage")
    season_map = {12:"winter",1:"winter",2:"winter",
                  3:"summer",4:"summer",5:"summer",
                  6:"monsoon",7:"monsoon",8:"monsoon",9:"monsoon",
                  10:"winter",11:"winter"}
    season = season_map.get(req.month, "winter")

    # Feature defaults for venue
    venue_defaults = {
        "entry_fee_inr": 25, "accessibility_score": 3,
        "total_checkins_ever": 1000, "avg_rating_stop": 4.0,
        "is_outdoor": 1, "has_english_signage": 1,
    }

    # Cyclical features
    hour_sin  = float(np.sin(2 * np.pi * req.hour / 24))
    hour_cos  = float(np.cos(2 * np.pi * req.hour / 24))
    dow_sin   = float(np.sin(2 * np.pi * req.day_of_week / 7))
    dow_cos   = float(np.cos(2 * np.pi * req.day_of_week / 7))

    row = {
        "checkin_hour":        req.hour,
        "day_of_week":         req.day_of_week,
        "month":               req.month,
        "entry_fee_inr":       venue_defaults["entry_fee_inr"],
        "accessibility_score": venue_defaults["accessibility_score"],
        "total_checkins_ever": venue_defaults["total_checkins_ever"],
        "avg_rating_stop":     venue_defaults["avg_rating_stop"],
        "is_weekend":          req.is_weekend,
        "is_festival_season":  req.is_festival_season,
        "is_outdoor":          venue_defaults["is_outdoor"],
        "has_english_signage": venue_defaults["has_english_signage"],
        "hour_sin": hour_sin, "hour_cos": hour_cos,
        "dow_sin":  dow_sin,  "dow_cos":  dow_cos,
    }

    # Encode categorical cols
    for col, val in [("stop_type", stop_type), ("weather_at_visit", req.weather),
                     ("season", season), ("tourist_type", req.tourist_type)]:
        le = encoders.get(col)
        if le:
            if val not in le.classes_:
                val = le.classes_[0]
            row[col] = int(le.transform([val])[0])
        else:
            row[col] = 0

    X = np.array([[row.get(f, 0) for f in features]], dtype=float)
    pred_enc  = int(model.predict(X)[0])
    proba     = model.predict_proba(X)[0]

    le_target = encoders.get("crowd_label")
    label = le_target.inverse_transform([pred_enc])[0] if le_target else "moderate"
    confidence = round(float(proba.max()) * 100, 1)

    emoji_map  = {"quiet": "🟢", "moderate": "🟡", "crowded": "🔴"}
    advice_map = {
        "quiet":    "Great time to visit — very few crowds!",
        "moderate": "Moderate crowd — expect some wait times.",
        "crowded":  "Busy period — consider visiting earlier or later."
    }

    return {
        "stop_id":       req.stop_id,
        "crowd_label":   label,
        "emoji":         emoji_map.get(label, "🟡"),
        "confidence_pct": confidence,
        "advice":        advice_map.get(label, ""),
        "model":         "RandomForest_Classifier"
    }


# ════════════════════════════════════════════════════════════════════
#  5. FOOD RECOMMENDATIONS
# ════════════════════════════════════════════════════════════════════
class FoodRequest(BaseModel):
    user_id: Optional[str] = None
    is_veg: bool = True
    budget_max_inr: int = 300
    time_of_day: str = "lunch"
    top_n: int = 5

@app.post("/api/food/recommend")
def recommend_food(req: FoodRequest):
    recon   = MODELS["food_recon"]
    matrix  = MODELS["food_matrix"]
    sim_mat = MODELS["food_similarity"]
    rp      = MODELS["restaurant_profiles"]

    rest_ids = rp["restaurant_id"].tolist()

    # Build CF scores
    if req.user_id and req.user_id in recon.index:
        scores_row = recon.loc[req.user_id].copy()
        already    = matrix.loc[req.user_id][matrix.loc[req.user_id] > 0].index.tolist() \
                     if req.user_id in matrix.index else []
        scores_row[already] = -1
    else:
        # Popularity fallback
        scores_row = pd.Series({r: rp.loc[rp["restaurant_id"]==r,"click_rate"].values[0]
                                if len(rp.loc[rp["restaurant_id"]==r]) else 0.5
                                for r in rest_ids})

    cf_max  = scores_row.max() or 1
    cf_min  = scores_row.min()

    results = []
    for rid in rest_ids:
        row = rp[rp["restaurant_id"] == rid]
        if row.empty:
            continue
        row = row.iloc[0]

        cost = float(row["avg_cost_inr"])

        # ── Dietary: hard exclude non-veg when user wants veg ────────────
        if req.is_veg and not bool(row["is_veg"]):
            continue

        # ── Budget proximity score ────────────────────────────────────────
        # Restaurants CLOSEST to budget_max score highest.
        # ₹900 with budget ₹1000 → 0.90  (close to budget = best experience)
        # ₹100 with budget ₹1000 → 0.10  (way under budget)
        # ₹1200 with budget ₹1000 → penalised
        if cost <= req.budget_max_inr:
            # Prefer restaurants near the budget ceiling (user wants full experience)
            budget_s = cost / req.budget_max_inr   # e.g. 900/1000 = 0.90
        else:
            # Over budget: penalise proportionally
            budget_s = max(0.0, 1.0 - (cost - req.budget_max_inr) / req.budget_max_inr)

        cf_raw  = float(scores_row.get(rid, 0))
        cf_norm = (cf_raw - cf_min) / (cf_max - cf_min + 1e-9)

        # Time-of-day affinity bonus
        tod_bonus = 0.0
        if req.time_of_day == "breakfast" and cost < 150:
            tod_bonus = 0.08
        elif req.time_of_day == "lunch" and 150 <= cost <= 400:
            tod_bonus = 0.05
        elif req.time_of_day == "dinner" and cost >= 200:
            tod_bonus = 0.08

        hybrid = 0.45 * cf_norm + 0.35 * budget_s + 0.20 * float(row.get("click_rate", 0.5)) + tod_bonus

        # Budget proximity label for UI
        diff = cost - req.budget_max_inr
        if abs(diff) < 20:
            budget_label = "exact budget"
        elif diff < 0:
            budget_label = f"₹{abs(int(diff))} under budget"
        else:
            budget_label = f"₹{int(diff)} over budget"

        results.append({
            "restaurant_id": rid,
            "name":          str(row["restaurant_name"]),
            "cuisine":       str(row["cuisine_type"]),
            "is_veg":        bool(row["is_veg"]),
            "avg_cost_inr":  round(cost, 0),
            "budget_label":  budget_label,
            "avg_rating":    round(float(row.get("avg_rating", 4.0)), 1),
            "click_rate":    round(float(row.get("click_rate", 0.5)), 2),
            "hybrid_score":  round(hybrid, 3),
        })

    results.sort(key=lambda x: x["hybrid_score"], reverse=True)
    return {
        "recommendations": results[:req.top_n],
        "filter_applied":  f"veg_only={req.is_veg}, target_budget=Rs{req.budget_max_inr}",
        "model":           "SVD_CF + Budget_Proximity_Hybrid"
    }


# ── Run ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=False)
