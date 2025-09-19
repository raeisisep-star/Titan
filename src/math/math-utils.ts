/**
 * 🧮 TITAN Trading System - Mathematical Utilities
 * 
 * Utility functions for mathematical operations and calculations:
 * - Linear Algebra Operations
 * - Statistical Functions
 * - Numerical Methods
 * - Financial Mathematics
 * - Data Processing Utilities
 * 
 * Features:
 * ✅ Matrix operations and linear algebra
 * ✅ Advanced statistical functions
 * ✅ Numerical integration and differentiation
 * ✅ Financial calculations (PV, FV, IRR, etc.)
 * ✅ Data transformation and normalization
 */

// ============================================================================
// LINEAR ALGEBRA UTILITIES
// ============================================================================

export class Matrix {
  constructor(public data: number[][]) {}
  
  get rows(): number {
    return this.data.length;
  }
  
  get cols(): number {
    return this.data[0]?.length || 0;
  }
  
  /**
   * 🔢 Matrix multiplication
   */
  multiply(other: Matrix): Matrix {
    if (this.cols !== other.rows) {
      throw new Error(`Matrix dimensions incompatible: ${this.rows}x${this.cols} * ${other.rows}x${other.cols}`);
    }
    
    const result: number[][] = [];
    
    for (let i = 0; i < this.rows; i++) {
      result[i] = [];
      for (let j = 0; j < other.cols; j++) {
        let sum = 0;
        for (let k = 0; k < this.cols; k++) {
          sum += this.data[i][k] * other.data[k][j];
        }
        result[i][j] = sum;
      }
    }
    
    return new Matrix(result);
  }
  
  /**
   * 🔄 Matrix transpose
   */
  transpose(): Matrix {
    const result: number[][] = [];
    
    for (let j = 0; j < this.cols; j++) {
      result[j] = [];
      for (let i = 0; i < this.rows; i++) {
        result[j][i] = this.data[i][j];
      }
    }
    
    return new Matrix(result);
  }
  
  /**
   * 🔍 Matrix determinant (for square matrices)
   */
  determinant(): number {
    if (this.rows !== this.cols) {
      throw new Error('Determinant is only defined for square matrices');
    }
    
    return this.calculateDeterminant(this.data);
  }
  
  private calculateDeterminant(matrix: number[][]): number {
    const n = matrix.length;
    
    if (n === 1) return matrix[0][0];
    if (n === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    
    let det = 0;
    for (let j = 0; j < n; j++) {
      const minor = this.getMinor(matrix, 0, j);
      det += Math.pow(-1, j) * matrix[0][j] * this.calculateDeterminant(minor);
    }
    
    return det;
  }
  
  private getMinor(matrix: number[][], excludeRow: number, excludeCol: number): number[][] {
    return matrix
      .filter((_, i) => i !== excludeRow)
      .map(row => row.filter((_, j) => j !== excludeCol));
  }
  
  /**
   * 🔄 Matrix inverse
   */
  inverse(): Matrix {
    if (this.rows !== this.cols) {
      throw new Error('Inverse is only defined for square matrices');
    }
    
    const det = this.determinant();
    if (Math.abs(det) < 1e-10) {
      throw new Error('Matrix is singular (determinant ≈ 0)');
    }
    
    const n = this.rows;
    const adjugate = this.adjugate();
    
    const result = adjugate.data.map(row => 
      row.map(val => val / det)
    );
    
    return new Matrix(result);
  }
  
  private adjugate(): Matrix {
    const n = this.rows;
    const result: number[][] = [];
    
    for (let i = 0; i < n; i++) {
      result[i] = [];
      for (let j = 0; j < n; j++) {
        const minor = this.getMinor(this.data, i, j);
        const cofactor = Math.pow(-1, i + j) * this.calculateDeterminant(minor);
        result[j][i] = cofactor; // Note: transposed
      }
    }
    
    return new Matrix(result);
  }
  
  /**
   * 🎯 Eigenvalues calculation (simplified implementation)
   */
  eigenvalues(): number[] {
    if (this.rows !== this.cols) {
      throw new Error('Eigenvalues are only defined for square matrices');
    }
    
    // Simplified implementation using power iteration for dominant eigenvalue
    // In production, use more sophisticated algorithms like QR decomposition
    return this.powerIteration();
  }
  
  private powerIteration(maxIterations: number = 100, tolerance: number = 1e-6): number[] {
    const n = this.rows;
    let vector = Array(n).fill(1).map(() => Math.random());
    
    for (let iter = 0; iter < maxIterations; iter++) {
      // Multiply matrix by vector
      const newVector = this.data.map(row => 
        row.reduce((sum, val, j) => sum + val * vector[j], 0)
      );
      
      // Normalize
      const norm = Math.sqrt(newVector.reduce((sum, val) => sum + val * val, 0));
      const normalizedVector = newVector.map(val => val / norm);
      
      // Check convergence
      const diff = vector.reduce((sum, val, i) => 
        sum + Math.abs(val - normalizedVector[i]), 0
      );
      
      if (diff < tolerance) break;
      vector = normalizedVector;
    }
    
    // Calculate eigenvalue (Rayleigh quotient)
    const Av = this.data.map(row => 
      row.reduce((sum, val, j) => sum + val * vector[j], 0)
    );
    const eigenvalue = vector.reduce((sum, val, i) => sum + val * Av[i], 0);
    
    return [eigenvalue]; // Simplified - returns only dominant eigenvalue
  }
}

// ============================================================================
// STATISTICAL FUNCTIONS
// ============================================================================

/**
 * 📊 Calculate correlation coefficient
 */
export function correlation(x: number[], y: number[], method: 'pearson' | 'spearman' = 'pearson'): number {
  if (x.length !== y.length) {
    throw new Error('Arrays must have the same length');
  }
  
  if (method === 'spearman') {
    // Convert to ranks and calculate Pearson on ranks
    const xRanks = getRanks(x);
    const yRanks = getRanks(y);
    return pearsonCorrelation(xRanks, yRanks);
  }
  
  return pearsonCorrelation(x, y);
}

function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  const meanX = x.reduce((sum, val) => sum + val, 0) / n;
  const meanY = y.reduce((sum, val) => sum + val, 0) / n;
  
  let numerator = 0;
  let sumXX = 0;
  let sumYY = 0;
  
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    sumXX += dx * dx;
    sumYY += dy * dy;
  }
  
  const denominator = Math.sqrt(sumXX * sumYY);
  return denominator === 0 ? 0 : numerator / denominator;
}

function getRanks(data: number[]): number[] {
  const sorted = data.map((val, idx) => ({ val, idx }))
    .sort((a, b) => a.val - b.val);
  
  const ranks = new Array(data.length);
  
  for (let i = 0; i < sorted.length; i++) {
    ranks[sorted[i].idx] = i + 1;
  }
  
  return ranks;
}

/**
 * 🎯 Calculate covariance
 */
export function covariance(x: number[], y: number[]): number {
  if (x.length !== y.length) {
    throw new Error('Arrays must have the same length');
  }
  
  const n = x.length;
  const meanX = x.reduce((sum, val) => sum + val, 0) / n;
  const meanY = y.reduce((sum, val) => sum + val, 0) / n;
  
  const cov = x.reduce((sum, val, i) => 
    sum + (val - meanX) * (y[i] - meanY), 0
  ) / (n - 1);
  
  return cov;
}

/**
 * 📏 Calculate distance metrics
 */
export function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }
  
  return Math.sqrt(a.reduce((sum, val, i) => 
    sum + Math.pow(val - b[i], 2), 0
  ));
}

export function manhattanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }
  
  return a.reduce((sum, val, i) => sum + Math.abs(val - b[i]), 0);
}

export function cosineDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }
  
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  
  if (magnitudeA === 0 || magnitudeB === 0) return 1; // Maximum distance
  
  return 1 - (dotProduct / (magnitudeA * magnitudeB));
}

/**
 * 🔔 Normal distribution functions
 */
export function normalPDF(x: number, mean: number = 0, std: number = 1): number {
  const coefficient = 1 / (std * Math.sqrt(2 * Math.PI));
  const exponent = -0.5 * Math.pow((x - mean) / std, 2);
  return coefficient * Math.exp(exponent);
}

export function normalCDF(x: number, mean: number = 0, std: number = 1): number {
  const z = (x - mean) / std;
  return 0.5 * (1 + erf(z / Math.sqrt(2)));
}

// Error function approximation
function erf(x: number): number {
  // Abramowitz and Stegun approximation
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;
  
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);
  
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  
  return sign * y;
}

/**
 * 🎲 Random number generators
 */
export function normalRandom(mean: number = 0, std: number = 1): number {
  // Box-Muller transformation
  const u1 = Math.random();
  const u2 = Math.random();
  
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z0 * std + mean;
}

export function uniformRandom(min: number = 0, max: number = 1): number {
  return min + (max - min) * Math.random();
}

export function exponentialRandom(lambda: number = 1): number {
  return -Math.log(Math.random()) / lambda;
}

// ============================================================================
// NUMERICAL METHODS
// ============================================================================

/**
 * 🔍 Root finding using Newton-Raphson method
 */
export function newtonRaphson(
  f: (x: number) => number,
  df: (x: number) => number,
  initialGuess: number,
  tolerance: number = 1e-6,
  maxIterations: number = 100
): { root: number; iterations: number; converged: boolean } {
  let x = initialGuess;
  let iterations = 0;
  
  for (let i = 0; i < maxIterations; i++) {
    const fx = f(x);
    const dfx = df(x);
    
    if (Math.abs(dfx) < 1e-12) {
      throw new Error('Derivative is zero - cannot continue Newton-Raphson');
    }
    
    const newX = x - fx / dfx;
    
    if (Math.abs(newX - x) < tolerance) {
      return { root: newX, iterations: i + 1, converged: true };
    }
    
    x = newX;
    iterations = i + 1;
  }
  
  return { root: x, iterations, converged: false };
}

/**
 * 🔢 Numerical integration using Simpson's rule
 */
export function simpsonsRule(
  f: (x: number) => number,
  a: number,
  b: number,
  n: number = 100
): number {
  if (n % 2 !== 0) n++; // Ensure n is even
  
  const h = (b - a) / n;
  let sum = f(a) + f(b);
  
  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    const coefficient = i % 2 === 0 ? 2 : 4;
    sum += coefficient * f(x);
  }
  
  return (h / 3) * sum;
}

/**
 * 📐 Trapezoidal rule integration
 */
export function trapezoidalRule(
  f: (x: number) => number,
  a: number,
  b: number,
  n: number = 100
): number {
  const h = (b - a) / n;
  let sum = 0.5 * (f(a) + f(b));
  
  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    sum += f(x);
  }
  
  return h * sum;
}

/**
 * 🎯 Numerical differentiation
 */
export function numericalDerivative(
  f: (x: number) => number,
  x: number,
  h: number = 1e-5
): number {
  // Central difference formula
  return (f(x + h) - f(x - h)) / (2 * h);
}

// ============================================================================
// FINANCIAL MATHEMATICS
// ============================================================================

/**
 * 💰 Present Value calculation
 */
export function presentValue(futureValue: number, rate: number, periods: number): number {
  return futureValue / Math.pow(1 + rate, periods);
}

/**
 * 💹 Future Value calculation
 */
export function futureValue(presentValue: number, rate: number, periods: number): number {
  return presentValue * Math.pow(1 + rate, periods);
}

/**
 * 📈 Compound Annual Growth Rate (CAGR)
 */
export function cagr(beginningValue: number, endingValue: number, periods: number): number {
  return Math.pow(endingValue / beginningValue, 1 / periods) - 1;
}

/**
 * 🏦 Internal Rate of Return (IRR)
 */
export function irr(cashFlows: number[], initialGuess: number = 0.1): number {
  const npv = (rate: number) => 
    cashFlows.reduce((sum, cf, i) => sum + cf / Math.pow(1 + rate, i), 0);
  
  const npvDerivative = (rate: number) =>
    cashFlows.reduce((sum, cf, i) => sum - i * cf / Math.pow(1 + rate, i + 1), 0);
  
  try {
    const result = newtonRaphson(npv, npvDerivative, initialGuess);
    return result.converged ? result.root : NaN;
  } catch {
    return NaN;
  }
}

/**
 * 💵 Net Present Value (NPV)
 */
export function npv(cashFlows: number[], discountRate: number): number {
  return cashFlows.reduce((sum, cf, i) => sum + cf / Math.pow(1 + discountRate, i), 0);
}

/**
 * ⏰ Modified Duration
 */
export function modifiedDuration(
  couponRate: number,
  yield_: number,
  maturity: number,
  frequency: number = 2
): number {
  const macaulayDuration = macaulayDurationCalc(couponRate, yield_, maturity, frequency);
  return macaulayDuration / (1 + yield_ / frequency);
}

function macaulayDurationCalc(
  couponRate: number,
  yield_: number,
  maturity: number,
  frequency: number
): number {
  const periods = maturity * frequency;
  const periodicCoupon = couponRate / frequency;
  const periodicYield = yield_ / frequency;
  
  let weightedTimeSum = 0;
  let priceSum = 0;
  
  for (let t = 1; t <= periods; t++) {
    const cashFlow = t === periods ? 1 + periodicCoupon : periodicCoupon;
    const presentValue = cashFlow / Math.pow(1 + periodicYield, t);
    
    weightedTimeSum += (t / frequency) * presentValue;
    priceSum += presentValue;
  }
  
  return weightedTimeSum / priceSum;
}

/**
 * 🎯 Black-Scholes option pricing
 */
export function blackScholes(
  S: number,  // Current stock price
  K: number,  // Strike price
  T: number,  // Time to expiration (in years)
  r: number,  // Risk-free rate
  sigma: number, // Volatility
  optionType: 'call' | 'put' = 'call'
): { price: number; delta: number; gamma: number; theta: number; vega: number; rho: number } {
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  
  const Nd1 = normalCDF(d1);
  const Nd2 = normalCDF(d2);
  const nd1 = normalPDF(d1);
  
  let price: number;
  let delta: number;
  let rho: number;
  
  if (optionType === 'call') {
    price = S * Nd1 - K * Math.exp(-r * T) * Nd2;
    delta = Nd1;
    rho = K * T * Math.exp(-r * T) * Nd2;
  } else {
    price = K * Math.exp(-r * T) * normalCDF(-d2) - S * normalCDF(-d1);
    delta = normalCDF(-d1) - 1;
    rho = -K * T * Math.exp(-r * T) * normalCDF(-d2);
  }
  
  const gamma = nd1 / (S * sigma * Math.sqrt(T));
  const theta = optionType === 'call'
    ? (-S * nd1 * sigma) / (2 * Math.sqrt(T)) - r * K * Math.exp(-r * T) * Nd2
    : (-S * nd1 * sigma) / (2 * Math.sqrt(T)) + r * K * Math.exp(-r * T) * normalCDF(-d2);
  
  const vega = S * nd1 * Math.sqrt(T);
  
  return { price, delta, gamma, theta, vega, rho };
}

// ============================================================================
// DATA PROCESSING UTILITIES
// ============================================================================

/**
 * 🔄 Data normalization
 */
export function normalize(data: number[], method: 'min-max' | 'z-score' = 'min-max'): number[] {
  if (method === 'min-max') {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    
    if (range === 0) return data.map(() => 0);
    
    return data.map(val => (val - min) / range);
  } else {
    // Z-score normalization
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const std = Math.sqrt(
      data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length
    );
    
    if (std === 0) return data.map(() => 0);
    
    return data.map(val => (val - mean) / std);
  }
}

/**
 * 🎯 Data standardization
 */
export function standardize(data: number[]): number[] {
  return normalize(data, 'z-score');
}

/**
 * 📊 Rolling window calculation
 */
export function rollingWindow<T>(
  data: T[],
  windowSize: number,
  operation: (window: T[]) => number
): number[] {
  const result: number[] = [];
  
  for (let i = windowSize - 1; i < data.length; i++) {
    const window = data.slice(i - windowSize + 1, i + 1);
    result.push(operation(window));
  }
  
  return result;
}

/**
 * 🔢 Moving average calculations
 */
export function simpleMovingAverage(data: number[], period: number): number[] {
  return rollingWindow(data, period, window => 
    window.reduce((sum, val) => sum + val, 0) / window.length
  );
}

export function exponentialMovingAverage(data: number[], period: number): number[] {
  const alpha = 2 / (period + 1);
  const result: number[] = [];
  
  if (data.length === 0) return result;
  
  result[0] = data[0];
  
  for (let i = 1; i < data.length; i++) {
    result[i] = alpha * data[i] + (1 - alpha) * result[i - 1];
  }
  
  return result;
}

/**
 * 📈 Percentage change calculation
 */
export function percentageChange(data: number[]): number[] {
  const result: number[] = [];
  
  for (let i = 1; i < data.length; i++) {
    const change = data[i - 1] !== 0 ? (data[i] - data[i - 1]) / data[i - 1] : 0;
    result.push(change);
  }
  
  return result;
}

/**
 * 📊 Log returns calculation
 */
export function logReturns(data: number[]): number[] {
  const result: number[] = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i] > 0 && data[i - 1] > 0) {
      result.push(Math.log(data[i] / data[i - 1]));
    } else {
      result.push(0);
    }
  }
  
  return result;
}

/**
 * 🎯 Outlier detection using IQR method
 */
export function detectOutliers(data: number[], factor: number = 1.5): {
  outliers: number[];
  indices: number[];
  bounds: { lower: number; upper: number };
} {
  const sortedData = [...data].sort((a, b) => a - b);
  const n = sortedData.length;
  
  const q1Index = Math.floor(n * 0.25);
  const q3Index = Math.floor(n * 0.75);
  
  const q1 = sortedData[q1Index];
  const q3 = sortedData[q3Index];
  const iqr = q3 - q1;
  
  const lowerBound = q1 - factor * iqr;
  const upperBound = q3 + factor * iqr;
  
  const outliers: number[] = [];
  const indices: number[] = [];
  
  data.forEach((val, idx) => {
    if (val < lowerBound || val > upperBound) {
      outliers.push(val);
      indices.push(idx);
    }
  });
  
  return {
    outliers,
    indices,
    bounds: { lower: lowerBound, upper: upperBound }
  };
}

/**
 * 🔍 Find peaks and valleys
 */
export function findPeaksAndValleys(
  data: number[],
  minProminence: number = 0.01
): { peaks: number[]; valleys: number[] } {
  const peaks: number[] = [];
  const valleys: number[] = [];
  
  for (let i = 1; i < data.length - 1; i++) {
    const prev = data[i - 1];
    const curr = data[i];
    const next = data[i + 1];
    
    // Peak detection
    if (curr > prev && curr > next) {
      const prominence = Math.min(curr - prev, curr - next);
      if (prominence >= minProminence) {
        peaks.push(i);
      }
    }
    
    // Valley detection
    if (curr < prev && curr < next) {
      const prominence = Math.min(prev - curr, next - curr);
      if (prominence >= minProminence) {
        valleys.push(i);
      }
    }
  }
  
  return { peaks, valleys };
}

/**
 * 🌊 Smooth data using various methods
 */
export function smoothData(
  data: number[],
  method: 'moving_average' | 'exponential' | 'gaussian' = 'moving_average',
  parameter: number = 3
): number[] {
  switch (method) {
    case 'moving_average':
      return simpleMovingAverage(data, parameter);
      
    case 'exponential':
      return exponentialMovingAverage(data, parameter);
      
    case 'gaussian':
      return gaussianSmooth(data, parameter);
      
    default:
      return data;
  }
}

function gaussianSmooth(data: number[], sigma: number): number[] {
  const kernelSize = Math.ceil(6 * sigma);
  const kernel = createGaussianKernel(kernelSize, sigma);
  
  return data.map((_, i) => {
    let sum = 0;
    let weightSum = 0;
    
    for (let j = 0; j < kernel.length; j++) {
      const dataIndex = i - Math.floor(kernel.length / 2) + j;
      if (dataIndex >= 0 && dataIndex < data.length) {
        sum += data[dataIndex] * kernel[j];
        weightSum += kernel[j];
      }
    }
    
    return weightSum > 0 ? sum / weightSum : data[i];
  });
}

function createGaussianKernel(size: number, sigma: number): number[] {
  const kernel: number[] = [];
  const center = Math.floor(size / 2);
  
  for (let i = 0; i < size; i++) {
    const x = i - center;
    kernel[i] = normalPDF(x, 0, sigma);
  }
  
  // Normalize kernel
  const sum = kernel.reduce((acc, val) => acc + val, 0);
  return kernel.map(val => val / sum);
}

/**
 * 🎲 Generate synthetic data
 */
export function generateSyntheticTimeSeries(
  length: number,
  trend: number = 0,
  seasonality: { amplitude: number; period: number } | null = null,
  noise: number = 0.1,
  startValue: number = 100
): number[] {
  const data: number[] = [];
  
  for (let i = 0; i < length; i++) {
    let value = startValue;
    
    // Add trend
    value += trend * i;
    
    // Add seasonality
    if (seasonality) {
      value += seasonality.amplitude * Math.sin(2 * Math.PI * i / seasonality.period);
    }
    
    // Add noise
    value += normalRandom(0, noise);
    
    data.push(value);
  }
  
  return data;
}

export default {
  Matrix,
  correlation,
  covariance,
  euclideanDistance,
  manhattanDistance,
  cosineDistance,
  normalPDF,
  normalCDF,
  normalRandom,
  uniformRandom,
  exponentialRandom,
  newtonRaphson,
  simpsonsRule,
  trapezoidalRule,
  numericalDerivative,
  presentValue,
  futureValue,
  cagr,
  irr,
  npv,
  modifiedDuration,
  blackScholes,
  normalize,
  standardize,
  rollingWindow,
  simpleMovingAverage,
  exponentialMovingAverage,
  percentageChange,
  logReturns,
  detectOutliers,
  findPeaksAndValleys,
  smoothData,
  generateSyntheticTimeSeries
};