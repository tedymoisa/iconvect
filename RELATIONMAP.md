## Explanation of Prisma Schema Changes

Here's a breakdown of the modifications made to the Prisma schema to incorporate credits, payments, user enhancements, and tracking:

1.  **Enums:**

    - Added several `enum` types:
      - `UserStatus`: Defines allowed states for a user (e.g., `TRIAL`, `SUBSCRIBED`).
      - `PaymentProvider`: Specifies the payment gateway used (e.g., `STRIPE`, `PAYPAL`).
      - `OrderStatus`: Tracks the status of a credit purchase order (e.g., `PENDING`, `COMPLETED`, `FAILED`).
      - `CreditTransactionType`: Categorizes credit changes (e.g., `PURCHASE`, `GENERATION`, `TRIAL_GRANT`).
      - `AiGenerationStatus`: Tracks the state of an AI generation request (e.g., `PENDING`, `COMPLETED`, `FAILED`).
    - Enums improve data integrity by restricting fields to predefined values and make the schema more readable.

2.  **`User` Model Enhancements:**

    - `credits`: Added an `Int` field to store the user's current credit balance. Includes a ` @default(10)` for initial trial credits (adjust value as needed).
    - `status`: Added a `UserStatus` enum field, defaulting to `TRIAL`.
    - `createdAt`, `updatedAt`: Added standard timestamp fields automatically managed by Prisma (`@default(now())`, `@updatedAt`).
    - `lastLoginIp`, `lastLoginAt`: Added optional `String?` and `DateTime?` fields to store the IP address and timestamp of the user's last login.
    - **Relations:** Added new relation fields (`orders`, `invoices`, `creditTransactions`, `aiGenerations`) to link users to their corresponding records in the new models.

3.  **`CreditTransaction` Model (New):**

    - Purpose: Tracks every addition or deduction of credits for a user, providing a complete audit trail.
    - Fields:
      - `userId`: Foreign key linking to the `User`.
      - `amount`: An `Int` representing the number of credits involved (positive for additions, negative for deductions).
      - `type`: Uses the `CreditTransactionType` enum to specify the reason for the change.
      - `description`: Optional `String?` for additional context.
      - `orderId`: Optional foreign key (`String?`) linking to the `Order` that might have caused this transaction (e.g., a purchase). `onDelete: SetNull` prevents deleting credit history if the related order is removed.
      - `generationId`: Optional foreign key (`String?`) linking to the `AiGenerationRequest` that might have caused this transaction (e.g., credit usage). `onDelete: SetNull` prevents deleting credit history if the related generation request is removed.
    - **Relations:**
      - `order`: Defines that a `CreditTransaction` _optionally_ belongs to _one_ `Order`.
      - `generation`: Defines that a `CreditTransaction` _optionally_ belongs to _one_ `AiGenerationRequest`.
    - Indexed by `userId`, `orderId`, and `generationId` for efficient querying.

4.  **`Order` Model (New):**

    - Purpose: Represents a user's request to purchase credits via a payment provider.
    - Fields:
      - `userId`: Foreign key linking to the `User`.
      - `status`: Uses the `OrderStatus` enum.
      - `amount`, `currency`: Stores the monetary value. **Uses `Decimal` type for financial accuracy.**
      - `creditsPurchased`: `Int` field for the number of credits being bought.
      - `paymentProvider`: Uses the `PaymentProvider` enum.
      - `providerOrderId`: A `String?` to store the unique transaction/order ID from Stripe or PayPal (e.g., Payment Intent ID). Marked `@unique`.
    - **Relations:**
      - `invoice`: Links to the resulting `Invoice` (if successful). This is typically a one-to-one relation implicitly defined by the unique `orderId` on the `Invoice` model.
      - `creditTransactions`: Defines the **one-to-many** relationship from the `Order` side. An order can be associated with multiple credit transactions (e.g., the initial purchase transaction, potentially a later refund transaction referencing the same order).
    - Indexed by `userId`.

5.  **`Invoice` Model (New):**

    - Purpose: Represents a finalized payment record, typically corresponding to a successful `Order`.
    - Fields:
      - `orderId`: A unique foreign key linking back to the `Order`. `onDelete: Cascade` ensures the invoice is deleted if the order is. This unique key establishes the one-to-one link with `Order`.
      - `userId`: Denormalized foreign key linking to `User` for easier invoice lookups per user.
      - `providerInvoiceId`: Optional `String?` for the specific Invoice ID from the payment provider (if different from the order ID). Marked `@unique`.
      - `status`: `String` field to store the status reported by the provider (e.g., 'paid', 'open').
      - `amountPaid`, `currency`: Uses `Decimal` for the confirmed amount paid.
      - `paidAt`: Optional `DateTime?` when payment was confirmed.
      - `invoiceUrl`: Optional `String?` linking to the hosted invoice page (e.g., on Stripe).
    - Indexed by `userId` and `orderId`.

6.  **`AiGenerationRequest` Model (New):**

    - Purpose: Tracks each individual AI SVG generation request made by a user.
    - Fields:
      - `userId`: Foreign key linking to the `User`.
      - `prompt`: The input prompt provided by the user. Uses `@db.Text` for potentially long strings.
      - `creditsCost`: `Int` field recording the credit cost for this specific generation.
      - `status`: Uses the `AiGenerationStatus` enum.
      - `resultSvgPath`: Optional `String?` to store the path or URL to the generated SVG file upon success.
      - `errorMessage`: Optional `String?` to store error details if the generation failed.
      - `completedAt`: Optional `DateTime?` timestamp for when the process finished.
    - **Relation:**
      - `creditTransactions`: Defines the **one-to-many** relationship from the `AiGenerationRequest` side. A generation request is typically associated with one credit deduction transaction, but defining it as potentially many allows for flexibility if needed later.
    - Indexed by `userId`.

7.  **Mapping (`@map`, `@@map`):**

    - Applied snake_case naming conventions for database tables and columns (e.g., `userId` becomes `user_id` in the database).

8.  **Indexing (`@@index`):**

    - Added explicit indexes on `userId` fields in the new related tables (`CreditTransaction`, `Order`, `Invoice`, `AiGenerationRequest`).
    - Added indexes on `orderId` and `generationId` in `CreditTransaction` to optimize lookups.

9.  **Cascade Deletes (`onDelete: Cascade` / `SetNull`):**
    - Configured cascade deletes (`onDelete: Cascade`) on relations originating from the `User` model (`Account`, `Session`, `Order`, `Invoice`, `CreditTransaction`, `AiGenerationRequest`) and from `Order` to `Invoice`. This ensures related data is cleaned up when a parent record (like a User or Order) is deleted.
    - Used `onDelete: SetNull` for the optional `orderId` and `generationId` fields in `CreditTransaction`. This means if an `Order` or `AiGenerationRequest` is deleted, the corresponding `orderId` or `generationId` in any related `CreditTransaction` records will be set to `NULL`, preserving the credit transaction history itself.
