export function loadImage(src) {
  const image = new Image();

  image.src = src;

  return new Promise(resolve => {
    image.onload = event => resolve(event.target);
  });
}
