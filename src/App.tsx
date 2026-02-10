import { useState, useEffect } from 'react'
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
  ExternalLink,
  Terminal,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import './App.css'

interface BuildStatus {
  status: 'idle' | 'building' | 'success' | 'error'
  message: string
  runId?: number
  runUrl?: string
  downloadUrl?: string
  logs?: string
  releaseUrl?: string
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
  const [showLogs, setShowLogs] = useState(false)

  // Load settings from localStorage
  useEffect(() => {
    const savedRepo = localStorage.getItem('githubRepo')
    const savedToken = localStorage.getItem('githubToken')
    if (savedRepo || savedToken) {
      setFormData(prev => ({
        ...prev,
        githubRepo: savedRepo || '',
        githubToken: savedToken || ''
      }))
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (name === 'githubRepo' || name === 'githubToken') {
      localStorage.setItem(name, value)
    }
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

  const fetchLogs = async (runId: number) => {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${formData.githubRepo}/actions/runs/${runId}/jobs`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `token ${formData.githubToken}`
          }
        }
      )
      if (response.ok) {
        const data = await response.json()
        const jobId = data.jobs?.[0]?.id
        if (jobId) {
          const logsResponse = await fetch(
            `https://api.github.com/repos/${formData.githubRepo}/actions/jobs/${jobId}/logs`,
            {
              headers: {
                'Authorization': `token ${formData.githubToken}`
              }
            }
          )
          if (logsResponse.ok) {
            const logsText = await logsResponse.text()
            setBuildStatus(prev => ({ ...prev, logs: logsText }))
          }
        }
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
    }
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
          message: 'Build triggered successfully! Waiting for progress...' 
        })
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
    const maxAttempts = 120 // Poll for 20 minutes

    const checkStatus = async () => {
      try {
        const response = await fetch(
          `https://api.github.com/repos/${formData.githubRepo}/actions/runs?event=workflow_dispatch`,
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
                // Fetch release to get the download link
                const releaseResponse = await fetch(
                  `https://api.github.com/repos/${formData.githubRepo}/releases`,
                  {
                    headers: {
                      'Accept': 'application/vnd.github.v3+json',
                      'Authorization': `token ${formData.githubToken}`
                    }
                  }
                )
                let releaseUrl = ''
                if (releaseResponse.ok) {
                  const releases = await releaseResponse.json()
                  releaseUrl = releases[0]?.html_url || ''
                }

                setBuildStatus({
                  status: 'success',
                  message: 'Build completed successfully!',
                  runId: latestRun.id,
                  runUrl: latestRun.html_url,
                  downloadUrl: `${latestRun.html_url}/artifacts`,
                  releaseUrl: releaseUrl
                })
                fetchLogs(latestRun.id)
                return true
              } else {
                setBuildStatus({
                  status: 'error',
                  message: `Build failed: ${latestRun.conclusion}`,
                  runUrl: latestRun.html_url,
                  runId: latestRun.id
                })
                fetchLogs(latestRun.id)
                return true
              }
            } else {
              setBuildStatus({
                status: 'building',
                message: `Build in progress: ${latestRun.status}...`,
                runUrl: latestRun.html_url,
                runId: latestRun.id
              })
              // Occasionally fetch logs during build
              if (attempts % 3 === 0) fetchLogs(latestRun.id)
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

    setTimeout(checkStatus, 5000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pb-12">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
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
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="packageName" className="text-slate-300">Package Name</Label>
                        <Input id="packageName" name="packageName" value={formData.packageName} onChange={handleInputChange} className="bg-slate-900/50 border-slate-600 text-white" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="appVersion" className="text-slate-300">Version</Label>
                        <Input id="appVersion" name="appVersion" value={formData.appVersion} onChange={handleInputChange} className="bg-slate-900/50 border-slate-600 text-white" />
                      </div>
                    </div>

                    <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4 space-y-4">
                      <h4 className="text-blue-400 font-medium flex items-center gap-2">
                        <Github className="w-4 h-4" /> GitHub Configuration
                      </h4>
                      <div className="space-y-2">
                        <Label htmlFor="githubRepo" className="text-slate-300">Repository (owner/repo)</Label>
                        <Input id="githubRepo" name="githubRepo" placeholder="username/repo" value={formData.githubRepo} onChange={handleInputChange} className="bg-slate-900/50 border-slate-600 text-white" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="githubToken" className="text-slate-300">Personal Access Token</Label>
                        <Input id="githubToken" name="githubToken" type="password" placeholder="ghp_..." value={formData.githubToken} onChange={handleInputChange} className="bg-slate-900/50 border-slate-600 text-white" />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <Button onClick={triggerBuild} disabled={buildStatus.status === 'building'} className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6">
                  {buildStatus.status === 'building' ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Building APK...</> : <><Play className="w-5 h-5 mr-2" /> Build APK</>}
                </Button>
              </CardContent>
            </Card>

            {buildStatus.status !== 'idle' && (
              <div className="space-y-6">
                <Alert className={`${buildStatus.status === 'success' ? 'bg-green-900/30 border-green-700/50' : buildStatus.status === 'error' ? 'bg-red-900/30 border-red-700/50' : 'bg-blue-900/30 border-blue-700/50'}`}>
                  {buildStatus.status === 'success' ? <CheckCircle className="w-5 h-5 text-green-400" /> : buildStatus.status === 'error' ? <AlertCircle className="w-5 h-5 text-red-400" /> : <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />}
                  <AlertTitle className={buildStatus.status === 'success' ? 'text-green-400' : buildStatus.status === 'error' ? 'text-red-400' : 'text-blue-400'}>
                    {buildStatus.status.toUpperCase()}
                  </AlertTitle>
                  <AlertDescription className="text-slate-300">{buildStatus.message}</AlertDescription>
                </Alert>

                {(buildStatus.releaseUrl || buildStatus.runUrl) && (
                  <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardHeader><CardTitle className="text-white flex items-center gap-2"><Download className="w-5 h-5 text-green-400" /> Downloads & Links</CardTitle></CardHeader>
                    <CardContent className="flex flex-wrap gap-3">
                      {buildStatus.releaseUrl && (
                        <Button onClick={() => window.open(buildStatus.releaseUrl, '_blank')} className="bg-green-600 hover:bg-green-700 text-white">
                          <Download className="w-4 h-4 mr-2" /> Download APK (Release)
                        </Button>
                      )}
                      {buildStatus.runUrl && (
                        <Button variant="outline" onClick={() => window.open(buildStatus.runUrl, '_blank')} className="border-slate-600 text-slate-300">
                          <ExternalLink className="w-4 h-4 mr-2" /> View Build Run
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}

                <Collapsible open={showLogs} onOpenChange={setShowLogs} className="w-full">
                  <Card className="bg-slate-900 border-slate-700 overflow-hidden">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full flex items-center justify-between p-4 text-slate-300 hover:bg-slate-800">
                        <div className="flex items-center gap-2"><Terminal className="w-4 h-4" /> <span>Build Logs</span></div>
                        {showLogs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <ScrollArea className="h-[400px] w-full bg-black/50 p-4 font-mono text-xs text-slate-400">
                        <pre className="whitespace-pre-wrap">{buildStatus.logs || 'Waiting for logs...'}</pre>
                      </ScrollArea>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader><CardTitle className="text-white">How it works</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { id: 1, title: 'Fill Form', desc: 'Enter website and app details', color: 'bg-blue-500/20', text: 'text-blue-400' },
                  { id: 2, title: 'GitHub Actions', desc: 'Build is processed on GitHub', color: 'bg-purple-500/20', text: 'text-purple-400' },
                  { id: 3, title: 'Download APK', desc: 'Get your signed APK file', color: 'bg-green-500/20', text: 'text-green-400' }
                ].map(step => (
                  <div key={step.id} className="flex gap-3">
                    <div className={`w-8 h-8 ${step.color} rounded-lg flex items-center justify-center flex-shrink-0`}><span className={`${step.text} font-bold text-sm`}>{step.id}</span></div>
                    <div><h4 className="text-slate-200 font-medium">{step.title}</h4><p className="text-sm text-slate-400">{step.desc}</p></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
