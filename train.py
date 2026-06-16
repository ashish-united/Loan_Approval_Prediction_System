import pandas as pd
import numpy as np
import pickle
from sklearn.preprocessing import LabelEncoder, StandardScaler
from imblearn.over_sampling import SMOTE
from sklearn.ensemble import RandomForestClassifier

def train_model():
    print("Loading dataset...")
    # Read the dataset from Desktop where it is located
    dataset_path = r"C:\Users\ag206\OneDrive\Desktop\loan_dataset_20000.csv"
    df = pd.read_csv(dataset_path)
    
    print("Splitting features and target...")
    X = df.drop('loan_paid_back', axis=1)
    y = df['loan_paid_back']
    
    print("Encoding categorical features...")
    label_encoders = {}
    # Use select_dtypes to get object and string columns
    categorical_cols = X.select_dtypes(include=['object', 'str']).columns
    for col in categorical_cols:
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col])
        label_encoders[col] = le
        print(f"Encoded '{col}' with classes: {le.classes_.tolist()}")
        
    print("Scaling features...")
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    print("Balancing classes with SMOTE...")
    smote = SMOTE(random_state=42)
    X_balanced, y_balanced = smote.fit_resample(X_scaled, y)
    
    print("Training Random Forest Classifier...")
    # Train Random Forest Classifier
    rf_model = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    rf_model.fit(X_balanced, y_balanced)
    
    print("Saving model and preprocessors to model.pkl...")
    model_data = {
        'model': rf_model,
        'scaler': scaler,
        'label_encoders': label_encoders,
        'feature_cols': list(X.columns)
    }
    
    with open('model.pkl', 'wb') as f:
        pickle.dump(model_data, f)
        
    print("Model trained and saved successfully as 'model.pkl'!")

if __name__ == '__main__':
    train_model()
