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
from sklearn.model_selection import train_test_split, KFold, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from xgboost import XGBRegressor

try:
    import shap
except ImportError:
    shap = None

warnings.filterwarnings('ignore')

base_dir = os.path.dirname(os.path.abspath(__file__))
out_dir = os.path.join(base_dir, 'outputs', 'time_estimator')
os.makedirs(out_dir, exist_ok=True)

print("=== STEP 1: LOAD DATA ===")
sessions = pd.read_csv(os.path.join(base_dir, 'sessions.csv'))
users = pd.read_csv(os.path.join(base_dir, 'users.csv'))
# Use suffixes so sessions columns always win on overlap (group_type, budget_tier, tourist_type exist in both)
merged = sessions.merge(users, on='user_id', how='left', suffixes=('', '_usr'))
# Drop the _usr duplicate columns
usr_dupes = [c for c in merged.columns if c.endswith('_usr')]
merged = merged.drop(columns=usr_dupes)
print(f"Merged shape: {merged.shape}")

print("\n=== STEP 2: FEATURE SELECTION ===")
target = 'time_taken_actual_h'

num_cols  = ['stops_count', 'total_distance_km', 'time_estimated_h', 'hour_of_day',
             'day_of_week', 'month', 'audio_plays', 'photos_taken',
             'avg_time_available', 'visit_count', 'badges_earned']
cat_cols  = ['route_type', 'weather_condition', 'traffic_level',
             'group_type', 'budget_tier', 'tourist_type', 'season']
bool_cols = ['is_weekend', 'is_festival_season', 'history_layer_used', 'history_layer_on']

# Verify all needed columns present
all_needed = num_cols + cat_cols + bool_cols
missing = [c for c in all_needed if c not in merged.columns]
if missing:
    print(f"[WARN] Missing columns (will skip): {missing}")
    num_cols  = [c for c in num_cols  if c in merged.columns]
    cat_cols  = [c for c in cat_cols  if c in merged.columns]
    bool_cols = [c for c in bool_cols if c in merged.columns]

merged = merged.dropna(subset=[target])
print(f"Training samples after drop: {len(merged)}")

X_raw = merged[num_cols + cat_cols + bool_cols].copy()
y = merged[target].values

print(f"Feature count: {X_raw.shape[1]}")

print("\n=== STEP 3: PREPROCESSING ===")
label_encoders = {}
for col in cat_cols:
    le = LabelEncoder()
    # Fill missing with string 'missing' before encoding to be safe
    X_raw[col] = X_raw[col].fillna('missing')
    X_raw[col] = le.fit_transform(X_raw[col].astype(str))
    label_encoders[col] = le

for col in bool_cols:
    X_raw[col] = X_raw[col].fillna(0).astype(int)

X_raw = X_raw.fillna(0)
print("Feature dtypes:")
print(X_raw.dtypes)

feature_cols = list(X_raw.columns)
X = X_raw.values

print("\n=== STEP 4: TRAIN/TEST SPLIT ===")
X_train, X_test, y_train, y_test, idx_train, idx_test = train_test_split(X, y, merged.index, test_size=0.20, random_state=42)
print(f"Train size: {len(X_train)}")
print(f"Test size: {len(X_test)}")

print("\n=== STEP 5: BASELINE MODEL ===")
baseline_pred = np.mean(y_train)
baseline_preds = [baseline_pred] * len(y_test)
baseline_rmse = np.sqrt(mean_squared_error(y_test, baseline_preds))
baseline_mae = mean_absolute_error(y_test, baseline_preds)
print(f"Baseline RMSE: {baseline_rmse:.3f} | MAE: {baseline_mae:.3f}")

print("\n=== STEP 6: TRAIN XGBOOST ===")
model = XGBRegressor(
    n_estimators=300,
    max_depth=6,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    min_child_weight=3,
    reg_alpha=0.1,
    reg_lambda=1.0,
    random_state=42,
    n_jobs=-1,
    verbosity=0
)
model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)
print("Training complete.")

print("\n=== STEP 7: EVALUATION ===")
y_pred = model.predict(X_test)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100

rmse_imp = (baseline_rmse - rmse) / baseline_rmse * 100
mae_imp = (baseline_mae - mae) / baseline_mae * 100

print(f"{'Metric':<15} {'XGBoost':<11} {'Baseline':<11} {'Improvement':<11}")
print("-" * 50)
print(f"{'RMSE':<15} {rmse:<11.3f} {baseline_rmse:<11.3f} +{rmse_imp:.1f}%")
print(f"{'MAE':<15} {mae:<11.3f} {baseline_mae:<11.3f} +{mae_imp:.1f}%")
print(f"{'R2 Score':<15} {r2:<11.3f} {'--':<11} {'--':<11}")
print(f"{'MAPE':<15} {mape:.1f}%{'':<6} {'--':<11} {'--':<11}")

cv = KFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(model, X, y, cv=cv, scoring='neg_root_mean_squared_error')
print(f"\nCV RMSE: {-np.mean(scores):.3f} +/- {np.std(scores):.3f}")

print("\n=== STEP 8: VISUALIZATIONS ===")
# Plot 1
plt.figure(figsize=(8,6))
plt.scatter(y_test, y_pred, alpha=0.5, color='#0D9488')
min_val = min(min(y_test), min(y_pred))
max_val = max(max(y_test), max(y_pred))
plt.plot([min_val, max_val], [min_val, max_val], 'r--')
plt.xlabel('Actual Hours')
plt.ylabel('Predicted Hours')
plt.title('XGBoost: Actual vs Predicted Visit Duration')
plt.text(0.05, 0.95, f'R2 = {r2:.3f}', transform=plt.gca().transAxes, bbox=dict(facecolor='white', alpha=0.8))
plt.tight_layout()
plt.savefig(os.path.join(out_dir, 'time_estimator_actual_vs_pred.png'), dpi=150)
plt.close('all')

# Plot 2
residuals = y_test - y_pred
plt.figure(figsize=(8,6))
sns.histplot(residuals, kde=True, color='#0D9488')
plt.xlabel('Error (Actual - Predicted)')
plt.title('Residuals Distribution (Prediction Error)')
plt.tight_layout()
plt.savefig(os.path.join(out_dir, 'time_estimator_residuals.png'), dpi=150)
plt.close('all')

# Plot 3
importances = model.feature_importances_
idx_sort = np.argsort(importances)[::-1]
sorted_importances = importances[idx_sort]
sorted_features = [feature_cols[i] for i in idx_sort]

colors = ['#0D9488'] * 5 + ['#CBD5E1'] * (len(importances) - 5)
plt.figure(figsize=(10,8))
plt.barh(range(len(importances)), sorted_importances[::-1], color=colors[::-1])
plt.yticks(range(len(importances)), sorted_features[::-1])
plt.xlabel('Importance')
plt.title('XGBoost Feature Importance (Top Features)')
plt.tight_layout()
plt.savefig(os.path.join(out_dir, 'time_estimator_feature_importance.png'), dpi=150)
plt.close('all')

# Plot 4
abs_error = np.abs(y_test - y_pred)
df_error = merged.loc[idx_test].copy()
df_error['abs_error'] = abs_error

fig, axes = plt.subplots(1, 2, figsize=(14, 6))

error_weather = df_error.groupby('weather_condition')['abs_error'].mean().sort_values(ascending=False)
error_weather.plot(kind='bar', ax=axes[0], color='#0D9488')
axes[0].set_title('Mean Absolute Error by Weather Condition')
axes[0].set_ylabel('Mean Abs Error (Hours)')
axes[0].tick_params(axis='x', rotation=45)

error_traffic = df_error.groupby('traffic_level')['abs_error'].mean().sort_values(ascending=False)
error_traffic.plot(kind='bar', ax=axes[1], color='#0D9488')
axes[1].set_title('Mean Absolute Error by Traffic Level')
axes[1].set_ylabel('Mean Abs Error (Hours)')
axes[1].tick_params(axis='x', rotation=45)

plt.tight_layout()
plt.savefig(os.path.join(out_dir, 'time_estimator_error_by_condition.png'), dpi=150)
plt.close('all')

# Plot 5
if shap is not None:
    try:
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(X_test[:200])
        plt.figure()
        shap.summary_plot(shap_values, pd.DataFrame(X_test[:200], columns=feature_cols), plot_type='bar', show=False)
        plt.tight_layout()
        plt.savefig(os.path.join(out_dir, 'time_estimator_shap_importance.png'), dpi=150)
        plt.close('all')
    except Exception as e:
        print(f"[SKIP] SHAP failed: {e}")
else:
    print("[SKIP] SHAP not installed")

print("\n=== STEP 9: SAVE MODEL ===")
model_path = os.path.join(out_dir, 'xgb_time_estimator.pkl')
with open(model_path, 'wb') as f:
    pickle.dump(model, f)

encoders_path = os.path.join(out_dir, 'label_encoders.pkl')
with open(encoders_path, 'wb') as f:
    pickle.dump(label_encoders, f)

cols_path = os.path.join(out_dir, 'feature_columns.txt')
with open(cols_path, 'w') as f:
    f.write('\n'.join(feature_cols))

print(f"Model size: {os.path.getsize(model_path)/1024:.1f} KB")
print(f"Encoders size: {os.path.getsize(encoders_path)/1024:.1f} KB")
print(f"Columns size: {os.path.getsize(cols_path)/1024:.1f} KB")

print("\n=== STEP 10: INFERENCE DEMO ===")
sample = {
    'stops_count': 4,
    'total_distance_km': 8.5,
    'time_estimated_h': 3.5,
    'hour_of_day': 9,
    'day_of_week': 6,
    'month': 10,
    'audio_plays': 3,
    'photos_taken': 5,
    'avg_time_available': 4.0,
    'visit_count': 2,
    'badges_earned': 3,
    'route_type': 'heritage',
    'weather_condition': 'sunny',
    'traffic_level': 'low',
    'group_type': 'solo',
    'budget_tier': 'mid',
    'tourist_type': 'domestic',
    'season': 'winter',
    'is_weekend': 1,
    'is_festival_season': 0,
    'history_layer_used': 1,
    'history_layer_on': 1
}

sample_df = pd.DataFrame([sample])
for col in cat_cols:
    if col in label_encoders:
        try:
            sample_df[col] = label_encoders[col].transform(sample_df[col].astype(str))
        except ValueError:
            sample_df[col] = 0

sample_X = sample_df[feature_cols].values
sample_pred = model.predict(sample_X)[0]

hours = int(sample_pred)
minutes = int((sample_pred - hours) * 60)
print(f"Predicted visit duration: {sample_pred:.2f} hours ({hours} hours {minutes} minutes)")

print("\n[OK] XGBoost Time Estimator complete. Model saved to outputs/time_estimator/")
