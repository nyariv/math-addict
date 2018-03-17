engine = {
    generateProblem: function(mathType, difficulty) {
        var Fraction = algebra.Fraction;
        var Expression = algebra.Expression;
        var Equation = algebra.Equation;
        
        var problem = {
            text: '',
            solution: 0
        };
        var params = mathType.difficultyParams[difficulty];
        
        if(!params) return false;
        
        var nextOperation = '+';
        
        problem.equation = equation(params.equationTemplate, params.vars);
        problem.solution = problem.equation.simplify();
        problem.tex = algebra.toTex(problem.equation);
        
        problem.baseScore = mathType.difficultyParams[difficulty].baseScore;
        problem.expectedTime = mathType.difficultyParams[difficulty].expectedTime;
        
        return problem;
        
        function generateNumber(min, max, whole) {
            var num = Math.random() * (max - min) + min;
            
            if(whole) {
                num = parseInt(num);
            }
            
            return num;
        }
        
        function equation(equationPart, varParams) {
            var part = $.extend({}, equationPart);
            
            var op = part.op;
            var a;
            var b;
            
            if(typeof part.a == 'object') {
                if(!part.a.simplify) { //is part of equation template
                    a = equation(part.a, varParams);
                } else { // is an expression
                    a = part.a;
                }
            } else { // is a replaceable placeholder
                a = new Expression(varReplace(part.a, varParams));
            }
    
            if(typeof part.b == 'object') {
                if(!part.b.constructor) { //is part of equation template
                    b = equation(part.b, varParams);
                } else { // is an expression
                    b = part.b;
                }
            } else { // is a replaceable placeholder
                b = new Expression(varReplace(part.b, varParams));
            }
            
            // return new Expression("1+1");
            
            if(op == '+') {
                return a.add(b, false);
            }
            if(op == '-') {
                return a.subtract(b, false);
            }
            if(op == '*') {
                return a.multiply(b, false);
            }
            if(op == '/') {
                return a.divide(b, false);
            }
            
            return a;
        }
        
        function varReplace(type, params) {
            var varParam = params[type];
            switch (type) {
                case 'i':
                    return parseInt(Math.random() * (varParam.max - varParam.min) + varParam.min);
            }
            
            return 0;
        }
    },
    reduceAnswer: function(answer, round) {
        round = round || 0;
        
        var Fraction = algebra.Fraction;
        var Expression = algebra.Expression;
        var Equation = algebra.Equation;
        
        var a = new Expression(answer);
        
        return Math.round(parseInt(a.simplify().toString()) * Math.pow(10, round))/Math.pow(10, round);
    },
    answerScore: function(base, expectedTime, actualTime, wrongAnswers){
        actualTime = (actualTime < 200) ? 200 : actualTime;
        return parseInt(base * (expectedTime / (actualTime + expectedTime * wrongAnswers)));
    },
    answer: function(reset) {
        var failed = state.failedAttempts || 0;
        if(!reset) {
            state.failedAttempts = ++failed;
        } else {
            state.failedAttempts = 0;
        }
        
        return failed;
    },
    timer: function(reset) {
        var time = new Date().getTime();
        var prevTime = reset ? time : state.timer || time;
        state.timer = time;
        return time - prevTime;
    },
    memory: function(key, set){
        var memory = JSON.parse(localStorage.getItem('memory') || '{}');
        if(typeof set !== 'undefined') {
            memory[key] = set;
            localStorage.setItem('memory', JSON.stringify(memory));
        }
        
        return memory[key];
    },
    highscoreClass: function(type, difficutlty, age) {
        return [type, difficutlty, age ? this.ageGroup(age) : ''].join('-');
    },
    ageGroup: function(age) {
        return age < 10 ? age : age < 20 ? Math.floor((age - 10) / 2) + 10 : Math.floor((age - 20) / 10) + 15;
    },
    store: function(path, set) {
        return new Promise(function(resolve, reject){

            if(!state.user) reject(new Error("User not logged in."));

            var userId = state.user.uid;
            if(typeof set !== 'undefined') {
                state.firebaseApp.database().ref(path).set(set).then(resolve, reject);
            } else {
                state.firebaseApp.database().ref(path).once('value').then(function(snapshot) {
                    resolve(snapshot.val());
                }, reject);
            }
        }).catch(function(e){
            console.error(e);
        });
    },
    storePush: function(path, set, id) {
        return new Promise(function(resolve, reject){

            if(!state.user) reject(new Error("User not logged in."));

            var userId = state.user.uid;
            if(typeof set !== 'undefined') {
                state.firebaseApp.database().ref(path).push(set).then(resolve, reject);
            } else {
                resolve(state.firebaseApp.database().ref(path).push().key);
            }
        }).catch(function(e){
            console.error(e);
        });
    },
    storePush: function(path, set) {
        return new Promise(function(resolve, reject){

            if(!state.user) reject(new Error("User not logged in."));

            var userId = state.user.uid;
            if(typeof set !== 'undefined') {
                state.firebaseApp.database().ref(path).push(set).then(resolve, reject);
            } else {
                resolve(state.firebaseApp.database().ref(path).push().key);
            }
        }).catch(function(e){
            console.error(e);
        });
    },
    onUpdate: function(path, callback) {
        if(!state.user) return;
        state.firebaseApp.database().ref(path).on('value', function(snapshot) {
            callback(snapshot.val());
            renderer.updateView();
          });
    },
    userStore: function(storage, property, set) {
        storage = storage + '/';
        var userId = state.user ? state.user.uid : '';
        return this.store(storage + userId + (typeof property !== 'undefined' ? '/' + property : ''), set);
    },
    onUserUpdate: function(path, callback) {
        if(!state.user) return;
        var userId = state.user.uid;
        this.onUpdate('user/' + userId + '/' + path, callback);
    }
};