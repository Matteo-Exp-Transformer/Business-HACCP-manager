import React, { useState } from 'react'
import { Info, GitBranch, Clock, Package, Settings, ChevronDown, ChevronUp } from 'lucide-react'
import { getBuildInfo, logBuildInfo, isDevelopment } from '../lib/buildInfo'

const BuildInfoPanel: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const buildInfo = getBuildInfo()

  // Only show in development mode
  if (!isDevelopment()) {
    return null
  }

  const getEnvironmentColor = () => {
    switch (buildInfo.environment) {
      case 'production':
        return 'bg-green-500'
      case 'staging':
        return 'bg-yellow-500'
      default:
        return 'bg-blue-500'
    }
  }

  const getFeatureStatus = (enabled: boolean) => 
    enabled ? '✅' : '❌'

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-sm">
        {/* Header */}
        <div 
          className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getEnvironmentColor()}`}></div>
            <span className="text-sm font-medium text-gray-700">
              Build Info
            </span>
            <span className="text-xs text-gray-500">
              v{buildInfo.version}
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-gray-200 p-3 space-y-3">
            {/* Version Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <Package className="w-3 h-3 text-blue-500" />
                <span className="font-medium">Version:</span>
                <span className="text-gray-600">{buildInfo.version}</span>
              </div>
              
              <div className="flex items-center gap-2 text-xs">
                <GitBranch className="w-3 h-3 text-green-500" />
                <span className="font-medium">Branch:</span>
                <span className="text-gray-600 font-mono">{buildInfo.gitBranch}</span>
              </div>
              
              <div className="flex items-center gap-2 text-xs">
                <Clock className="w-3 h-3 text-purple-500" />
                <span className="font-medium">Built:</span>
                <span className="text-gray-600">
                  {new Date(buildInfo.buildTime).toLocaleString('it-IT')}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-xs">
                <Settings className="w-3 h-3 text-orange-500" />
                <span className="font-medium">Env:</span>
                <span className={`px-2 py-1 rounded text-white text-xs ${getEnvironmentColor()}`}>
                  {buildInfo.environment.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Features Status */}
            <div className="border-t border-gray-100 pt-3">
              <div className="text-xs font-medium text-gray-700 mb-2">Features:</div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div>
                  {getFeatureStatus(buildInfo.features.clerkAuth)} Clerk Auth
                </div>
                <div>
                  {getFeatureStatus(buildInfo.features.supabaseDb)} Supabase
                </div>
                <div>
                  {getFeatureStatus(buildInfo.features.sentryMonitoring)} Sentry
                </div>
                <div>
                  {getFeatureStatus(buildInfo.features.pwaEnabled)} PWA
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-100 pt-3 flex gap-2">
              <button
                onClick={() => logBuildInfo()}
                className="flex-1 text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
              >
                Log Info
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(buildInfo, null, 2))
                  alert('Build info copied to clipboard!')
                }}
                className="flex-1 text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
              >
                Copy JSON
              </button>
            </div>

            {/* Git Commit */}
            {buildInfo.gitCommit !== 'unknown' && (
              <div className="border-t border-gray-100 pt-2">
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Commit:</span>
                  <span className="font-mono ml-1">
                    {buildInfo.gitCommit.substring(0, 8)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default BuildInfoPanel