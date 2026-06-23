import joblib
import pandas as pd
import sys
import os

# Add current dir to path to import FEATURE_COLS
sys.path.append(os.path.dirname(__file__))
from feature_engineering import FEATURE_COLS

def test_prediction():
    model_path = "models/student_outcome_model.pkl"
    if not os.path.exists(model_path):
        print(f"Error: Model not found at {model_path}")
        return

    model = joblib.load(model_path)
    
    # Test Case 1: ULTRA HIGH PERFORMER (Maximum Signals)
    test_data = {
        "avg_score": 98.0,
        "num_assessments": 10,
        "pass_rate": 1.0,
        "on_time_rate": 1.0,
        "total_clicks": 8000,
        "active_days": 150,
        "activity_span_days": 250,
        "num_distinctions": 5,
        "edu_level_ordinal": 4, # Post Graduate
        "imd_band_numeric": 9, # Least deprived
        "registration_lag": 100, # Registered 100 days early
        "unregistration_flag": 0,
        "early_withdrawal": 0
    }
    
    input_dict = {col: 0 for col in model.feature_names_in_}
    for k, v in test_data.items():
        if k in input_dict:
            input_dict[k] = v
    
    prediction_input = pd.DataFrame([input_dict])[list(model.feature_names_in_)]
    
    prediction = model.predict(prediction_input)
    proba = model.predict_proba(prediction_input)
    
    print("=" * 40)
    print("TEST CASE 1 — ULTRA HIGH PERFORMER")
    print("=" * 40)
    print(f"Prediction: {prediction[0]}")
    print(f"Probabilities: {proba[0]}")
    
    result = "Needs Learning Support" if prediction[0] == 0 else "Career Ready Learner"
    print(f"Final Outcome: {result}")

if __name__ == "__main__":
    test_prediction()
