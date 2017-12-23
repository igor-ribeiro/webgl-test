import * as THREE from 'three';

import 'imports-loader?THREE=three!three/examples/js/loaders/OBJLoader';
import 'imports-loader?THREE=three!three/examples/js/loaders/LoaderSupport';
import 'imports-loader?THREE=three!three/examples/js/loaders/OBJLoader2';
import 'imports-loader?THREE=three!three/examples/js/loaders/MTLLoader';
import './app.css';

const WIDTH = window.innerWidth - 254;
const HEIGHT = window.innerHeight - 54;
const ASPECT_RATIO = WIDTH / HEIGHT;

const app = document.querySelector('#app');
const appTitle = document.querySelector('.app-title');

let face;
let mouseX = 0;
let mouseY = 0;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(10, ASPECT_RATIO, 1, 1000);
const cameraHelper = new THREE.CameraHelper(camera);
const renderer = new THREE.WebGLRenderer();
// const canvas = renderer.domElement;
const canvas = document.querySelector('canvas');
let canvasRect;

scene.background = new THREE.Color(0x333333);

renderer.setSize(WIDTH, HEIGHT);

// const acne = document.querySelector('#acne');
// const clean = document.querySelector('#clean');
const context = canvas.getContext('2d');

let totalImages = 0;

const acne = new Image();
acne.src = 'assets/texture-acne-explict.jpg';
acne.onload = imageLoaded;

const clean = new Image();
clean.src = 'assets/texture-clean.jpg';
clean.onload = imageLoaded;

function imageLoaded(a) {
  totalImages++;

  if (totalImages < 2) {
    return;
  }

  canvas.width = acne.width;
  canvas.height = acne.height;
  let pixels = 4 * canvas.width * canvas.height;

  context.drawImage(acne, 0, 0);
  const acneData = context.getImageData(0, 0, canvas.width, canvas.height).data;

  context.drawImage(clean, 0, 0);
  const cleanData = context.getImageData(0, 0, canvas.width, canvas.height).data;

  while (pixels--) {
    acneData[pixels] = acneData[pixels] * 0.1 + cleanData[pixels] * 0.9;
  }

  const idata = context.createImageData(canvas.width, canvas.height);
  idata.data.set(acneData);
  context.putImageData(idata, 0, 0);

  const image = new Image();
  image.src = canvas.toDataURL();
  canvas.clearReact(0, 0, canvas.width, canvas.height);
}
// app.appendChild(canvas);

window.requestAnimationFrame(
  () => canvasRect = canvas.getBoundingClientRect()
);

var light = new THREE.AmbientLight(0xcccccc); // soft white light
scene.add(light);

var directionalLight1 = new THREE.PointLight(0xffffff, .5);
directionalLight1.position.z = 4;
directionalLight1.position.y = 4;
directionalLight1.position.x = 4;
directionalLight1.castShadow = true;
directionalLight1.lookAt(scene.position)
scene.add(directionalLight1);

const directionalLightHelper1 = new THREE.PointLightHelper(directionalLight1);
scene.add(directionalLightHelper1);

var directionalLight2 = new THREE.PointLight(0x000044, .3);
directionalLight2.position.z = 4;
directionalLight2.position.y = -2;
directionalLight2.position.x = -6;
directionalLight2.castShadow = true;
// directionalLight2.lookAt(scene.position)
scene.add(directionalLight2);

const directionalLightHelper2 = new THREE.PointLightHelper(directionalLight2);
scene.add(directionalLightHelper2);

let objLoader;


function loadModel() {
  objLoader = new THREE.OBJLoader();
  objLoader.load('assets/model.obj', object => {
    object.scale.x = .1;
    object.scale.y = .1;
    object.scale.z = .1;

    object.position.y = -1;

    face = object;

    const positions = object.children[0].geometry.attributes.position.array;
    const vertices = [];

    for (let i = 0, n = positions.length; i < n; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];

      vertices.push(new THREE.Vector3(x, y, z));
    }

    const faces = [];

    for (let i = 0, n = vertices.length; i < n; i += 3) {
        faces.push(new THREE.Face3(i, i + 1, i + 2));
    }

    const geometry = new THREE.Geometry();
    geometry.vertices = vertices;
    geometry.faces = faces;
    geometry.computeFaceNormals();
    geometry.mergeVertices();
    geometry.computeVertexNormals();

    object.traverse(child => {
      if (child instanceof THREE.Mesh) {
        mesh = child;
        child.geometry.fromGeometry(geometry);
  mesh = THREE.SceneUtils.createMultiMaterialObject(mesh.geometry, [
    new THREE.MeshPhongMaterial({ map: loadTexture('texture-acne-explict.jpg'), castShadow: true, transparent: true,}),
    new THREE.MeshPhongMaterial({ map: loadTexture('texture-acne-explict.jpg'), castShadow: true, transparent: true,}),
    new THREE.MeshPhongMaterial({ map: loadTexture('texture-clean.jpg'), castShadow: true, transparent: true }),
  ]);
    mesh.scale.x = .1;
    mesh.scale.y = .1;
    mesh.scale.z = .1;
    mesh.position.y = -1;

      }
    })


    scene.add(mesh);
    appTitle.innerText = 'Beyoung WebGL Test';
  })
}

const textureLoader = new THREE.TextureLoader();


function loadMaterial(textureFile) {
  textureLoader.load(`assets/${textureFile}`, texture => {
    face.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshFaceMaterial([
          new THREE.MeshPhongMaterial({
            // map: texture,
            transparent: true,
            needsUpdate: true
          })
        ]);
      }
    });
  });
}

function updateMaterial(factor) {
  const mat = new THREE.ShaderMaterial({
    uniforms,
    lights: true,
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;

      void main() {
        vUv = uv;

        vNormal = normal;
        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      #ifdef GL_ES
      precision highp float;
      #endif

      uniform sampler2D tOne;
      uniform sampler2D tSec;

      varying vec2 vUv;
      varying vec3 vNormal;

      void main(void) {
        vec4 Ca = texture2D(tOne, vUv);
        vec4 Cb = texture2D(tSec, vUv);

        vec3 light = normalize(vec3(0.5, 0.2, 1.0));
        float dProd = max(0.0, dot(vNormal, light));

        gl_FragColor= vec4(mix(Ca.xyz, vec3(dProd, dProd, dProd), ${Number(factor).toFixed(2)}), 1.0);
        // gl_FragColor = vec4(Ca.x, Ca.y, Ca.z, 1.0);
      }
    `,
  });

  mesh.children[1].material.opacity = 1-Number(factor);
  mesh.children[2].material.opacity = Number(factor);


  // mesh.material = mat;
}

// loadModel();

function loadTexture(filename) {
  return new THREE.TextureLoader().load(`assets/${filename}`);
}

let mesh;
const textures = {
  tOne: { type: 't', value: loadTexture('texture-acne.jpg') },
  tTwo: { type: 't', value: loadTexture('texture-clean.jpg') },
}

const uniforms = Object.assign(
  {},
  THREE.UniformsLib.lights,
  {
    tOne: { type: 't', value: loadTexture('texture-acne.jpg') },
    tTwo: { type: 't', value: loadTexture('texture-clean.jpg') },
  }
);


let factor = 1.0;
canvas.addEventListener('mousemove', event => {
  // if (!face) {
  //   return;
  // }
  const middleX = WIDTH / 2;
  const middleY = HEIGHT / 2;
  const rotationFactor = .01;
  const posX = event.x - Math.floor(canvasRect.x);
  const posY = event.y - Math.floor(canvasRect.y);
  const rotX = (posX - middleX) * rotationFactor;
  const rotY = (posY - middleY) * rotationFactor;

  // camera.position.x = -rotX;
  // camera.position.y = rotY;
  // face.rotation.y = rotX;
  // face.children[0].material.opacity -= 0.1
  // console.log(face.children[0].material);
  // face.children[0].material.needsUpdate = true;

  // mesh.material[0].opacity -= .05;
  // mesh.material[0].blending = .5;
  // mesh.material[1].opacity += .05;
  // mesh.material[1].needsUpdate = true;
  // factor = Math.max(0, factor -= .03);
  // updateMaterial(factor);

  // face.rotation.x = rotY;
});


camera.position.z = 80;
camera.zoom = 6;
camera.updateProjectionMatrix();
// camera.position.y = 20;

function animate() {
  window.requestAnimationFrame(animate);

  camera.lookAt(scene.position);

  renderer.render(scene, camera);
}

window.requestAnimationFrame(animate)

const effectSelector = document.querySelector('.effect-selector');
const zoomSelector = document.querySelector('.zoom-selector');

effectSelector.addEventListener('input', event => {
  updateMaterial(event.target.value);
})

zoomSelector.addEventListener('input', event => {
  camera.zoom = event.target.value;
  camera.updateProjectionMatrix();
});