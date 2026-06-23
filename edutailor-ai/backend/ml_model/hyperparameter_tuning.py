"""
hyperparameter_tuning.py - Bayesian Optimization with Optuna
Run this AFTER train_model.py gives you a baseline.
Will squeeze out another 1-3% accuracy.

Install: pip install optuna lightgbm
"""

import optuna
import numpy as np
import lightgbm as lgb
import xgboost as xgb
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.metrics import roc_auc_score
import warnings
warnings.filterwarnings('ignore')
optuna.logging.set_verbosity(optuna.logging.WARNING)

from feature_engineering import build_master_dataset, FEATURE_COLS, TARGET_COL
from imblearn.over_sampling import SMOTE
import pandas as pd


def load_data(data_dir='data/'):
    master = build_master_dataset(data_dir)
    available = [c for c in FEATURE_COLS if c in master.columns]
    X = master[available].fillna(master[available].median())
    y = master[TARGET_COL].dropna()
    X = X.loc[y.index]
    return X, y


def tune_xgboost(X, y, n_trials=100):
    """Bayesian search over XGBoost hyperparameters."""
    
    def objective(trial):
        params = {
            'n_estimators':         trial.suggest_int('n_estimators', 200, 800),
            'max_depth':            trial.suggest_int('max_depth', 3, 7),
            'learning_rate':        trial.suggest_float('learning_rate', 0.01, 0.1, log=True),
            'subsample':            trial.suggest_float('subsample', 0.6, 1.0),
            'colsample_bytree':     trial.suggest_float('colsample_bytree', 0.5, 1.0),
            'min_child_weight':     trial.suggest_int('min_child_weight', 1, 20),
            'reg_alpha':            trial.suggest_float('reg_alpha', 1e-8, 10.0, log=True),
            'reg_lambda':           trial.suggest_float('reg_lambda', 1e-8, 10.0, log=True),
            'gamma':                trial.suggest_float('gamma', 0, 5),
            'scale_pos_weight':     trial.suggest_float('scale_pos_weight', 1.0, 3.0),
            'use_label_encoder':    False,
            'eval_metric':          'logloss',
            'random_state':         42,
            'n_jobs':               -1,
        }
        
        model = xgb.XGBClassifier(**params)
        
        skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        scores = cross_val_score(model, X, y, cv=skf, scoring='roc_auc', n_jobs=-1)
        return scores.mean()
    
    study = optuna.create_study(direction='maximize', study_name='xgboost_tuning')
    study.optimize(objective, n_trials=n_trials, show_progress_bar=True)
    
    print(f"\n🏆 Best XGBoost AUC: {study.best_value:.4f}")
    print(f"   Best params: {study.best_params}")
    return study.best_params


def tune_lightgbm(X, y, n_trials=100):
    """Bayesian search over LightGBM hyperparameters."""
    
    def objective(trial):
        params = {
            'n_estimators':         trial.suggest_int('n_estimators', 200, 800),
            'max_depth':            trial.suggest_int('max_depth', 3, 8),
            'num_leaves':           trial.suggest_int('num_leaves', 20, 100),
            'learning_rate':        trial.suggest_float('learning_rate', 0.01, 0.1, log=True),
            'subsample':            trial.suggest_float('subsample', 0.6, 1.0),
            'colsample_bytree':     trial.suggest_float('colsample_bytree', 0.5, 1.0),
            'min_child_samples':    trial.suggest_int('min_child_samples', 5, 50),
            'reg_alpha':            trial.suggest_float('reg_alpha', 1e-8, 10.0, log=True),
            'reg_lambda':           trial.suggest_float('reg_lambda', 1e-8, 10.0, log=True),
            'class_weight':         'balanced',
            'random_state':         42,
            'n_jobs':               -1,
            'verbose':              -1,
        }
        
        model = lgb.LGBMClassifier(**params)
        skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        scores = cross_val_score(model, X, y, cv=skf, scoring='roc_auc', n_jobs=-1)
        return scores.mean()
    
    study = optuna.create_study(direction='maximize', study_name='lgbm_tuning')
    study.optimize(objective, n_trials=n_trials, show_progress_bar=True)
    
    print(f"\n🏆 Best LightGBM AUC: {study.best_value:.4f}")
    print(f"   Best params: {study.best_params}")
    return study.best_params


if __name__ == '__main__':
    print("🔬 Loading data for hyperparameter tuning...")
    X, y = load_data('data/')
    
    print("\n⚡ Tuning XGBoost (100 trials)...")
    best_xgb_params = tune_xgboost(X, y, n_trials=100)
    
    print("\n⚡ Tuning LightGBM (100 trials)...")
    best_lgbm_params = tune_lightgbm(X, y, n_trials=100)
    
    print("\n✅ Copy these params into train_model.py get_xgboost() and get_lightgbm()")
    print("\nXGBoost best params:")
    print(best_xgb_params)
    print("\nLightGBM best params:")
    print(best_lgbm_params)
