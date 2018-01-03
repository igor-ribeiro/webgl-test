import './app.css';

import * as THREE from 'three';

import acneTextureURL from './assets/texture-acne.jpg';
import cleanTextureURL from './assets/texture-clean.jpg';
import modelURL from './assets/model.obj';

import { loadImage } from './utils';

import TextureMixer from './texture-mixer';
import SceneManager from './scene-manager';
import ControlManager from './control-manager';
import ImageLoader from './image-loader';

const WIDTH = 500;
const HEIGHT = 500;
const ASPECT_RATIO = WIDTH / HEIGHT;
const STEP = 0.1;

(async function init() {
  const app = document.querySelector('#app');

  const textureMixer = new TextureMixer();
  const sceneManager = new SceneManager(app, WIDTH, HEIGHT);
  const controlManager = new ControlManager();
  const imageLoader = new ImageLoader();

  const camera = new THREE.PerspectiveCamera(10, ASPECT_RATIO, 1, 1000);
  sceneManager.setCamera(camera);

  const ambientLight = new THREE.AmbientLight(0xcccccc);

  const pointLightWhite = new THREE.PointLight(0xffffff, .5);
  pointLightWhite.position.set(2, 2, 2);

  const pointLightRed = new THREE.PointLight(0xffffff, .3);
  pointLightRed.position.set(0, 1, 50);

  sceneManager.addLight([
    ambientLight,
    pointLightWhite,
    pointLightRed,
  ]);

  sceneManager.render();

  /*
  console.log('Loading textures...');
  await textureMixer.load([ acneTextureURL, cleanTextureURL ]);
  console.log('Textures loaded.');

  console.log('Generating textures...');
  const generatedTextures = textureMixer.generate(0, 1, STEP, new THREE.TextureLoader());
  console.log('Generated.');
  */

  console.log('Loading textures...');
  const textures = await imageLoader.load([ acneTextureURL, cleanTextureURL ]);
  console.log('Textures loaded.');

  console.log('Loading model...');
  await sceneManager.addModel(modelURL);
  console.log('Loaded');

  sceneManager.applyTextures(textures);

  controlManager.handle('.effect-control', {
    setup(el) {
      el.step = STEP;

      // sceneManager.applyTexture(generatedTextures[0]);
    },
    input(event) {
      // const t = generatedTextures[event.target.value];

      // sceneManager.applyTexture(t);
      sceneManager.applyTexture(event.target.value);
    },
  });

  controlManager.handle('.zoom-control', {
    input(event) {
      sceneManager.updateCamera(camera => {
        // camera.zoom = Number(event.target.value);
        camera.position.z = Number(event.target.value) * 7;
      });
    },
  });

  controlManager.handle('.model-control', {
    input(event) {
      sceneManager.updateModel(model => {
        model.rotation.y = -Number(event.target.value);
      });
    },
  });

  controlManager.handle('.location-x-control', {
    input(event) {
      sceneManager.updateModel(model => {
        model.position.x = Number(event.target.value) * 2;
      });
    },
  });
})();