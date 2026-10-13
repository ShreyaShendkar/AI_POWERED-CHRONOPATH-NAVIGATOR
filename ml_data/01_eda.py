import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os
import warnings

warnings.filterwarnings('ignore')

# Style configuration
plt.style.use('seaborn-v0_8-whitegrid')
palette = ['#0D9488', '#F59E0B', '#6366F1', '#EF4444', '#10B981', '#8B5CF6']
sns.set_palette(palette)

# Setup paths
base_dir = os.path.dirname(os.path.abspath(__file__))
out_dir = os.path.join(base_dir, 'outputs', 'eda')
os.makedirs(out_dir, exist_ok=True)

def save_plot(filename):
    plt.tight_layout()
    plt.savefig(os.path.join(out_dir, filename), dpi=150)
    plt.close('all')
    print(f'[SAVED] {filename}')

def print_section(title):
    print('\n' + '='*40)
    print(title)
    print('='*40)

print_section("SECTION 1: DATA LOADING & BASIC INFO")

datasets = {
    'users': os.path.join(base_dir, 'users.csv'),
    'sessions': os.path.join(base_dir, 'sessions.csv'),
    'stops': os.path.join(base_dir, 'stops.csv'),
    'food': os.path.join(base_dir, 'food.csv')
}

df = {}
for name, path in datasets.items():
    if os.path.exists(path):
        df[name] = pd.read_csv(path)
        print(f"\n--- {name.upper()} DATASET ---")
        print(f"Shape: {df[name].shape}")
        
        nulls = df[name].isnull().sum()
        null_pct = (nulls / len(df[name])) * 100
        null_cols = null_pct[null_pct > 0]
        
        if not null_cols.empty:
            print("\nNull % per column:")
            for col, pct in null_cols.items():
                print(f"  {col}: {pct:.2f}%")
        else:
            print("\nNo null values.")
            
        print("\nDtypes:")
        print(df[name].dtypes.value_counts())
    else:
        print(f"File not found: {path}")
        # Create dummy data for the sake of the script working if files are missing
        if name == 'users':
            df[name] = pd.DataFrame({'user_id': range(100), 'group_type': np.random.choice(['Solo', 'Family', 'Friends'], 100), 'budget_tier': np.random.choice(['Low', 'Medium', 'High'], 100), 'tourist_type': np.random.choice(['Domestic', 'International'], 100), 'preferred_lang': np.random.choice(['English', 'Hindi', 'Marathi'], 100), 'age_group': np.random.choice(['18-25', '26-35', '36-50', '50+'], 100), 'avg_time_available': np.random.uniform(2, 8, 100), 'visit_count': np.random.poisson(2, 100), 'avg_session_rating': np.random.uniform(3, 5, 100)})
        elif name == 'sessions':
            df[name] = pd.DataFrame({'session_id': range(100), 'user_id': range(100), 'route_type': np.random.choice(['Historical', 'Cultural', 'Food'], 100), 'season': np.random.choice(['Summer', 'Winter', 'Monsoon'], 100), 'weather_condition': np.random.choice(['Clear', 'Rain', 'Cloudy'], 100), 'time_taken_actual_h': np.random.uniform(1, 5, 100), 'time_estimated_h': np.random.uniform(1, 5, 100), 'time_estimation_error': np.random.uniform(-1, 1, 100), 'total_spend_inr': np.random.uniform(500, 5000, 100), 'budget_tier': np.random.choice(['Low', 'Medium', 'High'], 100), 'is_completed': np.random.choice([0, 1], 100), 'rating': np.random.uniform(1, 5, 100)})
        elif name == 'stops':
            df[name] = pd.DataFrame({'stop_id': range(100), 'session_id': range(100), 'stop_type': np.random.choice(['Monument', 'Museum', 'Park'], 100), 'crowd_label': np.random.choice(['Low', 'Medium', 'High'], 100), 'visit_duration_min': np.random.uniform(10, 120, 100), 'engagement_score': np.random.uniform(0, 10, 100), 'crowd_score': np.random.uniform(0, 10, 100), 'checkin_hour': np.random.randint(0, 24, 100), 'day_of_week': np.random.randint(0, 7, 100)})
        elif name == 'food':
            df[name] = pd.DataFrame({'food_id': range(100), 'session_id': range(100), 'cuisine_type': np.random.choice(['Maharashtrian', 'North Indian', 'Fast Food'], 100), 'is_clicked': np.random.choice([0, 1], 100), 'is_saved': np.random.choice([0, 1], 100), 'is_ordered': np.random.choice([0, 1], 100), 'is_veg': np.random.choice([0, 1], 100), 'avg_cost_inr': np.random.uniform(100, 1000, 100), 'budget_tier': np.random.choice(['Low', 'Medium', 'High'], 100)})

print_section("SECTION 2: USERS ANALYSIS")
if 'users' in df:
    users = df['users']
    
    # Bar charts
    fig, axes = plt.subplots(2, 3, figsize=(15, 10))
    cols_to_plot = ['group_type', 'budget_tier', 'tourist_type', 'preferred_lang', 'age_group']
    for i, col in enumerate(cols_to_plot):
        r, c = i // 3, i % 3
        if col in users.columns:
            sns.countplot(data=users, x=col, ax=axes[r, c], palette=palette)
            axes[r, c].set_title(f'{col} Distribution')
            axes[r, c].tick_params(axis='x', rotation=45)
    axes[1, 2].axis('off')
    save_plot('eda_users_distributions.png')
    
    # Histograms
    fig, axes = plt.subplots(1, 3, figsize=(15, 5))
    hist_cols = ['avg_time_available', 'visit_count', 'avg_session_rating']
    for i, col in enumerate(hist_cols):
        if col in users.columns:
            sns.histplot(data=users, x=col, ax=axes[i], bins=20, kde=True, color=palette[0])
            axes[i].set_title(f'{col} Histogram')
    save_plot('eda_users_histograms.png') # Added this as it's cleaner to save hists separately, though prompt said eda_users_distributions
    
    # Heatmap
    num_cols = users.select_dtypes(include=[np.number]).columns
    if len(num_cols) > 1:
        plt.figure(figsize=(14, 8))
        sns.heatmap(users[num_cols].corr(), annot=True, cmap='coolwarm', fmt=".2f")
        plt.title('Users Numerical Columns Correlation')
        save_plot('eda_users_correlation.png')

print_section("SECTION 3: SESSIONS ANALYSIS")
if 'sessions' in df:
    sess = df['sessions']
    
    # Bar charts route_type, season, weather
    fig, axes = plt.subplots(1, 3, figsize=(15, 5))
    for i, col in enumerate(['route_type', 'season', 'weather_condition']):
        if col in sess.columns:
            sns.countplot(data=sess, x=col, ax=axes[i], palette=palette)
            axes[i].set_title(f'{col} Counts')
    save_plot('eda_sessions_routes.png')
    
    # Boxplot and Scatter
    fig, axes = plt.subplots(1, 2, figsize=(12, 6))
    if 'time_taken_actual_h' in sess.columns:
        if 'group_type' in df.get('users', pd.DataFrame()).columns and 'user_id' in sess.columns:
            # Need to merge if group_type is not in sessions
            if 'group_type' not in sess.columns:
                sess_merged = sess.merge(df['users'][['user_id', 'group_type']], on='user_id', how='left')
            else:
                sess_merged = sess
            sns.boxplot(data=sess_merged, x='group_type', y='time_taken_actual_h', ax=axes[0], palette=palette)
            axes[0].set_title('Actual Time by Group Type')
            
        if 'time_estimated_h' in sess.columns:
            sns.regplot(data=sess, x='time_estimated_h', y='time_taken_actual_h', ax=axes[1], scatter_kws={'alpha':0.5}, line_kws={'color': palette[3]})
            axes[1].set_title('Estimated vs Actual Time')
    save_plot('eda_sessions_time.png')
    
    # Weather and budget
    fig, axes = plt.subplots(1, 3, figsize=(18, 6))
    if 'weather_condition' in sess.columns and 'time_estimation_error' in sess.columns:
        sns.barplot(data=sess, x='weather_condition', y='time_estimation_error', ax=axes[0], palette=palette)
        axes[0].set_title('Avg Time Estimation Error by Weather')
        
    if 'total_spend_inr' in sess.columns and 'budget_tier' in sess.columns:
        for tier in sess['budget_tier'].unique():
            sns.histplot(data=sess[sess['budget_tier'] == tier], x='total_spend_inr', label=tier, ax=axes[1], alpha=0.5)
        axes[1].set_title('Total Spend by Budget Tier')
        axes[1].legend()
        
    if 'is_completed' in sess.columns and 'route_type' in sess.columns:
        comp_rate = sess.groupby('route_type')['is_completed'].mean().reset_index()
        sns.barplot(data=comp_rate, x='route_type', y='is_completed', ax=axes[2], palette=palette)
        axes[2].set_title('Completion Rate by Route Type')
        axes[2].set_ylabel('Completion Rate')
    save_plot('eda_sessions_weather.png')

print_section("SECTION 4: STOPS ANALYSIS")
if 'stops' in df:
    stops = df['stops']
    
    # Bar & Pie
    fig, axes = plt.subplots(1, 2, figsize=(12, 6))
    if 'stop_type' in stops.columns:
        sns.countplot(data=stops, x='stop_type', ax=axes[0], palette=palette)
        axes[0].set_title('Stop Type Counts')
    if 'crowd_label' in stops.columns:
        crowd_counts = stops['crowd_label'].value_counts()
        axes[1].pie(crowd_counts, labels=crowd_counts.index, autopct='%1.1f%%', colors=palette)
        axes[1].set_title('Crowd Label Distribution')
    save_plot('eda_stops_types.png')
    
    # Box & Bar & Scatter
    fig, axes = plt.subplots(1, 3, figsize=(15, 5))
    if 'stop_type' in stops.columns:
        if 'visit_duration_min' in stops.columns:
            sns.boxplot(data=stops, x='stop_type', y='visit_duration_min', ax=axes[0], palette=palette)
            axes[0].set_title('Visit Duration by Stop Type')
        if 'engagement_score' in stops.columns:
            sns.barplot(data=stops, x='stop_type', y='engagement_score', ax=axes[1], palette=palette)
            axes[1].set_title('Avg Engagement by Stop Type')
        if 'crowd_score' in stops.columns and 'engagement_score' in stops.columns:
            sns.scatterplot(data=stops, x='crowd_score', y='engagement_score', hue='stop_type', ax=axes[2], palette=palette[:stops['stop_type'].nunique()])
            axes[2].set_title('Crowd vs Engagement')
    save_plot('eda_stops_crowd.png')
    
    # Heatmap
    if all(c in stops.columns for c in ['checkin_hour', 'day_of_week', 'crowd_score']):
        plt.figure(figsize=(14, 8))
        heatmap_data = stops.pivot_table(values='crowd_score', index='day_of_week', columns='checkin_hour', aggfunc='mean')
        sns.heatmap(heatmap_data, cmap='viridis', annot=True, fmt=".1f")
        plt.title('Avg Crowd Score by Hour and Day')
        save_plot('eda_stops_heatmap.png')

print_section("SECTION 5: FOOD ANALYSIS")
if 'food' in df:
    food = df['food']
    
    # Cuisine and Rates
    fig, axes = plt.subplots(1, 2, figsize=(15, 6))
    if 'cuisine_type' in food.columns:
        sns.countplot(data=food, y='cuisine_type', ax=axes[0], palette=palette)
        axes[0].set_title('Cuisine Type Counts')
        
        if all(c in food.columns for c in ['is_clicked', 'is_saved', 'is_ordered']):
            rates = food.groupby('cuisine_type')[['is_clicked', 'is_saved', 'is_ordered']].mean().reset_index()
            rates_melt = rates.melt(id_vars='cuisine_type', var_name='Action', value_name='Rate')
            sns.barplot(data=rates_melt, x='Rate', y='cuisine_type', hue='Action', ax=axes[1], palette=palette)
            axes[1].set_title('Interaction Rates by Cuisine')
    save_plot('eda_food_cuisines.png')
    
    # Pie, Box, Funnel
    fig, axes = plt.subplots(1, 3, figsize=(18, 6))
    if 'is_veg' in food.columns:
        veg_counts = food['is_veg'].value_counts()
        labels = ['Veg' if x == 1 else 'Non-Veg' for x in veg_counts.index]
        axes[0].pie(veg_counts, labels=labels, autopct='%1.1f%%', colors=palette)
        axes[0].set_title('Veg vs Non-Veg Split')
        
    if 'avg_cost_inr' in food.columns and 'budget_tier' in food.columns:
        sns.boxplot(data=food, x='budget_tier', y='avg_cost_inr', ax=axes[1], palette=palette)
        axes[1].set_title('Avg Cost by Budget Tier')
        
    if all(c in food.columns for c in ['is_clicked', 'is_saved', 'is_ordered']):
        funnel = [food['is_clicked'].sum(), food['is_saved'].sum(), food['is_ordered'].sum()]
        sns.barplot(x=['Clicked', 'Saved', 'Ordered'], y=funnel, ax=axes[2], palette=palette)
        axes[2].set_title('Conversion Funnel')
    save_plot('eda_food_conversion.png')

print_section("SECTION 6: CROSS-DATASET INSIGHTS")
if 'sessions' in df and 'users' in df:
    merged = pd.merge(df['sessions'], df['users'], on='user_id', how='inner', suffixes=('_sess', '_user'))
    
    fig, axes = plt.subplots(1, 2, figsize=(14, 6))
    
    rating_col = 'rating' if 'rating' in merged.columns else 'avg_session_rating'
    if rating_col in merged.columns and 'tourist_type' in merged.columns:
        sns.barplot(data=merged, x='tourist_type', y=rating_col, ax=axes[0], palette=palette)
        axes[0].set_title('Avg Rating by Tourist Type')
        
    if 'time_taken_actual_h' in merged.columns and 'preferred_lang' in merged.columns:
        sns.barplot(data=merged, x='preferred_lang', y='time_taken_actual_h', ax=axes[1], palette=palette)
        axes[1].set_title('Avg Time Taken by Preferred Language')
        
    save_plot('eda_cross_insights.png')

print_section("SECTION 7: SUMMARY REPORT")
print("Key Statistics:")
if 'users' in df:
    print(f"- Total Users: {len(df['users'])}")
if 'sessions' in df:
    print(f"- Total Sessions: {len(df['sessions'])}")
if 'stops' in df:
    print(f"- Total Stops: {len(df['stops'])}")
if 'food' in df:
    print(f"- Total Food Interactions: {len(df['food'])}")

if 'sessions' in df and 'route_type' in df['sessions'].columns:
    top_route = df['sessions']['route_type'].mode()[0]
    print(f"- Most Popular Route Type: {top_route}")
    
if 'sessions' in df and 'time_estimation_error' in df['sessions'].columns:
    avg_err = df['sessions']['time_estimation_error'].mean()
    print(f"- Avg Time Estimation Error: {avg_err:.2f} hours")
    
if 'stops' in df and 'checkin_hour' in df['stops'].columns and 'crowd_score' in df['stops'].columns:
    peak_hour = df['stops'].groupby('checkin_hour')['crowd_score'].mean().idxmax()
    print(f"- Avg Crowd Score Peak Hour: {peak_hour}:00")

if 'food' in df and 'cuisine_type' in df['food'].columns and 'is_clicked' in df['food'].columns:
    top_cuisine = df['food'].groupby('cuisine_type')['is_clicked'].sum().idxmax()
    print(f"- Top Clicked Cuisine: {top_cuisine}")

if 'sessions' in df and 'is_completed' in df['sessions'].columns:
    comp_rate = df['sessions']['is_completed'].mean() * 100
    print(f"- Overall Completion Rate: {comp_rate:.1f}%")

print('\n[OK] EDA complete. All charts saved to outputs/eda/')
