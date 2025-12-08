import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { Linkman, State } from '../../state/reducer';
import LinkmanComponent from './Linkman';
import { getBotConfig } from '../../service';

import Style from './LinkmanList.less';

function LinkmanList() {
    const linkmans = useSelector((state: State) => state.linkmans);
    const isLogin = useSelector((state: State) => !!state.user);
    const [botInfo, setBotInfo] = useState<{
        _id: string;
        name: string;
        avatar: string;
        enabled: boolean;
    } | null>(null);

    useEffect(() => {
        if (isLogin) {
            getBotConfig().then((config) => {
                if (config && config.enabled) {
                    setBotInfo({
                        _id: config._id,
                        name: config.name,
                        avatar: config.avatar,
                        enabled: config.enabled,
                    });
                } else {
                    setBotInfo(null);
                }
            });
        }
    }, [isLogin]);

    function renderLinkman(linkman: Linkman) {
        const messages = Object.values(linkman.messages);
        const lastMessage =
            messages.length > 0 ? messages[messages.length - 1] : null;

        let time = new Date(linkman.createTime);
        let preview = '暂无消息';
        if (lastMessage) {
            time = new Date(lastMessage.createTime);
            const { type } = lastMessage;
            preview = type === 'text' ? `${lastMessage.content}` : `[${type}]`;
            if (linkman.type === 'group') {
                preview = `${lastMessage.from.username}: ${preview}`;
            }
        }
        return (
            <LinkmanComponent
                key={linkman._id}
                id={linkman._id}
                name={linkman.name}
                avatar={linkman.avatar}
                preview={preview}
                time={time}
                unread={linkman.unread}
            />
        );
    }

    function getLinkmanLastTime(linkman: Linkman): number {
        let time = linkman.createTime;
        const messages = Object.values(linkman.messages);
        if (messages.length > 0) {
            time = messages[messages.length - 1].createTime;
        }
        return new Date(time).getTime();
    }

    function sort(linkman1: Linkman, linkman2: Linkman): number {
        return getLinkmanLastTime(linkman1) < getLinkmanLastTime(linkman2)
            ? 1
            : -1;
    }

    return (
        <div className={Style.linkmanList}>
            {botInfo && (
                <LinkmanComponent
                    key={`bot-${botInfo._id}`}
                    id={`bot-${botInfo._id}`}
                    name={botInfo.name}
                    avatar={botInfo.avatar}
                    preview="AI助手，随时为你服务"
                    time={new Date()}
                    unread={0}
                />
            )}
            {Object.values(linkmans)
                .sort(sort)
                .map((linkman) => renderLinkman(linkman))}
        </div>
    );
}

export default LinkmanList;
