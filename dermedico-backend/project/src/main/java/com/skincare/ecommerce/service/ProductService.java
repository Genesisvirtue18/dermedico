package com.skincare.ecommerce.service;

import com.skincare.ecommerce.Helper.ProductExcelHelper;
import com.skincare.ecommerce.entity.Brand;
import com.skincare.ecommerce.entity.Category;
import com.skincare.ecommerce.entity.Concern;
import com.skincare.ecommerce.entity.Product;
import com.skincare.ecommerce.repository.BrandRepository;
import com.skincare.ecommerce.repository.CategoryRepository;
import com.skincare.ecommerce.repository.ConcernRepository;
import com.skincare.ecommerce.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductExcelHelper excelHelper;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private ConcernRepository concernRepository;


    public Product createProduct(
            Product product,
            Long categoryId,
            Long brandId,
            Set<Long> concernIds,
            boolean trending,
            boolean topSeller
    ) {

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Brand brand = brandRepository.findById(brandId)
                .orElseThrow(() -> new RuntimeException("Brand not found"));

        Set<Concern> concerns = new HashSet<>(concernRepository.findAllById(concernIds));

        product.setCategory(category);
        product.setBrand(brand);
        product.setConcerns(concerns);
        product.setTrending(trending);
        product.setTopSeller(topSeller);
        product.setSlug(
                generateSlug(product.getName())
        );

        return productRepository.save(product);
    }


    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public Page<Product> getAllActiveProducts(Pageable pageable) {
        return productRepository.findByActiveTrue(pageable);
    }

    public Page<Product> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable);
    }

    public Page<Product> searchProducts(String keyword, Pageable pageable) {
        return productRepository.searchProducts(keyword, pageable);
    }

    public Page<Product> filterProducts(
            List<Long> concernIds,
            Long brandId,
            Long categoryId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Pageable pageable
    ) {
        return productRepository.filterProducts(
                concernIds, brandId, categoryId, minPrice, maxPrice, pageable
        );
    }


   /* public Product updateProduct(Long id, Product productDetails) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setName(productDetails.getName());
        product.setDescription(productDetails.getDescription());
        product.setPrice(productDetails.getPrice());
        product.setSize(productDetails.getSize());
        product.setStockQuantity(productDetails.getStockQuantity());
        product.setMainImage(productDetails.getMainImage());
        product.setThumbnailImages(productDetails.getThumbnailImages());
        product.setBannerImages(productDetails.getBannerImages());
        product.setType(productDetails.getType());
        product.setSpecifications(productDetails.getSpecifications());
        product.setActive(productDetails.isActive());

        return productRepository.save(product);
    }*/


    public Product save(Product product) {
        return productRepository.save(product);
    }


    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setActive(false);
        productRepository.save(product);
    }

    public void updateStock(Long productId, int quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setStockQuantity(product.getStockQuantity() + quantity);
        productRepository.save(product);
    }

    public Page<Product> getAllSingleProducts(Pageable pageable) {
        return productRepository.findByTypeAndActiveTrue(Product.ProductType.SINGLE, pageable);
    }

    public void importExcel(MultipartFile file) {
        try {
            List<Product> products = excelHelper.parseExcel(file.getInputStream());
            productRepository.saveAll(products);
        } catch (Exception e) {
            throw new RuntimeException("Excel import failed", e);
        }
    }

    //GET PRODUCT BY CATEGORY ID

    public List<Product> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryIdAndActiveTrue(categoryId);
    }

    // Optional pagination version
    public Page<Product> getProductsByCategory(
            Long categoryId,
            Pageable pageable
    ) {
        return productRepository.findByCategoryIdAndActiveTrue(categoryId, pageable);
    }

    public Page<Product> getTrendingProducts(Pageable pageable) {
        return productRepository.findByTrendingTrueAndActiveTrue(pageable);
    }

    public Page<Product> getTopSellerProducts(Pageable pageable) {
        return productRepository.findByTopSellerTrueAndActiveTrue(pageable);
    }

    public Page<Product> getProductsByBrand(Long brandId, Pageable pageable) {
        return productRepository.findByBrandIdAndActiveTrue(brandId, pageable);
    }

    public Page<Product> getProductsByConcern(Long concernId, Pageable pageable) {
        return productRepository.findByConcernId(concernId, pageable);
    }


    public void attachCategory(Product product, Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        product.setCategory(category);
    }

    public void attachBrand(Product product, Long brandId) {
        Brand brand = brandRepository.findById(brandId)
                .orElseThrow(() -> new RuntimeException("Brand not found"));
        product.setBrand(brand);
    }

    public void attachConcerns(Product product, List<Long> concernIds) {
        Set<Concern> concerns = new HashSet<>(concernRepository.findAllById(concernIds));
        product.setConcerns(concerns);
    }


    private String generateSlug(String name){

        return name.toLowerCase()
                .replaceAll("[^a-z0-9 ]","")
                .replaceAll("\\s+","-");

    }

    public Product getProductBySlug(String slug){

        return productRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Product not found"));

    }

    public void generateSlugsForExistingProducts(){

        List<Product> products = productRepository.findAll();

        for(Product product : products){

            if(product.getSlug()==null || product.getSlug().isEmpty()){

                product.setSlug(
                        generateSlug(product.getName())
                );

            }

        }

        productRepository.saveAll(products);

    }



}
