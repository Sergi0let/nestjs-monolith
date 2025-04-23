/*
  Warnings:

  - You are about to drop the column `userId` on the `order_products` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "order_products" DROP CONSTRAINT "order_products_userId_fkey";

-- AlterTable
ALTER TABLE "order_products" DROP COLUMN "userId";
