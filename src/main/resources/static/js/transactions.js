document.addEventListener("DOMContentLoaded", function () {

  // ===========================================
  // CARGAR CATEGORÍAS FILTRADAS POR TIPO
  // ===========================================
  async function cargarCategoriasPorTipo(tipo, selectId = "transactionCategory") {
    // Solo para INGRESO/GASTO (AHORRO usa metas)
    if (tipo !== 'INGRESO' && tipo !== 'GASTO') {
      return;
    }

    const endpoint = tipo === 'INGRESO' ? '/api/categorias/ingreso' : '/api/categorias/gasto';

    try {
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

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
      console.error('Error categorías:', error);
      mostrarAlerta(`Error cargando categorías ${tipo.toLowerCase()}`, "danger");
    }
  }

  // ===========================================
  // MANEJO VISUAL DE CAMPOS (NUEVA TRANSACCIÓN)
  // ===========================================
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

  // Detectar cambio TIPO → recargar categorías EDICIÓN
  const editTipoSelect = document.getElementById("editTipo");
  if (editTipoSelect) {
    editTipoSelect.addEventListener("change", function () {
      cargarCategoriasPorTipo(this.value, "editCategoria");
    });
  }

  /* ===========================================
    INSERTAR NUEVA TRANSACCIÓN
  =========================================== */
  const form = document.getElementById("formNewTransaction");
  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const formData = new FormData(form);

      try {
        const response = await fetch("/api/transacciones", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const modalInstance = bootstrap.Modal.getInstance(document.getElementById("modalNewTransaction"));
          modalInstance.hide();
          mostrarAlerta("¡Transacción guardada!", "success");
          form.reset();
          await actualizarTabla();
          await actualizarKPIs();
        } else {
          const errorText = await response.text();
          console.error('Error servidor:', errorText);
          mostrarAlerta("Error al guardar: " + errorText, "danger");
        }
      } catch (error) {
        console.error("Error:", error);
        mostrarAlerta("Error de conexión", "danger");
      }
    });
  }

  /* ===========================================
    EDITAR TRANSACCIÓN
  =========================================== */
  let transaccionEditando = null;

  window.editarTransaccion = async function (id) {
    try {
      const response = await fetch(`/api/transacciones/${id}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      transaccionEditando = data;

      // Llenar campos
      document.getElementById("editId").value = data.id;
      document.getElementById("editDescripcion").value = data.descripcion;
      document.getElementById("editImporte").value = data.cantidad;
      document.getElementById("editTipo").value = data.tipo;
      document.getElementById("editFecha").value = data.fecha?.split("T")[0] || "";

      // Manejo por TIPO
      const categoriaDiv = document.getElementById("editCategoriaDiv") || document.querySelector('[for="editCategoria"]')?.parentElement;
      const metaDiv = document.getElementById("editMetaDiv") || document.querySelector('[for="editMeta"]')?.parentElement;

      if (data.tipo === 'AHORRO') {
        // AHORRO: mostrar metas, ocultar categorías
        if (categoriaDiv) categoriaDiv.style.display = 'none';
        if (metaDiv) metaDiv.style.display = 'block';

        await cargarMetasUsuario("editMeta");
        setTimeout(() => {
          if (data.metaId?.id) {
            document.getElementById("editMeta").value = data.metaId.id;
          }
        }, 300);

      } else if (data.tipo === 'INGRESO' || data.tipo === 'GASTO') {
        // INGRESO/GASTO: mostrar categorías, ocultar metas
        if (categoriaDiv) categoriaDiv.style.display = 'block';
        if (metaDiv) metaDiv.style.display = 'none';

        await cargarCategoriasPorTipo(data.tipo, "editCategoria");
        setTimeout(() => {
          if (data.categoriaId?.id) {
            const select = document.getElementById("editCategoria");
            if (select) select.value = data.categoriaId.id;
          }
        }, 300);
      }

      new bootstrap.Modal(document.getElementById("modalEditar")).show();
    } catch (error) {
      console.error('Error editar:', error);
      mostrarAlerta("Error cargando transacción", "danger");
    }
  };

  // Guardar transacción editada
  const btnGuardarEdit = document.getElementById("btnGuardarEdit");
  if (btnGuardarEdit) {
    btnGuardarEdit.addEventListener("click", async function (e) {
      e.preventDefault();

      if (!transaccionEditando) return;

      const spinner = document.getElementById("spinnerEdit");
      const btn = this;

      spinner.classList.remove("d-none");
      btn.disabled = true;

      const tipoEdit = document.getElementById("editTipo").value;
      const categoriaEdit = document.getElementById("editCategoria").value;
      const metaEdit = document.getElementById("editMeta")?.value;

      const data = {
        id: document.getElementById("editId").value,
        descripcion: document.getElementById("editDescripcion").value,
        cantidad: parseFloat(document.getElementById("editImporte").value),
        tipo: tipoEdit,
        fecha: document.getElementById("editFecha").value,
      };

      if (tipoEdit === 'AHORRO') {
        data.metaId = metaEdit ? { id: parseInt(metaEdit) } : null;
        data.categoriaId = null;
      } else {
        data.categoriaId = categoriaEdit ? { id: parseInt(categoriaEdit) } : null;
        data.metaId = null;
      }

      try {
        const response = await fetch(`/api/transacciones/${data.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": document.querySelector('input[name="_csrf"]').value
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          const modalInstance = bootstrap.Modal.getInstance(
            document.getElementById("modalEditar"),
          );
          modalInstance.hide();
          mostrarAlerta("¡Transacción actualizada!", "success");

          // RECARGAR CON FILTROS ACTIVOS
          await actualizarTabla();
          await actualizarKPIs();
        } else {
          mostrarAlerta("Error al guardar", "danger");
        }
      } catch (error) {
        console.error("Error:", error);
        mostrarAlerta("Error de conexión", "danger");
      } finally {
        spinner.classList.add("d-none");
        btn.disabled = false;
      }
    });
  }

  /* ===========================================
    BORRAR TRANSACCIONES
    ============================================ */
  window.borrarTransaccion = async function (id) {
    if (!confirm(`¿Eliminar transacción?\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/transacciones/${id}`, {
        method: "DELETE",
        headers: { 'X-CSRF-TOKEN': document.querySelector('input[name="_csrf"]').value }
      });

      if (response.ok) {
        mostrarAlerta(`¡Transacción eliminada!`, "warning");

        // RECARGAR CON FILTROS ACTIVOS
        await actualizarTabla();
        await actualizarKPIs();
      } else {
        mostrarAlerta("Error al eliminar", "danger");
      }
    } catch (error) {
      console.error("Borrar error:", error);
      mostrarAlerta("Error conexión", "danger");
    }
  };

  /* ===========================================
    MOSTRAR ALERTA
  =========================================== */
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

  // ================================================
  // ACTUALIZAR TABLA CON FILTROS
  // ================================================
  async function actualizarTablaConFiltros(aplicarFiltros = true) {
    // Obtener parámetros de paginación (si aplica)
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get("page") || 0;

    // Recargar datos
    const response = await fetch(`/api/transacciones?page=${page}&size=50`); // size mayor para filtros
    const data = await response.json();

    // Recrear tabla completa con TODOS los datos
    const tbody = document.getElementById("bodyTransacciones");
    tbody.innerHTML = "";
    data.content.forEach((transaccion) => {
      tbody.appendChild(crearFilaTransaccion(transaccion));
    });

    // Guardar filas ORIGINALES actualizadas para futuros filtros
    window.transaccionesOriginales = Array.from(tbody.querySelectorAll('tr')).map(row => row.cloneNode(true));

    // Aplicar filtros SI se solicitan
    if (aplicarFiltros) {
      filtrarTransacciones();
    }
  }

  // ============================================
  // ACTUALIZAR TABLA SIN FILTROS
  // ============================================
  window.actualizarTabla = async function () {
    await actualizarTablaConFiltros(false); // No aplicar filtros
  };

  /* ===========================================
    CREAR FILA TABLA HTML
  ============================================ */
  function crearFilaTransaccion(transaccion) {
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
      <td>${transaccion.descripcion || ""}</td>
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
      <td class="text-center">
        <button class="btn btn-sm btn-secondary-custom me-1" 
                onclick="editarTransaccion(${transaccion.id})">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-danger-custom" 
                onclick="borrarTransaccion(${transaccion.id})">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;
    return tr;
  }

  // ============================================
  // ACTUALIZAR KPIs
  // ============================================
  async function actualizarKPIs() {
    try {
      const response = await fetch('/api/dashboard/resumen');
      const data = await response.json();

      // Balance
      const balanceEl = document.getElementById('balance');
      if (balanceEl) {
        balanceEl.textContent = formatEuroJS(data.balanceMes);
      }

      // Ingresos
      const ingresosEl = document.getElementById('totalIngresos');
      if (ingresosEl) ingresosEl.textContent = formatEuroJS(data.ingresosMes);

      // Gastos
      const gastosEl = document.getElementById('totalGastos');
      if (gastosEl) gastosEl.textContent = formatEuroJS(data.gastosMes);

    } catch (error) {
      console.error('KPIs:', error);
    }
  };

  actualizarKPIs();

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
      console.error('Error metas:', error);
      mostrarAlerta("Error cargando metas", "danger");
    }
  }

  // ============================================
  // FILTROS TRANSACCIONES
  // ============================================

  // FUNCIONES DE APOYO
  window.cargarCategoriasFiltroPorTipo = async function () {
    const tipo = document.getElementById('filtroTipo')?.value;
    const selectFiltro = document.getElementById('filtroCategoria');

    if (!selectFiltro || !tipo) {
      selectFiltro.innerHTML = '<option value="">Todas las categorías</option>';
      return;
    }

    if (tipo !== 'INGRESO' && tipo !== 'GASTO') {
      selectFiltro.innerHTML = '<option value="">Sin categorías</option>';
      return;
    }

    const endpoint = tipo === 'INGRESO' ? '/api/categorias/ingreso' : '/api/categorias/gasto';

    try {
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const categorias = await response.json();
      selectFiltro.innerHTML = '<option value="">Todas las categorías</option>';

      categorias.forEach((cat) => {
        const option = document.createElement("option");
        option.value = cat.nombre.toUpperCase();
        option.textContent = cat.nombre;
        option.dataset.id = cat.id;
        selectFiltro.appendChild(option);
      });

    } catch (error) {
      console.error('Error categorías filtro:', error);
      selectFiltro.innerHTML = '<option value="">Error cargando</option>';
    }
  };

  // FUNCIONES PRINCIPALES
  window.filtrarTransacciones = function () {
    // Validación
    if (!validarRangoFechasFiltro()) {
      console.warn('Filtro cancelado por fechas inválidas');
      return;
    }

    const tipo = document.getElementById('filtroTipo')?.value?.toUpperCase()?.trim();
    const categoriaSelect = document.getElementById('filtroCategoria')?.value?.trim();
    const fechaDesde = document.getElementById('filtroFechaDesde')?.value;
    const fechaHasta = document.getElementById('filtroFechaHasta')?.value;

    const tbody = document.getElementById('bodyTransacciones');
    if (!tbody || !window.transaccionesOriginales) {
      console.warn('No hay datos para filtrar');
      return;
    }

    tbody.innerHTML = '';
    let resultados = 0;

    window.transaccionesOriginales.forEach(row => {
      const clon = row.cloneNode(true);
      const fechaCell = clon.cells[0]?.textContent.trim(); // "DD/MM/YYYY"
      const categoriaCell = clon.cells[2]?.textContent.trim().toUpperCase();
      const tipoBadge = clon.cells[3]?.querySelector('.badge');
      const tipoCell = tipoBadge ? tipoBadge.textContent.trim().toUpperCase() : '';

      let pasaFiltro = true;

      // Filtro TIPO
      if (tipo && tipoCell !== tipo) pasaFiltro = false;

      // Filtro CATEGORÍA
      if (categoriaSelect && categoriaSelect !== "" && !categoriaCell?.includes(categoriaSelect.toUpperCase())) {
        pasaFiltro = false;
      }

      // Filtro FECHAS - CORREGIDO: parsing robusto DD/MM/YYYY → Date
      if (pasaFiltro && (fechaDesde || fechaHasta)) {
        try {
          // Parse DD/MM/YYYY → YYYY-MM-DD para Date()
          const partes = fechaCell.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
          if (!partes) {
            console.warn('Formato fecha inválido:', fechaCell);
            pasaFiltro = false;
            return; // Salta esta fila
          }
          const [, dia, mes, año] = partes;
          const fechaRow = new Date(`${año}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`);

          // Solo hora 00:00 para comparación precisa
          fechaRow.setHours(0, 0, 0, 0);

          if (fechaDesde) {
            const fechaDesdeObj = new Date(fechaDesde + 'T00:00:00');
            if (fechaRow < fechaDesdeObj) pasaFiltro = false;
          }

          if (fechaHasta) {
            const fechaHastaObj = new Date(fechaHasta + 'T23:59:59');
            if (fechaRow > fechaHastaObj) pasaFiltro = false;
          }
        } catch (e) {
          console.warn('Error parse fecha:', fechaCell, e);
          pasaFiltro = false;
        }
      }

      if (pasaFiltro) {
        tbody.appendChild(clon);
        resultados++;
      }
    });

    window.mostrarMensajeResultados(resultados);
  };

  // ============================================
  // VALIDACIÓN RANGO FECHAS
  // ============================================
  function validarRangoFechasFiltro() {
    const fechaDesde = document.getElementById('filtroFechaDesde');
    const fechaHasta = document.getElementById('filtroFechaHasta');

    if (!fechaDesde || !fechaHasta || (!fechaDesde.value && !fechaHasta.value)) return true;

    fechaDesde.classList.remove('is-invalid');
    fechaHasta.classList.remove('is-invalid');
    const errorDiv = document.getElementById('error-fechas-filtro');
    if (errorDiv) errorDiv.remove();

    if (fechaDesde.value && fechaHasta.value) {
      const desde = new Date(fechaDesde.value);
      const hasta = new Date(fechaHasta.value);

      if (desde > hasta) {
        fechaDesde.classList.add('is-invalid');
        fechaHasta.classList.add('is-invalid');

        const error = document.createElement('div');
        error.id = 'error-fechas-filtro';
        error.className = 'invalid-feedback d-block mt-1';
        error.textContent = 'La fecha "Desde" debe ser anterior a "Hasta"';

        const formFiltros = document.getElementById('formFiltros');
        if (formFiltros) formFiltros.insertBefore(error, fechaHasta.nextSibling);

        mostrarAlerta('Error: La fecha "Desde" debe ser anterior a "Hasta"', 'warning');
        return false;
      }
    }
    return true;
  }

  window.limpiarFiltros = function () {
    // Reset formulario
    const formFiltros = document.getElementById('formFiltros');
    if (formFiltros) formFiltros.reset();

    // Limpiar categorías
    const filtroCategoria = document.getElementById('filtroCategoria');
    if (filtroCategoria) {
      filtroCategoria.innerHTML = '<option value="">Todas las categorías</option>';
    }

    // Mostrar todas
    window.mostrarTodasTransacciones();

    // Ocultar mensaje
    const mensaje = document.getElementById('mensajeResultados');
    if (mensaje) mensaje.remove();
  };

  window.mostrarTodasTransacciones = function () {
    const tbody = document.getElementById('bodyTransacciones');
    if (!tbody || !window.transaccionesOriginales) return;

    tbody.innerHTML = '';
    window.transaccionesOriginales.forEach(row => {
      tbody.appendChild(row.cloneNode(true));
    });
  };

  window.mostrarMensajeResultados = function (count) {
    let mensaje = document.getElementById('mensajeResultados');
    if (mensaje) mensaje.remove();

    mensaje = document.createElement('div');
    mensaje.id = 'mensajeResultados';
    mensaje.className = 'alert alert-info mt-3 mb-0';
    mensaje.innerHTML = `
      <i class="bi bi-funnel-fill me-2"></i>
      Mostrando <strong>${count}</strong> transacción${count !== 1 ? 'es' : ''} 
      ${count === window.transaccionesOriginales?.length ? '(sin filtros)' : '(filtradas)'}
  `;

    const tbody = document.getElementById('bodyTransacciones');
    if (tbody?.parentNode) {
      tbody.parentNode.insertBefore(mensaje, tbody.nextSibling);
    }
  };

  // EVENT LISTENERS
  const formFiltros = document.getElementById('formFiltros');
  if (formFiltros) {
    formFiltros.addEventListener('submit', function (e) {
      e.preventDefault();
      window.filtrarTransacciones();
    });
  }

  const btnLimpiarFiltros = document.getElementById('btnLimpiarFiltros');
  if (btnLimpiarFiltros) {
    btnLimpiarFiltros.addEventListener('click', window.limpiarFiltros);
  }

  const filtroTipoSelect = document.getElementById('filtroTipo');
  if (filtroTipoSelect) {
    filtroTipoSelect.addEventListener('change', async function () {
      const filtroFechaDesde = document.getElementById('filtroFechaDesde');
      const filtroFechaHasta = document.getElementById('filtroFechaHasta');
      if (filtroFechaDesde) filtroFechaDesde.addEventListener('change', validarRangoFechasFiltro);
      if (filtroFechaHasta) filtroFechaHasta.addEventListener('change', validarRangoFechasFiltro);
      await window.cargarCategoriasFiltroPorTipo();
    });
  }

  setTimeout(async () => {
    await window.cargarCategoriasFiltroPorTipo();
    await actualizarTablaConFiltros(false);
  }, 500);

});
