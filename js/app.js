Vue.createApp({
  data() {
    return {
      count: 0,
      prayers: [],
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
