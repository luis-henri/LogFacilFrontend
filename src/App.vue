<template>
  <div id="app-container">
    <!-- O Vue Router irá renderizar o componente da rota ativa aqui -->
    <router-view />
  </div>
</template>

<script lang="ts" setup>
// O App.vue já não precisa de nenhuma lógica de navegação!
</script>

<style>
/* Estilos globais para o corpo da página */
body {
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f0f2f5;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
#app-container {
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
}
</style>