<template>
  <div v-if="visible && requisicao" class="popup-overlay" @click.self="closePopup">
    <div class="popup-content">
      <div class="popup-header">
        <h3>Detalhes da Requisição</h3>
        <button @click="closePopup" class="button-secondary">Voltar para a Lista de Atendimento</button>
      </div>
      <div class="details-grid">
        <div><strong>Data Requisição:</strong> {{ new Date(requisicao.data_requisicao).toLocaleDateString('pt-BR') }}</div>
        <div><strong>Número Requisição:</strong> {{ requisicao.numero_requisicao }}</div>
        <div class="col-span-2"><strong>Unidade Requisitante:</strong> {{ requisicao.requisitante_requisicao }}</div>
      </div>
      <h4 class="items-title">Itens da Requisição</h4>
      <div class="items-table-container">
        <table v-if="requisicao.itens && requisicao.itens.length > 0">
          <thead>
            <tr>
              <th>Sequência</th>
              <th>Endereço</th>
              <th>Material</th>
              <th>Qtd. Solicitada</th>
              <th>Qtd. Atendida</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in requisicao.itens" :key="item.id_item_requisicao">
              <td>{{ index + 1 }}</td>
              <td>{{ item.endereco_item_requisicao || '-' }}</td>
              <td>{{ item.descricao_material_item_requisicao }}</td>
              <td>{{ item.quantidade_solicitada_item_requisicao }} {{ item.unidade_material_item_requisicao }}</td>
              <td>{{ item.quantidade_atendida_item_requisicao }} {{ item.unidade_material_item_requisicao }}</td>
            </tr>
          </tbody>
        </table>
        <div v-else class="no-data-message">
            Nenhum item encontrado para esta requisição.
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { IRequisicoes } from '../interfaces/IRequisicoes';

// O componente agora recebe o objeto completo da requisição
defineProps<{
  visible: boolean;
  requisicao: IRequisicoes | null;
}>();

const emit = defineEmits(['close']);

function closePopup() {
  emit('close');
}
</script>

<style scoped>
.popup-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 15px; }
.popup-content { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2); width: 100%; max-width: 800px; display: flex; flex-direction: column; gap: 20px; }
.popup-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 15px; }
.popup-header h3 { margin: 0; font-size: 1.4em; color: #333; }
.button-secondary { padding: 8px 16px; background-color: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 0.9em; transition: background-color 0.2s; }
.button-secondary:hover { background-color: #5a6268; }
.details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; color: #4b5563; }
.col-span-2 { grid-column: span 2 / span 2; }
.items-title { font-size: 1.2em; font-weight: 600; color: #333; margin-top: 10px; border-top: 1px solid #eee; padding-top: 15px; }
.items-table-container { max-height: 300px; overflow-y: auto; }
table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
thead { background-color: #f8f9fa; }
th, td { border: 1px solid #e9ecef; padding: 10px 12px; text-align: left; }
th { font-weight: 600; }
.no-data-message { text-align: center; padding: 20px; color: #6c757d; font-style: italic; }
</style>