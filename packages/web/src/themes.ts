import BackgroundImage from '@fiora/assets/images/background.jpg';
import BackgroundCoolImage from '@fiora/assets/images/background-cool.jpg';

type Themes = {
    [theme: string]: {
        primaryColor: string;
        primaryTextColor: string;
        backgroundImage: string;
        aero: boolean;
    };
};

const themes: Themes = {
    default: {
        primaryColor: '78, 29, 103',
        primaryTextColor: '255, 255, 255',
        backgroundImage: '',
        aero: false,
    },
    cool: {
        primaryColor: '5,159,149',
        primaryTextColor: '255, 255, 255',
        backgroundImage: BackgroundCoolImage,
        aero: false,
    },
};

export default themes;
