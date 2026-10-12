-- AlterTable
ALTER TABLE "TransportRoute" ADD COLUMN     "currentLat" DOUBLE PRECISION,
ADD COLUMN     "currentLng" DOUBLE PRECISION,
ADD COLUMN     "driverPasswordHash" TEXT,
ADD COLUMN     "locationUpdatedAt" TIMESTAMP(3);
