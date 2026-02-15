document.addEventListener("DOMContentLoaded", function () {
  window.editarTransaccion = editarTransaccion;

  /* ===========================================
    INSERTAR TRANSACCIONES
   =========================================== */
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
        await actualizarTabla();
      } else {
        mostrarAlerta("Error al guardar", "danger");
      }
    } catch (error) {
      console.error("Error:", error);
      mostrarAlerta("Error de conexión", "danger");
    }
  });

  /* ===========================================
    EDITAR TRANSACCIONES
   =========================================== */
  let transaccionEditando = null;

  function editarTransaccion(id) {
    fetch(`/api/transacciones/${id}`)
      .then((response) => response.json())
      .then((data) => {
        transaccionEditando = data;
        document.getElementById("editId").value = data.id;
        document.getElementById("editDescripcion").value = data.descripcion;
        document.getElementById("editImporte").value = data.cantidad;
        document.getElementById("editTipo").value = data.tipo;
        document.getElementById("editFecha").value = data.fecha
          ? data.fecha.split("T")[0]
          : "";

        // Cargar categorías
        fetch("/api/categorias")
          .then((res) => res.json())
          .then((categorias) => {
            const select = document.getElementById("editCategoria");
            select.innerHTML = '<option value="">Sin categoría</option>';
            categorias.forEach((cat) => {
              const option = document.createElement("option");
              option.value = cat.id;
              option.textContent = cat.nombre;
              select.appendChild(option);
            });
            if (data.categoriaId?.id) select.value = data.categoriaId.id;
          });

        new bootstrap.Modal(document.getElementById("modalEditar")).show();
      })
      .catch((error) => {
        mostrarAlerta("Error cargando transacción", "danger");
        console.error(error);
      });
  }

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

        // Actualiza solo la tabla
        await actualizarTabla();
      } else {
        mostrarAlerta("Error al eliminar", "danger");
      }
    } catch (error) {
      console.error("Borrar error:", error);
      mostrarAlerta("Error conexión", "danger");
    }
  };

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
    CARGAR CATEGORÍAS - NUEVA TRANSACCIÓN
   =========================================== */
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
    <td>${new Date(transaccion.fecha).toLocaleDateString("es-ES")}</td>
    <td>${transaccion.descripcion || "Sin descripción"}</td>
    <td>${transaccion.categoriaId?.nombre || "Sin categoría"}</td>
    <td>
      <span class="badge ${
        transaccion.tipo === "INGRESO" ? "bg-success" : "bg-danger"
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
});
