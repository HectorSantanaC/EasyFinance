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

  // ============================================
  // INSERTAR TRANSACCIONES
  // ============================================
  const form = document.getElementById("formNewTransaction");
  const modal = document.getElementById("modalNewTransaction");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(form);

    try {
      const response = await fetch("/api/transacciones", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        // Cerrar modal Bootstrap 5
        const modalInstance = bootstrap.Modal.getInstance(modal);
        modalInstance.hide();
        mostrarAlerta("¡Transacción guardada!", "success");

        // Actualizar solo la tabla
        await actualizarTablaDashboard();
      } else {
        mostrarAlerta("Error al guardar", "danger");
      }
    } catch (error) {
      console.error("Error:", error);
      mostrarAlerta("Error de conexión", "danger");
    }
  });

  // ============================================
  // MOSTRAR ALERTA
  // ============================================
  function mostrarAlerta(mensaje, tipo = "success") {
    const icons = {
      success: "bi-check-circle-fill",
      danger: "bi-x-circle-fill",
      warning: "bi-exclamation-triangle-fill",
    };

    const toast = document.createElement("div");
    toast.className = `alert alert-${tipo} alert-dismissible fade show position-fixed shadow-lg`;
    toast.style.cssText =
      "top: 20px; right: 20px; z-index: 9999; min-width: 320px; max-width: 400px;";

    toast.innerHTML = `
    <i class="${icons[tipo] || "bi-info-circle-fill"} me-2 fs-5"></i>
    <strong>${mensaje}</strong>
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;

    document.body.appendChild(toast);

    new bootstrap.Alert(toast);

    setTimeout(() => toast.remove(), 4500);
  }

  // ============================================
  // CARGAR CATEGORÍAS
  // ============================================
  function cargarCategorias() {
    fetch("/api/categorias")
      .then((res) => res.json())
      .then((categorias) => {
        const select = document.getElementById("transactionCategory");
        if (select) {
          select.innerHTML = '<option value="">Selecciona categoría</option>';
          categorias.forEach((cat) => {
            const option = document.createElement("option");
            option.value = cat.id;
            option.textContent = cat.nombre;
            select.appendChild(option);
          });
        }
      })
      .catch((err) => console.error("Categorías:", err));
  }

  cargarCategorias();

  // ============================================
  // ACTUALIZAR TABLA
  // ============================================
  async function actualizarTablaDashboard() {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get("page") || 0;

    const response = await fetch(`/api/transacciones?page=0&size=5`);
    const data = await response.json();

    const tbody = document.getElementById("bodyDashboardTransacciones");
    tbody.innerHTML = "";

    data.content.forEach((transaccion) => {
      tbody.appendChild(crearFilaDashboard(transaccion));
    });
  }

  // ============================================
  // CREAR FILA
  // ============================================
  function crearFilaDashboard(transaccion) {
    const tr = document.createElement("tr");
    tr.className = Math.random() > 0.5 ? "table-light" : "";

    tr.innerHTML = `
      <td>
        ${new Date(transaccion.fecha).toLocaleDateString('es-ES', {
          day:'2-digit',
          month:'2-digit',
          year:'numeric'
        })}
      </td>
      <td>${transaccion.descripcion || "Sin descripción"}</td>
      <td>${transaccion.categoriaId?.nombre || "Sin categoría"}</td>
      <td>
        <span class="badge ${transaccion.tipo === "INGRESO" ? "bg-success" : "bg-danger"}">
          ${transaccion.tipo}
        </span>
      </td>
      <td class="text-end fw-bold">
        ${parseFloat(transaccion.cantidad).toLocaleString("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} €
      </td>
    `;
    return tr;
  }
});