package com.skincare.ecommerce.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

   /* @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/auth/verify-otp").permitAll()
                .requestMatchers("/api/products/search", "/api/products/{id}", "/api/products/list").permitAll()
                    .requestMatchers("/api/pincode/**").permitAll()
                    .requestMatchers("/api/order/track").permitAll()
                    .requestMatchers("/uploads/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }*/

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .formLogin(form -> form.disable())       // ✅ Disable default form login filter
                .httpBasic(basic -> basic.disable())     // ✅ Disable basic Auth
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()   // ✅ allow login/register/verify
                       // .requestMatchers("/api/products/search", "/api/products/{id}", "/api/products/list,/api/products/single","/api/products/upload-excel","api/products/by-category/{categoryId}").permitAll()
                        .requestMatchers("/api/products/**").permitAll()
                        .requestMatchers("/api/pincode/**").permitAll()
                        .requestMatchers("/api/order/track").permitAll()
                        .requestMatchers("/uploads/**").permitAll()
                        .requestMatchers("/api/contact/**").permitAll()
                        .requestMatchers("/api/blogs/**").permitAll()
                        .requestMatchers("/api/blog-tags/**").permitAll()
                        .requestMatchers("/api/blog-faq/**").permitAll()
                        .requestMatchers("/api/hero/**").permitAll()
                        .requestMatchers("/api/banner/**").permitAll()
                        .requestMatchers("/api/admin/blogs/**").hasRole("ADMIN")
                        .requestMatchers("/api/admin/hero/**").hasRole("ADMIN")
                        .requestMatchers("/api/admin/blog-faq/**").hasRole("ADMIN")
                        .requestMatchers("/api/admin/blog-tags/**").hasRole("ADMIN")
                        .requestMatchers("/api/admin/contact/**").hasRole("ADMIN")
                        .requestMatchers("/api/categories/**").hasRole("ADMIN")
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/admin/brands/**").hasRole("ADMIN")
                        .requestMatchers("/api/admin/concerns/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }


   /* @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }*/

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

      // configuration.setAllowedOrigins(List.of("http://localhost:5173"));
       configuration.setAllowedOrigins(List.of("https://dermedicostore.in"));


        configuration.setAllowCredentials(true); // ✅ needed to send cookies

        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS","PATCH"));
        configuration.setAllowedHeaders(List.of("Content-Type", "Authorization"));
        configuration.setExposedHeaders(List.of("Set-Cookie")); // ✅ important to store cookie

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }




    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
