document.addEventListener("DOMContentLoaded", function () {

  // ============================================
  // VARIABLES GLOBALES GRÁFICOS
  // ============================================
  let graficoBarras, graficoCircular;

  // ============================================
  // CARGAR DATOS GRÁFICOS
  // ============================================
  async function cargarDatosGraficos() {
    try {
      const response = await fetch('/api/dashboard/graficos');
      const data = await response.json();

      actualizarGraficoBarras(data);
      actualizarGraficoDonut(data);
    } catch (error) {
      console.error('Error gráficos:', error);
    }
  }

  // ============================================
  // ACTUALIZAR GRÁFICO BARRAS
  // ============================================
  function actualizarGraficoBarras(data) {
    graficoBarras.data.labels = data.meses;
    graficoBarras.data.datasets[0].data = data.ingresos.map(v => parseFloat(v.replace(/[€,]/g, '')));
    graficoBarras.data.datasets[1].data = data.gastos.map(v => parseFloat(v.replace(/[€,]/g, '')));
    graficoBarras.update('active');
  }

  // ============================================
  // ACTUALIZAR GRÁFICO DONUT
  // ============================================
  function actualizarGraficoDonut(data) {
    graficoCircular.data.labels = data.categorias;
    graficoCircular.data.datasets[0].data = data.gastosCategorias.map(v => parseFloat(v.replace(/[€,]/g, '')));

    graficoCircular.data.datasets[0].backgroundColor = data.coloresCategorias;

    graficoCircular.update('active');
  }

  // ============================================
  // INICIALIZAR GRÁFICOS
  // ============================================

  // Gráfico de barras - Ingresos y gastos
  const ctx1 = document.getElementById("balanceChart").getContext("2d");
  graficoBarras = new Chart(ctx1, {
    type: "bar",
    data: {
      labels: [],
      datasets: [{
        label: "Ingresos",
        data: [],
        backgroundColor: "#4BC0C0",
        borderColor: "#36A2EB",
        borderWidth: 1,
      },
      {
        label: "Gastos",
        data: [],
        backgroundColor: "#FF6384",
        borderColor: "#FF4560",
        borderWidth: 1,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true, ticks: { callback: value => value + "€" } } },
      plugins: {
        legend: { position: "top" },
        tooltip: { callbacks: { label: ctx => " " + ctx.dataset.label + ": " + ctx.parsed.y + "€" } }
      }
    },
  });

  // Gráfico donut - gastos por categoría
  const ctx2 = document.getElementById("expenseChart").getContext("2d");
  graficoCircular = new Chart(ctx2, {
    type: "doughnut",
    data: {
      labels: [],
      datasets: [{
        data: [],
        borderWidth: 2,
        hoverOffset: 15,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" },
        tooltip: { callbacks: { label: ctx => " " + ctx.parsed + "€" } }
      }
    }
  });

  // Cargar gráficos iniciales
  cargarDatosGraficos();

  // ============================================
  // ACTUALIZAR TODO
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

        // Actualizar
        await actualizarDashboardCompleto();
        await cargarDatosGraficos();
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
  // ACTUALIZAR DASHBOARD COMPLETO (estilo simple)
  // ============================================
  async function actualizarDashboardCompleto() {
    try {
      const response = await fetch('/api/dashboard/resumen');
      const data = await response.json();

      // Balance principal
      const balance = document.querySelector('.principal-balance');
      if (balance) {
        balance.textContent = formatEuroJS(data.balanceMes);
        balance.className = `principal-balance mb-1 ${data.balanceMes >= 0 ? 'text-success' : 'text-danger'}`;
      }

      // Ingresos
      const ingresos = document.querySelector('.kpi-card-income .h3');
      if (ingresos) ingresos.textContent = formatEuroJS(data.ingresosMes);

      // Gastos
      const gastos = document.querySelector('.kpi-card-expenses .h3');
      if (gastos) gastos.textContent = formatEuroJS(data.gastosMes);

      // Ahorros
      const ahorros = document.querySelector('.kpi-card-savings .h3');
      if (ahorros) ahorros.textContent = data.ahorrosFormateado;

      // Tabla transacciones
      const tbody = document.getElementById("bodyDashboardTransacciones");
      tbody.innerHTML = "";
      data.ultimasTransacciones.forEach((transaccion) => {
        tbody.appendChild(crearFilaDashboard(transaccion));
      });

    } catch (error) {
      console.error('Error dashboard:', error);
      mostrarAlerta("Error actualizando", "danger");
    }
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
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
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

  // Global helper
  function formatEuroJS(numero) {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numero || 0);
  }

});