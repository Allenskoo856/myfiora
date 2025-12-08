import fs from 'fs';
import path from 'path';
import axios from 'axios';
import assert, { AssertionError } from 'assert';
import { promisify } from 'util';
import RegexEscape from 'regex-escape';

import config from '@fiora/config/server';
import logger from '@fiora/utils/logger';
import User from '@fiora/database/mongoose/models/user';
import Group from '@fiora/database/mongoose/models/group';

import Socket from '@fiora/database/mongoose/models/socket';
import {
    getAllSealIp,
    getAllSealUser,
    getSealIpKey,
    getSealUserKey,
    DisableSendMessageKey,
    DisableNewUserSendMessageKey,
    Redis,
} from '@fiora/database/redis/initRedis';

/**
 * 搜索用户和群组
 * @param ctx Context
 */
export async function search(ctx: Context<{ keywords: string }>) {
    const keywords = ctx.data.keywords?.trim() || '';
    if (keywords === '') {
        return {
            users: [],
            groups: [],
        };
    }

    const escapedKeywords = RegexEscape(keywords);
    const users = await User.find(
        { username: { $regex: escapedKeywords } },
        { avatar: 1, username: 1 },
    );
    const groups = await Group.find(
        { name: { $regex: escapedKeywords } },
        { avatar: 1, name: 1, members: 1 },
    );

    return {
        users,
        groups: groups.map((group) => ({
            _id: group._id,
            avatar: group.avatar,
            name: group.name,
            members: group.members.length,
        })),
    };
}

/**
 * 搜索表情包
 * @param ctx Context
 */
export async function searchExpression(
    ctx: Context<{ keywords: string; limit?: number }>,
) {
    // 搜狐在线API已禁用（内网部署不需要外网依赖）
    // 返回空列表
    return [];
}

/**
 * 封禁用户, 需要管理员权限
 * @param ctx Context
 */
export async function sealUser(ctx: Context<{ username: string }>) {
    const { username } = ctx.data;
    assert(username !== '', 'username不能为空');

    const user = await User.findOne({ username });
    if (!user) {
        throw new AssertionError({ message: '用户不存在' });
    }

    const userId = user._id.toString();
    const isSealUser = await Redis.has(getSealUserKey(userId));
    assert(!isSealUser, '用户已在封禁名单');

    await Redis.set(getSealUserKey(userId), userId, Redis.Minute * 10);

    return {
        msg: 'ok',
    };
}

/**
 * 获取封禁列表, 包含用户封禁和ip封禁, 需要管理员权限
 */
export async function getSealList() {
    const sealUserList = await getAllSealUser();
    const sealIpList = await getAllSealIp();
    const users = await User.find({ _id: { $in: sealUserList } });

    const result = {
        users: users.map((user) => user.username),
        ips: sealIpList,
    };
    return result;
}

const CantSealLocalIp = '不能封禁内网ip';
const CantSealSelf = '闲的没事封自己干啥';
const IpInSealList = 'ip已在封禁名单';

/**
 * 封禁 ip 地址, 需要管理员权限
 */
export async function sealIp(ctx: Context<{ ip: string }>) {
    const { ip } = ctx.data;
    assert(ip !== '::1' && ip !== '127.0.0.1', CantSealLocalIp);
    assert(ip !== ctx.socket.ip, CantSealSelf);

    const isSealIp = await Redis.has(getSealIpKey(ip));
    assert(!isSealIp, IpInSealList);

    await Redis.set(getSealIpKey(ip), ip, Redis.Hour * 6);

    return {
        msg: 'ok',
    };
}

/**
 * 封禁指定用户的所有在线 ip 地址, 需要管理员权限
 */
export async function sealUserOnlineIp(ctx: Context<{ userId: string }>) {
    const { userId } = ctx.data;

    const user = await User.findOne({ _id: userId });
    assert(user, '用户不存在');
    const sockets = await Socket.find({ user: userId });
    const ipList = [
        ...sockets.map((socket) => socket.ip),
        user.lastLoginIp,
    ].filter(
        (ip) =>
            ip !== '' &&
            ip !== '::1' &&
            ip !== '127.0.0.1' &&
            ip !== ctx.socket.ip,
    );

    // 如果全部 ip 都已经封禁过了, 则直接提示
    const isSealIpList = await Promise.all(
        ipList.map((ip) => Redis.has(getSealIpKey(ip))),
    );
    assert(!isSealIpList.every((isSealIp) => isSealIp), IpInSealList);

    await Promise.all(
        ipList.map(async (ip) => {
            await Redis.set(getSealIpKey(ip), ip, Redis.Hour * 6);
        }),
    );

    return {
        msg: 'ok',
    };
}

// getSTS 已移除，不再使用阿里云OSS

export async function uploadFile(
    ctx: Context<{ fileName: string; file: any; isBase64?: boolean }>,
) {
    try {
        // 静态资源目录在 packages/server/public，使用绝对路径定位
        const serverRoot = path.resolve(__dirname, '../..');
        const publicPath = path.join(serverRoot, 'public');
        const targetPath = path.resolve(publicPath, ctx.data.fileName);
        const targetDir = path.dirname(targetPath);

        await fs.promises.mkdir(targetDir, { recursive: true });

        await promisify(fs.writeFile)(
            targetPath,
            ctx.data.isBase64
                ? Buffer.from(ctx.data.file, 'base64')
                : ctx.data.file,
        );
        return {
            url: `/${ctx.data.fileName}`,
        };
    } catch (err) {
        const typedErr = err as Error;
        logger.error('[uploadFile]', typedErr.message);
        return `上传文件失败:${typedErr.message}`;
    }
}

export async function toggleSendMessage(ctx: Context<{ enable: boolean }>) {
    const { enable } = ctx.data;
    await Redis.set(DisableSendMessageKey, (!enable).toString());
    return {
        msg: 'ok',
    };
}

export async function toggleNewUserSendMessage(
    ctx: Context<{ enable: boolean }>,
) {
    const { enable } = ctx.data;
    await Redis.set(DisableNewUserSendMessageKey, (!enable).toString());
    return {
        msg: 'ok',
    };
}

export async function getSystemConfig() {
    return {
        disableSendMessage: (await Redis.get(DisableSendMessageKey)) === 'true',
        disableNewUserSendMessage:
            (await Redis.get(DisableNewUserSendMessageKey)) === 'true',
    };
}
