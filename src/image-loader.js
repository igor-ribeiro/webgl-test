class ImageLoader {
  load(url) {
    if (Array.isArray(url)) {
      return Promise.all(url.map(u => this.load(u)));
    }

    const image = new Image();
    image.src = url;

    return new Promise(resolve => {
      image.onload = resolve(image);
    });
  }
}

export default ImageLoader;