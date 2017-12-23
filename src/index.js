import './app.css';

import * as THREE from 'three';

import acneTextureURL from './assets/texture-acne-explict-small.jpg';
import cleanTextureURL from './assets/texture-clean-small.jpg';
import modelURL from './assets/model.obj';

import { loadImage } from './utils';

import TextureMixer from './texture-mixer';
import SceneManager from './scene-manager';
import ControlManager from './control-manager';

const WIDTH = 500;
const HEIGHT = 500;
const ASPECT_RATIO = WIDTH / HEIGHT;
const STEP = 0.2;

(async function init() {
  const app = document.querySelector('#app');

  const textureMixer = new TextureMixer();
  const sceneManager = new SceneManager(app, WIDTH, HEIGHT);
  const controlManager = new ControlManager();

  const camera = new THREE.PerspectiveCamera(10, ASPECT_RATIO, 1, 1000);
  sceneManager.setCamera(camera);

  const ambientLight = new THREE.AmbientLight(0xcccccc);

  const pointLightWhite = new THREE.PointLight(0xffffff, .6);
  pointLightWhite.position.set(1, 2, 2);

  const pointLightRed = new THREE.PointLight(0x0000ff, .4);
  pointLightRed.position.set(-1, -2, 2);

  sceneManager.addModel(modelURL);

  sceneManager.addLight([
    ambientLight,
    pointLightWhite,
    pointLightRed,
  ]);

  sceneManager.render();

  console.log('Loading textures...');
  await textureMixer.load([ acneTextureURL, cleanTextureURL ]);
  console.log('Textures loaded.');

  console.log('Generating textures...');
  const generatedTextures = textureMixer.generate(0, 1, STEP, new THREE.TextureLoader());
  console.log('Generated.');

  controlManager.handle('.effect-control', {
    setup(el) {
      el.step = STEP;

      sceneManager.applyTexture(generatedTextures[0]);
    },
    input(event) {
      const t = generatedTextures[event.target.value];

      sceneManager.applyTexture(t);
    },
  });

  controlManager.handle('.zoom-control', {
    input(event) {
      sceneManager.updateCamera(camera => {
        camera.zoom = Number(event.target.value);
      });
    },
  });

  controlManager.handle('.model-control', {
    input(event) {
      sceneManager.updateModel(model => {
        model.rotation.y = Number(event.target.value);
      });
    },
  });
})();