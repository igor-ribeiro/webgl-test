class ControlManager {
  handle(selector, events) {
    const control = document.querySelector(selector);

    Object.keys(events).forEach(event => {
      const handler = events[event];

      if (event === 'setup') {
        handler(control);

        return;
      }

      control.addEventListener(event, handler);
    });
  }
}

export default ControlManager;