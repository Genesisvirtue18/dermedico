package com.skincare.ecommerce.security;

import com.skincare.ecommerce.Exception.UserNotFoundException;
import com.skincare.ecommerce.Exception.UserSuspendedException;
import com.skincare.ecommerce.entity.User;
import com.skincare.ecommerce.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

   /* @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User does not exist. Please sign up to continue."));

        if (!user.isActive()) {
            throw new UserSuspendedException("Your account has been suspended.");
        }

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                "",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }*/

    @Override
    public UserDetails loadUserByUsername(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User does not exist. Please sign up to continue."));

        if (!user.isActive()) {
            throw new UserSuspendedException("Your account has been suspended.");
        }

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                "",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }

}
