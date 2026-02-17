package es.easyfinance.services;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import es.easyfinance.models.SavingsGoalModel;
import es.easyfinance.repositories.SavingsGoalRepository;

@Service
public class SavingsGoalService {
	
	@Autowired
	private SavingsGoalRepository savingsGoalRepository;
		
	public SavingsGoalModel buscarPorId(Long id) {
		return savingsGoalRepository.findById(id).orElse(null);
	}
	
	public List<SavingsGoalModel> listarTodas(Long usuarioId) {
        return savingsGoalRepository.findByUsuarioIdIdOrderByFechaInicioDesc(usuarioId);
    }
	
	public SavingsGoalModel guardar(SavingsGoalModel savingsGoal) {
		
		if (savingsGoal.getCantidadObjetivo() != null && 
				savingsGoal.getCantidadActual() != null &&
				savingsGoal.getCantidadActual().compareTo(savingsGoal.getCantidadObjetivo()) >= 0) {
			
			savingsGoal.setCompletada(true);
			
			if (savingsGoal.getFechaCompletada() == null) {
				savingsGoal.setFechaCompletada(LocalDateTime.now());
			}
		}
		
	    return savingsGoalRepository.save(savingsGoal);
	}
	
	public void borrar(Long id, Long usuarioId) {
		savingsGoalRepository.deleteById(id);
	}
	
	public Map<String, Object> calcularKPIs(Long usuarioId) {
        List<SavingsGoalModel> metas = listarTodas(usuarioId);
        
        BigDecimal totalAhorrado = metas.stream()
            .map(SavingsGoalModel::getCantidadActual)
            .filter(Objects::nonNull)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
            
        BigDecimal objetivoTotal = metas.stream()
            .map(SavingsGoalModel::getCantidadObjetivo)
            .filter(Objects::nonNull)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
            
        long activas = metas.stream()
            .filter(m -> !m.isCompletada())
            .count();

        return Map.of(
            "totalMetasActivas", activas,
            "totalAhorrado", totalAhorrado.doubleValue(),  // Frontend espera double
            "objetivoTotal", objetivoTotal.doubleValue()
        );
    }

}
