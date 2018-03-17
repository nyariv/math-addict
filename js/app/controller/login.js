app.loginInit = function () {
    state.login = {};
    state.login.phoneNumber = '';
    state.login.email = '';
    state.login.password = '';
    state.login.code = '';
    state.login.step = 'email-input';
}

app.firebaseInit = function () {
    app.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('login-send', {
        'size': 'invisible',
        'callback': function(response) {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
          app.loginSend();
        }
      });
      app.recaptchaVerifier.render();
}

app.loginSend = function() {
    var phoneNumber = libphonenumber.format(state.login.phoneNumber, 'IL', 'International_plaintext');
    var appVerifier = app.recaptchaVerifier;
    if(phoneNumber) {
        var promise = firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier)
            .then(function (confirmationResult) {
                // SMS sent. Prompt user to type the code from the message, then sign the
                // user in with confirmationResult.confirm(code).
                state.login.step = 'code-input';
                app.loginWithFirebase = confirmationResult;
                renderer.updateView();
            }).catch(function (error) {
                // Error; SMS not sent
                // ...
                state.login.error = "Failed to send SMS";
                app.recaptchaVerifier.render().then(function(widgetId) {
                    grecaptcha.reset(widgetId);
                });
                renderer.updateView();
            });
            
        app.loader(promise);
    } else {
        state.login.error = "Enter your mobile"
    }
}

app.loginSubmit = function() {
    var promise = app.loginWithFirebase.confirm(state.login.code).then(function (result) {
        state.user = result.user;
    }).catch(function (error) {
        alert(error.message);
        state.login.error = "Invalid code"
    });
    
    app.loader(promise);
}

app.emailLogin = function() {
    if(!state.login.email || !state.login.password) {
        state.login.error = "Invalid details";
        return;
    }

    var promise = firebase.auth().signInWithEmailAndPassword(state.login.email, state.login.password).catch(function(error) {
        console.error(error);
        state.login.error = 'Wrong password or email';
        renderer.updateView();
      });

    app.loader(promise);
};

app.emailRegister = function() {
    if(!state.login.email || !state.login.password) {
        state.login.error = "Invalid details";
        return;
    }

    var promise = firebase.auth().createUserWithEmailAndPassword(state.login.email, state.login.password).catch(function(error) {
        console.error(error);
        state.login.error = error.message;
        renderer.updateView();
      });
      
    app.loader(promise);
}

app.anonymousLogin = function () {
    var promise = firebase.auth().signInAnonymously().catch(function(error) {
        console.error(error);
        state.login.error = error.message;
      });
      
    app.loader(promise);
}

app.loader = function (promise) {
    state.loader = true;
    promise.then(function(data) {
        state.loader = false;
    }).catch(function(err) {
        state.loader = false;
        throw err;
    });
}
