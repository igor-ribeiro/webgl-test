import * as THREE from 'three';
import 'imports-loader?THREE=three!three/examples/js/loaders/OBJLoader';

const WIDTH = window.innerWidth - 48;
const HEIGHT = window.innerHeight - 48;
const ASPECT_RATIO = WIDTH / HEIGHT;

const app = document.querySelector('#app');
const appTitle = document.querySelector('.app-title');

let face;
let mouseX = 0;
let mouseY = 0;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, ASPECT_RATIO, 1, 1000);
const cameraHelper = new THREE.CameraHelper(camera);
const renderer = new THREE.WebGLRenderer();
const canvas = renderer.domElement;
let canvasRect;

scene.background = new THREE.Color(0x333333);

renderer.setSize(WIDTH, HEIGHT);

app.appendChild(canvas);

window.requestAnimationFrame(
  () => canvasRect = canvas.getBoundingClientRect()
);

var light = new THREE.AmbientLight(0x404040); // soft white light
scene.add(light);

var directionalLight = new THREE.DirectionalLight(0xffffff, .7);
directionalLight.position.z = 2.5;
directionalLight.rotation.x = 2;
scene.add(directionalLight);

const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight);
// scene.add(directionalLightHelper);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);


const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('texture.jpg');

const loader = new THREE.OBJLoader();

appTitle.innerText = 'Loading...';

loader.load(
  'model.obj',
  object => {
    object.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.material.map = texture;
      }
    })

    object.scale.x = .1;
    object.scale.y = .1;
    object.scale.z = .1;

    face = object;

    window.setTimeout(() => {
      scene.add(object);
      appTitle.innerText = 'Beyoung WebGL Test';
    }, 1000)
  },
  xhr => console.log(xhr.loaded / xhr.total * 100),
  error => console.log(error)
);

canvas.addEventListener('mousemove', event => {
  if (!face) {
    return;
  }

  const middleX = WIDTH / 2;
  const middleY = HEIGHT / 2;
  const rotationFactor = .004;
  const posX = event.x - Math.floor(canvasRect.x);
  const posY = event.y - Math.floor(canvasRect.y);
  const rotX = (posX - middleX) * rotationFactor;
  const rotY = (posY - middleY) * .002;

  face.rotation.y = rotX;
  face.rotation.x = rotY;
});

camera.position.z = 3;
camera.position.y = 1;

function animate() {
  window.requestAnimationFrame(animate);


  // camera.position.x += ( mouseX - camera.position.x ) * .001;
  // camera.position.y += ( - mouseY - camera.position.y ) * .05;
  // camera.lookAt( scene.position );
  renderer.render( scene, camera );
  // renderer.render(scene, camera);
}

animate();