package es.easyfinance.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import es.easyfinance.models.UserModel;
import es.easyfinance.repositories.UserRepository;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
	
	@Autowired
	private UserRepository userRepository;


    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UserModel userModel = userRepository.findByEmail(email);
                
        if (userModel == null) {
        	throw new UsernameNotFoundException("Usuario no encontrado: " + email);
        }
        
        return User.withUsername(userModel.getEmail())
        		.password(userModel.getContrasena())
        		.authorities(userModel.getRolId().getNombre())
        		.disabled(!userModel.isActivo())
        		.build();
    }
    
    public UserModel findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
