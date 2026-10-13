import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

import os
import pickle
import warnings
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.decomposition import TruncatedSVD
from sklearn.preprocessing import LabelEncoder, MinMaxScaler
from sklearn.metrics.pairwise import cosine_similarity

warnings.filterwarnings('ignore')

# Matplotlib setup - ASCII only, tight_layout, dpi=150, no plt.show()
plt.style.use('seaborn-v0_8-whitegrid')
OUT_DIR = 'outputs/route_recommender/'
os.makedirs(OUT_DIR, exist_ok=True)


def main():
    print("=" * 60)
    print("ROUTE RECOMMENDATION ENGINE (CONTENT-BASED + SVD CF)")
    print("=" * 60)

    # -------------------------------------------------------------
    # STEP 1 - LOAD DATA
    # -------------------------------------------------------------
    print("\n--- STEP 1: LOAD & MERGE DATA ---")
    sessions = pd.read_csv('sessions.csv')
    users = pd.read_csv('users.csv')
    personas = pd.read_csv('outputs/clustering/user_personas.csv')

    print(f"Loaded sessions: {sessions.shape}")
    print(f"Loaded users: {users.shape}")
    print(f"Loaded personas: {personas.shape}")

    # Merge sessions with users (suffixes=('','_usr'), drop columns ending in '_usr')
    merged = sessions.merge(users, on='user_id', how='left', suffixes=('', '_usr'))
    usr_dupes = [c for c in merged.columns if c.endswith('_usr')]
    merged = merged.drop(columns=usr_dupes)

    # Merge that with personas on user_id (keep persona_label column)
    merged = merged.merge(personas[['user_id', 'persona_label']], on='user_id', how='left')
    print(f"Merged sessions shape: {merged.shape}")

    # -------------------------------------------------------------
    # STEP 2 - ROUTE PROFILES
    # -------------------------------------------------------------
    print("\n--- STEP 2: ROUTE PROFILES ---")
    overall_mean_rating = float(sessions['rating'].dropna().mean())

    route_groups = sessions.groupby('route_id')
    route_ids = sorted(sessions['route_id'].unique())

    route_type_mode = route_groups['route_type'].agg(lambda x: x.mode()[0])
    avg_stops = route_groups['stops_count'].mean()
    avg_distance_km = route_groups['total_distance_km'].mean()
    avg_time_h = route_groups['time_estimated_h'].mean()
    completion_rate = route_groups['route_completed'].apply(lambda x: float(x.mean()))
    avg_rating = route_groups['rating'].mean().fillna(overall_mean_rating)

    session_counts = route_groups.size()
    max_sessions = float(session_counts.max())
    popularity = session_counts / max_sessions

    le_route_type = LabelEncoder()
    route_type_encoded = le_route_type.fit_transform([route_type_mode[r] for r in route_ids])

    route_profiles_dict = {
        'route_id': route_ids,
        'route_type': route_type_encoded,
        'route_type_name': [route_type_mode[r] for r in route_ids],
        'avg_stops': [avg_stops[r] for r in route_ids],
        'avg_distance_km': [avg_distance_km[r] for r in route_ids],
        'avg_time_h': [avg_time_h[r] for r in route_ids],
        'completion_rate': [completion_rate[r] for r in route_ids],
        'avg_rating': [avg_rating[r] for r in route_ids],
        'heritage_flag': [1 if route_type_mode[r] == 'heritage' else 0 for r in route_ids],
        'food_flag': [1 if route_type_mode[r] == 'food' else 0 for r in route_ids],
        'nature_flag': [1 if route_type_mode[r] == 'nature' else 0 for r in route_ids],
        'mixed_flag': [1 if route_type_mode[r] == 'mixed' else 0 for r in route_ids],
        'popularity': [popularity[r] for r in route_ids]
    }
    route_profiles = pd.DataFrame(route_profiles_dict)

    # Normalize numerics with MinMaxScaler to compute route cosine similarity matrix
    numeric_feature_cols = [
        'route_type', 'avg_stops', 'avg_distance_km', 'avg_time_h',
        'completion_rate', 'avg_rating', 'heritage_flag', 'food_flag',
        'nature_flag', 'mixed_flag', 'popularity'
    ]
    scaler_routes = MinMaxScaler()
    route_profiles_norm = route_profiles.copy()
    route_profiles_norm[numeric_feature_cols] = scaler_routes.fit_transform(route_profiles[numeric_feature_cols])

    route_similarity = cosine_similarity(route_profiles_norm[numeric_feature_cols])

    print("Route Profiles Table:")
    print(route_profiles[['route_id', 'route_type_name', 'avg_stops', 'avg_distance_km',
                          'avg_time_h', 'completion_rate', 'avg_rating', 'popularity']].to_string(index=False))

    # -------------------------------------------------------------
    # STEP 3 - USER PREFERENCE PROFILES
    # -------------------------------------------------------------
    print("\n--- STEP 3: USER PREFERENCE PROFILES ---")
    user_session_groups = sessions.groupby('user_id')

    user_prefs = pd.DataFrame({
        'user_id': sorted(sessions['user_id'].unique()),
        'heritage_affinity': user_session_groups['route_type'].apply(lambda x: float((x == 'heritage').mean())),
        'food_affinity': user_session_groups['route_type'].apply(lambda x: float((x == 'food').mean())),
        'nature_affinity': user_session_groups['route_type'].apply(lambda x: float((x == 'nature').mean())),
        'mixed_affinity': user_session_groups['route_type'].apply(lambda x: float((x == 'mixed').mean())),
        'avg_time_preference': user_session_groups['time_taken_actual_h'].mean(),
        'completion_tendency': user_session_groups['route_completed'].apply(lambda x: float(x.mean())),
        'avg_spend': user_session_groups['total_spend_inr'].mean()
    }).reset_index(drop=True)

    # Merge with users
    user_features = users[['user_id', 'budget_tier', 'group_type', 'preferred_lang']].copy()
    budget_map = {'low': 1, 'mid': 2, 'high': 3}
    user_features['budget_tier'] = user_features['budget_tier'].map(budget_map).fillna(2).astype(int)

    le_group = LabelEncoder()
    user_features['group_type'] = le_group.fit_transform(user_features['group_type'])

    le_lang = LabelEncoder()
    user_features['preferred_lang'] = le_lang.fit_transform(user_features['preferred_lang'])

    user_pref_profiles = user_prefs.merge(user_features, on='user_id', how='left')

    # Merge with personas
    persona_subset = personas[['user_id', 'persona_label']].copy()
    user_pref_profiles = user_pref_profiles.merge(persona_subset, on='user_id', how='left')
    user_pref_profiles['persona_label_str'] = user_pref_profiles['persona_label']

    le_persona = LabelEncoder()
    user_pref_profiles['persona_label'] = le_persona.fit_transform(user_pref_profiles['persona_label'].fillna('Unknown'))

    # Normalize numeric features
    norm_user_cols = [
        'heritage_affinity', 'food_affinity', 'nature_affinity', 'mixed_affinity',
        'avg_time_preference', 'completion_tendency', 'avg_spend',
        'budget_tier', 'group_type', 'preferred_lang', 'persona_label'
    ]
    scaler_users = MinMaxScaler()
    user_pref_profiles_norm = user_pref_profiles.copy()
    user_pref_profiles_norm[norm_user_cols] = scaler_users.fit_transform(user_pref_profiles[norm_user_cols])

    print(f"User Preference Profiles shape: {user_pref_profiles_norm.shape}")
    print(user_pref_profiles_norm.head(3).to_string())

    # -------------------------------------------------------------
    # STEP 4 - CF WITH SVD
    # -------------------------------------------------------------
    print("\n--- STEP 4: COLLABORATIVE FILTERING WITH SVD ---")
    # Interaction value: rating if not null, else 3.5 if route_completed==True, else 0
    sessions_cf = sessions.copy()
    sessions_cf['val'] = np.where(
        sessions_cf['rating'].notna(),
        sessions_cf['rating'].astype(float),
        np.where(sessions_cf['route_completed'].isin([True, 1, 'True', 'true']), 3.5, 0.0)
    )

    matrix = sessions_cf.pivot_table(
        index='user_id',
        columns='route_id',
        values='val',
        aggfunc='max'
    ).fillna(0.0)

    # Ensure all route_ids exist as columns
    for r in route_ids:
        if r not in matrix.columns:
            matrix[r] = 0.0
    matrix = matrix[route_ids]

    total_cells = matrix.shape[0] * matrix.shape[1]
    non_zeros = int((matrix > 0).sum().sum())
    sparsity = (1.0 - (non_zeros / float(total_cells))) * 100.0
    print(f"Interaction matrix shape: {matrix.shape}")
    print(f"Matrix sparsity: {sparsity:.2f}% ({non_zeros}/{total_cells} non-zero entries)")

    n_components = min(8, min(matrix.shape) - 1)
    svd = TruncatedSVD(n_components=n_components, random_state=42)
    user_latent = svd.fit_transform(matrix)
    reconstructed_matrix = svd.inverse_transform(user_latent)
    reconstructed_df = pd.DataFrame(reconstructed_matrix, index=matrix.index, columns=matrix.columns)
    explained_var = float(svd.explained_variance_ratio_.sum())
    print(f"SVD fitted with {n_components} components.")
    print(f"Explained variance sum: {explained_var:.4f}")

    def get_cf_route_recs(user_id, top_n=4):
        if user_id not in reconstructed_df.index:
            # Fallback for unknown user: top routes by average rating
            return route_profiles.sort_values('avg_rating', ascending=False)['route_id'].head(top_n).tolist()
        user_scores = reconstructed_df.loc[user_id].copy()
        visited = matrix.columns[matrix.loc[user_id] > 0]
        user_scores[visited] = -1.0
        return user_scores.sort_values(ascending=False).head(top_n).index.tolist()

    # -------------------------------------------------------------
    # STEP 5 - HYBRID RECOMMENDER
    # -------------------------------------------------------------
    print("\n--- STEP 5: HYBRID RECOMMENDER ---")
    route_profiles_by_id = route_profiles.set_index('route_id')

    def get_route_recommendations(user_id, context, top_n=4):
        # 1. CF top 8 candidates
        candidates = get_cf_route_recs(user_id, top_n=8)

        # Get reconstructed values for candidates to normalize 0-1
        if user_id in reconstructed_df.index:
            cand_cf_vals = {r: float(reconstructed_df.loc[user_id, r]) for r in candidates}
        else:
            cand_cf_vals = {r: float(route_profiles_by_id.loc[r, 'avg_rating']) for r in candidates}

        cf_min = min(cand_cf_vals.values())
        cf_max = max(cand_cf_vals.values())

        records = []
        for r_id in candidates:
            route = route_profiles_by_id.loc[r_id]

            # time_score
            time_score = max(0.0, 1.0 - abs(route['avg_time_h'] - context.get('time_available_h', 4.0)) / 8.0)

            # interest_score
            interest_score = 0.0
            for interest in context.get('interests', []):
                flag_col = f"{interest.lower()}_flag"
                if flag_col in route:
                    interest_score += route[flag_col]
            interest_score = min(1.0, float(interest_score))

            # group_score
            if context.get('group_type', '') in ['family', 'friends'] and route.get('mixed_flag', 0):
                group_score = 1.0
            else:
                group_score = 0.8

            # cf_score normalized 0-1
            if cf_max > cf_min:
                cf_score = (cand_cf_vals[r_id] - cf_min) / (cf_max - cf_min)
            else:
                cf_score = 0.5

            hybrid = (0.50 * cf_score) + (0.25 * time_score) + (0.15 * interest_score) + (0.10 * group_score)

            records.append({
                'route_id': r_id,
                'route_type': route['route_type'],
                'route_type_name': route['route_type_name'],
                'avg_time_h': round(float(route['avg_time_h']), 2),
                'completion_rate': round(float(route['completion_rate']), 3),
                'hybrid_score': round(float(hybrid), 4)
            })

        res_df = pd.DataFrame(records)
        res_df = res_df.sort_values('hybrid_score', ascending=False).head(top_n).reset_index(drop=True)
        return res_df[['route_id', 'route_type', 'avg_time_h', 'completion_rate', 'hybrid_score']]

    # Demo for 5 user contexts
    # Select sample users matching characteristics
    users_with_sessions = matrix.index.tolist()
    users_df_valid = users[users['user_id'].isin(users_with_sessions)]

    u_solo = users_df_valid[users_df_valid['group_type'] == 'solo']['user_id'].iloc[0]
    u_family = users_df_valid[users_df_valid['group_type'] == 'family']['user_id'].iloc[0]
    u_foreign = users_df_valid[users_df_valid['tourist_type'] == 'foreign']['user_id'].iloc[0]
    u_friends = users_df_valid[users_df_valid['group_type'] == 'friends']['user_id'].iloc[0]
    u_couple = users_df_valid[users_df_valid['group_type'] == 'couple']['user_id'].iloc[0]

    demo_scenarios = [
        ("Demo 1: Solo traveler, 2h, budget=low, interests=['heritage']",
         u_solo, {'time_available_h': 2.0, 'budget_tier': 'low', 'interests': ['heritage'], 'group_type': 'solo'}),
        ("Demo 2: Family group, 6h, budget=high, interests=['food','nature']",
         u_family, {'time_available_h': 6.0, 'budget_tier': 'high', 'interests': ['food', 'nature'], 'group_type': 'family'}),
        ("Demo 3: Foreign tourist, 4h, budget=mid, interests=['heritage','photography']",
         u_foreign, {'time_available_h': 4.0, 'budget_tier': 'mid', 'interests': ['heritage', 'photography'], 'group_type': 'solo'}),
        ("Demo 4: Friends outing, 8h, budget=mid, interests=['food','adventure']",
         u_friends, {'time_available_h': 8.0, 'budget_tier': 'mid', 'interests': ['food', 'adventure'], 'group_type': 'friends'}),
        ("Demo 5: Couple getaway, 3h, budget=high, interests=['heritage','art']",
         u_couple, {'time_available_h': 3.0, 'budget_tier': 'high', 'interests': ['heritage', 'art'], 'group_type': 'couple'})
    ]

    for title, uid, ctx in demo_scenarios:
        print(f"\n{title} (User: {uid})")
        recs = get_route_recommendations(uid, ctx, top_n=4)
        print(recs.to_string(index=False))

    # -------------------------------------------------------------
    # STEP 6 - EVALUATION (Hit Rate@4 & NDCG@4)
    # -------------------------------------------------------------
    print("\n--- STEP 6: EVALUATION (Hit Rate@4 & NDCG@4) ---")
    sessions_sorted = sessions.sort_values('session_start')
    session_counts_per_user = sessions.groupby('user_id').size()
    eval_users = session_counts_per_user[session_counts_per_user >= 3].index

    # Hold out the last session by session_start date
    eval_sessions = sessions_sorted[sessions_sorted['user_id'].isin(eval_users)]
    last_session_idx = eval_sessions.groupby('user_id').tail(1).index
    train_sessions = sessions_sorted.drop(index=last_session_idx)
    test_sessions = sessions_sorted.loc[last_session_idx]

    # Calculate interaction values for training sessions
    train_sessions = train_sessions.copy()
    train_sessions['val'] = np.where(
        train_sessions['rating'].notna(),
        train_sessions['rating'].astype(float),
        np.where(train_sessions['route_completed'].isin([True, 1, 'True', 'true']), 3.5, 0.0)
    )

    train_matrix = train_sessions.pivot_table(
        index='user_id',
        columns='route_id',
        values='val',
        aggfunc='max'
    ).fillna(0.0)

    for r in route_ids:
        if r not in train_matrix.columns:
            train_matrix[r] = 0.0
    train_matrix = train_matrix[route_ids]

    train_n_components = min(8, min(train_matrix.shape) - 1)
    svd_train = TruncatedSVD(n_components=train_n_components, random_state=42)
    train_latent = svd_train.fit_transform(train_matrix)
    train_rec = svd_train.inverse_transform(train_latent)
    train_reconstructed_df = pd.DataFrame(train_rec, index=train_matrix.index, columns=train_matrix.columns)

    hits = []
    ndcgs = []
    for _, row in test_sessions.iterrows():
        uid = row['user_id']
        held_route = row['route_id']
        if uid not in train_reconstructed_df.index:
            continue

        u_scores = train_reconstructed_df.loc[uid].copy()
        visited = train_matrix.columns[train_matrix.loc[uid] > 0]
        u_scores[visited] = -1.0
        top4 = u_scores.sort_values(ascending=False).head(4).index.tolist()

        if held_route in top4:
            rank = top4.index(held_route) + 1  # 1-indexed position
            hits.append(1)
            ndcgs.append(1.0 / np.log2(rank + 1))
        else:
            hits.append(0)
            ndcgs.append(0.0)

    hit_rate = float(np.mean(hits)) if hits else 0.0
    mean_ndcg = float(np.mean(ndcgs)) if ndcgs else 0.0
    print(f"Hit Rate@4 = {hit_rate:.3f}, NDCG@4 = {mean_ndcg:.3f}")

    # -------------------------------------------------------------
    # STEP 7 - PERSONA DEFAULTS
    # -------------------------------------------------------------
    print("\n--- STEP 7: PERSONA DEFAULTS ---")
    persona_order = [
        'Heritage Scholar', 'Foodie Explorer',
        'Nature & Adventure Walker', 'Diligent Planner', 'Casual Visitor'
    ]

    persona_defaults_list = []
    for p in persona_order:
        p_sessions = merged[merged['persona_label'] == p]
        top3_routes = p_sessions.groupby('route_id')['rating'].mean().dropna().sort_values(ascending=False).head(3)
        print(f"Persona: {p}")
        for r_id, r_rating in top3_routes.items():
            print(f"   - {r_id}: avg rating = {r_rating:.2f}")
            persona_defaults_list.append({
                'persona_label': p,
                'route_id': r_id,
                'avg_rating': round(float(r_rating), 3)
            })

    persona_defaults_df = pd.DataFrame(persona_defaults_list)
    persona_defaults_path = os.path.join(OUT_DIR, 'persona_route_defaults.csv')
    persona_defaults_df.to_csv(persona_defaults_path, index=False)
    print(f"Saved persona route defaults to {persona_defaults_path}")

    # -------------------------------------------------------------
    # STEP 8 - VISUALIZATIONS
    # -------------------------------------------------------------
    print("\n--- STEP 8: GENERATING VISUALIZATIONS ---")

    # Plot 1: Route similarity heatmap
    plt.figure(figsize=(10, 8))
    sim_df = pd.DataFrame(route_similarity, index=route_profiles['route_id'], columns=route_profiles['route_id'])
    sns.heatmap(sim_df, annot=True, fmt='.2f', cmap='YlOrRd', cbar=True)
    plt.title('Route Content-Based Cosine Similarity Heatmap')
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    plot1_path = os.path.join(OUT_DIR, 'route_similarity_heatmap.png')
    plt.savefig(plot1_path, dpi=150)
    plt.close('all')
    print(f"Saved {plot1_path}")

    # Plot 2: User-route interaction matrix sample (first 40 users)
    plt.figure(figsize=(12, 8))
    sample_mat = matrix.iloc[:40]
    sns.heatmap(sample_mat, cmap='Blues', cbar=True, linewidths=0.1)
    plt.title('User-Route Interaction Matrix Sample (First 40 Users)')
    plt.xlabel('Route ID')
    plt.ylabel('User ID')
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    plot2_path = os.path.join(OUT_DIR, 'route_interaction_matrix.png')
    plt.savefig(plot2_path, dpi=150)
    plt.close('all')
    print(f"Saved {plot2_path}")

    # Plot 3: Grouped bar chart — route_id vs [popularity, completion_rate, avg_rating/5]
    plt.figure(figsize=(14, 6))
    perf_df = pd.DataFrame({
        'route_id': route_profiles['route_id'],
        'Popularity': route_profiles['popularity'],
        'Completion Rate': route_profiles['completion_rate'],
        'Avg Rating / 5': route_profiles['avg_rating'] / 5.0
    })
    perf_melted = perf_df.melt(id_vars='route_id', var_name='Metric', value_name='Value')
    sns.barplot(data=perf_melted, x='route_id', y='Value', hue='Metric', palette='viridis')
    plt.title('Route Performance Metrics (Popularity, Completion Rate, Rating / 5)')
    plt.xlabel('Route ID')
    plt.ylabel('Normalized Value [0 - 1]')
    plt.ylim(0, 1.15)
    plt.xticks(rotation=45, ha='right')
    plt.legend(loc='upper right')
    plt.tight_layout()
    plot3_path = os.path.join(OUT_DIR, 'route_performance.png')
    plt.savefig(plot3_path, dpi=150)
    plt.close('all')
    print(f"Saved {plot3_path}")

    # Plot 4: Persona x route_type affinity heatmap
    plt.figure(figsize=(8, 6))
    affinity_cols = ['heritage_affinity', 'food_affinity', 'nature_affinity', 'mixed_affinity']
    persona_affinity = user_pref_profiles.groupby('persona_label_str')[affinity_cols].mean()
    persona_affinity.columns = [c.replace('_affinity', '') for c in affinity_cols]
    persona_affinity = persona_affinity.reindex([p for p in persona_order if p in persona_affinity.index])
    sns.heatmap(persona_affinity, cmap='Greens', annot=True, fmt='.2f', cbar=True)
    plt.title('Persona x Route Type Affinity Heatmap')
    plt.xlabel('Route Type')
    plt.ylabel('User Persona')
    plt.tight_layout()
    plot4_path = os.path.join(OUT_DIR, 'route_persona_affinity.png')
    plt.savefig(plot4_path, dpi=150)
    plt.close('all')
    print(f"Saved {plot4_path}")

    # Plot 5: SVD latent space scatter (first 2 components, color by persona_label)
    plt.figure(figsize=(10, 7))
    latent_plot_df = pd.DataFrame({
        'user_id': matrix.index,
        'Latent_Component_1': user_latent[:, 0],
        'Latent_Component_2': user_latent[:, 1]
    }).merge(user_pref_profiles[['user_id', 'persona_label_str']], on='user_id', how='left')

    sns.scatterplot(
        data=latent_plot_df,
        x='Latent_Component_1',
        y='Latent_Component_2',
        hue='persona_label_str',
        hue_order=[p for p in persona_order if p in latent_plot_df['persona_label_str'].unique()],
        palette='tab10',
        alpha=0.75,
        s=40
    )
    plt.title('User SVD Latent Space (Components 1 & 2 colored by Persona)')
    plt.xlabel('SVD Component 1')
    plt.ylabel('SVD Component 2')
    plt.legend(title='Persona', bbox_to_anchor=(1.05, 1), loc='upper left')
    plt.tight_layout()
    plot5_path = os.path.join(OUT_DIR, 'route_user_latent_space.png')
    plt.savefig(plot5_path, dpi=150)
    plt.close('all')
    print(f"Saved {plot5_path}")

    # -------------------------------------------------------------
    # STEP 9 - SAVE ARTIFACTS & PRINT SIZES
    # -------------------------------------------------------------
    print("\n--- STEP 9: SAVE ARTIFACTS ---")
    route_profiles_path = os.path.join(OUT_DIR, 'route_profiles.csv')
    user_pref_path = os.path.join(OUT_DIR, 'user_pref_profiles.csv')
    svd_model_path = os.path.join(OUT_DIR, 'svd_route_model.pkl')
    rec_matrix_path = os.path.join(OUT_DIR, 'route_reconstructed.pkl')
    route_sim_path = os.path.join(OUT_DIR, 'route_similarity.npy')

    # Save CSVs
    route_profiles.to_csv(route_profiles_path, index=False)
    user_pref_profiles_norm.to_csv(user_pref_path, index=False)

    # Save Pickles
    with open(svd_model_path, 'wb') as f:
        pickle.dump(svd, f)

    with open(rec_matrix_path, 'wb') as f:
        pickle.dump(reconstructed_df, f)

    # Save numpy array
    np.save(route_sim_path, route_similarity)

    saved_files = [
        route_profiles_path,
        user_pref_path,
        svd_model_path,
        rec_matrix_path,
        route_sim_path,
        persona_defaults_path,
        plot1_path,
        plot2_path,
        plot3_path,
        plot4_path,
        plot5_path
    ]

    print("\nSaved Artifact File Sizes:")
    for fpath in saved_files:
        if os.path.exists(fpath):
            size_kb = os.path.getsize(fpath) / 1024.0
            print(f"  - {os.path.basename(fpath)}: {size_kb:.2f} KB")

    print("\n[OK] Route Recommender complete. Artifacts saved to outputs/route_recommender/")


if __name__ == '__main__':
    main()
