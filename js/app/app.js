app = {
    init: function(){
        
        this.deviceInit();
        this.soundInit();
        this.userInit();

        state.mathTypeOptions = [];
        for(var i in data.mathTypes) {
            state.mathTypeOptions.push({value: i, label: data.mathTypes[i].label});
        }

        state.difficultyOptions = [];
        for(var i = 0; i < 4; i++) {
            state.difficultyOptions.push({value: i, label: 1 + i});
        }
        
        state.totalScore = engine.memory('score') || 0;
        
        state.sideMenuController = new slidebars();
        state.sideMenuController.init();
        
        renderer.changePage('splash');
    },
    openMenu: function(e) {
        if(!state.meunOpen) {
            state.menuOpening = true;
            setTimeout(function(){
                state.sideMenuController.open( 'id-1' );
                state.menuOpening = false;
                state.meunOpen = true;
            });
        }
    },
    closeMenu: function(e) {
        if(state.sideMenuController.isActive() && !state.menuOpening) {
            state.sideMenuController.close( 'id-1' );
            state.meunOpen = false;
        }
    },
    problemInit: function(type, difficulty) {
        state.mathType = data.mathTypes[type];
        state.mathDifficutly = difficulty;
        state.correct = '';
        state.incorrect = '';
        state.answer = '';
        state.mathProblem = engine.generateProblem(state.mathType, state.mathDifficutly);
        engine.timer(true);
        engine.answer(true);
    
        $('[data-input="answer"]').focus().val('');
    },
    next: function(e) {
        var $input = $('[data-input=answer]');
        $input.focus();
        $input.select();
        $input.data('selected', true);
        if(engine.reduceAnswer(state.answer) == state.mathProblem.solution.toString()) {
            state.incorrect = "";
            var time = engine.timer();
            var answers = engine.answer(true);
            var score = engine.answerScore(state.mathProblem.baseScore, state.mathProblem.expectedTime, time, answers);
            
            renderer.trigger('score', [score]);
            
            $input.data('selected', false);
            app.playSound('success');
            
            app.problemInit('addition', state.mathDifficutly);
        } else {
            engine.answer(false);
            app.playSound('fail');
            state.incorrect = "Incorrect, try again.";
            renderer.updateView();
        }
        e.preventDefault();
        
    },
    keypadPress: function(e) {
        e.preventDefault();
        var $input = $('[data-input=answer]');
        var key = $(e.target).data('key');
        
        var which = 48 + parseInt(key);
        if(key == '.') which = 46;
        
        var keydown = jQuery.Event('keydown', {which: which, keyCode: which});
        var keypress = jQuery.Event('keypress', {which: which, keyCode: which});
        var keyup = jQuery.Event('keyup', {which: which, keyCode: which});
        
        app.playSound('keypress');
        
        $input.trigger(keydown);
        $input.trigger(keypress);
        $input.trigger(keyup);
        
    },
    backspace: function(e) {
        var $input = $('[data-input=answer]');
        var val = $input.val()
        $input.val(val.substring(0, val.length-1));
        $input.change();
        app.playSound('keypress');
        e.preventDefault();
    },
    answerKeyPress: function (e) {
        var $elem = $(e.target);
        
        if(e.which == 13 || e.which == 9) {
            e.preventDefault();
           $elem.submit();
        } else if(e.which == 8) {
            app.backspace(e);
        } else if(e.which > 31) {
            var charCode = (e.which >= 96 && e.which <= 105) ? e.which - 96 + 48 : e.which;
            if($elem.data('selected')) {
                $elem.val(String.fromCharCode(charCode));
                $elem.data('selected', false);
            } else {
                $elem.val($elem.val() + String.fromCharCode(charCode));
            }
            $elem.change();
        }
        
    },
    submit: function(){
        $(this).submit();
    },
    updateEquation: function() {
        app.problemInit('addition', state.mathDifficutly);
        renderer.updateView();
    },
    soundInit: function(){
        state.sounds = {};
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            window.audioContext = new window.AudioContext();

            state.sounds.fail = new player([
                'audio/fart1.mp3',
                'audio/fart2.mp3',
                'audio/fart3.mp3',
                'audio/fart2.mp3',
                'audio/fart1.mp3',
                'audio/fart3.mp3',
            ], 2);
            state.sounds.keypress = new player('audio/keypress.mp3');
            state.sounds.success = new player('audio/success.mp3');
            
            function player(files) {
                files = !$.isArray(files) ? [files] : files;
                var counter = 0;
                var sounds = [];
                for(var j = 0; j < files.length; j++) {
                    var file = files[j];
                    sounds.push(new WebAudioAPISound(file))
                }
                this.play = function(){
                    sounds[counter++%files.length].play();
                };
            }

        } catch (e) {
            state.sounds.fail = new player([
                'audio/fart1.mp3',
                'audio/fart2.mp3',
                'audio/fart3.mp3',
                'audio/fart2.mp3',
                'audio/fart1.mp3',
                'audio/fart3.mp3',
            ], 2);

            state.sounds.keypress = new player('audio/keypress.mp3', 6);
            state.sounds.success = new player('audio/success.mp3');

            function player(files, count) {
                files = !$.isArray(files) ? [files] : files;
                count = count || 1;
                var sounds = [];
                var counter = 0;
                for(var i = 0; i < count; i++) {
                    for(var j = 0; j < files.length; j++) {
                        var file = files[j];
                        sounds.push($('<audio></audio>', {
                            preload: 'auto',
                        }).append('<source>', {
                            src: file
                        }).appendTo('body'));
                    }
                }
                this.play = function(){
                    sounds[counter++%(files.length*count)].play();
                };
            }
        }
    },
    playSound: function(type) {
        state.sounds[type].play();
    },
    deviceInit: function(){
        $("html").css({"font-size": ($(window).height()/47)+"px"});
        $(window).resize(function(){
            if(navigator.userAgent.toLowerCase().indexOf("android") === -1 ||
                (document.activeElement.type !== 'text' &&
                 document.activeElement.type !== 'number')) {
                $("html").css({"font-size": ($(window).height()/47)+"px"});
            }
        });
        $(window).on('orientationchange', function(){
            $("html").css({"font-size": ($(window).height()/47)+"px"});
        });
        document.addEventListener('gesturestart', function (e) {
            e.preventDefault();
        });

        state.language = ((window.navigator.languages || [])[0] || window.navigator.language);
        state.direction =  state.language === 'he-IL' ? 'rtl' : 'ltr';
    },
    userInit: function() {
        state.user = null;
        state.profile = {
            name: engine.memory('name') || '',
            age: engine.memory('age') || '',
        };

        // Initialize Firebase
        state.firebaseConfig = {
            apiKey: "AIzaSyCiXYr-DDjNpKNB-sftiOTx8_JcVGldqQA",
            authDomain: "math-addict.firebaseapp.com",
            databaseURL: "https://math-addict.firebaseio.com",
            projectId: "math-addict",
            storageBucket: "",
            messagingSenderId: "749701753480"
        };
        state.firebaseApp = firebase.initializeApp(state.firebaseConfig);
        state.firebaseApp.auth().onAuthStateChanged(function(user) {
            setTimeout(function(){
                if (user) {
                    state.user = user;
                    engine.userStore('user', 'score').then(function (score) {
                        if(!score) {
                            score = 0;
                        }
                        engine.memory('score', score);
                        state.totalScore = score;
                        engine.onUserUpdate('score', function(score){
                            if(score) {
                                engine.memory('score', score);
                                state.totalScore = score;
                            }
                        });
                    }, function (e) {
                    });
                    renderer.changePage('practice');
                } else {
                    state.user = null;
                    renderer.changePage('login');
                }
            }, 3000);
        });
        state.firebaseApp.auth().useDeviceLanguage();
    },
};