import React, { useState } from 'react';
import loadable from '@loadable/component';

import Style from './CodeMessage.less';

const CodeDialogAsync = loadable(() =>
    // @ts-ignore
    import(/* webpackChunkName: "code-dialog" */ './CodeDialog'),
);

type LanguageMap = {
    [language: string]: string;
};

const languagesMap: LanguageMap = {
    javascript: 'javascript',
    typescript: 'typescript',
    java: 'java',
    c_cpp: 'cpp',
    python: 'python',
    ruby: 'ruby',
    php: 'php',
    golang: 'go',
    csharp: 'csharp',
    html: 'html',
    css: 'css',
    sql: 'sql',
    json: 'json',
    text: 'text',
};

interface CodeMessageProps {
    code: string;
}

function CodeMessage(props: CodeMessageProps) {
    const { code } = props;

    const [codeDialog, toggleCodeDialog] = useState(false);

    const parseResult = /@language=([_a-z]+)@/.exec(code);
    if (!parseResult) {
        return <pre className="code">不支持的编程语言</pre>;
    }

    const language = languagesMap[parseResult[1]] || 'text';
    const rawCode = code.replace(/@language=[_a-z]+@/, '');
    const lines = rawCode.split('\n').length;
    let size = `${rawCode.length}B`;
    if (rawCode.length > 1024) {
        size = `${Math.ceil((rawCode.length / 1024) * 100) / 100}KB`;
    }

    return (
        <>
            <div
                className={Style.codeMessage}
                onClick={() => toggleCodeDialog(true)}
                role="button"
            >
                <div className={Style.codeHeader}>
                    <div className={Style.codeDots}>
                        <span className={Style.dot} data-color="red" />
                        <span className={Style.dot} data-color="yellow" />
                        <span className={Style.dot} data-color="green" />
                    </div>
                    <div className={Style.languageTag}>{language}</div>
                </div>
                <div className={Style.codeBody}>
                    <div className={Style.iconWrapper}>
                        <i className="iconfont icon-code" />
                    </div>
                    <div className={Style.codeDetails}>
                        <div className={Style.codeTitle}>Code Snippet</div>
                        <div className={Style.codeStats}>
                            <span className={Style.statItem}>
                                <i className="iconfont icon-info" style={{ fontSize: '12px', marginRight: '4px' }} />
                                {lines} 行
                            </span>
                            <span className={Style.statDivider}>·</span>
                            <span className={Style.statItem}>{size}</span>
                        </div>
                    </div>
                </div>
                <div className={Style.codeFooter}>
                    <span className={Style.viewButton}>
                        查看代码
                        <i className="iconfont icon-gongneng" style={{ fontSize: '12px', marginLeft: '6px' }} />
                    </span>
                </div>
            </div>
            {codeDialog && (
                <CodeDialogAsync
                    visible={codeDialog}
                    onClose={() => toggleCodeDialog(false)}
                    language={language}
                    code={rawCode}
                />
            )}
        </>
    );
}

export default CodeMessage;
