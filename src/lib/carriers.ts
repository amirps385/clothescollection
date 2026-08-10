/**
 * Shipping carrier integration stubs.
 * Configure API keys in .env for live integrations.
 */

export interface ShipmentRequest {
  orderNumber: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone?: string;
  weight?: number;
}

export interface ShipmentResponse {
  trackingNumber: string;
  carrier: string;
  label?: string;
}

export async function createDelhiveryShipment(
  data: ShipmentRequest
): Promise<ShipmentResponse | null> {
  const apiKey = process.env.DELHIVERY_API_KEY;
  if (!apiKey) return null;

  // Integration placeholder — connect to Delhivery API
  console.log("[Delhivery] Creating shipment for", data.orderNumber);
  return {
    trackingNumber: `DLV${Date.now()}`,
    carrier: "Delhivery",
  };
}

export async function createShiprocketShipment(
  data: ShipmentRequest
): Promise<ShipmentResponse | null> {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;
  if (!email || !password) return null;

  // Integration placeholder — connect to Shiprocket API
  console.log("[Shiprocket] Creating shipment for", data.orderNumber);
  return {
    trackingNumber: `SR${Date.now()}`,
    carrier: "Shiprocket",
  };
}

export async function createShipment(
  data: ShipmentRequest,
  carrier: string
): Promise<ShipmentResponse | null> {
  switch (carrier.toLowerCase()) {
    case "delhivery":
      return createDelhiveryShipment(data);
    case "shiprocket":
      return createShiprocketShipment(data);
    default:
      return null;
  }
}
