import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { GUI } from 'lil-gui';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 4;

const canvas = document.querySelector("canvas");

const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setSize(window.innerWidth, window.innerHeight);

const controls = new OrbitControls(camera, renderer.domElement);

const geometry = new THREE.CylinderGeometry(2, 2, 2, 32, 1, true);
const material = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, transparent: true });

const textureLoader = new THREE.TextureLoader();
textureLoader.load(
  './image.png',
  function (texture) {
    texture.encoding = THREE.sRGBEncoding;
    material.map = texture;
    material.needsUpdate = true;
  },
  undefined,
  function (err) {
    console.error('An error happened while loading the texture:', err);
  }
);

const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Ambient Light
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);

// Post-processing
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.5,  // strength
  0.4,  // radius
  0.85  // threshold
);
composer.addPass(bloomPass);

// GUI setup
const gui = new GUI();

// Mesh controls
const meshFolder = gui.addFolder('Mesh');
meshFolder.add(cube.rotation, 'x', 0, Math.PI * 2);
meshFolder.add(cube.rotation, 'y', 0, Math.PI * 2);
meshFolder.add(cube.rotation, 'z', 0, Math.PI * 2);
meshFolder.add(cube.scale, 'x', 0.1, 2).name('Scale X');
meshFolder.add(cube.scale, 'y', 0.1, 2).name('Scale Y');
meshFolder.add(cube.scale, 'z', 0.1, 2).name('Scale Z');
meshFolder.add(material, 'opacity', 0, 1);
meshFolder.add(material, 'wireframe');

// Ambient Light controls
const ambientLightFolder = gui.addFolder('Ambient Light');
ambientLightFolder.add(ambientLight, 'intensity', 0, 2);
ambientLightFolder.addColor(ambientLight, 'color');

// Bloom controls
const bloomFolder = gui.addFolder('Bloom');
bloomFolder.add(bloomPass, 'strength', 0, 3);
bloomFolder.add(bloomPass, 'radius', 0, 1);
bloomFolder.add(bloomPass, 'threshold', 0, 1);

// Tone Mapping controls
const toneMappingFolder = gui.addFolder('Tone Mapping');
toneMappingFolder.add(renderer, 'toneMappingExposure', 0, 2);

window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    composer.setSize(width, height);
});

const clock = new THREE.Clock();

function animate() {
    const delta = clock.getDelta();
    requestAnimationFrame(animate);
    composer.render();
    cube.rotation.y += delta * -0.5;
    controls.update();
}
animate();