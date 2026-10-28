# SGEMM GPU Kernel Performance - Stochastic Gradient Descent (SGD)

## Project Overview
This project implements Stochastic Gradient Descent (SGD) from scratch in NumPy to model and predict GPU kernel performance using the SGEMM GPU Kernel Performance dataset.

## Dataset Overview
- **Instances**: 241,600
- **Features**: 14 attributes measuring various GPU parameter settings (matrix sizes, work-group sizes, memory layout configurations).
- **Target**: 4 target run time columns (Run1, Run2, Run3, Run4 in milliseconds), log-transformed and averaged to produce a single continuous target variable representing log execution time.

## Optimization Strategies
Two SGD strategies are implemented completely from scratch using Python/NumPy:
1. **Strategy 1: Random With Replacement** - Batches are sampled randomly with replacement during each epoch.
2. **Strategy 2: Random Without Replacement** - Data indices are shuffled randomly at the start of each epoch and traversed without replacement.

## Experiment Setup
- **Learning Rate**: 0.0005
- **Epochs**: 100
- **Batch Sizes Tested**: 100, 200, 400, 800, 1000, 1600

## Results
- **Test MSE**: ~0.2790 across batch size configurations.

## Dataset Attribution
**Dataset Title**: SGEMM GPU Kernel Performance Dataset  
**Authors**: Rafael Ballester-Ripoll, Enrique S. Quintana-Ortí, Peihong Jiang  
**Citation / Reference**:
- Ballester-Ripoll, R., Paredes, P. G., & Pajarola, R. (2019). Sobolev Training for Neural Networks.
- UCI Machine Learning Repository: SGEMM GPU Kernel Performance Data Set.
