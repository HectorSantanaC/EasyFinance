document.addEventListener("DOMContentLoaded", function () {

  // FUNCIONES COMUNES
  function mostrarAlerta(mensaje, tipo = "success") {
    const icons = { success: "bi-check-circle-fill", danger: "bi-x-circle-fill", warning: "bi-exclamation-triangle-fill" };
    const toast = document.createElement("div");
    toast.className = `alert alert-${tipo} alert-dismissible fade show position-fixed shadow-lg`;
    toast.style.cssText = "top: 20px; right: 20px; z-index: 9999; min-width: 320px; max-width: 400px;";
    toast.innerHTML = `
      <i class="${icons[tipo] || 'bi-info-circle-fill'} me-2 fs-5"></i>
      <strong>${mensaje}</strong>
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(toast);
    new bootstrap.Alert(toast);
    setTimeout(() => toast.remove(), 4500);
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
  // FORM NUEVA META
  // ============================================
  const formNewGoal = document.getElementById("formNewGoal");
  if (formNewGoal) {
    formNewGoal.addEventListener("submit", async function(e) {
      e.preventDefault();
      
      const data = {
        nombre: document.getElementById("goalName").value,
        descripcion: document.getElementById("goalDescription").value || '',
        cantidadObjetivo: parseFloat(document.getElementById("goalAmount").value),
        fechaInicio: document.getElementById("goalStartDate").value,
        fechaObjetivo: document.getElementById("goalEndDate").value || null
      };
      
      try {
        const response = await fetch('/api/metas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        if (response.ok) {
          bootstrap.Modal.getInstance(document.getElementById("modalNewGoal")).hide();
          mostrarAlerta('¡Meta creada!', 'success');
          this.reset();
          await cargarMetas();
          await cargarKPIs();
        } else {
          const error = await response.text();
          mostrarAlerta('Error: ' + error, 'danger');
        }
      } catch (error) {
        mostrarAlerta('Error conexión', 'danger');
        console.error(error);
      }
    });
  }

  // ============================================
  // CARGAR METAS
  // ============================================
  async function cargarMetas() {
    try {
      const response = await fetch('/api/metas');
      const metas = await response.json();
      
      const tbody = document.getElementById("bodyMetas");
      if (metas.length === 0) {
        tbody.innerHTML = `
          <tr class="text-center">
            <td colspan="8" class="py-5 text-muted">
              <i class="bi bi-piggy-bank fs-1 d-block mb-2"></i>No hay metas
            </td>
          </tr>`;
        return;
      }
      
      tbody.innerHTML = metas.map(crearFilaMeta).join('');
      document.getElementById("contadorMetas").textContent = `${metas.length} metas`;
    } catch (error) {
      console.error('Metas:', error);
      mostrarAlerta('Error cargando metas', 'danger');
    }
  }

  // ============================================
  // CARGAR KPIs
  // ============================================
  async function cargarKPIs() {
    try {
      const response = await fetch('/api/metas/kpis');
      const kpis = await response.json();
      
      document.getElementById("totalMetasActivas").textContent = kpis.totalMetasActivas;
      document.getElementById("totalAhorrado").textContent = formatEuroJS(kpis.totalAhorrado);
      document.getElementById("objetivoTotal").textContent = formatEuroJS(kpis.objetivoTotal);
    } catch (error) {
      console.error('KPIs metas:', error);
    }
  }

  // ============================================
  // CREAR FILA META
  // ============================================
  function crearFilaMeta(meta) {

    return `
      <tr>
        <td class="fw-bold">${meta.nombre}</td>
        <td>${meta.descripcion || '-'}</td>
        <td>${formatEuroJS(meta.cantidadObjetivo)}</td>
        <td>${formatEuroJS(meta.cantidadActual)}</td>
        <td>${meta.fechaInicio || '-'}</td>
        <td>${meta.fechaObjetivo || '-'}</td>
        <td>
          <button class="btn btn-sm btn-secondary-custom me-1" onclick="editarMeta(${meta.id})">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-danger-custom" onclick="borrarMeta(${meta.id})">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>`;
  }

  // ============================================
  // BORRAR META
  // ============================================
  window.borrarMeta = async function(id) {
    if (confirm('¿Eliminar esta meta?')) {
      try {
        const response = await fetch(`/api/metas/${id}`, { method: 'DELETE' });
        if (response.ok) {
          mostrarAlerta('Meta eliminada', 'warning');
          await cargarMetas();
          await cargarKPIs();
        }
      } catch (error) {
        mostrarAlerta('Error borrando', 'danger');
      }
    }
  };

  // ============================================
  // INICIALIZAR
  // ============================================
  cargarMetas();
  cargarKPIs();
});
