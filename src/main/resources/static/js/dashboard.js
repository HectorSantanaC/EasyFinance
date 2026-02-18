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
  // INSERTAR TRANSACCIONES
  // ============================================
  const form = document.getElementById("formNewTransaction");
  const modal = document.getElementById("modalNewTransaction");

  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      // Validación
      const tipo = document.getElementById("transactionType").value;
      if (tipo === 'AHORRO' && !document.getElementById("transactionGoal")?.value) {
        mostrarAlerta("Selecciona una meta de ahorro", "warning");
        return;
      }
      if ((tipo === 'INGRESO' || tipo === 'GASTO') && !document.getElementById("transactionCategory")?.value) {
        mostrarAlerta("Selecciona una categoría", "warning");
        return;
      }

      const formData = new FormData(form);

      try {
        const response = await fetch("/api/transacciones", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const modalInstance = bootstrap.Modal.getInstance(modal);
          modalInstance.hide();
          mostrarAlerta("¡Transacción guardada!", "success");

          // Reset formulario + categorías
          form.reset();
          document.getElementById("transactionType").value = '';
          document.getElementById("transactionType").dispatchEvent(new Event('change'));

          await actualizarDashboardCompleto();
          await cargarDatosGraficos();
        } else {
          const errorText = await response.text();
          mostrarAlerta("Error: " + errorText, "danger");
        }
      } catch (error) {
        console.error("Error:", error);
        mostrarAlerta("Error de conexión", "danger");
      }
    });
  }

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
  // CARGAR CATEGORÍAS FILTRADAS POR TIPO (NUEVO)
  // ============================================
  async function cargarCategoriasPorTipo(tipo, selectId = "transactionCategory") {
    if (tipo !== 'INGRESO' && tipo !== 'GASTO') return;

    const endpoint = tipo === 'INGRESO' ? '/api/categorias/ingreso' : '/api/categorias/gasto';

    try {
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const categorias = await response.json();
      const select = document.getElementById(selectId);

      if (select) {
        select.innerHTML = '<option value="">Selecciona categoría</option>';
        categorias.forEach((cat) => {
          const option = document.createElement("option");
          option.value = cat.id;
          option.textContent = cat.nombre;
          select.appendChild(option);
        });
      }
    } catch (error) {
      console.error('Categorías dashboard:', error);
    }
  }

  // ============================================
  // MANEJO VISUAL CAMPOS NUEVA TRANSACCIÓN
  // ============================================
  const transactionTypeSelect = document.getElementById("transactionType");
  if (transactionTypeSelect) {
    transactionTypeSelect.addEventListener("change", function () {
      const tipo = this.value;
      const categoriaDiv = document.getElementById("campoCategoria");
      const metaDiv = document.getElementById("campoMeta");

      if (tipo === 'AHORRO') {
        if (categoriaDiv) categoriaDiv.style.display = 'none';
        if (metaDiv) metaDiv.style.display = 'block';
        cargarMetasUsuario("transactionGoal");
      } else if (tipo === 'INGRESO' || tipo === 'GASTO') {
        if (categoriaDiv) categoriaDiv.style.display = 'block';
        if (metaDiv) metaDiv.style.display = 'none';
        cargarCategoriasPorTipo(tipo, "transactionCategory");
      } else {
        if (categoriaDiv) categoriaDiv.style.display = 'none';
        if (metaDiv) metaDiv.style.display = 'none';
      }
    });

    // Carga inicial
    transactionTypeSelect.dispatchEvent(new Event('change'));
  }

  // ============================================
  // ACTUALIZAR DASHBOARD COMPLETO
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

  // Formatear a € con 2 dígitos
  function formatEuroJS(numero) {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      notation: 'standard',
      useGrouping: true
    }).format(numero || 0);
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
        <span class="badge 
    ${transaccion.tipo == 'INGRESO' ? 'bg-success' : 
      transaccion.tipo == 'AHORRO' ? 'bg-primary' : 
      'bg-danger'}">
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

  // ============================================
  // CARGAR METAS
  // ============================================
  async function cargarMetasUsuario(selectId = "transactionGoal") {
    try {
      const response = await fetch('/api/metas');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const metas = await response.json();
      const select = document.getElementById(selectId);

      select.innerHTML = '<option value="">Selecciona una meta</option>';
      metas.forEach((meta) => {
        const option = document.createElement("option");
        option.value = meta.id;
        option.textContent = meta.nombre;
        select.appendChild(option);
      });
    } catch (error) {
      console.error('Metas dashboard:', error);
    }
  }
});
