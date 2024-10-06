const NASA_API_KEY = '6nmrKNrIFXFsVC2FaW9dy1z7zdHGKncG8lDcZm3w'; // Replace with your actual API key from NASA
const datePicker = document.getElementById('datePicker');
const fetchDataBtn = document.getElementById('fetchDataBtn');
const neoDetails = document.getElementById('neoDetails');

// 3D Setup
let scene, camera, renderer;
let earth, neos = [];

// Initialize 3D Scene
function init3DScene() {
    const container = document.getElementById('3d-container');
    
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 50;

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Add ambient light
    const light = new THREE.AmbientLight(0xffffff);
    scene.add(light);

    // Add Earth (center object)
    const earthGeometry = new THREE.SphereGeometry(5, 32, 32);
    const earthMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);
}

// Render the scene
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// Fetch NEO data and render orbits
fetchDataBtn.addEventListener('click', async () => {
    const selectedDate = datePicker.value;
    neoDetails.innerHTML = '';

    const apiUrl = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${selectedDate}&end_date=${selectedDate}&api_key=${NASA_API_KEY}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    const neos = data.near_earth_objects[selectedDate];
    displayNEOData(neos);
    renderNEOOrbits(neos);
});

// Display NEO data
function displayNEOData(neos) {
    neos.forEach(neo => {
        const neoCard = document.createElement('div');
        neoCard.classList.add('neo-card');

        const name = neo.name;
        const diameter = neo.estimated_diameter.kilometers.estimated_diameter_max.toFixed(2);
        const velocity = neo.close_approach_data[0].relative_velocity.kilometers_per_hour.toFixed(2);
        const missDistance = neo.close_approach_data[0].miss_distance.kilometers.toFixed(2);

        neoCard.innerHTML = `
            <h3>${name}</h3>
            <p><strong>Diameter:</strong> ${diameter} km</p>
            <p><strong>Velocity:</strong> ${velocity} km/h</p>
            <p><strong>Miss Distance:</strong> ${missDistance} km</p>
        `;
        neoDetails.appendChild(neoCard);
    });
}

// Render 3D orbits
function renderNEOOrbits(neos) {
    // Remove previous NEOs
    neos.forEach(neo => {
        scene.remove(neo.mesh);
    });

    neos.forEach(neo => {
        const distance = parseFloat(neo.close_approach_data[0].miss_distance.astronomical);

        // Create a small sphere to represent the NEO
        const neoGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const neoMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const neoSphere = new THREE.Mesh(neoGeometry, neoMaterial);

        // Position the NEO at the corresponding orbit radius
        neoSphere.position.x = distance * 10; // Scale to fit scene
        scene.add(neoSphere);

        // Optionally, animate the NEO around Earth
        animateOrbit(neoSphere, distance * 10);
    });
}

// Function to animate NEOs around Earth in a circular orbit
function animateOrbit(neo, radius) {
    let angle = 0;
    function moveInOrbit() {
        angle += 0.01;
        neo.position.x = radius * Math.cos(angle);
        neo.position.z = radius * Math.sin(angle);
        requestAnimationFrame(moveInOrbit);
    }
    moveInOrbit();
}

init3DScene();

