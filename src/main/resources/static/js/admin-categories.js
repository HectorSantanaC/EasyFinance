document.addEventListener('DOMContentLoaded', function () {
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
    CARGAR TABLA CATEGORÍAS
  =========================================== */
  async function cargarCategorias() {
    const tbody = document.getElementById('bodyCategoriasGlobales');
    const totalCategoriasSpan = document.getElementById('contadorCategorias');

    try {
      const response = await fetch('/api/categorias/globales', {
        headers: { 'X-CSRF-TOKEN': document.querySelector('input[name="_csrf"]').value || '' },
        credentials: 'same-origin'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const categorias = await response.json();
      tbody.innerHTML = '';

      if (categorias.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-muted text-center py-4">No hay categorías globales</td></tr>';
        if (totalCategoriasSpan) totalCategoriasSpan.textContent = '0';
        return;
      }

      categorias.forEach(cat => {
        const badgeActiva = cat.activa ?
          '<span class="badge bg-success">Activa</span>' :
          '<span class="badge bg-secondary">Inactiva</span>';

        // DATOS FICTICIOS: usuarios y transacciones
        const usuariosUsando = Math.floor(Math.random() * 15) + 1;  // 1-15 usuarios
        const totalTransacciones = Math.floor(Math.random() * 250) + 5;  // 5-254 transacciones

        const fila = `
        <tr>
            <td>${cat.id || '-'}</td>
            <td>${cat.nombre || '-'}</td>
            <td>
                <span class="badge bg-${cat.tipo === 'INGRESO' ? 'success' : 'danger'}">${cat.tipo || '-'}</span>
            </td>
            <td class="text-center">
                <span>${usuariosUsando}</span>
            </td>
            <td class="text-center">
                <span>${totalTransacciones}</span>
            </td>
            <td class="text-center">${badgeActiva}</td>
            <td class="text-center">
                <button class="btn btn-sm btn-secondary-custom me-1"
                        data-id="${cat.id}" data-nombre="${cat.nombre || ''}" data-tipo="${cat.tipo || ''}">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger-custom" data-id="${cat.id}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `;
        tbody.insertAdjacentHTML('beforeend', fila);
      });

      if (totalCategoriasSpan) totalCategoriasSpan.textContent = `${categorias.length} categorías`;

    } catch (error) {
      console.error('Error:', error);
      tbody.innerHTML = '<tr><td colspan="7" class="text-danger text-center py-5">Error al cargar categorías</td></tr>';
      mostrarAlerta('Error cargando categorías', 'danger');
    }
  }

  /* ===========================================
    MODAL EDITAR - EVENTOS GLOBARES
  =========================================== */
  window.abrirModalEditar = function (data) {
    document.getElementById('editGlobalCategoryId').value = data.id || '';
    document.getElementById('editGlobalCategoryName').value = data.nombre || '';
    document.getElementById('editGlobalCategoryType').value = data.tipo || '';
    new bootstrap.Modal(document.getElementById('modalEditGlobalCategory')).show();
  };

  // Confirmar eliminar
  window.confirmarEliminar = async function (id) {
    if (!confirm('¿Eliminar esta categoría global?')) return;

    try {
      const response = await fetch(`/api/categorias/${id}`, {
        method: 'DELETE',
        headers: { 'X-CSRF-TOKEN': document.querySelector('input[name="_csrf"]').value || '' },
        credentials: 'same-origin'
      });

      if (!response.ok) throw new Error(await response.text());

      mostrarAlerta('Categoría eliminada correctamente', 'warning');
      cargarCategorias();
    } catch (error) {
      console.error('Error eliminar:', error);
      mostrarAlerta('Error al eliminar: ' + error.message, 'danger');
    }
  };

  /* ===========================================
    CREAR NUEVA CATEGORÍA
  =========================================== */
  const formNew = document.getElementById('formNewGlobalCategory');
  if (formNew) {
    formNew.addEventListener('submit', async function (e) {
      e.preventDefault();

      const nombre = document.getElementById('globalCategoryName').value.trim();
      const tipo = document.getElementById('globalCategoryType').value;

      if (!nombre || nombre.length < 3 || !tipo) {
        mostrarAlerta('Nombre (mín 3 chars) y tipo requeridos', 'warning');
        return;
      }

      try {
        const response = await fetch('/api/categorias', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('input[name="_csrf"]').value || ''
          },
          credentials: 'same-origin',
          body: JSON.stringify({
            nombre: nombre,
            tipo: tipo,
            esGlobal: true,
            activa: true
          })
        });

        if (!response.ok) {
          const error = await response.text();
          mostrarAlerta('Error: ' + error, 'danger');
          return;
        }

        bootstrap.Modal.getInstance(document.getElementById('modalNewGlobalCategory')).hide();
        formNew.reset();
        mostrarAlerta('Categoría creada', 'success');
        cargarCategorias();
      } catch (error) {
        mostrarAlerta('Error conexión', 'danger');
      }
    });
  }

  /* ===========================================
    EDITAR CATEGORÍA
  =========================================== */
  const btnGuardarEdit = document.getElementById('btnGuardarEditGlobalCategory');
  if (btnGuardarEdit) {
    btnGuardarEdit.addEventListener('click', async function () {
      const id = document.getElementById('editGlobalCategoryId').value;
      if (!id || parseInt(id) <= 0) {
        mostrarAlerta('ID inválido', 'danger');
        return;
      }

      const formData = {
        id: parseInt(id),
        nombre: document.getElementById('editGlobalCategoryName').value.trim(),
        tipo: document.getElementById('editGlobalCategoryType').value,
        esGlobal: true,
        activa: true
      };

      if (!formData.nombre || formData.nombre.length < 3 || !formData.tipo) {
        mostrarAlerta('Nombre y tipo requeridos', 'warning');
        return;
      }

      try {
        const response = await fetch(`/api/categorias/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('input[name="_csrf"]').value || ''
          },
          credentials: 'same-origin',
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          bootstrap.Modal.getInstance(document.getElementById('modalEditGlobalCategory')).hide();
          mostrarAlerta('Categoría actualizada', 'success');
          cargarCategorias();
        } else {
          const error = await response.text();
          mostrarAlerta('Error: ' + error, 'danger');
        }
      } catch (error) {
        mostrarAlerta('Error conexión', 'danger');
      }
    });
  }

  /* ===========================================
    EVENTOS BOTONES TABLA
  =========================================== */
  document.getElementById('bodyCategoriasGlobales').addEventListener('click', function (e) {

    // Botón EDITAR
    if (e.target.closest('.edit-btn')) {
      e.preventDefault();
      const btn = e.target.closest('.edit-btn');
      if (!btn.dataset.id || parseInt(btn.dataset.id) <= 0) {
        mostrarAlerta('ID inválido', 'danger');
        return;
      }
      abrirModalEditar({
        id: btn.dataset.id,
        nombre: btn.dataset.nombre,
        tipo: btn.dataset.tipo
      });
    }

    // Botón ELIMINAR
    if (e.target.closest('.delete-btn')) {
      e.preventDefault();
      const btn = e.target.closest('.delete-btn');
      if (!btn.dataset.id || parseInt(btn.dataset.id) <= 0) {
        mostrarAlerta('ID inválido', 'danger');
        return;
      }
      confirmarEliminar(btn.dataset.id);
    }
  });

  // Carga inicial
  cargarCategorias();
});
