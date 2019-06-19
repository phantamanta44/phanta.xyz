window.reactiveCallbacks = [];
window.addEventListener('load', () => {

  // sound

  HTMLAudioElement.prototype.playRefreshing = function() {
    this.pause();
    this.currentTime = 0;
    this.play();
  };

  // globals

  const elemWrapper = document.getElementById('wrapper');
  const elemMain = document.getElementsByTagName('main')[0];

  let rupeeCount = 0, displayedRupeeCount = 0;
  let rupeeUpdateTask = null;

  (storedRupeeCount => {
    if (!isNaN(storedRupeeCount)) {
      rupeeCount = displayedRupeeCount = Math.max(Math.min(storedRupeeCount, 999), 0);
    }
  })(parseInt(window.sessionStorage.getItem('rupees'), 10));

  // navbar
  const elemNav = document.getElementsByTagName('nav')[0];
  const elemNavHl = document.getElementById('nav-highlight');

  function genNavHlMutator(elem) {
    return () => {
      const parentBounds = elemNav.getBoundingClientRect();
      const elemBounds = elem.getBoundingClientRect();
      elemNavHl.style.width = `${elemBounds.width}px`;
      elemNavHl.style.left = `${elemBounds.left - parentBounds.left}px`;
    };
  }

  const path = document.location.pathname;
  const file = path === '/' ? 'index' : path.substring(path.lastIndexOf('/') + 1, path.lastIndexOf('.html'));
  const elemNavSelected = document.getElementById(`nav-elem-${file}`);
  const resetNavHl = genNavHlMutator(elemNavSelected);
  elemNav.onmouseleave = resetNavHl;
  for (const elem of document.getElementsByClassName('nav-elem')) {
    elem.onmouseenter = genNavHlMutator(elem);
  }
  window.addEventListener('resize', resetNavHl);

  // mobile stylesheet application
  const elemNavFirst = elemNav.firstElementChild;
  const elemNavLast = elemNav.lastElementChild.previousElementSibling;
  let resizeStyleTask = null;

  function resizeStyleHandler() {
    document.body.classList.remove('mobile');
    if (resizeStyleTask != null) window.clearTimeout(resizeStyleTask);
    resizeStyleTask = window.setTimeout(() => {
      if (elemNavFirst.offsetTop !== elemNavLast.offsetTop) {
        document.body.classList.add('mobile');
        for (const callback of window.reactiveCallbacks) {
          callback(true);
        }
      } else {
        for (const callback of window.reactiveCallbacks) {
          callback(false);
        }
      }
    }, 1);
  }

  window.addEventListener('resize', resizeStyleHandler);

  // mobile menu toggle
  const elemHeader = document.getElementsByTagName('header')[0];
  document.getElementById('mobile-expand').onclick = () => {
    elemHeader.classList.toggle('expanded');
  };

  // rupees
  const elemRupeeCount = document.getElementById('rupee-counter-text');

  function setDisplayedRupeeCount(count) {
    elemRupeeCount.innerText = count.toString().padStart(3, '0');
  }

  setDisplayedRupeeCount(rupeeCount);
  const rupeeValues = [
    {value: 1, sound: '1'},
    {value: 5, sound: '5'},
    {value: 10, sound: '10'},
    {value: 20, sound: 'big'},
    {value: 50, sound: 'big'},
    {value: 100, sound: 'big'},
    {value: 200, sound: 'big'},
  ];
  const rupeeSounds = ['1', '5', '10', 'big']
      .reduce((m, s) => {
        m[s] = document.getElementById(`rupee-audio-${s}`);
        return m;
      }, {});
  const selectRupee = (() => {
    let segments = rupeeValues.map(r => 1000 / r.value);
    let accum = 0;
    segments = segments.map(w => accum += w);
    return () => {
      const selection = Math.random() * accum;
      for (let i = 0; i < segments.length; ++i) {
        if (selection < segments[i]) return rupeeValues[i];
      }
      throw new Error('what the heck?');
    };
  })();
  const sndRupeeChangeProgress = document.getElementById('rupee-audio-change-progress');
  const sndRupeeChangeDone = document.getElementById('rupee-audio-change-done');

  function updateRupeeCount(offset) {
    if (rupeeCount < 999) {
      rupeeCount = Math.min(rupeeCount + offset, 999);
      window.sessionStorage.setItem('rupees', rupeeCount.toString());
      if (rupeeUpdateTask === null) {
        window.setTimeout(function rupeeUpdateTick() {
          setDisplayedRupeeCount(++displayedRupeeCount);
          if (displayedRupeeCount !== rupeeCount) {
            sndRupeeChangeProgress.playRefreshing();
            rupeeUpdateTask = setTimeout(rupeeUpdateTick, 36);
          } else {
            sndRupeeChangeDone.playRefreshing();
            rupeeUpdateTask = null;
          }
        }, 250);
      }
    }
  }

  window.setTimeout(() => (rupeeGenBatch => {
    const headerOffset = 100 * elemHeader.clientHeight / document.body.clientHeight;
    const remainingHeight = 100 - 2 * headerOffset;
    let left = Math.random() < 0.5;
    for (let i = 0; i < rupeeGenBatch; ++i) {
      (rupee => {
        const elemRupee = document.createElement('div');
        const elemRupeeImg = document.createElement('img');
        elemRupeeImg.setAttribute('src', `/static/img/rupee/${rupee.value}.png`);
        elemRupeeImg.classList.add('rupee-img');
        elemRupee.appendChild(elemRupeeImg);
        elemRupee.classList.add('rupee');
        elemRupee.onclick = () => {
          elemRupee.remove();
          rupeeSounds[rupee.sound].playRefreshing();
          updateRupeeCount(rupee.value);
        };
        elemRupee.style.left = (left = !left) ? `${Math.random() * 8}%` : `${Math.random() * 8 + 92}%`;
        elemRupee.style.top = `${Math.random() * remainingHeight + headerOffset}%`;
        elemWrapper.appendChild(elemRupee);
      })(selectRupee());
    }
  })(0.001 + Math.random() * 1.5 * document.body.clientHeight / window.innerHeight), 1);

  // init
  elemMain.style.display = 'block';
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      resetNavHl();
      resizeStyleHandler();
      window.setTimeout(() => document.body.classList.add('loaded'), 1);
    });
  } else {
    window.setTimeout(() => {
      resetNavHl();
      resizeStyleHandler();
      window.setTimeout(() => document.body.classList.add('loaded'), 1);
    }, 50);
  }

});
