/**
 * Voces que Engañan - Lógica de Presentación Diapositiva a Diapositiva
 * Preparada para control por Teclado y Sensores Físicos (Makey Makey, Arduino, etc.)
 */

document.addEventListener('DOMContentLoaded', () => {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const btnNextCover = document.getElementById('btn-next-cover');
  const btnBack = document.getElementById('btn-back');
  const deck = document.getElementById('deck');

  let currentSlideIndex = 0;
  let isTransitioning = false;
  const DEBOUNCE_TIME_MS = 350; // Filtro antirrebote para sensores físicos

  // Web Audio API para simular el "clic" mecánico de relé telefónico al avanzar
  let audioCtx = null;
  function playTelephoneClick() {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.06);
    } catch (e) {
      // Audio silencioso si el navegador restringe sin interacción previa
    }
  }

  /**
   * Cambia a una diapositiva específica
   * @param {number} newIndex 
   */
  function goToSlide(newIndex) {
    if (newIndex < 0 || newIndex >= slides.length || newIndex === currentSlideIndex) {
      return;
    }

    playTelephoneClick();

    // Pulso visual en el lienzo para confirmar recepción de señal del sensor
    deck.classList.add('sensor-active-feedback');
    setTimeout(() => deck.classList.remove('sensor-active-feedback'), 350);

    const currentSlide = slides[currentSlideIndex];
    const targetSlide = slides[newIndex];

    if (newIndex > currentSlideIndex) {
      currentSlide.classList.remove('active');
      currentSlide.classList.add('prev');
      targetSlide.classList.remove('prev');
      targetSlide.classList.add('active');
    } else {
      currentSlide.classList.remove('active', 'prev');
      targetSlide.classList.remove('prev');
      targetSlide.classList.add('active');
    }

    currentSlideIndex = newIndex;
  }

  function nextSlide() {
    if (isTransitioning) return;
    isTransitioning = true;
    setTimeout(() => { isTransitioning = false; }, DEBOUNCE_TIME_MS);

    if (currentSlideIndex < slides.length - 1) {
      goToSlide(currentSlideIndex + 1);
    } else {
      // Si llega al final, vuelve a la portada
      goToSlide(0);
    }
  }

  function prevSlide() {
    if (isTransitioning) return;
    isTransitioning = true;
    setTimeout(() => { isTransitioning = false; }, DEBOUNCE_TIME_MS);

    if (currentSlideIndex > 0) {
      goToSlide(currentSlideIndex - 1);
    }
  }

  // Clic en el botón "Siguiente" de la portada
  if (btnNextCover) {
    btnNextCover.addEventListener('click', (e) => {
      e.stopPropagation();
      nextSlide();
    });
  }

  // Clic en botón "Volver a la portada"
  if (btnBack) {
    btnBack.addEventListener('click', (e) => {
      e.stopPropagation();
      goToSlide(0);
    });
  }

  /**
   * Listener de Teclado y Sensores:
   * Los sensores tipo Makey Makey, Arduino emulando teclado HID, o pulsadores USB
   * emiten eventos 'keydown' con teclas estándar (Espacio, Flechas, Enter, o letras).
   */
  window.addEventListener('keydown', (e) => {
    // Teclas para AVANZAR:
    // Barra espaciadora, Flecha Derecha, Flecha Abajo, Enter, PageDown
    const nextKeys = ['Space', 'ArrowRight', 'ArrowDown', 'Enter', 'PageDown', ' '];
    
    // Teclas para RETROCEDER:
    // Flecha Izquierda, Flecha Arriba, Backspace, PageUp
    const prevKeys = ['ArrowLeft', 'ArrowUp', 'Backspace', 'PageUp'];

    if (nextKeys.includes(e.code) || nextKeys.includes(e.key)) {
      e.preventDefault();
      nextSlide();
    } else if (prevKeys.includes(e.code) || prevKeys.includes(e.key)) {
      e.preventDefault();
      prevSlide();
    }
  });

  // Atajo: doble clic o clic en fondo (opcional) para avanzar si se usa pantalla táctil
  document.addEventListener('dblclick', () => {
    nextSlide();
  });
});
