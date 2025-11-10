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
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}

#app-container {
  min-height: 100vh;       /* garante 100% da altura da viewport */
  display: flex;
  flex-direction: column;  /* header (se houver) + conteúdo */
}
</style>