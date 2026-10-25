import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os
import warnings

from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score, davies_bouldin_score
from sklearn.preprocessing import LabelEncoder

warnings.filterwarnings('ignore')

plt.style.use('seaborn-v0_8-whitegrid')
CUSTOM_PALETTE = ['#0D9488','#F59E0B','#6366F1','#EF4444','#10B981']

base_dir = os.path.dirname(os.path.abspath(__file__))
out_dir = os.path.join(base_dir, 'outputs', 'clustering')


def main():
    os.makedirs(out_dir, exist_ok=True)
    
    print("=== STEP 1: LOAD DATA ===")
    sessions = pd.read_csv(os.path.join(base_dir, 'sessions.csv'))
    stops = pd.read_csv(os.path.join(base_dir, 'stops.csv'))
    users = pd.read_csv(os.path.join(base_dir, 'users.csv'))
    
    print(f"Sessions shape: {sessions.shape}")
    print(f"Stops shape: {stops.shape}")
    print(f"Users shape: {users.shape}")
    
    print("\n=== STEP 2: FEATURE ENGINEERING FOR CLUSTERING ===")
    
    # Aggregating sessions features
    session_agg = sessions.groupby('user_id').agg(
        total_sessions=('session_id', 'count'),
        completion_rate=('route_completed', lambda x: x.mean()),
        avg_time_taken=('time_taken_actual_h', 'mean'),
        avg_audio_plays=('audio_plays', 'mean'),
        avg_photos_taken=('photos_taken', 'mean'),
        avg_spend=('total_spend_inr', 'mean'),
        weekend_preference=('is_weekend', lambda x: x.mean()),
        monsoon_traveler=('season', lambda x: (x == 'monsoon').mean()),
        avg_rating_given=('rating', lambda x: x.dropna().mean()),
        heritage_route_ratio=('route_type', lambda x: (x == 'heritage').mean()),
        food_route_ratio=('route_type', lambda x: (x == 'food').mean()),
        nature_route_ratio=('route_type', lambda x: (x == 'nature').mean())
    ).reset_index()
    
    # Merge with users
    features_df = pd.merge(session_agg, users[['user_id', 'avg_time_available', 'history_layer_on', 'visit_count', 'badges_earned']], on='user_id', how='left')
    
    # history_layer_on to int if it's boolean
    if features_df['history_layer_on'].dtype == bool:
        features_df['history_layer_on'] = features_df['history_layer_on'].astype(int)
    
    # Filter total_sessions >= 1
    features_df = features_df[features_df['total_sessions'] >= 1]
    print(f"Feature matrix shape after filtering: {features_df.shape}")
    
    print("\n=== STEP 3: PREPROCESSING ===")
    
    # Store user_id for later
    user_ids = features_df['user_id']
    X = features_df.drop('user_id', axis=1)
    
    # Handle NaN
    X = X.fillna(0)
    
    # Scaling
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    print(f"Feature matrix shape: {X_scaled.shape}")
    
    print("\n=== STEP 4: ELBOW METHOD ===")
    inertias = []
    silhouettes = []
    
    K_range = range(2, 11)
    for k in K_range:
        kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
        kmeans.fit(X_scaled)
        inertias.append(kmeans.inertia_)
        silhouettes.append(silhouette_score(X_scaled, kmeans.labels_))
    
    for k, inertia, sil in zip(K_range, inertias, silhouettes):
        print(f"K={k}: Inertia={inertia:.2f}, Silhouette={sil:.4f}")
    
    best_k = K_range[np.argmax(silhouettes)]
    print(f"Recommended K based on highest silhouette score: {best_k}")
    
    fig, ax1 = plt.subplots(figsize=(10, 6))
    
    color = 'tab:blue'
    ax1.set_xlabel('Number of clusters (K)')
    ax1.set_ylabel('Inertia (WCSS)', color=color)
    ax1.plot(K_range, inertias, marker='o', color=color, label='Inertia')
    ax1.tick_params(axis='y', labelcolor=color)
    
    ax2 = ax1.twinx()
    color = 'tab:red'
    ax2.set_ylabel('Silhouette Score', color=color)
    ax2.plot(K_range, silhouettes, marker='s', color=color, label='Silhouette Score')
    ax2.tick_params(axis='y', labelcolor=color)
    
    plt.title('Elbow Method: Inertia vs Silhouette Score')
    fig.tight_layout()
    plt.savefig(os.path.join(out_dir, 'clustering_elbow_method.png'), dpi=150)
    plt.close()
    
    print("\n=== STEP 5: TRAIN FINAL K-MEANS (K=5) ===")
    final_k = 5
    kmeans = KMeans(n_clusters=final_k, random_state=42, n_init=10)
    clusters = kmeans.fit_predict(X_scaled)
    
    sil_score = silhouette_score(X_scaled, clusters)
    db_score = davies_bouldin_score(X_scaled, clusters)
    
    print(f"Silhouette Score: {sil_score:.4f}")
    print(f"Davies-Bouldin Score: {db_score:.4f}")
    
    cluster_counts = pd.Series(clusters).value_counts().sort_index()
    print("Cluster sizes:")
    print(cluster_counts)
    
    print("\n=== STEP 6: PERSONA LABELING ===")
    X['cluster_id'] = clusters
    cluster_profiles = X.groupby('cluster_id').mean()
    
    persona_mapping = {}
    
    # Basic logic for 5 personas assignment
    score_heritage = cluster_profiles['heritage_route_ratio'] + cluster_profiles['avg_audio_plays']
    c_heritage = score_heritage.idxmax()
    persona_mapping[c_heritage] = 'Heritage Scholar'
    
    rem_clusters = [c for c in range(final_k) if c not in persona_mapping]
    score_food = cluster_profiles['food_route_ratio'] + cluster_profiles['avg_spend']
    c_food = score_food[rem_clusters].idxmax()
    persona_mapping[c_food] = 'Foodie Explorer'
    
    rem_clusters = [c for c in range(final_k) if c not in persona_mapping]
    score_nature = cluster_profiles['nature_route_ratio'] + cluster_profiles['avg_time_taken']
    c_nature = score_nature[rem_clusters].idxmax()
    persona_mapping[c_nature] = 'Nature & Adventure Walker'
    
    rem_clusters = [c for c in range(final_k) if c not in persona_mapping]
    score_planner = cluster_profiles['completion_rate'] + cluster_profiles['avg_rating_given']
    c_planner = score_planner[rem_clusters].idxmax()
    persona_mapping[c_planner] = 'Diligent Planner'
    
    rem_clusters = [c for c in range(final_k) if c not in persona_mapping]
    c_casual = rem_clusters[0]
    persona_mapping[c_casual] = 'Casual Visitor'
    
    print("Cluster to Persona Mapping:")
    for cid, pname in persona_mapping.items():
        print(f"Cluster {cid}: {pname}")
        
    X['persona_label'] = X['cluster_id'].map(persona_mapping)
    features_df['cluster_id'] = X['cluster_id']
    features_df['persona_label'] = X['persona_label']
    
    print("\nCluster Profile Table (Means):")
    print(cluster_profiles)
    
    print("\n=== STEP 7: PCA VISUALIZATION (2D) ===")
    pca = PCA(n_components=2)
    X_pca = pca.fit_transform(X_scaled)
    
    plt.figure(figsize=(10, 8))
    sns.scatterplot(x=X_pca[:, 0], y=X_pca[:, 1], hue=X['persona_label'], palette=CUSTOM_PALETTE, s=60, alpha=0.8)
    plt.title('Traveler Persona Clusters - PCA 2D Projection')
    plt.xlabel('PCA Component 1')
    plt.ylabel('PCA Component 2')
    plt.legend(title='Persona')
    plt.tight_layout()
    plt.savefig(os.path.join(out_dir, 'clustering_pca_2d.png'), dpi=150)
    plt.close()
    
    print("\n=== STEP 8: CLUSTER PROFILE HEATMAP ===")
    profile_heatmap_data = cluster_profiles.copy()
    profile_heatmap_data.index = profile_heatmap_data.index.map(persona_mapping)
    
    plt.figure(figsize=(16, 6))
    sns.heatmap(profile_heatmap_data, annot=True, fmt='.2f', cmap='YlOrRd')
    plt.title('Cluster Profiles Heatmap (Feature Means)')
    plt.tight_layout()
    plt.savefig(os.path.join(out_dir, 'clustering_profile_heatmap.png'), dpi=150)
    plt.close()
    
    print("\n=== STEP 9: PERSONA DISTRIBUTION BAR CHART ===")
    plt.figure(figsize=(10, 6))
    persona_counts = X['persona_label'].value_counts()
    sns.barplot(x=persona_counts.index, y=persona_counts.values, palette=CUSTOM_PALETTE)
    plt.title('Persona Distribution')
    plt.xlabel('Persona')
    plt.ylabel('Number of Users')
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig(os.path.join(out_dir, 'clustering_persona_distribution.png'), dpi=150)
    plt.close()
    
    print("\n=== STEP 10: SAVE RESULTS ===")
    out_file = os.path.join(out_dir, 'user_personas.csv')
    features_df.to_csv(out_file, index=False)
    print("First 10 rows of final data:")
    print(features_df.head(10))
    print("\n[OK] Persona clustering complete. Model ready for integration.")

if __name__ == '__main__':
    main()
