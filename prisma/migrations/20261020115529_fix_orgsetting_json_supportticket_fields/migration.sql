/*
  Warnings:

  - You are about to drop the column `body` on the `SupportTicket` table. All the data in the column will be lost.
  - Changed the type of `value` on the `OrgSetting` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `description` to the `SupportTicket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrgSetting" DROP COLUMN "value",
ADD COLUMN     "value" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "SupportTicket" DROP COLUMN "body",
ADD COLUMN     "assignedToId" TEXT,
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "description" TEXT NOT NULL;
