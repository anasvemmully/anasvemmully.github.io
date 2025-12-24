// Three.js Particle Background
// Interactive particle network with mouse interaction

(function() {
    // Import Three.js from CDN in the HTML

    let scene, camera, renderer, particles, particleCount, mouse, raycaster;
    let particlePositions, particleVelocities;
    let lines, linePositions;
    let containerWidth, containerHeight;

    const CONFIG = {
        particleCount: 150,
        particleSize: 2,
        particleColor: 0xffffff,
        particleOpacity: 0.6,
        connectionDistance: 120,
        mouseInfluenceRadius: 150,
        mouseRepulsionForce: 0.5,
        lineColor: 0xffffff,
        lineOpacity: 0.15,
        driftSpeed: 0.1
    };

    function init() {
        // Wait for Three.js to load
        if (typeof THREE === 'undefined') {
            console.error('Three.js not loaded');
            return;
        }

        containerWidth = window.innerWidth;
        containerHeight = window.innerHeight;

        // Scene setup
        scene = new THREE.Scene();

        // Camera setup
        camera = new THREE.PerspectiveCamera(
            75,
            containerWidth / containerHeight,
            1,
            3000
        );
        camera.position.z = 500;

        // Renderer setup
        renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });
        renderer.setSize(containerWidth, containerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.domElement.style.position = 'fixed';
        renderer.domElement.style.top = '0';
        renderer.domElement.style.left = '0';
        renderer.domElement.style.zIndex = '-1';
        renderer.domElement.style.pointerEvents = 'none';

        document.body.insertBefore(renderer.domElement, document.body.firstChild);

        // Mouse tracking
        mouse = new THREE.Vector2(-1000, -1000);
        raycaster = new THREE.Raycaster();

        // Create particles
        createParticles();

        // Create lines
        createLines();

        // Event listeners
        window.addEventListener('resize', onWindowResize);
        window.addEventListener('mousemove', onMouseMove);

        // Start animation
        animate();
    }

    function createParticles() {
        const geometry = new THREE.BufferGeometry();
        particlePositions = new Float32Array(CONFIG.particleCount * 3);
        particleVelocities = [];

        // Initialize particle positions and velocities
        for (let i = 0; i < CONFIG.particleCount; i++) {
            const i3 = i * 3;

            particlePositions[i3] = Math.random() * 1000 - 500;
            particlePositions[i3 + 1] = Math.random() * 1000 - 500;
            particlePositions[i3 + 2] = Math.random() * 1000 - 500;

            particleVelocities.push({
                x: (Math.random() - 0.5) * CONFIG.driftSpeed,
                y: (Math.random() - 0.5) * CONFIG.driftSpeed,
                z: (Math.random() - 0.5) * CONFIG.driftSpeed
            });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

        const material = new THREE.PointsMaterial({
            size: CONFIG.particleSize,
            color: CONFIG.particleColor,
            opacity: CONFIG.particleOpacity,
            transparent: true,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending
        });

        particles = new THREE.Points(geometry, material);
        scene.add(particles);
    }

    function createLines() {
        const maxConnections = CONFIG.particleCount * CONFIG.particleCount;
        linePositions = new Float32Array(maxConnections * 3);

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
        geometry.setDrawRange(0, 0);

        const material = new THREE.LineBasicMaterial({
            color: CONFIG.lineColor,
            opacity: CONFIG.lineOpacity,
            transparent: true,
            blending: THREE.AdditiveBlending
        });

        lines = new THREE.LineSegments(geometry, material);
        scene.add(lines);
    }

    function onMouseMove(event) {
        mouse.x = (event.clientX / containerWidth) * 2 - 1;
        mouse.y = -(event.clientY / containerHeight) * 2 + 1;
    }

    function onWindowResize() {
        containerWidth = window.innerWidth;
        containerHeight = window.innerHeight;

        camera.aspect = containerWidth / containerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(containerWidth, containerHeight);
    }

    function updateParticles() {
        const positions = particles.geometry.attributes.position.array;

        // Calculate mouse position in 3D space
        raycaster.setFromCamera(mouse, camera);
        const mousePos3D = raycaster.ray.origin.clone();

        for (let i = 0; i < CONFIG.particleCount; i++) {
            const i3 = i * 3;

            // Apply drift
            positions[i3] += particleVelocities[i].x;
            positions[i3 + 1] += particleVelocities[i].y;
            positions[i3 + 2] += particleVelocities[i].z;

            // Mouse repulsion
            const particlePos = new THREE.Vector3(
                positions[i3],
                positions[i3 + 1],
                positions[i3 + 2]
            );

            const distance = particlePos.distanceTo(mousePos3D);

            if (distance < CONFIG.mouseInfluenceRadius) {
                const force = (CONFIG.mouseInfluenceRadius - distance) / CONFIG.mouseInfluenceRadius;
                const direction = particlePos.clone().sub(mousePos3D).normalize();

                positions[i3] += direction.x * force * CONFIG.mouseRepulsionForce;
                positions[i3 + 1] += direction.y * force * CONFIG.mouseRepulsionForce;
                positions[i3 + 2] += direction.z * force * CONFIG.mouseRepulsionForce;
            }

            // Boundary wrapping
            const boundary = 500;
            if (positions[i3] > boundary) positions[i3] = -boundary;
            if (positions[i3] < -boundary) positions[i3] = boundary;
            if (positions[i3 + 1] > boundary) positions[i3 + 1] = -boundary;
            if (positions[i3 + 1] < -boundary) positions[i3 + 1] = boundary;
            if (positions[i3 + 2] > boundary) positions[i3 + 2] = -boundary;
            if (positions[i3 + 2] < -boundary) positions[i3 + 2] = boundary;
        }

        particles.geometry.attributes.position.needsUpdate = true;
    }

    function updateConnections() {
        const positions = particles.geometry.attributes.position.array;
        let vertexpos = 0;
        let numConnected = 0;

        for (let i = 0; i < CONFIG.particleCount; i++) {
            const i3 = i * 3;

            for (let j = i + 1; j < CONFIG.particleCount; j++) {
                const j3 = j * 3;

                const dx = positions[i3] - positions[j3];
                const dy = positions[i3 + 1] - positions[j3 + 1];
                const dz = positions[i3 + 2] - positions[j3 + 2];
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < CONFIG.connectionDistance) {
                    linePositions[vertexpos++] = positions[i3];
                    linePositions[vertexpos++] = positions[i3 + 1];
                    linePositions[vertexpos++] = positions[i3 + 2];

                    linePositions[vertexpos++] = positions[j3];
                    linePositions[vertexpos++] = positions[j3 + 1];
                    linePositions[vertexpos++] = positions[j3 + 2];

                    numConnected++;
                }
            }
        }

        lines.geometry.setDrawRange(0, numConnected * 2);
        lines.geometry.attributes.position.needsUpdate = true;
    }

    function animate() {
        requestAnimationFrame(animate);

        updateParticles();
        updateConnections();

        renderer.render(scene, camera);
    }

    // Initialize when DOM and scripts are ready
    function tryInit() {
        if (typeof THREE !== 'undefined') {
            init();
        } else {
            // Wait for Three.js to load
            setTimeout(tryInit, 100);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tryInit);
    } else {
        tryInit();
    }
})();
