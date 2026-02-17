package es.easyfinance.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import es.easyfinance.models.SavingsGoalModel;

public interface SavingsGoalRepository extends JpaRepository<SavingsGoalModel, Long> {
	
	// Metas ordenadas por fecha inicio DESC
	List<SavingsGoalModel> findByUsuarioIdIdOrderByFechaInicioDesc(Long usuarioId);
    
    // Metas activas (no completadas)
	List<SavingsGoalModel> findByUsuarioIdIdAndCompletadaFalseOrderByFechaInicioDesc(Long usuarioId);
    
    // Completadas
	List<SavingsGoalModel> findByUsuarioIdIdAndCompletadaTrueOrderByFechaInicioDesc(Long usuarioId);
    
}
