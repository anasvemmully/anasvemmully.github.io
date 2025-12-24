(() => {
    const audio = document.getElementById('bgAudio');
    if (!audio) return; // Exit if audio element doesn't exist

    const progressingContainer = document.querySelector('.progressing');
    const baseVolume = 0.20; // Low volume when not in progressing section (20%)
    const highVolume = 0.85; // High volume when in progressing section (85%)
    const fadeDuration = 2000; // 2 seconds fade
    const fadeInterval = 50; // Update every 50ms

    let currentVolume = 0;
    let targetVolume = baseVolume;
    let fadeTimer = null;
    let isAudioInitialized = false;

    // Set initial volume to base volume
    audio.volume = baseVolume;

    // Fade to target volume function
    function fadeTo(newTargetVolume) {
        if (fadeTimer) {
            clearInterval(fadeTimer);
            fadeTimer = null;
        }

        targetVolume = newTargetVolume;

        const volumeDiff = Math.abs(targetVolume - currentVolume);
        if (volumeDiff < 0.01) {
            // Already at target volume
            currentVolume = targetVolume;
            audio.volume = currentVolume;
            return;
        }

        const fadeStep = (volumeDiff / fadeDuration) * fadeInterval;

        fadeTimer = setInterval(() => {
            if (currentVolume < targetVolume) {
                currentVolume = Math.min(currentVolume + fadeStep, targetVolume);
                audio.volume = currentVolume;
            } else if (currentVolume > targetVolume) {
                currentVolume = Math.max(currentVolume - fadeStep, targetVolume);
                audio.volume = currentVolume;
            } else {
                clearInterval(fadeTimer);
                fadeTimer = null;
            }
        }, fadeInterval);
    }

    // Start playing audio immediately
    function startAudio() {
        if (isAudioInitialized) return;

        currentVolume = baseVolume;
        audio.volume = baseVolume;

        audio.play()
            .then(() => {
                isAudioInitialized = true;
                console.log('Background audio started at', (baseVolume * 100) + '%');
            })
            .catch((err) => {
                console.log('Autoplay prevented, waiting for user interaction...');
                // Wait for user interaction to start audio
                const enableAudio = () => {
                    audio.play()
                        .then(() => {
                            isAudioInitialized = true;
                            currentVolume = baseVolume;
                            audio.volume = baseVolume;
                            console.log('Background audio started at', (baseVolume * 100) + '%');

                            // Remove listeners after first interaction
                            document.removeEventListener('click', enableAudio);
                            document.removeEventListener('touchstart', enableAudio);
                            document.removeEventListener('scroll', enableAudio);
                            document.removeEventListener('keydown', enableAudio);
                        })
                        .catch((err) => {
                            console.error('Audio playback failed:', err);
                        });
                };

                // Listen for any user interaction
                document.addEventListener('click', enableAudio, { once: true });
                document.addEventListener('touchstart', enableAudio, { once: true });
                document.addEventListener('scroll', enableAudio, { once: true });
                document.addEventListener('keydown', enableAudio, { once: true });
            });
    }

    // Intersection Observer to detect when .progressing is in view
    if (progressingContainer) {
        const observerOptions = {
            root: null, // viewport
            rootMargin: '0px',
            threshold: 0.1 // Trigger when at least 10% is visible
        };

        const observerCallback = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    // .progressing container is in view - fade to high volume
                    fadeTo(highVolume);
                } else {
                    // .progressing container is out of view - fade to base volume
                    fadeTo(baseVolume);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);
        observer.observe(progressingContainer);
    }

    // Pause when page loses focus
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            audio.pause();
        } else if (!document.hidden && isAudioInitialized) {
            // Resume audio when page gets focus again
            audio.play().then(() => {
                fadeTo(baseVolume);
            }).catch(err => {
                console.error('Resume audio failed:', err);
            });
        }
    });

    // Start audio immediately when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startAudio);
    } else {
        // DOM already loaded, start immediately
        startAudio();
    }
})();
