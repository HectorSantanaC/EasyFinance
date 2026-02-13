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

import es.easyfinance.models.TransactionModel;
import es.easyfinance.services.TransactionService;

@RestController
@RequestMapping("/api/transacciones")
public class TransactionController {
	
	@Autowired
	private TransactionService transactionService;

    @GetMapping
    public List<TransactionModel> listarTodas() {
    	return transactionService.listarTodas();
    }
    
    @GetMapping("/{id}")
    public TransactionModel buscarPorId(@PathVariable Long id) {
    	return transactionService.buscarPorId(id);
    }
    
    @PostMapping
    public ResponseEntity<TransactionModel> crear(@RequestBody TransactionModel transaction) {
    	return ResponseEntity.ok(transactionService.guardar(transaction));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<TransactionModel> actualizar(@PathVariable Long id, @RequestBody TransactionModel transaction) {
    	transaction.setId(id);
    	return ResponseEntity.ok(transactionService.guardar(transaction));
    }
    
    @DeleteMapping("/{id}") 
    public ResponseEntity<Void> borrar(@PathVariable Long id){
    	transactionService.borrar(id);
    	return ResponseEntity.ok().build();
    }

}
