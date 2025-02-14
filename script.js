// Инициализация сцены, камеры и рендера
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Параметры частиц
const particleCount = 10000;
const particles = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const initialPositions = new Float32Array(particleCount * 3);
const velocities = new Float32Array(particleCount * 3);

// Функция для проверки, находится ли точка внутри формы сердца
function isInHeart(x, y) {
    const t1 = x * x + y * y - 1;
    return t1 * t1 * t1 - x * x * y * y * y <= 0;
}

// Генерация частиц внутри формы сердца
let i = 0;
while (i < particleCount) {
    const x = (Math.random() * 2 - 1) * 1.5;
    const y = (Math.random() * 2 - 1) * 1.5;
    if (isInHeart(x, y)) {
        const z = (Math.random() * 2 - 1) * 0.1; // Небольшое отклонение по оси Z для 3D-эффекта
        positions[i * 3] = x * 10;
        positions[i * 3 + 1] = y * 10;
        positions[i * 3 + 2] = z * 10;

        initialPositions[i * 3] = positions[i * 3];
        initialPositions[i * 3 + 1] = positions[i * 3 + 1];
        initialPositions[i * 3 + 2] = positions[i * 3 + 2];

        velocities[i * 3] = (Math.random() - 0.5) * 0.02;
        velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
        i++;
    }
}

particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));

// Создание материала для частиц
const particleMaterial = new THREE.PointsMaterial({
    color: 0xff69b4,
    size: 0.1,
});

// Создание объекта частиц и добавление его на сцену
const particleSystem = new THREE.Points(particles, particleMaterial);
scene.add(particleSystem);

// Установка позиции камеры
camera.position.z = 30;

// Обработка событий мыши
const mouse = new THREE.Vector2();
document.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Анимация
function animate() {
    requestAnimationFrame(animate);

    const positions = particleSystem.geometry.attributes.position.array;

    for (let i = 0; i < particleCount; i++) {
        // Обновление позиции частиц
        positions[i * 3] += velocities[i * 3];
        positions[i * 3 + 1] += velocities[i * 3 + 1];
        positions[i * 3 + 2] += velocities[i * 3 + 2];

        // Возврат частиц к исходной позиции
        const dx = positions[i * 3] - initialPositions[i * 3];
        const dy = positions[i * 3 + 1] - initialPositions[i * 3 + 1];
        const dz = positions[i * 3 + 2] - initialPositions[i * 3 + 2];
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const force = -0.01 * distance;

        velocities[i * 3] += force * dx;
        velocities[i * 3 + 1] += force * dy;
        velocities[i * 3 + 2] += force * dz;

        // Реакция на наведение мыши
        const mouseX = mouse.x * 15;
        const mouseY = mouse.y * 15;
        const mx = positions[i * 3] - mouseX;
        const my = positions[i * 3 + 1] - mouseY;
        const mz = positions[i * 3 + 2];
        const mouseDistance = Math.sqrt(mx * mx + my * my + mz * mz);
        if (mouseDistance < 5) {
            const repulsionForce = (5 - mouseDistance) * 0.05;
            velocities[i * 3] += repulsionForce * mx;
            velocities[i * 3 + 1] += repulsionForce * my;
            velocities[i * 3 + 2] += repulsionForce * mz;
        }

        // Затухание скорости
        velocities[i * 3] *= 0.95;
        velocities[i * 3 + 1] *= 0.95;
        velocities[i * 3 + 2] *= 0.95;
    }

    particleSystem.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
}

animate();
