/**
 * Voces que Engañan
 * 1. Intro con la onda (2 segundos) -> pasa sola a la portada.
 * 2. Portada: suena el teléfono. "Botón rojo" atiende.
 * 3. ¿Cómo usar este teléfono? "Botón rojo" sigue.
 * 4. Tres mensajes: opciones 1, 2 y 3 (clic o teclado).
 * 5. Núcleo 1 (De una grabación a un dato): botón # para volver al menú.
 */

document.addEventListener('DOMContentLoaded', () => {
  const intro = document.getElementById('intro');
  const portada = document.getElementById('portada');
  const instrucciones = document.getElementById('instrucciones');
  const menu = document.getElementById('menu');
  const nucleo1 = document.getElementById('nucleo-1');

  const btnRojo = document.getElementById('btn-rojo');
  const btnRojo2 = document.getElementById('btn-rojo-2');
  const btnVolverMenu = document.getElementById('btn-volver-menu');
  const opciones = Array.from(document.querySelectorAll('.opcion'));

  const DURACION_INTRO_MS = 2000;

  // 'intro' | 'portada' | 'instrucciones' | 'menu' | 'nucleo-1'
  let pantalla = 'intro';

  const timbre = new Audio('Sonido-timbre-Telefono-SnapYT.App.mp3');
  timbre.loop = true;
  timbre.volume = 0.8;

  function sonarTimbre() {
    if (pantalla !== 'portada' || !timbre.paused) return;
    timbre.play().catch(() => {
      // Autoplay bloqueado: suena con la primera interacción
    });
  }

  function mostrar(el) {
    el.classList.remove('oculta');
    el.classList.add('visible');
    el.setAttribute('aria-hidden', 'false');
  }

  function ocultar(el) {
    el.classList.remove('visible');
    el.classList.add('oculta');
    el.setAttribute('aria-hidden', 'true');
  }

  // Intro -> Portada
  function entrarPortada() {
    if (pantalla !== 'intro') return;
    pantalla = 'portada';
    intro.classList.add('oculta');
    portada.classList.add('sonando');
    mostrar(portada);
    sonarTimbre();
  }

  // Portada -> Instrucciones (se atiende el teléfono)
  function atender() {
    if (pantalla !== 'portada') return;
    pantalla = 'instrucciones';
    timbre.pause();
    timbre.currentTime = 0;
    portada.classList.remove('sonando');
    ocultar(portada);
    mostrar(instrucciones);
  }

  // Instrucciones -> Tres mensajes
  function irAlMenu() {
    if (pantalla !== 'instrucciones') return;
    pantalla = 'menu';
    ocultar(instrucciones);
    mostrar(menu);
  }

  // Tono de tecla telefónica (DTMF)
  let audioCtx = null;
  const DTMF = {
    1: [697, 1209],
    2: [697, 1336],
    3: [697, 1477],
    '#': [941, 1477]
  };

  function tonoTecla(simbolo) {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const freqs = DTMF[simbolo];
      if (!freqs) return;

      const t0 = audioCtx.currentTime;
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.12, t0);
      gain.gain.setValueAtTime(0.12, t0 + 0.18);
      gain.gain.linearRampToValueAtTime(0, t0 + 0.22);
      gain.connect(audioCtx.destination);

      freqs.forEach((f) => {
        const osc = audioCtx.createOscillator();
        osc.frequency.value = f;
        osc.connect(gain);
        osc.start(t0);
        osc.stop(t0 + 0.22);
      });
    } catch (e) { /* sin audio */ }
  }

  // Ir a un núcleo desde el menú de 3 mensajes
  function elegirOpcion(num) {
    if (pantalla !== 'menu') return;
    const boton = opciones.find((b) => b.dataset.opcion === String(num));
    if (!boton) return;

    tonoTecla(num);
    boton.classList.add('presionada');
    setTimeout(() => boton.classList.remove('presionada'), 250);

    if (num === '1') {
      setTimeout(() => {
        pantalla = 'nucleo-1';
        ocultar(menu);
        mostrar(nucleo1);
      }, 280);
    }
  }

  const elementosInteractivos = Array.from(document.querySelectorAll('.elemento-interactivo'));

  // Selección de los 3 elementos interactivos en Núcleo 1 (Teléfono, Libreta, Diario)
  function seleccionarElemento(elem) {
    if (pantalla !== 'nucleo-1') return;
    const yaSeleccionado = elem.classList.contains('seleccionado');

    elementosInteractivos.forEach((el) => el.classList.remove('seleccionado'));

    if (!yaSeleccionado) {
      elem.classList.add('seleccionado');
      sonarClicElemento(elem.dataset.elem);
    }
  }

  function sonarClicElemento(tipo) {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const t0 = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      if (tipo === 'tel') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, t0);
        osc.frequency.exponentialRampToValueAtTime(90, t0 + 0.08);
        gain.gain.setValueAtTime(0.2, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.08);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.08);
      } else if (tipo === 'libreta') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(480, t0);
        osc.frequency.linearRampToValueAtTime(260, t0 + 0.09);
        gain.gain.setValueAtTime(0.12, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.09);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.09);
      } else if (tipo === 'diario') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(380, t0);
        osc.frequency.linearRampToValueAtTime(180, t0 + 0.1);
        gain.gain.setValueAtTime(0.15, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.1);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.1);
      }
    } catch (e) {}
  }

  // Volver al menú de mensajes con la tecla #
  function volverAlMenu() {
    if (pantalla !== 'nucleo-1') return;
    tonoTecla('#');

    // Deseleccionar elementos al salir
    elementosInteractivos.forEach((el) => el.classList.remove('seleccionado'));

    if (btnVolverMenu) {
      btnVolverMenu.classList.add('presionada');
      setTimeout(() => btnVolverMenu.classList.remove('presionada'), 250);
    }

    setTimeout(() => {
      pantalla = 'menu';
      ocultar(nucleo1);
      mostrar(menu);
    }, 250);
  }

  // Pasa sola a la portada a los 2 segundos
  setTimeout(entrarPortada, DURACION_INTRO_MS);

  btnRojo.addEventListener('click', atender);
  btnRojo2.addEventListener('click', irAlMenu);
  if (btnVolverMenu) {
    btnVolverMenu.addEventListener('click', volverAlMenu);
  }

  opciones.forEach((b) => {
    b.addEventListener('click', () => elegirOpcion(b.dataset.opcion));
  });

  elementosInteractivos.forEach((elem) => {
    elem.addEventListener('click', (e) => {
      e.stopPropagation();
      seleccionarElemento(elem);
    });
  });

  // Si el autoplay fue bloqueado, cualquier clic en la portada (que no sea atender) hace sonar el timbre
  window.addEventListener('pointerdown', (e) => {
    if (e.target !== btnRojo) sonarTimbre();
  });

  // Teclado
  window.addEventListener('keydown', (e) => {
    const esRojo = e.key === 'Enter' || e.key === ' ';

    if (pantalla === 'portada') {
      if (esRojo) { e.preventDefault(); atender(); } else sonarTimbre();
    } else if (pantalla === 'instrucciones') {
      if (esRojo) { e.preventDefault(); irAlMenu(); }
    } else if (pantalla === 'menu') {
      if (['1', '2', '3'].includes(e.key)) elegirOpcion(e.key);
    } else if (pantalla === 'nucleo-1') {
      if (e.key === '#' || e.key === 'Backspace' || e.key === 'Escape') {
        e.preventDefault();
        volverAlMenu();
      }
    }
  });
});
