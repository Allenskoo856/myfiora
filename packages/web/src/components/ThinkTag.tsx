import React, { useState } from 'react';
import { css } from 'linaria';

const styles = {
    thinkContainer: css`
        margin: 8px 0;
        padding: 12px;
        background-color: rgba(var(--primary-color-rgb, 74, 144, 226), 0.1);
        border-left: 3px solid var(--primary-color);
        border-radius: 4px;
        font-size: 13px;
    `,
    thinkHeader: css`
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        user-select: none;
        margin-bottom: 8px;
    `,
    thinkTitle: css`
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 600;
        color: var(--primary-color);
    `,
    thinkIcon: css`
        font-size: 16px;
    `,
    toggleIcon: css`
        font-size: 12px;
        transition: transform 0.2s;
    `,
    toggleIconExpanded: css`
        transform: rotate(90deg);
    `,
    thinkContent: css`
        color: var(--primary-text-color);
        line-height: 1.6;
        white-space: pre-wrap;
        word-wrap: break-word;
    `,
    thinkContentCollapsed: css`
        display: none;
    `,
};

interface ThinkTagProps {
    content: string;
}

function ThinkTag({ content }: ThinkTagProps) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className={styles.thinkContainer}>
            <div
                className={styles.thinkHeader}
                onClick={() => setExpanded(!expanded)}
            >
                <div className={styles.thinkTitle}>
                    <span className={styles.thinkIcon}>💭</span>
                    <span>思考过程</span>
                </div>
                <span
                    className={`${styles.toggleIcon} ${
                        expanded ? styles.toggleIconExpanded : ''
                    }`}
                >
                    ▶
                </span>
            </div>
            <div
                className={`${styles.thinkContent} ${
                    expanded ? '' : styles.thinkContentCollapsed
                }`}
            >
                {content}
            </div>
        </div>
    );
}

/**
 * 解析消息内容中的<think>标签
 * @param content 原始消息内容
 * @returns 包含React元素的数组
 */
export function parseThinkTags(content: string): (string | JSX.Element)[] {
    const thinkRegex = /<think>([\s\S]*?)<\/think>/g;
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let match;
    let thinkIndex = 0;

    while ((match = thinkRegex.exec(content)) !== null) {
        // 添加<think>标签之前的文本
        if (match.index > lastIndex) {
            parts.push(content.substring(lastIndex, match.index));
        }

        // 添加<think>标签组件
        parts.push(
            <ThinkTag key={`think-${thinkIndex++}`} content={match[1].trim()} />,
        );

        lastIndex = match.index + match[0].length;
    }

    // 添加最后一个<think>标签之后的文本
    if (lastIndex < content.length) {
        parts.push(content.substring(lastIndex));
    }

    return parts.length > 0 ? parts : [content];
}

export default ThinkTag;
