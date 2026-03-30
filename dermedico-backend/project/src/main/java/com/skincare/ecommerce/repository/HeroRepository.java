package com.skincare.ecommerce.repository;

import com.skincare.ecommerce.entity.Hero;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HeroRepository extends JpaRepository<Hero, Long> {

}