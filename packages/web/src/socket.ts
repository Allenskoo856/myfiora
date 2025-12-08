import IO from 'socket.io-client';
import platform from 'platform';

import convertMessage from '@fiora/utils/convertMessage';
import getFriendId from '@fiora/utils/getFriendId';
import config from '@fiora/config/client';
import notification from './utils/notification';
import voice from './utils/voice';
import { initOSS } from './utils/uploadFile';
import playSound from './utils/playSound';
import { Message, Linkman } from './state/reducer';
import {
    ActionTypes,
    SetLinkmanPropertyPayload,
    AddLinkmanHistoryMessagesPayload,
    AddLinkmanMessagePayload,
    DeleteMessagePayload,
} from './state/action';
import {
    guest,
    loginByToken,
    getLinkmanHistoryMessages,
    getLinkmansLastMessagesV2,
} from './service';
import store from './state/store';

const { dispatch } = store;

const options = {
    // reconnectionDelay: 1000,
};
const socket = IO(config.server, options);

async function loginFailback() {
    const defaultGroup = await guest(
        platform.os?.family,
        platform.name,
        platform.description,
    );
    if (defaultGroup) {
        const { messages } = defaultGroup;
        dispatch({
            type: ActionTypes.SetGuest,
            payload: defaultGroup,
        });

        messages.forEach(convertMessage);
        dispatch({
            type: ActionTypes.AddLinkmanHistoryMessages,
            payload: {
                linkmanId: defaultGroup._id,
                messages,
            },
        });
    }
}

socket.on('connect', async () => {
    dispatch({ type: ActionTypes.Connect, payload: '' });

    await initOSS();
    dispatch({ type: ActionTypes.Ready, payload: '' });

    const token = window.localStorage.getItem('token');
    if (token) {
        const user = await loginByToken(
            token,
            platform.os?.family,
            platform.name,
            platform.description,
        );
        if (user) {
            dispatch({
                type: ActionTypes.SetUser,
                payload: user,
            });
            const linkmanIds = [
                ...user.groups.map((group: any) => group._id),
                ...user.friends.map((friend: any) =>
                    getFriendId(friend.from, friend.to._id),
                ),
            ];
            const linkmanMessages = await getLinkmansLastMessagesV2(linkmanIds);
            Object.values(linkmanMessages).forEach(
                // @ts-ignore
                ({ messages }: { messages: Message[] }) => {
                    messages.forEach(convertMessage);
                },
            );
            dispatch({
                type: ActionTypes.SetLinkmansLastMessages,
                payload: linkmanMessages,
            });
            return;
        }
    }
    loginFailback();
});

socket.on('disconnect', () => {
    // @ts-ignore
    dispatch({ type: ActionTypes.Disconnect, payload: null });
});

let windowStatus = 'focus';
window.onfocus = () => {
    windowStatus = 'focus';
};
window.onblur = () => {
    windowStatus = 'blur';
};

let prevFrom: string | null = '';
let prevName = '';
socket.on('message', async (message: any) => {
    convertMessage(message);

    const state = store.getState();
    const isSelfMessage = message.from._id === state.user?._id;
    if (isSelfMessage && message.from.tag !== state.user?.tag) {
        dispatch({
            type: ActionTypes.UpdateUserInfo,
            payload: {
                tag: message.from.tag,
            },
        });
    }

    const linkman = state.linkmans[message.to];
    let title = '';
    if (linkman) {
        dispatch({
            type: ActionTypes.AddLinkmanMessage,
            payload: {
                linkmanId: message.to,
                message,
            } as AddLinkmanMessagePayload,
        });
        if (linkman.type === 'group') {
            title = `${message.from.username} 在 ${linkman.name} 对大家说:`;
        } else {
            title = `${message.from.username} 对你说:`;
        }
    } else {
        // 联系人不存在并且是自己发的消息, 不创建新联系人
        if (isSelfMessage) {
            return;
        }
        const newLinkman = {
            _id: getFriendId(state.user?._id as string, message.from._id),
            type: 'temporary',
            createTime: Date.now(),
            avatar: message.from.avatar,
            name: message.from.username,
            messages: [],
            unread: 1,
        };
        dispatch({
            type: ActionTypes.AddLinkman,
            payload: {
                linkman: newLinkman as unknown as Linkman,
                focus: false,
            },
        });
        title = `${message.from.username} 对你说:`;

        const messages = await getLinkmanHistoryMessages(newLinkman._id, 0);
        if (messages) {
            dispatch({
                type: ActionTypes.AddLinkmanHistoryMessages,
                payload: {
                    linkmanId: newLinkman._id,
                    messages,
                } as AddLinkmanHistoryMessagesPayload,
            });
        }
    }

    if (windowStatus === 'blur' && state.status.notificationSwitch) {
        notification(
            title,
            message.from.avatar,
            message.type === 'text'
                ? message.content.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
                : `[${message.type}]`,
            Math.random().toString(),
        );
    }

    if (state.status.soundSwitch) {
        const soundType = state.status.sound;
        playSound(soundType);
    }

    if (state.status.voiceSwitch) {
        if (message.type === 'text') {
            const text = message.content
                .replace(
                    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g,
                    '',
                )
                .replace(/#/g, '');

            if (text.length > 100) {
                return;
            }

            const from =
                linkman && linkman.type === 'group'
                    ? `${message.from.username}${
                        linkman.name === prevName ? '' : `在${linkman.name}`
                    }说`
                    : `${message.from.username}对你说`;
            if (text) {
                voice.push(
                    from !== prevFrom ? from + text : text,
                    message.from.username,
                );
            }
            prevFrom = from;
            prevName = message.from.username;
        } else if (message.type === 'system') {
            voice.push(message.from.originUsername + message.content, '');
            prevFrom = null;
        }
    }
});

socket.on(
    'changeGroupName',
    ({ groupId, name }: { groupId: string; name: string }) => {
        dispatch({
            type: ActionTypes.SetLinkmanProperty,
            payload: {
                linkmanId: groupId,
                key: 'name',
                value: name,
            } as SetLinkmanPropertyPayload,
        });
    },
);

socket.on('deleteGroup', ({ groupId }: { groupId: string }) => {
    dispatch({
        type: ActionTypes.RemoveLinkman,
        payload: groupId,
    });
});

socket.on('changeTag', (tag: string) => {
    dispatch({
        type: ActionTypes.UpdateUserInfo,
        payload: {
            tag,
        },
    });
});

socket.on(
    'deleteMessage',
    ({
        linkmanId,
        messageId,
        isAdmin,
    }: {
        linkmanId: string;
        messageId: string;
        isAdmin: boolean;
    }) => {
        dispatch({
            type: ActionTypes.DeleteMessage,
            payload: {
                linkmanId,
                messageId,
                shouldDelete: isAdmin,
            } as DeleteMessagePayload,
        });
    },
);

// Bot消息流式输出
const botStreamingMessages = new Map<string, string>();

socket.on('botMessageStream', ({ tempMessageId, chunk, botId }: {
    tempMessageId: string;
    chunk: string;
    botId: string;
}) => {
    const currentContent = botStreamingMessages.get(tempMessageId) || '';
    const newContent = currentContent + chunk;
    botStreamingMessages.set(tempMessageId, newContent);

    const state = store.getState();
    const focus = state.focus;
    
    // 检查是否已存在该临时消息
    const existingMessage = state.linkmans[focus]?.messages[tempMessageId];
    
    if (!existingMessage) {
        // 创建新的流式消息
        dispatch({
            type: ActionTypes.AddLinkmanMessage,
            payload: {
                linkmanId: focus,
                message: {
                    _id: tempMessageId,
                    type: 'text',
                    content: newContent,
                    from: {
                        _id: botId,
                        username: 'AI助手',
                        avatar: '',
                        originUsername: 'AI助手',
                        tag: 'bot',
                    },
                    loading: true,
                    createTime: new Date().toISOString(),
                },
            },
        });
    } else {
        // 更新现有消息内容
        dispatch({
            type: ActionTypes.UpdateMessage,
            payload: {
                linkmanId: focus,
                messageId: tempMessageId,
                value: {
                    ...existingMessage,
                    content: newContent,
                },
            },
        });
    }
});

socket.on('botMessageComplete', ({ tempMessageId, message }: {
    tempMessageId: string;
    message: any;
}) => {
    botStreamingMessages.delete(tempMessageId);
    
    const state = store.getState();
    const focus = state.focus;
    
    // 用完整消息替换临时消息
    dispatch({
        type: ActionTypes.DeleteMessage,
        payload: {
            linkmanId: focus,
            messageId: tempMessageId,
            shouldDelete: true,
        },
    });
    
    dispatch({
        type: ActionTypes.AddLinkmanMessage,
        payload: {
            linkmanId: focus,
            message,
        },
    });
});

socket.on('botMessageError', ({ tempMessageId, error }: {
    tempMessageId: string;
    error: string;
}) => {
    botStreamingMessages.delete(tempMessageId);
    
    const state = store.getState();
    const focus = state.focus;
    
    // 删除临时消息并显示错误
    dispatch({
        type: ActionTypes.DeleteMessage,
        payload: {
            linkmanId: focus,
            messageId: tempMessageId,
            shouldDelete: true,
        },
    });
    
    // 可以添加错误消息显示
    console.error('Bot message error:', error);
});

export default socket;
