app.practiceInit = function(){
    app.problemInit('addition', 0);

    renderer.listen('score', function(score){
        state.additionalScore = score;
        state.additionalScoreClass = 'additional show';
        setTimeout(function(){
            state.additionalScoreClass = 'additional';
            renderer.updateView();
        }, 1000);

        state.totalScore += score;
        engine.memory('score', state.totalScore);
        engine.userStore('user', 'score', state.totalScore);
    });
};



