document.addEventListener("DOMContentLoaded", function () {

  // ============================================
  // GRÁFICOS (Chart.js)
  // ============================================
  
  // Gráfico de barras - Ingresos y gastos
  const ctx1 = document.getElementById("balanceChart").getContext("2d");
  const graficoBarras = new Chart(ctx1, {
    type: "bar",
    data: {
      labels: [
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
        "Enero",
      ],
      datasets: [
        {
          label: "Ingresos",
          data: [2500, 2800, 2600, 3000, 2700, 2900],
          backgroundColor: "#4BC0C0",
          borderColor: "#36A2EB",
          borderWidth: 1,
        },
        {
          label: "Gastos",
          data: [1800, 2100, 1900, 2200, 2000, 2300],
          backgroundColor: "#FF6384",
          borderColor: "#FF4560",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return value + "€";
            },
          },
        },
      },
      plugins: {
        legend: {
          position: "top",
          display: true,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return (
                " " + context.dataset.label + ": " + context.parsed.y + "€"
              );
            },
          },
        },
      },
    },
  });

  // Gráfico donut - gastos por categoría
  const ctx2 = document.getElementById("expenseChart").getContext("2d");
  const graficoCircular = new Chart(ctx2, {
    type: "doughnut",
    data: {
      labels: ["Comida", "Transporte", "Entretenimiento", "Servicios"],
      datasets: [
        {
          data: [300, 150, 200, 100],
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
          borderWidth: 2,
          hoverOffset: 15,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = "";
              if (label) {
                label += ": ";
              }
              label += context.parsed + "€";
              return " " + label;
            },
          },
        },
      },
    },
  });
});