import { PrismaClient, PlanTier, CarStatus, FuelType, DepreciationMethod,
  CostCategory, EarningSource, DriverStatus, CompensationType,
  BookingStatus, DocumentType, SettlementStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { addMonths, subMonths, startOfMonth, addDays } from "date-fns";

const prisma = new PrismaClient();

const DEMO_EMAIL = "admin@demo.com";
const DEMO_PASSWORD = "Demo@1234";
const ORG_NAME = "Hyderabad Travels";

async function main() {
  console.log("🌱 Seeding database...");

  // ── Clean up ────────────────────────────────────────────────────────────────
  await prisma.notification.deleteMany();
  await prisma.document.deleteMany();
  await prisma.driverSettlement.deleteMany();
  await prisma.driverAdvance.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.earning.deleteMany();
  await prisma.cost.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.odometerLog.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.car.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.orgMember.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organisation.deleteMany();

  // ── Organisation ────────────────────────────────────────────────────────────
  const org = await prisma.organisation.create({
    data: {
      name: ORG_NAME,
      phone: "9876543210",
      email: "info@hyderabadtravels.in",
      address: "Banjara Hills, Hyderabad, Telangana 500034",
      gstin: "36AAACH1001C1Z6",
      plan: PlanTier.GROWTH,
      planExpiry: addMonths(new Date(), 12),
    },
  });

  // ── Admin User ───────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const adminUser = await prisma.user.create({
    data: {
      name: "Arjun Reddy",
      email: DEMO_EMAIL,
      passwordHash,
      phone: "9876543210",
      isVerified: true,
    },
  });

  await prisma.orgMember.create({
    data: { orgId: org.id, userId: adminUser.id, role: "OWNER" },
  });

  // ── Extra member ────────────────────────────────────────────────────────────
  const managerUser = await prisma.user.create({
    data: {
      name: "Ravi Kumar",
      email: "manager@demo.com",
      passwordHash,
      phone: "9876543211",
      isVerified: true,
    },
  });
  await prisma.orgMember.create({
    data: { orgId: org.id, userId: managerUser.id, role: "MANAGER" },
  });

  // ── Cars (8 vehicles) ────────────────────────────────────────────────────────
  const carData = [
    { reg: "TS 09 AB 1234", make: "Toyota", model: "Innova Crysta", year: 2021, fuel: FuelType.DIESEL, price: 2200000_00n, odometer: 85000 },
    { reg: "TS 09 CD 5678", make: "Toyota", model: "Innova Crysta", year: 2022, fuel: FuelType.DIESEL, price: 2350000_00n, odometer: 62000 },
    { reg: "TS 09 EF 9012", make: "Maruti", model: "Ertiga", year: 2022, fuel: FuelType.CNG, price: 1050000_00n, odometer: 71000 },
    { reg: "TS 09 GH 3456", make: "Mahindra", model: "Scorpio N", year: 2023, fuel: FuelType.DIESEL, price: 1800000_00n, odometer: 38000 },
    { reg: "TS 09 IJ 7890", make: "Force", model: "Urbania", year: 2022, fuel: FuelType.DIESEL, price: 2800000_00n, odometer: 95000 },
    { reg: "TS 09 KL 2345", make: "Toyota", model: "Fortuner", year: 2023, fuel: FuelType.DIESEL, price: 3800000_00n, odometer: 22000 },
    { reg: "TS 09 MN 6789", make: "Maruti", model: "Swift Dzire", year: 2021, fuel: FuelType.PETROL, price: 750000_00n, odometer: 110000 },
    { reg: "TS 09 OP 0123", make: "Hyundai", model: "Aura", year: 2022, fuel: FuelType.CNG, price: 850000_00n, odometer: 67000 },
  ];

  const cars = await Promise.all(
    carData.map((c) =>
      prisma.car.create({
        data: {
          orgId: org.id,
          registrationNumber: c.reg,
          make: c.make,
          model: c.model,
          year: c.year,
          fuelType: c.fuel,
          status: CarStatus.ACTIVE,
          purchasePricePaise: c.price,
          purchaseDate: new Date(c.year, 3, 15),
          depreciationMethod: DepreciationMethod.STRAIGHT_LINE,
          depreciationRate: 20,
          currentOdometer: c.odometer,
          seatingCapacity: c.make === "Force" ? 17 : c.model.includes("Innova") ? 7 : c.model === "Scorpio N" ? 7 : c.model === "Fortuner" ? 7 : 5,
        },
      })
    )
  );

  // ── Drivers (5) ──────────────────────────────────────────────────────────────
  const driverData = [
    { name: "Mohammed Rafiq", phone: "9100000001", license: "TS0120200012345", carIndex: 0, comp: CompensationType.PERCENTAGE, pct: 10 },
    { name: "Suresh Babu", phone: "9100000002", license: "TS0120190098765", carIndex: 1, comp: CompensationType.FIXED, fixed: 18000_00n },
    { name: "Ramesh Naidu", phone: "9100000003", license: "TS0120210056789", carIndex: 2, comp: CompensationType.HYBRID, fixed: 12000_00n, pct: 8, threshold: 60000_00n },
    { name: "Kishore Rao", phone: "9100000004", license: "TS0120180034567", carIndex: 4, comp: CompensationType.PERCENTAGE, pct: 12 },
    { name: "Venkat Reddy", phone: "9100000005", license: "TS0120220078901", carIndex: 5, comp: CompensationType.FIXED, fixed: 25000_00n },
  ];

  const drivers = await Promise.all(
    driverData.map((d) =>
      prisma.driver.create({
        data: {
          orgId: org.id,
          assignedCarId: cars[d.carIndex].id,
          name: d.name,
          phone: d.phone,
          licenseNumber: d.license,
          licenseExpiry: addMonths(new Date(), d.carIndex % 2 === 0 ? 8 : 14),
          joiningDate: subMonths(new Date(), 18),
          status: DriverStatus.ACTIVE,
          compensationType: d.comp,
          fixedSalaryPaise: d.fixed ?? null,
          percentageRate: d.pct ?? null,
          thresholdPaise: d.threshold ?? null,
        },
      })
    )
  );

  // ── Customers ────────────────────────────────────────────────────────────────
  const customers = await Promise.all([
    prisma.customer.create({ data: { orgId: org.id, name: "TCS Hyderabad", phone: "9200000001", email: "travel@tcs.com", gstin: "36AAACT0001A1Z1" } }),
    prisma.customer.create({ data: { orgId: org.id, name: "Infosys Ltd", phone: "9200000002", email: "events@infosys.com" } }),
    prisma.customer.create({ data: { orgId: org.id, name: "Sunita Sharma", phone: "9200000003" } }),
    prisma.customer.create({ data: { orgId: org.id, name: "DLF Weddings", phone: "9200000004" } }),
    prisma.customer.create({ data: { orgId: org.id, name: "Kavya Nair", phone: "9200000005" } }),
  ]);

  // ── 6 months of costs & earnings ─────────────────────────────────────────────
  const now = new Date();

  for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
    const monthStart = startOfMonth(subMonths(now, monthOffset));

    for (const car of cars) {
      // Monthly earnings: 8–14 trips
      const tripCount = 8 + Math.floor(Math.random() * 7);
      for (let t = 0; t < tripCount; t++) {
        const tripDate = addDays(monthStart, Math.floor(Math.random() * 28));
        const amount = (15000 + Math.floor(Math.random() * 25000)) * 100; // ₹150–₹400
        await prisma.earning.create({
          data: {
            orgId: org.id,
            carId: car.id,
            source: EarningSource.BOOKING,
            amountPaise: BigInt(amount),
            date: tripDate,
            customerId: customers[Math.floor(Math.random() * customers.length)].id,
            tripKm: 120 + Math.random() * 300,
          },
        });
      }

      // Monthly fuel cost
      await prisma.cost.create({
        data: {
          orgId: org.id,
          carId: car.id,
          category: CostCategory.FUEL,
          amountPaise: BigInt((12000 + Math.floor(Math.random() * 8000)) * 100),
          date: addDays(monthStart, 1),
          description: "Monthly fuel",
        },
      });

      // Monthly maintenance (50% chance)
      if (Math.random() > 0.5) {
        await prisma.cost.create({
          data: {
            orgId: org.id,
            carId: car.id,
            category: CostCategory.MAINTENANCE,
            amountPaise: BigInt((2000 + Math.floor(Math.random() * 8000)) * 100),
            date: addDays(monthStart, 8),
            description: "Service / repairs",
          },
        });
      }

      // EMI (first 5 cars)
      if (cars.indexOf(car) < 5) {
        await prisma.cost.create({
          data: {
            orgId: org.id,
            carId: car.id,
            category: CostCategory.EMI,
            amountPaise: BigInt(25000 * 100),
            date: addDays(monthStart, 5),
            isRecurring: true,
            recurringDay: 5,
            description: "Car loan EMI",
          },
        });
      }

      // Toll (every month)
      await prisma.cost.create({
        data: {
          orgId: org.id,
          carId: car.id,
          category: CostCategory.TOLL,
          amountPaise: BigInt((1500 + Math.floor(Math.random() * 1500)) * 100),
          date: addDays(monthStart, 15),
          description: "FASTag toll charges",
        },
      });
    }
  }

  // ── Insurance & Permit documents ─────────────────────────────────────────────
  for (const car of cars) {
    await prisma.document.create({
      data: {
        orgId: org.id,
        carId: car.id,
        type: DocumentType.INSURANCE,
        expiryDate: addMonths(new Date(), 1 + Math.floor(Math.random() * 10)),
      },
    });
    await prisma.document.create({
      data: {
        orgId: org.id,
        carId: car.id,
        type: DocumentType.PERMIT,
        expiryDate: addMonths(new Date(), 3 + Math.floor(Math.random() * 8)),
      },
    });
    await prisma.document.create({
      data: {
        orgId: org.id,
        carId: car.id,
        type: DocumentType.PUC,
        expiryDate: addMonths(new Date(), Math.floor(Math.random() * 3) - 1), // some expired
      },
    });
  }

  // ── Driver license docs ──────────────────────────────────────────────────────
  for (const driver of drivers) {
    await prisma.document.create({
      data: {
        orgId: org.id,
        driverId: driver.id,
        type: DocumentType.DRIVER_LICENSE,
        expiryDate: driver.licenseExpiry,
      },
    });
  }

  // ── Sample bookings ─────────────────────────────────────────────────────────
  const bookings = await Promise.all([
    prisma.booking.create({
      data: {
        orgId: org.id,
        carId: cars[0].id,
        driverId: drivers[0].id,
        customerId: customers[0].id,
        status: BookingStatus.CONFIRMED,
        pickupLocation: "Hyderabad Airport",
        dropLocation: "TCS Whitefield Bengaluru",
        startDate: addDays(now, 2),
        endDate: addDays(now, 2),
        estimatedKm: 570,
        quotedAmountPaise: 18000_00n,
        advancePaidPaise: 9000_00n,
      },
    }),
    prisma.booking.create({
      data: {
        orgId: org.id,
        carId: cars[5].id,
        driverId: drivers[4].id,
        customerId: customers[3].id,
        status: BookingStatus.IN_PROGRESS,
        pickupLocation: "DLF Hitech City",
        dropLocation: "Tirupati",
        startDate: addDays(now, -1),
        endDate: addDays(now, 1),
        estimatedKm: 600,
        quotedAmountPaise: 35000_00n,
        advancePaidPaise: 17500_00n,
      },
    }),
    prisma.booking.create({
      data: {
        orgId: org.id,
        carId: cars[2].id,
        status: BookingStatus.INQUIRY,
        pickupLocation: "Secunderabad Station",
        dropLocation: "Warangal",
        startDate: addDays(now, 5),
        quotedAmountPaise: 8000_00n,
        advancePaidPaise: 0n,
        customerName: "Walk-in Customer",
        customerPhone: "9300000099",
      },
    }),
  ]);

  // ── Upcoming notification ─────────────────────────────────────────────────────
  await prisma.notification.create({
    data: {
      orgId: org.id,
      type: "DOCUMENT_EXPIRY",
      title: "PUC Expiring Soon",
      body: `PUC certificate for ${cars[0].registrationNumber} is expiring within 7 days.`,
      entityId: cars[0].id,
    },
  });

  console.log("✅ Seed complete!");
  console.log(`   Org: ${ORG_NAME}`);
  console.log(`   Login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  console.log(`   Cars: ${cars.length} | Drivers: ${drivers.length} | Customers: ${customers.length}`);
  console.log(`   Bookings: ${bookings.length}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
