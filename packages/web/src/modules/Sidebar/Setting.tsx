import React from 'react';
import { useSelector } from 'react-redux';
import Switch from 'react-switch';
import { RadioGroup, RadioButton } from 'react-radio-buttons';

import playSound from '../../utils/playSound';
import Dialog from '../../components/Dialog';
import useAction from '../../hooks/useAction';
import { State } from '../../state/reducer';

import Style from './Setting.less';
import Common from './Common.less';
import {
    Tabs,
    TabPane,
    ScrollableInkTabBar,
    TabContent,
} from '../../components/Tabs';
import { LocalStorageKey } from '../../localStorage';
import { clamp } from '../../utils/clamp';

interface SettingProps {
    visible: boolean;
    onClose: () => void;
}

function Setting(props: SettingProps) {
    const { visible, onClose } = props;

    const action = useAction();
    const soundSwitch = useSelector((state: State) => state.status.soundSwitch);
    const notificationSwitch = useSelector(
        (state: State) => state.status.notificationSwitch,
    );
    const voiceSwitch = useSelector((state: State) => state.status.voiceSwitch);
    const selfVoiceSwitch = useSelector(
        (state: State) => state.status.selfVoiceSwitch,
    );
    const sound = useSelector((state: State) => state.status.sound);
    const tagColorMode = useSelector(
        (state: State) => state.status.tagColorMode,
    );
    const enableSearchExpression = useSelector(
        (state: State) => state.status.enableSearchExpression,
    );
    const fontSize = useSelector((state: State) => state.status.fontSize);

    function handleSelectSound(newSound: string) {
        playSound(newSound);
        action.setStatus('sound', newSound);
    }

    function handleFontSizeChange(value: string) {
        const size = clamp(Number(value) || 0, 12, 20);
        action.setStatus('fontSize', size);
        window.localStorage.setItem(LocalStorageKey.FontSize, String(size));
    }

    return (
        <Dialog
            className={`dialog ${Style.setting}`}
            visible={visible}
            onClose={onClose}
        >
            <Tabs
                defaultActiveKey="function"
                renderTabBar={() => <ScrollableInkTabBar />}
                renderTabContent={() => <TabContent />}
            >
                <TabPane tab="功能" key="function">
                    <div
                        className={`${Common.container} ${Style.scrollContainer}`}
                    >
                        <div className={Common.block}>
                            <p className={Common.title}>开关</p>
                            <div className={Style.switchContainer}>
                                <div className={Style.switch}>
                                    <p className={Style.switchText}>声音提醒</p>
                                    <Switch
                                        onChange={(value) =>
                                            action.setStatus(
                                                'soundSwitch',
                                                value,
                                            )
                                        }
                                        checked={soundSwitch}
                                    />
                                </div>
                                <div className={Style.switch}>
                                    <p className={Style.switchText}>桌面提醒</p>
                                    <Switch
                                        onChange={(value) =>
                                            action.setStatus(
                                                'notificationSwitch',
                                                value,
                                            )
                                        }
                                        checked={notificationSwitch}
                                    />
                                </div>
                                <div className={Style.switch}>
                                    <p className={Style.switchText}>语音播报</p>
                                    <Switch
                                        onChange={(value) =>
                                            action.setStatus(
                                                'voiceSwitch',
                                                value,
                                            )
                                        }
                                        checked={voiceSwitch}
                                    />
                                </div>
                                <div className={Style.switch}>
                                    <p className={Style.switchText}>
                                        播报自己消息
                                    </p>
                                    <Switch
                                        onChange={(value) =>
                                            action.setStatus(
                                                'selfVoiceSwitch',
                                                value,
                                            )
                                        }
                                        checked={selfVoiceSwitch}
                                    />
                                </div>
                                <div className={Style.switch}>
                                    <p className={Style.switchText}>
                                        根据输入内容推荐表情
                                    </p>
                                    <Switch
                                        onChange={(value) =>
                                            action.setStatus(
                                                'enableSearchExpression',
                                                value,
                                            )
                                        }
                                        checked={enableSearchExpression}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={Common.block}>
                            <p className={Common.title}>提示音</p>
                            <div>
                                <RadioGroup
                                    className={Style.radioGroup}
                                    value={sound}
                                    onChange={handleSelectSound}
                                    horizontal
                                >
                                    <RadioButton value="default">
                                        默认
                                    </RadioButton>
                                    <RadioButton value="apple">
                                        苹果
                                    </RadioButton>
                                    <RadioButton value="pcqq">
                                        电脑QQ
                                    </RadioButton>
                                    <RadioButton value="mobileqq">
                                        手机QQ
                                    </RadioButton>
                                    <RadioButton value="momo">陌陌</RadioButton>
                                    <RadioButton value="huaji">
                                        滑稽
                                    </RadioButton>
                                </RadioGroup>
                            </div>
                        </div>
                        <div className={Common.block}>
                            <p className={Common.title}>标签颜色</p>
                            <div>
                                <RadioGroup
                                    className={Style.TagModeRadioGroup}
                                    value={tagColorMode}
                                    onChange={(newValue: string) =>
                                        action.setStatus(
                                            'tagColorMode',
                                            newValue,
                                        )
                                    }
                                    horizontal
                                >
                                    <RadioButton value="singleColor">
                                        单一颜色
                                    </RadioButton>
                                    <RadioButton value="fixedColor">
                                        固定颜色
                                    </RadioButton>
                                    <RadioButton value="randomColor">
                                        随机颜色
                                    </RadioButton>
                                </RadioGroup>
                            </div>
                        </div>
                        <div className={Common.block}>
                            <p className={Common.title}>聊天字体大小</p>
                            <div className={Style.switchContainer}>
                                <div className={Style.switch}>
                                    <p className={Style.switchText}>{`${fontSize}px`}</p>
                                    <input
                                        className={Style.fontSizeInput}
                                        type="number"
                                        min={12}
                                        max={20}
                                        value={fontSize}
                                        onChange={(e) =>
                                            handleFontSizeChange(
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </TabPane>
            </Tabs>
        </Dialog>
    );
}

export default Setting;
