<template>
  <div id="app">
    <TestSerival msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
import TestSerival from './components/TestSerial.vue'

export default {
  name: 'App',
  components: {
    TestSerival
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
