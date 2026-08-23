/*
  Warnings:

  - A unique constraint covering the columns `[order]` on the table `Lesson` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Lesson_order_key" ON "Lesson"("order");
