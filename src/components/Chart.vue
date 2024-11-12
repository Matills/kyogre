<template>
<transition name="fade">
    <div v-if="visible" class="chart-container bg-background p-4 rounded-lg shadow-lg">
    <canvas ref="chartCanvas"></canvas>
    </div>
</transition>
</template>

<script setup>
import { defineProps, onMounted, onUnmounted, ref } from 'vue';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip } from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip);

const props = defineProps({
    data: {
        type: Object,
        required: true
    },
    visible: {
        type: Boolean,
        default: true
    }
});

const chartCanvas = ref(null);
let chartInstance = null;

const closeChart = () => {
    chartInstance.destroy();
};

onMounted(() => {
  if (chartCanvas.value) {
    chartInstance = new Chart(chartCanvas.value, {
      type: 'bar',
      data: props.data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top' },
        },
        scales: {
          x: {
            ticks: {
              color: 'white',
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
          },
          y: {
            ticks: {
              color: 'white',
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
            beginAtZero: true,
          },
        },
      },
    });
  }
});

onUnmounted(() => {
if (chartInstance) {
    chartInstance.destroy();
}
});
</script>

<style scoped>
.chart-container {
max-width: 100%;
height: 400px;
color: white;
}

.fade-enter-active, .fade-leave-active {
transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to {
opacity: 0;
}
</style>
