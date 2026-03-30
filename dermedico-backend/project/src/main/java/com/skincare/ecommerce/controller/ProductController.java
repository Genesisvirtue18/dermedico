package com.skincare.ecommerce.controller;

import com.skincare.ecommerce.Enum.ConcernGroup;
import com.skincare.ecommerce.entity.Brand;
import com.skincare.ecommerce.entity.Category;
import com.skincare.ecommerce.entity.Concern;
import com.skincare.ecommerce.entity.Product;
import com.skincare.ecommerce.service.BrandService;
import com.skincare.ecommerce.service.CategoryService;
import com.skincare.ecommerce.service.ConcernService;
import com.skincare.ecommerce.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
public class ProductController {


    @Autowired
    private BrandService brandService;

    @Autowired
    private ConcernService concernService;


    @Autowired
    private ProductService productService;

    @Autowired
    private CategoryService categoryService;

    @GetMapping("/slug/{slug}")
    public ResponseEntity<Product> getProductBySlug(
            @PathVariable String slug
    ){

        return ResponseEntity.ok(
                productService.getProductBySlug(slug)
        );
    }


    @GetMapping("/list")
    public ResponseEntity<Page<Product>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        Sort sort = sortDirection.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(productService.getAllActiveProducts(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProduct(@PathVariable Long id) {
        Optional<Product> product = productService.getProductById(id);
        if (product.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(product.get());
    }

    @GetMapping("/search")
    public ResponseEntity<Page<Product>> searchProducts(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(productService.searchProducts(keyword, pageable));
    }

    @GetMapping("/filter")
    public ResponseEntity<Page<Product>> filterProducts(
            @RequestParam(required = false) List<Long> concernIds,
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection
    ) {
        Sort sort = sortDirection.equalsIgnoreCase("ASC")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, pageSize, sort);

        return ResponseEntity.ok(
                productService.filterProducts(
                        concernIds, brandId, categoryId, minPrice, maxPrice, pageable
                )
        );
    }



    @GetMapping("/single")
    public ResponseEntity<Page<Product>> getSingleProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        Sort sort = sortDirection.equalsIgnoreCase("ASC")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(productService.getAllSingleProducts(pageable));
    }

    @PostMapping("/upload-excel")
    public ResponseEntity<String> uploadExcel(
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Excel file is empty");
        }

        productService.importExcel(file);
        return ResponseEntity.ok("Products uploaded successfully");
    }


    //GET THE CATEGORY ALL AND BY ID

    // GET ALL CATEGORIES
    @GetMapping("/getCategories")
    public List<Category> getAllCategories() {
        return categoryService.getAllCategories();
    }

    // GET CATEGORY BY ID
    @GetMapping("getCategoriesById/{id}")
    public Category getCategoryById(@PathVariable Long id) {
        return categoryService.getCategoryById(id);
    }


//GET PRODUCT BY CATEGORY ID
@GetMapping("/by-category/{categoryId}")
public ResponseEntity<List<Product>> getProductsByCategory(
        @PathVariable Long categoryId
) {
    List<Product> products = productService.getProductsByCategory(categoryId);
    return ResponseEntity.ok(products);
}



    // TRENDING PRODUCTS
    @GetMapping("/trending")
    public Page<Product> getTrendingProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return productService.getTrendingProducts(PageRequest.of(page, size));
    }

    // TOP SELLERS
    @GetMapping("/top-sellers")
    public Page<Product> getTopSellers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return productService.getTopSellerProducts(PageRequest.of(page, size));
    }

    // ================= GET ALL BRANDS =================
    @GetMapping("/getAllBrands")
    public List<Brand> getAllBrands() {
        return brandService.getAllBrands();
    }

    // ================= GET BRAND BY ID =================
    @GetMapping("/getBrandById/{id}")
    public Brand getBrandById(@PathVariable Long id) {
        return brandService.getBrandById(id);
    }


    // ================= READ ALL =================
    @GetMapping("/getAllConcern")
    public List<Concern> getAllConcerns() {
        return concernService.getAllConcerns();
    }

    // ================= READ BY ID =================
    @GetMapping("/getConcernById/{id}")
    public Concern getConcernById(@PathVariable Long id) {
        return concernService.getConcernById(id);
    }


    //=====================GET CONCERN BY GROUP =================

    @GetMapping("/concerns/groups")
    public List<String> getAllGroups() {
        return Arrays.stream(ConcernGroup.values())
                .map(Enum::name)
                .toList();
    }

    // 2️⃣ GET CONCERNS BY GROUP
    @GetMapping("/concerns/group/{group}")
    public List<Concern> getByGroup(@PathVariable ConcernGroup group) {
        return concernService.getConcernsByGroup(group);
    }



    // PRODUCTS BY BRAND
    @GetMapping("/by-brand/{brandId}")
    public Page<Product> getProductsByBrand(
            @PathVariable Long brandId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return productService.getProductsByBrand(brandId, PageRequest.of(page, size));
    }

    // PRODUCTS BY CONCERN
    @GetMapping("/by-concern/{concernId}")
    public Page<Product> getProductsByConcern(
            @PathVariable Long concernId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return productService.getProductsByConcern(concernId, PageRequest.of(page, size));
    }




}
