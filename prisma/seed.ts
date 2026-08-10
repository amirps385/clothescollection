import { PrismaClient, CouponType, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 12);
  const customerPassword = await bcrypt.hash("customer123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@izhaana.com" },
    update: {},
    create: {
      email: "admin@izhaana.com",
      passwordHash: adminPassword,
      name: "IZHAANA Admin",
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: "customer@izhaana.com" },
    update: {},
    create: {
      email: "customer@izhaana.com",
      passwordHash: customerPassword,
      name: "Demo Customer",
      role: Role.CUSTOMER,
    },
  });

  const categories = [
    { name: "Sarees", slug: "sarees", description: "Handprinted and woven sarees with traditional zari and border work" },
    { name: "Suit & Dress Materials", slug: "suit-dress-materials", description: "Unstitched cotton, chanderi silk and artificial silk dress materials with dupatta" },
    { name: "Handkerchiefs", slug: "handkerchiefs", description: "Everyday cotton handkerchiefs in floral and batik prints" },
    { name: "Personal Care", slug: "personal-care", description: "Sustainable bamboo and natural personal care essentials" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  const sarees = await prisma.category.findUnique({ where: { slug: "sarees" } });
  const suitMaterials = await prisma.category.findUnique({ where: { slug: "suit-dress-materials" } });
  const handkerchiefs = await prisma.category.findUnique({ where: { slug: "handkerchiefs" } });
  const personalCare = await prisma.category.findUnique({ where: { slug: "personal-care" } });

  const categoryById = {
    sarees: sarees!.id,
    suits: suitMaterials!.id,
    handkerchiefs: handkerchiefs!.id,
    care: personalCare!.id,
  };

  // Real catalog pulled from the client's Amazon.in storefront (seller A235HF6Y4RKSOX).
  // img = Amazon image id (rendered at https://m.media-amazon.com/images/I/<img>._AC_SL1200_.jpg)
  const rawProducts = [
    { asin: "B0HDFPLGFS", img: "71YVGdP5tnL", name: "Floral Print Square Handkerchiefs – Set of 12", description: "13 x 13 inch breathable cotton handkerchiefs in an assorted multi-colour floral print. Soft everyday essentials, sold as a set of 12.", price: 349, mrp: 799, category: "handkerchiefs", size: "Set of 12", color: "Multi-Colour", featured: true },
    { asin: "B0HB5LX6CQ", img: "71hZ+y+45FL", name: "Batik Print Handkerchiefs – Pack of 6", description: "Floral batik design cotton handkerchiefs in an assorted multicolour set, ideal for everyday use.", price: 199, mrp: 499, category: "handkerchiefs", size: "Pack of 6", color: "Multicolour" },

    { asin: "B0HC78SJXK", img: "71+F870UYcL", name: "Eco-Friendly Bamboo Toothbrush & Neem Comb Care Kit", description: "Sustainable personal care kit: four bamboo toothbrushes, one neem wood comb, one natural loofah and bamboo ear buds (75 pcs).", price: 299, mrp: null, category: "care", size: "Kit", color: null, featured: true },

    { asin: "B0HCNTYLBZ", img: "71+UGxRY7lL", name: "Handprinted Silk Blend Saree – Golden Zari Border", description: "Hand-printed silk blend saree with a golden zari weave border and traditional motifs.", price: 1599, mrp: 7999, category: "sarees", size: "Free Size", color: "Maroon", featured: true },
    { asin: "B0HCP3CCGL", img: "71+vSNi-MoL", name: "Handprinted Silk Blend Saree – Banarasi Border Pallu", description: "Hand-printed silk blend saree with a banarasi weave border pallu and traditional motifs.", price: 1599, mrp: 6999, category: "sarees", size: "Free Size", color: "Maroon" },
    { asin: "B0HCNZ25YM", img: "61egdbDVgnL", name: "Handprinted Silk Blend Saree – Zari Border Pallu", description: "Hand-printed silk blend saree with a zari weave border pallu and traditional motifs.", price: 1599, mrp: 6999, category: "sarees", size: "Free Size", color: "Maroon" },
    { asin: "B0HCNVDPKL", img: "81MCGGHwozL", name: "Handprinted Silk Blend Saree – Banarasi Border (6.5m)", description: "Hand-printed silk blend saree, 6.5m length, with a banarasi weave border and traditional motifs.", price: 1599, mrp: 6999, category: "sarees", size: "6.5m", color: "Maroon" },

    { asin: "B0HCJ5XBVT", img: "71-r78IdT2L", name: "Jam Cotton Unstitched Suit Material – Black, Red & Cream (Design 1)", description: "3-piece jam cotton dress material with printed dupatta, bandhani print design and floral embroidery detail.", price: 999, mrp: 4999, category: "suits", size: "Free Size", color: "Black/Red/Cream", featured: true },
    { asin: "B0HCJ4THKY", img: "8103P1WKi3L", name: "Jam Cotton Unstitched Suit Material – Black, Red & Cream (Design 2)", description: "3-piece jam cotton dress material with printed dupatta, bandhani print design and floral embroidery detail.", price: 999, mrp: 4999, category: "suits", size: "Free Size", color: "Black/Red/Cream" },
    { asin: "B0HCHRYC8M", img: "81zZA05+CWL", name: "Jam Cotton Unstitched Suit Material – Black, Red & Cream (Design 3)", description: "3-piece jam cotton dress material with printed dupatta, bandhani print design and floral embroidery detail.", price: 999, mrp: 4999, category: "suits", size: "Free Size", color: "Black/Red/Cream" },
    { asin: "B0HCCWY36G", img: "91TRwdhHKRL", name: "Pure Cotton Unstitched Dress Material – Block Print (Design 1)", description: "100% pure cotton 3-piece dress material with floral & geometric block print and a paisley printed bottom.", price: 999, mrp: 3999, category: "suits", size: "Free Size", color: "Floral/Geometric" },
    { asin: "B0HCCSJTYJ", img: "915LNkk1z3L", name: "Pure Cotton Unstitched Dress Material – Block Print (Design 2)", description: "100% pure cotton 3-piece dress material with floral & geometric block print and a paisley printed bottom.", price: 999, mrp: 3999, category: "suits", size: "Free Size", color: "Floral/Geometric" },
    { asin: "B0HCCPHPJ8", img: "81hcFl+JmKL", name: "Pure Cotton Unstitched Dress Material – Block Print (Design 3)", description: "100% pure cotton 3-piece dress material with floral & geometric block print and a paisley printed bottom.", price: 999, mrp: 3999, category: "suits", size: "Free Size", color: "Floral/Geometric" },
    { asin: "B0HCCL6ZF6", img: "81n5P7PnwBL", name: "Pure Cotton Unstitched Dress Material – Block Print (Design 4)", description: "100% pure cotton 3-piece dress material with floral & geometric block print and a paisley printed bottom.", price: 999, mrp: 3999, category: "suits", size: "Free Size", color: "Floral/Geometric" },
    { asin: "B0HCCS1CXF", img: "81b0KDPxntL", name: "Handmade Pure Cotton Suit – Pink & Mustard Block Print", description: "Handmade unstitched pure cotton 3-piece suit with a cotton organdy woven dupatta, floral block print in pink & mustard motifs.", price: 1499, mrp: 4999, category: "suits", size: "Free Size", color: "Pink/Mustard" },
    { asin: "B0HCCN4SCW", img: "81xjhikmSCL", name: "Artificial Silk Shimmer Dress Material – Rust Orange (Design 1)", description: "Unstitched artificial silk shimmer 3-piece dress material, hand-block printed, 2.5m each piece, paisley & floral motifs.", price: 1499, mrp: 5999, category: "suits", size: "2.5m", color: "Rust Orange", featured: true },
    { asin: "B0HCCML1KW", img: "618RIo-wnYL", name: "Artificial Silk Shimmer Dress Material – Rust Orange (Design 2)", description: "Unstitched artificial silk shimmer 3-piece dress material, hand-block printed, 2.5m each piece, paisley & floral motifs.", price: 1499, mrp: 5999, category: "suits", size: "2.5m", color: "Rust Orange" },
    { asin: "B0HCCKJKJM", img: "81xCcz8GzYL", name: "Artificial Silk Shimmer Dress Material – Rust Orange (Design 3)", description: "Unstitched artificial silk shimmer 3-piece dress material, hand-block printed, 2.5m each piece, paisley & floral motifs.", price: 1499, mrp: 5999, category: "suits", size: "2.5m", color: "Rust Orange" },
    { asin: "B0HC84WHR2", img: "810+CQ6EYJL", name: "Jaipuri Cotton Dress Material – Pastel Peach & Green", description: "Hand-block printed Jaipuri cotton 3-piece dress material set with floral & geometric motifs, suited for summer and festive wear.", price: 1299, mrp: 3999, category: "suits", size: "Free Size", color: "Pastel Peach/Green" },
    { asin: "B0HC7MTMJN", img: "81eHMLv06BL", name: "Jaipuri Hand-Block Printed Cotton Dress Material with Dupatta", description: "Jaipuri hand-block printed cotton dress material with a coordinated dupatta, breathable fabric and traditional print.", price: 1399, mrp: 4999, category: "suits", size: "Free Size", color: "Floral", featured: true },
    { asin: "B0HC4B9N3N", img: "719y3vWSltL", name: "Chanderi Silk Unstitched Dress Material – Yellow & Black", description: "Pure chanderi silk 3-piece dress material, hand block printed with paisley & leaf motifs, includes dupatta.", price: 1399, mrp: 3999, category: "suits", size: "Free Size", color: "Yellow/Black" },
    { asin: "B0HB5PC971", img: "81tHdbeqv6L", name: "Batik Print Pure Cotton Dress Material – Red & White Floral", description: "Unstitched batik print pure cotton 3-piece dress material with hand block print, includes dupatta and salwar.", price: 699, mrp: 1499, category: "suits", size: "Free Size", color: "Red/White" },
    { asin: "B0HB5N2PK4", img: "81aM2hlB6QL", name: "Pakistani Style Dress Material – Red Chikankari (Design 1)", description: "Unstitched Pakistani-style 3-piece dress material with floral embroidery, lawn cotton dupatta and chikankari work.", price: 1499, mrp: 2999, category: "suits", size: "Free Size", color: "Red" },
    { asin: "B0HB5F3GP8", img: "81lsMUJkg4L", name: "Pakistani Style Dress Material – Red Floral Lace (Design 2)", description: "Unstitched Pakistani-style 3-piece dress material with lawn cotton dupatta, lace embroidery and floral print.", price: 1399, mrp: 2999, category: "suits", size: "Free Size", color: "Red" },
    { asin: "B0HB5K7CZR", img: "81IFm9BPNnL", name: "Kantha Cotton Dress Material – Pink & Black", description: "Unstitched kantha cotton 3-piece dress material, block printed with floral motifs, includes dupatta and printed shalwar.", price: 999, mrp: 1999, category: "suits", size: "Free Size", color: "Pink/Black" },
    { asin: "B0H9Z6G54D", img: "811dvZXSOAL", name: "Pure Cotton Booti Print Dress Material – Maroon & White", description: "Unstitched pure cotton 3-piece dress material with a floral booti print in maroon and white.", price: 999, mrp: 1999, category: "suits", size: "Free Size", color: "Maroon/White" },
    { asin: "B0H9Z16QCZ", img: "81OUyoYqGfL", name: "Pink Cotton Salwar Suit Material – Zari Border Block Print", description: "Unstitched pink cotton salwar suit material with dupatta, hand block print, paisley motifs and a zari border.", price: 1499, mrp: 3500, category: "suits", size: "Free Size", color: "Pink", featured: true },
    { asin: "B0H9YN7KL5", img: "81Yxb9pfw9L", name: "Chanderi Silk Cotton Suit – Teal & Green Hand Block Print", description: "Unstitched chanderi silk cotton 3-piece suit, hand block printed with traditional motifs, includes dupatta.", price: 1399, mrp: 3999, category: "suits", size: "Free Size", color: "Teal/Green", featured: true },
    { asin: "B0H9YB66J7", img: "61FFkaYQBrL", name: "Cotton Suit with Banarasi Dupatta – Red", description: "Unstitched cotton suit with a banarasi weave dupatta, block print design, suited for festive occasions.", price: 999, mrp: 1999, category: "suits", size: "Free Size", color: "Red" },
    { asin: "B0H9TF2YQ1", img: "81jWUEwG8aL", name: "Pure Cotton Paisley Print Dress Material – Green & Maroon", description: "Unstitched pure cotton 3-piece dress material (kurta, bottom & dupatta) with a traditional paisley block print.", price: 999, mrp: 1999, category: "suits", size: "Free Size", color: "Green/Maroon" },
  ];

  const gstRateFor = (price: number) => (price > 1000 ? 12 : 5);

  const slugify = (name: string) =>
    name
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  for (const item of rawProducts) {
    await prisma.product.upsert({
      where: { slug: slugify(item.name) },
      update: {},
      create: {
        name: item.name,
        slug: slugify(item.name),
        description: item.description,
        price: item.price,
        compareAt: item.mrp ?? undefined,
        images: JSON.stringify([`https://m.media-amazon.com/images/I/${item.img}._AC_SL1200_.jpg`]),
        categoryId: categoryById[item.category as keyof typeof categoryById],
        featured: item.featured ?? false,
        gstRate: gstRateFor(item.price),
        variants: {
          create: [
            { sku: `AMZ-${item.asin}`, size: item.size, color: item.color ?? undefined, stock: 25 },
          ],
        },
      },
    });
  }

  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      type: CouponType.PERCENTAGE,
      value: 10,
      minOrderAmount: 1000,
      maxDiscount: 500,
      usageLimit: 1000,
      active: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: "IZHAANA500" },
    update: {},
    create: {
      code: "IZHAANA500",
      type: CouponType.FIXED,
      value: 500,
      minOrderAmount: 3000,
      usageLimit: 500,
      active: true,
    },
  });

  const existingZone = await prisma.shippingZone.findFirst({
    where: { name: "India" },
  });

  const zone =
    existingZone ??
    (await prisma.shippingZone.create({
      data: {
        name: "India",
        countries: JSON.stringify(["IN"]),
        rates: {
          create: [
            {
              name: "Standard Shipping",
              price: 99,
              estimatedDays: "5-7 business days",
              carrier: "India Post",
            },
            {
              name: "Express Shipping",
              price: 199,
              estimatedDays: "2-3 business days",
              carrier: "Delhivery",
            },
            {
              name: "Premium Delivery",
              price: 349,
              estimatedDays: "1-2 business days",
              carrier: "BlueDart",
            },
          ],
        },
      },
    }));

  console.log("Seed completed:", { admin: admin.email, zone: zone.name });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
