<template>
  <transition name="fade">
    <div v-if="visible" class="popup-overlay" @click.self="close">
      <div class="popup-content">
        <h3 class="title">{{ title }}</h3>
        <p class="message">{{ message }}</p>
        <div class="actions">
          <button @click="close" class="button-primary">OK</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts" setup>
interface Props {
  visible: boolean;
  title: string;
  message: string;
}

const props = defineProps<Props>();
const emit = defineEmits(['close']);

function close() {
  emit('close');
}
</script>

<style scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.popup-content {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.title {
  font-size: 1.5em;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
}

.message {
  color: #4b5563;
  margin-bottom: 25px;
  line-height: 1.6;
}

.actions {
  display: flex;
  justify-content: center;
}

.button-primary {
  padding: 10px 25px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  font-weight: 500;
  transition: background-color 0.2s;
  background-color: #153462;
  color: white;
}

.button-primary:hover {
  background-color: #112a4f;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>