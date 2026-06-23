import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os

# Load processed data
df = pd.read_csv("data/preprocessed_students.csv")

# Select relevant features including the target
features = [
    "studied_credits",
    "num_of_prev_attempts",
    "total_clicks",
    "avg_score",
    "active_days",
    "final_result"
]

df_features = df[features].dropna()

# Compute correlation matrix
corr_matrix = df_features.corr()

# Set up the matplotlib figure
plt.figure(figsize=(10, 8))

# Draw the heatmap
sns.heatmap(
    corr_matrix, 
    annot=True, 
    fmt=".2f", 
    cmap="coolwarm", 
    square=True, 
    linewidths=.5,
    cbar_kws={"shrink": .8}
)

plt.title("Feature Correlation Heatmap", pad=20, fontsize=14)
plt.xticks(rotation=45, ha='right')
plt.yticks(rotation=0)
plt.tight_layout()

# Save the plot
output_path = os.path.join(os.path.dirname(__file__), "feature_heatmap.png")
plt.savefig(output_path)
print(f"Heatmap saved as {output_path}")
