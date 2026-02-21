package es.easyfinance.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "usuarios_roles")
public class UserRolModel {

	    @Id 
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long id;
	    
	    @ManyToOne @JoinColumn(name = "usuario_id")
	    private UserModel usuario;
	    
	    @ManyToOne @JoinColumn(name = "rol_id")
	    private RolModel rol;

		public UserRolModel() {
			super();
			// TODO Auto-generated constructor stub
		}

		public Long getId() {
			return id;
		}

		public void setId(Long id) {
			this.id = id;
		}

		public UserModel getUsuario() {
			return usuario;
		}

		public void setUsuario(UserModel usuario) {
			this.usuario = usuario;
		}

		public RolModel getRol() {
			return rol;
		}

		public void setRol(RolModel rol) {
			this.rol = rol;
		}
	    
}
