import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# Load SGEMM GPU Kernel Performance Dataset
# Dataset parameters: 241,600 instances, 14 features, 4 target run columns log-averaged
def load_and_preprocess_data(file_path):
    data = pd.read_csv(file_path)
    X = data.iloc[:, :14].values
    
    # Target columns: Run1 (ms), Run2 (ms), Run3 (ms), Run4 (ms)
    # Log-transform and average runtimes
    runs = data.iloc[:, 14:18].values
    log_runs = np.log(runs)
    y = np.mean(log_runs, axis=1)
    
    # Feature standardization
    mean = np.mean(X, axis=0)
    std = np.std(X, axis=0)
    X_scaled = (X - mean) / std
    
    # Add bias term
    X_scaled = np.c_[np.ones(X_scaled.shape[0]), X_scaled]
    return X_scaled, y

# SGD Strategy 1: Random With Replacement
def sgd_random_with_replacement(X, y, lr=0.0005, epochs=100, batch_size=100):
    n_samples, n_features = X.shape
    weights = np.zeros(n_features)
    loss_history = []
    
    for epoch in range(epochs):
        indices = np.random.choice(n_samples, size=batch_size, replace=True)
        X_batch = X[indices]
        y_batch = y[indices]
        
        predictions = X_batch @ weights
        errors = predictions - y_batch
        gradient = (2 / batch_size) * (X_batch.T @ errors)
        weights -= lr * gradient
        
        epoch_loss = np.mean((X @ weights - y) ** 2)
        loss_history.append(epoch_loss)
        
    return weights, loss_history

# SGD Strategy 2: Random Without Replacement
def sgd_random_without_replacement(X, y, lr=0.0005, epochs=100, batch_size=100):
    n_samples, n_features = X.shape
    weights = np.zeros(n_features)
    loss_history = []
    
    for epoch in range(epochs):
        indices = np.random.permutation(n_samples)
        for i in range(0, n_samples, batch_size):
            batch_idx = indices[i:i + batch_size]
            X_batch = X[batch_idx]
            y_batch = y[batch_idx]
            
            predictions = X_batch @ weights
            errors = predictions - y_batch
            gradient = (2 / len(batch_idx)) * (X_batch.T @ errors)
            weights -= lr * gradient
            
        epoch_loss = np.mean((X @ weights - y) ** 2)
        loss_history.append(epoch_loss)
        
    return weights, loss_history

if __name__ == "__main__":
    print("SGEMM GPU Kernel Performance SGD Analysis Loaded Successfully.")
