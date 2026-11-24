import { NextRequest, NextResponse } from "next/server";
import { PropertyService } from "@/services/property.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const minLat = parseFloat(searchParams.get("minLat") || "");
    const minLng = parseFloat(searchParams.get("minLng") || "");
    const maxLat = parseFloat(searchParams.get("maxLat") || "");
    const maxLng = parseFloat(searchParams.get("maxLng") || "");

    if (isNaN(minLat) || isNaN(minLng) || isNaN(maxLat) || isNaN(maxLng)) {
      return NextResponse.json({ success: false, error: "Invalid bounding box parameters" }, { status: 400 });
    }

    const properties = await PropertyService.searchPropertiesByBounds(minLat, minLng, maxLat, maxLng, 100);
    return NextResponse.json({ success: true, data: properties });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
