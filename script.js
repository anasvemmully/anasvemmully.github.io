(() => {
    const print = (variable) => console.log(variable);

    ele_passions = document.getElementById("passion");

    var shuffle = (ele) => {
        // "use strict";
        var m = this
        m.init = () => {
            m.code = "&#*+%?£@§$"
            m.message = 0
            m.current_length = 0
            m.fadeBuffer = false
            m.messages = [
                "a Developer.",
                "a Data Science Student.",
                "Single.",
                "an animator.",
                "a Vedio Editor.",
                "a Photo Editor.",
                "a Tech Enthusiast.",
                "a Security Noob.",
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
            m.message = m.message + 1;
            if(m.message >= m.messages.length){
              m.message = 0;
            }
            
            m.current_length = 0;
            m.fadeBuffer = false;
            ele.innerHTML = '';
            
            setTimeout(m.animateIn, 200);
          };

          m.init();

    }


    shuffle(ele_passions)
        

})();