package es.easyfinance.controllers;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import es.easyfinance.models.CategoryModel;
import es.easyfinance.models.TransactionModel;
import es.easyfinance.models.TransactionTypeModel;
import es.easyfinance.models.UserModel;
import es.easyfinance.services.TransactionService;
import es.easyfinance.services.UserDetailsServiceImpl;

@RestController
@RequestMapping("/api/transacciones")
public class TransactionController {
	
	@Autowired
	private TransactionService transactionService;
	
	@Autowired
	private UserDetailsServiceImpl userDetailsService;
	
	private UserModel usuarioActual() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userDetailsService.findByEmail(email);
    }

    @GetMapping
    public String listar(@RequestParam(defaultValue = "0") int page,
    		@RequestParam(defaultValue = "10") int size, Model model) {
    	
    	UserModel usuario = usuarioActual();
        Pageable pageable = PageRequest.of(page, size, Sort.by("fecha").descending());
        
        Page<TransactionModel> transaccionesPage = transactionService.findAllByUsuario(usuario, pageable);
        
        model.addAttribute("transacciones", transaccionesPage.getContent());
        model.addAttribute("currentPage", transaccionesPage.getNumber());
        model.addAttribute("totalPages", transaccionesPage.getTotalPages());
        model.addAttribute("totalItems", transaccionesPage.getTotalElements());
        
        return "transactions";
    }
    
    @GetMapping("/{id}")
    public TransactionModel buscarPorId(@PathVariable Long id) {
    	return transactionService.buscarPorId(id);
    }
    
    @PostMapping
    public ResponseEntity<TransactionModel> crear(@RequestParam Map<String, String> data) {
    	
        TransactionModel transaction = new TransactionModel();
        transaction.setDescripcion(data.get("descripcion"));
        transaction.setCantidad(new BigDecimal(data.get("importe")));
        transaction.setTipo(TransactionTypeModel.valueOf(data.get("tipo")));
        transaction.setFecha(LocalDate.parse(data.get("fecha")));
        transaction.setUsuarioId(usuarioActual());
        
        CategoryModel categoria = new CategoryModel();
        String idCategory = data.get("idCategoria");
        
        categoria.setId(Long.parseLong(idCategory));
        transaction.setCategoriaId(categoria);
        
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
