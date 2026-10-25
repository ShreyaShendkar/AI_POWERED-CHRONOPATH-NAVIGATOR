import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

import os
import warnings
warnings.filterwarnings('ignore')

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np
import pickle

from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold, GridSearchCV
from sklearn.metrics import classification_report, confusion_matrix, ConfusionMatrixDisplay, f1_score, accuracy_score

def main():
    # Set output directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    out_dir = os.path.join(script_dir, 'outputs', 'crowd_forecaster')
    os.makedirs(out_dir, exist_ok=True)

    # ==========================================
    # STEP 1 - LOAD DATA
    # ==========================================
    print("=== STEP 1 - LOAD DATA ===")
    data_path = os.path.join(script_dir, 'stops.csv')
    df = pd.read_csv(data_path)
    print(f"Loaded stops dataset shape: {df.shape}")

    # ==========================================
    # STEP 2 - FEATURE ENGINEERING & PREPARATION
    # ==========================================
    print("\n=== STEP 2 - FEATURES ===")
    target_col = 'crowd_label'

    num_cols = ['checkin_hour', 'day_of_week', 'month', 'entry_fee_inr', 'accessibility_score', 'total_checkins_ever', 'avg_rating_stop']
    bool_cols = ['is_weekend', 'is_festival_season', 'is_outdoor', 'has_english_signage']
    cat_cols = ['stop_type', 'weather_at_visit', 'season', 'tourist_type']

    # Convert boolean columns to int
    for col in bool_cols:
        df[col] = df[col].astype(int)

    # Cyclical feature engineering
    df['hour_sin'] = np.sin(2 * np.pi * df['checkin_hour'] / 24)
    df['hour_cos'] = np.cos(2 * np.pi * df['checkin_hour'] / 24)
    df['dow_sin']  = np.sin(2 * np.pi * df['day_of_week'] / 7)
    df['dow_cos']  = np.cos(2 * np.pi * df['day_of_week'] / 7)
    cyclical_cols = ['hour_sin', 'hour_cos', 'dow_sin', 'dow_cos']

    # Encode categorical features with LabelEncoder
    label_encoders = {}
    for col in cat_cols:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))
        label_encoders[col] = le

    # Encode target crowd_label
    le_target = LabelEncoder()
    df[target_col + '_encoded'] = le_target.fit_transform(df[target_col])
    label_encoders['crowd_label'] = le_target

    print("Class distribution:")
    print(df[target_col].value_counts())
    print("\nEncoded classes mapping:")
    for idx, class_name in enumerate(le_target.classes_):
        print(f"  {idx} -> {class_name}")

    feature_cols = num_cols + bool_cols + cat_cols + cyclical_cols
    print(f"\nTotal features ({len(feature_cols)}): {feature_cols}")

    # ==========================================
    # STEP 3 - TRAIN / TEST SPLIT
    # ==========================================
    print("\n=== STEP 3 - SPLIT ===")
    X = df[feature_cols].copy()
    y = df[target_col + '_encoded'].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"Train samples: {X_train.shape[0]}, Test samples: {X_test.shape[0]}")

    # ==========================================
    # STEP 4 - BASELINE
    # ==========================================
    print("\n=== STEP 4 - BASELINE ===")
    majority_class = pd.Series(y_train).mode()[0]
    baseline_acc = (y_test == majority_class).mean()
    majority_label = le_target.inverse_transform([majority_class])[0]
    print(f"Baseline (majority class '{majority_label}') Accuracy: {baseline_acc:.4f}")

    # ==========================================
    # STEP 5 - TRAIN RANDOM FOREST
    # ==========================================
    print("\n=== STEP 5 - TRAIN RF ===")
    rf = RandomForestClassifier(
        n_estimators=200,
        max_depth=12,
        min_samples_leaf=4,
        class_weight='balanced',
        random_state=42,
        n_jobs=-1
    )
    rf.fit(X_train, y_train)
    print("Training complete.")

    # ==========================================
    # STEP 6 - EVALUATION
    # ==========================================
    print("\n=== STEP 6 - EVALUATE ===")
    y_pred = rf.predict(X_test)
    print("Classification Report:")
    print(classification_report(y_test, y_pred, target_names=le_target.classes_))

    acc = accuracy_score(y_test, y_pred)
    macro_f1 = f1_score(y_test, y_pred, average='macro')
    weighted_f1 = f1_score(y_test, y_pred, average='weighted')
    print(f"Accuracy:    {acc:.4f}")
    print(f"Macro F1:    {macro_f1:.4f}")
    print(f"Weighted F1: {weighted_f1:.4f}")

    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(rf, X_train, y_train, cv=skf, scoring='f1_macro', n_jobs=-1)
    print(f"5-Fold Stratified CV Macro F1: {cv_scores.mean():.4f} +/- {cv_scores.std():.4f}")

    # ==========================================
    # STEP 7 - QUICK GRID SEARCH
    # ==========================================
    print("\n=== STEP 7 - QUICK GRID SEARCH ===")
    param_grid = {
        'n_estimators': [100, 200],
        'max_depth': [8, 12, None],
        'min_samples_leaf': [2, 4]
    }
    grid_search = GridSearchCV(
        estimator=RandomForestClassifier(class_weight='balanced', random_state=42, n_jobs=-1),
        param_grid=param_grid,
        cv=3,
        scoring='f1_macro',
        n_jobs=-1
    )
    grid_search.fit(X_train, y_train)
    print(f"Best params: {grid_search.best_params_}")
    print(f"Best CV score (Macro F1): {grid_search.best_score_:.4f}")

    best_model = grid_search.best_estimator_
    y_best_pred = best_model.predict(X_test)
    final_macro_f1 = f1_score(y_test, y_best_pred, average='macro')
    print(f"Final test Macro F1 (Retrained best model): {final_macro_f1:.4f}")

    # ==========================================
    # STEP 8 - VISUALIZATIONS
    # ==========================================
    print("\n=== STEP 8 - VISUALIZATIONS ===")

    # Plot 1: Confusion matrix
    fig, ax = plt.subplots(figsize=(6, 5))
    ConfusionMatrixDisplay.from_estimator(
        best_model,
        X_test,
        y_test,
        display_labels=le_target.classes_,
        cmap='Blues',
        ax=ax,
        values_format='d'
    )
    ax.set_title("Confusion Matrix - Crowd Forecaster")
    plt.tight_layout()
    plt.savefig(os.path.join(out_dir, 'crowd_confusion_matrix.png'), dpi=150)
    plt.close('all')
    print("Saved crowd_confusion_matrix.png")

    # Plot 2: Feature importance bar (top 15, top 5 colored '#0D9488', rest '#CBD5E1')
    importances = best_model.feature_importances_
    feat_df = pd.DataFrame({'feature': feature_cols, 'importance': importances})
    feat_df = feat_df.sort_values('importance', ascending=False).head(15)

    colors = ['#0D9488' if i < 5 else '#CBD5E1' for i in range(len(feat_df))]

    plt.figure(figsize=(9, 6))
    plt.barh(feat_df['feature'][::-1], feat_df['importance'][::-1], color=colors[::-1])
    plt.title("Top 15 Feature Importances - Crowd Forecaster")
    plt.xlabel("Importance Score")
    plt.ylabel("Feature")
    plt.tight_layout()
    plt.savefig(os.path.join(out_dir, 'crowd_feature_importance.png'), dpi=150)
    plt.close('all')
    print("Saved crowd_feature_importance.png")

    # Plot 3: Crowded % by hour - actual vs predicted line chart
    crowded_idx = list(le_target.classes_).index('crowded')
    test_eval = X_test.copy()
    test_eval['actual_crowded'] = (y_test == crowded_idx).astype(int)
    test_eval['pred_crowded'] = (y_best_pred == crowded_idx).astype(int)

    hourly_actual = test_eval.groupby('checkin_hour')['actual_crowded'].mean().reindex(range(24), fill_value=np.nan)
    hourly_pred = test_eval.groupby('checkin_hour')['pred_crowded'].mean().reindex(range(24), fill_value=np.nan)

    plt.figure(figsize=(10, 5))
    plt.plot(range(24), hourly_actual, marker='o', label='Actual Crowded %', color='#3B82F6', linewidth=2)
    plt.plot(range(24), hourly_pred, marker='s', linestyle='--', label='Predicted Crowded %', color='#EF4444', linewidth=2)
    plt.title("Crowded % by Hour: Actual vs Predicted")
    plt.xlabel("Hour of Day (0-23)")
    plt.ylabel("Crowded Proportion")
    plt.xticks(range(24))
    plt.grid(True, linestyle=':', alpha=0.6)
    plt.legend()
    plt.tight_layout()
    plt.savefig(os.path.join(out_dir, 'crowd_hourly_comparison.png'), dpi=150)
    plt.close('all')
    print("Saved crowd_hourly_comparison.png")

    # Plot 4: Class distribution bar chart (train vs test side-by-side)
    train_counts = pd.Series(y_train).value_counts().reindex(range(len(le_target.classes_)), fill_value=0)
    test_counts = pd.Series(y_test).value_counts().reindex(range(len(le_target.classes_)), fill_value=0)

    x_indices = np.arange(len(le_target.classes_))
    bar_width = 0.35

    plt.figure(figsize=(7, 5))
    plt.bar(x_indices - bar_width/2, train_counts, width=bar_width, label='Train', color='#3B82F6')
    plt.bar(x_indices + bar_width/2, test_counts, width=bar_width, label='Test', color='#10B981')
    plt.xticks(x_indices, le_target.classes_)
    plt.title("Class Distribution: Train vs Test")
    plt.xlabel("Crowd Class")
    plt.ylabel("Sample Count")
    plt.legend()
    plt.tight_layout()
    plt.savefig(os.path.join(out_dir, 'crowd_class_distribution.png'), dpi=150)
    plt.close('all')
    print("Saved crowd_class_distribution.png")

    # ==========================================
    # STEP 9 - VENUE CROWD SCHEDULE
    # ==========================================
    print("\n=== STEP 9 - VENUE CROWD SCHEDULE ===")
    # Identify top 5 stop_ids by total_checkins_ever
    top5_stops = df.groupby('stop_id')['total_checkins_ever'].max().nlargest(5).index.tolist()
    print(f"Top 5 stop_ids by total_checkins_ever: {top5_stops}")

    schedule_rows = []
    for sid in top5_stops:
        stop_data = df[df['stop_id'] == sid].iloc[0]
        stop_type_val = stop_data['stop_type']
        entry_fee_val = stop_data['entry_fee_inr']
        accessibility_val = stop_data['accessibility_score']
        checkins_ever_val = stop_data['total_checkins_ever']
        avg_rating_val = stop_data['avg_rating_stop']
        outdoor_val = int(stop_data['is_outdoor'])
        signage_val = int(stop_data['has_english_signage'])
        
        season_val = label_encoders['season'].transform(['winter'])[0] if 'winter' in label_encoders['season'].classes_ else stop_data['season']
        weather_val = label_encoders['weather_at_visit'].transform(['sunny'])[0] if 'sunny' in label_encoders['weather_at_visit'].classes_ else stop_data['weather_at_visit']
        tourist_val = label_encoders['tourist_type'].transform(['local'])[0] if 'local' in label_encoders['tourist_type'].classes_ else stop_data['tourist_type']
        month_val = 11

        for is_wknd in [0, 1]:
            # Wednesday (2) for weekday, Sunday (6) for weekend
            dow = 6 if is_wknd == 1 else 2
            dow_sin_val = np.sin(2 * np.pi * dow / 7)
            dow_cos_val = np.cos(2 * np.pi * dow / 7)

            for hr in range(7, 21): # hours 7 to 20 inclusive
                hr_sin_val = np.sin(2 * np.pi * hr / 24)
                hr_cos_val = np.cos(2 * np.pi * hr / 24)

                feat_vector = {
                    'checkin_hour': hr,
                    'day_of_week': dow,
                    'month': month_val,
                    'entry_fee_inr': entry_fee_val,
                    'accessibility_score': accessibility_val,
                    'total_checkins_ever': checkins_ever_val,
                    'avg_rating_stop': avg_rating_val,
                    'is_weekend': is_wknd,
                    'is_festival_season': 0,
                    'is_outdoor': outdoor_val,
                    'has_english_signage': signage_val,
                    'stop_type': stop_type_val,
                    'weather_at_visit': weather_val,
                    'season': season_val,
                    'tourist_type': tourist_val,
                    'hour_sin': hr_sin_val,
                    'hour_cos': hr_cos_val,
                    'dow_sin': dow_sin_val,
                    'dow_cos': dow_cos_val
                }
                X_row = pd.DataFrame([feat_vector])[feature_cols]
                pred_enc = int(best_model.predict(X_row)[0])
                pred_label = le_target.inverse_transform([pred_enc])[0]

                schedule_rows.append({
                    'stop_id': sid,
                    'hour': hr,
                    'is_weekend': is_wknd,
                    'predicted_crowd_encoded': pred_enc,
                    'predicted_crowd_label': pred_label
                })

    schedule_df = pd.DataFrame(schedule_rows)
    schedule_path = os.path.join(out_dir, 'venue_crowd_schedule.csv')
    schedule_df.to_csv(schedule_path, index=False)
    print(f"Saved venue crowd schedule to {schedule_path}")
    print("First 20 rows of schedule:")
    print(schedule_df.head(20).to_string(index=False))

    # ==========================================
    # STEP 10 - SAVE ARTIFACTS & MODELS
    # ==========================================
    print("\n=== STEP 10 - SAVE ===")
    model_path = os.path.join(out_dir, 'rf_crowd_forecaster.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump(best_model, f)

    encoders_path = os.path.join(out_dir, 'crowd_label_encoders.pkl')
    with open(encoders_path, 'wb') as f:
        pickle.dump(label_encoders, f)

    features_path = os.path.join(out_dir, 'crowd_feature_columns.txt')
    with open(features_path, 'w') as f:
        for col in feature_cols:
            f.write(f"{col}\n")

    print(f"Model saved: {model_path} ({os.path.getsize(model_path)} bytes)")
    print(f"Encoders saved: {encoders_path} ({os.path.getsize(encoders_path)} bytes)")
    print(f"Features saved: {features_path} ({os.path.getsize(features_path)} bytes)")

    # ==========================================
    # STEP 11 - INFERENCE DEMO
    # ==========================================
    print("\n=== STEP 11 - INFERENCE DEMO ===")
    demo_stop_type = label_encoders['stop_type'].transform(['temple'])[0]
    demo_weather = label_encoders['weather_at_visit'].transform(['sunny'])[0]
    demo_season = label_encoders['season'].transform(['winter'])[0]
    demo_tourist = label_encoders['tourist_type'].transform(['local'])[0]

    demo_sample = {
        'checkin_hour': 11,
        'day_of_week': 6,  # Sunday
        'month': 11,
        'entry_fee_inr': 0,
        'accessibility_score': 3,
        'total_checkins_ever': 2500,
        'avg_rating_stop': 4.2,
        'is_weekend': 1,
        'is_festival_season': 0,
        'is_outdoor': 0,
        'has_english_signage': 1,
        'stop_type': demo_stop_type,
        'weather_at_visit': demo_weather,
        'season': demo_season,
        'tourist_type': demo_tourist,
        'hour_sin': np.sin(2 * np.pi * 11 / 24),
        'hour_cos': np.cos(2 * np.pi * 11 / 24),
        'dow_sin': np.sin(2 * np.pi * 6 / 7),
        'dow_cos': np.cos(2 * np.pi * 6 / 7)
    }
    X_demo = pd.DataFrame([demo_sample])[feature_cols]
    demo_pred_enc = best_model.predict(X_demo)[0]
    demo_pred_label = le_target.inverse_transform([demo_pred_enc])[0]
    demo_proba = best_model.predict_proba(X_demo)[0]
    confidence = demo_proba[demo_pred_enc] * 100

    print(f"Predicted crowd (Sunday 11AM temple, sunny): {demo_pred_label} (confidence: {confidence:.1f}%)")

    print("\n[OK] Crowd Forecaster complete. Model saved to outputs/crowd_forecaster/")

if __name__ == '__main__':
    main()
