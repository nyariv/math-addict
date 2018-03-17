app.competitionInit = function(){
    state.competitionPart = 'view/page/subpage/competition-start.html';
    state.mathTypeSelected = 'addition';
    state.mathDifficulty = 0;
    state.competitionStarted = false;
    state.competition = {};
    
    renderer.listen('score', function(score){
        state.additionalScore = score;
        state.additionalScoreClass = 'additional show';
        setTimeout(function(){
            state.additionalScoreClass = 'additional';
            renderer.updateView();
        }, 1000);
        state.competition.score += score;
        state.competition.questionNum++;
        state.competition.questionProgress = (state.competition.questionNum + 1) + '/20';
        if(state.competition.questionNum >= 20) {
            state.competitionPart = 'view/page/subpage/competition-finish.html';
        }
    });
};

app.competitionProblemInit = function(){
    app.problemInit(state.competition.type, state.competition.difficulty)
}

app.startCompetition = function(){
    if(!state.profile.name || !state.profile.age) {
        state.competition.error = "Invalid details";
        return;
    }
    state.competition.error = '';
    engine.memory('name', state.profile.name);
    engine.memory('age', state.profile.age);
    state.competition = {
        name: state.profile.name,
        age: state.profile.age,
        difficulty: state.mathDifficulty,
        type: state.mathTypeSelected,
        startTime: new Date(),
        score: 0,
        questionNum: 0,
        questionProgress: '1/20',
    };
    $('[data-input="answer"]').val('');
    state.competitionStarted = true;
    state.competitionPart = 'view/page/subpage/competition-problem.html';
}

app.finishCompetitionInit = function() {
    var totalTime = new Date().getTime() - state.competition.startTime.getTime()
    var payload = {
        age: state.competition.age,
        totalTime: totalTime,
        difficulty: state.competition.difficulty,
        name: state.competition.name,
        score: state.competition.score,
        timestamp: state.competition.startTime.toISOString(),
        type: state.competition.type,
        uid: state.user.uid,
    };

    state.totalScore = engine.memory('score') + payload.score;
    engine.memory('score', state.totalScore);
    state.competition.timeText = Math.round(totalTime/100)/10 + 's';
    state.competitionStarted = false;

    var scores = {};

    var updateHighScore = function(hclass) {
        engine.userStore('score-20/' + hclass, 'score').then(function(oldScore){
            if(!oldScore || (oldScore < state.competition.score)) {
                engine.userStore('score-20/' + hclass, undefined, payload);
            }
        });
    }

    updateHighScore(engine.highscoreClass(payload.type, payload.difficulty, payload.age));
    updateHighScore(engine.highscoreClass(payload.type, payload.difficulty));
    updateHighScore(engine.highscoreClass(payload.type));
    updateHighScore(engine.highscoreClass());
}