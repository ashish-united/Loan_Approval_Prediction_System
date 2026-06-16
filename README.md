# LendSafe: Premium Loan Approval Predictor

LendSafe is a professional, state-of-the-art Streamlit web application and machine learning deployment for predicting loan repayment probability and assessing underwriting risk.

The predictive engine is powered by a **Random Forest Classifier** trained on `loan_dataset_20000.csv`, utilizing class-balancing via SMOTE, categorical encoding, and feature standardization.

---

## 📊 Model Performance Metrics

During evaluation, multiple classification algorithms were trained and validated on the balanced test set. The **Random Forest Classifier** achieved the highest accuracy and ROC-AUC score, making it the selected choice for this deployment:

| Metric | Logistic Regression | XGBoost | Random Forest (Selected) |
| :--- | :---: | :---: | :---: |
| **Accuracy** | 76.11% | 93.55% | **94.61%** |
| **Precision** | 75.23% | 89.79% | **91.28%** |
| **Recall** | 77.93% | 98.28% | **98.66%** |
| **F1-Score** | 76.55% | 93.84% | **94.82%** |
| **ROC-AUC** | 0.8620 | 0.9739 | **0.9841** |

---

## 📂 Project Structure

```
├── .streamlit/
│   └── config.toml          # Custom dark mode theme configuration
├── app.py                   # Main Streamlit dashboard application
├── train.py                 # Script to preprocess data, train, and save model
├── model.pkl                # Serialized model, scaler, and label encoders
├── requirements.txt         # Project Python dependencies
└── README.md                # Project documentation
```

---

## 📋 Features & Inputs Analyzed

The underwriting engine collects and processes 21 distinct applicant data points grouped into four categories:

1. **Personal Details:**
   - `age`: Applicant's age in years.
   - `gender`: Gender identity (`Male`, `Female`, `Other`).
   - `marital_status`: Relationship status (`Married`, `Single`, `Divorced`, `Widowed`).
   - `education_level`: Highest education achieved (`High School`, `Bachelor's`, `Master's`, `PhD`, `Other`).

2. **Income & Employment:**
   - `employment_status`: Work status (`Employed`, `Self-employed`, `Unemployed`, `Retired`, `Student`).
   - `annual_income`: Total gross yearly income.
   - `monthly_income`: Net monthly take-home income.
   - `debt_to_income_ratio` (DTI): The proportion of monthly debt payments to gross monthly income.

3. **Credit Profile:**
   - `credit_score`: FICO credit rating (300 to 850).
   - `num_of_open_accounts`: Number of active credit lines/accounts.
   - `total_credit_limit`: Total credit capacity available.
   - `current_balance`: Current outstanding debt balance.
   - `delinquency_history`: Number of payment delinquencies in recent history.
   - `public_records`: Count of derogatory public records (bankruptcies, tax liens, etc.).
   - `num_of_delinquencies`: Total historical delinquency events.

4. **Loan Details:**
   - `loan_amount`: Principal amount requested.
   - `loan_purpose`: Intended usage (`Car`, `Debt consolidation`, `Business`, `Home`, `Medical`, `Education`, `Vacation`, `Other`).
   - `interest_rate`: Fixed annual interest rate.
   - `loan_term`: Repayment duration (`36` or `60` months).
   - `grade_subgrade`: Internal lender rating (risk tier `A1` to `F5`).
   - `installment`: Calculated monthly repayment amount.

---

## ⚙️ Setup and Installation

### 1. Prerequisite Packages
Make sure you have Python 3.9+ installed. It is highly recommended to run this in a virtual environment.

### 2. Install Dependencies
Clone or copy this project structure, navigate to the directory in your shell, and run:
```bash
pip install -r requirements.txt
```

### 3. Train the Model
To re-generate or train the Random Forest model and create `model.pkl`:
```bash
python train.py
```
*Note: Make sure `loan_dataset_20000.csv` is present in the specified directory, or update the file path inside `train.py`.*

### 4. Run the Streamlit Dashboard
Launch the dashboard server locally by running:
```bash
streamlit run app.py
```

Open the local URL printed in the terminal (usually `http://localhost:8501`) to access the LendSafe interactive interface.
