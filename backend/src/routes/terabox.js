const express = require('express');
const axios = require('axios');
const qs = require('qs');
const router = express.Router();

// User agents untuk rotasi
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15'
];

const getRandomUserAgent = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

// Extract share ID dari URL
const extractShareId = (url) => {
  const patterns = [
    /teraboxapp\.com\/s\/([a-zA-Z0-9_-]+)/i,
    /terabox\.com\/s\/([a-zA-Z0-9_-]+)/i,
    /\/s\/([a-zA-Z0-9_-]+)/i,
    /surl=([a-zA-Z0-9_-]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// Get file info dari Terabox
const getFileInfo = async (shareId, password = '') => {
  try {
    const userAgent = getRandomUserAgent();
    
    // Get initial page untuk cookies
    const initialResponse = await axios.get(`https://teraboxapp.com/s/${shareId}`, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      maxRedirects: 5,
      timeout: 30000
    });

    // Extract jsToken dan logid
    const jsTokenMatch = initialResponse.data.match(/jsToken\s*[:=]\s*['"]([^'"]+)['"]/);
    const logidMatch = initialResponse.data.match(/logid\s*[:=]\s*['"]([^'"]+)['"]/);
    
    const jsToken = jsTokenMatch ? jsTokenMatch[1] : '';
    const logid = logidMatch ? logidMatch[1] : '';

    // Get file list
    const params = {
      surl: shareId,
      logid: logid || Buffer.from(shareId).toString('base64'),
      pwd: password,
      uk: '',
      shareid: '',
      primaryid: ''
    };

    const listResponse = await axios.get('https://teraboxapp.com/api/shorturlinfo', {
      params,
      headers: {
        'User-Agent': userAgent,
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': `https://teraboxapp.com/s/${shareId}`,
        'X-Requested-With': 'XMLHttpRequest',
        'Cookie': initialResponse.headers['set-cookie']?.join('; ') || ''
      },
      timeout: 30000
    });

    if (listResponse.data.errno !== 0) {
      throw new Error(listResponse.data.errmsg || 'Failed to get file info');
    }

    return {
      jsToken,
      logid: params.logid,
      data: listResponse.data,
      cookies: initialResponse.headers['set-cookie'] || []
    };
  } catch (error) {
    console.error('Error getting file info:', error.message);
    throw error;
  }
};

// Get download link
const getDownloadLink = async (shareId, fsId, jsToken, logid, cookies) => {
  try {
    const userAgent = getRandomUserAgent();
    
    const params = {
      surl: shareId,
      fsids: `[${fsId}]`,
      logid: logid,
      sign: jsToken || '',
      timestamp: Date.now()
    };

    const response = await axios.get('https://teraboxapp.com/api/get-download-link', {
      params,
      headers: {
        'User-Agent': userAgent,
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': `https://teraboxapp.com/s/${shareId}`,
        'X-Requested-With': 'XMLHttpRequest',
        'Cookie': cookies.join('; ')
      },
      timeout: 30000
    });

    if (response.data.errno !== 0) {
      throw new Error(response.data.errmsg || 'Failed to get download link');
    }

    return response.data;
  } catch (error) {
    console.error('Error getting download link:', error.message);
    throw error;
  }
};

// Format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Parse file list recursively
const parseFileList = (list, path = '') => {
  const files = [];
  
  for (const item of list) {
    const itemPath = path ? `${path}/${item.server_filename}` : item.server_filename;
    
    if (item.isdir === 1) {
      // Folder
      files.push({
        id: item.fs_id,
        name: item.server_filename,
        type: 'folder',
        path: itemPath,
        size: 0,
        sizeFormatted: '-',
        children: item.children ? parseFileList(item.children, itemPath) : []
      });
    } else {
      // File
      files.push({
        id: item.fs_id,
        name: item.server_filename,
        type: 'file',
        path: itemPath,
        size: item.size,
        sizeFormatted: formatFileSize(item.size),
        md5: item.md5 || '',
        thumbnail: item.thumbs?.url3 || ''
      });
    }
  }
  
  return files;
};

// GET /api/terabox/info - Get file/folder info
router.post('/info', async (req, res) => {
  try {
    const { url, password = '' } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL is required'
      });
    }

    const shareId = extractShareId(url);
    if (!shareId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Terabox URL'
      });
    }

    const fileInfo = await getFileInfo(shareId, password);
    const { data } = fileInfo;

    if (!data.list || data.list.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No files found'
      });
    }

    const files = parseFileList(data.list);
    const totalSize = files.reduce((acc, file) => acc + (file.size || 0), 0);

    res.json({
      success: true,
      data: {
        shareId,
        title: data.title || 'Untitled',
        uk: data.uk,
        shareid: data.shareid,
        creator: data.ukinfo?.uname || 'Unknown',
        avatar: data.ukinfo?.avatar_url || '',
        totalFiles: files.length,
        totalSize,
        totalSizeFormatted: formatFileSize(totalSize),
        files,
        hasPassword: !!data.pwd,
        expireTime: data.expireTime || null
      }
    });
  } catch (error) {
    console.error('Error in /info:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get file info'
    });
  }
});

// POST /api/terabox/download - Get download link for file
router.post('/download', async (req, res) => {
  try {
    const { url, fileId, password = '' } = req.body;

    if (!url || !fileId) {
      return res.status(400).json({
        success: false,
        message: 'URL and fileId are required'
      });
    }

    const shareId = extractShareId(url);
    if (!shareId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Terabox URL'
      });
    }

    const fileInfo = await getFileInfo(shareId, password);
    const downloadData = await getDownloadLink(
      shareId,
      fileId,
      fileInfo.jsToken,
      fileInfo.logid,
      fileInfo.cookies
    );

    if (!downloadData.list || !downloadData.list[0]) {
      return res.status(404).json({
        success: false,
        message: 'Download link not found'
      });
    }

    const downloadInfo = downloadData.list[0];

    res.json({
      success: true,
      data: {
        fileId,
        filename: downloadInfo.server_filename,
        downloadUrl: downloadInfo.dlink || downloadInfo.url,
        size: downloadInfo.size,
        sizeFormatted: formatFileSize(downloadInfo.size),
        md5: downloadInfo.md5,
        expireTime: Date.now() + (4 * 60 * 60 * 1000) // 4 hours
      }
    });
  } catch (error) {
    console.error('Error in /download:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get download link'
    });
  }
});

// POST /api/terabox/folder - Get all files in folder with download links
router.post('/folder', async (req, res) => {
  try {
    const { url, password = '' } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL is required'
      });
    }

    const shareId = extractShareId(url);
    if (!shareId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Terabox URL'
      });
    }

    const fileInfo = await getFileInfo(shareId, password);
    const { data, jsToken, logid, cookies } = fileInfo;

    if (!data.list || data.list.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No files found'
      });
    }

    // Get all file IDs (flatten)
    const getAllFileIds = (items) => {
      const ids = [];
      for (const item of items) {
        if (item.isdir === 1 && item.children) {
          ids.push(...getAllFileIds(item.children));
        } else if (item.isdir !== 1) {
          ids.push(item.fs_id);
        }
      }
      return ids;
    };

    const fileIds = getAllFileIds(data.list);

    if (fileIds.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No downloadable files found in folder'
      });
    }

    // Get download links for all files
    const downloadLinks = [];
    for (const fsId of fileIds) {
      try {
        const downloadData = await getDownloadLink(shareId, fsId, jsToken, logid, cookies);
        if (downloadData.list && downloadData.list[0]) {
          const info = downloadData.list[0];
          downloadLinks.push({
            fileId: fsId,
            filename: info.server_filename,
            downloadUrl: info.dlink || info.url,
            size: info.size,
            sizeFormatted: formatFileSize(info.size),
            md5: info.md5
          });
        }
      } catch (err) {
        console.error(`Error getting download link for ${fsId}:`, err.message);
      }
    }

    const files = parseFileList(data.list);
    const totalSize = files.reduce((acc, file) => acc + (file.size || 0), 0);

    res.json({
      success: true,
      data: {
        shareId,
        title: data.title || 'Untitled',
        creator: data.ukinfo?.uname || 'Unknown',
        totalFiles: downloadLinks.length,
        totalSize,
        totalSizeFormatted: formatFileSize(totalSize),
        files,
        downloadLinks,
        expireTime: Date.now() + (4 * 60 * 60 * 1000) // 4 hours
      }
    });
  } catch (error) {
    console.error('Error in /folder:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get folder contents'
    });
  }
});

module.exports = router;
