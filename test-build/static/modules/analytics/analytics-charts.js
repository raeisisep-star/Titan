/**
 * TITAN Analytics Charts - Advanced Visualization Components
 * Comprehensive chart system for analytics dashboard with Chart.js integration
 */

class TitanAnalyticsCharts {
    constructor() {
        this.charts = new Map();
        this.chartInstances = new Map();
        this.defaultOptions = this.getDefaultChartOptions();
        this.colors = this.getColorPalette();
        this.isInitialized = false;
        
        console.log('📊 TITAN Analytics Charts initialized');
    }

    // Initialize Chart.js library
    async initialize() {
        if (this.isInitialized) return;
        
        // Ensure Chart.js is loaded
        if (typeof Chart === 'undefined') {
            console.warn('⚠️ Chart.js not loaded, using fallback visualization');
            return false;
        }
        
        // Configure Chart.js defaults
        Chart.defaults.color = '#e5e7eb';
        Chart.defaults.borderColor = '#374151';
        Chart.defaults.backgroundColor = '#1f2937';
        Chart.defaults.font.family = 'Inter, system-ui, sans-serif';
        
        this.isInitialized = true;
        console.log('✅ Chart.js configured successfully');
        return true;
    }

    // Get color palette for charts
    getColorPalette() {
        return {
            primary: ['#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a'],
            success: ['#10b981', '#059669', '#047857', '#065f46'],
            warning: ['#f59e0b', '#d97706', '#b45309', '#92400e'],
            danger: ['#ef4444', '#dc2626', '#b91c1c', '#991b1b'],
            purple: ['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6'],
            indigo: ['#6366f1', '#4f46e5', '#4338ca', '#3730a3'],
            pink: ['#ec4899', '#db2777', '#be185d', '#9d174d'],
            gray: ['#6b7280', '#4b5563', '#374151', '#1f2937'],
            gradient: {
                blue: ['rgba(59, 130, 246, 0.8)', 'rgba(59, 130, 246, 0.1)'],
                green: ['rgba(16, 185, 129, 0.8)', 'rgba(16, 185, 129, 0.1)'],
                purple: ['rgba(139, 92, 246, 0.8)', 'rgba(139, 92, 246, 0.1)'],
                red: ['rgba(239, 68, 68, 0.8)', 'rgba(239, 68, 68, 0.1)']
            }
        };
    }

    // Get default chart options
    getDefaultChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(31, 41, 55, 0.9)',
                    titleColor: '#f3f4f6',
                    bodyColor: '#e5e7eb',
                    borderColor: '#6b7280',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        title: function(tooltipItems) {
                            return tooltipItems[0]?.label || '';
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(107, 114, 128, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#9ca3af',
                        font: {
                            size: 11
                        }
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(107, 114, 128, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#9ca3af',
                        font: {
                            size: 11
                        }
                    }
                }
            }
        };
    }

    // Create performance overview chart
    createPerformanceChart(containerId, data) {
        const ctx = document.getElementById(containerId)?.getContext('2d');
        if (!ctx) {
            console.error(`❌ Canvas element not found: ${containerId}`);
            return null;
        }

        // Destroy existing chart if it exists
        if (this.chartInstances.has(containerId)) {
            this.chartInstances.get(containerId).destroy();
        }

        const chartData = {
            labels: data.labels || this.generateTimeLabels(24),
            datasets: [{
                label: 'دقت کلی',
                data: data.accuracy || this.generateSampleData(24, 85, 95),
                borderColor: this.colors.primary[0],
                backgroundColor: this.createGradient(ctx, this.colors.gradient.blue),
                tension: 0.4,
                fill: true,
                pointRadius: 3,
                pointHoverRadius: 6
            }, {
                label: 'کارایی',
                data: data.efficiency || this.generateSampleData(24, 80, 92),
                borderColor: this.colors.success[0],
                backgroundColor: this.createGradient(ctx, this.colors.gradient.green),
                tension: 0.4,
                fill: true,
                pointRadius: 3,
                pointHoverRadius: 6
            }, {
                label: 'قابلیت اطمینان',
                data: data.reliability || this.generateSampleData(24, 88, 98),
                borderColor: this.colors.purple[0],
                backgroundColor: this.createGradient(ctx, this.colors.gradient.purple),
                tension: 0.4,
                fill: true,
                pointRadius: 3,
                pointHoverRadius: 6
            }]
        };

        const options = {
            ...this.defaultOptions,
            plugins: {
                ...this.defaultOptions.plugins,
                title: {
                    display: true,
                    text: 'روند عملکرد سیستم',
                    color: '#f3f4f6',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: 20
                }
            },
            scales: {
                ...this.defaultOptions.scales,
                y: {
                    ...this.defaultOptions.scales.y,
                    min: 0,
                    max: 100,
                    ticks: {
                        ...this.defaultOptions.scales.y.ticks,
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        };

        const chart = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: options
        });

        this.chartInstances.set(containerId, chart);
        return chart;
    }

    // Create accuracy distribution chart
    createAccuracyChart(containerId, data) {
        const ctx = document.getElementById(containerId)?.getContext('2d');
        if (!ctx) {
            console.error(`❌ Canvas element not found: ${containerId}`);
            return null;
        }

        if (this.chartInstances.has(containerId)) {
            this.chartInstances.get(containerId).destroy();
        }

        const chartData = {
            labels: ['عالی (>90%)', 'خوب (80-90%)', 'متوسط (70-80%)', 'ضعیف (<70%)'],
            datasets: [{
                data: data.distribution || [8, 5, 2, 0],
                backgroundColor: [
                    this.colors.success[0],
                    this.colors.primary[0],
                    this.colors.warning[0],
                    this.colors.danger[0]
                ],
                borderColor: [
                    this.colors.success[1],
                    this.colors.primary[1],
                    this.colors.warning[1],
                    this.colors.danger[1]
                ],
                borderWidth: 2,
                hoverOffset: 4
            }]
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        font: {
                            size: 11
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'توزیع دقت ایجنت‌ها',
                    color: '#f3f4f6',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: 20
                },
                tooltip: {
                    backgroundColor: 'rgba(31, 41, 55, 0.9)',
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} ایجنت (${percentage}%)`;
                        }
                    }
                }
            }
        };

        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: chartData,
            options: options
        });

        this.chartInstances.set(containerId, chart);
        return chart;
    }

    // Create agent comparison chart
    createAgentComparisonChart(containerId, data) {
        const ctx = document.getElementById(containerId)?.getContext('2d');
        if (!ctx) {
            console.error(`❌ Canvas element not found: ${containerId}`);
            return null;
        }

        if (this.chartInstances.has(containerId)) {
            this.chartInstances.get(containerId).destroy();
        }

        const agents = data.agents || [
            'تحلیل‌گر بازار', 'پیش‌بین روند', 'ارزیاب ریسک', 'بهینه‌ساز پرتفولیو',
            'تحلیل‌گر اخبار', 'تحلیل‌گر تکنیکال', 'تحلیل‌گر بنیادی', 'نظارت‌گر رسانه'
        ];

        const chartData = {
            labels: agents,
            datasets: [{
                label: 'دقت (%)',
                data: data.accuracy || this.generateSampleData(agents.length, 75, 95),
                backgroundColor: this.colors.primary[0],
                borderColor: this.colors.primary[1],
                borderWidth: 1
            }, {
                label: 'کارایی (%)',
                data: data.efficiency || this.generateSampleData(agents.length, 70, 90),
                backgroundColor: this.colors.success[0],
                borderColor: this.colors.success[1],
                borderWidth: 1
            }, {
                label: 'قابلیت اطمینان (%)',
                data: data.reliability || this.generateSampleData(agents.length, 80, 98),
                backgroundColor: this.colors.purple[0],
                borderColor: this.colors.purple[1],
                borderWidth: 1
            }]
        };

        const options = {
            ...this.defaultOptions,
            indexAxis: 'y',
            plugins: {
                ...this.defaultOptions.plugins,
                title: {
                    display: true,
                    text: 'مقایسه عملکرد ایجنت‌ها',
                    color: '#f3f4f6',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: 20
                }
            },
            scales: {
                x: {
                    ...this.defaultOptions.scales.x,
                    min: 0,
                    max: 100,
                    ticks: {
                        ...this.defaultOptions.scales.x.ticks,
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                y: {
                    ...this.defaultOptions.scales.y,
                    ticks: {
                        ...this.defaultOptions.scales.y.ticks,
                        font: {
                            size: 10
                        }
                    }
                }
            }
        };

        const chart = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: options
        });

        this.chartInstances.set(containerId, chart);
        return chart;
    }

    // Create learning progress chart
    createLearningProgressChart(containerId, data) {
        const ctx = document.getElementById(containerId)?.getContext('2d');
        if (!ctx) {
            console.error(`❌ Canvas element not found: ${containerId}`);
            return null;
        }

        if (this.chartInstances.has(containerId)) {
            this.chartInstances.get(containerId).destroy();
        }

        const chartData = {
            labels: data.labels || this.generateTimeLabels(30, 'daily'),
            datasets: [{
                label: 'ساعت یادگیری روزانه',
                data: data.learningHours || this.generateSampleData(30, 2, 8),
                backgroundColor: this.colors.indigo[0],
                borderColor: this.colors.indigo[1],
                borderWidth: 1,
                yAxisID: 'y'
            }, {
                label: 'بهبود دقت (%)',
                data: data.accuracyImprovement || this.generateSampleData(30, -1, 3),
                type: 'line',
                borderColor: this.colors.success[0],
                backgroundColor: this.colors.success[0],
                tension: 0.4,
                pointRadius: 4,
                yAxisID: 'y1'
            }]
        };

        const options = {
            ...this.defaultOptions,
            plugins: {
                ...this.defaultOptions.plugins,
                title: {
                    display: true,
                    text: 'پیشرفت یادگیری و بهبود',
                    color: '#f3f4f6',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: 20
                }
            },
            scales: {
                x: this.defaultOptions.scales.x,
                y: {
                    ...this.defaultOptions.scales.y,
                    type: 'linear',
                    display: true,
                    position: 'left',
                    min: 0,
                    ticks: {
                        ...this.defaultOptions.scales.y.ticks,
                        callback: function(value) {
                            return value + 'h';
                        }
                    }
                },
                y1: {
                    ...this.defaultOptions.scales.y,
                    type: 'linear',
                    display: true,
                    position: 'right',
                    ticks: {
                        ...this.defaultOptions.scales.y.ticks,
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        };

        const chart = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: options
        });

        this.chartInstances.set(containerId, chart);
        return chart;
    }

    // Create market correlation heatmap
    createCorrelationHeatmap(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`❌ Container element not found: ${containerId}`);
            return null;
        }

        // Create heatmap using HTML/CSS since Chart.js doesn't have native heatmap
        const correlationData = data.correlationMatrix || this.generateCorrelationMatrix();
        const agents = data.agents || [
            'بازار', 'روند', 'ریسک', 'پرتفولیو', 'اخبار', 'تکنیکال', 'بنیادی', 'رسانه'
        ];

        let heatmapHTML = `
            <div class="correlation-heatmap">
                <div class="heatmap-title">ماتریس همبستگی ایجنت‌ها</div>
                <div class="heatmap-grid" style="display: grid; grid-template-columns: 80px repeat(${agents.length}, 1fr); gap: 1px; font-size: 10px;">
                    <div></div>
        `;

        // Column headers
        agents.forEach(agent => {
            heatmapHTML += `<div class="heatmap-header" style="padding: 4px; text-align: center; background: #374151; color: #e5e7eb; font-weight: bold;">${agent}</div>`;
        });

        // Data rows
        agents.forEach((rowAgent, i) => {
            heatmapHTML += `<div class="heatmap-header" style="padding: 4px; text-align: center; background: #374151; color: #e5e7eb; font-weight: bold;">${rowAgent}</div>`;
            
            agents.forEach((colAgent, j) => {
                const correlation = correlationData[i][j];
                const intensity = Math.abs(correlation);
                const color = correlation >= 0 
                    ? `rgba(16, 185, 129, ${intensity})` 
                    : `rgba(239, 68, 68, ${intensity})`;
                
                heatmapHTML += `
                    <div class="heatmap-cell" 
                         style="background-color: ${color}; padding: 4px; text-align: center; color: white; font-weight: bold;"
                         title="${rowAgent} vs ${colAgent}: ${correlation.toFixed(2)}">
                        ${correlation.toFixed(2)}
                    </div>
                `;
            });
        });

        heatmapHTML += `
                </div>
                <div class="heatmap-legend" style="margin-top: 10px; display: flex; justify-content: center; align-items: center; gap: 10px; font-size: 11px; color: #9ca3af;">
                    <span>همبستگی منفی</span>
                    <div style="display: flex; gap: 2px;">
                        <div style="width: 12px; height: 12px; background: rgba(239, 68, 68, 1);"></div>
                        <div style="width: 12px; height: 12px; background: rgba(239, 68, 68, 0.5);"></div>
                        <div style="width: 12px; height: 12px; background: rgba(107, 114, 128, 0.3);"></div>
                        <div style="width: 12px; height: 12px; background: rgba(16, 185, 129, 0.5);"></div>
                        <div style="width: 12px; height: 12px; background: rgba(16, 185, 129, 1);"></div>
                    </div>
                    <span>همبستگی مثبت</span>
                </div>
            </div>
        `;

        container.innerHTML = heatmapHTML;
        return container;
    }

    // Create predictive analytics chart
    createPredictionChart(containerId, data) {
        const ctx = document.getElementById(containerId)?.getContext('2d');
        if (!ctx) {
            console.error(`❌ Canvas element not found: ${containerId}`);
            return null;
        }

        if (this.chartInstances.has(containerId)) {
            this.chartInstances.get(containerId).destroy();
        }

        const historical = data.historical || this.generateSampleData(30, 80, 90);
        const predictions = data.predictions || this.generateSampleData(15, 82, 92);
        const confidence = data.confidence || this.generateSampleData(15, 70, 90);

        const allLabels = [
            ...this.generateTimeLabels(30, 'daily'),
            ...this.generateTimeLabels(15, 'daily', new Date(Date.now() + 24 * 60 * 60 * 1000))
        ];

        const chartData = {
            labels: allLabels,
            datasets: [{
                label: 'داده‌های تاریخی',
                data: [...historical, ...new Array(15).fill(null)],
                borderColor: this.colors.primary[0],
                backgroundColor: this.colors.primary[0],
                tension: 0.4,
                pointRadius: 2
            }, {
                label: 'پیش‌بینی',
                data: [...new Array(30).fill(null), ...predictions],
                borderColor: this.colors.warning[0],
                backgroundColor: this.colors.warning[0],
                borderDash: [5, 5],
                tension: 0.4,
                pointRadius: 3
            }, {
                label: 'محدوده اطمینان',
                data: [...new Array(30).fill(null), ...confidence.map((c, i) => predictions[i] + (c - 80) * 0.2)],
                borderColor: this.colors.gray[0],
                backgroundColor: 'rgba(107, 114, 128, 0.1)',
                fill: '+1',
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 1
            }, {
                label: '',
                data: [...new Array(30).fill(null), ...confidence.map((c, i) => predictions[i] - (c - 80) * 0.2)],
                borderColor: this.colors.gray[0],
                backgroundColor: 'rgba(107, 114, 128, 0.1)',
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 1
            }]
        };

        const options = {
            ...this.defaultOptions,
            plugins: {
                ...this.defaultOptions.plugins,
                title: {
                    display: true,
                    text: 'پیش‌بینی عملکرد آینده',
                    color: '#f3f4f6',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: 20
                },
                legend: {
                    ...this.defaultOptions.plugins.legend,
                    filter: function(item) {
                        return item.text !== '';
                    }
                }
            },
            scales: {
                ...this.defaultOptions.scales,
                y: {
                    ...this.defaultOptions.scales.y,
                    ticks: {
                        ...this.defaultOptions.scales.y.ticks,
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        };

        const chart = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: options
        });

        this.chartInstances.set(containerId, chart);
        return chart;
    }

    // Create real-time metrics dashboard
    createRealTimeMetrics(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`❌ Container element not found: ${containerId}`);
            return null;
        }

        const metrics = data.metrics || {
            cpu: 24.5,
            memory: 68.2,
            network: 156.7,
            responses: 234,
            errors: 3,
            uptime: 99.8
        };

        const metricsHTML = `
            <div class="real-time-metrics">
                <div class="metrics-title" style="text-align: center; color: #f3f4f6; font-size: 16px; font-weight: bold; margin-bottom: 20px;">
                    متریک‌های بلادرنگ سیستم
                </div>
                <div class="metrics-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px;">
                    ${this.createMetricCard('CPU', metrics.cpu, '%', 'primary')}
                    ${this.createMetricCard('حافظه', metrics.memory, '%', 'success')}
                    ${this.createMetricCard('شبکه', metrics.network, 'MB/s', 'indigo')}
                    ${this.createMetricCard('پاسخ‌ها', metrics.responses, 'ms', 'warning')}
                    ${this.createMetricCard('خطاها', metrics.errors, '', 'danger')}
                    ${this.createMetricCard('آپتایم', metrics.uptime, '%', 'purple')}
                </div>
            </div>
        `;

        container.innerHTML = metricsHTML;
        return container;
    }

    // Create metric card HTML
    createMetricCard(title, value, unit, colorType) {
        const colors = {
            primary: '#3b82f6',
            success: '#10b981', 
            warning: '#f59e0b',
            danger: '#ef4444',
            purple: '#8b5cf6',
            indigo: '#6366f1'
        };

        return `
            <div class="metric-card" style="
                background: linear-gradient(135deg, ${colors[colorType]}20, ${colors[colorType]}10);
                border: 1px solid ${colors[colorType]}40;
                border-radius: 8px;
                padding: 15px;
                text-align: center;
                transition: transform 0.2s ease;
            ">
                <div style="color: ${colors[colorType]}; font-size: 11px; font-weight: 600; margin-bottom: 8px; text-transform: uppercase;">
                    ${title}
                </div>
                <div style="color: #f3f4f6; font-size: 20px; font-weight: bold; margin-bottom: 4px;">
                    ${typeof value === 'number' ? value.toFixed(1) : value}
                </div>
                <div style="color: #9ca3af; font-size: 10px;">
                    ${unit}
                </div>
            </div>
        `;
    }

    // Create gradient for line chart backgrounds
    createGradient(ctx, colors) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(1, colors[1]);
        return gradient;
    }

    // Generate sample data for charts
    generateSampleData(points, min = 0, max = 100) {
        const data = [];
        let current = min + (max - min) * 0.7; // Start near upper range
        
        for (let i = 0; i < points; i++) {
            // Add some realistic variance
            const variance = (max - min) * 0.1;
            const change = (Math.random() - 0.5) * variance;
            current = Math.max(min, Math.min(max, current + change));
            data.push(parseFloat(current.toFixed(1)));
        }
        
        return data;
    }

    // Generate time labels for charts
    generateTimeLabels(count, interval = 'hourly', startDate = new Date()) {
        const labels = [];
        const date = new Date(startDate);
        
        const intervalMs = {
            hourly: 60 * 60 * 1000,
            daily: 24 * 60 * 60 * 1000,
            weekly: 7 * 24 * 60 * 60 * 1000
        };
        
        const step = intervalMs[interval] || intervalMs.hourly;
        
        for (let i = count - 1; i >= 0; i--) {
            const labelDate = new Date(date.getTime() - (i * step));
            
            if (interval === 'hourly') {
                labels.push(labelDate.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }));
            } else if (interval === 'daily') {
                labels.push(labelDate.toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' }));
            } else {
                labels.push(labelDate.toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' }));
            }
        }
        
        return labels;
    }

    // Generate correlation matrix
    generateCorrelationMatrix(size = 8) {
        const matrix = [];
        
        for (let i = 0; i < size; i++) {
            matrix[i] = [];
            for (let j = 0; j < size; j++) {
                if (i === j) {
                    matrix[i][j] = 1.0; // Perfect correlation with self
                } else if (j < i) {
                    matrix[i][j] = matrix[j][i]; // Symmetric matrix
                } else {
                    // Generate realistic correlation values
                    const correlation = (Math.random() - 0.5) * 1.6; // -0.8 to 0.8
                    matrix[i][j] = Math.max(-1, Math.min(1, correlation));
                }
            }
        }
        
        return matrix;
    }

    // Update chart with new data
    updateChart(containerId, newData) {
        const chart = this.chartInstances.get(containerId);
        if (!chart) {
            console.warn(`⚠️ Chart not found: ${containerId}`);
            return false;
        }
        
        try {
            // Update data
            if (newData.labels) {
                chart.data.labels = newData.labels;
            }
            
            if (newData.datasets) {
                newData.datasets.forEach((dataset, index) => {
                    if (chart.data.datasets[index]) {
                        Object.assign(chart.data.datasets[index], dataset);
                    }
                });
            }
            
            // Update chart
            chart.update('none'); // Use 'none' for instant update, 'active' for animation
            return true;
        } catch (error) {
            console.error(`❌ Failed to update chart ${containerId}:`, error);
            return false;
        }
    }

    // Destroy specific chart
    destroyChart(containerId) {
        const chart = this.chartInstances.get(containerId);
        if (chart) {
            chart.destroy();
            this.chartInstances.delete(containerId);
            console.log(`🗑️ Chart destroyed: ${containerId}`);
        }
    }

    // Destroy all charts
    destroyAllCharts() {
        this.chartInstances.forEach((chart, containerId) => {
            chart.destroy();
            console.log(`🗑️ Chart destroyed: ${containerId}`);
        });
        this.chartInstances.clear();
    }

    // Get chart instance
    getChart(containerId) {
        return this.chartInstances.get(containerId);
    }

    // Get all chart instances
    getAllCharts() {
        return Array.from(this.chartInstances.entries());
    }

    // Resize charts (useful for responsive layouts)
    resizeCharts() {
        this.chartInstances.forEach(chart => {
            chart.resize();
        });
    }

    // Export chart as image
    exportChart(containerId, filename = 'chart') {
        const chart = this.chartInstances.get(containerId);
        if (!chart) {
            console.warn(`⚠️ Chart not found for export: ${containerId}`);
            return null;
        }
        
        try {
            const url = chart.toBase64Image();
            
            // Create download link
            const link = document.createElement('a');
            link.download = `${filename}.png`;
            link.href = url;
            link.click();
            
            return url;
        } catch (error) {
            console.error(`❌ Failed to export chart ${containerId}:`, error);
            return null;
        }
    }
}

// Export the charts class
window.TitanAnalyticsCharts = TitanAnalyticsCharts;

// Auto-initialize if in browser environment
if (typeof window !== 'undefined' && window.document) {
    console.log('📊 TITAN Analytics Charts ready for initialization');
}