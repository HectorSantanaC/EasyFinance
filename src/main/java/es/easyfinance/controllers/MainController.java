package es.easyfinance.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MainController {
	
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
	public String dashboard() {
		return "dashboard";
	}
	
	@GetMapping(value = "/transactions")
	public String transactions() {
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
