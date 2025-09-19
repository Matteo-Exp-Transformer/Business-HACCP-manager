#!/usr/bin/env node

import { execSync } from 'child_process'
import { readFileSync } from 'fs'

const environments = {
  dev: {
    name: 'Development',
    buildCommand: 'npm run build:dev',
    color: '\x1b[34m', // Blue
  },
  staging: {
    name: 'Staging', 
    buildCommand: 'npm run build:staging',
    color: '\x1b[33m', // Yellow
  },
  prod: {
    name: 'Production',
    buildCommand: 'npm run build:prod', 
    color: '\x1b[32m', // Green
  }
}

function log(message, color = '\x1b[0m') {
  console.log(`${color}${message}\x1b[0m`)
}

function getBuildInfo() {
  try {
    const buildInfo = JSON.parse(readFileSync('public/build-info.json', 'utf8'))
    return buildInfo
  } catch {
    return null
  }
}

function deploy(env = 'dev') {
  const environment = environments[env]
  
  if (!environment) {
    log('❌ Invalid environment. Use: dev, staging, or prod', '\x1b[31m')
    process.exit(1)
  }

  log(`\n🚀 Starting ${environment.name} deployment...`, environment.color)
  log('=' .repeat(50))

  try {
    // Clean previous builds
    log('🧹 Cleaning previous builds...')
    execSync('npm run clean', { stdio: 'inherit' })

    // Run build
    log(`🏗️ Building for ${environment.name}...`)
    execSync(environment.buildCommand, { stdio: 'inherit' })

    // Get build info
    const buildInfo = getBuildInfo()
    if (buildInfo) {
      log('\n📦 Build Information:', environment.color)
      log(`   Version: ${buildInfo.version}`)
      log(`   Build ID: ${buildInfo.buildId}`)
      log(`   Branch: ${buildInfo.gitBranch}`)
      log(`   Environment: ${buildInfo.environment}`)
      log(`   Build Time: ${new Date(buildInfo.buildTime).toLocaleString('it-IT')}`)
    }

    // Success
    log(`\n✅ ${environment.name} build completed successfully!`, environment.color)
    log('📁 Output directory: ./docs/')
    
    if (env === 'dev') {
      log('\n🌐 Preview with: npm run preview')
    }
    
    log('=' .repeat(50))

  } catch (error) {
    log(`\n❌ ${environment.name} deployment failed!`, '\x1b[31m')
    log(error.message, '\x1b[31m')
    process.exit(1)
  }
}

// Parse command line arguments
const env = process.argv[2] || 'dev'
deploy(env)