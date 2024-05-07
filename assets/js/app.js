Vue.createApp({
  data() {
    return {
      count: 0,
      each: 50,
      buttonText: 'Iniciar',
    };
  },
  components: {
    'messages-component': messagesComponent,
  },
  methods: {
    restartPray() {
      if (confirm('¿Está seguro/a que desea reiniciar el rezo?')) {
        this.count = 0;
      }
    },
  },
  created() {
    this.prayers = [];
  },
}).mount('#app');
