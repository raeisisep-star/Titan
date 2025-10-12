/**
 * ArtemisService Rebuild Test Suite
 * Phase 1.4 Functionality Validation
 */

const testMessages = [
  // Navigation commands
  { message: 'داشبورد', category: 'navigation', expected_action: 'navigate' },
  { message: 'dashboard', category: 'navigation', expected_action: 'navigate' },
  
  // Portfolio commands
  { message: 'پورتفولیو', category: 'portfolio', expected_contains: 'پورتفولیو' },
  { message: 'نمایش پورتفولیو', category: 'portfolio', expected_contains: 'بارگذاری' },
  { message: 'تحلیل عملکرد', category: 'portfolio', expected_contains: 'تحلیل' },
  
  // Trading commands
  { message: 'معامله دستی', category: 'trading', expected_contains: 'دستی' },
  { message: 'اتوپایلوت', category: 'trading', expected_contains: 'اتوپایلوت' },
  { message: 'استراتژی', category: 'trading', expected_contains: 'استراتژی' },
  { message: 'سیگنال', category: 'trading_signal', expected_contains: 'سیگنال' },
  
  // Settings commands  
  { message: 'تنظیمات', category: 'settings', expected_contains: 'تنظیمات' },
  { message: 'تنظیمات صرافی', category: 'settings', expected_contains: 'صرافی' },
  { message: 'تنظیمات AI', category: 'settings', expected_contains: 'AI' },
  
  // Market analysis
  { message: 'تحلیل بازار', category: 'analysis', expected_contains: 'تحلیل' },
  { message: 'پیش‌بینی', category: 'analysis', expected_contains: 'تحلیل' },
  
  // Other commands
  { message: 'هشدار', category: 'alerts', expected_contains: 'هشدار' },
  { message: 'اخبار', category: 'news', expected_contains: 'اخبار' },
  { message: 'وضعیت سیستم', category: 'system', expected_contains: 'سیستم' },
  { message: 'کمک', category: 'help', expected_contains: 'راهنما' },
  
  // Default response
  { message: 'سلام', category: 'general', expected_contains: 'آرتمیس' }
]

// Mock user object for testing
const mockUser = { id: '1' }
const mockContext = {}
const mockHistory = []
const mockPreferences = {}

console.log('🧪 ArtemisService Rebuild Test Suite Starting...')
console.log('=' .repeat(60))

// Test each message category
let passedTests = 0
let totalTests = testMessages.length

async function runTest(testCase, index) {
  try {
    console.log(`\n🔍 Test ${index + 1}/${totalTests}: ${testCase.category}`)
    console.log(`   Message: "${testCase.message}"`)
    
    // Import the ArtemisService
    const { ArtemisService } = await import('./src/services/artemis-service.ts')
    
    // Process the message
    const result = await ArtemisService.processArtemisMessage(
      testCase.message,
      mockContext, 
      mockUser,
      mockHistory,
      mockPreferences
    )
    
    // Validate response structure
    if (!result || typeof result.text !== 'string') {
      console.log(`   ❌ FAIL: Invalid response structure`)
      return false
    }
    
    // Validate specific expectations
    if (testCase.expected_contains) {
      if (!result.text.includes(testCase.expected_contains)) {
        console.log(`   ❌ FAIL: Response doesn't contain "${testCase.expected_contains}"`)
        console.log(`   Response: ${result.text.substring(0, 100)}...`)
        return false
      }
    }
    
    if (testCase.expected_action) {
      if (!result.actions || !result.actions.some(a => a.type === testCase.expected_action)) {
        console.log(`   ❌ FAIL: Missing expected action "${testCase.expected_action}"`)
        return false
      }
    }
    
    // Validate confidence score
    if (result.confidence && (result.confidence < 0 || result.confidence > 100)) {
      console.log(`   ❌ FAIL: Invalid confidence score: ${result.confidence}`)
      return false
    }
    
    // Validate suggested actions structure
    if (result.suggestedActions) {
      for (const action of result.suggestedActions) {
        if (!action.action || !action.description || !action.risk_level) {
          console.log(`   ❌ FAIL: Invalid suggestedActions structure`)
          return false
        }
      }
    }
    
    console.log(`   ✅ PASS: Response valid, confidence: ${result.confidence || 'N/A'}`)
    return true
    
  } catch (error) {
    console.log(`   ❌ FAIL: Error processing message - ${error.message}`)
    return false
  }
}

// Run all tests
async function runAllTests() {
  for (let i = 0; i < testMessages.length; i++) {
    const passed = await runTest(testMessages[i], i)
    if (passed) {
      passedTests++
    }
  }
  
  // Test Summary
  console.log('\n' + '='.repeat(60))
  console.log('🏁 Test Results Summary')
  console.log('='.repeat(60))
  console.log(`✅ Passed: ${passedTests}/${totalTests}`)
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`)
  console.log(`📊 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`)
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! ArtemisService rebuild successful.')
    console.log('✅ Phase 1.4 Complete - ArtemisService fully functional')
  } else {
    console.log('\n⚠️  Some tests failed. Review the issues above.')
  }
  
  return passedTests === totalTests
}

// Additional functionality tests
async function testSystemMethods() {
  console.log('\n🔧 Testing System Methods...')
  
  try {
    const { ArtemisService } = await import('./src/services/artemis-service.ts')
    
    // Test getArtemisStatus
    const status = await ArtemisService.getArtemisStatus('1')
    console.log(`   ✅ getArtemisStatus: ${status.status}, confidence: ${status.confidence_level}`)
    
    // Test getAIAgents
    const agents = await ArtemisService.getAIAgents('1')
    console.log(`   ✅ getAIAgents: ${agents.length} agents loaded`)
    
    // Test getArtemisDecisions
    const decisions = await ArtemisService.getArtemisDecisions('1', 5)
    console.log(`   ✅ getArtemisDecisions: ${decisions.length} decisions generated`)
    
    // Test getArtemisInsights
    const insights = await ArtemisService.getArtemisInsights('1')
    console.log(`   ✅ getArtemisInsights: ${insights.length} insights generated`)
    
    return true
  } catch (error) {
    console.log(`   ❌ System methods error: ${error.message}`)
    return false
  }
}

// Execute all tests
runAllTests().then(async (success) => {
  const systemTestSuccess = await testSystemMethods()
  
  console.log('\n' + '🎯'.repeat(20))
  console.log('PHASE 1.4 ARTEMIS SERVICE REBUILD SUMMARY')
  console.log('🎯'.repeat(20))
  console.log(`Message Processing Tests: ${success ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`System Methods Tests: ${systemTestSuccess ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Overall Phase 1.4 Status: ${success && systemTestSuccess ? '✅ COMPLETE' : '❌ NEEDS REVIEW'}`)
  
  if (success && systemTestSuccess) {
    console.log('\n🚀 Ready to proceed to Phase 2.1: Database and DAO Layer Enhancement')
  }
}).catch(console.error)