// Инициализация сцены, камеры и рендера
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Параметры частиц
const particleCount = 10000;
const particles = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const initialPositions = new Float32Array(particleCount * 3);
const velocities = new Float32Array(particleCount * 3);

// Скорость биения (по умолчанию)
let heartbeatSpeed = 2;
let isMouseDown = false; // Флаг нажатой левой кнопки мыши

// Поддержка настроек Wallpaper Engine
if (window.wallpaperPropertyListener) {
    window.wallpaperPropertyListener = {
        applyUserProperties: function(properties) {
            if (properties.heartbeat_speed) {
                heartbeatSpeed = properties.heartbeat_speed.value;
            }
        }
    };
}

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
        const z = (Math.random() * 2 - 1) * 0.1;
        positions[i * 3] = x * 10;
        positions[i * 3 + 1] = y * 10;
        positions[i * 3 + 2] = z * 10;

        initialPositions[i * 3] = positions[i * 3];
        initialPositions[i * 3 + 1] = positions[i * 3 + 1];
        initialPositions[i * 3 + 2] = positions[i * 3 + 2];

        velocities[i * 3] = (Math.random() - 0.5) * 0.05;
        velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.05;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
        i++;
    }
}

particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));

// Создание материала для частиц
const particleMaterial = new THREE.PointsMaterial({
    color: 0xff69b4,
    size: 0.15,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
});

// Создание объекта частиц и добавление его на сцену
const particleSystem = new THREE.Points(particles, particleMaterial);
scene.add(particleSystem);

// Установка позиции камеры
camera.position.z = 30;

const mouse = new THREE.Vector3();
function updateMousePosition(x, y) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((x - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((y - rect.top) / rect.height) * 2 + 1;

    // Преобразование экранных координат в координаты сцены
    const vector = new THREE.Vector3(mouse.x, mouse.y, 0);
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    mouse.copy(camera.position.clone().add(dir.multiplyScalar(distance)));
}

document.addEventListener('mousemove', (event) => {
    updateMousePosition(event.clientX, event.clientY);
});

document.addEventListener('mousedown', (event) => {
    if (event.button === 0) isMouseDown = true;
});

document.addEventListener('mouseup', (event) => {
    if (event.button === 0) isMouseDown = false;
});

document.addEventListener('touchstart', () => {
    isMouseDown = true;
});

document.addEventListener('touchend', () => {
    isMouseDown = false;
});

document.addEventListener('touchmove', (event) => {
    if (event.touches.length > 0) {
        updateMousePosition(event.touches[0].clientX, event.touches[0].clientY);
    }
}, { passive: true });

let time = 0;

// Анимация
function animate() {
    requestAnimationFrame(animate);
    time += 0.05 * heartbeatSpeed;

    // Эффект пульсации
    const scale = 1 + 0.1 * Math.sin(time * 2);
    particleSystem.scale.set(scale, scale, scale);

    for (let i = 0; i < particleCount; i++) {
        const index = i * 3;
        velocities[index] += (Math.random() - 0.5) * 0.02;
        velocities[index + 1] += (Math.random() - 0.5) * 0.02;
        velocities[index + 2] += (Math.random() - 0.5) * 0.02;

        velocities[index] *= 0.95;
        velocities[index + 1] *= 0.95;
        velocities[index + 2] *= 0.95;

        positions[index] += velocities[index];
        positions[index + 1] += velocities[index + 1];
        positions[index + 2] += velocities[index + 2];

        const dx = initialPositions[index] - positions[index];
        const dy = initialPositions[index + 1] - positions[index + 1];
        const dz = initialPositions[index + 2] - positions[index + 2];

        velocities[index] += dx * 0.02;
        velocities[index + 1] += dy * 0.02;
        velocities[index + 2] += dz * 0.02;

        // Реакция на наведение мыши только при нажатой левой кнопке
        if (isMouseDown) {
            const mx = positions[index] - mouse.x;
            const my = positions[index + 1] - mouse.y;
            const mz = positions[index + 2] - mouse.z;
            const distance = Math.sqrt(mx * mx + my * my + mz * mz);
            if (distance < 5) {  // Увеличен радиус влияния
                const repulsion = (5 - distance) * 0.15; // Усилено отталкивание
                velocities[index] += repulsion * mx;
                velocities[index + 1] += repulsion * my;
                velocities[index + 2] += repulsion * mz;
            }
        }
    }

    particleSystem.geometry.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
}

animate();


