# E-Commerce API Documentation

## Base URL

```
http://localhost:3000/api
https://e-commerce-app-fpo8.onrender.com/api
```

## Authentication

- **Cookie-based authentication** with HTTP-only cookies
- **JWT tokens** with 24-hour expiry
- **Role-based access control**: `user`, `seller`, `admin`

---

## 🔐 Authentication Endpoints

### **POST** `/auth/signup`

Create a new user or seller account.

**Query Parameters:**

- `role` (required): `user` or `seller`

**Request Body:**

```json
{
  "username": "john_doe",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "address": "123 Main St",
  "phone": "555-1234",
  "brandName": "TechStore" // Required for seller role
}
```

**Response:**

```json
{
  "success": true,
  "message": "user account created successfully",
  "data": {
    "user": {
      /* user data without password */
    },
    "role": "user"
  }
}
```

**Implementation:** `authLogic.js > signup()`

- Cross-collection email duplication check
- Password hashing with bcrypt
- Secure HTTP-only cookie creation
- Role-based model selection

---

### **POST** `/auth/login`

Authenticate user and set secure cookie.

**Query Parameters:**

- `role` (required): `user` or `seller`

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**

```json
{
  "success": true,
  "message": "user logged in successfully",
  "data": {
    "user": {
      /* user data without password */
    },
    "role": "user"
  }
}
```

**Implementation:** `authLogic.js > login()`

- Role-specific authentication
- Password verification
- JWT token generation
- Secure cookie setting

---

### **POST** `/auth/logout`

Clear authentication cookie.

**Authentication:** None required

**Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Implementation:** `authLogic.js > logout()`

- Clear authentication cookie
- Maintain cookie security flags

---

### **PATCH** `/auth/change-password`

Change user password with current password verification.

**Authentication:** Required
**Query Parameters:**

- `role` (required): `user` or `seller`

**Request Body:**

```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

**Implementation:** `authLogic.js > changePassword()`

- Current password verification
- Password hashing
- Role-based model selection

---

### **PATCH** `/auth/change-email`

Change user email with password verification.

**Authentication:** Required
**Query Parameters:**

- `role` (required): `user` or `seller`

**Request Body:**

```json
{
  "newEmail": "newemail@example.com",
  "password": "currentpassword"
}
```

**Implementation:** `authLogic.js > changeEmail()`

- Password verification
- Cross-collection email duplication check
- Email update with validation

---

## 👥 User Management Endpoints

### **GET** `/user/profile`

Get current user's profile.

**Authentication:** Required (user role)

**Response:**

```json
{
  "success": true,
  "data": {
    "username": "john_doe",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  }
}
```

**Implementation:** `userLogic.js > getUserProfile()`

---

### **GET** `/user/`

Get all users (admin only).

**Authentication:** Required (admin role)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      /* user objects without passwords */
    }
  ]
}
```

**Implementation:** `userLogic.js > getUsers()`

- No pagination (simplified for small scale)
- Password exclusion
- Newest first sorting

---

### **GET** `/user/:id`

Get specific user by ID.

**Authentication:** Required + Ownership check
**Authorization:** User can only access own data or admin

**Implementation:** `userLogic.js > getUser()`

---

### **PATCH** `/user/:id`

Update user profile.

**Authentication:** Required + Ownership check

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Smith",
  "address": "456 New St"
}
```

**Implementation:** `userLogic.js > patchUser()`

- Sensitive field protection (password, email, \_id, \_\_v)
- Validation error handling

---

### **DELETE** `/user/:id`

Delete user account.

**Authentication:** Required + Ownership check

**Implementation:** `userLogic.js > deleteUser()`

---

## 🏪 Seller Management Endpoints

### **GET** `/seller/profile`

Get current seller's profile with products.

**Authentication:** Required (seller role)

**Response:**

```json
{
  "success": true,
  "data": {
    "username": "seller1",
    "brandName": "TechStore",
    "email": "seller@example.com",
    "products": [
      {
        "title": "Laptop",
        "price": 999,
        "category": "Electronics"
      }
    ]
  }
}
```

**Implementation:** `sellerLogic.js > getSellerProfile()`

- Product population
- Password exclusion

---

### **GET** `/seller/stats`

Get seller dashboard statistics.

**Authentication:** Required (seller role)

**Response:**

```json
{
  "success": true,
  "data": {
    "totalProducts": 15,
    "brandName": "TechStore",
    "productsByCategory": {
      "Electronics": 10,
      "Books": 3,
      "Clothing": 2
    },
    "recentProducts": [
      {
        "title": "Latest Laptop",
        "price": 1299,
        "createdAt": "2025-08-13T10:30:00.000Z"
      }
    ]
  }
}
```

**Implementation:** `sellerLogic.js > getSellerStats()`

- Product categorization
- Recent products (last 5)
- Statistics calculation

---

### **GET** `/seller/`

Get all sellers (admin only).

**Authentication:** Required (admin role)

**Implementation:** `sellerLogic.js > getSellers()`

- Product population
- Password exclusion

---

### **GET** `/seller/:id`

Get specific seller by ID.

**Authentication:** Required + Ownership check

**Implementation:** `sellerLogic.js > getSeller()`

---

### **PATCH** `/seller/:id`

Update seller profile.

**Authentication:** Required + Ownership check

**Implementation:** `sellerLogic.js > patchSeller()`

- Protected fields: password, email, products, \_id, \_\_v
- Product population in response

---

### **DELETE** `/seller/:id`

Delete seller and all associated products.

**Authentication:** Required + Ownership check

**Implementation:** `sellerLogic.js > deleteSeller()`

- Cascading delete of associated products
- Database integrity maintenance

---

## 📦 Product Management Endpoints

### **GET** `/product/`

Get all products with filtering and sorting.

**Authentication:** None (public)

**Query Parameters:**

- `page` (default: 1)
- `limit` (default: 10)
- `search` (text search in title/description)
- `category` (filter by category)
- `minPrice` / `maxPrice` (price range)
- `sortBy` (default: createdAt)
- `order` (asc/desc, default: desc)

**Response:**

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "title": "Gaming Laptop",
        "description": "High-performance laptop",
        "price": 1299,
        "category": "Electronics",
        "seller": {
          "username": "techstore",
          "brandName": "TechStore",
          "email": "tech@store.com"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalProducts": 47,
      "hasNext": true,
      "hasPrev": false
    },
    "filters": {
      /* applied filters */
    }
  }
}
```

**Implementation:** `productLogic.js > getProducts()`

- Advanced filtering and searching
- Pagination with metadata
- Seller information population
- Price range filtering
- Category filtering
- Text search across title and description

---

### **GET** `/product/:id`

Get single product details.

**Authentication:** None (public)

**Implementation:** `productLogic.js > getProduct()`

- Seller information population

---

### **POST** `/product/`

Create new product.

**Authentication:** Required (seller role)

**Request Body:**

```json
{
  "title": "Gaming Mouse",
  "description": "RGB gaming mouse",
  "price": 79.99,
  "category": "Electronics",
  "productImage": "image_url"
}
```

**Implementation:** `productLogic.js > addProduct()`

- Automatic seller assignment from JWT
- Seller's product array update
- Product validation
- Seller information population

---

### **PATCH** `/product/:id`

Update product.

**Authentication:** Required (seller role) + Product ownership

**Implementation:** `productLogic.js > updateProduct()`

- Ownership verification via middleware
- Protected field exclusion (seller, \_id, \_\_v, createdAt)
- Validation error handling

---

### **DELETE** `/product/:id`

Delete product.

**Authentication:** Required (seller role) + Product ownership

**Implementation:** `productLogic.js > deleteProduct()`

- Ownership verification via middleware
- Removal from seller's product array
- Database cleanup

---

### **GET** `/product/seller/my-products`

Get current seller's products.

**Authentication:** Required (seller role)

**Implementation:** `productLogic.js > getSellerProducts()`

- Seller-specific product filtering
- Pagination support
- Search functionality within seller's products

---

## 💰 Sales Management Endpoints

### **GET** `/sales/brand/:brandName`

Get sales by brand name with statistics.

**Authentication:** None (public)

**Response:**

```json
{
  "success": true,
  "data": {
    "sales": [
      /* all sales for this brand */
    ],
    "stats": {
      "brandName": "TechStore",
      "totalSales": 25,
      "totalRevenue": 15750,
      "salesByStatus": {
        "pending": 5,
        "completed": 18,
        "cancelled": 2
      },
      "recentSales": [
        /* last 10 sales */
      ]
    }
  }
}
```

**Implementation:** `salesLogic.js > getSalesByBrand()`

- Brand validation
- Sales statistics calculation
- Revenue computation
- Status distribution analysis
- Recent sales filtering

---

### **POST** `/sales/`

Create new sale.

**Authentication:** Required (user role)

**Request Body:**

```json
{
  "productId": "product_id_here",
  "quantity": 2
}
```

**Response:**

```json
{
  "success": true,
  "message": "Sale created successfully",
  "data": {
    "product": {
      /* product details */
    },
    "seller": {
      /* seller details */
    },
    "buyer": {
      /* buyer details */
    },
    "quantity": 2,
    "totalPrice": 159.98,
    "status": "pending"
  }
}
```

**Implementation:** `salesLogic.js > createSale()`

- Product validation and price calculation
- Automatic seller and buyer assignment
- Total price computation
- Full population of related data

---

### **GET** `/sales/my-purchases`

Get current user's purchase history.

**Authentication:** Required (user role)

**Implementation:** `salesLogic.js > getBuyerSales()`

- User-specific sales filtering
- Complete order history

---

### **GET** `/sales/my-sales`

Get current seller's sales with statistics.

**Authentication:** Required (seller role)

**Response:**

```json
{
  "success": true,
  "data": {
    "sales": [
      /* seller's sales */
    ],
    "stats": {
      "totalSales": 15,
      "totalRevenue": 8500,
      "salesByStatus": {
        "pending": 3,
        "completed": 10,
        "cancelled": 2
      },
      "topProducts": {
        "Laptop": 5,
        "Phone": 3,
        "Tablet": 2
      }
    }
  }
}
```

**Implementation:** `salesLogic.js > getSellerSales()`

- Seller-specific sales filtering
- Revenue and statistics calculation
- Top-selling products analysis
- Status distribution

---

### **PATCH** `/sales/:id/status`

Update sale status.

**Authentication:** Required (seller or admin role)

**Request Body:**

```json
{
  "status": "completed"
}
```

**Valid Statuses:** `pending`, `completed`, `cancelled`

**Implementation:** `salesLogic.js > updateSaleStatus()`

- Status validation
- Ownership verification (seller can only update their sales)
- Admin override capability

---

### **GET** `/sales/:id`

Get single sale details.

**Authentication:** Required + Sale access verification

**Authorization:** Only buyer, seller, or admin can access

**Implementation:** `salesLogic.js > getSale()`

- Access control via `checkSaleAccess` middleware
- Complete sale information with populated references

---

### **GET** `/sales/`

Get all sales.

**Authentication:** Required (admin role)

**Implementation:** `salesLogic.js > getSales()`

- Complete sales overview
- Admin-only access

---

### **DELETE** `/sales/:id`

Delete sale.

**Authentication:** Required (admin role)

**Implementation:** `salesLogic.js > deleteSale()`

- Admin-only operation
- Complete sale removal

---

## 🔒 Security Features

### **Middleware Chain:**

1. `authenticateToken` - JWT verification with cookie/header fallback
2. `requireRole(['roles'])` - Role-based access control
3. `checkOwnership` - Resource ownership verification
4. `checkProductOwnership` - Product-specific ownership
5. `checkSaleAccess` - Sale access verification

### **Authentication Flow:**

1. **Cookie-first authentication** with Authorization header fallback
2. **Database existence verification** for JWT tokens
3. **Role-based route protection**
4. **Resource-level ownership checks**

### **Data Protection:**

- **Password exclusion** from all responses
- **Sensitive field protection** in updates
- **Cross-collection email duplication prevention**
- **Secure cookie configuration** with HttpOnly, Secure, SameSite

---

## 🚀 Quick Start

### **1. User Registration & Login:**

```bash
# Register as user
POST /api/auth/signup?role=user
Body: { "username": "john", "email": "john@test.com", "password": "pass123" }

# Login
POST /api/auth/login?role=user
Body: { "email": "john@test.com", "password": "pass123" }
```

### **2. Seller Registration & Product Creation:**

```bash
# Register as seller
POST /api/auth/signup?role=seller
Body: { "username": "techstore", "email": "tech@store.com", "password": "pass123", "brandName": "TechStore" }

# Create product
POST /api/product/
Body: { "title": "Gaming Mouse", "price": 79.99, "category": "Electronics" }
```

### **3. Make a Purchase:**

```bash
# Create sale
POST /api/sales/
Body: { "productId": "product_id", "quantity": 1 }
```

### **4. Track Sales by Brand:**

```bash
# Get brand sales
GET /api/sales/brand/TechStore
```

---

## 📊 Database Schema

### **Users Collection:**

- username, firstName, lastName, email, password, address, phone, birthDate

### **Sellers Collection:**

- username, firstName, lastName, email, password, address, phone, birthDate, brandName, products[]

### **Products Collection:**

- title, description, price, category, productImage, seller (ObjectId)

### **Sales Collection:**

- product (ObjectId), seller (ObjectId), buyer (ObjectId), quantity, totalPrice, status, createdAt

---

## 🔧 Configuration

### **Environment Variables:**

- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (development/production)
- MongoDB connection string
- Cloudinary configuration

### **Server Configuration:**

- Port: 3000
- CORS enabled
- Cookie parser enabled
- File upload support
- JSON body parsing

---

_Last Updated: August 13, 2025_
_API Version: 1.0_
