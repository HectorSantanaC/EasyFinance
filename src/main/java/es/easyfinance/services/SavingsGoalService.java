package es.easyfinance.services;

import java.util.List;

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
	
	public List<SavingsGoalModel> listarTodas() {
	    return savingsGoalRepository.findAll();
	}
	
	public SavingsGoalModel guardar(SavingsGoalModel savingsGoal) {
	    return savingsGoalRepository.save(savingsGoal);
	}
	
	public void borrar(Long id) {
		savingsGoalRepository.deleteById(id);
	}

}
