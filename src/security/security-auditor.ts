/**
 * TITAN AI Trading Platform - Security Auditor
 * Comprehensive security audit and vulnerability assessment system
 * 
 * Features:
 * - Dependency vulnerability scanning
 * - Code security analysis
 * - API endpoint security validation
 * - Authentication/Authorization audit
 * - Data protection compliance checks
 * - Real-time security monitoring
 */

import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface SecurityVulnerability {
    id: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    category: 'dependency' | 'code' | 'api' | 'auth' | 'data' | 'config';
    description: string;
    impact: string;
    recommendation: string;
    cwe?: string; // Common Weakness Enumeration
    cvss_score?: number; // Common Vulnerability Scoring System
    affected_files: string[];
    detected_at: Date;
}

export interface SecurityAuditResult {
    audit_id: string;
    timestamp: Date;
    total_vulnerabilities: number;
    critical_count: number;
    high_count: number;
    medium_count: number;
    low_count: number;
    security_score: number; // 0-100
    vulnerabilities: SecurityVulnerability[];
    recommendations: string[];
    compliance_status: {
        gdpr: boolean;
        pci_dss: boolean;
        iso27001: boolean;
        owasp_top10: boolean;
    };
    performance_impact: {
        scan_duration_ms: number;
        files_scanned: number;
        dependencies_checked: number;
    };
}

export interface SecurityConfig {
    scan_dependencies: boolean;
    scan_code: boolean;
    scan_apis: boolean;
    scan_auth: boolean;
    scan_data: boolean;
    severity_threshold: 'low' | 'medium' | 'high' | 'critical';
    exclude_patterns: string[];
    custom_rules: SecurityRule[];
}

export interface SecurityRule {
    id: string;
    name: string;
    pattern: RegExp;
    severity: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    description: string;
    recommendation: string;
}

export interface SecurityMetrics {
    total_scans: number;
    vulnerabilities_found: number;
    vulnerabilities_fixed: number;
    security_incidents: number;
    avg_security_score: number;
    compliance_rate: number;
    response_time_ms: number;
}

export class SecurityAuditor extends EventEmitter {
    private config: SecurityConfig;
    private metrics: SecurityMetrics;
    private vulnerabilityDb: Map<string, SecurityVulnerability>;
    private scanHistory: SecurityAuditResult[];
    private isRunning: boolean = false;

    constructor(config?: Partial<SecurityConfig>) {
        super();
        
        this.config = {
            scan_dependencies: true,
            scan_code: true,
            scan_apis: true,
            scan_auth: true,
            scan_data: true,
            severity_threshold: 'low',
            exclude_patterns: ['node_modules', '.git', 'dist', 'build'],
            custom_rules: this.getDefaultSecurityRules(),
            ...config
        };

        this.metrics = {
            total_scans: 0,
            vulnerabilities_found: 0,
            vulnerabilities_fixed: 0,
            security_incidents: 0,
            avg_security_score: 0,
            compliance_rate: 0,
            response_time_ms: 0
        };

        this.vulnerabilityDb = new Map();
        this.scanHistory = [];
        
        console.log('🔐 Security Auditor initialized');
    }

    /**
     * Run comprehensive security audit
     */
    public async runSecurityAudit(targetPath: string = process.cwd()): Promise<SecurityAuditResult> {
        const startTime = Date.now();
        const auditId = this.generateAuditId();
        
        console.log(`🔍 Starting security audit: ${auditId}`);
        this.isRunning = true;

        try {
            const vulnerabilities: SecurityVulnerability[] = [];
            let filesScanned = 0;
            let dependenciesChecked = 0;

            // 1. Dependency Vulnerability Scanning
            if (this.config.scan_dependencies) {
                console.log('📦 Scanning dependencies...');
                const depVulns = await this.scanDependencies(targetPath);
                vulnerabilities.push(...depVulns);
                dependenciesChecked = depVulns.length;
            }

            // 2. Code Security Analysis
            if (this.config.scan_code) {
                console.log('📝 Analyzing code security...');
                const codeVulns = await this.scanCodeSecurity(targetPath);
                vulnerabilities.push(...codeVulns);
                filesScanned += codeVulns.reduce((acc, v) => acc + v.affected_files.length, 0);
            }

            // 3. API Security Validation
            if (this.config.scan_apis) {
                console.log('🌐 Validating API security...');
                const apiVulns = await this.scanApiSecurity(targetPath);
                vulnerabilities.push(...apiVulns);
            }

            // 4. Authentication/Authorization Audit
            if (this.config.scan_auth) {
                console.log('🔑 Auditing authentication...');
                const authVulns = await this.scanAuthSecurity(targetPath);
                vulnerabilities.push(...authVulns);
            }

            // 5. Data Protection Compliance
            if (this.config.scan_data) {
                console.log('🛡️ Checking data protection...');
                const dataVulns = await this.scanDataSecurity(targetPath);
                vulnerabilities.push(...dataVulns);
            }

            // Calculate security metrics
            const result = this.calculateSecurityScore(vulnerabilities, auditId, startTime, filesScanned, dependenciesChecked);
            
            // Update metrics
            this.updateMetrics(result);
            
            // Store in history
            this.scanHistory.push(result);
            
            // Emit event
            this.emit('auditComplete', result);
            
            console.log(`✅ Security audit completed: ${result.security_score}/100`);
            
            return result;

        } catch (error) {
            console.error('❌ Security audit failed:', error);
            throw error;
        } finally {
            this.isRunning = false;
        }
    }

    /**
     * Scan dependencies for known vulnerabilities
     */
    private async scanDependencies(targetPath: string): Promise<SecurityVulnerability[]> {
        const vulnerabilities: SecurityVulnerability[] = [];
        
        try {
            const packageJsonPath = path.join(targetPath, 'package.json');
            
            if (fs.existsSync(packageJsonPath)) {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                const dependencies = {
                    ...packageJson.dependencies,
                    ...packageJson.devDependencies
                };

                // Known vulnerable packages (simplified database)
                const knownVulnerabilities = this.getKnownVulnerabilities();
                
                for (const [pkg, version] of Object.entries(dependencies)) {
                    if (knownVulnerabilities.has(pkg)) {
                        const vuln = knownVulnerabilities.get(pkg)!;
                        vulnerabilities.push({
                            id: this.generateVulnId(),
                            severity: vuln.severity,
                            category: 'dependency',
                            description: `Vulnerable dependency: ${pkg}@${version}`,
                            impact: vuln.impact,
                            recommendation: vuln.recommendation,
                            cwe: vuln.cwe,
                            cvss_score: vuln.cvss_score,
                            affected_files: [packageJsonPath],
                            detected_at: new Date()
                        });
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to scan dependencies:', error);
        }

        return vulnerabilities;
    }

    /**
     * Analyze code for security vulnerabilities
     */
    private async scanCodeSecurity(targetPath: string): Promise<SecurityVulnerability[]> {
        const vulnerabilities: SecurityVulnerability[] = [];
        
        try {
            const files = await this.getSourceFiles(targetPath);
            
            for (const file of files) {
                const content = fs.readFileSync(file, 'utf8');
                
                // Apply security rules
                for (const rule of this.config.custom_rules) {
                    const matches = content.match(rule.pattern);
                    if (matches) {
                        vulnerabilities.push({
                            id: this.generateVulnId(),
                            severity: rule.severity,
                            category: 'code',
                            description: rule.description,
                            impact: `Security issue detected in ${path.relative(targetPath, file)}`,
                            recommendation: rule.recommendation,
                            affected_files: [file],
                            detected_at: new Date()
                        });
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to scan code security:', error);
        }

        return vulnerabilities;
    }

    /**
     * Validate API endpoint security
     */
    private async scanApiSecurity(targetPath: string): Promise<SecurityVulnerability[]> {
        const vulnerabilities: SecurityVulnerability[] = [];
        
        try {
            const apiFiles = await this.getApiFiles(targetPath);
            
            for (const file of apiFiles) {
                const content = fs.readFileSync(file, 'utf8');
                
                // Check for common API security issues
                const apiChecks = [
                    {
                        pattern: /app\.use\(.*cors.*\)/gi,
                        severity: 'medium' as const,
                        description: 'CORS configuration detected',
                        recommendation: 'Ensure CORS is properly configured for production'
                    },
                    {
                        pattern: /\.query\s*\(\s*['"`].*\$\{.*\}.*['"`]/gi,
                        severity: 'critical' as const,
                        description: 'Potential SQL injection vulnerability',
                        recommendation: 'Use parameterized queries instead of string concatenation'
                    },
                    {
                        pattern: /req\.(query|body|params).*without.*validation/gi,
                        severity: 'high' as const,
                        description: 'Input validation missing',
                        recommendation: 'Implement proper input validation for all user inputs'
                    }
                ];

                for (const check of apiChecks) {
                    if (check.pattern.test(content)) {
                        vulnerabilities.push({
                            id: this.generateVulnId(),
                            severity: check.severity,
                            category: 'api',
                            description: check.description,
                            impact: 'API security vulnerability detected',
                            recommendation: check.recommendation,
                            affected_files: [file],
                            detected_at: new Date()
                        });
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to scan API security:', error);
        }

        return vulnerabilities;
    }

    /**
     * Audit authentication and authorization
     */
    private async scanAuthSecurity(targetPath: string): Promise<SecurityVulnerability[]> {
        const vulnerabilities: SecurityVulnerability[] = [];
        
        try {
            const authFiles = await this.getAuthFiles(targetPath);
            
            for (const file of authFiles) {
                const content = fs.readFileSync(file, 'utf8');
                
                // Check for auth security issues
                const authChecks = [
                    {
                        pattern: /password.*===.*req\./gi,
                        severity: 'critical' as const,
                        description: 'Plain text password comparison',
                        recommendation: 'Use bcrypt or similar for password hashing and comparison'
                    },
                    {
                        pattern: /jwt\.sign.*{.*}.*'.*'/gi,
                        severity: 'high' as const,
                        description: 'Hardcoded JWT secret detected',
                        recommendation: 'Use environment variables for JWT secrets'
                    },
                    {
                        pattern: /localStorage\.setItem.*token/gi,
                        severity: 'medium' as const,
                        description: 'Token stored in localStorage',
                        recommendation: 'Consider using httpOnly cookies for sensitive tokens'
                    }
                ];

                for (const check of authChecks) {
                    if (check.pattern.test(content)) {
                        vulnerabilities.push({
                            id: this.generateVulnId(),
                            severity: check.severity,
                            category: 'auth',
                            description: check.description,
                            impact: 'Authentication security vulnerability',
                            recommendation: check.recommendation,
                            affected_files: [file],
                            detected_at: new Date()
                        });
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to scan auth security:', error);
        }

        return vulnerabilities;
    }

    /**
     * Check data protection compliance
     */
    private async scanDataSecurity(targetPath: string): Promise<SecurityVulnerability[]> {
        const vulnerabilities: SecurityVulnerability[] = [];
        
        try {
            const dataFiles = await this.getDataFiles(targetPath);
            
            for (const file of dataFiles) {
                const content = fs.readFileSync(file, 'utf8');
                
                // Check for data security issues
                const dataChecks = [
                    {
                        pattern: /console\.log.*password|console\.log.*token|console\.log.*secret/gi,
                        severity: 'high' as const,
                        description: 'Sensitive data logged to console',
                        recommendation: 'Remove or sanitize sensitive data from logs'
                    },
                    {
                        pattern: /email.*stored.*without.*encryption/gi,
                        severity: 'medium' as const,
                        description: 'Personal data storage concern',
                        recommendation: 'Ensure GDPR compliance for personal data storage'
                    },
                    {
                        pattern: /fs\.writeFileSync.*\.env|fs\.writeFile.*\.env/gi,
                        severity: 'high' as const,
                        description: 'Environment file modification detected',
                        recommendation: 'Avoid programmatic modification of environment files'
                    }
                ];

                for (const check of dataChecks) {
                    if (check.pattern.test(content)) {
                        vulnerabilities.push({
                            id: this.generateVulnId(),
                            severity: check.severity,
                            category: 'data',
                            description: check.description,
                            impact: 'Data protection compliance issue',
                            recommendation: check.recommendation,
                            affected_files: [file],
                            detected_at: new Date()
                        });
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to scan data security:', error);
        }

        return vulnerabilities;
    }

    /**
     * Calculate overall security score
     */
    private calculateSecurityScore(
        vulnerabilities: SecurityVulnerability[], 
        auditId: string, 
        startTime: number, 
        filesScanned: number, 
        dependenciesChecked: number
    ): SecurityAuditResult {
        const criticalCount = vulnerabilities.filter(v => v.severity === 'critical').length;
        const highCount = vulnerabilities.filter(v => v.severity === 'high').length;
        const mediumCount = vulnerabilities.filter(v => v.severity === 'medium').length;
        const lowCount = vulnerabilities.filter(v => v.severity === 'low').length;

        // Security score calculation (0-100)
        let securityScore = 100;
        securityScore -= criticalCount * 25;  // Critical: -25 points each
        securityScore -= highCount * 15;      // High: -15 points each
        securityScore -= mediumCount * 5;     // Medium: -5 points each
        securityScore -= lowCount * 1;        // Low: -1 point each
        securityScore = Math.max(0, Math.min(100, securityScore));

        const recommendations = this.generateRecommendations(vulnerabilities);
        const complianceStatus = this.assessCompliance(vulnerabilities);

        return {
            audit_id: auditId,
            timestamp: new Date(),
            total_vulnerabilities: vulnerabilities.length,
            critical_count: criticalCount,
            high_count: highCount,
            medium_count: mediumCount,
            low_count: lowCount,
            security_score: securityScore,
            vulnerabilities,
            recommendations,
            compliance_status: complianceStatus,
            performance_impact: {
                scan_duration_ms: Date.now() - startTime,
                files_scanned: filesScanned,
                dependencies_checked: dependenciesChecked
            }
        };
    }

    /**
     * Generate security recommendations
     */
    private generateRecommendations(vulnerabilities: SecurityVulnerability[]): string[] {
        const recommendations: string[] = [];
        
        const criticalCount = vulnerabilities.filter(v => v.severity === 'critical').length;
        const highCount = vulnerabilities.filter(v => v.severity === 'high').length;

        if (criticalCount > 0) {
            recommendations.push(`🚨 Address ${criticalCount} critical vulnerabilities immediately`);
        }
        
        if (highCount > 0) {
            recommendations.push(`⚠️ Fix ${highCount} high-severity issues within 48 hours`);
        }

        // Category-specific recommendations
        const categories = new Set(vulnerabilities.map(v => v.category));
        
        if (categories.has('dependency')) {
            recommendations.push('📦 Update vulnerable dependencies to latest secure versions');
        }
        
        if (categories.has('auth')) {
            recommendations.push('🔐 Implement proper authentication and authorization mechanisms');
        }
        
        if (categories.has('api')) {
            recommendations.push('🌐 Add input validation and rate limiting to API endpoints');
        }

        recommendations.push('🔍 Schedule regular security audits (weekly recommended)');
        recommendations.push('📚 Train development team on secure coding practices');

        return recommendations;
    }

    /**
     * Assess compliance status
     */
    private assessCompliance(vulnerabilities: SecurityVulnerability[]): any {
        const criticalCount = vulnerabilities.filter(v => v.severity === 'critical').length;
        const highCount = vulnerabilities.filter(v => v.severity === 'high').length;
        
        return {
            gdpr: criticalCount === 0 && vulnerabilities.filter(v => v.category === 'data').length === 0,
            pci_dss: criticalCount === 0 && highCount === 0,
            iso27001: vulnerabilities.length < 5,
            owasp_top10: criticalCount === 0 && highCount < 3
        };
    }

    /**
     * Get security metrics
     */
    public getSecurityMetrics(): SecurityMetrics {
        return { ...this.metrics };
    }

    /**
     * Get audit history
     */
    public getAuditHistory(): SecurityAuditResult[] {
        return [...this.scanHistory];
    }

    /**
     * Generate security report
     */
    public async generateSecurityReport(auditResult: SecurityAuditResult): Promise<string> {
        const report = `
# TITAN AI Trading Platform - Security Audit Report

## Executive Summary
- **Audit ID**: ${auditResult.audit_id}
- **Timestamp**: ${auditResult.timestamp.toISOString()}
- **Security Score**: ${auditResult.security_score}/100
- **Total Vulnerabilities**: ${auditResult.total_vulnerabilities}

## Vulnerability Breakdown
- 🚨 **Critical**: ${auditResult.critical_count}
- ⚠️ **High**: ${auditResult.high_count}
- 🟡 **Medium**: ${auditResult.medium_count}
- ℹ️ **Low**: ${auditResult.low_count}

## Compliance Status
- **GDPR**: ${auditResult.compliance_status.gdpr ? '✅ Compliant' : '❌ Non-compliant'}
- **PCI DSS**: ${auditResult.compliance_status.pci_dss ? '✅ Compliant' : '❌ Non-compliant'}
- **ISO 27001**: ${auditResult.compliance_status.iso27001 ? '✅ Compliant' : '❌ Non-compliant'}
- **OWASP Top 10**: ${auditResult.compliance_status.owasp_top10 ? '✅ Compliant' : '❌ Non-compliant'}

## Performance Metrics
- **Scan Duration**: ${auditResult.performance_impact.scan_duration_ms}ms
- **Files Scanned**: ${auditResult.performance_impact.files_scanned}
- **Dependencies Checked**: ${auditResult.performance_impact.dependencies_checked}

## Detailed Vulnerabilities
${auditResult.vulnerabilities.map(v => `
### ${v.id} - ${v.severity.toUpperCase()}
- **Category**: ${v.category}
- **Description**: ${v.description}
- **Impact**: ${v.impact}
- **Recommendation**: ${v.recommendation}
- **Affected Files**: ${v.affected_files.join(', ')}
${v.cwe ? `- **CWE**: ${v.cwe}` : ''}
${v.cvss_score ? `- **CVSS Score**: ${v.cvss_score}` : ''}
`).join('\n')}

## Recommendations
${auditResult.recommendations.map(r => `- ${r}`).join('\n')}

## Next Steps
1. Address critical and high-severity vulnerabilities immediately
2. Implement recommended security measures
3. Schedule regular security audits
4. Update security policies and procedures
5. Train development team on identified security issues

---
*Report generated by TITAN AI Trading Platform Security Auditor*
`;

        return report;
    }

    // Helper methods
    private generateAuditId(): string {
        return `audit_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    }

    private generateVulnId(): string {
        return `vuln_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    }

    private async getSourceFiles(targetPath: string): Promise<string[]> {
        const files: string[] = [];
        const extensions = ['.ts', '.js', '.tsx', '.jsx'];
        
        const scanDir = (dir: string) => {
            if (!fs.existsSync(dir)) return;
            
            const items = fs.readdirSync(dir);
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory() && !this.isExcluded(fullPath)) {
                    scanDir(fullPath);
                } else if (stat.isFile() && extensions.some(ext => fullPath.endsWith(ext))) {
                    files.push(fullPath);
                }
            }
        };
        
        scanDir(targetPath);
        return files;
    }

    private async getApiFiles(targetPath: string): Promise<string[]> {
        const files = await this.getSourceFiles(targetPath);
        return files.filter(f => 
            f.includes('/api/') || 
            f.includes('/routes/') || 
            f.includes('/controllers/')
        );
    }

    private async getAuthFiles(targetPath: string): Promise<string[]> {
        const files = await this.getSourceFiles(targetPath);
        return files.filter(f => 
            f.includes('auth') || 
            f.includes('login') || 
            f.includes('jwt') ||
            f.includes('middleware')
        );
    }

    private async getDataFiles(targetPath: string): Promise<string[]> {
        const files = await this.getSourceFiles(targetPath);
        return files.filter(f => 
            f.includes('/models/') || 
            f.includes('/data/') || 
            f.includes('database') ||
            f.includes('storage')
        );
    }

    private isExcluded(filePath: string): boolean {
        return this.config.exclude_patterns.some(pattern => 
            filePath.includes(pattern)
        );
    }

    private updateMetrics(result: SecurityAuditResult): void {
        this.metrics.total_scans++;
        this.metrics.vulnerabilities_found += result.total_vulnerabilities;
        this.metrics.avg_security_score = (
            (this.metrics.avg_security_score * (this.metrics.total_scans - 1) + result.security_score) / 
            this.metrics.total_scans
        );
        this.metrics.response_time_ms = result.performance_impact.scan_duration_ms;
        
        // Calculate compliance rate
        const compliantChecks = Object.values(result.compliance_status).filter(Boolean).length;
        this.metrics.compliance_rate = (compliantChecks / 4) * 100;
    }

    private getDefaultSecurityRules(): SecurityRule[] {
        return [
            {
                id: 'hardcoded-secrets',
                name: 'Hardcoded Secrets',
                pattern: /(password|secret|key|token)\s*[:=]\s*['"][^'"]+['"]/gi,
                severity: 'critical',
                category: 'code',
                description: 'Hardcoded secrets detected',
                recommendation: 'Use environment variables for sensitive data'
            },
            {
                id: 'sql-injection',
                name: 'SQL Injection Risk',
                pattern: /query\s*\(\s*['"`].*\$\{.*\}.*['"`]/gi,
                severity: 'critical',
                category: 'code',
                description: 'Potential SQL injection vulnerability',
                recommendation: 'Use parameterized queries'
            },
            {
                id: 'unsafe-eval',
                name: 'Unsafe Eval Usage',
                pattern: /eval\s*\(/gi,
                severity: 'high',
                category: 'code',
                description: 'Unsafe use of eval() function',
                recommendation: 'Avoid using eval() with user input'
            },
            {
                id: 'weak-crypto',
                name: 'Weak Cryptography',
                pattern: /(md5|sha1)\s*\(/gi,
                severity: 'medium',
                category: 'code',
                description: 'Weak cryptographic hash function',
                recommendation: 'Use SHA-256 or stronger hash functions'
            },
            {
                id: 'insecure-random',
                name: 'Insecure Random',
                pattern: /Math\.random\s*\(\)/gi,
                severity: 'medium',
                category: 'code',
                description: 'Insecure random number generation',
                recommendation: 'Use crypto.randomBytes() for security-critical randomness'
            }
        ];
    }

    private getKnownVulnerabilities(): Map<string, any> {
        const vulns = new Map();
        
        // Sample known vulnerabilities (in real implementation, this would be a comprehensive database)
        vulns.set('lodash', {
            severity: 'high',
            impact: 'Prototype pollution vulnerability',
            recommendation: 'Update to lodash@4.17.21 or later',
            cwe: 'CWE-1321',
            cvss_score: 7.5
        });
        
        vulns.set('axios', {
            severity: 'medium',
            impact: 'Server-Side Request Forgery (SSRF)',
            recommendation: 'Update to axios@0.21.2 or later',
            cwe: 'CWE-918',
            cvss_score: 5.3
        });

        return vulns;
    }

    /**
     * Start real-time security monitoring
     */
    public startRealTimeMonitoring(interval: number = 300000): void { // 5 minutes default
        if (this.isRunning) {
            console.log('🔐 Real-time security monitoring already running');
            return;
        }

        console.log('🔐 Starting real-time security monitoring...');
        
        setInterval(async () => {
            try {
                const result = await this.runSecurityAudit();
                
                if (result.critical_count > 0) {
                    this.emit('criticalVulnerability', result);
                    console.warn(`🚨 CRITICAL: ${result.critical_count} critical vulnerabilities detected!`);
                }
                
                if (result.security_score < 70) {
                    this.emit('lowSecurityScore', result);
                    console.warn(`⚠️ Low security score: ${result.security_score}/100`);
                }
            } catch (error) {
                console.error('Real-time security monitoring error:', error);
            }
        }, interval);
    }

    /**
     * Stop security monitoring
     */
    public stopRealTimeMonitoring(): void {
        this.isRunning = false;
        console.log('🔐 Security monitoring stopped');
    }
}

// Export for use in other modules
export default SecurityAuditor;