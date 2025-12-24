(() => {
    const audio = document.getElementById('bgAudio');
    const targetVolume = 0.25; // Low volume (25%)
    const fadeDuration = 2000; // 2 seconds fade
    const fadeInterval = 50; // Update every 50ms

    let currentVolume = 0;
    let fadeInTimer = null;
    let fadeOutTimer = null;

    // Set initial volume to 0
    audio.volume = 0;

    // Fade in function
    function fadeIn() {
        if (fadeOutTimer) {
            clearInterval(fadeOutTimer);
            fadeOutTimer = null;
        }

        const fadeStep = (targetVolume / fadeDuration) * fadeInterval;

        fadeInTimer = setInterval(() => {
            if (currentVolume < targetVolume) {
                currentVolume = Math.min(currentVolume + fadeStep, targetVolume);
                audio.volume = currentVolume;
            } else {
                clearInterval(fadeInTimer);
                fadeInTimer = null;
            }
        }, fadeInterval);
    }

    // Fade out function
    function fadeOut() {
        if (fadeInTimer) {
            clearInterval(fadeInTimer);
            fadeInTimer = null;
        }

        const fadeStep = (targetVolume / fadeDuration) * fadeInterval;

        fadeOutTimer = setInterval(() => {
            if (currentVolume > 0) {
                currentVolume = Math.max(currentVolume - fadeStep, 0);
                audio.volume = currentVolume;
            } else {
                clearInterval(fadeOutTimer);
                fadeOutTimer = null;
                audio.pause();
            }
        }, fadeInterval);
    }

    // Start playing with fade in
    function startAudio() {
        audio.play()
            .then(() => {
                fadeIn();
            })
            .catch((error) => {
                // Handle autoplay restrictions - wait for user interaction
                console.log('Autoplay prevented. Waiting for user interaction.');

                // Try to play on first user interaction
                const playOnInteraction = () => {
                    audio.play()
                        .then(() => {
                            fadeIn();
                            // Remove listeners after successful play
                            document.removeEventListener('click', playOnInteraction);
                            document.removeEventListener('touchstart', playOnInteraction);
                            document.removeEventListener('keydown', playOnInteraction);
                        })
                        .catch((err) => {
                            console.error('Audio playback failed:', err);
                        });
                };

                document.addEventListener('click', playOnInteraction);
                document.addEventListener('touchstart', playOnInteraction);
                document.addEventListener('keydown', playOnInteraction);
            });
    }

    // Start audio when page loads
    window.addEventListener('load', () => {
        startAudio();
    });

    // Fade out when leaving page
    window.addEventListener('beforeunload', () => {
        fadeOut();
    });

    // Pause and fade out when page loses focus (optional)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            fadeOut();
        } else if (!audio.paused) {
            fadeIn();
        } else {
            startAudio();
        }
    });
})();
