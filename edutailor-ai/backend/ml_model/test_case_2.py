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
    
    # Test Case 2: LOW PERFORMER (Strong Failure Signals)
    test_data = {
        "avg_score": 40.0,
        "num_assessments": 2,
        "pass_rate": 0.0,
        "activity_span_days": 10.0,
        "active_days": 3,
        "total_clicks": 80,
        "unregistration_flag": 1,
        "early_withdrawal": 1
    }
    
    input_dict = {col: 0 for col in model.feature_names_in_}
    for k, v in test_data.items():
        if k in input_dict:
            input_dict[k] = v
    
    prediction_input = pd.DataFrame([input_dict])[list(model.feature_names_in_)]
    
    prediction = model.predict(prediction_input)
    proba = model.predict_proba(prediction_input)
    
    print("=" * 40)
    print("TEST CASE 2 — LOW PERFORMER (Updated)")
    print("=" * 40)
    print(f"Prediction: {prediction[0]}")
    print(f"Probabilities: {proba[0]}")
    
    result = "Needs Learning Support" if prediction[0] == 0 else "Career Ready Learner"
    print(f"Final Outcome: {result}")

if __name__ == "__main__":
    test_prediction()
