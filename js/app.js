Vue.createApp({
  data() {
    return {
      count: 0,
      prayers: [],
      buttonText: 'Iniciar',
    };
  },
  created() {
    this.prayers = [];
  },
}).mount('#app');
