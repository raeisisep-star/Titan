/**
 * Chart Widget
 * 🎯 TITAN Platform - Dashboard Widget
 * Version: 2.0.0
 * 
 * Displays portfolio performance chart:
 * - Historical balance data
 * - Multiple timeframes (1H, 4H, 1D, 1W, 1M)
 * - Interactive chart with Chart.js
 */

import { formatCurrency, formatPersianDate } from '../utils/formatters.js';
import { DASHBOARD_CONFIG } from '../core/constants.js';

/**
 * Render Chart Widget
 * @param {Object} chartData - Chart data from API
 * @param {string} currentTimeframe - Current selected timeframe
 * @returns {string} HTML string for chart widget
 */
export function renderChartWidget(chartData, currentTimeframe = '1D') {
    // Validate data
    if (!chartData || !chartData.labels || !chartData.datasets) {
        return renderChartError('داده‌های نمودار موجود نیست');
    }
    
    const timeframes = DASHBOARD_CONFIG.CHART.TIMEFRAMES;
    
    return `
        <div class="dashboard-widget chart-widget" id="chart-widget">
            <!-- Widget Header -->
            <div class="widget-header">
                <div class="widget-title">
                    <span class="widget-icon">📈</span>
                    <h3>نمودار عملکرد</h3>
                </div>
                <div class="widget-actions">
                    <!-- Timeframe Selector -->
                    <div class="timeframe-selector">
                        ${timeframes.map(tf => `
                            <button 
                                class="timeframe-btn ${tf === currentTimeframe ? 'active' : ''}"
                                onclick="window.dashboardModule?.changeTimeframe('${tf}')"
                                data-timeframe="${tf}"
                            >
                                ${tf}
                            </button>
                        `).join('')}
                    </div>
                    
                    <button class="widget-action-btn" onclick="window.dashboardModule?.refreshWidget('chart')" title="به‌روزرسانی">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                        </svg>
                    </button>
                </div>
            </div>
            
            <!-- Widget Content -->
            <div class="widget-content">
                <!-- Chart Container -->
                <div class="chart-container">
                    <canvas id="portfolio-chart"></canvas>
                </div>
                
                <!-- Chart Legend (if needed) -->
                <div class="chart-legend">
                    ${renderChartLegend(chartData.datasets)}
                </div>
            </div>
            
            <!-- Widget Footer -->
            <div class="widget-footer">
                <div class="chart-info">
                    <span class="chart-info-label">آخرین نقطه:</span>
                    <span class="chart-info-value">${getLastDataPoint(chartData)}</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render chart legend
 * @param {Array} datasets - Chart datasets
 * @returns {string} HTML string for legend
 */
function renderChartLegend(datasets) {
    if (!datasets || datasets.length === 0) {
        return '';
    }
    
    return datasets.map(dataset => `
        <div class="legend-item">
            <span class="legend-color" style="background-color: ${dataset.borderColor};"></span>
            <span class="legend-label">${dataset.label}</span>
        </div>
    `).join('');
}

/**
 * Get last data point value
 * @param {Object} chartData - Chart data
 * @returns {string} Formatted last value
 */
function getLastDataPoint(chartData) {
    if (!chartData.datasets || chartData.datasets.length === 0) {
        return 'N/A';
    }
    
    const lastDataset = chartData.datasets[0];
    const lastValue = lastDataset.data[lastDataset.data.length - 1];
    
    return formatCurrency(lastValue);
}

/**
 * Initialize Chart.js instance
 * @param {Object} chartData - Chart data
 * @param {string} chartId - Canvas element ID
 * @returns {Chart} Chart.js instance
 */
export function initializeChart(chartData, chartId = 'portfolio-chart') {
    const canvas = document.getElementById(chartId);
    
    if (!canvas) {
        console.error('❌ Chart canvas not found:', chartId);
        return null;
    }
    
    // Destroy existing chart if any
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    const ctx = canvas.getContext('2d');
    
    const chartConfig = {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    display: false // We use custom legend
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: DASHBOARD_CONFIG.CHART.COLORS.primary,
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += formatCurrency(context.parsed.y);
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: DASHBOARD_CONFIG.CHART.COLORS.grid,
                        borderColor: DASHBOARD_CONFIG.CHART.COLORS.grid
                    },
                    ticks: {
                        color: '#6b7280',
                        maxRotation: 45,
                        minRotation: 0
                    }
                },
                y: {
                    grid: {
                        color: DASHBOARD_CONFIG.CHART.COLORS.grid,
                        borderColor: DASHBOARD_CONFIG.CHART.COLORS.grid
                    },
                    ticks: {
                        color: '#6b7280',
                        callback: function(value) {
                            return formatCurrency(value, false);
                        }
                    }
                }
            }
        }
    };
    
    // Check if Chart is available
    if (typeof Chart === 'undefined') {
        console.error('❌ Chart.js not loaded');
        return null;
    }
    
    try {
        const chart = new Chart(ctx, chartConfig);
        canvas.chart = chart; // Store reference
        return chart;
    } catch (error) {
        console.error('❌ Error initializing chart:', error);
        return null;
    }
}

/**
 * Update existing chart with new data
 * @param {Chart} chart - Chart.js instance
 * @param {Object} newData - New chart data
 */
export function updateChart(chart, newData) {
    if (!chart) {
        console.error('❌ Chart instance is null');
        return;
    }
    
    chart.data.labels = newData.labels;
    chart.data.datasets = newData.datasets;
    chart.update('none'); // Update without animation for better performance
}

/**
 * Render Chart Widget Error State
 * @param {string} errorMessage - Error message to display
 * @returns {string} HTML string for error state
 */
function renderChartError(errorMessage) {
    return `
        <div class="dashboard-widget chart-widget widget-error" id="chart-widget">
            <div class="widget-header">
                <div class="widget-title">
                    <span class="widget-icon">📈</span>
                    <h3>نمودار عملکرد</h3>
                </div>
            </div>
            <div class="widget-content">
                <div class="widget-error-state">
                    <div class="error-icon">⚠️</div>
                    <div class="error-message">${errorMessage}</div>
                    <button class="retry-btn" onclick="window.dashboardModule?.refreshWidget('chart')">
                        تلاش مجدد
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render Chart Widget Loading State
 * @returns {string} HTML string for loading state
 */
export function renderChartLoading() {
    return `
        <div class="dashboard-widget chart-widget widget-loading" id="chart-widget">
            <div class="widget-header">
                <div class="widget-title">
                    <span class="widget-icon">📈</span>
                    <h3>نمودار عملکرد</h3>
                </div>
            </div>
            <div class="widget-content">
                <div class="widget-loading-state">
                    <div class="loading-spinner"></div>
                    <div class="loading-text">${DASHBOARD_CONFIG.LOADING.WIDGET}</div>
                </div>
            </div>
        </div>
    `;
}

export default {
    renderChartWidget,
    renderChartLoading,
    initializeChart,
    updateChart
};
