export const ASSET_CONFIG = {
    // Common assets
    audio: {
        critterCall: '../assets/sounds/tamagotchi_alert.mp3'
    },

    // Baby sprites
    baby: {
        idle: { path: '../assets/baby/baby_idle1.PNG', frameWidth: 256, frameHeight: 256 },
        eat: { path: '../assets/baby/baby_eating.PNG', frameWidth: 128, frameHeight: 128},
        sick_idle: { path: '../assets/baby/baby_sick_idle.PNG', frameWidth: 256, frameHeight: 256 },
        turn_sick: { path: '../assets/baby/baby_turn_sick.PNG' , frameWidth: 256, frameHeight: 256 }
    },

    // Adult variants
    variants: {
        chiikawa: {
            idle: { path: '../assets/chiikawa/chiikawa_idle1.PNG', frameWidth: 128, frameHeight: 128 },
            eat: { path: '../assets/chiikawa/chiikawa_eating.PNG', frameWidth: 128, frameHeight: 128 },
            sick_idle: { path: '../assets/chiikawa/chiikawa_sick_idle.PNG', frameWidth: 256, frameHeight: 256 },
            turn_sick: { path: '../assets/chiikawa/chiikawa_turn_sick.PNG', frameWidth: 256, frameHeight: 256 }
        },
        hachiware: {
            idle: { path: '../assets/hachiware/hachiware_idle1.PNG', frameWidth: 256, frameHeight: 256 },
            eat: { path: '../assets/hachiware/hachiware_eating.PNG', frameWidth: 128, frameHeight: 128 },
            sick_idle: { path: '../assets/hachiware/hachiware_sick_idle.PNG', frameWidth: 256, frameHeight: 256 },
            turn_sick: { path: '../assets/hachiware/hachiware_turn_sick.PNG', frameWidth: 256, frameHeight: 256 }
        },
        usagi: {
            idle: { path: '../assets/usagi/usagi_idle1.PNG', frameWidth: 128, frameHeight: 158 },
            eat: { path: '../assets/usagi/usagi_eating.PNG', frameWidth: 128, frameHeight: 158 },
            sick_idle: { path: '../assets/usagi/usagi_sick_idle.PNG', frameWidth: 316, frameHeight: 316 },
            turn_sick: { path: '../assets/usagi/usagi_turn_sick.PNG', frameWidth: 316, frameHeight: 316 }
        },
        momonga: {
            idle: { path: '../assets/momonga/momonga_idle1.PNG', frameWidth: 256, frameHeight: 256 },
            eat: { path: '../assets/momonga/momonga_eating.PNG', frameWidth: 256, frameHeight: 256 },
            sick_idle: { path: '../assets/momonga/momonga_sick_idle.PNG', frameWidth: 256, frameHeight: 256 },
            turn_sick: { path: '../assets/momonga/momonga_turn_sick.PNG', frameWidth: 256, frameHeight: 256 }
        },
        shisa: {
            idle: { path: '../assets/shisa/shisa_idle1.PNG', frameWidth: 128, frameHeight: 128 },
            eat: { path: '../assets/shisa/shisa_eating.PNG', frameWidth: 256, frameHeight: 256 },
            sick_idle: { path: '../assets/shisa/shisa_sick_idle.PNG', frameWidth: 256, frameHeight: 256 },
            turn_sick: { path: '../assets/shisa/shisa_turn_sick.PNG', frameWidth: 256, frameHeight: 256 }
        },

    },

    // Common settings
    spritesheetSettings: {
        frameWidth: 256,
        frameHeight: 256,
        margin: 0,
        spacing: 0
    }
};
