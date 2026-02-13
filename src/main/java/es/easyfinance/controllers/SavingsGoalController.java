package es.easyfinance.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import es.easyfinance.models.SavingsGoalModel;
import es.easyfinance.services.SavingsGoalService;

@RestController
@RequestMapping("/api/metas")
public class SavingsGoalController {
	
	@Autowired
	private SavingsGoalService savingsGoalService;

    @GetMapping
    public List<SavingsGoalModel> listarTodas() {
    	return savingsGoalService.listarTodas();
    }
    
    @GetMapping("/{id}")
    public SavingsGoalModel buscarPorId(@PathVariable Long id) {
    	return savingsGoalService.buscarPorId(id);
    }
    
    @PostMapping
    public ResponseEntity<SavingsGoalModel> crear(@RequestBody SavingsGoalModel savingsGoal) {
    	return ResponseEntity.ok(savingsGoalService.guardar(savingsGoal));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<SavingsGoalModel> actualizar(@PathVariable Long id, @RequestBody SavingsGoalModel savingsGoal) {
    	savingsGoal.setId(id);
    	return ResponseEntity.ok(savingsGoalService.guardar(savingsGoal));
    }
    
    @DeleteMapping("/{id}") 
    public ResponseEntity<Void> borrar(@PathVariable Long id){
    	savingsGoalService.borrar(id);
    	return ResponseEntity.ok().build();
    }

}
