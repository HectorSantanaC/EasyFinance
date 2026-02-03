document.addEventListener('DOMContentLoaded', function() {

  // ============================================
  // MODAL DE NUEVA TRANSACCIÓN
  // ============================================

  // Establecer fecha actual por defecto
  const transactionDateInput = document.getElementById('transactionDate');
  if (transactionDateInput) {
    transactionDateInput.valueAsDate = new Date();
  }

  // Elementos del formulario
  const transactionType = document.getElementById('transactionType');
  const campoCategoria = document.getElementById('campoCategoria');
  const campoMeta = document.getElementById('campoMeta');
  const selectCategoria = document.getElementById('transactionCategory');
  const selectMeta = document.getElementById('transactionGoal');

  // Función para mostrar/ocultar campos según el tipo de transacción
  function toggleCamposSegunTipo() {
    const tipo = transactionType.value;

    if (tipo === 'AHORRO') {
      // Mostrar Meta y ocultar Categoría
      campoCategoria.style.display = 'none';
      campoMeta.style.display = 'block';
      
      // Ajustar validación HTML5
      selectMeta.required = true;
      selectCategoria.required = false;
      selectCategoria.value = '';
      
    } else if (tipo === 'INGRESO' || tipo === 'GASTO') {
      // Mostrar Categoría y ocultar Meta
      campoCategoria.style.display = 'block';
      campoMeta.style.display = 'none';
      
      // Ajustar validación HTML5
      selectCategoria.required = true;
      selectMeta.required = false;
      selectMeta.value = '';
      
    } else {
      // Sin selección
      campoCategoria.style.display = 'none';
      campoMeta.style.display = 'none';
      selectCategoria.required = false;
      selectMeta.required = false;
    }
  }

  // Escuchar cambios en el tipo de transacción
  if (transactionType) {
    transactionType.addEventListener('change', toggleCamposSegunTipo);
  }

  // Resetear formulario al cerrar el modal
  const modalElement = document.getElementById('modalNewTransaction');
  if (modalElement) {
    modalElement.addEventListener('hidden.bs.modal', function() {
      const form = document.getElementById('formNewTransaction');
      form.reset();
      transactionDateInput.valueAsDate = new Date();
      toggleCamposSegunTipo();
    });

    // Solucionar advertencia aria-hidden al cerrar modal
    modalElement.addEventListener('hide.bs.modal', function () {
      
      // Quitar el foco del botón de cerrar
      const btnClose = this.querySelector('.btn-close');
      if (btnClose && document.activeElement === btnClose) {
        btnClose.blur();
      }
      
      // Quitar foco de cualquier elemento enfocado dentro del modal
      if (this.contains(document.activeElement)) {
        document.activeElement.blur();
      }
    });
  }

});
