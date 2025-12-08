import React, { useState, useEffect } from 'react';
import { css } from 'linaria';
import filesize from 'filesize';
import { getGroupFiles } from '../../service';
import { getOSSFileUrl } from '../../utils/uploadFile';
import Avatar from '../../components/Avatar';
import Message from '../../components/Message';
import Time from '@fiora/utils/time';

const styles = {
    container: css`
        height: 100%;
        display: flex;
        flex-direction: column;
    `,
    
    header: css`
        padding: 16px;
        border-bottom: 1px solid #eee;
        background: #f5f5f5;
    `,
    
    title: css`
        font-size: 14px;
        font-weight: 600;
        color: #333;
        margin: 0;
    `,
    
    count: css`
        font-size: 12px;
        color: #999;
        margin: 4px 0 0 0;
    `,
    
    listContainer: css`
        flex: 1;
        overflow-y: auto;
        padding: 8px;
    `,
    
    fileItem: css`
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        margin: 4px 0;
        background: #fff;
        border-radius: 8px;
        border: 1px solid #eee;
        transition: all 0.2s ease;
        cursor: pointer;
        
        &:hover {
            background: #f8f9fa;
            border-color: #d0d7de;
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }
    `,
    
    fileIcon: css`
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 8px;
        color: #fff;
        font-size: 18px;
        flex-shrink: 0;
    `,
    
    fileContent: css`
        flex: 1;
        min-width: 0;
    `,
    
    fileName: css`
        font-size: 14px;
        font-weight: 500;
        color: #333;
        margin: 0 0 4px 0;
        word-break: break-all;
        line-height: 1.3;
    `,
    
    fileInfo: css`
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
    `,
    
    uploader: css`
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: #666;
    `,
    
    uploaderName: css`
        font-weight: 500;
    `,
    
    fileSize: css`
        font-size: 12px;
        color: #999;
    `,
    
    uploadTime: css`
        font-size: 12px;
        color: #999;
    `,
    
    downloadBtn: css`
        padding: 6px 12px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        flex-shrink: 0;
        
        &:hover {
            opacity: 0.8;
            transform: scale(1.05);
        }
    `,
    
    loading: css`
        text-align: center;
        color: #666;
        padding: 32px;
        font-size: 14px;
    `,
    
    empty: css`
        text-align: center;
        color: #999;
        padding: 64px 32px;
        font-size: 14px;
    `,
    
    error: css`
        text-align: center;
        color: #ff4d4f;
        padding: 32px;
        font-size: 14px;
    `,
    
    loadMore: css`
        margin: 16px;
        padding: 8px;
        background: #f0f0f0;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.2s ease;
        
        &:hover {
            background: #e0e0e0;
        }
        
        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    `
};

interface FileItem {
    _id: string;
    filename: string;
    fileUrl: string;
    size: number;
    ext: string;
    uploader: {
        _id: string;
        username: string;
        avatar: string;
    };
    uploadTime: string;
}

interface GroupFilesListProps {
    groupId: string;
}

function GroupFilesList({ groupId }: GroupFilesListProps) {
    const [files, setFiles] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const loadFiles = async (pageNum = 1, append = false) => {
        try {
            if (!append) setLoading(true);
            else setLoadingMore(true);
            
            const result = await getGroupFiles(groupId, pageNum, 20);
            
            if (append) {
                setFiles(prev => [...prev, ...result.files]);
            } else {
                setFiles(result.files);
            }
            
            setTotal(result.total);
            setHasMore(result.hasMore);
            setPage(pageNum);
            setError('');
        } catch (err) {
            console.error('获取群文件失败:', err);
            setError('获取群文件失败，请重试');
            Message.error('获取群文件失败');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        if (groupId) {
            loadFiles(1, false);
        }
    }, [groupId]);

    const handleLoadMore = () => {
        loadFiles(page + 1, true);
    };

    const handleDownloadFile = (fileUrl: string, filename: string) => {
        const url = getOSSFileUrl(fileUrl);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getFileIcon = (ext: string) => {
        const iconMap: Record<string, string> = {
            pdf: '📄',
            doc: '📝',
            docx: '📝',
            txt: '📄',
            xls: '📊',
            xlsx: '📊',
            ppt: '📋',
            pptx: '📋',
            zip: '📦',
            rar: '📦',
            jpg: '🖼️',
            jpeg: '🖼️',
            png: '🖼️',
            gif: '🖼️',
            mp4: '🎬',
            avi: '🎬',
            mp3: '🎵',
            wav: '🎵',
        };
        return iconMap[ext.toLowerCase()] || '📁';
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    正在加载群文件...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>群文件</h3>
                <p className={styles.count}>共 {total} 个文件</p>
            </div>
            
            <div className={styles.listContainer}>
                {files.length === 0 ? (
                    <div className={styles.empty}>
                        暂无群文件
                    </div>
                ) : (
                    files.map((file) => (
                        <div
                            key={file._id}
                            className={styles.fileItem}
                            onClick={() => handleDownloadFile(file.fileUrl, file.filename)}
                        >
                            <div className={styles.fileIcon}>
                                {getFileIcon(file.ext)}
                            </div>
                            
                            <div className={styles.fileContent}>
                                <p className={styles.fileName}>{file.filename}</p>
                                
                                <div className={styles.fileInfo}>
                                    <div className={styles.uploader}>
                                        <Avatar size={16} src={file.uploader.avatar} />
                                        <span className={styles.uploaderName}>
                                            {file.uploader.username}
                                        </span>
                                    </div>
                                    
                                    <span className={styles.fileSize}>
                                        {filesize(file.size)}
                                    </span>
                                    
                                    <span className={styles.uploadTime}>
                                        {Time.getMonthDate(new Date(file.uploadTime))}
                                    </span>
                                </div>
                            </div>
                            
                            <button
                                className={styles.downloadBtn}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadFile(file.fileUrl, file.filename);
                                }}
                            >
                                下载
                            </button>
                        </div>
                    ))
                )}
                
                {hasMore && (
                    <button
                        className={styles.loadMore}
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                    >
                        {loadingMore ? '正在加载...' : '加载更多'}
                    </button>
                )}
            </div>
        </div>
    );
}

export default React.memo(GroupFilesList);