# 🤖 راهنمای یکپارچه‌سازی AI Agents با ماژول‌های جدید

## 📦 ماژول‌های جدید ایجاد شده

### 1. `ai-api.js` - لایه API مرکزی
مدیریت تمام فراخوانی‌های API به agents با error handling مناسب.

### 2. `ai-adapters.js` - لایه Adapter
Normalize کردن data از backend به فرمت مورد انتظار frontend.

---

## 🔧 نحوه استفاده

### قبل (کد قدیمی):
```javascript
// در ai-management.js - showAgent01Details()
async showAgent01Details() {
    try {
        const response = await axios.get(`/api/ai/agents/1/status`);
        const status = response.data;
        
        // ❌ مستقیم به فیلدها دسترسی (TypeError اگر null باشد)
        const rsi = status.indicators.rsi;
        const macd = status.indicators.macd;
        // ...
    } catch (error) {
        // ❌ خطای 404 را handle نمی‌کند
        console.error(error);
    }
}
```

### بعد (کد جدید با ماژول‌ها):
```javascript
// در ai-management.js - showAgent01Details()
async showAgent01Details() {
    try {
        // ✅ استفاده از API مرکزی
        const block = await window.TITAN_AI_API.fetchAgentBlock(1);
        
        // ✅ چک کردن availability
        if (!block.available) {
            this.renderAgentNotAvailable(1, 'Agent 01: Technical Analysis');
            return;
        }
        
        // ✅ استفاده از Adapter
        const status = window.TITAN_AI_ADAPTERS.adaptAgentStatus(1, block.status);
        
        if (!status) {
            this.renderAgentNoData(1);
            return;
        }
        
        // ✅ Safe access با helper functions
        const { safeRender, safeFormatNumber } = window.TITAN_AI_ADAPTERS;
        
        const rsi = safeRender(status.indicators?.rsi, 'N/A');
        const macd = safeRender(status.indicators?.macd, 'N/A');
        
        // Render UI با safe data
        this.renderAgent01UI(status);
        
    } catch (error) {
        console.error('Agent 01 error:', error);
        this.renderAgentError(1, error.message);
    }
}
```

---

## 📊 مثال کامل برای Agent 01

```javascript
async showAgent01Details() {
    const agentId = 1;
    const agentName = 'Technical Analysis';
    
    try {
        // 1. Fetch data با API مرکزی
        const block = await window.TITAN_AI_API.fetchAgentBlock(agentId);
        
        // 2. Check availability
        if (!block.available) {
            if (!block.installed) {
                // Agent نصب نیست
                this.modal.innerHTML = `
                    <div class="text-center py-8">
                        <div class="text-6xl mb-4">🚧</div>
                        <h3 class="text-xl font-bold mb-2">Agent ${agentId} Not Installed</h3>
                        <p class="text-gray-400 mb-4">${agentName} is not currently installed.</p>
                        <button class="bg-blue-600 px-6 py-2 rounded" onclick="installAgent(${agentId})">
                            Install Agent
                        </button>
                    </div>
                `;
            } else {
                // Agent نصب است ولی available نیست
                this.modal.innerHTML = `
                    <div class="text-center py-8">
                        <div class="text-6xl mb-4">⚠️</div>
                        <h3 class="text-xl font-bold mb-2">Agent ${agentId} Unavailable</h3>
                        <p class="text-gray-400">${agentName} encountered an error.</p>
                    </div>
                `;
            }
            return;
        }
        
        // 3. Adapt data
        const status = window.TITAN_AI_ADAPTERS.adaptAgentStatus(agentId, block.status);
        
        if (!status) {
            this.modal.innerHTML = `<div class="text-center py-8">No data available</div>`;
            return;
        }
        
        // 4. Safe rendering با helpers
        const { safeRender, safeFormatNumber, safeFormatPercent } = window.TITAN_AI_ADAPTERS;
        
        // 5. Render UI
        this.modal.innerHTML = `
            <div class="space-y-4">
                <h3 class="text-xl font-bold mb-4">📊 ${agentName}</h3>
                
                <!-- RSI Indicator -->
                <div class="bg-gray-800 p-4 rounded">
                    <h4 class="font-semibold mb-2">RSI (Relative Strength Index)</h4>
                    <div class="text-3xl font-bold">
                        ${safeFormatNumber(status.indicators?.rsi)}
                    </div>
                    ${status.indicators?.rsi ? `
                        <div class="mt-2">
                            <div class="h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div class="h-full bg-blue-500" 
                                     style="width: ${Math.min(status.indicators.rsi, 100)}%">
                                </div>
                            </div>
                        </div>
                    ` : '<p class="text-gray-500 text-sm mt-2">Data not available</p>'}
                </div>
                
                <!-- MACD Indicator -->
                <div class="bg-gray-800 p-4 rounded">
                    <h4 class="font-semibold mb-2">MACD</h4>
                    <div class="text-2xl">
                        ${safeRender(status.indicators?.macd, 'N/A')}
                    </div>
                </div>
                
                <!-- Signals -->
                <div class="bg-gray-800 p-4 rounded">
                    <h4 class="font-semibold mb-2">Signals</h4>
                    ${status.signals && status.signals.length > 0 ? `
                        <ul class="space-y-2">
                            ${status.signals.map(signal => `
                                <li class="flex items-center gap-2">
                                    <span class="text-${signal.type === 'buy' ? 'green' : 'red'}-400">
                                        ${signal.type === 'buy' ? '📈' : '📉'}
                                    </span>
                                    <span>${signal.message}</span>
                                </li>
                            `).join('')}
                        </ul>
                    ` : '<p class="text-gray-500">No signals</p>'}
                </div>
                
                <!-- Trend -->
                <div class="bg-gray-800 p-4 rounded">
                    <h4 class="font-semibold mb-2">Trend</h4>
                    <div class="text-xl">
                        ${safeRender(status.trend, 'Unknown').toUpperCase()}
                    </div>
                </div>
                
                <!-- Last Update -->
                <div class="text-sm text-gray-400 text-center mt-4">
                    Last Update: ${safeRender(status.lastUpdate, 'N/A')}
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error(`Agent ${agentId} error:`, error);
        this.modal.innerHTML = `
            <div class="text-center py-8 text-red-400">
                <div class="text-4xl mb-2">❌</div>
                <p>Error loading agent data</p>
                <p class="text-sm mt-2">${error.message}</p>
            </div>
        `;
    }
}
```

---

## 🎯 Pattern برای Agents 5-10 (404 میدهند)

```javascript
async showAgent05Details() {
    const agentId = 5;
    const agentName = 'Market Making';
    
    const block = await window.TITAN_AI_API.fetchAgentBlock(agentId);
    
    if (!block.available) {
        // این agents هنوز backend ندارند
        this.modal.innerHTML = `
            <div class="text-center py-8">
                <div class="text-6xl mb-4">🚧</div>
                <h3 class="text-xl font-bold mb-2">${agentName}</h3>
                <p class="text-gray-400 mb-4">Coming Soon</p>
                <p class="text-sm text-gray-500">
                    This agent is under development and will be available in a future update.
                </p>
            </div>
        `;
        return;
    }
    
    // اگر available شد، data را نمایش بده
    // ...
}
```

---

## 📝 Checklist برای هر Agent

- [ ] استفاده از `TITAN_AI_API.fetchAgentBlock()`
- [ ] چک کردن `block.available`
- [ ] استفاده از `TITAN_AI_ADAPTERS.adaptAgentStatus()`
- [ ] استفاده از `safeRender`, `safeFormatNumber`, `safeFormatPercent`
- [ ] نمایش UI مناسب برای Not Available
- [ ] نمایش UI مناسب برای No Data
- [ ] Error handling با try/catch

---

## 🚀 اقدامات بعدی

### 1. به‌روزرسانی ai-management.js:
```bash
# برای هر متد showAgentXXDetails:
# 1. جایگزین کردن axios.get با TITAN_AI_API.fetchAgentBlock
# 2. اضافه کردن چک availability
# 3. استفاده از adaptAgentStatus
# 4. استفاده از safe helpers
```

### 2. تست هر Agent:
```javascript
// در Console:
await window.TITAN_AI_API.fetchAgentBlock(1);
await window.TITAN_AI_API.fetchAgentBlock(5); // should return available:false
```

### 3. بررسی Backend:
- چک کنید agents 5-10 چه route هایی دارند
- اگر ندارند، در UI "Coming Soon" نمایش دهید
- اگر دارند ولی با نام متفاوت، در ai-api.js مسیر را تطبیق دهید

---

## 🎓 Best Practices

1. **همیشه availability چک کنید**:
   ```javascript
   if (!block.available) { /* show placeholder */ return; }
   ```

2. **از safe helpers استفاده کنید**:
   ```javascript
   safeRender(value, 'N/A')
   safeFormatNumber(value, 2, 'N/A')
   ```

3. **Error handling**:
   ```javascript
   try { /* ... */ } catch (e) { /* graceful fallback */ }
   ```

4. **Console logging**:
   ```javascript
   console.log(`✅ Agent ${id} loaded`);
   console.warn(`⚠️ Agent ${id} no data`);
   console.error(`❌ Agent ${id} error:`, error);
   ```

---

**Status**: ✅ Modules Created & Ready
**Next**: Update ai-management.js to use new modules
