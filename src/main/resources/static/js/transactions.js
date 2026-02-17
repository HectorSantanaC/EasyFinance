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
        categoriaDiv.style.display = 'none';
        metaDiv.style.display = 'block';

      } else if (tipo === 'INGRESO' || tipo === 'GASTO') {
        categoriaDiv.style.display = 'block';
        metaDiv.style.display = 'none';
        cargarCategoriasPorTipo(tipo, "transactionCategory");

      } else {
        categoriaDiv.style.display = 'none';
        metaDiv.style.display = 'none';
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
    INSERTAR TRANSACCIONES
  =========================================== */
  const form = document.getElementById("formNewTransaction");
  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      // Validación extra
      const tipo = document.getElementById("transactionType").value;
      if (tipo === 'AHORRO' && !document.getElementById("transactionGoal").value) {
        mostrarAlerta("Selecciona una meta de ahorro", "warning");
        return;
      }
      
      if ((tipo === 'INGRESO' || tipo === 'GASTO') && !document.getElementById("transactionCategory").value) {
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
    EDITAR TRANSACCIONES
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

      // Cargar categorías
      if (data.tipo === 'INGRESO' || data.tipo === 'GASTO') {
        await cargarCategoriasPorTipo(data.tipo, "editCategoria");

        setTimeout(() => {
          if (data.categoriaId?.id) {
            const select = document.getElementById("editCategoria");
            if (select) select.value = data.categoriaId.id;
          }
        }, 200);
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

      const data = {
        id: document.getElementById("editId").value,
        descripcion: document.getElementById("editDescripcion").value,
        cantidad: parseFloat(document.getElementById("editImporte").value),
        tipo: document.getElementById("editTipo").value,
        fecha: document.getElementById("editFecha").value,
        categoriaId: {
          id: parseInt(document.getElementById("editCategoria").value) || null,
        },
      };

      try {
        const response = await fetch(`/api/transacciones/${data.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          const modalInstance = bootstrap.Modal.getInstance(
            document.getElementById("modalEditar"),
          );
          modalInstance.hide();
          mostrarAlerta("¡Transacción actualizada!", "success");

          await actualizarTabla();
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
   =========================================== */
  window.borrarTransaccion = async function (id) {
    if (!confirm(`¿Eliminar transacción?\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/transacciones/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        mostrarAlerta(`¡Transacción eliminada!`, "warning");

        // Actualizar solo la tabla
        await actualizarTabla();
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

  /* ===========================================
    ACTUALIZAR TABLA SIN RECARGAR
   =========================================== */
  async function actualizarTabla() {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get("page") || 0;

    const response = await fetch(`/api/transacciones?page=${page}&size=10`);
    const data = await response.json();

    const tbody = document.getElementById("bodyTransacciones");
    tbody.innerHTML = "";

    data.content.forEach((transaccion) => {
      tbody.appendChild(crearFilaTransaccion(transaccion));
    });
  }

  /* ===========================================
    CREAR FILA TABLA HTML
   =========================================== */
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
    <td>${transaccion.descripcion || "Sin descripción"}</td>
    <td>${transaccion.categoriaId?.nombre || "Sin categoría"}</td>
    <td>
      <span class="badge ${transaccion.tipo === "INGRESO" ? "bg-success" : "bg-danger"
      }">
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

});
