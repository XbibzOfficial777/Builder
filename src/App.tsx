import { useState } from 'react';
import { 
  Download, 
  Folder, 
  File, 
  Link2, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Copy,
  FolderOpen,
  Music,
  Image,
  Video,
  FileText,
  Archive,
  Code
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import './App.css';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  size: number;
  sizeFormatted: string;
  md5?: string;
  thumbnail?: string;
  children?: FileItem[];
  downloadUrl?: string;
}

interface FileInfo {
  shareId: string;
  title: string;
  uk: string;
  shareid: string;
  creator: string;
  avatar: string;
  totalFiles: number;
  totalSize: number;
  totalSizeFormatted: string;
  files: FileItem[];
  hasPassword: boolean;
  expireTime: string | null;
}

interface DownloadLink {
  fileId: string;
  filename: string;
  downloadUrl: string;
  size: number;
  sizeFormatted: string;
  md5: string;
}

function App() {
  const [url, setUrl] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [downloadLinks, setDownloadLinks] = useState<DownloadLink[]>([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('info');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext || '')) return <Image className="w-5 h-5" />;
    if (['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv'].includes(ext || '')) return <Video className="w-5 h-5" />;
    if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma'].includes(ext || '')) return <Music className="w-5 h-5" />;
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '')) return <Archive className="w-5 h-5" />;
    if (['txt', 'doc', 'docx', 'pdf', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext || '')) return <FileText className="w-5 h-5" />;
    if (['js', 'ts', 'html', 'css', 'json', 'xml', 'py', 'java', 'cpp', 'c'].includes(ext || '')) return <Code className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const fetchFileInfo = async () => {
    if (!url.trim()) {
      setError('Please enter a Terabox URL');
      return;
    }

    setLoading(true);
    setError('');
    setFileInfo(null);
    setDownloadLinks([]);

    try {
      const response = await fetch(`${API_BASE_URL}/api/terabox/info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, password }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to get file info');
      }

      setFileInfo(data.data);
      toast.success('File info retrieved successfully!');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      toast.error(err.message || 'Failed to get file info');
    } finally {
      setLoading(false);
    }
  };

  const fetchDownloadLink = async (fileId: string) => {
    setDownloading(fileId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/terabox/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, fileId, password }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to get download link');
      }

      setDownloadLinks(prev => [...prev, data.data]);
      toast.success('Download link generated!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to get download link');
    } finally {
      setDownloading(null);
    }
  };

  const fetchFolderDownloads = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/terabox/folder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, password }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to get folder contents');
      }

      setDownloadLinks(data.data.downloadLinks);
      toast.success(`Found ${data.data.downloadLinks.length} files!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to get folder contents');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const renderFileTree = (files: FileItem[], level = 0) => {
    return files.map((file) => (
      <div key={file.id} className={`${level > 0 ? 'ml-6' : ''}`}>
        <div className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg group">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="text-muted-foreground">
              {file.type === 'folder' ? <FolderOpen className="w-5 h-5 text-yellow-500" /> : getFileIcon(file.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{file.sizeFormatted}</p>
            </div>
          </div>
          {file.type === 'file' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => fetchDownloadLink(file.id)}
              disabled={downloading === file.id}
            >
              {downloading === file.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
        {file.children && file.children.length > 0 && (
          <div className="mt-1">
            {renderFileTree(file.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Download className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Terabox Downloader</h1>
              <p className="text-xs text-muted-foreground">Fast & Reliable</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="hidden sm:flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Online
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Download Terabox Files
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Paste your Terabox link below to get direct download links. Supports both files and folders.
          </p>
        </div>

        {/* Input Section */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Paste Terabox URL here..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="pl-10 h-12"
                    onKeyDown={(e) => e.key === 'Enter' && fetchFileInfo()}
                  />
                </div>
                <Input
                  placeholder="Password (if required)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="sm:w-48 h-12"
                  type="password"
                />
                <Button 
                  onClick={fetchFileInfo} 
                  disabled={loading}
                  className="h-12 px-8"
                  size="lg"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <ExternalLink className="w-5 h-5 mr-2" />
                  )}
                  Get Info
                </Button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {fileInfo && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">
                <Folder className="w-4 h-4 mr-2" />
                File Info
              </TabsTrigger>
              <TabsTrigger value="downloads">
                <Download className="w-4 h-4 mr-2" />
                Download Links
                {downloadLinks.length > 0 && (
                  <Badge variant="secondary" className="ml-2">{downloadLinks.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-6">
              {/* File Info Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{fileInfo.title}</CardTitle>
                      <CardDescription className="mt-2">
                        Shared by {fileInfo.creator}
                      </CardDescription>
                    </div>
                    {fileInfo.avatar && (
                      <img 
                        src={fileInfo.avatar} 
                        alt={fileInfo.creator}
                        className="w-12 h-12 rounded-full"
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="bg-muted/50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold">{fileInfo.totalFiles}</p>
                      <p className="text-xs text-muted-foreground">Files</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold">{fileInfo.totalSizeFormatted}</p>
                      <p className="text-xs text-muted-foreground">Total Size</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold">{fileInfo.hasPassword ? 'Yes' : 'No'}</p>
                      <p className="text-xs text-muted-foreground">Password</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-500">Active</p>
                      <p className="text-xs text-muted-foreground">Status</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      onClick={fetchFolderDownloads}
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Folder className="w-4 h-4 mr-2" />
                      )}
                      Get All Download Links
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* File Tree */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="w-5 h-5" />
                    File Structure
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    {renderFileTree(fileInfo.files)}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="downloads">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Download Links
                  </CardTitle>
                  <CardDescription>
                    {downloadLinks.length > 0 
                      ? `Found ${downloadLinks.length} download links` 
                      : 'No download links yet. Click "Get All Download Links" or individual file download buttons.'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {downloadLinks.length > 0 ? (
                    <div className="space-y-3">
                      {downloadLinks.map((link, index) => (
                        <div 
                          key={link.fileId} 
                          className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                            <div className="text-muted-foreground">
                              {getFileIcon(link.filename)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{link.filename}</p>
                              <p className="text-xs text-muted-foreground">{link.sizeFormatted}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(link.downloadUrl)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => window.open(link.downloadUrl, '_blank')}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Download className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No download links available</p>
                      <Button 
                        onClick={fetchFolderDownloads}
                        disabled={loading}
                        className="mt-4"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Folder className="w-4 h-4 mr-2" />
                        )}
                        Get All Links
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Features Section */}
        {!fileInfo && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Card className="text-center p-6">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Download className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Fast Downloads</h3>
              <p className="text-sm text-muted-foreground">Get direct download links without speed limits</p>
            </Card>
            <Card className="text-center p-6">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Folder className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Folder Support</h3>
              <p className="text-sm text-muted-foreground">Download entire folders with one click</p>
            </Card>
            <Card className="text-center p-6">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">No Login Required</h3>
              <p className="text-sm text-muted-foreground">Download files without Terabox account</p>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 Terabox Downloader. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
