import React from 'react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

import expressions from '@fiora/utils/expressions';
import { TRANSPARENT_IMAGE } from '@fiora/utils/const';
import Style from './Message.less';

interface TextMessageProps {
    content: string;
}

const renderer = new marked.Renderer();
renderer.link = (href, title, text) => {
    const safeHref = href || '#';
    const titleAttr = title ? ` title="${title}"` : '';
    return `<a class="${Style.selecteAble}" href="${safeHref}"${titleAttr} rel="noopener noreferrer" target="_blank">${text}</a>`;
};

const expressionExtension: marked.MarkedExtension = {
    name: 'expression',
    level: 'inline',
    start(src: string) {
        return src.match(/#\([^)]+\)/)?.index;
    },
    tokenizer(src: string) {
        const rule = /^#\(([\u4e00-\u9fa5a-z]+)\)/i;
        const match = rule.exec(src);
        if (match) {
            return {
                type: 'expression',
                raw: match[0],
                text: match[1],
            } as any;
        }
        return undefined;
    },
    renderer(token: any) {
        const index = expressions.default.indexOf(token.text);
        if (index !== -1) {
            return `<img class="${Style.baidu} ${Style.selecteAble}" src="${TRANSPARENT_IMAGE}" style="background-position: left ${-30 * index}px;" onerror="this.style.display='none'" alt="${token.raw}" />`;
        }
        return token.raw;
    },
};

marked.use({ extensions: [expressionExtension] });
marked.setOptions({ renderer, gfm: true, breaks: true, mangle: false, headerIds: false });

function TextMessage(props: TextMessageProps) {
    const rawContent = props.content;
    const markedHtml = marked.parse(rawContent);
    const content = DOMPurify.sanitize(markedHtml, {
        ADD_ATTR: ['target', 'rel', 'class', 'style'],
    });

    return (
        <div
            className={Style.textMessage}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: content }}
        />
    );
}

export default TextMessage;
