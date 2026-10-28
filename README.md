# SGEMM GPU Kernel Performance - Stochastic Gradient Descent (SGD)

## Project Overview
This project implements Stochastic Gradient Descent (SGD) from scratch in NumPy to model and predict GPU kernel performance using the SGEMM GPU Kernel Performance dataset.

## Dataset Overview
- **Instances**: 241,600[cite: 2]
- **Features**: 14 attributes measuring various GPU parameter settings (matrix tiling, work-group sizes, local memory shapes, loop unrolling, vector widths, strides, and manual caching)[cite: 2].
- **Target**: 4 target run time columns (`Run1`, `Run2`, `Run3`, `Run4` in milliseconds), log-transformed and averaged to produce a single continuous target variable representing log execution time[cite: 1, 2].

## Optimization Strategies
Two SGD strategies are implemented completely from scratch using Python/NumPy:
1. **Strategy 1: Random With Replacement** — Batches are sampled randomly with replacement during each epoch.
2. **Strategy 2: Random Without Replacement** — Data indices are shuffled randomly at the start of each epoch and traversed without replacement.

## Experiment Setup
- **Learning Rate ($\alpha$)**: 0.0005
- **Epochs**: 100
- **Batch Sizes Tested**: 100, 200, 400, 800, 1000, 1600

## Results
- **Test MSE**: $\sim 0.2790$ across batch size configurations.

## Repository Structure
| Filename | Description |
| :--- | :--- |
| [`Assignment2_SGD.ipynb`](Assignment2_SGD.ipynb) | Complete Jupyter notebook containing data preprocessing, custom SGD implementations, and plotting[cite: 1]. |
| [`sgd_sgemm_analysis.py`](sgd_sgemm_analysis.py) | Standalone Python script version of the complete SGD training pipeline. |
| [`sgemm_product.csv`](sgemm_product.csv) | The full SGEMM GPU Kernel Performance dataset (241,600 rows)[cite: 1, 2]. |
| [`Readme_dataset.txt`](Readme_dataset.txt) | Original dataset description and source documentation[cite: 2]. |
| [`README.md`](README.md) | Project documentation, methodology summary, and results. |

## Dataset Attribution & References
If you use this dataset or build upon this work, please cite the original references[cite: 2]:
- Rafael Ballester-Ripoll, Enrique G. Paredes, and Renato Pajarola. **"Sobol Tensor Trains for Global Sensitivity Analysis"**[cite: 2]. arXiv preprint arXiv:1712.00233, 2017[cite: 2].
- Cedric Nugteren and Valeriu Codreanu. **"CLTune: A Generic Auto-Tuner for OpenCL Kernels"**[cite: 2]. 9th International Symposium on Embedded Multicore/Many-core Systems-on-Chip (MCSoC). IEEE, 2015[cite: 2].
