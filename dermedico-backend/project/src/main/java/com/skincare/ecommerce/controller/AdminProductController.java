package com.skincare.ecommerce.controller;

import com.skincare.ecommerce.dto.ApiResponse;
import com.skincare.ecommerce.entity.Product;
import com.skincare.ecommerce.entity.ProductSpecifications;
import com.skincare.ecommerce.entity.User;
import com.skincare.ecommerce.repository.UserRepository;
import com.skincare.ecommerce.service.AuditLogService;
import com.skincare.ecommerce.service.ProductService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/admin/products")
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductController {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Autowired
    private ProductService productService;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }




    @GetMapping
    public ResponseEntity<?> getAllAdminProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection,
            Authentication authentication,
            HttpServletRequest request) {

        try {
            User admin = getCurrentUser(authentication);

            Sort sort = sortDirection.equalsIgnoreCase("ASC")
                    ? Sort.by(sortBy).ascending()
                    : Sort.by(sortBy).descending();

            Pageable pageable = PageRequest.of(page, size, sort);

            var products = productService.getAllProducts(pageable); // <-- admin sees all products

            auditLogService.log(admin.getId(), admin.getEmail(), "READ", "Product",
                    null, "Fetched product list", request.getRemoteAddr());

            return ResponseEntity.ok(products);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }


    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> createProduct(
            @RequestPart("product") Product product,

            @RequestParam("categoryId") Long categoryId,
            @RequestParam("brandId") Long brandId,

            @RequestParam(value = "concernIds", required = false) List<Long> concernIds,

            @RequestParam(defaultValue = "false") boolean trending,
            @RequestParam(defaultValue = "false") boolean topSeller,

            @RequestPart(value = "mainImage", required = false) MultipartFile mainImage,
            @RequestPart(value = "thumbnailImages", required = false) MultipartFile[] thumbnailImages,
            @RequestPart(value = "bannerImages", required = false) MultipartFile[] bannerImages,

            Authentication authentication,
            HttpServletRequest request
    ) {

        try {
            User admin = getCurrentUser(authentication);

            Path path = Paths.get(uploadDir);
            if (!Files.exists(path)) Files.createDirectories(path);

            if (mainImage != null && !mainImage.isEmpty()) {
                String mainImageName = saveFile(mainImage, path);
                product.setMainImage("/uploads/" + mainImageName);
            }

            if (thumbnailImages != null) {
                List<String> thumbs = new ArrayList<>();
                for (MultipartFile file : thumbnailImages) {
                    if (!file.isEmpty()) {
                        thumbs.add("/uploads/" + saveFile(file, path));
                    }
                }
                product.setThumbnailImages(String.join(",", thumbs));
            }

            if (bannerImages != null) {
                List<String> banners = new ArrayList<>();
                for (MultipartFile file : bannerImages) {
                    if (!file.isEmpty()) {
                        banners.add("/uploads/" + saveFile(file, path));
                    }
                }
                product.setBannerImages(String.join(",", banners));
            }

            Product saved = productService.createProduct(
                    product,
                    categoryId,
                    brandId,
                    concernIds == null ? Set.of() : new HashSet<>(concernIds),
                    trending,
                    topSeller
            );

            auditLogService.log(admin.getId(), admin.getEmail(),
                    "CREATE", "Product", saved.getId(),
                    "Created product: " + saved.getName(),
                    request.getRemoteAddr());

            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }




    @PutMapping(value = "/{productId}", consumes = {"multipart/form-data"})
    public ResponseEntity<?> updateProduct(
            @PathVariable Long productId,
            @RequestPart("product") Product product,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) List<Long> concernIds,
            @RequestPart(value = "mainImage", required = false) MultipartFile mainImage,
            @RequestPart(value = "thumbnailImages", required = false) MultipartFile[] thumbnailImages,
            @RequestPart(value = "bannerImages", required = false) MultipartFile[] bannerImages,
            Authentication authentication,
            HttpServletRequest request
    ) {
        try {
            User admin = getCurrentUser(authentication);

            Path path = Paths.get(uploadDir);
            if (!Files.exists(path)) Files.createDirectories(path);

            Product existingProduct = productService.getProductById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            // ================= BASIC FIELDS =================
            existingProduct.setName(product.getName());
            existingProduct.setDescription(product.getDescription());
            existingProduct.setPrice(product.getPrice());
            existingProduct.setSize(product.getSize());
            existingProduct.setStockQuantity(product.getStockQuantity());
            existingProduct.setType(product.getType());
            existingProduct.setActive(product.isActive());

            // ================= FLAGS =================
            existingProduct.setTrending(product.isTrending());
            existingProduct.setTopSeller(product.isTopSeller());

            // ================= CATEGORY =================
            if (categoryId != null) {
                productService.attachCategory(existingProduct, categoryId);
            }

            // ================= BRAND =================
            if (brandId != null) {
                productService.attachBrand(existingProduct, brandId);
            }

            // ================= CONCERNS =================
            if (concernIds != null) {
                productService.attachConcerns(existingProduct, concernIds);
            }

            // ================= SPECIFICATIONS =================
            if (product.getSpecifications() != null) {
                if (existingProduct.getSpecifications() == null) {
                    existingProduct.setSpecifications(new ProductSpecifications());
                }
                existingProduct.getSpecifications().setDetailedDescription(product.getSpecifications().getDetailedDescription());
                existingProduct.getSpecifications().setDirectionsForUse(product.getSpecifications().getDirectionsForUse());
                existingProduct.getSpecifications().setFeatures(product.getSpecifications().getFeatures());
                existingProduct.getSpecifications().setBenefits(product.getSpecifications().getBenefits());
                existingProduct.getSpecifications().setIngredients(product.getSpecifications().getIngredients());
                existingProduct.getSpecifications().setTags(product.getSpecifications().getTags());
            }

            // ================= IMAGES =================
            if (mainImage != null && !mainImage.isEmpty()) {
                existingProduct.setMainImage("/uploads/" + saveFile(mainImage, path));
            }

            if (thumbnailImages != null && thumbnailImages.length > 0) {
                List<String> thumbs = new ArrayList<>();
                for (MultipartFile f : thumbnailImages) {
                    if (!f.isEmpty()) thumbs.add("/uploads/" + saveFile(f, path));
                }
                existingProduct.setThumbnailImages(String.join(",", thumbs));
            }

            if (bannerImages != null && bannerImages.length > 0) {
                List<String> banners = new ArrayList<>();
                for (MultipartFile f : bannerImages) {
                    if (!f.isEmpty()) banners.add("/uploads/" + saveFile(f, path));
                }
                existingProduct.setBannerImages(String.join(",", banners));
            }

            Product updated = productService.save(existingProduct);

            auditLogService.log(
                    admin.getId(),
                    admin.getEmail(),
                    "UPDATE",
                    "Product",
                    updated.getId(),
                    "Updated product",
                    request.getRemoteAddr()
            );

            return ResponseEntity.ok(updated);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }




    @DeleteMapping("/{productId}")
    public ResponseEntity<?> deleteProduct(
            @PathVariable Long productId,
            Authentication authentication,
            HttpServletRequest request) {
        try {
            User admin = getCurrentUser(authentication);
            productService.deleteProduct(productId);

            auditLogService.log(admin.getId(), admin.getEmail(), "DELETE", "Product",
                    productId, "Deleted product ID: " + productId, request.getRemoteAddr());

            return ResponseEntity.ok(new ApiResponse(true, "Product deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PatchMapping("/{productId}/stock")
    public ResponseEntity<?> updateStock(
            @PathVariable Long productId,
            @RequestParam int quantity,
            Authentication authentication,
            HttpServletRequest request) {
        try {

            System.out.print("Quantity Of Stock"+quantity);
            User admin = getCurrentUser(authentication);
            productService.updateStock(productId, quantity);

            auditLogService.log(admin.getId(), admin.getEmail(), "UPDATE_STOCK", "Product",
                    productId, "Updated stock by: " + quantity, request.getRemoteAddr());

            return ResponseEntity.ok(new ApiResponse(true, "Stock updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    private String saveFile(MultipartFile file, Path uploadPath) throws IOException {
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        return fileName;
    }

    @PostMapping("/generate-slugs")
    public String generateSlugs(){

        productService.generateSlugsForExistingProducts();

        return "Slugs Generated";

    }
}
