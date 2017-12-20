import * as THREE from 'three';
import 'imports-loader?THREE=three!three/examples/js/loaders/OBJLoader';
import './app.css';

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

var light = new THREE.AmbientLight(0xcccccc); // soft white light
scene.add(light);

var directionalLight = new THREE.PointLight(0xffffff, .7);
directionalLight.position.z = 8;
// directionalLight.position.y = 1;
// directionalLight.position.x = 1;
// directionalLight.rotation.x = 2;
directionalLight.lookAt(scene.position)
// directionalLight.castShadow = true;
scene.add(directionalLight);

const directionalLightHelper = new THREE.PointLightHelper(directionalLight);
// scene.add(directionalLightHelper);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);


const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('assets/texture.jpg');

const loader = new THREE.OBJLoader();

appTitle.innerText = 'Loading...';

loader.load(
  'assets/model.obj',
  object => {
      object.scale.x = .1;
      object.scale.y = .1;
      object.scale.z = .1;

    object.position.y = -1;

    face = object;
    object.castShadow = true;
    object.receiveShadow = true;

      var positions =object.children[0].geometry.attributes.position.array;
      var vertices = [];
      for(var i = 0, n = positions.length; i < n; i += 3) {
          var x = positions[i];
          var y = positions[i + 1];
          var z = positions[i + 2];
          vertices.push(new THREE.Vector3(x, y, z));
      }
      var faces = [];
      for(var i = 0, n = vertices.length; i < n; i += 3) {
          faces.push(new THREE.Face3(i, i + 1, i + 2));
      }

    var geometry = new THREE.Geometry();
    geometry.vertices = vertices;
    geometry.faces = faces;
    geometry.computeFaceNormals();
    geometry.mergeVertices();
    geometry.computeVertexNormals();

    object.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.material.map = texture;
        child.geometry.fromGeometry(geometry);
      }
    })


    // window.setTimeout(() => {
      scene.add(object);
      // scene.add(mesh);
      appTitle.innerText = 'Beyoung WebGL Test';
    // }, 1000)
  },
  // xhr => console.log(xhr.loaded / xhr.total * 100),
  // error => console.log(error)
);

canvas.addEventListener('mousemove', event => {
  // if (!face) {
  //   return;
  // }

  const middleX = WIDTH / 2;
  const middleY = HEIGHT / 2;
  const rotationFactor = .004;
  const posX = event.x - Math.floor(canvasRect.x);
  const posY = event.y - Math.floor(canvasRect.y);
  const rotX = (posX - middleX) * rotationFactor;
  const rotY = (posY - middleY) * rotationFactor;

  camera.position.x = -rotX;
  camera.position.y = rotY;
});

camera.position.z = 3;

function animate() {
  window.requestAnimationFrame(animate);

  camera.lookAt(scene.position);

  renderer.render(scene, camera);
}

animate();