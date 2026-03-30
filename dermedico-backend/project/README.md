# Skincare E-Commerce Backend

A comprehensive Java Spring Boot backend for a skincare e-commerce platform with MySQL database.

## Features

### Authentication & Authorization
- Email-based OTP authentication
- JWT token-based authorization
- Role-based access control (USER, ADMIN)
- Secure OTP generation with expiration and attempt limits

### Product Management
- Full CRUD operations for products
- Support for single products, combos, and gift items
- Advanced search and filtering capabilities
- Multiple image support (main, thumbnails, banners)
- Detailed product specifications

### Shopping Experience
- Shopping cart management
- Wishlist functionality
- Move items from wishlist to cart
- Stock validation before checkout

### Delivery & Shipping
- Pincode-based delivery availability check
- COD eligibility verification
- Estimated delivery time calculation
- Shipping charges management
- Multiple shipping addresses per user

### Order Processing
- Complete checkout flow with tax and shipping calculation
- Razorpay payment gateway integration
- COD support
- Order tracking with status updates
- Order history for users

### Reviews & Ratings
- Product reviews and ratings
- Review moderation system (PENDING, APPROVED, REJECTED)
- Prevent duplicate reviews
- 24-hour edit window for reviews

### Admin Panel
- Product management (CRUD, stock updates)
- Order management (status updates, tracking, refunds)
- User management (suspend/unblock, purchase history)
- Pincode delivery rules configuration
- Review moderation
- Analytics and reporting

### Audit Logging
- Comprehensive audit logs for critical actions
- Track user activities and admin operations

## Tech Stack

- **Java**: 17
- **Spring Boot**: 3.2.0
- **Spring Security**: JWT-based authentication
- **Spring Data JPA**: Database operations
- **MySQL**: Database
- **Razorpay**: Payment gateway
- **Lombok**: Reduce boilerplate code
- **Maven**: Dependency management

## Prerequisites

- Java 17 or higher
- MySQL 8.0 or higher
- Maven 3.6 or higher

## Configuration

Update `src/main/resources/application.properties` with your configuration:

```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/skincare_ecommerce
spring.datasource.username=your_username
spring.datasource.password=your_password

# JWT Configuration
jwt.secret=your-secret-key
jwt.expiration=86400000

# OTP Configuration
otp.expiration=300000
otp.max-attempts=3

# Email Configuration
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password

# Razorpay Configuration
razorpay.key.id=your-razorpay-key-id
razorpay.key.secret=your-razorpay-key-secret
```

## Running the Application

1. Clone the repository
2. Configure the database and application properties
3. Run the application:

```bash
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Request OTP for login
- `POST /api/auth/verify-otp` - Verify OTP and get JWT token

### Products
- `GET /api/products/list` - Get all products
- `GET /api/products/{id}` - Get product by ID
- `GET /api/products/search` - Search products
- `GET /api/products/filter` - Filter products

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/{cartItemId}` - Update cart item quantity
- `DELETE /api/cart/{cartItemId}` - Remove item from cart

### Wishlist
- `GET /api/wishlist` - Get user wishlist
- `POST /api/wishlist/add` - Add item to wishlist
- `DELETE /api/wishlist/{wishlistItemId}` - Remove from wishlist
- `POST /api/wishlist/{wishlistItemId}/move-to-cart` - Move to cart

### Orders
- `POST /api/orders/checkout` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/{orderId}` - Get order details

### Payments
- `POST /api/payments/verify` - Verify Razorpay payment

### Reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/{reviewId}` - Update review
- `GET /api/reviews/product/{productId}` - Get product reviews

### Admin Endpoints
All admin endpoints require ADMIN role:

- `/api/admin/products` - Product management
- `/api/admin/orders` - Order management
- `/api/admin/users` - User management
- `/api/admin/reviews` - Review moderation
- `/api/admin/pincode` - Pincode delivery rules
- `/api/admin/analytics` - Analytics and reports

## Database Schema

The application uses the following main entities:
- User
- Product
- CartItem
- WishlistItem
- Order
- OrderItem
- Payment
- Review
- ShippingAddress
- PincodeDelivery
- OTP
- AuditLog

## Security

- JWT tokens for authentication
- Role-based authorization
- Secure OTP generation and validation
- Password-less authentication
- Audit logging for critical operations

## License

This project is licensed under the MIT License.
