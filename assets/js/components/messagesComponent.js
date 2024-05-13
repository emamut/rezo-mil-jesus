const messagesComponent = {
  props: ['count', 'each'],
  data() {
    return {
      display: false,
      alertClass: '',
      iconClass: '',
      alertText: '',
      currentPrayer: 0,
      prayers: [],
    };
  },
  watch: {
    count(newValue) {
      if (newValue === 0) this.initialValues();
      if (newValue > 0) {
        this.display = false;
      }
      if (newValue % this.each == 0 && newValue !== 0) {
        this.currentPrayer++;

        if (this.currentPrayer == this.prayers.length) this.currentPrayer = 1;

        this.alertText = this.prayers[this.currentPrayer - 1];
        this.alertClass = 'warning';
        this.iconClass = 'info-circle';

        this.display = true;
      }
    },
  },
  created() {
    this.initialValues();
    this.prayers = [
      'Renuncia Satanás, que conmigo no contarás porque el Día de la Santa Cruz dije mil veces Jesús...',
      'Si a la hora de mi muerte el demonio me tentara, le diré que no tiene parte de mí, porque el día de la Santa Cruz dije mil veces: Jesús...',
      'Santísima Cruz, mi abogada has de ser, en la vida y en la muerte me has de favorecer. Si a la hora de mi muerte el demonio me tentare, le diré: Satanás, Satanás, conmigo no contarás ni tendrás parte en mi alma, porque dije mil veces Jesús...',
      'Satanás a mi casa no entrarás, en nuestros corazones no reinarás porque el Día de la Santa Cruz diremos mil veces: Jesús, Jesús...',
    ];
  },
  methods: {
    initialValues() {
      this.currentPrayer = 0;
      this.alertText =
        'El ritual de los mil Jesús comienza rezando el acto de contrición para luego seguir con un Padre Nuestro';
      this.alertClass = 'success';
      this.iconClass = 'info-circle';

      this.display = true;
    },
  },
  template: /*html*/ `<div :class="'alert alert-' + alertClass" role="alert" v-if="display">
              <i :class="'bi bi-' + iconClass + ' me-1'"></i> {{ alertText }}
            </div>`,
};
