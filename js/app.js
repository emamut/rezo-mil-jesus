Vue.createApp({
  data() {
    return {
      count: 0,
      each: 10,
      buttonText: 'Iniciar',
    };
  },
  components: {
    'messages-component': messagesComponent,
  },
  created() {
    this.prayers = [];
  },
}).mount('#app');
