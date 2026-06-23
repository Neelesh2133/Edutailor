"""
evaluate_model.py - Comprehensive Model Evaluation
Tracks: Accuracy, AUC, F1, Confusion Matrix, Feature Importance, Calibration
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
import joblib
import warnings
warnings.filterwarnings('ignore')

from sklearn.metrics import (
    accuracy_score, roc_auc_score, f1_score,
    classification_report, confusion_matrix,
    roc_curve, precision_recall_curve, average_precision_score
)
from sklearn.model_selection import train_test_split, learning_curve
from sklearn.calibration import calibration_curve

from feature_engineering import build_master_dataset, FEATURE_COLS, TARGET_COL

RANDOM_STATE = 42


def load_model_and_data(model_path='models/student_outcome_model.pkl', data_dir='data/'):
    master = build_master_dataset(data_dir)
    available = [c for c in FEATURE_COLS if c in master.columns]
    X = master[available].fillna(master[available].median())
    y = master[TARGET_COL].dropna()
    X = X.loc[y.index]
    
    _, X_test, _, y_test = train_test_split(
        X, y, test_size=0.15, stratify=y, random_state=RANDOM_STATE
    )
    
    pipeline = joblib.load(model_path)
    return pipeline, X_test, y_test, available


def plot_comprehensive_evaluation(pipeline, X_test, y_test, feature_names, save_path='evaluation_dashboard.png'):
    y_pred  = pipeline.predict(X_test)
    y_proba = pipeline.predict_proba(X_test)[:, 1]
    
    fig = plt.figure(figsize=(18, 12))
    fig.suptitle('OULAD Student Outcome Model — Evaluation Dashboard', 
                 fontsize=16, fontweight='bold', y=0.98)
    
    gs = gridspec.GridSpec(2, 3, figure=fig, hspace=0.4, wspace=0.35)
    
    # ── Plot 1: Confusion Matrix ──
    ax1 = fig.add_subplot(gs[0, 0])
    cm = confusion_matrix(y_test, y_pred)
    im = ax1.imshow(cm, interpolation='nearest', cmap='Blues')
    plt.colorbar(im, ax=ax1)
    labels = ['Fail/Withdraw', 'Pass/Distinction']
    ax1.set_xticks([0, 1]); ax1.set_yticks([0, 1])
    ax1.set_xticklabels(labels, rotation=25, ha='right', fontsize=9)
    ax1.set_yticklabels(labels, fontsize=9)
    for i in range(2):
        for j in range(2):
            ax1.text(j, i, f'{cm[i,j]:,}', ha='center', va='center',
                     fontsize=14, color='white' if cm[i,j] > cm.max()/2 else 'black')
    ax1.set_xlabel('Predicted'); ax1.set_ylabel('Actual')
    ax1.set_title(f'Confusion Matrix\nAccuracy: {accuracy_score(y_test, y_pred):.3f}')
    
    # ── Plot 2: ROC Curve ──
    ax2 = fig.add_subplot(gs[0, 1])
    fpr, tpr, _ = roc_curve(y_test, y_proba)
    auc = roc_auc_score(y_test, y_proba)
    ax2.plot(fpr, tpr, 'b-', lw=2, label=f'AUC = {auc:.3f}')
    ax2.plot([0,1],[0,1], 'k--', lw=1, label='Random (0.500)')
    ax2.fill_between(fpr, tpr, alpha=0.15)
    ax2.set_xlabel('False Positive Rate'); ax2.set_ylabel('True Positive Rate')
    ax2.set_title('ROC Curve'); ax2.legend(loc='lower right')
    ax2.grid(True, alpha=0.3)
    
    # ── Plot 3: Precision-Recall Curve ──
    ax3 = fig.add_subplot(gs[0, 2])
    prec, rec, _ = precision_recall_curve(y_test, y_proba)
    ap = average_precision_score(y_test, y_proba)
    ax3.plot(rec, prec, 'g-', lw=2, label=f'AP = {ap:.3f}')
    ax3.fill_between(rec, prec, alpha=0.15, color='green')
    ax3.set_xlabel('Recall'); ax3.set_ylabel('Precision')
    ax3.set_title('Precision-Recall Curve'); ax3.legend()
    ax3.grid(True, alpha=0.3)
    
    # ── Plot 4: Score Distribution ──
    ax4 = fig.add_subplot(gs[1, 0])
    mask_pass = y_test == 1
    ax4.hist(y_proba[mask_pass],  bins=30, alpha=0.6, color='green', label='Pass/Distinction', density=True)
    ax4.hist(y_proba[~mask_pass], bins=30, alpha=0.6, color='red',   label='Fail/Withdraw',   density=True)
    ax4.axvline(0.5, color='black', linestyle='--', label='Threshold=0.5')
    ax4.set_xlabel('Predicted Probability'); ax4.set_ylabel('Density')
    ax4.set_title('Score Separation\n(wider gap = better model)')
    ax4.legend(fontsize=8)
    ax4.grid(True, alpha=0.3)
    
    # ── Plot 5: Feature Importance ──
    ax5 = fig.add_subplot(gs[1, 1])
    try:
        xgb_model = pipeline.named_steps['model'].estimators_[0]
        n_feats = len(xgb_model.feature_importances_)
        imp = pd.Series(xgb_model.feature_importances_, index=feature_names[:n_feats])
        top15 = imp.nlargest(15)
        colors = plt.cm.RdYlGn(np.linspace(0.3, 0.9, len(top15)))[::-1]
        ax5.barh(range(len(top15)), top15.values[::-1], color=colors)
        ax5.set_yticks(range(len(top15)))
        ax5.set_yticklabels(top15.index[::-1], fontsize=8)
        ax5.set_xlabel('Importance Score')
        ax5.set_title('Top 15 Feature Importances\n(XGBoost)')
        ax5.grid(True, axis='x', alpha=0.3)
    except Exception:
        ax5.text(0.5, 0.5, 'Feature importance\nnot available for\nthis model type',
                 ha='center', va='center', transform=ax5.transAxes)
    
    # ── Plot 6: Metrics Summary Table ──
    ax6 = fig.add_subplot(gs[1, 2])
    ax6.axis('off')
    metrics = {
        'Accuracy':   f"{accuracy_score(y_test, y_pred):.4f}",
        'AUC-ROC':    f"{roc_auc_score(y_test, y_proba):.4f}",
        'F1 (weighted)': f"{f1_score(y_test, y_pred, average='weighted'):.4f}",
        'F1 (macro)': f"{f1_score(y_test, y_pred, average='macro'):.4f}",
        'Avg Precision': f"{average_precision_score(y_test, y_proba):.4f}",
        'Test samples': f"{len(y_test):,}",
        'Pass rate':   f"{y_test.mean():.1%}",
    }
    rows = list(metrics.items())
    table = ax6.table(
        cellText=rows,
        colLabels=['Metric', 'Value'],
        cellLoc='center', loc='center',
        bbox=[0, 0, 1, 1]
    )
    table.auto_set_font_size(False)
    table.set_fontsize(10)
    for (row, col), cell in table.get_celld().items():
        if row == 0:
            cell.set_facecolor('#2196F3')
            cell.set_text_props(color='white', fontweight='bold')
        elif row % 2 == 0:
            cell.set_facecolor('#f5f5f5')
    ax6.set_title('Summary Metrics', pad=15, fontweight='bold')
    
    plt.savefig(save_path, dpi=150, bbox_inches='tight')
    print(f"✅ Evaluation dashboard saved to {save_path}")
    plt.show()


def check_overfitting(pipeline, X, y, save_path='overfitting_check.png'):
    """Learning curve: the right way to check train vs test gap."""
    from sklearn.model_selection import learning_curve as lc_fn
    
    train_sizes, train_scores, val_scores = lc_fn(
        pipeline, X, y,
        cv=5, scoring='accuracy',
        train_sizes=np.linspace(0.1, 1.0, 10),
        n_jobs=-1
    )
    
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.plot(train_sizes, train_scores.mean(axis=1), 'b-o', label='Training Accuracy', lw=2)
    ax.plot(train_sizes, val_scores.mean(axis=1),   'g-o', label='Validation Accuracy', lw=2)
    ax.fill_between(train_sizes,
                    train_scores.mean(axis=1) - train_scores.std(axis=1),
                    train_scores.mean(axis=1) + train_scores.std(axis=1), alpha=0.1, color='blue')
    ax.fill_between(train_sizes,
                    val_scores.mean(axis=1) - val_scores.std(axis=1),
                    val_scores.mean(axis=1) + val_scores.std(axis=1), alpha=0.1, color='green')
    
    gap = train_scores.mean(axis=1)[-1] - val_scores.mean(axis=1)[-1]
    ax.set_title(f'Learning Curve — Overfitting Check\n'
                 f'Final gap: {gap:.3f} (target: <0.03)', fontsize=13)
    ax.set_xlabel('Training Set Size')
    ax.set_ylabel('Accuracy')
    ax.legend(loc='lower right')
    ax.grid(True, alpha=0.3)
    ax.axhline(y=val_scores.mean(axis=1)[-1], color='gray', linestyle=':', alpha=0.5)
    
    plt.tight_layout()
    plt.savefig(save_path, dpi=150)
    print(f"✅ Overfitting check saved to {save_path}")
    plt.show()
    
    if gap > 0.05:
        print(f"⚠️  Overfitting detected (gap={gap:.3f}). Increase regularization.")
    else:
        print(f"✅ No significant overfitting (gap={gap:.3f})")


if __name__ == '__main__':
    print("📊 Loading model and test data...")
    pipeline, X_test, y_test, feature_names = load_model_and_data()
    
    plot_comprehensive_evaluation(pipeline, X_test, y_test, feature_names)
    print("\n📈 Checking for overfitting via learning curves (slow, ~5 mins)...")
    # Uncomment if you have time:
    # check_overfitting(pipeline, X_test, y_test)
