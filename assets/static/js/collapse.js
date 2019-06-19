(() => {
  const SCALE_CONST = 0.875;
  let active = true;
  window.addEventListener('load', () => {
    const elems = document.getElementsByClassName('collapse');
    window.addEventListener('resize', () => {
      if (active) {
        for (const elem of elems) {
          elem.firstElementChild.style.maxWidth = `${elem.parentElement.parentElement.scrollWidth * SCALE_CONST}px`;
          if (elem.hasAttribute('hovered')) {
            setTimeout(() => {
              elem.style.width = `${elem.firstElementChild.scrollWidth}px`;
              elem.style.height = `${elem.firstElementChild.scrollHeight}px`;
            }, 0);
          }
        }
      }
    });
    for (const elem of elems) {
      const grandparent = elem.parentElement.parentElement;
      elem.firstElementChild.style.maxWidth = `${grandparent.scrollWidth * SCALE_CONST}px`;
      grandparent.addEventListener('mouseenter', () => {
        if (active) {
          elem.style.width = `${elem.firstElementChild.scrollWidth}px`;
          elem.style.height = `${elem.firstElementChild.scrollHeight}px`;
          elem.classList.add('hovered');
        }
      });

      elem.resetState = () => {
        if (active) {
          elem.style.width = `${elem.parentElement.firstElementChild.scrollWidth}px`;
          elem.style.height = '0';
          elem.classList.remove('hovered');
        }
      };

      grandparent.addEventListener('mouseleave', () => elem.resetState());
      setTimeout(() => {
        elem.resetState();
      }, 0);
    }
    window.reactiveCallbacks.push(mobile => {
      if (mobile) {
        active = false;
        for (const elem of elems) {
          elem.firstElementChild.style.maxWidth = null;
          elem.style.width = null;
          elem.style.height = null;
        }
      } else {
        active = true;
        for (const elem of elems) {
          elem.firstElementChild.style.maxWidth = `${elem.parentElement.parentElement.scrollWidth * SCALE_CONST}px`;
          elem.resetState();
        }
      }
    });
  });
})();
