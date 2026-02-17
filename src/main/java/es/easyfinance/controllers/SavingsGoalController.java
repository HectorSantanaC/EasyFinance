package es.easyfinance.controllers;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import es.easyfinance.models.SavingsGoalModel;
import es.easyfinance.models.UserModel;
import es.easyfinance.repositories.SavingsGoalRepository;
import es.easyfinance.services.SavingsGoalService;
import es.easyfinance.services.UserDetailsServiceImpl;

@RestController
@RequestMapping("/api/metas")
public class SavingsGoalController {
	
	@Autowired
	private SavingsGoalService savingsGoalService;
	
	@Autowired
    private UserDetailsServiceImpl userDetailsService;
	
	@Autowired
	private SavingsGoalRepository savingsGoalRepository;
	
	private UserModel usuarioActual() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        String email = auth.getName();
        return userDetailsService.findByEmail(email);
    }

	@GetMapping
    public ResponseEntity<List<SavingsGoalModel>> listarTodas() {
		UserModel usuario = usuarioActual();
        return ResponseEntity.ok(savingsGoalService.listarTodas(usuario.getId()));
    }
    
    @GetMapping("/{id}")
    public SavingsGoalModel buscarPorId(@PathVariable Long id) {
    	return savingsGoalService.buscarPorId(id);
    }
    
    @PostMapping
    public ResponseEntity<SavingsGoalModel> crear(@RequestBody SavingsGoalModel savingsGoal) {
    	
    	UserModel usuario = usuarioActual();
        if (usuario == null) return ResponseEntity.badRequest().build();
        
        savingsGoal.setUsuarioId(usuario);  // ✅ Auto-asignar
        savingsGoal.setCreadoPor(usuario.getId());
        savingsGoal.setFechaCreacion(LocalDateTime.now());
        
    	return ResponseEntity.ok(savingsGoalService.guardar(savingsGoal));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<SavingsGoalModel> actualizar(@PathVariable Long id, @RequestBody SavingsGoalModel savingsGoal) {
    	
    	 UserModel usuario = usuarioActual();
         if (usuario == null) return ResponseEntity.badRequest().build();
         
         savingsGoal.setId(id);
         savingsGoal.setModificadoPor(usuario.getId());
         savingsGoal.setFechaModificacion(LocalDateTime.now());
         
    	return ResponseEntity.ok(savingsGoalService.guardar(savingsGoal));
    }
    
    @DeleteMapping("/{id}") 
    public ResponseEntity<Void> borrar(@PathVariable Long id){
    	
    	UserModel usuario = usuarioActual();
        if (usuario == null) return ResponseEntity.badRequest().build();
        
        savingsGoalService.borrar(id, usuario.getId());  // ✅ Pasar usuarioId
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/kpis")
    public ResponseEntity<Map<String, Object>> kpis(Authentication auth) {
    	UserModel usuario = usuarioActual();
        return ResponseEntity.ok(savingsGoalService.calcularKPIs(usuario.getId()));
    }
    
    @GetMapping("/test-repo")
    public ResponseEntity<String> testRepo() {
        try {
            Long usuarioId = 1L;  // Tu usuario ID
            List<SavingsGoalModel> metas = savingsGoalRepository.findByUsuarioIdIdOrderByFechaInicioDesc(usuarioId);
            return ResponseEntity.ok("OK: " + metas.size() + " metas");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("ERROR: " + e.getMessage());
        }
    }

}
