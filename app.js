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
const canvas = renderer.domElement;
let canvasRect;

scene.background = new THREE.Color(0x333333);

renderer.setSize(WIDTH, HEIGHT);

app.appendChild(canvas);

window.requestAnimationFrame(
  () => canvasRect = canvas.getBoundingClientRect()
);

var light = new THREE.AmbientLight(0xeeeeee); // soft white light
scene.add(light);

var directionalLight = new THREE.PointLight(0xffffff, .5);
directionalLight.position.z = 4;
directionalLight.position.y = 4;
// directionalLight.position.x = -5;
// directionalLight.rotation.x = 2;
directionalLight.lookAt(scene.position)
// directionalLight.castShadow = true;
scene.add(directionalLight);

const directionalLightHelper = new THREE.PointLightHelper(directionalLight);
scene.add(directionalLightHelper);

let objLoader;


function loadModel() {
  objLoader = new THREE.OBJLoader();
  objLoader.load('assets/model.obj', object => {
    // const object = event.detail.loaderRootNode;
      object.scale.x = .1;
      object.scale.y = .1;
      object.scale.z = .1;

      object.position.y = -1.2;

      face = object;

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
          child.geometry.fromGeometry(geometry);
        }
      })


      // window.setTimeout(() => {
        scene.add(object);
        // scene.add(mesh);
        appTitle.innerText = 'Beyoung WebGL Test';
  })
}

const textureLoader = new THREE.TextureLoader();


function loadMaterial(textureFile) {
  textureLoader.load(`assets/${textureFile}`, texture => {
    // console.log(objLoader);
    face.traverse(child => {
      if (child instanceof THREE.Mesh) {
        console.log(child.material);
        child.material = new THREE.MeshFaceMaterial([
          new THREE.MeshPhongMaterial({
            map: texture,
            transparent: true,
            needsUpdate: true
          })
        ]);
        // child.material.map = texture;
        // child.material.transparent = true;
        // child.material.opacity = 0;
        console.log(child.material);
      }
    });
  });
}

function updateMaterial(factor) {
      const mat = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: `
          varying vec2 vUv;
          void main()
          {
              vUv = uv;
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

          void main(void)
          {
              vec3 c;
              vec4 Ca = texture2D(tOne, vUv);
              vec4 Cb = texture2D(tSec, vUv);
              //c = Ca.rgb;
              c = Cb.rgb * 1.0 + Ca.rgb * 1.0 * (1.0 - Cb.a);  // blending equation
              gl_FragColor= vec4(mix(Ca.xyz, Cb.xyz, ${Number(factor).toFixed(2)}), 1.0);
          }
        `,
      });

      mesh.material = mat;
}


loadModel();

let mesh;
let uniforms;

setTimeout(() => {
face.traverse(child => {
  if (child instanceof THREE.Mesh) {
    mesh = child;
    // child.material = new THREE.MeshFaceMaterial(

    uniforms = [
      ['tOne', 'texture-acne.jpg'],
      ['tSec', 'texture-clean.jpg'],
    ]
      .map(([id,textureFile]) => ([id, new THREE.TextureLoader().load(`assets/${textureFile}`)]))
      .reduce((acc, [id, value]) => {
        acc[id] = {
          value,
          type: 't',
        }

        return acc;
      }, {})

    // );

  }
});
  updateMaterial(0);
}, 1000);
  /*
  , texture => {
    // console.log(objLoader);
        console.log(child.material);
      }
    });
  });
  */

// loadMaterial('texture-acne.jpg');
// loadMaterial('texture-clean.jpg');

// load('texture-acne.mtl');

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
  face.rotation.y = rotX;
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


camera.position.z = 15;

function animate() {
  window.requestAnimationFrame(animate);

  camera.lookAt(scene.position);

  renderer.render(scene, camera);
}

animate();

const textureSelector = document.querySelector('.range');

textureSelector.addEventListener('input', event => {
  // console.log(event.target.value);
  updateMaterial(event.target.value);
})