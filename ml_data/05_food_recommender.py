import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os
import warnings
import pickle
from sklearn.decomposition import TruncatedSVD
from sklearn.preprocessing import LabelEncoder, MinMaxScaler
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.metrics import mean_squared_error
from sklearn.model_selection import train_test_split

warnings.filterwarnings('ignore')
plt.style.use('seaborn-v0_8-whitegrid')
PALETTE = ['#0D9488', '#F59E0B', '#6366F1', '#EF4444', '#10B981', '#8B5CF6']

base_dir = os.path.dirname(os.path.abspath(__file__))
out_dir  = os.path.join(base_dir, 'outputs', 'food_recommender')
os.makedirs(out_dir, exist_ok=True)

def save_plot(fname):
    plt.tight_layout()
    plt.savefig(os.path.join(out_dir, fname), dpi=150)
    plt.close('all')
    print(f'  [SAVED] {fname}')

def section(title):
    print('\n' + '='*60)
    print(title)
    print('='*60)

# ---------------------------------------------------------------
# STEP 1 - LOAD DATA
# ---------------------------------------------------------------
section('STEP 1: LOAD DATA')
food  = pd.read_csv(os.path.join(base_dir, 'food.csv'))
users = pd.read_csv(os.path.join(base_dir, 'users.csv'))
print(f'food.csv:  {food.shape}')
print(f'users.csv: {users.shape}')

# ---------------------------------------------------------------
# STEP 2 - CONTENT-BASED FILTERING
# ---------------------------------------------------------------
section('STEP 2: CONTENT-BASED FILTERING')

# Build restaurant profiles
le_cuisine = LabelEncoder()
food['spice_score'] = food['spice_level'].map({'mild':1,'medium':2,'spicy':3,'very_spicy':4}).fillna(2)

rest_profiles = food.groupby('restaurant_id').agg(
    restaurant_name=('restaurant_name', 'first'),
    is_veg=('is_veg', 'first'),
    avg_cost_inr=('avg_cost_inr', 'mean'),
    cuisine_type=('cuisine_type', lambda x: x.mode()[0]),
    avg_rating=('user_rating', lambda x: x.dropna().mean()),
    click_rate=('user_clicked', lambda x: x.astype(int).mean()),
    order_rate=('user_ordered', lambda x: x.astype(int).mean()),
    spice_score=('spice_score', lambda x: x.mode()[0]),
).reset_index()

rest_profiles['avg_rating'] = rest_profiles['avg_rating'].fillna(rest_profiles['avg_rating'].mean())
rest_profiles['cuisine_encoded'] = le_cuisine.fit_transform(rest_profiles['cuisine_type'])
rest_profiles['is_veg_int'] = rest_profiles['is_veg'].astype(int)

# Normalize numeric features for cosine similarity
feat_cols = ['is_veg_int','avg_cost_inr','cuisine_encoded','avg_rating',
             'click_rate','order_rate','spice_score']
scaler_rest = MinMaxScaler()
rest_profiles_scaled = scaler_rest.fit_transform(rest_profiles[feat_cols].values)

# Cosine similarity matrix
sim_matrix = cosine_similarity(rest_profiles_scaled)
rest_ids   = rest_profiles['restaurant_id'].tolist()
rest_names = rest_profiles['restaurant_name'].tolist()
print(f'Restaurant similarity matrix: {sim_matrix.shape}')

def get_similar_restaurants(rest_id, top_n=5):
    if rest_id not in rest_ids:
        return []
    idx  = rest_ids.index(rest_id)
    sims = list(enumerate(sim_matrix[idx]))
    sims = sorted(sims, key=lambda x: x[1], reverse=True)
    results = []
    for i, score in sims:
        if rest_ids[i] != rest_id:
            results.append((rest_ids[i], rest_names[i], round(score, 3)))
        if len(results) >= top_n:
            break
    return results

print('\nSimilar to vaishali:')
for r in get_similar_restaurants('vaishali'):
    print(f'  {r[1]:<35} sim={r[2]}')

print('\nSimilar to german_bakery:')
for r in get_similar_restaurants('german_bakery'):
    print(f'  {r[1]:<35} sim={r[2]}')

# ---------------------------------------------------------------
# STEP 3 - COLLABORATIVE FILTERING (SVD)
# ---------------------------------------------------------------
section('STEP 3: COLLABORATIVE FILTERING (SVD)')

# Build interaction values — priority: ordered > rated > clicked > 0
food['interaction'] = 0.0
food.loc[food['user_clicked'].astype(bool), 'interaction'] = 3.0
food.loc[food['user_rating'].notna(), 'interaction'] = food.loc[food['user_rating'].notna(), 'user_rating']
food.loc[food['user_ordered'].astype(bool), 'interaction'] = 4.0

# Pivot
matrix = food.pivot_table(index='user_id', columns='restaurant_id',
                           values='interaction', aggfunc='max').fillna(0)
total_cells = matrix.shape[0] * matrix.shape[1]
nonzero     = (matrix.values > 0).sum()
sparsity    = 100 * (1 - nonzero / total_cells)
print(f'Interaction matrix: {matrix.shape}')
print(f'Sparsity: {sparsity:.1f}% ({nonzero}/{total_cells} non-zero)')

# SVD
n_components = min(10, min(matrix.shape) - 1)
svd = TruncatedSVD(n_components=n_components, random_state=42)
svd.fit(matrix.values)
print(f'Explained variance ratio sum: {svd.explained_variance_ratio_.sum():.3f}')

# Reconstruct
reconstructed_vals = svd.inverse_transform(svd.transform(matrix.values))
reconstructed = pd.DataFrame(reconstructed_vals, index=matrix.index, columns=matrix.columns)

def get_cf_recommendations(user_id, top_n=5):
    if user_id not in reconstructed.index:
        return []
    scores = reconstructed.loc[user_id].copy()
    # Zero out already-interacted
    interacted = matrix.loc[user_id][matrix.loc[user_id] > 0].index.tolist()
    scores[interacted] = -1
    top = scores.sort_values(ascending=False).head(top_n)
    return list(zip(top.index.tolist(), top.values.tolist()))

print('\nCF Top-5 for 3 users:')
for uid in ['u_00001', 'u_00050', 'u_00100']:
    recs = get_cf_recommendations(uid)
    print(f'\n  User {uid}:')
    for rid, score in recs:
        name = rest_profiles.loc[rest_profiles['restaurant_id']==rid,'restaurant_name'].values
        name = name[0] if len(name) else rid
        print(f'    {name:<35} predicted={score:.2f}')

# ---------------------------------------------------------------
# STEP 4 - HYBRID RECOMMENDER
# ---------------------------------------------------------------
section('STEP 4: HYBRID RECOMMENDER')

def get_hybrid_recommendations(user_id, context, top_n=5):
    cf_candidates = get_cf_recommendations(user_id, top_n=10)
    if not cf_candidates:
        return pd.DataFrame()

    cf_scores  = dict(cf_candidates)
    max_cf     = max(cf_scores.values()) or 1
    min_cf     = min(cf_scores.values())

    results = []
    for rid, cf_raw in cf_candidates:
        row = rest_profiles[rest_profiles['restaurant_id'] == rid]
        if row.empty:
            continue
        row = row.iloc[0]

        # Dietary
        user_veg = context.get('is_veg', True)
        dietary  = 1.0 if (not user_veg or bool(row['is_veg'])) else 0.0

        # Budget
        bmax     = context.get('budget_max_inr', 500)
        cost     = row['avg_cost_inr']
        if cost <= bmax:
            budget_s = 1.0
        else:
            budget_s = max(0.0, 1 - (cost - bmax) / bmax)

        # CF score normalised
        cf_norm = (cf_raw - min_cf) / (max_cf - min_cf + 1e-9)

        hybrid = 0.5 * cf_norm + 0.3 * dietary + 0.2 * budget_s

        results.append({
            'restaurant_id':  rid,
            'restaurant_name': row['restaurant_name'],
            'cuisine_type':   row['cuisine_type'],
            'avg_cost_inr':   round(row['avg_cost_inr'], 0),
            'is_veg':         bool(row['is_veg']),
            'hybrid_score':   round(hybrid, 3),
        })

    df_res = pd.DataFrame(results).sort_values('hybrid_score', ascending=False).head(top_n)
    return df_res.reset_index(drop=True)

demo_contexts = [
    ('Veg Budget Tourist',    'u_00001', {'is_veg': True,  'budget_max_inr': 150, 'time_of_day': 'breakfast'}),
    ('Non-Veg Premium Diner', 'u_00050', {'is_veg': False, 'budget_max_inr': 500, 'time_of_day': 'dinner'}),
    ('Foreign Tourist',       'u_00100', {'is_veg': True,  'budget_max_inr': 400, 'time_of_day': 'lunch'}),
]

for label, uid, ctx in demo_contexts:
    print(f'\n-- {label} (User: {uid}) --')
    recs = get_hybrid_recommendations(uid, ctx)
    if not recs.empty:
        print(recs.to_string(index=False))

# ---------------------------------------------------------------
# STEP 5 - EVALUATION
# ---------------------------------------------------------------
section('STEP 5: EVALUATION')

rated = food[food['user_rating'].notna()].copy()
train_r, test_r = train_test_split(rated, test_size=0.20, random_state=42)
print(f'Rated samples — Train: {len(train_r)} | Test: {len(test_r)}')

# RMSE: use reconstructed matrix for test pairs
y_actual, y_pred = [], []
for _, row in test_r.iterrows():
    uid = row['user_id']
    rid = row['restaurant_id']
    if uid in reconstructed.index and rid in reconstructed.columns:
        y_pred.append(reconstructed.loc[uid, rid])
        y_actual.append(row['user_rating'])

if y_actual:
    rmse = np.sqrt(mean_squared_error(y_actual, y_pred))
    print(f'CF RMSE on rated test set: {rmse:.3f}')

# Precision@5
prec_scores = []
for uid in test_r['user_id'].unique():
    top5 = [r for r, _ in get_cf_recommendations(uid, top_n=5)]
    user_pos = test_r[(test_r['user_id']==uid) & (test_r['user_rating']>=3)]['restaurant_id'].tolist()
    if top5 and user_pos:
        hits = len(set(top5) & set(user_pos)) / len(top5)
        prec_scores.append(hits)

if prec_scores:
    print(f'Precision@5 (CF): {np.mean(prec_scores):.3f}')

# ---------------------------------------------------------------
# STEP 6 - VISUALIZATIONS
# ---------------------------------------------------------------
section('STEP 6: VISUALIZATIONS')

# Plot 1 - Restaurant similarity heatmap
short_names = [n[:12] for n in rest_names]
fig, ax = plt.subplots(figsize=(14, 10))
sns.heatmap(sim_matrix, xticklabels=short_names, yticklabels=short_names,
            cmap='YlOrRd', ax=ax, linewidths=0.3)
ax.set_title('Restaurant Content Similarity Matrix', fontsize=13, fontweight='bold')
save_plot('food_restaurant_similarity.png')

# Plot 2 - Interaction matrix sample (first 30 users)
sample_matrix = matrix.head(30)
fig, ax = plt.subplots(figsize=(14, 8))
sns.heatmap(sample_matrix, cmap='Blues', ax=ax, linewidths=0.2, linecolor='white')
ax.set_title('User-Restaurant Interaction Matrix (Sample 30 Users)', fontsize=13, fontweight='bold')
ax.set_ylabel('User ID')
ax.set_xlabel('Restaurant ID')
save_plot('food_interaction_matrix.png')

# Plot 3 - SVD explained variance
fig, ax = plt.subplots(figsize=(10, 5))
comps = [f'C{i+1}' for i in range(n_components)]
ax.bar(comps, svd.explained_variance_ratio_, color=PALETTE[0], edgecolor='white')
ax.set_xlabel('SVD Component')
ax.set_ylabel('Explained Variance Ratio')
ax.set_title('SVD Latent Factor Explained Variance', fontsize=13, fontweight='bold')
save_plot('food_svd_variance.png')

# Plot 4 - Rating distribution actual vs predicted
actual_ratings = food['user_rating'].dropna()
all_pred = reconstructed.values.flatten()
fig, ax = plt.subplots(figsize=(10, 5))
ax.hist(actual_ratings, bins=15, alpha=0.6, color=PALETTE[0], label='Actual Ratings', density=True)
ax.hist(all_pred[all_pred > 0], bins=30, alpha=0.5, color=PALETTE[1], label='CF Predicted', density=True)
ax.set_xlabel('Rating Value')
ax.set_ylabel('Density')
ax.set_title('Actual vs CF Predicted Rating Distribution', fontsize=13, fontweight='bold')
ax.legend()
save_plot('food_rating_distribution.png')

# Plot 5 - Click rate ranking horizontal bar
rp_sorted = rest_profiles.sort_values('click_rate', ascending=True)
colors = [PALETTE[i % len(PALETTE)]
          for i in pd.Categorical(rp_sorted['cuisine_type']).codes]
fig, ax = plt.subplots(figsize=(12, 8))
bars = ax.barh(rp_sorted['restaurant_name'].str[:20], rp_sorted['click_rate'], color=colors)
ax.set_xlabel('Click Rate')
ax.set_title('Restaurant Click Rate Ranking', fontsize=13, fontweight='bold')
# Legend for cuisine types
cuisines = rp_sorted['cuisine_type'].unique()
handles  = [plt.Rectangle((0,0),1,1, color=PALETTE[i % len(PALETTE)]) for i, _ in enumerate(cuisines)]
ax.legend(handles, cuisines, loc='lower right', fontsize=8)
save_plot('food_click_rate_ranking.png')

# ---------------------------------------------------------------
# STEP 7 - SAVE ARTIFACTS
# ---------------------------------------------------------------
section('STEP 7: SAVE ARTIFACTS')

rest_profiles.to_csv(os.path.join(out_dir, 'restaurant_profiles.csv'), index=False)

np.save(os.path.join(out_dir, 'restaurant_similarity.npy'), sim_matrix)

with open(os.path.join(out_dir, 'svd_food_model.pkl'), 'wb') as f:
    pickle.dump(svd, f)

with open(os.path.join(out_dir, 'user_restaurant_matrix.pkl'), 'wb') as f:
    pickle.dump(matrix, f)

with open(os.path.join(out_dir, 'reconstructed_ratings.pkl'), 'wb') as f:
    pickle.dump(reconstructed, f)

for fname in ['restaurant_profiles.csv','restaurant_similarity.npy',
              'svd_food_model.pkl','user_restaurant_matrix.pkl','reconstructed_ratings.pkl']:
    path = os.path.join(out_dir, fname)
    size = os.path.getsize(path) / 1024
    print(f'  {fname:<35} {size:.1f} KB')

print('\n[OK] Food Recommender complete. Artifacts saved to outputs/food_recommender/')
