data = {
    mathTypes: {
        addition: {
            label: "Addition",
            description: "Add the numbers.",
            difficultyParams: [
                {
                    baseScore: 10,
                    expectedTime: 1500,
                    equationTemplate: {a:'i',op:'+',b:'i'},
                    vars: {
                        "i": {min: 0,max: 10}
                    }
                },
                {
                    baseScore: 20,
                    expectedTime: 2500,
                    equationTemplate: {a:'i',op:'+',b:'i'},
                    vars: {
                        "i": {min: 0,max: 20}
                    }
                },
                {
                    baseScore: 30,
                    expectedTime: 3500,
                    equationTemplate: {a:{a:'i',op:'+',b:'i'}, op: "+", b: 'i'},
                    vars: {
                        "i": {min: 0,max: 10}
                    }
                },
                {
                    baseScore: 50,
                    expectedTime: 5000,
                    equationTemplate: {a:{a:'i',op:'+',b:'i'}, op: "+", b: 'i'},
                    vars: {
                        "i": {min: 0,max: 20}
                    }
                }
            ]
        }
    },
    pages: {
        splash: {
            template: 'view/page/splash.html',
            title: 'Math Addict',
        },
        practice: {
            template: 'view/page/practice.html',
            title: 'Practice',
            init: 'practiceInit'
        },
        highscore: {
            template: 'view/page/highscore.html',
            title: 'Highscore',
            init: 'highscoreInit'
        },
        competition: {
            template: 'view/page/competition.html',
            title: 'Competition',
            init: 'competitionInit'
        },
        login: {
            template: 'view/page/login.html',
            title: 'Login',
            init: 'loginInit'
        }
    }
};