-- Create DB-level check constraints for the Property table
-- Ensures that invalid data (like negative prices or areas) cannot be inserted into the database even if API validation is bypassed.

ALTER TABLE "Property" ADD CONSTRAINT "Property_price_check" CHECK (price >= 0);
ALTER TABLE "Property" ADD CONSTRAINT "Property_carpetArea_check" CHECK ("carpetArea" > 0);
ALTER TABLE "Property" ADD CONSTRAINT "Property_bedrooms_check" CHECK (bedrooms IS NULL OR bedrooms >= 0);
ALTER TABLE "Property" ADD CONSTRAINT "Property_bathrooms_check" CHECK (bathrooms IS NULL OR bathrooms >= 0);
