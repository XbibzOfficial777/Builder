import { useState } from 'react'
import { 
  Globe, 
  Smartphone, 
  Package, 
  Image, 
  Play, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Download,
  Github,
  Info,
  FileCode,
  Settings,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import './App.css'

interface BuildStatus {
  status: 'idle' | 'building' | 'success' | 'error'
  message: string
  runId?: number
  runUrl?: string
  downloadUrl?: string
}

function App() {
  const [formData, setFormData] = useState({
    websiteUrl: '',
    appName: '',
    packageName: 'com.webtoapk.app',
    appVersion: '1.0.0',
    versionCode: '1',
    iconUrl: '',
    githubToken: '',
    githubRepo: ''
  })

  const [buildStatus, setBuildStatus] = useState<BuildStatus>({
    status: 'idle',
    message: ''
  })

  const [activeTab, setActiveTab] = useState('basic')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!formData.websiteUrl.trim()) {
      setBuildStatus({ status: 'error', message: 'Website URL is required' })
      return false
    }
    if (!formData.appName.trim()) {
      setBuildStatus({ status: 'error', message: 'App Name is required' })
      return false
    }
    if (!formData.packageName.trim()) {
      setBuildStatus({ status: 'error', message: 'Package Name is required' })
      return false
    }
    if (!formData.githubToken.trim()) {
      setBuildStatus({ status: 'error', message: 'GitHub Token is required' })
      return false
    }
    if (!formData.githubRepo.trim()) {
      setBuildStatus({ status: 'error', message: 'GitHub Repository is required' })
      return false
    }
    return true
  }

  const triggerBuild = async () => {
    if (!validateForm()) return

    setBuildStatus({ status: 'building', message: 'Triggering build...' })

    try {
      const response = await fetch(
        `https://api.github.com/repos/${formData.githubRepo}/actions/workflows/build-apk.yml/dispatches`,
        {
          method: 'POST',
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `token ${formData.githubToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ref: 'main',
            inputs: {
              website_url: formData.websiteUrl,
              app_name: formData.appName,
              package_name: formData.packageName,
              app_version: formData.appVersion,
              version_code: formData.versionCode,
              icon_url: formData.iconUrl || ''
            }
          })
        }
      )

      if (response.ok) {
        setBuildStatus({ 
          status: 'building', 
          message: 'Build triggered successfully! Check your GitHub Actions for progress.' 
        })
        
        // Poll for build status
        pollBuildStatus()
      } else {
        const errorData = await response.json()
        setBuildStatus({ 
          status: 'error', 
          message: errorData.message || 'Failed to trigger build' 
        })
      }
    } catch (error) {
      setBuildStatus({ 
        status: 'error', 
        message: error instanceof Error ? error.message : 'An error occurred' 
      })
    }
  }

  const pollBuildStatus = async () => {
    let attempts = 0
    const maxAttempts = 60 // Poll for 10 minutes (10 seconds interval)

    const checkStatus = async () => {
      try {
        const response = await fetch(
          `https://api.github.com/repos/${formData.githubRepo}/actions/runs`,
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'Authorization': `token ${formData.githubToken}`
            }
          }
        )

        if (response.ok) {
          const data = await response.json()
          const latestRun = data.workflow_runs?.[0]

          if (latestRun) {
            if (latestRun.status === 'completed') {
              if (latestRun.conclusion === 'success') {
                setBuildStatus({
                  status: 'success',
                  message: 'Build completed successfully!',
                  runId: latestRun.id,
                  runUrl: latestRun.html_url,
                  downloadUrl: `${latestRun.html_url}/artifacts`
                })
                return true
              } else {
                setBuildStatus({
                  status: 'error',
                  message: `Build failed: ${latestRun.conclusion}`,
                  runUrl: latestRun.html_url
                })
                return true
              }
            } else {
              setBuildStatus({
                status: 'building',
                message: `Build in progress: ${latestRun.status}...`,
                runUrl: latestRun.html_url
              })
            }
          }
        }
      } catch (error) {
        console.error('Error checking build status:', error)
      }

      attempts++
      if (attempts < maxAttempts) {
        setTimeout(checkStatus, 10000)
      } else {
        setBuildStatus({
          status: 'error',
          message: 'Build status check timed out. Please check GitHub Actions manually.'
        })
      }
      return false
    }

    // Wait a bit before starting to poll
    setTimeout(checkStatus, 5000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  WebToApk Builder
                </h1>
                <p className="text-xs text-slate-400">Convert websites to Android APK</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                <Github className="w-3 h-3 mr-1" />
                GitHub Actions
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Settings className="w-5 h-5 text-blue-400" />
                  APK Configuration
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Configure your Android app settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-slate-900/50">
                    <TabsTrigger value="basic" className="data-[state=active]:bg-slate-700">
                      <Globe className="w-4 h-4 mr-2" />
                      Basic Info
                    </TabsTrigger>
                    <TabsTrigger value="advanced" className="data-[state=active]:bg-slate-700">
                      <FileCode className="w-4 h-4 mr-2" />
                      Advanced & GitHub
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="websiteUrl" className="text-slate-300 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-400" />
                        Website URL *
                      </Label>
                      <Input
                        id="websiteUrl"
                        name="websiteUrl"
                        placeholder="https://example.com"
                        value={formData.websiteUrl}
                        onChange={handleInputChange}
                        className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="appName" className="text-slate-300 flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-green-400" />
                        App Name *
                      </Label>
                      <Input
                        id="appName"
                        name="appName"
                        placeholder="My Web App"
                        value={formData.appName}
                        onChange={handleInputChange}
                        className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="appVersion" className="text-slate-300 flex items-center gap-2">
                        <Package className="w-4 h-4 text-yellow-400" />
                        App Version
                      </Label>
                      <Input
                        id="appVersion"
                        name="appVersion"
                        placeholder="1.0.0"
                        value={formData.appVersion}
                        onChange={handleInputChange}
                        className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="iconUrl" className="text-slate-300 flex items-center gap-2">
                        <Image className="w-4 h-4 text-purple-400" />
                        Icon URL (optional)
                      </Label>
                      <Input
                        id="iconUrl"
                        name="iconUrl"
                        placeholder="https://example.com/icon.png"
                        value={formData.iconUrl}
                        onChange={handleInputChange}
                        className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="packageName" className="text-slate-300 flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-orange-400" />
                        Package Name *
                      </Label>
                      <Input
                        id="packageName"
                        name="packageName"
                        placeholder="com.example.app"
                        value={formData.packageName}
                        onChange={handleInputChange}
                        className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="versionCode" className="text-slate-300 flex items-center gap-2">
                        <Info className="w-4 h-4 text-cyan-400" />
                        Version Code
                      </Label>
                      <Input
                        id="versionCode"
                        name="versionCode"
                        placeholder="1"
                        value={formData.versionCode}
                        onChange={handleInputChange}
                        className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                      />
                    </div>

                    <Separator className="bg-slate-700" />

                    <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
                      <h4 className="text-blue-400 font-medium mb-2 flex items-center gap-2">
                        <Github className="w-4 h-4" />
                        GitHub Configuration
                      </h4>
                      <p className="text-sm text-slate-400 mb-4">
                        Required to trigger GitHub Actions workflow
                      </p>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="githubRepo" className="text-slate-300">
                            Repository (owner/repo) *
                          </Label>
                          <Input
                            id="githubRepo"
                            name="githubRepo"
                            placeholder="username/webtoapk-builder"
                            value={formData.githubRepo}
                            onChange={handleInputChange}
                            className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="githubToken" className="text-slate-300">
                            Personal Access Token *
                          </Label>
                          <Input
                            id="githubToken"
                            name="githubToken"
                            type="password"
                            placeholder="ghp_xxxxxxxxxxxx"
                            value={formData.githubToken}
                            onChange={handleInputChange}
                            className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                          />
                          <p className="text-xs text-slate-500">
                            Token needs {'repo'} scope.{' '}
                            <a 
                              href="https://github.com/settings/tokens" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:underline"
                            >
                              Create token
                            </a>
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <Separator className="my-6 bg-slate-700" />

                <Button
                  onClick={triggerBuild}
                  disabled={buildStatus.status === 'building'}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-6"
                >
                  {buildStatus.status === 'building' ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Building APK...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Build APK
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Status Alert */}
            {buildStatus.status !== 'idle' && (
              <Alert className={`${
                buildStatus.status === 'success' ? 'bg-green-900/30 border-green-700/50' :
                buildStatus.status === 'error' ? 'bg-red-900/30 border-red-700/50' :
                'bg-blue-900/30 border-blue-700/50'
              }`}>
                {buildStatus.status === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : buildStatus.status === 'error' ? (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                ) : (
                  <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                )}
                <AlertTitle className={`${
                  buildStatus.status === 'success' ? 'text-green-400' :
                  buildStatus.status === 'error' ? 'text-red-400' :
                  'text-blue-400'
                }`}>
                  {buildStatus.status === 'success' ? 'Success' :
                   buildStatus.status === 'error' ? 'Error' :
                   'Building'}
                </AlertTitle>
                <AlertDescription className="text-slate-300">
                  {buildStatus.message}
                </AlertDescription>
              </Alert>
            )}

            {/* Download Section */}
            {buildStatus.status === 'success' && buildStatus.runUrl && (
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Download className="w-5 h-5 text-green-400" />
                    Download APK
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-400">
                    Your APK has been built successfully! You can download it from GitHub Actions artifacts.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      onClick={() => window.open(buildStatus.runUrl, '_blank')}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on GitHub
                    </Button>
                    {buildStatus.downloadUrl && (
                      <Button
                        variant="outline"
                        onClick={() => window.open(buildStatus.downloadUrl, '_blank')}
                        className="border-green-600 text-green-400 hover:bg-green-900/30"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Artifacts
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Info */}
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="text-slate-200 font-medium">Fill the Form</h4>
                    <p className="text-sm text-slate-400">Enter your website URL and app details</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-400 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="text-slate-200 font-medium">GitHub Actions</h4>
                    <p className="text-sm text-slate-400">Build is triggered on GitHub Actions</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-green-400 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="text-slate-200 font-medium">Download APK</h4>
                    <p className="text-sm text-slate-400">Get your signed APK file</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Custom app name & icon
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Version control
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Signed APK output
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Pull-to-refresh
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Back button navigation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Progress indicator
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Setup Required</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-400">
                <p>
                  1. Fork this repository to your GitHub account
                </p>
                <p>
                  2. Enable GitHub Actions in your forked repo
                </p>
                <p>
                  3. Create a Personal Access Token with {'repo'} scope
                </p>
                <p>
                  4. Enter your repo and token in the Advanced tab
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              WebToApk Builder - Powered by GitHub Actions
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
