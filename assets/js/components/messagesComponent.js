/**
 * Componente de Mensajes y Oraciones Litúrgicas
 * Gestiona las oraciones intermedias, oraciones iniciales y oración final
 * con rotación cíclica sin desbordamiento ni omisiones.
 */

const messagesComponent = {
  props: {
    count: {
      type: Number,
      default: 0,
    },
    each: {
      type: Number,
      default: 50,
    },
  },
  emits: ['open-guide', 'restart'],
  data() {
    return {
      isMinimized: false,
      prayers: [
        'Santísima Cruz, mi abogada has de ser, en la vida y en la muerte me has de favorecer. Si a la hora de mi muerte el demonio me tentare, le diré: Satanás, Satanás, conmigo no contarás ni tendrás parte en mi alma, porque dije mil veces Jesús.',
        'Renuncia Satanás, que conmigo no contarás, porque el Día de la Santa Cruz dije mil veces: Jesús.',
        'Si a la hora de mi muerte el demonio me tentare, le diré que no tiene parte de mí, porque el Día de la Santa Cruz dije mil veces: Jesús.',
        'Satanás a mi casa no entrarás, en nuestros corazones no reinarás, porque el Día de la Santa Cruz diremos mil veces: Jesús, Jesús.',
      ],
      finalPrayer:
        'Te adoramos, oh Cristo, y te bendecimos, que por tu Santa Cruz redimiste al mundo. ¡Jesús, Jesús, Jesucristo! ¡Oh Jesús, mi Jesús por siempre! Jesús, Jesús en mi vida, Jesús, Jesús en mi muerte. Dulce Jesús, sé mi Jesús y sálvanos. Amén.',
    };
  },
  computed: {
    // Total de misterios o intervalos según la configuración
    totalMysteries() {
      return Math.ceil(1000 / (this.each || 50));
    },
    // Número de misterio actual (1-indexado)
    currentMysteryIndex() {
      if (this.count === 0) return 0;
      return Math.min(Math.ceil(this.count / this.each), this.totalMysteries);
    },
    // Índice de la oración rotativa (0, 1, 2, 3)
    prayerIndex() {
      if (this.count === 0) return 0;
      const step = Math.floor((this.count - 1) / this.each);
      return step % this.prayers.length;
    },
    // Texto de la oración del intervalo actual
    currentPrayerText() {
      return this.prayers[this.prayerIndex];
    },
    // Si la cuenta actual acaba de completar exactamente un intervalo
    isAtMilestone() {
      return this.count > 0 && this.count < 1000 && this.count % this.each === 0;
    },
    isCompleted() {
      return this.count >= 1000;
    },
  },
  methods: {
    openGuide(tab = 'prayers') {
      this.$emit('open-guide', tab);
    },
    restart() {
      this.$emit('restart');
    },
    toggleMinimize() {
      this.isMinimized = !this.isMinimized;
    },
  },
  template: /*html*/ `
    <div class="prayer-component-wrapper">
      <!-- 1. Estado Inicial (count === 0) -->
      <div v-if="count === 0" class="devotional-prayer-card">
        <div class="prayer-header">
          <span class="prayer-category-tag">
            <i class="bi bi-book-half"></i> Preparación del Rezo
          </span>
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary rounded-pill px-3"
            @click="openGuide('prayers')"
          >
            <i class="bi bi-eye me-1"></i> Ver oraciones
          </button>
        </div>
        <p class="prayer-body-text">
          "El ritual de los Mil Jesús comienza persignándose con la Santa Cruz, rezando con devoción el Acto de Contrición y luego un Padre Nuestro."
        </p>
        <div class="prayer-footer-hint">
          <i class="bi bi-info-circle text-primary"></i>
          <span>Cuando estés listo, presiona <strong>Iniciar Rezo</strong> para comenzar a invocar el Nombre de Jesús.</span>
        </div>
      </div>

      <!-- 2. Estado Completado (count >= 1000) -->
      <div v-else-if="isCompleted" class="completion-banner">
        <div class="completion-icon">
          <i class="bi bi-award-fill"></i>
        </div>
        <h3 class="font-cinzel text-uppercase fw-bold mb-2">¡Mil Jesús Completados!</h3>
        <p class="text-muted mb-3">
          Has invocado mil veces el Santo Nombre de Jesús. Reza con fe la Oración Final de la Santa Cruz:
        </p>
        <div class="devotional-prayer-card mb-3 text-start">
          <div class="prayer-header">
            <span class="prayer-category-tag text-primary">
              <i class="bi bi-shield-check"></i> Oración Final de la Santa Cruz
            </span>
          </div>
          <p class="prayer-body-text fs-5">
            "{{ finalPrayer }}"
          </p>
        </div>
        <div class="d-flex flex-wrap justify-content-center gap-2 mt-3">
          <button
            type="button"
            class="btn btn-primary rounded-pill px-4"
            @click="openGuide('home-prayer')"
          >
            <i class="bi bi-house-heart me-1"></i> Oración por el Hogar
          </button>
          <button
            type="button"
            class="btn btn-outline-secondary rounded-pill px-4"
            @click="restart"
          >
            <i class="bi bi-arrow-repeat me-1"></i> Rezar de nuevo
          </button>
        </div>
      </div>

      <!-- 3. Estado en Curso (count > 0 y count < 1000) -->
      <div
        v-else
        class="devotional-prayer-card"
        :class="{ highlight: isAtMilestone }"
      >
        <div class="prayer-header">
          <span class="prayer-category-tag" :class="isAtMilestone ? 'text-danger' : 'text-gold'">
            <i class="bi" :class="isAtMilestone ? 'bi-bell-fill' : 'bi-flower1'"></i>
            <template v-if="isAtMilestone">
              ¡Misterio {{ Math.floor(count / each) }} alcanzado!
            </template>
            <template v-else>
              Misterio {{ currentMysteryIndex }} de {{ totalMysteries }} ({{ count % each || each }} / {{ each }})
            </template>
          </span>

          <div class="d-flex align-items-center gap-2">
            <button
              type="button"
              class="btn btn-sm btn-link p-0 text-muted"
              :title="isMinimized ? 'Expandir oración' : 'Minimizar oración'"
              @click="toggleMinimize"
            >
              <i class="bi" :class="isMinimized ? 'bi-chevron-down' : 'bi-chevron-up'"></i>
            </button>
          </div>
        </div>

        <div v-show="!isMinimized">
          <p class="prayer-body-text">
            "{{ currentPrayerText }}"
          </p>

          <div v-if="isAtMilestone" class="alert alert-warning py-2 px-3 mb-2 rounded-3 small d-flex align-items-center gap-2">
            <i class="bi bi-check2-circle fs-5 text-warning-emphasis"></i>
            <div>
              <strong>Pausa devocional:</strong> Reza ahora <strong>1 Padre Nuestro</strong> y <strong>1 Gloria</strong> antes de continuar.
            </div>
          </div>

          <div class="prayer-footer-hint justify-content-between">
            <span>
              <i class="bi bi-quote"></i> Oración {{ prayerIndex + 1 }} de {{ prayers.length }} de la Santa Cruz
            </span>
            <button
              type="button"
              class="btn btn-sm btn-link p-0 text-decoration-none"
              @click="openGuide('prayers')"
            >
              Ver todas <i class="bi bi-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
};
