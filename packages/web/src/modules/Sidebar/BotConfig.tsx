import React, { useEffect, useState } from 'react';
import { css } from 'linaria';
import Common from './Common.less';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Message from '../../components/Message';
import {
    getBotConfig,
    configureBot,
    toggleBot,
    testLLMConnection,
} from '../../service';

const styles = {
    container: css`
        padding: 16px;
    `,
    block: css`
        margin-bottom: 24px;
    `,
    title: css`
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 12px;
        color: var(--primary-text-color);
    `,
    inputRow: css`
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        gap: 8px;
    `,
    label: css`
        min-width: 80px;
        font-size: 13px;
        color: var(--primary-text-color);
    `,
    input: css`
        flex: 1;
        height: 36px;
    `,
    textarea: css`
        flex: 1;
        min-height: 80px;
        padding: 8px;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        background-color: var(--background-color);
        color: var(--primary-text-color);
        font-size: 13px;
        resize: vertical;
        &:focus {
            outline: none;
            border-color: var(--primary-color);
        }
    `,
    buttonGroup: css`
        display: flex;
        gap: 12px;
        margin-top: 16px;
    `,
    button: css`
        min-width: 100px;
        height: 36px;
    `,
    toggleButton: css`
        min-width: 120px;
        height: 36px;
    `,
    status: css`
        display: inline-block;
        padding: 4px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        margin-left: 12px;
    `,
    statusEnabled: css`
        background-color: rgba(82, 196, 26, 0.15);
        color: #52c41a;
    `,
    statusDisabled: css`
        background-color: rgba(255, 77, 79, 0.15);
        color: #ff4d4f;
    `,
    slider: css`
        flex: 1;
        height: 36px;
        display: flex;
        align-items: center;
        gap: 12px;
    `,
    sliderInput: css`
        flex: 1;
        height: 6px;
        border-radius: 3px;
        -webkit-appearance: none;
        appearance: none;
        background: var(--border-color);
        outline: none;
        &::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: var(--primary-color);
            cursor: pointer;
        }
        &::-moz-range-thumb {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: var(--primary-color);
            cursor: pointer;
            border: none;
        }
    `,
    sliderValue: css`
        min-width: 40px;
        text-align: center;
        font-size: 13px;
        color: var(--primary-text-color);
    `,
};

type BotConfig = {
    _id?: string;
    name: string;
    avatar: string;
    enabled: boolean;
    config: {
        llmUrl: string;
        apiKey: string;
        model: string;
        systemPrompt: string;
        temperature: number;
        maxTokens: number;
        maxHistory: number;
    };
};

function BotConfig() {
    const [botConfig, setBotConfig] = useState<BotConfig>({
        name: 'AI助手',
        avatar: '',
        enabled: false,
        config: {
            llmUrl: '',
            apiKey: '',
            model: 'gpt-3.5-turbo',
            systemPrompt: '你是一个友好的AI助手，请用简洁、准确的语言回答用户的问题。',
            temperature: 0.7,
            maxTokens: 2000,
            maxHistory: 10,
        },
    });

    const [loading, setLoading] = useState(false);

    async function loadBotConfig() {
        const config = await getBotConfig();
        if (config) {
            setBotConfig(config);
        }
    }

    useEffect(() => {
        loadBotConfig();
    }, []);

    async function handleSave() {
        if (!botConfig.name.trim()) {
            Message.error('机器人名称不能为空');
            return;
        }
        if (!botConfig.config.llmUrl.trim()) {
            Message.error('LLM URL不能为空');
            return;
        }
        if (!botConfig.config.apiKey.trim()) {
            Message.error('API Key不能为空');
            return;
        }
        if (!botConfig.config.model.trim()) {
            Message.error('模型名称不能为空');
            return;
        }

        setLoading(true);
        const result = await configureBot({
            name: botConfig.name,
            avatar: botConfig.avatar,
            config: botConfig.config,
        });
        setLoading(false);

        if (result) {
            Message.success('保存配置成功');
            loadBotConfig();
        }
    }

    async function handleToggle() {
        if (!botConfig._id) {
            Message.error('请先保存配置');
            return;
        }

        setLoading(true);
        const result = await toggleBot(!botConfig.enabled);
        setLoading(false);

        if (result) {
            Message.success(`已${result.enabled ? '启用' : '禁用'}AI机器人`);
            loadBotConfig();
        }
    }

    async function handleTest() {
        if (!botConfig.config.llmUrl.trim() || !botConfig.config.apiKey.trim()) {
            Message.error('请先填写LLM URL和API Key');
            return;
        }

        setLoading(true);
        const result = await testLLMConnection({
            llmUrl: botConfig.config.llmUrl,
            apiKey: botConfig.config.apiKey,
            model: botConfig.config.model,
        });
        setLoading(false);

        if (result?.success) {
            Message.success('连接测试成功');
        } else {
            Message.error(`连接测试失败: ${result?.message || '未知错误'}`);
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.block}>
                <p className={styles.title}>
                    AI机器人状态
                    <span
                        className={`${styles.status} ${
                            botConfig.enabled
                                ? styles.statusEnabled
                                : styles.statusDisabled
                        }`}
                    >
                        {botConfig.enabled ? '已启用' : '已禁用'}
                    </span>
                </p>
                <Button
                    className={styles.toggleButton}
                    type={botConfig.enabled ? 'danger' : 'primary'}
                    onClick={handleToggle}
                    disabled={loading}
                >
                    {botConfig.enabled ? '禁用机器人' : '启用机器人'}
                </Button>
            </div>

            <div className={styles.block}>
                <p className={styles.title}>基础配置</p>
                <div className={styles.inputRow}>
                    <span className={styles.label}>机器人名称:</span>
                    <Input
                        className={styles.input}
                        value={botConfig.name}
                        onChange={(value) =>
                            setBotConfig({ ...botConfig, name: value })
                        }
                        placeholder="例如: AI助手"
                    />
                </div>
                <div className={styles.inputRow}>
                    <span className={styles.label}>头像URL:</span>
                    <Input
                        className={styles.input}
                        value={botConfig.avatar}
                        onChange={(value) =>
                            setBotConfig({ ...botConfig, avatar: value })
                        }
                        placeholder="留空则使用默认头像"
                    />
                </div>
            </div>

            <div className={styles.block}>
                <p className={styles.title}>LLM配置</p>
                <div className={styles.inputRow}>
                    <span className={styles.label}>LLM URL:</span>
                    <Input
                        className={styles.input}
                        value={botConfig.config.llmUrl}
                        onChange={(value) =>
                            setBotConfig({
                                ...botConfig,
                                config: { ...botConfig.config, llmUrl: value },
                            })
                        }
                        placeholder="例如: https://api.openai.com/v1/chat/completions"
                    />
                </div>
                <div className={styles.inputRow}>
                    <span className={styles.label}>API Key:</span>
                    <Input
                        className={styles.input}
                        type="password"
                        value={botConfig.config.apiKey}
                        onChange={(value) =>
                            setBotConfig({
                                ...botConfig,
                                config: { ...botConfig.config, apiKey: value },
                            })
                        }
                        placeholder="输入API Key"
                    />
                </div>
                <div className={styles.inputRow}>
                    <span className={styles.label}>模型:</span>
                    <Input
                        className={styles.input}
                        value={botConfig.config.model}
                        onChange={(value) =>
                            setBotConfig({
                                ...botConfig,
                                config: { ...botConfig.config, model: value },
                            })
                        }
                        placeholder="例如: gpt-3.5-turbo"
                    />
                </div>
                <div className={styles.inputRow}>
                    <span className={styles.label}>系统提示词:</span>
                    <textarea
                        className={styles.textarea}
                        value={botConfig.config.systemPrompt}
                        onChange={(e) =>
                            setBotConfig({
                                ...botConfig,
                                config: {
                                    ...botConfig.config,
                                    systemPrompt: e.target.value,
                                },
                            })
                        }
                        placeholder="定义AI机器人的角色和行为"
                    />
                </div>
            </div>

            <div className={styles.block}>
                <p className={styles.title}>高级配置</p>
                <div className={styles.inputRow}>
                    <span className={styles.label}>Temperature:</span>
                    <div className={styles.slider}>
                        <input
                            className={styles.sliderInput}
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={botConfig.config.temperature}
                            onChange={(e) =>
                                setBotConfig({
                                    ...botConfig,
                                    config: {
                                        ...botConfig.config,
                                        temperature: parseFloat(e.target.value),
                                    },
                                })
                            }
                        />
                        <span className={styles.sliderValue}>
                            {botConfig.config.temperature}
                        </span>
                    </div>
                </div>
                <div className={styles.inputRow}>
                    <span className={styles.label}>最大Token:</span>
                    <Input
                        className={styles.input}
                        type="number"
                        value={botConfig.config.maxTokens.toString()}
                        onChange={(value) =>
                            setBotConfig({
                                ...botConfig,
                                config: {
                                    ...botConfig.config,
                                    maxTokens: parseInt(value) || 2000,
                                },
                            })
                        }
                    />
                </div>
                <div className={styles.inputRow}>
                    <span className={styles.label}>历史轮数:</span>
                    <Input
                        className={styles.input}
                        type="number"
                        value={botConfig.config.maxHistory.toString()}
                        onChange={(value) =>
                            setBotConfig({
                                ...botConfig,
                                config: {
                                    ...botConfig.config,
                                    maxHistory: parseInt(value) || 10,
                                },
                            })
                        }
                    />
                </div>
            </div>

            <div className={styles.buttonGroup}>
                <Button
                    className={styles.button}
                    type="primary"
                    onClick={handleSave}
                    disabled={loading}
                >
                    保存配置
                </Button>
                <Button
                    className={styles.button}
                    onClick={handleTest}
                    disabled={loading}
                >
                    测试连接
                </Button>
            </div>
        </div>
    );
}

export default BotConfig;
