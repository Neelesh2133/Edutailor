import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.preprocessing import MinMaxScaler

# Load datasets
student_info = pd.read_csv("data/studentInfo.csv")
student_vle = pd.read_csv("data/studentVle.csv")
student_assessment = pd.read_csv("data/studentAssessment.csv")

# -----------------------------------
# HANDLE MISSING VALUES
# -----------------------------------

student_info = student_info.fillna({
    "imd_band": "Unknown",
    "gender": "Unknown"
})

# -----------------------------------
# REMOVE UNNECESSARY COLUMNS
# -----------------------------------

remove_cols = [
    "code_module",
    "code_presentation"
]

student_info = student_info.drop(
    columns=remove_cols,
    errors="ignore"
)

# -----------------------------------
# ENCODE CATEGORICAL COLUMNS
# -----------------------------------

categorical_cols = [
    "gender",
    "region",
    "highest_education",
    "imd_band",
    "age_band",
    "disability",
    "final_result"
]

encoder = LabelEncoder()

for col in categorical_cols:

    student_info[col] = encoder.fit_transform(
        student_info[col]
    )

# -----------------------------------
# NORMALIZE NUMERICAL FEATURES
# -----------------------------------

scaler = MinMaxScaler()

numerical_cols = [
    "num_of_prev_attempts",
    "studied_credits"
]

student_info[numerical_cols] = scaler.fit_transform(
    student_info[numerical_cols]
)

# -----------------------------------
# FEATURE ENGINEERING
# -----------------------------------

assessment_scores = student_assessment.groupby(
    "id_student"
)["score"].mean().reset_index()

assessment_scores.columns = [
    "id_student",
    "avg_score"
]

# Student engagement count
engagement = student_vle.groupby(
    "id_student"
)["sum_click"].sum().reset_index()

engagement.columns = [
    "id_student",
    "total_clicks"
]

# Merge engagement
processed = pd.merge(
    student_info,
    engagement,
    on="id_student",
    how="left"
)

processed["total_clicks"] = processed[
    "total_clicks"
].fillna(0)

# -----------------------------------
# ACTIVITY FREQUENCY FEATURE
# -----------------------------------

activity_frequency = student_vle.groupby(
    "id_student"
)["date"].nunique().reset_index()

activity_frequency.columns = [
    "id_student",
    "active_days"
]

processed = pd.merge(
    processed,
    activity_frequency,
    on="id_student",
    how="left"
)

processed["active_days"] = processed[
    "active_days"
].fillna(0)

# Merge assessment scores
processed = pd.merge(
    processed,
    assessment_scores,
    on="id_student",
    how="left"
)

processed["avg_score"] = processed[
    "avg_score"
].fillna(0)

# -----------------------------------
# SAVE PREPROCESSED DATA
# -----------------------------------

processed.to_csv(
    "data/preprocessed_students.csv",
    index=False
)

print("Preprocessing completed successfully")
