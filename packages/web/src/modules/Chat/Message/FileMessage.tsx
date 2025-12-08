import React from 'react';
import { css } from 'linaria';
import filesize from 'filesize';
import { getOSSFileUrl } from '../../../utils/uploadFile';

const styles = {
    container: css`
        display: flex;
        flex-direction: column;
        min-width: 220px;
        max-width: 280px;
        padding: 14px 16px;
        cursor: pointer;
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(245, 87, 108, 0.25);
        transition: all 0.2s ease;
        color: #fff;
        text-decoration: none;

        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(245, 87, 108, 0.35);
        }
    `,
    fileInfo: css`
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
        padding-bottom: 10px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    `,
    icon: css`
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        flex-shrink: 0;

        &::before {
            content: '📄';
            font-size: 20px;
        }
    `,
    fileDetails: css`
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
        min-width: 0;
    `,
    fileInfoText: css`
        word-break: break-all;
        font-size: var(--chat-font-size, 14px);
        font-weight: 600;
        line-height: 1.4;
    `,
    fileSize: css`
        font-size: calc(var(--chat-font-size, 14px) - 2px);
        opacity: 0.9;
    `,
    button: css`
        display: inline-block;
        font-size: calc(var(--chat-font-size, 14px) - 1px);
        text-align: center;
        font-weight: 500;
        background: rgba(255, 255, 255, 0.25);
        padding: 6px 16px;
        border-radius: 6px;
        transition: background 0.2s ease;
        margin: 0;

        &:hover {
            background: rgba(255, 255, 255, 0.35);
        }
    `,
};

type Props = {
    file: string;
    percent: number;
};

function FileMessage({ file, percent }: Props) {
    const { fileUrl, filename, size } = JSON.parse(file);
    const url = fileUrl && getOSSFileUrl(fileUrl);

    return (
        <a
            className={styles.container}
            {...(fileUrl
                ? { href: url, download: filename, target: '_blank' }
                : {})}
        >
            <div className={styles.fileInfo}>
                <div className={styles.icon} />
                <div className={styles.fileDetails}>
                    <span className={styles.fileInfoText}>{filename}</span>
                    <span className={styles.fileSize}>{filesize(size)}</span>
                </div>
            </div>
            <div className={styles.button}>
                {percent === undefined || percent >= 100
                    ? '下载文件'
                    : `上传中... ${percent.toFixed(0)}%`}
            </div>
        </a>
    );
}

export default React.memo(FileMessage);
