(() => {
    const audio = document.getElementById('bgAudio');
    const progressingContainer = document.querySelector('.progressing');
    const targetVolume = 0.25; // Low volume (25%)
    const fadeDuration = 2000; // 2 seconds fade
    const fadeInterval = 50; // Update every 50ms

    let currentVolume = 0;
    let fadeInTimer = null;
    let fadeOutTimer = null;
    let isAudioReady = false;

    // Set initial volume to 0
    audio.volume = 0;

    // Fade in function
    function fadeIn() {
        if (fadeOutTimer) {
            clearInterval(fadeOutTimer);
            fadeOutTimer = null;
        }

        // Ensure audio is playing
        if (audio.paused) {
            audio.play().catch((err) => {
                console.error('Audio playback failed:', err);
            });
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

    // Initialize audio (muted) to bypass autoplay restrictions
    function initAudio() {
        if (!isAudioReady) {
            audio.play()
                .then(() => {
                    isAudioReady = true;
                    audio.pause();
                    audio.currentTime = 0;
                })
                .catch(() => {
                    // Wait for user interaction
                    const enableAudio = () => {
                        audio.play()
                            .then(() => {
                                isAudioReady = true;
                                audio.pause();
                                audio.currentTime = 0;
                                // Remove listeners
                                document.removeEventListener('click', enableAudio);
                                document.removeEventListener('touchstart', enableAudio);
                                document.removeEventListener('keydown', enableAudio);
                            })
                            .catch((err) => {
                                console.error('Audio initialization failed:', err);
                            });
                    };

                    document.addEventListener('click', enableAudio);
                    document.addEventListener('touchstart', enableAudio);
                    document.addEventListener('keydown', enableAudio);
                });
        }
    }

    // Intersection Observer to detect when .progressing is in view
    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1 // Trigger when at least 10% is visible
    };

    const observerCallback = (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // .progressing container is in view - fade in
                fadeIn();
            } else {
                // .progressing container is out of view - fade out
                fadeOut();
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Start observing when DOM is ready
    window.addEventListener('load', () => {
        if (progressingContainer) {
            initAudio();
            observer.observe(progressingContainer);
        }
    });

    // Pause when leaving page
    window.addEventListener('beforeunload', () => {
        fadeOut();
    });

    // Pause when page loses focus
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            fadeOut();
        }
    });
})();
