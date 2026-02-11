package es.easyfinance.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import es.easyfinance.models.SavingsGoal;
import es.easyfinance.repositories.SavingsGoalRepository;

@Service
public class SavingsGoalService {
	
	@Autowired
	private SavingsGoalRepository savingsGoalRepository;
		
	public SavingsGoal buscarPorId(Long id) {
		return savingsGoalRepository.findById(id).orElse(null);
	}
	
	public List<SavingsGoal> listarTodas() {
	    return savingsGoalRepository.findAll();
	}
	
	public SavingsGoal guardar(SavingsGoal savingsGoal) {
	    return savingsGoalRepository.save(savingsGoal);
	}
	
	public void borrar(Long id) {
		savingsGoalRepository.deleteById(id);
	}

}
