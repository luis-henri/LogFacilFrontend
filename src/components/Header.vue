<template>
  <header class="header-container">
    <div class="header-logos">
      <!-- LOGO 1 -->
      <img 
        src="../assets/logo v1.png" 
        alt="Logo 1" 
        class="logo"
      >
      <!-- LOGO 2 -->
      <img 
        src="../assets/Ativo 2@4x.png" 
        alt="Logo 2" 
        class="logo2"
      >
    </div>
  </header>
</template>

<style scoped>
.header-container {
  display: flex;
  justify-content: flex-start; /* Alinha os logos à direita */
  align-items: center;
  padding-bottom: 1rem; /* 16px */
  margin-bottom: 1rem; /* 16px */
  border-bottom: 1px solid #e5e7eb; /* Cor cinza claro */
}
.header-logos {
  display: flex;
  gap: 1rem; /* Espaçamento entre os logos */
  align-items: center;
}
.logo {
  height: 55px; /* 2.5rem */
  object-fit: contain;
}
.logo2 {
  height: 40px; /* 2.5rem */
  object-fit: contain;
}
</style>