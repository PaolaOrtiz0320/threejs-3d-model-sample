// ================================
// Importación de librerías de Three.js
// ================================

// Importa el núcleo de Three.js (geometrías, materiales, luces, cámara, etc.)
import * as THREE from 'three';

// Importa el cargador de modelos GLTF/GLB (para cargar modelos en ese formato)
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Importa los controles de órbita (permite rotar, hacer zoom y mover la cámara con el mouse)
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


// ================================
// Configuración del Renderer
// ================================

// Crea el renderizador WebGL con suavizado de bordes (antialiasing)
const renderer = new THREE.WebGLRenderer({ antialias: true });

// Establece el espacio de color de salida a sRGB para colores más realistas
renderer.outputColorSpace = THREE.SRGBColorSpace;

// Define el tamaño del área de render al tamaño completo de la ventana
renderer.setSize(window.innerWidth, window.innerHeight);

// Define el color de fondo del canvas (negro en este caso)
renderer.setClearColor(0x000000);

// Ajusta la resolución al pixel ratio del dispositivo (pantallas retina, 4K, etc.)
renderer.setPixelRatio(window.devicePixelRatio);

// Habilita el uso de sombras en la escena
renderer.shadowMap.enabled = true;

// Define el tipo de suavizado de sombras (PCF Soft Shadow para mejor calidad)
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Inserta el canvas del renderizador en el documento HTML (dentro del body)
document.body.appendChild(renderer.domElement);


// ================================
// Creación de la Escena
// ================================

// Crea un contenedor donde se almacenarán todos los objetos, luces y cámaras
const scene = new THREE.Scene();


// ================================
// Configuración de la Cámara
// ================================

// Define una cámara de perspectiva (fov, relación aspecto, plano cercano, plano lejano)
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);

// Coloca la cámara en una posición en el espacio (x=4, y=5, z=11)
camera.position.set(4, 5, 11);


// ================================
// Controles de cámara (OrbitControls)
// ================================

// Inicializa los controles para mover la cámara con el ratón
const controls = new OrbitControls(camera, renderer.domElement);

// Habilita un suavizado en los movimientos de cámara
controls.enableDamping = true;

// Deshabilita el paneo lateral con el mouse
controls.enablePan = false;

// Distancia mínima y máxima de la cámara respecto al objetivo
controls.minDistance = 5;
controls.maxDistance = 20;

// Ángulo mínimo y máximo de rotación vertical (en radianes)
controls.minPolarAngle = 0.5;
controls.maxPolarAngle = 1.5;

// Desactiva la rotación automática
controls.autoRotate = false;

// Define el punto de interés de la cámara (a donde siempre mira)
controls.target = new THREE.Vector3(0, 1, 0);

// Aplica la configuración inicial de los controles
controls.update();


// ================================
// Creación del Suelo (Ground)
// ================================

// Crea la geometría de un plano de 20x20 con subdivisiones
const groundGeometry = new THREE.PlaneGeometry(20, 20, 32, 32);

// Rota el plano en el eje X para que quede horizontal
groundGeometry.rotateX(-Math.PI / 2);

// Crea un material estándar con color gris
const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x555555,
  side: THREE.DoubleSide  // Visible en ambas caras
});

// Crea la malla combinando geometría y material
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);

// El suelo no proyecta sombras
groundMesh.castShadow = false;

// Pero sí recibe sombras
groundMesh.receiveShadow = true;

// Agrega el suelo a la escena
scene.add(groundMesh);


// ================================
// Creación de la Luz Principal (SpotLight)
// ================================

// Crea una luz de tipo SpotLight (color blanco, intensidad 3000, distancia, ángulo, penumbra)
const spotLight = new THREE.SpotLight(0xffffff, 3000, 100, 0.22, 1);

// Posiciona la luz en el espacio (arriba del escenario)
spotLight.position.set(0, 25, 0);

// Habilita sombras proyectadas por esta luz
spotLight.castShadow = true;

// Ajusta un pequeño sesgo en las sombras para evitar artefactos
spotLight.shadow.bias = -0.0001;

// Agrega la luz a la escena
scene.add(spotLight);


// ================================
// Carga del Modelo GLTF/GLB
// ================================

// Inicializa el cargador GLTF y establece la ruta donde se encuentra el modelo
const loader = new GLTFLoader().setPath('public/millennium_falcon/');

// Carga el archivo "scene.gltf"
loader.load(
  'scene.gltf',
  
  // Función que se ejecuta cuando el modelo se carga correctamente
  (gltf) => {
    console.log('loading model');
    
    // Extrae la escena (contenedor del modelo)
    const mesh = gltf.scene;

    // Recorre todos los hijos del modelo
    mesh.traverse((child) => {
      // Si el hijo es una malla, habilita sombras
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Ajusta la posición del modelo en la escena
    mesh.position.set(0, 1.05, -1);

    // Agrega el modelo cargado a la escena principal
    scene.add(mesh);

    // Oculta el contenedor de progreso (si existía en el HTML)
    document.getElementById('progress-container').style.display = 'none';
  },
  
  // Función que se ejecuta durante la carga (muestra el progreso en %)
  (xhr) => {
    console.log(`loading ${xhr.loaded / xhr.total * 100}%`);
  },
  
  // Función que se ejecuta si ocurre un error al cargar
  (error) => {
    console.error(error);
  }
);


// ================================
// Evento de Redimensionamiento
// ================================

// Ajusta la cámara y el renderizador cuando se cambia el tamaño de la ventana
window.addEventListener('resize', () => {
  // Actualiza la relación de aspecto de la cámara
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  // Ajusta el tamaño del renderer
  renderer.setSize(window.innerWidth, window.innerHeight);
});


// ================================
// Animación (Game Loop)
// ================================

// Función que se repite constantemente para renderizar la escena
function animate() {
  // Solicita al navegador que ejecute esta función antes del siguiente repintado
  requestAnimationFrame(animate);

  // Actualiza los controles de cámara
  controls.update();

  // Renderiza la escena desde la perspectiva de la cámara
  renderer.render(scene, camera);
}

// Inicia el ciclo de animación
animate();
