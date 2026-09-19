/**
 * Rezo de los Mil Jesús - Aplicación Principal Vue 3
 * Lógica reactiva, persistencia en LocalStorage, retroalimentación sonora con Web Audio API,
 * soporte táctil y háptico, atajos de teclado y modo de rezo guiado.
 */

// Contexto de audio perezoso para Web Audio API (sin dependencias externas)
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

const app = Vue.createApp({
  data() {
    return {
      count: 0,
      each: 50,
      isDark: false,
      soundEnabled: true,
      vibrateEnabled: true,
      isAutoPlaying: false,
      autoSpeedSeconds: 2.5,
      autoTimer: null,
      bumpAnimation: false,
      activeGuideTab: 'steps',
      showResetModal: false,
      guideModalInstance: null,
      resetModalInstance: null,
      radius: 110,
    };
  },
  components: {
    'messages-component': messagesComponent,
  },
  computed: {
    circumference() {
      return 2 * Math.PI * this.radius;
    },
    strokeDashoffset() {
      const progress = Math.min(1, Math.max(0, this.count / 1000));
      return this.circumference * (1 - progress);
    },
    progressPercent() {
      return Math.min(100, Math.round((this.count / 1000) * 100));
    },
    totalMysteries() {
      return Math.ceil(1000 / (this.each || 50));
    },
    currentMystery() {
      if (this.count === 0) return 0;
      return Math.min(Math.ceil(this.count / this.each), this.totalMysteries);
    },
    beadsInCurrentMystery() {
      if (this.count === 0) return 0;
      const rem = this.count % this.each;
      return rem === 0 ? this.each : rem;
    },
    buttonText() {
      if (this.count === 0) return 'Iniciar Rezo';
      if (this.count >= 1000) return '¡Completado!';
      return 'Jesús (+1)';
    },
  },
  watch: {
    count(newVal) {
      localStorage.setItem('rezo_mil_jesus_count', String(newVal));
    },
    each(newVal) {
      localStorage.setItem('rezo_mil_jesus_each', String(newVal));
    },
    isDark(newVal) {
      localStorage.setItem('rezo_mil_jesus_dark_mode', String(newVal));
      this.applyTheme(newVal);
    },
    soundEnabled(newVal) {
      localStorage.setItem('rezo_mil_jesus_sound', String(newVal));
    },
    vibrateEnabled(newVal) {
      localStorage.setItem('rezo_mil_jesus_vibrate', String(newVal));
    },
  },
  methods: {
    // Sonido suave de cuenta / cuenta de madera
    playBeadSound() {
      if (!this.soundEnabled) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        gain.gain.setValueAtTime(0.09, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.07);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.075);
      } catch (e) {
        // Silencioso si el navegador bloquea audio
      }
    },

    // Campana armónica al alcanzar un misterio
    playChimeSound() {
      if (!this.soundEnabled) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        [523.25, 659.25, 783.99].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const startTime = ctx.currentTime + idx * 0.08;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0.14, startTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.6);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + 0.65);
        });
      } catch (e) {}
    },

    // Triada final gozosa al llegar a 1000
    playCelebrationSound() {
      if (!this.soundEnabled) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        [392.0, 523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const startTime = ctx.currentTime + idx * 0.12;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0.18, startTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + 1.25);
        });
      } catch (e) {}
    },

    // Vibración háptica en dispositivos móviles
    triggerHaptic(duration = 20) {
      if (this.vibrateEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(duration);
        } catch (e) {}
      }
    },

    // Avanzar la cuenta (+1)
    increment() {
      if (this.count >= 1000) return;

      this.count++;

      // Animación micro de salto
      this.bumpAnimation = true;
      setTimeout(() => {
        this.bumpAnimation = false;
      }, 150);

      // Verificación de intervalo o final
      if (this.count === 1000) {
        if (this.isAutoPlaying) this.stopAutoPlay();
        this.playCelebrationSound();
        this.triggerHaptic([40, 60, 80, 100]);
      } else if (this.count % this.each === 0) {
        this.playChimeSound();
        this.triggerHaptic([30, 40, 50]);
      } else {
        this.playBeadSound();
        this.triggerHaptic(18);
      }
    },

    // Retroceder (-1) en caso de toque accidental
    decrement() {
      if (this.count > 0) {
        this.count--;
        this.triggerHaptic(10);
      }
    },

    // Confirmación y reinicio
    promptRestart() {
      if (this.count === 0) return;
      if (this.resetModalInstance) {
        this.resetModalInstance.show();
      } else if (confirm('¿Está seguro/a que desea reiniciar el rezo a 0?')) {
        this.confirmRestart();
      }
    },

    confirmRestart() {
      this.count = 0;
      if (this.isAutoPlaying) this.stopAutoPlay();
      if (this.resetModalInstance) {
        this.resetModalInstance.hide();
      }
    },

    // Modo manos libres / Reproducción automática
    toggleAutoPlay() {
      if (this.isAutoPlaying) {
        this.stopAutoPlay();
      } else {
        this.startAutoPlay();
      }
    },

    startAutoPlay() {
      if (this.count >= 1000) return;
      this.isAutoPlaying = true;
      this.increment();
      this.autoTimer = setInterval(() => {
        if (this.count >= 1000) {
          this.stopAutoPlay();
        } else {
          this.increment();
        }
      }, this.autoSpeedSeconds * 1000);
    },

    stopAutoPlay() {
      this.isAutoPlaying = false;
      if (this.autoTimer) {
        clearInterval(this.autoTimer);
        this.autoTimer = null;
      }
    },

    // Tema Claro / Oscuro (Vela)
    applyTheme(isDark) {
      document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
    },

    toggleTheme() {
      this.isDark = !this.isDark;
    },

    toggleSound() {
      this.soundEnabled = !this.soundEnabled;
    },

    toggleVibrate() {
      this.vibrateEnabled = !this.vibrateEnabled;
    },

    // Abrir Modal de Guía de Oraciones
    openGuideModal(tab = 'steps') {
      this.activeGuideTab = tab;
      if (this.guideModalInstance) {
        this.guideModalInstance.show();
      }
    },

    // Atajos de teclado para facilidad en PC/Laptops
    handleKeydown(e) {
      // Ignorar si el usuario está escribiendo en un input o select
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowUp') {
        e.preventDefault();
        this.increment();
      } else if (e.code === 'ArrowDown' || e.code === 'Backspace') {
        e.preventDefault();
        this.decrement();
      } else if (e.key === 'r' || e.key === 'R') {
        this.promptRestart();
      } else if (e.key === 'm' || e.key === 'M') {
        this.toggleSound();
      } else if (e.key === 'd' || e.key === 'D') {
        this.toggleTheme();
      } else if (e.key === 'p' || e.key === 'P') {
        this.toggleAutoPlay();
      } else if (e.key === '?' || e.key === 'h' || e.key === 'H') {
        this.openGuideModal('steps');
      }
    },
  },
  mounted() {
    // Restaurar configuración y progreso previo de localStorage
    const savedCount = localStorage.getItem('rezo_mil_jesus_count');
    if (savedCount !== null && !isNaN(Number(savedCount))) {
      this.count = Math.min(1000, Math.max(0, parseInt(savedCount, 10)));
    }

    const savedEach = localStorage.getItem('rezo_mil_jesus_each');
    if (savedEach !== null && !isNaN(Number(savedEach))) {
      this.each = parseInt(savedEach, 10);
    }

    const savedTheme = localStorage.getItem('rezo_mil_jesus_dark_mode');
    if (savedTheme !== null) {
      this.isDark = savedTheme === 'true';
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.isDark = true;
    }
    this.applyTheme(this.isDark);

    const savedSound = localStorage.getItem('rezo_mil_jesus_sound');
    if (savedSound !== null) {
      this.soundEnabled = savedSound === 'true';
    }

    const savedVibrate = localStorage.getItem('rezo_mil_jesus_vibrate');
    if (savedVibrate !== null) {
      this.vibrateEnabled = savedVibrate === 'true';
    }

    // Inicializar modales Bootstrap cuando el DOM esté listo
    if (typeof bootstrap !== 'undefined') {
      const guideEl = document.getElementById('guideModal');
      if (guideEl) {
        this.guideModalInstance = new bootstrap.Modal(guideEl);
      }
      const resetEl = document.getElementById('resetModal');
      if (resetEl) {
        this.resetModalInstance = new bootstrap.Modal(resetEl);
      }
    }

    // Registrar escuchador de atajos de teclado
    window.addEventListener('keydown', this.handleKeydown);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeydown);
    if (this.autoTimer) clearInterval(this.autoTimer);
  },
}).mount('#app');
