document.addEventListener("DOMContentLoaded", function () {
  window.editarTransaccion = editarTransaccion;

  // INSERTAR TRANSACCIONES
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
        alert("¡Transacción guardada!");

        // Recargar página
        location.reload();
      } else {
        alert("Error al guardar");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión");
    }
  });

  // EDITAR TRANSACCIONES
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

        // CARGAR CATEGORÍAS
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

  // GUARDAR EDITAR
  const btnGuardarEdit = document.getElementById("btnGuardarEdit");
  if (btnGuardarEdit) {
    btnGuardarEdit.addEventListener("click", function () {
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

      fetch(`/api/transacciones/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((result) => {
          bootstrap.Modal.getInstance(
            document.getElementById("modalEditar"),
          ).hide();
          mostrarAlerta("¡Transacción actualizada!", "success");
          setTimeout(() => location.reload(), 500);
        })
        .catch((error) => {
          mostrarAlerta("Error actualizando", "danger");
          console.error(error);
        })
        .finally(() => {
          spinner.classList.add("d-none");
          btn.disabled = false;
        });
    });
  }

  // TOAST HELPER
  function mostrarAlerta(mensaje, tipo = 'success') {
    const toast = document.createElement("div");
    toast.className = `alert alert-${tipo} alert-dismissible fade show position-fixed`;
    toast.style.cssText = "top: 20px; right: 20px; z-index: 9999; min-width: 300px;";
    toast.innerHTML = `
      <i class="bi bi-check-circle-fill me-2"></i>${mensaje}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(toast);
    
    // Auto dismiss
    setTimeout(() => {
      const bsAlert = new bootstrap.Alert(toast);
      bsAlert.close();
    }, 4000);
  }

  // CARGAR CATEGORÍAS
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
});
