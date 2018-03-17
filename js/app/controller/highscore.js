app.highscoreInit = function() {
    state.highscore = {
        difficulty: 0,
        type: 'addition',
        results: []
    };
    app.retrieveScores(state.highscore.type, state.highscore.difficulty);
}

app.difficultyUpdate = function(e) {
    app.retrieveScores('addition', $(e.target).val());
}

app.retrieveScores = function(type, difficulty, age) {
    let hclass = engine.highscoreClass(type, difficulty, age);
    state.firebaseApp.database().ref('score-20/' + hclass)
        .orderByChild('score')
        .limitToLast(10)
        .once('value', function(snapshot){
            var scores = [];
            snapshot.forEach(function(data){
                scores.push(data.val());
            });
            scores.sort(function(a, b){
                return b.score - a.score;
            });
            var highScoreResults = [];
            for(var i = 0; i < scores.length; i++) {
                var score = scores[i];
                var content = [$('<td>').addClass('position').text('#' + (1 + i))];
                content.push($('<td>').addClass('name').text(score['name'])); 
                content.push($('<td>').addClass('hscore').text(score['score']));

                var result = {
                    tag: 'tr',
                    attributes: {
                        'class': 'highscore ' + (score['uid'] === state.user.uid ? 'self' : ''),
                    },
                    content: content,
                };
                highScoreResults.push(result);
            }

            state.highscore.results = highScoreResults;
            
            renderer.updateView();
        });
}