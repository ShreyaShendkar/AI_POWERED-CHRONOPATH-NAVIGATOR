"""
ChronoPath Navigator - Synthetic Dataset Generator
Generates 4 ML-ready datasets for Pune heritage tourism:
  1. users.csv           - 2500 user profiles
  2. sessions.csv        - 4000 route interaction records
  3. stops.csv           - 3500 venue engagement records
  4. food.csv            - 2500 food recommendation records
"""

import pandas as pd
import numpy as np
import random
import os
import sys
from datetime import datetime, timedelta

# Force UTF-8 output on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

random.seed(42)
np.random.seed(42)

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

# ---------------------------------------------------------
# HELPERS
# ---------------------------------------------------------

def rand_date(start_days_ago=365, end_days_ago=0):
    """Return a random datetime within the past N days."""
    base = datetime(2026, 10, 10)
    offset = random.randint(end_days_ago, start_days_ago)
    return base - timedelta(days=offset, hours=random.randint(0, 23),
                            minutes=random.randint(0, 59))

def weighted_choice(options, weights):
    return random.choices(options, weights=weights, k=1)[0]

# ---------------------------------------------------------
# DATASET 1 — USER PROFILES  (2500 rows)
# ---------------------------------------------------------

def generate_users(n=2500):
    print(f"Generating {n} user profiles...")

    group_types     = ['solo', 'couple', 'friends', 'family']
    group_w         = [0.35, 0.25, 0.25, 0.15]
    budget_tiers    = ['low', 'mid', 'high']
    budget_w        = [0.30, 0.50, 0.20]
    langs           = ['en', 'mr', 'hi', 'fr', 'de', 'es', 'ja']
    lang_w          = [0.30, 0.20, 0.20, 0.10, 0.08, 0.07, 0.05]
    tourist_types   = ['local', 'domestic', 'foreign']
    tourist_w       = [0.40, 0.35, 0.25]
    device_types    = ['android', 'ios', 'web']
    device_w        = [0.55, 0.35, 0.10]
    age_groups      = ['18-25', '26-35', '36-50', '50+']
    age_w           = [0.25, 0.35, 0.28, 0.12]
    genders         = ['M', 'F', 'NB', 'NA']
    gender_w        = [0.47, 0.46, 0.04, 0.03]

    # Country codes for foreign tourists
    foreign_countries = ['FR', 'DE', 'US', 'GB', 'JP', 'AU', 'CA', 'IT', 'ES', 'NL',
                         'SG', 'AE', 'KR', 'CN', 'BR', 'MX', 'RU', 'ZA', 'NZ', 'SE']

    rows = []
    for i in range(1, n + 1):
        t_type      = weighted_choice(tourist_types, tourist_w)
        lang        = weighted_choice(langs, lang_w)
        group       = weighted_choice(group_types, group_w)
        budget      = weighted_choice(budget_tiers, budget_w)
        device      = weighted_choice(device_types, device_w)
        age         = weighted_choice(age_groups, age_w)
        gender      = weighted_choice(genders, gender_w)
        visit_count = int(np.random.exponential(scale=3)) + 1  # at least 1
        badges      = min(visit_count * random.randint(0, 3), 30)

        # avg time depends on group & age
        base_time = {'solo': 3.0, 'couple': 3.5, 'friends': 4.0, 'family': 5.0}[group]
        avg_time  = round(np.clip(np.random.normal(base_time, 0.8), 1.0, 10.0), 1)

        # history layer preference — heritage-oriented tourists more likely ON
        history_on = weighted_choice([True, False],
                                     [0.70, 0.30] if lang in ['mr', 'hi'] else [0.55, 0.45])

        origin = weighted_choice(foreign_countries, [1/len(foreign_countries)] * len(foreign_countries)) \
                 if t_type == 'foreign' else ('IN' if t_type == 'domestic' else 'IN-PUN')

        created = rand_date(365, 0)

        rows.append({
            'user_id':              f'u_{i:05d}',
            'group_type':           group,
            'avg_time_available':   avg_time,
            'budget_tier':          budget,
            'preferred_lang':       lang,
            'history_layer_on':     history_on,
            'device_type':          device,
            'tourist_type':         t_type,
            'origin_country':       origin,
            'age_group':            age,
            'gender':               gender,
            'visit_count':          visit_count,
            'badges_earned':        badges,
            'account_created_at':   created.strftime('%Y-%m-%d %H:%M:%S'),
            'total_km_explored':    round(visit_count * random.uniform(2.5, 12.0), 2),
            'avg_session_rating':   round(np.clip(np.random.normal(3.9, 0.6), 1.0, 5.0), 1),
            'is_premium':           weighted_choice([True, False], [0.15, 0.85]),
            'notifications_on':     weighted_choice([True, False], [0.65, 0.35]),
        })

    df = pd.DataFrame(rows)
    out = os.path.join(OUTPUT_DIR, 'users.csv')
    df.to_csv(out, index=False)
    print(f"  ✅ Saved → {out}  ({len(df)} rows, {len(df.columns)} cols)")
    return df

# ---------------------------------------------------------
# DATASET 2 — ROUTE SESSIONS  (4000 rows)
# ---------------------------------------------------------

def generate_sessions(users_df, n=4000):
    print(f"Generating {n} route session records...")

    route_catalogue = [
        {'route_id': 'route_heritage_a', 'route_type': 'heritage', 'stops': 5,  'base_km': 9.5,  'est_h': 4.0},
        {'route_id': 'route_heritage_b', 'route_type': 'heritage', 'stops': 3,  'base_km': 5.0,  'est_h': 2.5},
        {'route_id': 'route_food_trail', 'route_type': 'food',     'stops': 6,  'base_km': 4.2,  'est_h': 3.0},
        {'route_id': 'route_nature_a',   'route_type': 'nature',   'stops': 4,  'base_km': 11.0, 'est_h': 3.5},
        {'route_id': 'route_wada_loop',  'route_type': 'heritage', 'stops': 5,  'base_km': 6.8,  'est_h': 3.5},
        {'route_id': 'route_mixed_a',    'route_type': 'mixed',    'stops': 7,  'base_km': 12.3, 'est_h': 5.0},
        {'route_id': 'route_express_1h', 'route_type': 'heritage', 'stops': 2,  'base_km': 2.5,  'est_h': 1.0},
        {'route_id': 'route_fort_trail', 'route_type': 'nature',   'stops': 3,  'base_km': 18.0, 'est_h': 5.5},
        {'route_id': 'route_food_b',     'route_type': 'food',     'stops': 5,  'base_km': 3.8,  'est_h': 2.5},
        {'route_id': 'route_grand_day',  'route_type': 'mixed',    'stops': 9,  'base_km': 22.0, 'est_h': 8.0},
        {'route_id': 'route_peth_walk',  'route_type': 'heritage', 'stops': 4,  'base_km': 3.2,  'est_h': 2.0},
        {'route_id': 'route_chai_trail', 'route_type': 'food',     'stops': 4,  'base_km': 5.5,  'est_h': 2.5},
        {'route_id': 'route_kolhapur_day','route_type': 'heritage','stops': 3,  'base_km': 8.0,  'est_h': 3.0},
    ]

    weather_opts    = ['sunny', 'cloudy', 'partly_cloudy', 'rainy', 'humid']
    weather_w       = [0.35, 0.20, 0.20, 0.15, 0.10]
    traffic_opts    = ['low', 'mid', 'high']
    interest_pool   = ['heritage', 'food', 'nature', 'art', 'architecture',
                       'photography', 'market', 'spirituality', 'adventure']

    user_ids = users_df['user_id'].tolist()
    rows     = []

    for i in range(1, n + 1):
        uid     = random.choice(user_ids)
        urow    = users_df[users_df['user_id'] == uid].iloc[0]
        route   = random.choice(route_catalogue)
        dt      = rand_date(400, 0)

        dow     = dt.weekday()              # 0=Mon 6=Sun
        month   = dt.month
        is_wknd = dow >= 5

        # Season in Pune
        season_map = {12: 'winter', 1: 'winter', 2: 'winter',
                      3: 'summer', 4: 'summer', 5: 'summer',
                      6: 'monsoon', 7: 'monsoon', 8: 'monsoon', 9: 'monsoon',
                      10: 'winter', 11: 'winter'}
        season = season_map[month]

        weather  = weighted_choice(weather_opts, weather_w)
        traffic  = weighted_choice(traffic_opts,
                                   [0.4, 0.4, 0.2] if not is_wknd else [0.2, 0.35, 0.45])

        # Time multipliers
        weather_mult = {'sunny': 1.0, 'cloudy': 1.05, 'partly_cloudy': 1.05,
                        'rainy': 1.40, 'humid': 1.15}[weather]
        traffic_mult = {'low': 1.0, 'mid': 1.15, 'high': 1.35}[traffic]
        group_mult   = {'solo': 0.90, 'couple': 1.00,
                        'friends': 1.10, 'family': 1.25}[urow['group_type']]

        est_h   = route['est_h']
        actual  = round(est_h * weather_mult * traffic_mult * group_mult
                        + np.random.normal(0, 0.25), 2)
        actual  = max(0.5, actual)

        # Completion depends on time available
        completed = actual <= float(urow['avg_time_available']) + 1.0

        num_interests = random.randint(1, 4)
        interests = random.sample(interest_pool, num_interests)

        rating = None
        if completed:
            # Higher rating if trip finished well
            base_r = 4.0 if completed else 3.0
            rating = int(np.clip(np.random.normal(base_r, 0.7), 1, 5))

        # Is there a festival/holiday boost (Diwali, Ganesh Chaturthi peak)
        is_festival = month in [8, 9, 10] and random.random() < 0.18

        rows.append({
            'session_id':            f's_{i:06d}',
            'user_id':               uid,
            'route_id':              route['route_id'],
            'route_type':            route['route_type'],
            'session_start':         dt.strftime('%Y-%m-%d %H:%M:%S'),
            'hour_of_day':           dt.hour,
            'day_of_week':           dow,
            'month':                 month,
            'season':                season,
            'is_weekend':            is_wknd,
            'is_festival_season':    is_festival,
            'stops_count':           route['stops'],
            'total_distance_km':     round(route['base_km'] + np.random.normal(0, 0.8), 2),
            'time_estimated_h':      est_h,
            'time_taken_actual_h':   actual,
            'time_estimation_error': round(actual - est_h, 2),
            'route_completed':       completed,
            'rating':                rating,
            'user_selected_interests': '|'.join(interests),
            'weather_condition':     weather,
            'traffic_level':         traffic,
            'group_type':            urow['group_type'],
            'budget_tier':           urow['budget_tier'],
            'tourist_type':          urow['tourist_type'],
            'preferred_lang':        urow['preferred_lang'],
            'history_layer_used':    urow['history_layer_on'],
            'audio_plays':           random.randint(0, route['stops'] * 2),
            'photos_taken':          random.randint(0, 20) if completed else random.randint(0, 8),
            'total_spend_inr':       round(random.uniform(50, 800)
                                          * {'low': 0.6, 'mid': 1.0, 'high': 1.8}[urow['budget_tier']], 2),
        })

    df = pd.DataFrame(rows)
    out = os.path.join(OUTPUT_DIR, 'sessions.csv')
    df.to_csv(out, index=False)
    print(f"  ✅ Saved → {out}  ({len(df)} rows, {len(df.columns)} cols)")
    return df

# ---------------------------------------------------------
# DATASET 3 — VENUE / STOP ENGAGEMENT  (3500 rows)
# ---------------------------------------------------------

def generate_stops(sessions_df, n=3500):
    print(f"Generating {n} venue engagement records...")

    pune_venues = [
        # stop_id, stop_name, stop_type, lat, lon, entry_fee, outdoor, accessibility
        ('shaniwar_wada',    'Historic Wadas & Forts Area',  'fort',       18.5195, 73.8553, 25,  True,  3),
        ('aga_khan_palace',  'Aga Khan Palace',              'palace',     18.5524, 73.9009, 30,  True,  4),
        ('sinhagad_fort',    'Sinhagad Fort',                'fort',       18.3664, 73.7550, 0,   True,  2),
        ('raja_dinkar',      'Raja Dinkar Kelkar Museum',    'museum',     18.5142, 73.8553, 100, False, 4),
        ('parvati_hill',     'Parvati Hill Temple',          'temple',     18.5004, 73.8490, 0,   True,  2),
        ('osho_ashram',      'Osho International Meditation','ashram',     18.5362, 73.8940, 0,   True,  5),
        ('vetal_tekdi',      'Vetal Tekdi Nature Reserve',   'park',       18.5240, 73.8380, 0,   True,  2),
        ('fc_road_market',   'FC Road Market Street',        'market',     18.5290, 73.8430, 0,   False, 3),
        ('dagdusheth_ganpati','Dagdusheth Halwai Ganapati',  'temple',     18.5162, 73.8554, 0,   False, 3),
        ('laxmi_road',       'Laxmi Road Heritage Walk',     'market',     18.5122, 73.8601, 0,   True,  3),
        ('kasba_ganpati',    'Kasba Ganpati',                'temple',     18.5174, 73.8568, 0,   False, 3),
        ('saras_baug',       'Saras Baug Garden',            'park',       18.4976, 73.8451, 0,   True,  4),
        ('tribal_museum',    'Tribal Museum Pune',           'museum',     18.5270, 73.8520, 20,  False, 4),
        ('chatushringi',     'Chatushringi Temple',          'temple',     18.5452, 73.8310, 0,   True,  2),
        ('mandai_market',    'Mandai Old Market',            'market',     18.5128, 73.8568, 0,   False, 2),
        ('bhau_daji_wada',   'Bhau Daji Wada Heritage',     'wada',       18.5180, 73.8540, 0,   True,  3),
        ('tambdi_jogeshwari','Tambdi Jogeshwari Cave',       'temple',     18.3620, 73.7540, 0,   True,  1),
        ('deccan_gymkhana',  'Deccan Gymkhana Heritage',     'heritage',   18.5236, 73.8421, 0,   True,  3),
        ('aundh_museum',     'Aundh Museum',                 'museum',     18.5562, 73.8154, 0,   False, 4),
        ('pm_vishram_baug',  'Vishrambaug Wada',             'wada',       18.5143, 73.8556, 0,   True,  3),
    ]

    stop_type_durations = {
        'fort': (35, 90), 'palace': (30, 75), 'museum': (25, 60),
        'temple': (15, 40), 'park': (20, 60), 'market': (30, 90),
        'ashram': (30, 90), 'heritage': (20, 50), 'wada': (25, 55)
    }

    session_ids = sessions_df['session_id'].tolist()
    rows = []

    for i in range(1, n + 1):
        sid     = random.choice(session_ids)
        srow    = sessions_df[sessions_df['session_id'] == sid].iloc[0]
        venue   = random.choice(pune_venues)
        (stop_id, stop_name, stop_type, lat, lon,
         entry_fee, is_outdoor, access_score) = venue

        # Check-in hour based on session start hour
        base_hour = int(srow['hour_of_day'])
        checkin_h = int(np.clip(base_hour + random.randint(0, 3), 6, 20))

        # Duration by stop type
        dur_min_rng = stop_type_durations.get(stop_type, (20, 60))
        dur_min = random.randint(*dur_min_rng)

        # Crowd depends on hour and day
        is_wknd = bool(srow['is_weekend'])
        if checkin_h in range(9, 12):
            base_crowd = 0.5 if not is_wknd else 0.7
        elif checkin_h in range(12, 16):
            base_crowd = 0.65 if not is_wknd else 0.85
        elif checkin_h in range(16, 19):
            base_crowd = 0.55 if not is_wknd else 0.75
        else:
            base_crowd = 0.25

        crowd_score = round(np.clip(np.random.normal(base_crowd, 0.12), 0.0, 1.0), 2)
        if crowd_score < 0.33:
            crowd_label = 'quiet'
        elif crowd_score < 0.66:
            crowd_label = 'moderate'
        else:
            crowd_label = 'crowded'

        audio_played   = random.random() < 0.60 if srow['history_layer_used'] else random.random() < 0.25
        photos_taken   = random.randint(0, 8)
        liked_stop     = random.random() < 0.68

        engagement = round(
            (int(audio_played) * 0.4)
            + (min(photos_taken, 5) / 5 * 0.3)
            + (min(dur_min / 60, 1.5) / 1.5 * 0.3),
            3
        )

        avg_rating = round(np.clip(np.random.normal(4.1, 0.55), 1.5, 5.0), 1)
        total_checkins = random.randint(50, 5000)

        # Accessibility & language board
        has_lang_board = random.random() < 0.55  # English signage present

        rows.append({
            'checkin_id':           f'c_{i:06d}',
            'session_id':           sid,
            'stop_id':              stop_id,
            'stop_name':            stop_name,
            'stop_type':            stop_type,
            'lat':                  lat,
            'lon':                  lon,
            'checkin_hour':         checkin_h,
            'day_of_week':          srow['day_of_week'],
            'month':                srow['month'],
            'season':               srow['season'],
            'is_weekend':           is_wknd,
            'is_festival_season':   srow['is_festival_season'],
            'visit_duration_min':   dur_min,
            'audio_played':         audio_played,
            'photos_taken':         photos_taken,
            'stop_liked':           liked_stop,
            'crowd_score':          crowd_score,
            'crowd_label':          crowd_label,
            'engagement_score':     engagement,
            'entry_fee_inr':        entry_fee,
            'avg_rating_stop':      avg_rating,
            'total_checkins_ever':  total_checkins,
            'is_outdoor':           is_outdoor,
            'accessibility_score':  access_score,
            'has_english_signage':  has_lang_board,
            'weather_at_visit':     srow['weather_condition'],
            'tourist_type':         srow['tourist_type'],
            'preferred_lang':       srow['preferred_lang'],
        })

    df = pd.DataFrame(rows)
    out = os.path.join(OUTPUT_DIR, 'stops.csv')
    df.to_csv(out, index=False)
    print(f"  ✅ Saved → {out}  ({len(df)} rows, {len(df.columns)} cols)")
    return df

# ---------------------------------------------------------
# DATASET 4 — FOOD RECOMMENDATIONS  (2500 rows)
# ---------------------------------------------------------

def generate_food(users_df, sessions_df, n=2500):
    print(f"Generating {n} food interaction records...")

    restaurants = [
        # rest_id, name, cuisine, is_veg, avg_cost, lat, lon
        ('vaishali',        'Vaishali Restaurant',          'maharashtrian', True,  180, 18.5290, 73.8430),
        ('shreyas',         'Shreyas Restaurant',           'maharashtrian', True,  220, 18.5142, 73.8553),
        ('goodluck_cafe',   'Good Luck Cafe',               'irani',         False, 120, 18.5289, 73.8432),
        ('kayani',          'Kayani Bakery',                'bakery',        False, 80,  18.5370, 73.8750),
        ('chitale',         'Chitale Bandhu Mithaiwale',    'sweets',        True,  100, 18.5143, 73.8560),
        ('sujata_mastani',  'Sujata Mastani',               'dessert',       True,  80,  18.5024, 73.8482),
        ('pune_vihar',      'Pune Vihar',                   'maharashtrian', True,  150, 18.5168, 73.8562),
        ('hotel_shreemant', 'Hotel Shreemant',              'maharashtrian', True,  200, 18.5155, 73.8560),
        ('bade_miya',       'Bade Miya',                    'mughlai',       False, 250, 18.5400, 73.8600),
        ('german_bakery',   'German Bakery Koregaon',       'continental',   False, 350, 18.5388, 73.8942),
        ('baner_misal',     'Baner Misal Point',            'maharashtrian', True,  80,  18.5590, 73.7878),
        ('dorabjees',       'Dorabjee Mawa Cake',           'bakery',        False, 60,  18.5368, 73.8742),
        ('punit_misal',     'Punit Misal',                  'maharashtrian', True,  70,  18.5124, 73.8550),
        ('marz_o_rin',      'Marz-O-Rin',                   'continental',   False, 200, 18.5288, 73.8440),
        ('wah_taj',         'Wah Taj Chicken House',        'mughlai',       False, 300, 18.5310, 73.8500),
        ('coffee_house',    'Indian Coffee House Pune',     'south_indian',  True,  120, 18.5262, 73.8511),
        ('bedekar',         'Bedekar Misal',                'maharashtrian', True,  90,  18.5167, 73.8568),
        ('abc_farms',       'ABC Farms',                    'continental',   False, 600, 18.5453, 73.7867),
        ('khau_galli',      'Khau Galli Street Stalls',     'street_food',   True,  50,  18.5122, 73.8568),
        ('sai_poha_house',  'Sai Poha House',               'maharashtrian', True,  60,  18.5200, 73.8530),
    ]

    dishes = {
        'maharashtrian': ['Misal Pav', 'Vada Pav', 'Sabudana Khichdi', 'Poha', 'Pithla Bhakri',
                          'Thalipeeth', 'Kande Pohe', 'Mastani', 'Shrikhand'],
        'irani':         ['Bun Maska', 'Irani Chai', 'Keema Pav', 'Akuri on Toast'],
        'mughlai':       ['Chicken Biryani', 'Mutton Rogan Josh', 'Seekh Kabab'],
        'bakery':        ['Shrewsbury Biscuits', 'Mawa Cake', 'Plum Cake', 'Croissant'],
        'sweets':        ['Bakarwadi', 'Chakli', 'Modak', 'Shrikhand', 'Basundi'],
        'dessert':       ['Mastani', 'Mango Mastani', 'Strawberry Mastani', 'Kulfi'],
        'continental':   ['Continental Breakfast', 'Pasta', 'Grilled Sandwich', 'Pizza'],
        'south_indian':  ['Idli Sambar', 'Masala Dosa', 'Filter Coffee', 'Uttapam'],
        'street_food':   ['Pav Bhaji', 'Bhel Puri', 'Sev Puri', 'Vada Pav', 'Dabeli'],
    }

    time_of_day_opts = ['breakfast', 'lunch', 'evening_snack', 'dinner']
    spice_opts       = ['mild', 'medium', 'spicy', 'very_spicy']
    spice_w          = [0.20, 0.40, 0.30, 0.10]

    user_ids    = users_df['user_id'].tolist()
    session_ids = sessions_df['session_id'].tolist()

    rows = []
    for i in range(1, n + 1):
        uid     = random.choice(user_ids)
        sid     = random.choice(session_ids)
        urow    = users_df[users_df['user_id'] == uid].iloc[0]
        srow    = sessions_df[sessions_df['session_id'] == sid].iloc[0]

        rest    = random.choice(restaurants)
        (rest_id, rest_name, cuisine, is_veg_rest,
         avg_cost, rest_lat, rest_lon) = rest

        dish_list = dishes.get(cuisine, ['Local Special'])
        dish_name = random.choice(dish_list)

        # User preference flags
        user_is_veg = random.random() < 0.60  # 60% veg preference in Pune
        budget_map  = {'low': 200, 'mid': 500, 'high': 1500}
        user_budget = budget_map.get(urow['budget_tier'], 500)

        # Distance from last route stop (simulate proximity)
        proximity = round(random.uniform(0.1, 5.0), 2)

        # Session time of day
        hour = int(srow['hour_of_day'])
        if hour < 10:
            tod = 'breakfast'
        elif hour < 14:
            tod = 'lunch'
        elif hour < 18:
            tod = 'evening_snack'
        else:
            tod = 'dinner'

        # Budget match
        budget_match = 1 if avg_cost <= user_budget * 0.4 else 0

        # Dietary match
        dietary_match = 1 if (not user_is_veg or is_veg_rest) else 0

        # Click & conversion logic
        relevance = (dietary_match * 0.4 + budget_match * 0.3
                     + (1 if proximity < 1.5 else 0) * 0.3)
        user_clicked  = random.random() < (0.3 + relevance * 0.5)
        user_saved    = user_clicked and random.random() < 0.35
        user_ordered  = user_clicked and random.random() < 0.20

        # Rating if interacted
        user_rated = None
        if user_ordered or user_saved:
            user_rated = int(np.clip(np.random.normal(4.0, 0.7), 1, 5))

        rows.append({
            'interaction_id':       f'f_{i:06d}',
            'user_id':              uid,
            'session_id':           sid,
            'restaurant_id':        rest_id,
            'restaurant_name':      rest_name,
            'dish_name':            dish_name,
            'cuisine_type':         cuisine,
            'is_veg':               is_veg_rest,
            'avg_cost_inr':         avg_cost,
            'spice_level':          weighted_choice(spice_opts, spice_w),
            'rest_lat':             rest_lat,
            'rest_lon':             rest_lon,
            'proximity_km':         proximity,
            'time_of_day':          tod,
            'group_type':           urow['group_type'],
            'user_is_veg':          user_is_veg,
            'budget_tier':          urow['budget_tier'],
            'user_budget_max_inr':  user_budget,
            'budget_match':         budget_match,
            'dietary_match':        dietary_match,
            'tourist_type':         urow['tourist_type'],
            'preferred_lang':       urow['preferred_lang'],
            'user_clicked':         user_clicked,
            'user_saved':           user_saved,
            'user_ordered':         user_ordered,
            'user_rating':          user_rated,
            'relevance_score':      round(relevance, 3),
            'day_of_week':          srow['day_of_week'],
            'is_weekend':           srow['is_weekend'],
            'season':               srow['season'],
            'weather_condition':    srow['weather_condition'],
        })

    df = pd.DataFrame(rows)
    out = os.path.join(OUTPUT_DIR, 'food.csv')
    df.to_csv(out, index=False)
    print(f"  ✅ Saved → {out}  ({len(df)} rows, {len(df.columns)} cols)")
    return df

# ---------------------------------------------------------
# MAIN
# ---------------------------------------------------------

if __name__ == '__main__':
    print("\n" + "=" * 55)
    print("  ChronoPath Navigator - Synthetic Dataset Generator")
    print("  Context: Pune Heritage Tourism ML Datasets")
    print("=" * 55 + "\n")

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    users_df    = generate_users(n=2500)
    sessions_df = generate_sessions(users_df, n=4000)
    stops_df    = generate_stops(sessions_df, n=3500)
    food_df     = generate_food(users_df, sessions_df, n=2500)

    print("\n-- Summary " + "-" * 45)
    totals = {
        'users.csv':    len(users_df),
        'sessions.csv': len(sessions_df),
        'stops.csv':    len(stops_df),
        'food.csv':     len(food_df),
    }
    for fname, cnt in totals.items():
        print(f"  {fname:<20} {cnt:>5} records")
    print(f"  {'TOTAL':<20} {sum(totals.values()):>5} records")
    print("\n[OK] All datasets generated successfully!\n")

