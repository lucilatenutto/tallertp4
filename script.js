
document.addEventListener('DOMContentLoaded', () => {
  const intro = document.getElementById('intro');
  const portada = document.getElementById('portada');
  const instrucciones = document.getElementById('instrucciones');
  const menu = document.getElementById('menu');
  const nucleo1 = document.getElementById('nucleo-1');
  const nucleo2 = document.getElementById('nucleo-2');
  const nucleo3 = document.getElementById('nucleo-3');
  let nucleoActual = nucleo1;

  const btnRojo = document.getElementById('btn-rojo');
  const btnRojo2 = document.getElementById('btn-rojo-2');
  const btnVolverMenu = document.getElementById('btn-volver-menu');
  const opciones = Array.from(document.querySelectorAll('.opcion'));

  const pantallaDesafio = document.getElementById('pantalla-desafio');
  const pantallaAudios = document.getElementById('pantalla-audios');
  const btnRojoMenu = document.getElementById('btn-rojo-menu');
  const btnRojoDesafio = document.getElementById('btn-rojo-desafio');
  const btnVotoIA = document.getElementById('btn-voto-ia');
  const btnVotoReal = document.getElementById('btn-voto-real');
  const audioTituloNum = document.getElementById('audio-titulo-num');
  const audioVisualizador = document.querySelector('.audio-visualizador');
  const audioFeedback = document.getElementById('audio-feedback');
  const modalAudiosResultado = document.getElementById('modal-audios-resultado');
  const resultadoGrid = document.getElementById('resultado-grid');
  const btnVolverInicio = document.getElementById('btn-volver-inicio');

  let audioActualIndice = 1;
  const votosAudios = {};
  let audioTimer = null;

  const DURACION_INTRO_MS = 2000;

  // 'intro' | 'portada' | 'instrucciones' | 'menu' | 'nucleo-1' | 'nucleo-2' | 'nucleo-3' | 'desafio-intro' | 'audios'
  let pantalla = 'intro';

  const timbre = document.getElementById('audio-timbre') || new Audio('Sonido-timbre-Telefono-SnapYT.App.mp3');
  timbre.loop = true;
  timbre.volume = 0.8;
  try {
    timbre.load();
  } catch (e) { }

  let intentoTimbreInterval = null;

  function sonarTimbre() {
    if (pantalla !== 'portada') return;

    function intentar() {
      if (pantalla !== 'portada') {
        if (intentoTimbreInterval) {
          clearInterval(intentoTimbreInterval);
          intentoTimbreInterval = null;
        }
        return;
      }
      if (!timbre.paused) {
        if (intentoTimbreInterval) {
          clearInterval(intentoTimbreInterval);
          intentoTimbreInterval = null;
        }
        return;
      }
      const p = timbre.play();
      if (p !== undefined) {
        p.then(() => {
          if (intentoTimbreInterval) {
            clearInterval(intentoTimbreInterval);
            intentoTimbreInterval = null;
          }
        }).catch(() => { });
      }
    }

    intentar();
    if (timbre.paused && !intentoTimbreInterval) {
      intentoTimbreInterval = setInterval(intentar, 300);
    }
  }

  timbre.addEventListener('canplaythrough', () => {
    if (pantalla === 'portada' && timbre.paused) sonarTimbre();
  });
  window.addEventListener('focus', () => {
    if (pantalla === 'portada' && timbre.paused) sonarTimbre();
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && pantalla === 'portada' && timbre.paused) sonarTimbre();
  });

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

  function entrarPortada() {
    if (pantalla !== 'intro') return;
    pantalla = 'portada';
    intro.classList.add('oculta');
    portada.classList.add('sonando');
    mostrar(portada);
    sonarTimbre();
  }

  function atender() {
    if (pantalla !== 'portada') return;
    pantalla = 'instrucciones';
    if (intentoTimbreInterval) {
      clearInterval(intentoTimbreInterval);
      intentoTimbreInterval = null;
    }
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

  let audioCtx = null;
  const DTMF = {
    1: [697, 1209],
    2: [697, 1336],
    3: [697, 1477],
    4: [770, 1209],
    5: [770, 1336],
    6: [770, 1477],
    7: [852, 1209],
    8: [852, 1336],
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

  let nucleo1Completado = false;
  let nucleo2Completado = false;
  let nucleo3Completado = false;

  function verificarTodosCompletados() {
    if (nucleo1Completado && nucleo2Completado && nucleo3Completado) {
      menu.classList.add('todos-completados');
    }
  }

  function marcarNucleoCompletado(num) {
    if (num === 1) nucleo1Completado = true;
    if (num === 2) nucleo2Completado = true;
    if (num === 3) nucleo3Completado = true;
    const opcion = document.querySelector('.opcion-' + num);
    if (opcion) {
      opcion.classList.add('completada');
    }
    verificarTodosCompletados();
  }

  function elegirOpcion(num) {
    if (pantalla !== 'menu') return;
    const boton = opciones.find((b) => b.dataset.opcion === String(num));
    if (!boton) return;

    tonoTecla(num);
    boton.classList.add('presionada');
    setTimeout(() => boton.classList.remove('presionada'), 250);

    if (num === '1') {
      nucleo1Completado = true;
      setTimeout(() => {
        pantalla = 'nucleo-1';
        nucleoActual = nucleo1;
        ocultar(menu);
        mostrar(nucleo1);
      }, 280);
    } else if (num === '2') {
      nucleo2Completado = true;
      setTimeout(() => {
        pantalla = 'nucleo-2';
        nucleoActual = nucleo2;
        ocultar(menu);
        mostrar(nucleo2);
      }, 280);
    } else if (num === '3') {
      nucleo3Completado = true;
      setTimeout(() => {
        pantalla = 'nucleo-3';
        nucleoActual = nucleo3;
        ocultar(menu);
        mostrar(nucleo3);
      }, 280);
    }
  }

  const elementosInteractivos = Array.from(document.querySelectorAll('.elemento-interactivo'));

  const modalDetalleTel = document.getElementById('modal-detalle-tel');
  const modalDetalleLibreta = document.getElementById('modal-detalle-libreta');
  const modalDetalleDiario = document.getElementById('modal-detalle-diario');
  const modalDetalleTel2 = document.getElementById('modal-detalle-tel2');
  const modalDetalleMaquina = document.getElementById('modal-detalle-maquina');
  const modalDetalleDiario2 = document.getElementById('modal-detalle-diario2');
  const modalDetalleLibreta3 = document.getElementById('modal-detalle-libreta3');
  const modalDetalleCarpeta = document.getElementById('modal-detalle-carpeta');
  const modalDetalleDiario3 = document.getElementById('modal-detalle-diario3');
  const modalBuzonVoz = document.getElementById('modal-buzon-voz');
  const modalAudio1 = document.getElementById('modal-audio-1');
  const modalAudio2 = document.getElementById('modal-audio-2');
  const modalBuzonVoz2 = document.getElementById('modal-buzon-voz-2');
  const modalAudio1b = document.getElementById('modal-audio-1-b');
  const modalAudio2b = document.getElementById('modal-audio-2-b');

  const btnCerrarDetalle = document.querySelector('.btn-cerrar-detalle');
  const btnCerrarLibreta = document.querySelector('.btn-cerrar-libreta');
  const btnCerrarDiario = document.querySelector('.btn-cerrar-diario');
  const btnsCerrarBuzon = Array.from(document.querySelectorAll('.btn-cerrar-buzon'));
  const btnCerrarTel2 = document.querySelector('.btn-cerrar-tel2');
  const btnCerrarMaquina = document.querySelector('.btn-cerrar-maquina');
  const btnCerrarDiario2 = document.querySelector('.btn-cerrar-diario2');
  const btnCerrarLibreta3 = document.querySelector('.btn-cerrar-libreta3');
  const btnCerrarCarpeta = document.querySelector('.btn-cerrar-carpeta');
  const btnCerrarDiario3 = document.querySelector('.btn-cerrar-diario3');
  const btnVolverMenu3 = document.getElementById('btn-volver-menu-3');
  const btnVolverMenu2 = document.getElementById('btn-volver-menu-2');
  const btnsCerrarAudio = Array.from(document.querySelectorAll('.btn-cerrar-audio'));

  let modalActivo = null;
  let timerPaseBuzon = null;

  function abrirModal(modal) {
    if (!modal) return;
    if (timerPaseBuzon) {
      clearTimeout(timerPaseBuzon);
      timerPaseBuzon = null;
    }

    if (modalActivo && modalActivo !== modal) {
      modalActivo.classList.remove('visible');
      modalActivo.setAttribute('aria-hidden', 'true');
    }
    modal.classList.add('visible');
    modal.setAttribute('aria-hidden', 'false');
    modalActivo = modal;

    // Si entramos a la libreta, a los 3 segundos pasa automáticamente a Buzón de Voz
    if (modal === modalDetalleLibreta) {
      timerPaseBuzon = setTimeout(() => {
        abrirModal(modalBuzonVoz);
      }, 3000);
    }

    // Si entramos al teléfono del Núcleo 2, a los 3 segundos pasa automáticamente a Buzón de Voz
    if (modal === modalDetalleTel2) {
      timerPaseBuzon = setTimeout(() => {
        abrirModal(modalBuzonVoz2);
      }, 3000);
    }
  }

  function cerrarModal() {
    if (!modalActivo) return;
    if (timerPaseBuzon) {
      clearTimeout(timerPaseBuzon);
      timerPaseBuzon = null;
    }

    tonoTecla('#');
    const btnCerrar = modalActivo.querySelector('.btn-hash');
    if (btnCerrar) {
      btnCerrar.classList.add('presionada');
      setTimeout(() => btnCerrar.classList.remove('presionada'), 250);
    }

    // Si estamos reproduciendo audio 1 ó 2, volver al buzón de voz
    if (modalActivo === modalAudio1 || modalActivo === modalAudio2) {
      abrirModal(modalBuzonVoz);
      return;
    }
    if (modalActivo === modalAudio1b || modalActivo === modalAudio2b) {
      abrirModal(modalBuzonVoz2);
      return;
    }

    modalActivo.classList.remove('visible');
    modalActivo.setAttribute('aria-hidden', 'true');
    modalActivo = null;
    elementosInteractivos.forEach((el) => {
      el.classList.remove('seleccionado');
      el.classList.remove('presionado');
    });
    nucleoActual.classList.remove('elemento-activo');
  }

  function reproducirMensajeAudio(numero) {
    tonoTecla(numero);
    const enNucleo2 = pantalla === 'nucleo-2';
    if (numero === '7' || numero === 1) {
      abrirModal(enNucleo2 ? modalAudio1b : modalAudio1);
    } else if (numero === '8' || numero === 2) {
      abrirModal(enNucleo2 ? modalAudio2b : modalAudio2);
    }
  }

  // Selección de los 3 elementos interactivos en Núcleo 1 y 2 (4, 5 y 6)
  function seleccionarElemento(elem) {
    if (pantalla !== 'nucleo-1' && pantalla !== 'nucleo-2' && pantalla !== 'nucleo-3') return;
    if (!nucleoActual.contains(elem)) return;
    const yaSeleccionado = elem.classList.contains('seleccionado');

    elementosInteractivos.forEach((el) => {
      el.classList.remove('seleccionado');
      el.classList.remove('presionado');
    });

    if (yaSeleccionado) {
      nucleoActual.classList.remove('elemento-activo');
      if (modalActivo) cerrarModal();
    } else {
      elem.classList.add('seleccionado');
      elem.classList.add('presionado');
      setTimeout(() => elem.classList.remove('presionado'), 260);
      nucleoActual.classList.add('elemento-activo');

      const num = elem.dataset.opcion;
      if (num) tonoTecla(num);
      sonarClicElemento(elem.dataset.elem);

      if (elem.dataset.elem === 'tel') {
        setTimeout(() => abrirModal(modalDetalleTel), 320);
      } else if (elem.dataset.elem === 'libreta') {
        setTimeout(() => abrirModal(modalDetalleLibreta), 320);
      } else if (elem.dataset.elem === 'diario') {
        setTimeout(() => abrirModal(modalDetalleDiario), 320);
      } else if (elem.dataset.elem === 'tel2') {
        setTimeout(() => abrirModal(modalDetalleTel2), 320);
      } else if (elem.dataset.elem === 'maquina') {
        setTimeout(() => abrirModal(modalDetalleMaquina), 320);
      } else if (elem.dataset.elem === 'diario2') {
        setTimeout(() => abrirModal(modalDetalleDiario2), 320);
      } else if (elem.dataset.elem === 'libreta3') {
        setTimeout(() => abrirModal(modalDetalleLibreta3), 320);
      } else if (elem.dataset.elem === 'carpeta') {
        setTimeout(() => abrirModal(modalDetalleCarpeta), 320);
      } else if (elem.dataset.elem === 'diario3') {
        setTimeout(() => abrirModal(modalDetalleDiario3), 320);
      }
    }
  }

  function sonarClicElemento(tipo) {
    tipo = ({ tel2: 'tel', maquina: 'libreta', diario2: 'diario', libreta3: 'libreta', carpeta: 'tel', diario3: 'diario' })[tipo] || tipo;
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
    } catch (e) { }
  }

  // Volver al menú de mensajes con la tecla #
  function volverAlMenu() {
    if (pantalla !== 'nucleo-1' && pantalla !== 'nucleo-2' && pantalla !== 'nucleo-3') return;
    const numNucleo = pantalla === 'nucleo-3' ? 3 : (pantalla === 'nucleo-2' ? 2 : 1);
    const nucleoSaliente = nucleoActual;
    const btnVolver = numNucleo === 3 ? btnVolverMenu3 : (numNucleo === 2 ? btnVolverMenu2 : btnVolverMenu);
    if (modalActivo) {
      cerrarModal();
      return;
    }

    tonoTecla('#');

    // Deseleccionar elementos y quitar difuminado activo al salir
    elementosInteractivos.forEach((el) => {
      el.classList.remove('seleccionado');
      el.classList.remove('presionado');
    });
    nucleoSaliente.classList.remove('elemento-activo');

    if (btnVolver) {
      btnVolver.classList.add('presionada');
      setTimeout(() => btnVolver.classList.remove('presionada'), 250);
    }

    marcarNucleoCompletado(numNucleo);

    setTimeout(() => {
      pantalla = 'menu';
      ocultar(nucleoSaliente);
      mostrar(menu);
    }, 250);
  }

  setTimeout(entrarPortada, DURACION_INTRO_MS);

  btnRojo.addEventListener('click', atender);
  btnRojo2.addEventListener('click', irAlMenu);
  if (btnVolverMenu) {
    btnVolverMenu.addEventListener('click', volverAlMenu);
  }
  if (btnVolverMenu2) {
    btnVolverMenu2.addEventListener('click', volverAlMenu);
  }
  if (btnVolverMenu3) {
    btnVolverMenu3.addEventListener('click', volverAlMenu);
  }

  [btnCerrarTel2, btnCerrarMaquina, btnCerrarDiario2, btnCerrarLibreta3, btnCerrarCarpeta, btnCerrarDiario3].forEach((btn) => {
    if (!btn) return;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      cerrarModal();
    });
  });

  if (btnCerrarDetalle) {
    btnCerrarDetalle.addEventListener('click', (e) => {
      e.stopPropagation();
      cerrarModal();
    });
  }

  if (btnCerrarLibreta) {
    btnCerrarLibreta.addEventListener('click', (e) => {
      e.stopPropagation();
      cerrarModal();
    });
  }

  if (btnCerrarDiario) {
    btnCerrarDiario.addEventListener('click', (e) => {
      e.stopPropagation();
      cerrarModal();
    });
  }

  btnsCerrarBuzon.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      cerrarModal();
    });
  });

  btnsCerrarAudio.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      cerrarModal();
    });
  });

  // Opciones de Buzón de Voz (clic en 7 u 8)
  const buzonItems = Array.from(document.querySelectorAll('.buzon-opcion-item, .btn-num-buzon'));
  buzonItems.forEach((el) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const audioId = el.dataset.audio;
      if (audioId === '1') reproducirMensajeAudio('7');
      else if (audioId === '2') reproducirMensajeAudio('8');
    });
  });

  [modalDetalleTel, modalDetalleLibreta, modalDetalleDiario, modalDetalleTel2, modalDetalleMaquina, modalDetalleDiario2, modalDetalleLibreta3, modalDetalleCarpeta, modalDetalleDiario3, modalBuzonVoz, modalAudio1, modalAudio2, modalBuzonVoz2, modalAudio1b, modalAudio2b].forEach((modal) => {
    if (!modal) return;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        cerrarModal();
      }
    });
  });

  opciones.forEach((b) => {
    b.addEventListener('click', () => elegirOpcion(b.dataset.opcion));
  });

  elementosInteractivos.forEach((elem) => {
    elem.addEventListener('click', (e) => {
      e.stopPropagation();
      seleccionarElemento(elem);
    });
  });

  // Sonido sintetizado al reproducir cada uno de los 4 audios
  function sonarAudioOnda(num) {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const t0 = audioCtx.currentTime;
      const freqs = [380, 460, 540, 620];
      const baseFreq = freqs[(num - 1) % freqs.length];

      const osc = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(baseFreq, t0);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.85, t0 + 1.8);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(baseFreq * 1.5, t0);

      gain.gain.setValueAtTime(0.08, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 2.0);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(t0);
      osc2.start(t0);
      osc.stop(t0 + 2.0);
      osc2.stop(t0 + 2.0);
    } catch (e) { }
  }

  function irAPantallaDesafio() {
    if (pantalla !== 'menu') return;
    if (!nucleo1Completado || !nucleo2Completado || !nucleo3Completado) return;
    tonoTecla('#');
    pantalla = 'desafio-intro';
    ocultar(menu);
    mostrar(pantallaDesafio);
  }

  function irAPantallaAudios() {
    if (pantalla !== 'desafio-intro') return;
    tonoTecla('#');
    pantalla = 'audios';
    ocultar(pantallaDesafio);
    mostrar(pantallaAudios);
    iniciarSecuenciaAudios();
  }

  function iniciarSecuenciaAudios() {
    audioActualIndice = 1;
    cargarAudio(1);
  }

  function cargarAudio(num) {
    audioActualIndice = num;
    if (audioTituloNum) {
      audioTituloNum.textContent = `Audio número ${num}`;
    }
    if (audioVisualizador) {
      audioVisualizador.classList.add('reproduciendo');
    }
    sonarAudioOnda(num);
    if (audioTimer) clearTimeout(audioTimer);
    audioTimer = setTimeout(() => {
      if (audioVisualizador) audioVisualizador.classList.remove('reproduciendo');
    }, 2200);
  }

  function emitirVoto(tipo) {
    if (pantalla !== 'audios') return;
    if (modalAudiosResultado && modalAudiosResultado.classList.contains('visible')) return;

    sonarClicElemento('tel');
    votosAudios[audioActualIndice] = tipo;

    const btn = tipo === 'IA' ? btnVotoIA : btnVotoReal;
    if (btn) {
      btn.classList.add('presionado');
      setTimeout(() => btn.classList.remove('presionado'), 220);
    }

    if (audioFeedback) {
      audioFeedback.textContent = `Voto registrado: ${tipo}`;
      audioFeedback.classList.add('visible');
      setTimeout(() => audioFeedback.classList.remove('visible'), 650);
    }

    if (audioActualIndice < 4) {
      setTimeout(() => {
        cargarAudio(audioActualIndice + 1);
      }, 800);
    } else {
      setTimeout(() => {
        mostrarResultadosFinales();
      }, 850);
    }
  }

  function mostrarResultadosFinales() {
    if (!resultadoGrid) return;
    resultadoGrid.innerHTML = '';
    for (let i = 1; i <= 4; i++) {
      const item = document.createElement('div');
      item.className = 'resultado-item';
      item.innerHTML = `<span>Audio ${i}</span><span class="resultado-voto">${votosAudios[i] || '-'}</span>`;
      resultadoGrid.appendChild(item);
    }
    if (modalAudiosResultado) {
      modalAudiosResultado.classList.add('visible');
      modalAudiosResultado.setAttribute('aria-hidden', 'false');
    }
  }

  function volverAlInicio() {
    if (modalAudiosResultado) {
      modalAudiosResultado.classList.remove('visible');
      modalAudiosResultado.setAttribute('aria-hidden', 'true');
    }
    ocultar(pantallaAudios);
    pantalla = 'menu';
    mostrar(menu);
  }

  if (btnRojoMenu) {
    btnRojoMenu.addEventListener('click', irAPantallaDesafio);
  }
  if (btnRojoDesafio) {
    btnRojoDesafio.addEventListener('click', irAPantallaAudios);
  }
  if (btnVotoIA) {
    btnVotoIA.addEventListener('click', () => emitirVoto('IA'));
  }
  if (btnVotoReal) {
    btnVotoReal.addEventListener('click', () => emitirVoto('Real'));
  }
  if (btnVolverInicio) {
    btnVolverInicio.addEventListener('click', volverAlInicio);
  }

  // Teclado
  window.addEventListener('keydown', (e) => {
    const esRojo = e.key === 'Enter' || e.key === ' ';

    if (pantalla === 'portada') {
      if (esRojo) { e.preventDefault(); atender(); }
    } else if (pantalla === 'instrucciones') {
      if (esRojo) { e.preventDefault(); irAlMenu(); }
    } else if (pantalla === 'menu') {
      if (esRojo && nucleo1Completado && nucleo2Completado && nucleo3Completado) {
        e.preventDefault();
        irAPantallaDesafio();
      } else if (['1', '2', '3'].includes(e.key)) {
        elegirOpcion(e.key);
      }
    } else if (pantalla === 'desafio-intro') {
      if (esRojo) {
        e.preventDefault();
        irAPantallaAudios();
      }
    } else if (pantalla === 'audios') {
      if (modalAudiosResultado && modalAudiosResultado.classList.contains('visible')) {
        if (esRojo || e.key === '#' || e.key === 'Escape') {
          e.preventDefault();
          volverAlInicio();
        }
      } else {
        if (e.key === 'ArrowLeft' || e.key === '1' || e.key.toLowerCase() === 'i') {
          e.preventDefault();
          emitirVoto('IA');
        } else if (e.key === 'ArrowRight' || e.key === '2' || e.key.toLowerCase() === 'r') {
          e.preventDefault();
          emitirVoto('Real');
        }
      }
    } else if (pantalla === 'nucleo-1' || pantalla === 'nucleo-2' || pantalla === 'nucleo-3') {
      if (e.key === '#' || e.key === 'Backspace' || e.key === 'Escape') {
        e.preventDefault();
        if (modalActivo) {
          cerrarModal();
        } else {
          volverAlMenu();
        }
      } else if (e.key === '7') {
        e.preventDefault();
        if ((pantalla === 'nucleo-1' && (modalActivo === modalBuzonVoz || !modalActivo)) ||
          (pantalla === 'nucleo-2' && modalActivo === modalBuzonVoz2)) {
          reproducirMensajeAudio('7');
        }
      } else if (e.key === '8') {
        e.preventDefault();
        if ((pantalla === 'nucleo-1' && (modalActivo === modalBuzonVoz || !modalActivo)) ||
          (pantalla === 'nucleo-2' && modalActivo === modalBuzonVoz2)) {
          reproducirMensajeAudio('8');
        }
      } else if (['4', '5', '6'].includes(e.key)) {
        e.preventDefault();
        if (modalActivo) {
          const opcionActual = (modalActivo === modalDetalleTel && e.key === '4') ||
            (modalActivo === modalDetalleTel2 && e.key === '4') ||
            (modalActivo === modalDetalleMaquina && e.key === '5') ||
            (modalActivo === modalDetalleLibreta3 && e.key === '4') ||
            (modalActivo === modalDetalleCarpeta && e.key === '5') ||
            (modalActivo === modalDetalleDiario3 && e.key === '6') ||
            (modalActivo === modalDetalleDiario2 && e.key === '6') ||
            (modalActivo === modalDetalleLibreta && e.key === '5') ||
            (modalActivo === modalDetalleDiario && e.key === '6');
          if (opcionActual) {
            cerrarModal();
          } else {
            cerrarModal();
            setTimeout(() => {
              const elem = elementosInteractivos.find((el) => el.dataset.opcion === e.key && nucleoActual.contains(el));
              if (elem) seleccionarElemento(elem);
            }, 180);
          }
        } else {
          const elem = elementosInteractivos.find((el) => el.dataset.opcion === e.key && nucleoActual.contains(el));
          if (elem) seleccionarElemento(elem);
        }
      }
    }
  });
});
