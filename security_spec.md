# Security Specification for ER Lifestyles System

## Data Invariants
1. A distributor cannot be created by anyone except an admin.
2. An order must have at least one item and a valid status.
3. Only admins can update product stock or details.
4. Distributors can only view orders assigned to them.
5. Admins can view all orders and distributors.

## The "Dirty Dozen" Payloads (Denial Tests)

1. **Identity Spoofing**: Attempt to create a distributor as a non-admin.
2. **Product Hijacking**: Attempt to update product price as a customer.
3. **Empty Order**: Send an order with `items: []`.
4. **Invalid Status**: Set order status to `delivered` (not in enum).
5. **Unauthorized Order Read**: Distributor attempting to read another distributor's order.
6. **Price Tampering**: Customer submitting an order with a price lower than the product price (Note: Rules can't easily check product price in a loop, but can check schema).
7. **Admin Self-Proclaim**: Attempt to write to `admins` collection.
8. **Insecure List**: Unauthenticated user listing all orders.
9. **Orphaned Order**: Create an order for a distributor that doesn't exist.
10. **Shadow Update**: Add `isVerified: true` to an order update.
11. **Negative Stock**: Update product with `stock: -5`.
12. **Future Timestamp**: Submit `createdAt` as a future date (rules will use `request.time`).

## Test Runner (Logic)
The `firestore.rules` will implement:
- `isAdmin()` helper check against `/admins/{uid}`.
- `isDistributor()` helper check against `/distributors/{uid}`.
- `isValidProduct()`, `isValidOrder()`, `isValidDistributor()` schema validation functions.
- `affectedKeys().hasOnly()` for all updates.
