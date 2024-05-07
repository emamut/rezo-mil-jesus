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
  created() {
    this.prayers = [];
  },
}).mount('#app');
