-- CreateEnum
CREATE TYPE "TeamRole" AS ENUM ('OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'VIEWER');

-- CreateEnum
CREATE TYPE "TourStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DayType" AS ENUM ('SHOW', 'TRAVEL', 'OFF', 'REHEARSAL', 'PRESS', 'LOAD_IN', 'FESTIVAL', 'OTHER');

-- CreateEnum
CREATE TYPE "ScheduleItemType" AS ENUM ('LOAD_IN', 'SOUNDCHECK', 'DOORS', 'SUPPORT_SET', 'SET_TIME', 'CHANGEOVER', 'CURFEW', 'MEET_AND_GREET', 'CATERING', 'PRESS', 'INTERVIEW', 'REHEARSAL', 'TRAVEL_DEPART', 'TRAVEL_ARRIVE', 'HOTEL_CHECK_IN', 'HOTEL_CHECK_OUT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "DealType" AS ENUM ('GUARANTEE', 'PERCENTAGE', 'GUARANTEE_PLUS', 'FLAT_PLUS_BONUS', 'DOOR_DEAL', 'BUYOUT', 'FREE');

-- CreateEnum
CREATE TYPE "TravelMode" AS ENUM ('BUS', 'FLY', 'DRIVE', 'TRAIN', 'FERRY', 'OTHER');

-- CreateEnum
CREATE TYPE "ContactCategory" AS ENUM ('PROMOTER', 'AGENT', 'VENUE_STAFF', 'PRODUCTION', 'CATERING', 'SECURITY', 'TRANSPORT', 'ACCOMMODATION', 'MANAGEMENT', 'LABEL', 'PR', 'MERCH', 'OTHER');

-- CreateEnum
CREATE TYPE "CrewRole" AS ENUM ('TOUR_MANAGER', 'PRODUCTION_MANAGER', 'STAGE_MANAGER', 'FOH_ENGINEER', 'MONITOR_ENGINEER', 'LIGHTING_DESIGNER', 'LIGHTING_TECH', 'BACKLINE_TECH', 'DRUM_TECH', 'GUITAR_TECH', 'BASS_TECH', 'KEYS_TECH', 'RIGGER', 'CARPENTER', 'VIDEO_DIRECTOR', 'VIDEO_TECH', 'MERCH_MANAGER', 'TOUR_ACCOUNTANT', 'SECURITY', 'WARDROBE', 'HAIR_MAKEUP', 'CATERING', 'BUS_DRIVER', 'TRUCK_DRIVER', 'ARTIST', 'MUSICIAN', 'DANCER', 'PHOTOGRAPHER', 'OTHER');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('TRAVEL', 'ACCOMMODATION', 'CATERING', 'EQUIPMENT', 'VEHICLE', 'FUEL', 'TOLLS', 'PARKING', 'COMMUNICATION', 'PER_DIEM', 'PRODUCTION', 'MERCH', 'INSURANCE', 'VISA', 'MISCELLANEOUS', 'OTHER');

-- CreateEnum
CREATE TYPE "GuestListStatus" AS ENUM ('PENDING', 'APPROVED', 'DENIED', 'CHECKED_IN');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "phone" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "role" "TeamRole" NOT NULL DEFAULT 'MEMBER',
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tours" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "artist" TEXT,
    "status" "TourStatus" NOT NULL DEFAULT 'DRAFT',
    "description" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "color" TEXT,
    "teamId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tour_days" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "dayType" "DayType" NOT NULL DEFAULT 'SHOW',
    "dayNumber" INTEGER,
    "title" TEXT,
    "notes" TEXT,
    "isConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "travelNotes" TEXT,
    "tourId" TEXT NOT NULL,
    "venueId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tour_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_items" (
    "id" TEXT NOT NULL,
    "type" "ScheduleItemType" NOT NULL DEFAULT 'CUSTOM',
    "label" TEXT NOT NULL,
    "startTime" TIME,
    "endTime" TIME,
    "duration" INTEGER,
    "notes" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "tourDayId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedule_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "show_details" (
    "id" TEXT NOT NULL,
    "dealType" "DealType" NOT NULL DEFAULT 'GUARANTEE',
    "guarantee" DECIMAL(12,2),
    "percentage" DECIMAL(5,2),
    "bonusThreshold" INTEGER,
    "bonusAmount" DECIMAL(12,2),
    "walkout" DECIMAL(12,2),
    "ticketPrice" DECIMAL(10,2),
    "capacity" INTEGER,
    "ticketsSold" INTEGER,
    "ticketsComped" INTEGER,
    "grossRevenue" DECIMAL(12,2),
    "setLength" INTEGER,
    "productionNotes" TEXT,
    "wifiNetwork" TEXT,
    "wifiPassword" TEXT,
    "parkingNotes" TEXT,
    "merchSales" DECIMAL(12,2),
    "merchCommission" DECIMAL(5,2),
    "isSettled" BOOLEAN NOT NULL DEFAULT false,
    "settlementNotes" TEXT,
    "settlementDate" TIMESTAMP(3),
    "promoterName" TEXT,
    "promoterEmail" TEXT,
    "promoterPhone" TEXT,
    "tourDayId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "show_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "show_deductions" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "isPercentage" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "showDetailsId" TEXT NOT NULL,

    CONSTRAINT "show_deductions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travel_legs" (
    "id" TEXT NOT NULL,
    "mode" "TravelMode" NOT NULL DEFAULT 'DRIVE',
    "departureCity" TEXT,
    "arrivalCity" TEXT,
    "departureTime" TIMESTAMP(3),
    "arrivalTime" TIMESTAMP(3),
    "distance" DECIMAL(10,2),
    "carrier" TEXT,
    "flightNumber" TEXT,
    "confirmationCode" TEXT,
    "notes" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "tourDayId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "travel_legs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travel_assignments" (
    "id" TEXT NOT NULL,
    "travelLegId" TEXT NOT NULL,
    "crewMemberId" TEXT NOT NULL,

    CONSTRAINT "travel_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotel_stays" (
    "id" TEXT NOT NULL,
    "hotelName" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "checkIn" TIMESTAMP(3),
    "checkOut" TIMESTAMP(3),
    "confirmationCode" TEXT,
    "notes" TEXT,
    "nightlyRate" DECIMAL(10,2),
    "tourDayId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hotel_stays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_assignments" (
    "id" TEXT NOT NULL,
    "roomNumber" TEXT,
    "roomType" TEXT,
    "hotelStayId" TEXT NOT NULL,
    "crewMemberId" TEXT NOT NULL,

    CONSTRAINT "room_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venues" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nickname" TEXT,
    "address" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'US',
    "postalCode" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "timezone" TEXT,
    "capacity" INTEGER,
    "venueType" TEXT,
    "website" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "stageWidth" DECIMAL(6,2),
    "stageDepth" DECIMAL(6,2),
    "stageHeight" DECIMAL(6,2),
    "loadInNotes" TEXT,
    "parkingNotes" TEXT,
    "powerDetails" TEXT,
    "wifiNetwork" TEXT,
    "wifiPassword" TEXT,
    "cateringNotes" TEXT,
    "dressingRooms" TEXT,
    "hospitalityNotes" TEXT,
    "notes" TEXT,
    "teamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "venues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue_contacts" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,

    CONSTRAINT "venue_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "mobile" TEXT,
    "company" TEXT,
    "jobTitle" TEXT,
    "category" "ContactCategory" NOT NULL DEFAULT 'OTHER',
    "notes" TEXT,
    "teamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tour_crew_members" (
    "id" TEXT NOT NULL,
    "role" "CrewRole" NOT NULL DEFAULT 'OTHER',
    "roleTitle" TEXT,
    "department" TEXT,
    "dailyRate" DECIMAL(10,2),
    "perDiem" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "passportNumber" TEXT,
    "passportExpiry" TIMESTAMP(3),
    "dateOfBirth" DATE,
    "nationality" TEXT,
    "dietaryNeeds" TEXT,
    "tShirtSize" TEXT,
    "allergies" TEXT,
    "emergencyName" TEXT,
    "emergencyPhone" TEXT,
    "emergencyRelation" TEXT,
    "startDate" DATE,
    "endDate" DATE,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "userId" TEXT,
    "tourId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tour_crew_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "category" "ExpenseCategory" NOT NULL DEFAULT 'OTHER',
    "date" DATE NOT NULL,
    "vendor" TEXT,
    "receiptUrl" TEXT,
    "notes" TEXT,
    "isReimbursed" BOOLEAN NOT NULL DEFAULT false,
    "tourId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "per_diem_payments" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "crewMemberId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "per_diem_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_items" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "estimated" DECIMAL(12,2) NOT NULL,
    "actual" DECIMAL(12,2),
    "notes" TEXT,
    "tourId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guest_list_items" (
    "id" TEXT NOT NULL,
    "guestName" TEXT NOT NULL,
    "plusOnes" INTEGER NOT NULL DEFAULT 0,
    "status" "GuestListStatus" NOT NULL DEFAULT 'PENDING',
    "requestedBy" TEXT,
    "notes" TEXT,
    "tourDayId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guest_list_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "day_notes" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "content" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "tourDayId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "day_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "teams_slug_key" ON "teams"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_userId_teamId_key" ON "team_members"("userId", "teamId");

-- CreateIndex
CREATE INDEX "tours_teamId_idx" ON "tours"("teamId");

-- CreateIndex
CREATE INDEX "tour_days_tourId_idx" ON "tour_days"("tourId");

-- CreateIndex
CREATE INDEX "tour_days_date_idx" ON "tour_days"("date");

-- CreateIndex
CREATE UNIQUE INDEX "tour_days_tourId_date_key" ON "tour_days"("tourId", "date");

-- CreateIndex
CREATE INDEX "schedule_items_tourDayId_idx" ON "schedule_items"("tourDayId");

-- CreateIndex
CREATE UNIQUE INDEX "show_details_tourDayId_key" ON "show_details"("tourDayId");

-- CreateIndex
CREATE INDEX "travel_legs_tourDayId_idx" ON "travel_legs"("tourDayId");

-- CreateIndex
CREATE UNIQUE INDEX "travel_assignments_travelLegId_crewMemberId_key" ON "travel_assignments"("travelLegId", "crewMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "hotel_stays_tourDayId_key" ON "hotel_stays"("tourDayId");

-- CreateIndex
CREATE UNIQUE INDEX "room_assignments_hotelStayId_crewMemberId_key" ON "room_assignments"("hotelStayId", "crewMemberId");

-- CreateIndex
CREATE INDEX "venues_teamId_idx" ON "venues"("teamId");

-- CreateIndex
CREATE INDEX "venues_city_state_idx" ON "venues"("city", "state");

-- CreateIndex
CREATE UNIQUE INDEX "venue_contacts_venueId_contactId_role_key" ON "venue_contacts"("venueId", "contactId", "role");

-- CreateIndex
CREATE INDEX "contacts_teamId_idx" ON "contacts"("teamId");

-- CreateIndex
CREATE INDEX "contacts_category_idx" ON "contacts"("category");

-- CreateIndex
CREATE INDEX "tour_crew_members_tourId_idx" ON "tour_crew_members"("tourId");

-- CreateIndex
CREATE UNIQUE INDEX "tour_crew_members_userId_tourId_key" ON "tour_crew_members"("userId", "tourId");

-- CreateIndex
CREATE INDEX "expenses_tourId_idx" ON "expenses"("tourId");

-- CreateIndex
CREATE INDEX "expenses_date_idx" ON "expenses"("date");

-- CreateIndex
CREATE INDEX "expenses_category_idx" ON "expenses"("category");

-- CreateIndex
CREATE INDEX "per_diem_payments_crewMemberId_idx" ON "per_diem_payments"("crewMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "per_diem_payments_crewMemberId_date_key" ON "per_diem_payments"("crewMemberId", "date");

-- CreateIndex
CREATE INDEX "budget_items_tourId_idx" ON "budget_items"("tourId");

-- CreateIndex
CREATE INDEX "guest_list_items_tourDayId_idx" ON "guest_list_items"("tourDayId");

-- CreateIndex
CREATE INDEX "day_notes_tourDayId_idx" ON "day_notes"("tourDayId");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tours" ADD CONSTRAINT "tours_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tours" ADD CONSTRAINT "tours_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_days" ADD CONSTRAINT "tour_days_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "tours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_days" ADD CONSTRAINT "tour_days_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_items" ADD CONSTRAINT "schedule_items_tourDayId_fkey" FOREIGN KEY ("tourDayId") REFERENCES "tour_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "show_details" ADD CONSTRAINT "show_details_tourDayId_fkey" FOREIGN KEY ("tourDayId") REFERENCES "tour_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "show_deductions" ADD CONSTRAINT "show_deductions_showDetailsId_fkey" FOREIGN KEY ("showDetailsId") REFERENCES "show_details"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_legs" ADD CONSTRAINT "travel_legs_tourDayId_fkey" FOREIGN KEY ("tourDayId") REFERENCES "tour_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_assignments" ADD CONSTRAINT "travel_assignments_travelLegId_fkey" FOREIGN KEY ("travelLegId") REFERENCES "travel_legs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_assignments" ADD CONSTRAINT "travel_assignments_crewMemberId_fkey" FOREIGN KEY ("crewMemberId") REFERENCES "tour_crew_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotel_stays" ADD CONSTRAINT "hotel_stays_tourDayId_fkey" FOREIGN KEY ("tourDayId") REFERENCES "tour_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_assignments" ADD CONSTRAINT "room_assignments_hotelStayId_fkey" FOREIGN KEY ("hotelStayId") REFERENCES "hotel_stays"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_assignments" ADD CONSTRAINT "room_assignments_crewMemberId_fkey" FOREIGN KEY ("crewMemberId") REFERENCES "tour_crew_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venues" ADD CONSTRAINT "venues_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_contacts" ADD CONSTRAINT "venue_contacts_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_contacts" ADD CONSTRAINT "venue_contacts_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_crew_members" ADD CONSTRAINT "tour_crew_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_crew_members" ADD CONSTRAINT "tour_crew_members_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "tours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "tours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "per_diem_payments" ADD CONSTRAINT "per_diem_payments_crewMemberId_fkey" FOREIGN KEY ("crewMemberId") REFERENCES "tour_crew_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_items" ADD CONSTRAINT "budget_items_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "tours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_list_items" ADD CONSTRAINT "guest_list_items_tourDayId_fkey" FOREIGN KEY ("tourDayId") REFERENCES "tour_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "day_notes" ADD CONSTRAINT "day_notes_tourDayId_fkey" FOREIGN KEY ("tourDayId") REFERENCES "tour_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;
