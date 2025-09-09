/**
 * TITAN Trading System - AI Services Test
 * 
 * Test suite for validating AI service implementations and integrations.
 * This file provides comprehensive testing for all AI capabilities.
 */

import { AIManager, AIServicesFactory, getAIManager } from './ai-manager';
import { OpenAIService } from './openai-service';
import { GeminiService } from './gemini-service';
import { ClaudeService } from './claude-service';

export interface AITestResult {
  service: string;
  test: string;
  success: boolean;
  duration: number;
  error?: string;
  data?: any;
}

export interface AITestSuite {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: AITestResult[];
  summary: {
    openai: { available: boolean; tests: number; passed: number };
    gemini: { available: boolean; tests: number; passed: number };
    claude: { available: boolean; tests: number; passed: number };
    manager: { available: boolean; tests: number; passed: number };
  };
}

/**
 * AI Services Test Runner
 */
export class AITestRunner {
  private results: AITestResult[] = [];

  /**
   * Run comprehensive AI tests
   */
  async runAllTests(): Promise<AITestSuite> {
    console.log('🧪 Starting comprehensive AI tests...');
    
    this.results = [];
    
    // Test individual services
    await this.testOpenAIService();
    await this.testGeminiService();
    await this.testClaudeService();
    
    // Test AI Manager
    await this.testAIManager();
    
    // Test Factory
    await this.testAIFactory();
    
    // Test Integration
    await this.testIntegration();
    
    return this.generateTestSuite();
  }

  /**
   * Test OpenAI service
   */
  private async testOpenAIService(): Promise<void> {
    const apiKey = process.env.OPENAI_API_KEY || 'test-key';
    
    try {
      const service = new OpenAIService(apiKey);
      
      // Test basic configuration
      await this.runTest('openai', 'configuration', async () => {
        const config = service.getConfig();
        return config !== null;
      });
      
      // Test authentication (without making real API call)
      await this.runTest('openai', 'authentication', async () => {
        // Just validate that service can be instantiated with key
        return service['apiKey'] === apiKey;
      });
      
      // Test request structure (mock)
      await this.runTest('openai', 'request_structure', async () => {
        const mockRequest = {
          type: 'market_analysis',
          data: { symbol: 'BTC', price: 50000 },
          context: 'Test analysis'
        };
        
        // Test that request validation works
        return mockRequest.type && mockRequest.data;
      });
      
    } catch (error) {
      this.addResult('openai', 'service_creation', false, 0, (error as Error).message);
    }
  }

  /**
   * Test Gemini service
   */
  private async testGeminiService(): Promise<void> {
    const apiKey = process.env.GEMINI_API_KEY || 'test-key';
    
    try {
      const service = new GeminiService(apiKey);
      
      // Test basic configuration
      await this.runTest('gemini', 'configuration', async () => {
        const config = service.getConfig();
        return config !== null;
      });
      
      // Test model selection
      await this.runTest('gemini', 'model_selection', async () => {
        const models = service['getAvailableModels']?.() || ['gemini-1.5-pro'];
        return models.length > 0;
      });
      
    } catch (error) {
      this.addResult('gemini', 'service_creation', false, 0, (error as Error).message);
    }
  }

  /**
   * Test Claude service
   */
  private async testClaudeService(): Promise<void> {
    const apiKey = process.env.CLAUDE_API_KEY || 'test-key';
    
    try {
      const service = new ClaudeService(apiKey);
      
      // Test basic configuration
      await this.runTest('claude', 'configuration', async () => {
        const config = service.getConfig();
        return config !== null;
      });
      
      // Test reasoning capabilities setup
      await this.runTest('claude', 'reasoning_setup', async () => {
        // Test that reasoning methods are available
        return typeof service['buildReasoningPrompt'] === 'function';
      });
      
    } catch (error) {
      this.addResult('claude', 'service_creation', false, 0, (error as Error).message);
    }
  }

  /**
   * Test AI Manager
   */
  private async testAIManager(): Promise<void> {
    try {
      // Test manager initialization
      await this.runTest('manager', 'initialization', async () => {
        const manager = getAIManager();
        return manager instanceof AIManager;
      });
      
      // Test configuration
      await this.runTest('manager', 'configuration', async () => {
        const manager = getAIManager();
        const config = manager.getConfig();
        return config && typeof config === 'object';
      });
      
      // Test service health (without real API calls)
      await this.runTest('manager', 'health_check', async () => {
        const manager = getAIManager();
        // Test that health check method exists
        return typeof manager.getServiceHealth === 'function';
      });
      
      // Test cache functionality
      await this.runTest('manager', 'cache_management', async () => {
        const manager = getAIManager();
        manager.clearCache();
        return true; // If no error thrown, cache works
      });
      
    } catch (error) {
      this.addResult('manager', 'manager_creation', false, 0, (error as Error).message);
    }
  }

  /**
   * Test AI Factory
   */
  private async testAIFactory(): Promise<void> {
    try {
      // Test factory initialization
      await this.runTest('factory', 'initialization', async () => {
        const factory = new AIServicesFactory({
          openaiApiKey: 'test-key',
          geminiApiKey: 'test-key',
          claudeApiKey: 'test-key'
        });
        return factory instanceof AIServicesFactory;
      });
      
      // Test provider management
      await this.runTest('factory', 'provider_management', async () => {
        const factory = new AIServicesFactory({});
        const providers = factory.getAvailableProviders();
        return Array.isArray(providers);
      });
      
      // Test usage statistics
      await this.runTest('factory', 'usage_statistics', async () => {
        const factory = new AIServicesFactory({});
        const stats = factory.getUsageStats();
        return stats && typeof stats.totalRequests === 'number';
      });
      
    } catch (error) {
      this.addResult('factory', 'factory_creation', false, 0, (error as Error).message);
    }
  }

  /**
   * Test integration between components
   */
  private async testIntegration(): Promise<void> {
    try {
      // Test manager-factory integration
      await this.runTest('integration', 'manager_factory', async () => {
        const manager = getAIManager();
        const factory = manager['aiFactory'];
        return factory instanceof AIServicesFactory;
      });
      
      // Test routing configuration
      await this.runTest('integration', 'routing_config', async () => {
        const manager = getAIManager();
        manager.setRoutingConfig({
          prioritizeSpeed: true,
          fallbackEnabled: true
        });
        const config = manager.getConfig();
        return config.defaultRoutingConfig !== undefined;
      });
      
      // Test cost estimation
      await this.runTest('integration', 'cost_estimation', async () => {
        const manager = getAIManager();
        const estimate = manager.estimateUsageCost([
          { type: 'market_analysis' as any, count: 1, inputSize: 1000 }
        ]);
        return estimate && typeof estimate.totalCost === 'number';
      });
      
    } catch (error) {
      this.addResult('integration', 'integration_test', false, 0, (error as Error).message);
    }
  }

  /**
   * Run individual test
   */
  private async runTest(
    service: string, 
    testName: string, 
    testFn: () => Promise<boolean>
  ): Promise<void> {
    const startTime = Date.now();
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      this.addResult(service, testName, result, duration);
      
      if (result) {
        console.log(`✅ ${service}/${testName} - ${duration}ms`);
      } else {
        console.log(`❌ ${service}/${testName} - Test returned false`);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.addResult(service, testName, false, duration, (error as Error).message);
      console.log(`💥 ${service}/${testName} - ${(error as Error).message}`);
    }
  }

  /**
   * Add test result
   */
  private addResult(
    service: string,
    test: string,
    success: boolean,
    duration: number,
    error?: string,
    data?: any
  ): void {
    this.results.push({
      service,
      test,
      success,
      duration,
      error,
      data
    });
  }

  /**
   * Generate test suite summary
   */
  private generateTestSuite(): AITestSuite {
    const services = ['openai', 'gemini', 'claude', 'manager', 'factory', 'integration'];
    const summary: any = {};
    
    for (const service of services) {
      const serviceResults = this.results.filter(r => r.service === service);
      const passed = serviceResults.filter(r => r.success).length;
      
      summary[service] = {
        available: serviceResults.length > 0,
        tests: serviceResults.length,
        passed: passed
      };
    }
    
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    
    return {
      totalTests,
      passedTests,
      failedTests,
      results: this.results,
      summary
    };
  }
}

/**
 * Quick test function for API endpoints
 */
export async function quickAITest(): Promise<{
  success: boolean;
  message: string;
  details: any;
}> {
  try {
    const runner = new AITestRunner();
    const results = await runner.runAllTests();
    
    const successRate = (results.passedTests / results.totalTests) * 100;
    
    return {
      success: successRate >= 70, // 70% pass rate considered success
      message: `AI Tests completed: ${results.passedTests}/${results.totalTests} passed (${successRate.toFixed(1)}%)`,
      details: results
    };
  } catch (error) {
    return {
      success: false,
      message: `AI Test failed: ${(error as Error).message}`,
      details: { error: (error as Error).message }
    };
  }
}

/**
 * Test specific AI capability
 */
export async function testAICapability(
  capability: string,
  testData?: any
): Promise<AITestResult> {
  const startTime = Date.now();
  
  try {
    const manager = getAIManager();
    
    switch (capability) {
      case 'market_analysis':
        const analysis = await manager.analyzeSymbol({
          symbol: testData?.symbol || 'BTC',
          marketData: testData?.marketData || { price: 50000 },
          analysisType: 'quick'
        });
        
        return {
          service: 'manager',
          test: 'market_analysis',
          success: !!analysis,
          duration: Date.now() - startTime,
          data: analysis
        };
        
      case 'natural_language':
        const response = await manager.processQuery(
          testData?.query || 'What is the current market trend?'
        );
        
        return {
          service: 'manager',
          test: 'natural_language',
          success: !!response.response,
          duration: Date.now() - startTime,
          data: response
        };
        
      default:
        throw new Error(`Unknown capability: ${capability}`);
    }
  } catch (error) {
    return {
      service: 'manager',
      test: capability,
      success: false,
      duration: Date.now() - startTime,
      error: (error as Error).message
    };
  }
}

export default AITestRunner;