document.addEventListener('DOMContentLoaded', function() {

  // ============================================
  // FILTROS
  // ============================================
  
  const formFiltros = document.getElementById('formFiltros');
  const btnLimpiarFiltros = document.getElementById('btnLimpiarFiltros');

  if (formFiltros) {
    formFiltros.addEventListener('submit', function(e) {
      e.preventDefault();
    });
  }

  if (btnLimpiarFiltros) {
    btnLimpiarFiltros.addEventListener('click', function() {
      formFiltros.reset();
    });
  }

});
