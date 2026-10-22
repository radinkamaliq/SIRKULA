/**
 * SIRKULA Seed Script
 *
 * Populates the database with clearly-labeled DEMO data for evaluation/demo
 * purposes. All sample accounts and listings are marked as sample data so they
 * are never mistaken for real user activity.
 *
 * Usage (after `prisma migrate deploy`):
 *   node prisma/seed.js
 *
 * Safe to re-run: it clears core tables before inserting sample records.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;

// Clearly labeled sample accounts. Password for every sample account: "Password123!"
const SAMPLE_PASSWORD = 'Password123!';

async function main() {
  console.log('🌱 Seeding SIRKULA database (sample/demo data)...');

  // Clear existing core tables (order matters due to FK constraints)
  await prisma.auditLog.deleteMany();
  await prisma.distributionRecord.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.report.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.foodListing.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleared existing records.');

  // Hash password once
  const passwordHash = await bcrypt.hash(SAMPLE_PASSWORD, SALT_ROUNDS);

  // --- Users ---
  const admin = await prisma.user.create({
    data: {
      email: 'admin@sirkula.demo',
      password: passwordHash,
      name: 'SIRKULA Admin',
      phone: '+62 800-1234-5678',
      address: 'SIRKULA Headquarters, Indonesia',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  const seller1 = await prisma.user.create({
    data: {
      email: 'seller.bakery@sirkula.demo',
      password: passwordHash,
      name: 'Bakery Surya',
      phone: '+62 812-3456-7890',
      address: 'Jl. Merdeka No. 10, Central City',
      role: 'SELLER',
      status: 'ACTIVE',
    },
  });

  const seller2 = await prisma.user.create({
    data: {
      email: 'seller.grocery@sirkula.demo',
      password: passwordHash,
      name: 'Warung Makmur',
      phone: '+62 813-4567-8901',
      address: 'Jl. Sudirman No. 25, Central City',
      role: 'SELLER',
      status: 'ACTIVE',
    },
  });

  const seller3 = await prisma.user.create({
    data: {
      email: 'seller.restaurant@sirkula.demo',
      password: passwordHash,
      name: 'Rumah Makan Sederhana',
      phone: '+62 814-5678-9012',
      address: 'Jl. Gajah Mada No. 7, Central City',
      role: 'SELLER',
      status: 'ACTIVE',
    },
  });

  const receiver1 = await prisma.user.create({
    data: {
      email: 'receiver.andi@sirkula.demo',
      password: passwordHash,
      name: 'Andi Wijaya',
      phone: '+62 821-1111-2222',
      address: 'Perumahan Asri Blok A No. 5',
      role: 'RECEIVER',
      status: 'ACTIVE',
    },
  });

  const receiver2 = await prisma.user.create({
    data: {
      email: 'receiver.siti@sirkula.demo',
      password: passwordHash,
      name: 'Siti Rahayu',
      phone: '+62 822-2222-3333',
      address: 'Jl. Melati No. 12',
      role: 'RECEIVER',
      status: 'ACTIVE',
    },
  });

  // A suspended account to demonstrate admin moderation
  const suspendedSeller = await prisma.user.create({
    data: {
      email: 'seller.suspended@sirkula.demo',
      password: passwordHash,
      name: 'Toko Tidak Aktif',
      phone: '+62 899-9999-9999',
      address: 'Jl. Contoh No. 1',
      role: 'SELLER',
      status: 'SUSPENDED',
    },
  });

  console.log('👥 Created users.');

  // --- Listings (sample) ---
  const now = new Date();
  const addDays = (d, days) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);

  const listings = [
    {
      title: 'Fresh Baguettes – End of Day',
      description: 'Freshly baked baguettes from today\'s batch. Safe to consume. Best enjoyed today.',
      category: 'Bakery',
      quantity: 12,
      unit: 'pieces',
      condition: 'Fresh',
      price: 0,
      currency: 'IDR',
      sellerId: seller1.id,
      pickupLocation: 'Jl. Merdeka No. 10, Central City (Front counter)',
      pickupLat: -7.2575,
      pickupLng: 112.7521,
      pickupDeadline: addDays(now, 1),
      images: ['/uploads/sample-baguettes.jpg'],
      status: 'AVAILABLE',
    },
    {
      title: 'Organic Vegetables Surplus',
      description: 'Mixed organic vegetables (carrots, spinach, tomatoes) harvested today. Slight cosmetic imperfections only.',
      category: 'Produce',
      quantity: 15,
      unit: 'kg',
      condition: 'Fresh',
      price: 0,
      currency: 'IDR',
      sellerId: seller2.id,
      pickupLocation: 'Jl. Sudirman No. 25, Central City',
      pickupLat: -7.2600,
      pickupLng: 112.7400,
      pickupDeadline: addDays(now, 2),
      images: ['/uploads/sample-vegetables.jpg'],
      status: 'AVAILABLE',
    },
    {
      title: 'Packaged Rice Meals',
      description: 'Sealed ready-to-eat rice meals with chicken. Produced today, expiry in 2 days.',
      category: 'Prepared Food',
      quantity: 20,
      unit: 'packs',
      condition: 'Packaged',
      price: 15000,
      currency: 'IDR',
      sellerId: seller3.id,
      pickupLocation: 'Jl. Gajah Mada No. 7, Central City',
      pickupLat: -7.2550,
      pickupLng: 112.7600,
      pickupDeadline: addDays(now, 2),
      images: ['/uploads/sample-rice.jpg'],
      status: 'AVAILABLE',
    },
    {
      title: 'Day-Old Pastries',
      description: 'Assorted pastries from yesterday. Still safe to eat, best reheated.',
      category: 'Bakery',
      quantity: 25,
      unit: 'pieces',
      condition: 'Near-expiry',
      price: 5000,
      currency: 'IDR',
      sellerId: seller1.id,
      pickupLocation: 'Jl. Merdeka No. 10, Central City',
      pickupLat: -7.2575,
      pickupLng: 112.7521,
      pickupDeadline: addDays(now, 0),
      images: ['/uploads/sample-pastries.jpg'],
      status: 'AVAILABLE',
    },
    {
      title: 'Canned Goods Donation',
      description: 'Sealed canned fish and vegetables. Long shelf life. Suitable for food banks.',
      category: 'Pantry',
      quantity: 30,
      unit: 'cans',
      condition: 'Packaged',
      price: 0,
      currency: 'IDR',
      sellerId: seller2.id,
      pickupLocation: 'Jl. Sudirman No. 25, Central City',
      pickupLat: -7.2600,
      pickupLng: 112.7400,
      pickupDeadline: addDays(now, 7),
      images: ['/uploads/sample-canned.jpg'],
      status: 'AVAILABLE',
    },
    // Expired listing (should be flagged) - in the past
    {
      title: 'Expired Dairy Sample (DO NOT RESERVE)',
      description: 'This listing is intentionally expired to demonstrate expiration handling.',
      category: 'Dairy',
      quantity: 5,
      unit: 'liters',
      condition: 'Fresh',
      price: 0,
      currency: 'IDR',
      sellerId: seller3.id,
      pickupLocation: 'Jl. Gajah Mada No. 7, Central City',
      pickupLat: -7.2550,
      pickupLng: 112.7600,
      pickupDeadline: addDays(now, -2), // already expired
      images: [],
      status: 'EXPIRED',
    },
  ];

  const createdListings = [];
  for (const l of listings) {
    // availableQuantity mirrors the total quantity at creation time; it is then
    // decremented below for every approved/completed reservation.
    createdListings.push(
      await prisma.foodListing.create({ data: { ...l, availableQuantity: l.quantity } })
    );
  }
  console.log('📦 Created listings.');

  // --- Reservations (sample) ---
  const res1 = await prisma.reservation.create({
    data: {
      quantity: 2,
      status: 'PENDING',
      notes: 'Please pack separately.',
      listingId: createdListings[0].id,
      receiverId: receiver1.id,
    },
  });

  const res2 = await prisma.reservation.create({
    data: {
      quantity: 5,
      status: 'APPROVED',
      notes: 'Approved for pickup tomorrow morning.',
      pickupInstructions: 'Pick up at front counter between 08:00 and 10:00.',
      listingId: createdListings[1].id,
      receiverId: receiver2.id,
    },
  });

  const res3 = await prisma.reservation.create({
    data: {
      quantity: 3,
      status: 'COMPLETED',
      notes: 'Picked up successfully.',
      pickupInstructions: 'Collected at agreed time.',
      listingId: createdListings[2].id,
      receiverId: receiver1.id,
    },
  });

  const res4 = await prisma.reservation.create({
    data: {
      quantity: 1,
      status: 'REJECTED',
      notes: 'Insufficient quantity remaining.',
      listingId: createdListings[3].id,
      receiverId: receiver2.id,
    },
  });

  const res5 = await prisma.reservation.create({
    data: {
      quantity: 1,
      status: 'CANCELLED',
      notes: 'Receiver cancelled before approval.',
      listingId: createdListings[4].id,
      receiverId: receiver1.id,
    },
  });

  console.log('📋 Created reservations.');

  // --- Keep available inventory consistent with the seeded reservations ---
  // Every APPROVED or COMPLETED reservation has already consumed stock.
  const consumed = await prisma.reservation.groupBy({
    by: ['listingId'],
    where: { status: { in: ['APPROVED', 'COMPLETED'] } },
    _sum: { quantity: true },
  });
  for (const row of consumed) {
    const listing = createdListings.find((l) => l.id === row.listingId);
    if (!listing) continue;
    const remaining = Number(listing.quantity) - Number(row._sum.quantity || 0);
    await prisma.foodListing.update({
      where: { id: listing.id },
      data: { availableQuantity: remaining < 0 ? 0 : remaining },
    });
  }

  // --- Distribution records for completed reservation ---
  await prisma.distributionRecord.create({
    data: {
      quantityDistributed: 3,
      notes: 'Full quantity handed over.',
      reservationId: res3.id,
    },
  });

  // --- Notifications (sample) ---
  await prisma.notification.create({
    data: {
      title: 'New Reservation Request',
      message: 'Bakery Surya requested 2 pieces of "Fresh Baguettes – End of Day".',
      type: 'RESERVATION_REQUEST',
      read: false,
      userId: seller1.id,
      listingId: createdListings[0].id,
      reservationId: res1.id,
    },
  });
  await prisma.notification.create({
    data: {
      title: 'Reservation Approved',
      message: 'Your request for "Organic Vegetables Surplus" (5 kg) was approved.',
      type: 'RESERVATION_APPROVED',
      read: true,
      userId: receiver2.id,
      listingId: createdListings[1].id,
      reservationId: res2.id,
    },
  });
  await prisma.notification.create({
    data: {
      title: 'Reservation Rejected',
      message: 'Your request for "Day-Old Pastries" was rejected.',
      type: 'RESERVATION_REJECTED',
      read: false,
      userId: receiver2.id,
      listingId: createdListings[3].id,
      reservationId: res4.id,
    },
  });

  console.log('🔔 Created notifications.');

  // --- Reports (sample) ---
  await prisma.report.create({
    data: {
      reason: 'misleading_description',
      description: 'Listing image does not match the actual food condition.',
      status: 'PENDING',
      listingId: createdListings[0].id,
      reporterId: receiver1.id,
    },
  });

  console.log('📝 Created reports.');

  // --- Audit logs (sample) ---
  await prisma.auditLog.create({
    data: {
      action: 'USER_SUSPENDED',
      targetType: 'User',
      targetId: suspendedSeller.id,
      details: 'Account suspended due to repeated unsafe listings.',
      adminId: admin.id,
    },
  });

  console.log('📜 Created audit logs.');
  console.log('✅ Seed complete.');
  console.log('');
  console.log('Sample accounts (password for all: Password123!):');
  console.log(`  ADMIN:    ${admin.email}`);
  console.log(`  SELLER:   ${seller1.email}, ${seller2.email}, ${seller3.email}`);
  console.log(`  RECEIVER: ${receiver1.email}, ${receiver2.email}`);
  console.log(`  SUSPENDED: ${suspendedSeller.email}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
