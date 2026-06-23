# EduTailor AI: Machine Learning Prediction Workflow

The Machine Learning (ML) component of EduTailor AI serves as the **Strategic Decision Maker**. Its role is to analyze student behavior and demographic data to predict academic outcomes, which then dictates the structural complexity and pacing of the generated learning roadmap.

---

## 🏗️ Model Architecture: Stacking Ensemble
The project utilizes a **Production-Grade Stacking Ensemble Classifier**. This multi-layered approach ensures higher accuracy and robustness than any single model.

### 1. Base Learners (Level 0)
- **XGBoost**: Gradient boosted decision trees with L1/L2 regularization for complex pattern recognition.
- **LightGBM**: Leaf-wise tree growth optimized for speed and handling large feature sets.
- **Random Forest**: An ensemble of bagged decision trees to reduce variance and provide stability.

### 2. Meta-Learner (Level 1)
- **Logistic Regression**: A simple yet effective classifier that learns how to optimally combine the predictions from the base learners to produce the final "Pass/Fail" classification.

---

## 🔄 The Prediction Pipeline

### Phase 1: Feature Engineering
The raw `StudentProfile` (JSON) is converted into a feature vector of **41 numeric features**.
- **Categorical Encoding**: One-hot or Label encoding for `region`, `gender`, and `disability`.
- **Engagement Scaling**: `RobustScaler` is used on metrics like `total_clicks` and `active_days` to mitigate the influence of extreme student outliers.
- **Academic Context**: Inclusion of `studied_credits` and `num_of_prev_attempts` to assess historical academic load.

### Phase 2: Inference
1. The 41 features are passed to the **Base Learners**.
2. Each model produces a "Probability of Success."
3. These three probabilities are fed into the **Meta-Learner**.
4. The Meta-Learner outputs the final **Outcome Prediction**.

### Phase 3: Adaptive Strategy Mapping
The prediction is mapped to a high-level strategy that the AI can understand:
- **Predicted "Fail/Withdraw"** → **Strategy: `Needs Learning Support`**
  - *Instruction to AI*: Slow down, add foundational weeks, simplify projects.
- **Predicted "Pass/Distinction"** → **Strategy: `Career Ready Learner`**
  - *Instruction to AI*: Increase pace, skip basics, introduce complex industry-level projects.

---

## 🔗 Integration with Generative AI (Gemini)
The ML prediction is not shown to the user as a raw score; instead, it is injected into the **System Prompt** of the `Prompt Engine`:

```python
# Backend logic in prompt_engine.py
if prediction == "Needs Learning Support":
    prompt += "ADAPTIVE MODE ENABLED: Focus on core fundamentals, increase repetition, and use simplified analogies."
```

---

## 📊 Technical Specifications
- **Target Accuracy**: 84% - 88%
- **Preprocessing**: SMOTETomek (Hybrid oversampling + undersampling for class balance).
- **Inference Time**: < 150ms per profile.
- **Dataset**: Based on the Open University Learning Analytics Dataset (OULAD).

---

## 🚀 Why This Matters
Without this workflow, the AI (Gemini) would generate a generic roadmap. With the ML workflow, the platform identifies **invisible risk factors** (like low engagement or high credit load) and proactively modifies the curriculum to prevent the student from failing before they even begin.
