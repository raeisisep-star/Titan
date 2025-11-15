/**
 * Lazy Loader Utility
 * 🎯 TITAN Platform - Performance Optimization
 * Version: 2.0.0
 * 
 * Provides lazy loading functionality for:
 * - Chart.js library
 * - Heavy widgets
 * - Images and assets
 * - Intersection Observer API for viewport detection
 */

/**
 * Lazy load Chart.js library
 * @returns {Promise<boolean>} True if loaded successfully
 */
export async function lazyLoadChartJS() {
    // Check if already loaded
    if (typeof Chart !== 'undefined') {
        console.log('✅ [LazyLoader] Chart.js already loaded');
        return true;
    }
    
    console.log('⏳ [LazyLoader] Loading Chart.js...');
    
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
        script.async = true;
        
        script.onload = () => {
            console.log('✅ [LazyLoader] Chart.js loaded successfully');
            resolve(true);
        };
        
        script.onerror = (error) => {
            console.error('❌ [LazyLoader] Failed to load Chart.js:', error);
            reject(error);
        };
        
        document.head.appendChild(script);
    });
}

/**
 * Intersection Observer for lazy rendering
 * @param {HTMLElement} element - Element to observe
 * @param {Function} callback - Callback when element is visible
 * @param {Object} options - Observer options
 */
export function observeElement(element, callback, options = {}) {
    const defaultOptions = {
        root: null,
        rootMargin: '50px', // Start loading 50px before visible
        threshold: 0.1
    };
    
    const observerOptions = { ...defaultOptions, ...options };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                callback(entry.target);
                observer.unobserve(entry.target); // Stop observing after first trigger
            }
        });
    }, observerOptions);
    
    observer.observe(element);
    
    return observer;
}

/**
 * Debounce function for performance
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
    let timeout;
    
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function for performance
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {Function} Throttled function
 */
export function throttle(func, limit = 300) {
    let inThrottle;
    
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
}

/**
 * Request Idle Callback wrapper
 * Runs task when browser is idle
 * @param {Function} callback - Task to run
 * @param {Object} options - Options
 */
export function runWhenIdle(callback, options = {}) {
    if ('requestIdleCallback' in window) {
        requestIdleCallback(callback, options);
    } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(callback, 1);
    }
}

/**
 * Lazy load images with srcset support
 * @param {HTMLImageElement} img - Image element
 */
export function lazyLoadImage(img) {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;
    
    if (!src) return;
    
    // Use Intersection Observer for images
    observeElement(img, (element) => {
        if (src) {
            element.src = src;
        }
        if (srcset) {
            element.srcset = srcset;
        }
        element.classList.add('loaded');
    });
}

/**
 * Preload critical resources
 * @param {Array<string>} urls - URLs to preload
 * @param {string} type - Resource type (script, style, image)
 */
export function preloadResources(urls, type = 'script') {
    urls.forEach(url => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = url;
        
        if (type === 'script') {
            link.as = 'script';
        } else if (type === 'style') {
            link.as = 'style';
        } else if (type === 'image') {
            link.as = 'image';
        }
        
        document.head.appendChild(link);
    });
}

/**
 * Measure performance timing
 * @param {string} label - Performance mark label
 * @param {Function} callback - Function to measure
 */
export async function measurePerformance(label, callback) {
    const startMark = `${label}-start`;
    const endMark = `${label}-end`;
    const measureName = `${label}-measure`;
    
    performance.mark(startMark);
    
    const result = await callback();
    
    performance.mark(endMark);
    performance.measure(measureName, startMark, endMark);
    
    const measure = performance.getEntriesByName(measureName)[0];
    console.log(`⏱️ [Performance] ${label}: ${measure.duration.toFixed(2)}ms`);
    
    return result;
}

export default {
    lazyLoadChartJS,
    observeElement,
    debounce,
    throttle,
    runWhenIdle,
    lazyLoadImage,
    preloadResources,
    measurePerformance
};
