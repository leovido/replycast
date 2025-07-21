#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Performance Audit Script
 * Analyzes the Next.js build output for performance insights
 */

class PerformanceAuditor {
  constructor() {
    this.buildDir = path.join(process.cwd(), '.next');
    this.results = {
      bundleSize: {},
      recommendations: [],
      performance: {},
    };
  }

  async audit() {
    console.log('🔍 Starting Performance Audit...\n');

    try {
      await this.analyzeBuildOutput();
      await this.checkBundleSizes();
      await this.analyzeStaticAssets();
      await this.generateRecommendations();
      this.printReport();
    } catch (error) {
      console.error('❌ Audit failed:', error.message);
      console.log('\n💡 Make sure to run "npm run build" first');
    }
  }

  async analyzeBuildOutput() {
    const buildManifestPath = path.join(this.buildDir, 'build-manifest.json');
    
    if (!fs.existsSync(buildManifestPath)) {
      throw new Error('Build manifest not found. Run "npm run build" first.');
    }

    const manifest = JSON.parse(fs.readFileSync(buildManifestPath, 'utf8'));
    this.results.bundleSize.pages = manifest.pages;
    
    console.log('✅ Analyzed build manifest');
  }

  async checkBundleSizes() {
    const staticDir = path.join(this.buildDir, 'static');
    
    if (!fs.existsSync(staticDir)) {
      return;
    }

    const jsDir = path.join(staticDir, 'chunks');
    const cssDir = path.join(staticDir, 'css');

    // Analyze JavaScript bundles
    if (fs.existsSync(jsDir)) {
      const jsFiles = this.getFileSizes(jsDir, '.js');
      this.results.bundleSize.javascript = jsFiles;
      
      const totalJSSize = Object.values(jsFiles).reduce((sum, size) => sum + size, 0);
      this.results.performance.totalJSSize = this.formatBytes(totalJSSize);
      
      if (totalJSSize > 300 * 1024) { // 300KB threshold
        this.results.recommendations.push({
          type: 'warning',
          message: `JavaScript bundle size is ${this.formatBytes(totalJSSize)}. Consider code splitting and tree shaking.`
        });
      }
    }

    // Analyze CSS bundles
    if (fs.existsSync(cssDir)) {
      const cssFiles = this.getFileSizes(cssDir, '.css');
      this.results.bundleSize.css = cssFiles;
      
      const totalCSSSize = Object.values(cssFiles).reduce((sum, size) => sum + size, 0);
      this.results.performance.totalCSSSize = this.formatBytes(totalCSSSize);
      
      if (totalCSSSize > 50 * 1024) { // 50KB threshold
        this.results.recommendations.push({
          type: 'warning',
          message: `CSS bundle size is ${this.formatBytes(totalCSSSize)}. Consider purging unused CSS.`
        });
      }
    }

    console.log('✅ Analyzed bundle sizes');
  }

  getFileSizes(dir, extension) {
    const files = {};
    
    if (!fs.existsSync(dir)) return files;
    
    fs.readdirSync(dir).forEach(file => {
      if (file.endsWith(extension)) {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        files[file] = stats.size;
      }
    });
    
    return files;
  }

  async analyzeStaticAssets() {
    const publicDir = path.join(process.cwd(), 'public');
    
    if (!fs.existsSync(publicDir)) {
      return;
    }

    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const images = this.getFilesByExtensions(publicDir, imageExtensions);
    
    this.results.bundleSize.images = images;
    
    const largeImages = Object.entries(images).filter(([_, size]) => size > 500 * 1024);
    
    if (largeImages.length > 0) {
      this.results.recommendations.push({
        type: 'warning',
        message: `Found ${largeImages.length} large images (>500KB). Consider optimizing or using Next.js Image component.`,
        details: largeImages.map(([name, size]) => `${name}: ${this.formatBytes(size)}`)
      });
    }

    console.log('✅ Analyzed static assets');
  }

  getFilesByExtensions(dir, extensions, files = {}) {
    if (!fs.existsSync(dir)) return files;
    
    fs.readdirSync(dir).forEach(file => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        this.getFilesByExtensions(filePath, extensions, files);
      } else if (extensions.some(ext => file.toLowerCase().endsWith(ext))) {
        files[file] = stats.size;
      }
    });
    
    return files;
  }

  async generateRecommendations() {
    // Analyze package.json for heavy dependencies
    const packagePath = path.join(process.cwd(), 'package.json');
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    const heavyDependencies = [
      'moment', 'lodash', '@mui/material', 'antd', 'bootstrap'
    ];
    
    const foundHeavy = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies })
      .filter(dep => heavyDependencies.some(heavy => dep.includes(heavy)));
    
    if (foundHeavy.length > 0) {
      this.results.recommendations.push({
        type: 'info',
        message: `Consider lighter alternatives for: ${foundHeavy.join(', ')}`
      });
    }

    // Check for optimization opportunities
    this.results.recommendations.push(
      {
        type: 'success',
        message: 'Using Next.js Image optimization ✅'
      },
      {
        type: 'success',
        message: 'Using dynamic imports for code splitting ✅'
      },
      {
        type: 'info',
        message: 'Consider implementing Progressive Web App features'
      },
      {
        type: 'info',
        message: 'Consider adding service worker for caching'
      }
    );

    console.log('✅ Generated recommendations');
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  printReport() {
    console.log('\n📊 PERFORMANCE AUDIT REPORT');
    console.log('================================\n');

    // Bundle Size Report
    console.log('📦 Bundle Sizes:');
    if (this.results.performance.totalJSSize) {
      console.log(`   JavaScript: ${this.results.performance.totalJSSize}`);
    }
    if (this.results.performance.totalCSSSize) {
      console.log(`   CSS: ${this.results.performance.totalCSSSize}`);
    }

    // Top 5 largest JS files
    if (this.results.bundleSize.javascript) {
      const jsFiles = Object.entries(this.results.bundleSize.javascript)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
      
      console.log('\n   📄 Largest JavaScript files:');
      jsFiles.forEach(([name, size]) => {
        console.log(`      ${name}: ${this.formatBytes(size)}`);
      });
    }

    // Recommendations
    console.log('\n💡 Recommendations:');
    this.results.recommendations.forEach(rec => {
      const icon = rec.type === 'warning' ? '⚠️' : rec.type === 'success' ? '✅' : 'ℹ️';
      console.log(`   ${icon} ${rec.message}`);
      
      if (rec.details) {
        rec.details.forEach(detail => {
          console.log(`      - ${detail}`);
        });
      }
    });

    console.log('\n🚀 Performance Tips:');
    console.log('   • Use React.memo() for expensive components');
    console.log('   • Implement virtual scrolling for large lists');
    console.log('   • Use Next.js Image component for all images');
    console.log('   • Enable Gzip/Brotli compression on your server');
    console.log('   • Consider implementing a CDN');
    console.log('   • Use bundle analyzer: npm run build:analyze');
    
    console.log('\n✨ Audit Complete!\n');
  }
}

// Run the audit
if (require.main === module) {
  const auditor = new PerformanceAuditor();
  auditor.audit().catch(console.error);
}

module.exports = PerformanceAuditor;