package es.easyfinance.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import es.easyfinance.models.TransactionModel;
import es.easyfinance.models.UserModel;
import es.easyfinance.services.TransactionService;
import es.easyfinance.services.UserDetailsServiceImpl;

@Controller
public class MainController {
	
	@Autowired
	private TransactionService transactionService;
	
	@Autowired
    private UserDetailsServiceImpl userDetailsService;

    private UserModel usuarioActual() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        String email = auth.getName();
        return userDetailsService.findByEmail(email);
    }
	
	@GetMapping(value = {"/", "/index"})
	public String index() {
		return "index";
	}
	
	@GetMapping(value = "/register")
	public String register() {
		return "register";
	}
	
	@GetMapping(value = "/login")
	public String login() {
		return "login";
	}
	
	@GetMapping(value = "/dashboard")
	public String dashboard(Model model) {
		
		UserModel usuario = usuarioActual();
	    if (usuario == null) {
	        return "redirect:/login";
	    }
	    
	    Pageable pageable = PageRequest.of(0, 5, Sort.by("fecha").descending());
	    Page<TransactionModel> ultimas = transactionService.findAllByUsuario(usuario, pageable);
	    
	    model.addAttribute("ultimasTransacciones", ultimas.getContent());
	    model.addAttribute("totalTransacciones", ultimas.getTotalElements());
	    
		return "dashboard";
	}
	
	@GetMapping(value = "/transactions")
	public String transactions(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size, Model model) {
		
		UserModel usuario = usuarioActual();
        if (usuario == null) {
            model.addAttribute("transacciones", java.util.Collections.emptyList());
            model.addAttribute("currentPage", 0);
            model.addAttribute("totalPages", 0);
            model.addAttribute("totalItems", 0L);
            return "transactions";
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("fecha").descending());
        Page<TransactionModel> transaccionesPage = transactionService.findAllByUsuario(usuario, pageable);
		
        model.addAttribute("transacciones", transaccionesPage.getContent());
        model.addAttribute("currentPage", transaccionesPage.getNumber());
        model.addAttribute("totalPages", transaccionesPage.getTotalPages());
        model.addAttribute("totalItems", transaccionesPage.getTotalElements());
		
		return "transactions";
	}
	
	@GetMapping(value = "/savings")
	public String savings() {
		return "savings";
	}
	
	@GetMapping(value = "/categories")
	public String categories() {
		return "categories";
	}
	
	@GetMapping(value = "/admin-users")
	public String adminUsers() {
		return "admin-users";
	}
	
	@GetMapping(value = "/admin-categories")
	public String adminCategories() {
		return "admin-categories";
	}

}
