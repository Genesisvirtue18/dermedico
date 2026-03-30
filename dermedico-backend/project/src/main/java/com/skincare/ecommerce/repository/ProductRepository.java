package com.skincare.ecommerce.repository;

import com.skincare.ecommerce.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Page<Product> findByActiveTrue(Pageable pageable);
    Optional<Product> findBySlug(String slug);

    @Query("SELECT p FROM Product p WHERE p.active = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Product> searchProducts(@Param("keyword") String keyword, Pageable pageable);

    @Query("""
SELECT DISTINCT p FROM Product p
LEFT JOIN p.concerns c
WHERE (:concernIds IS NULL OR c.id IN :concernIds)
AND (:brandId IS NULL OR p.brand.id = :brandId)
AND (:categoryId IS NULL OR p.category.id = :categoryId)
AND (:minPrice IS NULL OR p.price >= :minPrice)
AND (:maxPrice IS NULL OR p.price <= :maxPrice)
AND p.active = true
""")
    Page<Product> filterProducts(
            @Param("concernIds") List<Long> concernIds,
            @Param("brandId") Long brandId,
            @Param("categoryId") Long categoryId,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            Pageable pageable
    );



    Page<Product> findByTypeAndActiveTrue(Product.ProductType type, Pageable pageable);

    List<Product> findByCategoryIdAndActiveTrue(Long categoryId);

    // Optional: pagination version
    Page<Product> findByCategoryIdAndActiveTrue(Long categoryId, Pageable pageable);

    Page<Product> findByTopSellerTrueAndActiveTrueOrderByPriorityRankAsc(Pageable pageable);

    Page<Product> findByBrandIdAndActiveTrue(Long brandId, Pageable pageable);
    @Query("""
SELECT p FROM Product p
JOIN p.concerns c
WHERE c.id = :concernId AND p.active = true
""")
    Page<Product> findByConcernId(@Param("concernId") Long concernId, Pageable pageable);


    Page<Product> findByTrendingTrueAndActiveTrue(Pageable pageable);

    Page<Product> findByTopSellerTrueAndActiveTrue(Pageable pageable);
}
