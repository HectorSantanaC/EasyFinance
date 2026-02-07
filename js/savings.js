document.addEventListener("DOMContentLoaded", function () {
  
  // =======================================================
  // MODAL NUEVA META - Establecer fecha inicio por defecto
  // =======================================================
  
  const modalNewGoal = document.getElementById("modalNewGoal");

  modalNewGoal.addEventListener("show.bs.modal", function () {
    // Fecha de inicio: hoy
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("goalStartDate").value = today;

    // Limpiar otros campos del formulario
    document.getElementById("formNewGoal").reset();

    // Re-establecer las fechas después del reset
    document.getElementById("goalStartDate").value = today;
  });
});
