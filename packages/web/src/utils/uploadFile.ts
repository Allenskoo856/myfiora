import fetch from './fetch';

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
    return url;
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
    return result.url;
}
