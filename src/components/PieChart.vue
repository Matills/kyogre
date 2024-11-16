<template>
	<div class="pie-chart-container">
		<Pie :data="chartData" :options="chartOptions" />
	</div>
</template>
  
<script setup>
  import { ref, defineProps, onMounted, onUnmounted } from 'vue';
  import { Pie } from 'vue-chartjs';
  import { Chart, Title, Tooltip, Legend, ArcElement } from 'chart.js';
  
  Chart.register(Title, Tooltip, Legend, ArcElement);
  
  const props = defineProps({
    chartData: {
      type: Object,
      required: true,
    },
  });
  
  const chartInstance = ref(null);
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: 'white',
        },
      },
    },
  };
  
  onMounted(() => {
    chartInstance.value = new Pie(chartInstance.value, {
      data: props.chartData,
      options: chartOptions,
    });
  });
  
  onUnmounted(() => {
    if (chartInstance.value) {
      chartInstance.value.destroy();
    }
  });
</script>
  
<style scoped>
.pie-chart-container {
	max-width: 100%;
	height: 350px;
}
</style>
  