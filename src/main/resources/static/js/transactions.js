document.addEventListener("DOMContentLoaded", function () {
  // ===========================================
  // UTILIDADES COMUNES
  // ===========================================
  function mostrarAlerta(mensaje, tipo = "success") {
    const icons = {
      success: "bi-check-circle-fill",
      danger: "bi-x-circle-fill",
      warning: "bi-exclamation-triangle-fill",
    };
    const toast = document.createElement("div");
    toast.className = `alert alert-${tipo} alert-dismissible fade show position-fixed shadow-lg`;
    toast.style.cssText = "top: 20px; right: 20px; z-index: 9999; min-width: 320px; max-width: 400px;";
    toast.innerHTML = `
      <i class="${icons[tipo] || "bi-info-circle-fill"} me-2 fs-5"></i>
      <strong>${mensaje}</strong>
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(toast);
    new bootstrap.Alert(toast);
    setTimeout(() => toast.remove(), 4500);
  }

  function formatEuroJS(numero) {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numero || 0);
  }

  // ===========================================
  // CARGAR LISTAS (CATEGORÍAS/METAS)
  // ===========================================
  async function cargarCategoriasPorTipo(tipo, selectId) {
    if (tipo !== 'INGRESO' && tipo !== 'GASTO') return;
    const endpoint = tipo === 'INGRESO' ? '/api/categorias/ingreso' : '/api/categorias/gasto';
    try {
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const categorias = await response.json();
      const select = document.getElementById(selectId);
      if (select) {
        select.innerHTML = '<option value="">Selecciona categoría</option>';
        categorias.forEach(cat => {
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

  async function cargarMetasUsuario(selectId) {
    try {
      const response = await fetch('/api/metas');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const metas = await response.json();
      const select = document.getElementById(selectId);
      if (select) {
        select.innerHTML = '<option value="">Selecciona una meta</option>';
        metas.forEach(meta => {
          const option = document.createElement("option");
          option.value = meta.id;
          option.textContent = meta.nombre;
          select.appendChild(option);
        });
      }
    } catch (error) {
      console.error('Error metas:', error);
      mostrarAlerta("Error cargando metas", "danger");
    }
  }

  // ===========================================
  // CRUD TRANSACCIONES
  // ===========================================
  let transaccionEditando = null;

  window.editarTransaccion = async function (id) {
    try {
      const response = await fetch(`/api/transacciones/${id}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      transaccionEditando = data;

      // Llenar campos
      document.getElementById("editId").value = data.id;
      document.getElementById("editDescripcion").value = data.descripcion || "";
      document.getElementById("editImporte").value = data.cantidad || "";
      document.getElementById("editTipo").value = data.tipo || "";
      document.getElementById("editFecha").value = data.fecha ? data.fecha.split("T")[0] : "";

      // Mostrar/ocultar campos por tipo
      const categoriaDiv = document.getElementById("editCategoriaDiv");
      const metaDiv = document.getElementById("editMetaDiv");
      if (data.tipo === 'AHORRO') {
        if (categoriaDiv) categoriaDiv.style.display = 'none';
        if (metaDiv) metaDiv.style.display = 'block';
        await cargarMetasUsuario("editMeta");
        setTimeout(() => document.getElementById("editMeta").value = data.metaId?.id || "", 100);
      } else if (data.tipo === 'INGRESO' || data.tipo === 'GASTO') {
        if (categoriaDiv) categoriaDiv.style.display = 'block';
        if (metaDiv) metaDiv.style.display = 'none';
        await cargarCategoriasPorTipo(data.tipo, "editCategoria");
        setTimeout(() => document.getElementById("editCategoria").value = data.categoriaId?.id || "", 100);
      }

      new bootstrap.Modal(document.getElementById("modalEditar")).show();
    } catch (error) {
      console.error('Error editar:', error);
      mostrarAlerta("Error cargando transacción", "danger");
    }
  };

  window.borrarTransaccion = async function (id) {
    if (!confirm(`¿Eliminar transacción ${id}?\nEsta acción no se puede deshacer.`)) return;
    try {
      const response = await fetch(`/api/transacciones/${id}`, {
        method: "DELETE",
        headers: { 'X-CSRF-TOKEN': document.querySelector('input[name="_csrf"]').value }
      });
      if (response.ok) {
        mostrarAlerta("¡Transacción eliminada!", "warning");
        await actualizarTabla();
      } else {
        mostrarAlerta("Error al eliminar", "danger");
      }
    } catch (error) {
      console.error("Borrar error:", error);
      mostrarAlerta("Error de conexión", "danger");
    }
  };

  // ===========================================
  // FORMULARIOS (NUEVA/EDITAR)
  // ===========================================
  const formNew = document.getElementById("formNewTransaction");
  if (formNew) {
    formNew.addEventListener("submit", async function (e) {
      e.preventDefault();
      const formData = new FormData(formNew);
      try {
        const response = await fetch("/api/transacciones", { method: "POST", body: formData });
        if (response.ok) {
          bootstrap.Modal.getInstance(document.getElementById("modalNewTransaction")).hide();
          mostrarAlerta("¡Transacción guardada!", "success");
          formNew.reset();
          await actualizarTabla();
        } else {
          const errorText = await response.text();
          mostrarAlerta("Error al guardar: " + errorText, "danger");
        }
      } catch (error) {
        mostrarAlerta("Error de conexión", "danger");
      }
    });
  }

  const btnGuardarEdit = document.getElementById("btnGuardarEdit");
  if (btnGuardarEdit) {
    btnGuardarEdit.addEventListener("click", async function () {
      const editId = document.getElementById("editId").value;
      if (!transaccionEditando?.id || !editId) {
        mostrarAlerta("Error: ID no válido", "danger");
        return;
      }

      const spinner = document.getElementById("spinnerEdit");
      const btn = this;
      spinner?.classList.remove("d-none");
      btn.disabled = true;

      const tipo = document.getElementById("editTipo").value;
      const data = {
        descripcion: document.getElementById("editDescripcion").value,
        importe: parseFloat(document.getElementById("editImporte").value),
        tipo,
        fecha: document.getElementById("editFecha").value,
      };
      if (tipo === 'AHORRO') data.idMeta = document.getElementById("editMeta")?.value;
      else data.idCategoria = document.getElementById("editCategoria")?.value;

      try {
        const response = await fetch(`/api/transacciones/${editId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": document.querySelector('input[name="_csrf"]').value
          },
          body: JSON.stringify(data),
        });
        if (response.ok) {
          bootstrap.Modal.getInstance(document.getElementById("modalEditar")).hide();
          mostrarAlerta("¡Transacción actualizada!", "success");
          await actualizarTabla();
        } else {
          mostrarAlerta("Error al guardar", "danger");
        }
      } catch (error) {
        mostrarAlerta("Error de conexión", "danger");
      } finally {
        spinner?.classList.add("d-none");
        btn.disabled = false;
      }
    });
  }

  // ===========================================
  // MANEJO VISUAL TIPOS
  // ===========================================
  const transactionTypeSelect = document.getElementById("transactionType");
  if (transactionTypeSelect) {
    transactionTypeSelect.addEventListener("change", function () {
      const tipo = this.value;
      const categoriaDiv = document.getElementById("campoCategoria");
      const metaDiv = document.getElementById("campoMeta");
      if (tipo === 'AHORRO') {
        categoriaDiv.style.display = 'none';
        metaDiv.style.display = 'block';
        cargarMetasUsuario("transactionGoal");
      } else if (tipo === 'INGRESO' || tipo === 'GASTO') {
        categoriaDiv.style.display = 'block';
        metaDiv.style.display = 'none';
        cargarCategoriasPorTipo(tipo, "transactionCategory");
      } else {
        categoriaDiv.style.display = 'none';
        metaDiv.style.display = 'none';
      }
    });
    transactionTypeSelect.dispatchEvent(new Event('change'));
  }

  const editTipoSelect = document.getElementById("editTipo");
  if (editTipoSelect) {
    editTipoSelect.addEventListener("change", function () {
      cargarCategoriasPorTipo(this.value, "editCategoria");
    });
  }

  // ===========================================
  // TABLA Y PAGINACIÓN
  // ===========================================
  function crearFilaTransaccion(transaccion) {
    const tr = document.createElement("tr");
    tr.className = Math.random() > 0.5 ? "table-light" : "";
    tr.innerHTML = `
    <td>${new Date(transaccion.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
    <td>${transaccion.descripcion || ""}</td>
    <td>${transaccion.categoriaId?.nombre || transaccion.metaId?.nombre || "Sin categoría"}</td>
    <td><span class="badge ${transaccion.tipo === 'INGRESO' ? 'bg-success' : transaccion.tipo === 'AHORRO' ? 'bg-primary' : 'bg-danger'}">${transaccion.tipo}</span></td>
    <td class="text-end fw-bold">${formatEuroJS(transaccion.cantidad)}</td>
    <td class="text-center">
      <button class="btn btn-sm btn-secondary-custom me-1" onclick="editarTransaccion(${transaccion.id})"><i class="bi bi-pencil"></i></button>
      <button class="btn btn-sm btn-danger-custom" onclick="borrarTransaccion(${transaccion.id})"><i class="bi bi-trash"></i></button>
    </td>
  `;
    return tr;
  }

  // ===========================================
  // ACTUALIZAR KPIs
  // ===========================================
  async function actualizarKPIs() {
    try {
      const response = await fetch('/api/dashboard/resumen');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      // Verificar elementos antes de actualizar
      const balanceEl = document.getElementById('balance');
      const ingresosEl = document.getElementById('totalIngresos');
      const gastosEl = document.getElementById('totalGastos');

      if (balanceEl) balanceEl.textContent = formatEuroJS(data.balanceMes);
      if (ingresosEl) ingresosEl.textContent = formatEuroJS(data.ingresosMes);
      if (gastosEl) gastosEl.textContent = formatEuroJS(data.gastosMes);

    } catch (error) {
      console.error('Error KPIs:', error);
      mostrarAlerta('Error actualizando resumen financiero', 'warning');
    }
  }

  function actualizarContadorPaginacion(data) {
    const contador = document.getElementById('contadorTransacciones');
    if (contador && data.totalElements !== undefined) {
      const inicio = data.number * data.size + 1;
      const fin = Math.min((data.number + 1) * data.size, data.totalElements);
      contador.textContent = `${data.totalElements} transacciones`;
    }
  }

  // Regenerar paginación completa
  function actualizarPaginacionCompleta(data) {
    const navPaginacion = document.getElementById('paginacion');
    if (!navPaginacion || data.totalPages <= 1) {
      if (navPaginacion) navPaginacion.style.display = 'none';
      return;
    }

    // Botones dinámicos (max 5 páginas visibles)
    let botonesHtml = `
    <li class="page-item ${data.number === 0 ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${Math.max(0, data.number - 1)}">Anterior</a>
    </li>`;

    const startPage = Math.max(0, data.number - 2);
    const endPage = Math.min(data.totalPages - 1, data.number + 2);
    for (let i = startPage; i <= endPage; i++) {
      botonesHtml += `
      <li class="page-item ${i === data.number ? 'active' : ''}">
        <a class="page-link" href="#" data-page="${i}">${i + 1}</a>
      </li>`;
    }

    botonesHtml += `
    <li class="page-item ${data.number === data.totalPages - 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${Math.min(data.totalPages - 1, data.number + 1)}">Siguiente</a>
    </li>`;

    const inicio = data.number * data.size + 1;
    const fin = Math.min((data.number + 1) * data.size, data.totalElements);
    const infoHtml = `
    <div class="text-center text-muted small mt-2">
      Mostrando ${fin} de ${data.totalElements} transacciones
    </div>`;

    navPaginacion.innerHTML = `<ul class="pagination justify-content-center">${botonesHtml}</ul>${infoHtml}`;
    navPaginacion.style.display = 'block';
  }

  // Cargar página
  async function cargarPagina(params) {
    const tbody = document.getElementById('bodyTransacciones');
    if (!tbody) return;

    // Spinner
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div></td></tr>';

    try {
      const response = await fetch(`/api/transacciones?${params}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      // Tabla
      tbody.innerHTML = '';
      data.content.forEach(t => tbody.appendChild(crearFilaTransaccion(t)));

      // Paginación + Contador + KPIs
      actualizarPaginacionCompleta(data);
      actualizarContadorPaginacion(data);
      await actualizarKPIs();
    } catch (error) {
      console.error('Error carga:', error);
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger py-4">Error cargando datos</td></tr>';
      mostrarAlerta('Error cargando datos', 'danger');
    }
  }

  // Cargar página con filtros/paginación
  window.actualizarTabla = async function (aplicarFiltros = true) {
    const formFiltros = document.getElementById('formFiltros');
    const params = new URLSearchParams(aplicarFiltros && formFiltros ? new FormData(formFiltros) : new URLSearchParams());
    params.set('page', '0');
    params.set('size', '10');
    await cargarPagina(params);
  };

  const navPaginacion = document.getElementById('paginacion');
  if (navPaginacion) {
    navPaginacion.addEventListener('click', async e => {
      const link = e.target.closest('a[data-page]');
      if (!link) return;
      e.preventDefault();

      const formFiltros = document.getElementById('formFiltros');
      const params = new URLSearchParams(formFiltros ? new FormData(formFiltros) : new URLSearchParams());
      params.set('page', link.dataset.page);
      params.set('size', '10');
      await cargarPagina(params);
    });
  }

  // ===========================================
  // FILTROS
  // ===========================================
  async function inicializarFiltrosCompletos() {
    const formFiltros = document.getElementById('formFiltros');
    const filtroTipo = document.getElementById('filtroTipo');
    const btnLimpiar = document.getElementById('btnLimpiarFiltros');

    if (!formFiltros) {
      console.warn('formFiltros no encontrado');
      return false;
    }

    // SUBMIT FORM
    formFiltros.addEventListener('submit', async e => {
      e.preventDefault();
      if (!validarRangoFechasFiltro()) return;

      const params = new URLSearchParams(new FormData(formFiltros));
      params.set('page', '0');
      params.set('size', '10');
      await cargarPagina(params.toString());
    });

    // BOTÓN LIMPIAR
    if (btnLimpiar) {
      btnLimpiar.addEventListener('click', async () => {
        formFiltros.reset();
        const categoriaSelect = document.getElementById('filtroCategoria');
        if (categoriaSelect) categoriaSelect.innerHTML = '<option value="">Todas las categorías</option>';
        filtroTipo.value = '';  // ✅ Reset tipo también
        await actualizarTabla(false);
      });
    }

    // LISTENER
    if (filtroTipo) {
      filtroTipo.addEventListener('change', async function () {
        await window.cargarCategoriasFiltroPorTipo();
      });
    }

    // CARGA INICIAL
    await window.cargarCategoriasFiltroPorTipo();

    return true;
  }

  // ===========================================
  // FALTABA ESTA FUNCIÓN (CRÍTICA)
  // ===========================================
  window.validarRangoFechasFiltro = function () {
    const desde = document.getElementById('filtroFechaDesde')?.value;
    const hasta = document.getElementById('filtroFechaHasta')?.value;

    if (desde && hasta && new Date(desde) > new Date(hasta)) {
      mostrarAlerta('La fecha "Desde" no puede ser posterior a "Hasta"', 'warning');
      return false;
    }
    return true;
  };

  // ===========================================
  // FILTROS CATEGORÍAS
  // ===========================================
  window.cargarCategoriasFiltroPorTipo = async function () {
    const tipo = document.getElementById('filtroTipo')?.value;
    const select = document.getElementById('filtroCategoria');

    if (!select) {
      console.error('#filtroCategoria no encontrado');
      return;
    }

    if (!tipo || (tipo !== 'INGRESO' && tipo !== 'GASTO')) {
      select.innerHTML = '<option value="">Todas las categorías</option>';
      return;
    }

    const endpoint = tipo === 'INGRESO' ? '/api/categorias/ingreso' : '/api/categorias/gasto';
    try {
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const categorias = await response.json();
      select.innerHTML = '<option value="">Todas las categorías</option>';

      categorias.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.id;
        option.textContent = cat.nombre;
        select.appendChild(option);
      });

    } catch (error) {
      console.error('Error categorías filtro:', error);
      mostrarAlerta('Error cargando categorías', 'warning');
    }
  };

  // ===========================================
  // INICIALIZACIÓN
  // ===========================================
  actualizarKPIs();
  setTimeout(async () => {
    await inicializarFiltrosCompletos();
    await actualizarTabla(true);
  }, 300);

});
