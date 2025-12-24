(() => {
    const print = (variable) => console.log(variable);

    ele_passions = document.getElementById("passion");

    var shuffle = (ele) => {
        var m = this
        m.init = () => {
            m.code = "&#*+%?£@§$"
            m.message = 0
            m.current_length = 0
            m.fadeBuffer = false
            m.messages = [
                "experiences",
                "digital magic",
                "innovations",
                "solutions",
            ]
            setTimeout(m.animateIn, 100);
        }

        m.generateRandomString = (length) => {
            var random_text = '';
            while(random_text.length < length){
              random_text += m.code.charAt(Math.floor(Math.random()*m.code.length));
            }
            return random_text;
        };

        m.animateIn = () => {
            if(m.current_length < m.messages[m.message].length){
                m.current_length = m.current_length + 2;
                if(m.current_length > m.messages[m.message].length) {
                    m.current_length = m.messages[m.message].length;
                }

                var message = m.generateRandomString(m.current_length);
                ele.innerHTML = message

                setTimeout(m.animateIn, 20);
            } else {
                setTimeout(m.animateFadeBuffer, 20);
            }
        };

        m.animateFadeBuffer = () => {
            if(m.fadeBuffer === false){
              m.fadeBuffer = [];
              for(var i = 0; i < m.messages[m.message].length; i++){
                m.fadeBuffer.push({c: (Math.floor(Math.random()*12))+1, l: m.messages[m.message].charAt(i)});
              }
            }

            var do_cycles = false;
            var message = '';

            for(var i = 0; i < m.fadeBuffer.length; i++){
              var fader = m.fadeBuffer[i];
              if(fader.c > 0){
                do_cycles = true;
                fader.c--;
                message += m.code.charAt(Math.floor(Math.random()*m.code.length));
              } else {
                message += fader.l;
              }
            }

            ele.innerHTML = message

            if(do_cycles === true){
              setTimeout(m.animateFadeBuffer, 50);
            } else {
              setTimeout(m.cycleText, 2000);
            }
        };

        m.cycleText = () => {
            var nextMessage = m.message + 1;
            if(nextMessage >= m.messages.length){
              nextMessage = 0;
            }

            m.animateTransition(nextMessage);
        };

        m.animateTransition = (nextMessageIndex) => {
            var currentWord = m.messages[m.message];
            var nextWord = m.messages[nextMessageIndex];
            var maxLength = Math.max(currentWord.length, nextWord.length);

            if(!m.transitionBuffer) {
                m.transitionBuffer = [];
                m.transitionStep = 0;

                // Create transition buffer for each character position
                for(var i = 0; i < maxLength; i++){
                    m.transitionBuffer.push({
                        current: i < currentWord.length ? currentWord.charAt(i) : '',
                        target: i < nextWord.length ? nextWord.charAt(i) : '',
                        cycles: (Math.floor(Math.random()*8))+5
                    });
                }
            }

            var message = '';
            var stillAnimating = false;

            for(var i = 0; i < m.transitionBuffer.length; i++){
                var char = m.transitionBuffer[i];

                if(char.cycles > 0){
                    stillAnimating = true;
                    char.cycles--;
                    message += m.code.charAt(Math.floor(Math.random()*m.code.length));
                } else if(char.target !== ''){
                    message += char.target;
                }
            }

            ele.innerHTML = message;

            if(stillAnimating){
                setTimeout(() => m.animateTransition(nextMessageIndex), 40);
            } else {
                // Transition complete, update message index
                m.message = nextMessageIndex;
                m.current_length = 0;
                m.fadeBuffer = false;
                m.transitionBuffer = false;

                setTimeout(m.animateIn, 200);
            }
        };

        m.init();
    }

    shuffle(ele_passions)

})();