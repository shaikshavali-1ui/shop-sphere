# Module 2: Product & Catalog Management

## 1. Module Overview
The Product & Catalog Management module handles the catalog lifecycle. Admins can view listings, search and filter items, create new products, upload images, update pricing/specifications, modify stock inventory, and remove products.

## 2. Features in this Module
- **Product Catalog Directory**: Unified view listing product image, title, price, category, stock count, and active/inactive status.
- **Dynamic Search & Filtering**: Client-side/server-side debounced search matching terms in title and filtering categories.
- **Add Product Form**: Unified input form for details (name, price, stock, category, status).
- **Edit Product System**: Pre-populated details form allowing admins to edit and save database fields.
- **Product Image Upload**: Seamless integration with Supabase Storage bucket for storing and hosting product photos.
- **Delete Product Utility**: Safe removal capability with warning prompts and checks for order conflicts.

## 3. User Interactions
- **Search Catalog**: Admin types in search bar -> Products table updates instantly using debounced input events.
- **Add Product**:
  1. Admin clicks "Add Product" button.
  2. Dialog box or sub-page opens.
  3. Admin enters text details, selects file in Image Selector.
  4. Clicks "Submit" -> Progress indicator displays upload state -> Success notification updates grid.
- **Edit Details**: Admin clicks "Edit" icon on table row -> Details modal displays -> Changes fields -> Clicks "Save changes" -> Grid refreshes with updated metadata.
- **Delete Product**: Admin clicks "Delete" -> Prompt displays warning ("Are you sure you want to delete this product?") -> Confirming executes DB query, clearing file from storage and entry from products table.

## 4. Data Requirements
- **Products Schema Fields**:
  - `product_id` (UUID, primary key, auto-generated)
  - `name` (string, 3-255 characters, required)
  - `price` (numeric, check `>= 0.00`, scale 2, required)
  - `category` (string, max 100 characters, required)
  - `stock` (integer, check `>= 0`, required)
  - `status` (string, enum: `'Active' | 'Draft' | 'Out of Stock'`, defaults to `'Draft'`)
  - `image_url` (string/text, holds bucket URL link, optional)
  - `created_at` (timestamp with timezone, auto-now)

## 5. API Requirements (High Level)
- **Supabase DB Calls**:
  - `GET /products`: Fetches product profiles with query parameters for search (`%term%`), category matching, and paginated limit offsets.
  - `POST /products`: Inserts single product record.
  - `PATCH /products/[id]`: Updates subset of fields for specific ID.
  - `DELETE /products/[id]`: Removes row entry.
- **Supabase Storage Calls**:
  - `supabase.storage.from('product-images').upload(filePath, file)`: Uploads image file.
  - `supabase.storage.from('product-images').getPublicUrl(filePath)`: Fetches static asset URL.

## 6. Edge Cases
- **Referential Integrity Constraints (Delete Block)**: Admin deletes product currently referenced in outstanding orders -> DB blocks deletion via constraint check -> UI catches exception and displays "Cannot delete product because it has pending orders. You can set its status to 'Draft' or 'Out of Stock' instead."
- **Overlarge Image Files**: User selects a 50MB file -> Browser client rejects file size locally before uploading to reduce network wastage (max size cap: 5MB).
- **Automatic Stock Status Changes**: Product stock falls to `0` -> System automatically alters state value to `Out of Stock`.
- **Concurrency Overwrites**: Two admins edit the same product simultaneously -> Use validation or timestamp comparisons to ensure the latter doesn't silently override former without warning.
