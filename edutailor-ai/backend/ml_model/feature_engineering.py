"""
feature_engineering.py - Advanced OULAD Feature Engineering
Senior Dev Note: This is where 70% → 85%+ accuracy is won.
OULAD has rich temporal and behavioral data — use ALL of it.
"""

import pandas as pd
import numpy as np
import os
from sklearn.preprocessing import LabelEncoder
import warnings
warnings.filterwarnings('ignore')


def load_oulad_data(data_dir='data/'):
    """Load all OULAD CSV files."""
    print("[1/6] Loading OULAD datasets...")
    
    studentInfo     = pd.read_csv(f'{data_dir}studentInfo.csv')
    studentVle      = pd.read_csv(f'{data_dir}studentVle.csv')
    studentAssess   = pd.read_csv(f'{data_dir}studentAssessment.csv')
    assessments     = pd.read_csv(f'{data_dir}assessments.csv')
    courses         = pd.read_csv(f'{data_dir}courses.csv')
    studentReg      = pd.read_csv(f'{data_dir}studentRegistration.csv')
    vle             = pd.read_csv(f'{data_dir}vle.csv')
    
    return studentInfo, studentVle, studentAssess, assessments, courses, studentReg, vle


def engineer_vle_features(studentVle):
    """
    VLE (Virtual Learning Environment) interaction features.
    These are the strongest predictors of dropout in OULAD research.
    """
    print("[2/6] Engineering VLE interaction features...")
    
    vle_agg = studentVle.groupby(['id_student', 'code_module', 'code_presentation']).agg(
        total_clicks        = ('sum_click', 'sum'),
        avg_clicks_per_day  = ('sum_click', 'mean'),
        active_days         = ('date', 'nunique'),
        max_clicks_day      = ('sum_click', 'max'),
        std_clicks          = ('sum_click', 'std'),
        total_interactions  = ('sum_click', 'count'),
        first_activity_day  = ('date', 'min'),
        last_activity_day   = ('date', 'max'),
    ).reset_index()
    
    # Derived temporal features
    vle_agg['activity_span_days']   = vle_agg['last_activity_day'] - vle_agg['first_activity_day']
    vle_agg['engagement_rate']      = vle_agg['active_days'] / (vle_agg['activity_span_days'] + 1)
    vle_agg['clicks_per_active_day']= vle_agg['total_clicks'] / (vle_agg['active_days'] + 1)
    vle_agg['std_clicks']           = vle_agg['std_clicks'].fillna(0)
    
    # Early engagement: activity in first 30 days (critical predictor)
    early = studentVle[studentVle['date'] <= 30].groupby(
        ['id_student', 'code_module', 'code_presentation']
    )['sum_click'].sum().reset_index()
    early.columns = ['id_student', 'code_module', 'code_presentation', 'early_clicks_30d']
    
    # Mid engagement: days 31-90
    mid = studentVle[(studentVle['date'] > 30) & (studentVle['date'] <= 90)].groupby(
        ['id_student', 'code_module', 'code_presentation']
    )['sum_click'].sum().reset_index()
    mid.columns = ['id_student', 'code_module', 'code_presentation', 'mid_clicks_31_90d']
    
    vle_agg = vle_agg.merge(early, on=['id_student', 'code_module', 'code_presentation'], how='left')
    vle_agg = vle_agg.merge(mid,   on=['id_student', 'code_module', 'code_presentation'], how='left')
    vle_agg[['early_clicks_30d', 'mid_clicks_31_90d']] = \
        vle_agg[['early_clicks_30d', 'mid_clicks_31_90d']].fillna(0)
    
    return vle_agg


def engineer_assessment_features(studentAssess, assessments):
    """
    Assessment performance features.
    Weighted scores, submission patterns, and trend analysis.
    """
    print("[3/6] Engineering assessment features...")
    
    # Merge to get assessment weights and types
    sa = studentAssess.merge(
        assessments[['id_assessment', 'code_module', 'code_presentation', 'assessment_type', 'weight', 'date']],
        on='id_assessment', how='left'
    )
    
    # Submission behavior
    sa['submitted_on_time'] = (sa['date_submitted'] <= sa['date']).astype(int)
    sa['days_early']        = sa['date'] - sa['date_submitted']  # positive = early
    
    # Weighted score: TMA/CMA carry different weight than Exam
    sa['weighted_score'] = sa['score'] * sa['weight'] / 100
    
    # Per-student-module aggregation
    assess_agg = sa.groupby(['id_student', 'code_module', 'code_presentation']).agg(
        avg_score           = ('score', 'mean'),
        std_score           = ('score', 'std'),
        min_score           = ('score', 'min'),
        max_score           = ('score', 'max'),
        total_weighted_score= ('weighted_score', 'sum'),
        num_assessments     = ('id_assessment', 'count'),
        on_time_rate        = ('submitted_on_time', 'mean'),
        avg_days_early      = ('days_early', 'mean'),
        num_passed          = ('score', lambda x: (x >= 40).sum()),   # pass mark = 40
        num_distinctions    = ('score', lambda x: (x >= 85).sum()),
    ).reset_index()
    
    assess_agg['pass_rate']         = assess_agg['num_passed'] / assess_agg['num_assessments']
    assess_agg['std_score']         = assess_agg['std_score'].fillna(0)
    assess_agg['consistency_score'] = 1 / (assess_agg['std_score'] + 1)  # high = consistent
    
    # Score TREND: early vs late assessments
    sa_sorted = sa.sort_values('date')
    early_scores = sa_sorted.groupby(
        ['id_student', 'code_module', 'code_presentation']
    ).apply(lambda x: x.head(max(1, len(x)//2))['score'].mean()).reset_index()
    early_scores.columns = ['id_student', 'code_module', 'code_presentation', 'early_avg_score']
    
    late_scores = sa_sorted.groupby(
        ['id_student', 'code_module', 'code_presentation']
    ).apply(lambda x: x.tail(max(1, len(x)//2))['score'].mean()).reset_index()
    late_scores.columns = ['id_student', 'code_module', 'code_presentation', 'late_avg_score']
    
    assess_agg = assess_agg.merge(early_scores, on=['id_student', 'code_module', 'code_presentation'], how='left')
    assess_agg = assess_agg.merge(late_scores,  on=['id_student', 'code_module', 'code_presentation'], how='left')
    assess_agg['score_trend'] = assess_agg['late_avg_score'] - assess_agg['early_avg_score']
    
    return assess_agg


def engineer_registration_features(studentReg, courses):
    """Registration timing and withdrawal flags."""
    print("[4/6] Engineering registration features...")
    
    reg = studentReg.merge(courses, on=['code_module', 'code_presentation'], how='left')
    
    reg['registered_late']      = (reg['date_registration'] > 0).astype(int)
    reg['registration_lag']     = reg['date_registration'].fillna(0)
    reg['unregistration_flag']  = reg['date_unregistration'].notna().astype(int)
    # Days until unregistration (if they withdrew)
    reg['days_until_unreg']     = reg['date_unregistration'].fillna(reg['module_presentation_length'])
    reg['early_withdrawal']     = (reg['date_unregistration'] < 100).fillna(False).astype(int)
    
    return reg[['id_student', 'code_module', 'code_presentation',
                'registered_late', 'registration_lag',
                'unregistration_flag', 'days_until_unreg', 'early_withdrawal']]


def engineer_demographic_features(studentInfo):
    """
    Encode demographic features properly.
    Key insight: ordinal encoding for education levels matters.
    """
    print("[5/6] Engineering demographic features...")
    
    df = studentInfo.copy()
    
    # Binary target: Pass/Distinction = 1, Fail/Withdrawn = 0
    df['target'] = df['final_result'].map({
        'Pass': 1, 'Distinction': 1,
        'Fail': 0, 'Withdrawn': 0
    })
    
    # Ordinal education level (research shows this has high predictive power)
    edu_order = {
        'No Formal quals': 0,
        'Lower Than A Level': 1,
        'A Level or Equivalent': 2,
        'HE Qualification': 3,
        'Post Graduate Qualification': 4
    }
    df['edu_level_ordinal'] = df['highest_education'].map(edu_order).fillna(2)
    
    # Age band ordinal
    age_order = {'0-35': 0, '35-55': 1, '55<=': 2}
    df['age_band_ordinal'] = df['age_band'].map(age_order).fillna(0)
    
    # IMD (deprivation) — lower = more deprived
    df['imd_band_numeric'] = df['imd_band'].str.extract(r'(\d+)').astype(float).iloc[:, 0].fillna(5)
    
    # Previous attempts (strong predictor)
    df['num_prev_attempts'] = df['num_of_prev_attempts'].fillna(0)
    df['is_repeat_student'] = (df['num_prev_attempts'] > 0).astype(int)
    
    # Disability flag
    df['has_disability'] = (df['disability'] == 'Y').astype(int)
    
    # Gender
    df['is_female'] = (df['gender'] == 'F').astype(int)
    
    # Region encoding
    le = LabelEncoder()
    df['region_encoded'] = le.fit_transform(df['region'].fillna('Unknown'))
    
    # Module encoding
    df['module_encoded'] = le.fit_transform(df['code_module'])
    df['presentation_encoded'] = le.fit_transform(df['code_presentation'])
    
    # Credit load
    df['studied_credits'] = df['studied_credits'].fillna(df['studied_credits'].median())
    df['high_credit_load'] = (df['studied_credits'] > 60).astype(int)
    
    return df


def build_master_dataset(data_dir='data/'):
    """
    Full pipeline: load → engineer → merge → return clean feature matrix.
    """
    studentInfo, studentVle, studentAssess, assessments, courses, studentReg, vle = \
        load_oulad_data(data_dir)
    
    vle_features    = engineer_vle_features(studentVle)
    assess_features = engineer_assessment_features(studentAssess, assessments)
    reg_features    = engineer_registration_features(studentReg, courses)
    demo_features   = engineer_demographic_features(studentInfo)
    
    print("[6/6] Merging all feature sets...")
    
    master = demo_features.merge(
        vle_features,    on=['id_student', 'code_module', 'code_presentation'], how='left'
    ).merge(
        assess_features, on=['id_student', 'code_module', 'code_presentation'], how='left'
    ).merge(
        reg_features,    on=['id_student', 'code_module', 'code_presentation'], how='left'
    )
    
    # Fill NaN for students with no VLE/assessment data (they never logged in = bad signal)
    vle_cols = ['total_clicks', 'avg_clicks_per_day', 'active_days', 'early_clicks_30d',
                'mid_clicks_31_90d', 'engagement_rate', 'clicks_per_active_day']
    master[vle_cols] = master[vle_cols].fillna(0)
    
    assess_cols = ['avg_score', 'total_weighted_score', 'num_assessments',
                   'on_time_rate', 'pass_rate', 'score_trend']
    master[assess_cols] = master[assess_cols].fillna(0)
    
    print(f"\n✅ Master dataset: {master.shape[0]} rows × {master.shape[1]} columns")
    print(f"   Target distribution:\n{master['target'].value_counts(normalize=True).round(3)}")
    
    return master


FEATURE_COLS = [
    # Demographic
    'edu_level_ordinal', 'age_band_ordinal', 'imd_band_numeric',
    'num_prev_attempts', 'is_repeat_student', 'has_disability',
    'is_female', 'region_encoded', 'studied_credits', 'high_credit_load',
    'module_encoded', 'presentation_encoded',
    
    # VLE Engagement
    'total_clicks', 'avg_clicks_per_day', 'active_days', 'max_clicks_day',
    'std_clicks', 'total_interactions', 'activity_span_days',
    'engagement_rate', 'clicks_per_active_day',
    'early_clicks_30d', 'mid_clicks_31_90d',
    
    # Assessment Performance
    'avg_score', 'std_score', 'min_score', 'max_score',
    'num_assessments', 'on_time_rate',
    'avg_days_early', 'pass_rate', 'consistency_score',
    'score_trend', 'num_distinctions',
    
    # Registration
    'registered_late', 'registration_lag',
    'unregistration_flag', 'days_until_unreg', 'early_withdrawal',
]

TARGET_COL = 'target'

if __name__ == "__main__":
    # Create output directory if it doesn't exist
    os.makedirs('data', exist_ok=True)
    
    # Run the full pipeline
    master_df = build_master_dataset(data_dir='data/')
    
    # Save the processed dataset
    output_path = 'data/preprocessed_students.csv'
    master_df.to_csv(output_path, index=False)
    
    print(f"\n✨ Feature Engineering Complete!")
    print(f"📁 Processed data saved to: {output_path}")
    print(f"📊 Final columns ({len(master_df.columns)}): {list(master_df.columns)[:5]} ...")
