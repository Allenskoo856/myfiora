import fetch from './fetch';
import config from '@fiora/config/client';

function withServer(url = '') {
    if (!url) return url;
    if (/^https?:\/\//.test(url) || url.startsWith('//')) return url;
    const base = config.server || '';
    if (base.endsWith('/') && url.startsWith('/')) {
        return `${base.slice(0, -1)}${url}`;
    }
    return `${base}${url}`;
}

/**
 * 初始化（保留接口兼容性，但不做任何操作）
 */
export async function initOSS() {
    // 不再使用OSS，保留空函数避免调用报错
}

/**
 * 获取文件URL（移除OSS处理逻辑）
 */
export function getOSSFileUrl(url = '', process = '') {
    const fullUrl = withServer(url);
    return process ? `${fullUrl}${process}` : fullUrl;
}

/**
 * 上传文件到本地服务器
 * @param blob 文件blob数据
 * @param fileName 文件名
 */
export default async function uploadFile(
    blob: Blob,
    fileName: string,
): Promise<string> {
    const [uploadErr, result] = await fetch('uploadFile', {
        file: blob,
        fileName,
    });
    if (uploadErr) {
        throw Error(uploadErr);
    }
    return withServer(result.url);
}
