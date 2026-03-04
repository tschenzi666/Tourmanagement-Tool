import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Clean up existing data (in order to avoid conflicts)
  await prisma.dayNote.deleteMany()
  await prisma.guestListItem.deleteMany()
  await prisma.roomAssignment.deleteMany()
  await prisma.hotelStay.deleteMany()
  await prisma.travelAssignment.deleteMany()
  await prisma.travelLeg.deleteMany()
  await prisma.scheduleItem.deleteMany()
  await prisma.showDeduction.deleteMany()
  await prisma.showDetails.deleteMany()
  await prisma.tourDay.deleteMany()
  await prisma.perDiemPayment.deleteMany()
  await prisma.tourCrewMember.deleteMany()
  await prisma.expense.deleteMany()
  await prisma.budgetItem.deleteMany()
  await prisma.venueContact.deleteMany()
  await prisma.venue.deleteMany()
  await prisma.contact.deleteMany()
  await prisma.tour.deleteMany()
  await prisma.teamMember.deleteMany()
  await prisma.team.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  // ============================================================
  // USER & TEAM
  // ============================================================
  const hashedPassword = await bcrypt.hash("password123", 12)
  const user = await prisma.user.create({
    data: {
      name: "Demo User",
      email: "demo@tourmanager.com",
      password: hashedPassword,
    },
  })

  const team = await prisma.team.create({
    data: {
      name: "Demo Productions",
      slug: "demo-team",
      description: "Demo production company for touring",
      members: {
        create: { userId: user.id, role: "OWNER" },
      },
    },
  })

  // ============================================================
  // VENUES (with coordinates for the map!)
  // ============================================================
  const venues = await Promise.all([
    prisma.venue.create({
      data: {
        name: "Olympia",
        city: "Paris",
        country: "FR",
        address: "28 Boulevard des Capucines",
        postalCode: "75009",
        capacity: 2000,
        venueType: "Theater",
        latitude: 48.8703,
        longitude: 2.3280,
        phone: "+33 1 47 42 25 49",
        wifiNetwork: "Olympia-Backstage",
        wifiPassword: "showtime2026",
        loadInNotes: "Load-in via Rue Caumartin. Truck parking limited to 2 vehicles. Security will meet at stage door.",
        parkingNotes: "No on-site parking. Nearest: Parking Madeleine (5 min walk)",
        teamId: team.id,
      },
    }),
    prisma.venue.create({
      data: {
        name: "The Roundhouse",
        city: "London",
        country: "GB",
        address: "Chalk Farm Road",
        postalCode: "NW1 8EH",
        capacity: 3300,
        venueType: "Theater",
        latitude: 51.5434,
        longitude: -0.1521,
        phone: "+44 20 7424 9991",
        wifiNetwork: "RH-Production",
        wifiPassword: "chalk2026",
        loadInNotes: "Load-in from rear car park. Height limit 4.2m. Call Production Manager on arrival.",
        teamId: team.id,
      },
    }),
    prisma.venue.create({
      data: {
        name: "Tempodrom",
        city: "Berlin",
        country: "DE",
        address: "Möckernstraße 10",
        postalCode: "10963",
        capacity: 3800,
        venueType: "Arena",
        latitude: 52.5024,
        longitude: 13.3826,
        phone: "+49 30 747 370",
        teamId: team.id,
      },
    }),
    prisma.venue.create({
      data: {
        name: "Paradiso",
        city: "Amsterdam",
        country: "NL",
        address: "Weteringschans 6-8",
        postalCode: "1017 SG",
        capacity: 1500,
        venueType: "Club",
        latitude: 52.3622,
        longitude: 4.8838,
        phone: "+31 20 626 4521",
        teamId: team.id,
      },
    }),
    prisma.venue.create({
      data: {
        name: "AB (Ancienne Belgique)",
        city: "Brussels",
        country: "BE",
        address: "Boulevard Anspach 110",
        postalCode: "1000",
        capacity: 2000,
        venueType: "Club",
        latitude: 50.8486,
        longitude: 4.3488,
        phone: "+32 2 548 24 24",
        teamId: team.id,
      },
    }),
    prisma.venue.create({
      data: {
        name: "Tonhalle",
        city: "Munich",
        country: "DE",
        address: "Grafinger Str. 6",
        postalCode: "81671",
        capacity: 1200,
        venueType: "Club",
        latitude: 48.1249,
        longitude: 11.6037,
        teamId: team.id,
      },
    }),
  ])

  const [olympia, roundhouse, tempodrom, paradiso, ab, tonhalle] = venues

  // ============================================================
  // TOUR
  // ============================================================
  const tour = await prisma.tour.create({
    data: {
      name: "Summer Festival Run 2026",
      artist: "The Demo Band",
      status: "CONFIRMED",
      description: "European summer tour hitting major cities. 6 shows, 10 days on the road.",
      startDate: new Date("2026-06-15"),
      endDate: new Date("2026-06-25"),
      currency: "EUR",
      teamId: team.id,
      createdById: user.id,
    },
  })

  // ============================================================
  // TOUR DAYS
  // ============================================================

  // Day 1 - Paris SHOW
  const day1 = await prisma.tourDay.create({
    data: {
      date: new Date("2026-06-15"),
      dayType: "SHOW",
      dayNumber: 1,
      title: "Paris - Opening Night",
      city: "Paris",
      country: "FR",
      isConfirmed: true,
      tourId: tour.id,
      venueId: olympia.id,
    },
  })

  // Day 2 - Travel Paris → London
  const day2 = await prisma.tourDay.create({
    data: {
      date: new Date("2026-06-16"),
      dayType: "TRAVEL",
      dayNumber: 2,
      title: "Travel to London",
      city: "London",
      country: "GB",
      tourId: tour.id,
    },
  })

  // Day 3 - London SHOW
  const day3 = await prisma.tourDay.create({
    data: {
      date: new Date("2026-06-17"),
      dayType: "SHOW",
      dayNumber: 3,
      title: "London - The Roundhouse",
      city: "London",
      country: "GB",
      isConfirmed: true,
      tourId: tour.id,
      venueId: roundhouse.id,
    },
  })

  // Day 4 - OFF
  const day4 = await prisma.tourDay.create({
    data: {
      date: new Date("2026-06-18"),
      dayType: "OFF",
      dayNumber: 4,
      title: "Day Off - London",
      city: "London",
      country: "GB",
      notes: "Rest day. Optional sightseeing. Bus departs at 22:00 for overnight to Brussels.",
      tourId: tour.id,
    },
  })

  // Day 5 - Brussels SHOW
  const day5 = await prisma.tourDay.create({
    data: {
      date: new Date("2026-06-19"),
      dayType: "SHOW",
      dayNumber: 5,
      title: "Brussels - AB",
      city: "Brussels",
      country: "BE",
      isConfirmed: true,
      tourId: tour.id,
      venueId: ab.id,
    },
  })

  // Day 6 - Travel Brussels → Amsterdam
  const day6 = await prisma.tourDay.create({
    data: {
      date: new Date("2026-06-20"),
      dayType: "TRAVEL",
      dayNumber: 6,
      title: "Travel to Amsterdam",
      city: "Amsterdam",
      country: "NL",
      tourId: tour.id,
    },
  })

  // Day 7 - Amsterdam SHOW
  const day7 = await prisma.tourDay.create({
    data: {
      date: new Date("2026-06-21"),
      dayType: "SHOW",
      dayNumber: 7,
      title: "Amsterdam - Paradiso",
      city: "Amsterdam",
      country: "NL",
      isConfirmed: true,
      tourId: tour.id,
      venueId: paradiso.id,
    },
  })

  // Day 8 - Travel to Berlin
  const day8 = await prisma.tourDay.create({
    data: {
      date: new Date("2026-06-22"),
      dayType: "TRAVEL",
      dayNumber: 8,
      title: "Travel to Berlin",
      city: "Berlin",
      country: "DE",
      tourId: tour.id,
    },
  })

  // Day 9 - Berlin SHOW
  const day9 = await prisma.tourDay.create({
    data: {
      date: new Date("2026-06-23"),
      dayType: "SHOW",
      dayNumber: 9,
      title: "Berlin - Tempodrom",
      city: "Berlin",
      country: "DE",
      isConfirmed: true,
      tourId: tour.id,
      venueId: tempodrom.id,
    },
  })

  // Day 10 - Rehearsal
  const day10 = await prisma.tourDay.create({
    data: {
      date: new Date("2026-06-24"),
      dayType: "REHEARSAL",
      dayNumber: 10,
      title: "Rehearsal Day - Munich prep",
      city: "Berlin",
      country: "DE",
      tourId: tour.id,
    },
  })

  // Day 11 - Munich SHOW (final)
  const day11 = await prisma.tourDay.create({
    data: {
      date: new Date("2026-06-25"),
      dayType: "SHOW",
      dayNumber: 11,
      title: "Munich - Tonhalle (Final Night)",
      city: "Munich",
      country: "DE",
      isConfirmed: true,
      tourId: tour.id,
      venueId: tonhalle.id,
    },
  })

  // ============================================================
  // SCHEDULE ITEMS for Day 1 (Paris Show - full show day)
  // ============================================================
  await prisma.scheduleItem.createMany({
    data: [
      { tourDayId: day1.id, type: "HOTEL_CHECK_OUT", label: "Hotel Check-Out", startTime: new Date("1970-01-01T08:00:00Z"), sortOrder: 1 },
      { tourDayId: day1.id, type: "LOAD_IN", label: "Load-In & Setup", startTime: new Date("1970-01-01T10:00:00Z"), endTime: new Date("1970-01-01T14:00:00Z"), sortOrder: 2 },
      { tourDayId: day1.id, type: "CATERING", label: "Lunch", startTime: new Date("1970-01-01T13:00:00Z"), endTime: new Date("1970-01-01T14:00:00Z"), sortOrder: 3 },
      { tourDayId: day1.id, type: "SOUNDCHECK", label: "Soundcheck", startTime: new Date("1970-01-01T15:00:00Z"), endTime: new Date("1970-01-01T16:30:00Z"), sortOrder: 4 },
      { tourDayId: day1.id, type: "CATERING", label: "Dinner", startTime: new Date("1970-01-01T17:00:00Z"), endTime: new Date("1970-01-01T18:00:00Z"), sortOrder: 5 },
      { tourDayId: day1.id, type: "DOORS", label: "Doors Open", startTime: new Date("1970-01-01T19:00:00Z"), sortOrder: 6 },
      { tourDayId: day1.id, type: "SUPPORT_SET", label: "Support: The Opening Act", startTime: new Date("1970-01-01T19:30:00Z"), endTime: new Date("1970-01-01T20:15:00Z"), sortOrder: 7 },
      { tourDayId: day1.id, type: "CHANGEOVER", label: "Changeover", startTime: new Date("1970-01-01T20:15:00Z"), endTime: new Date("1970-01-01T20:45:00Z"), sortOrder: 8 },
      { tourDayId: day1.id, type: "SET_TIME", label: "The Demo Band - Main Set", startTime: new Date("1970-01-01T21:00:00Z"), endTime: new Date("1970-01-01T22:30:00Z"), notes: "90 min set. Encore planned.", sortOrder: 9 },
      { tourDayId: day1.id, type: "CURFEW", label: "Curfew", startTime: new Date("1970-01-01T23:00:00Z"), sortOrder: 10 },
    ],
  })

  // Schedule for Day 3 (London Show)
  await prisma.scheduleItem.createMany({
    data: [
      { tourDayId: day3.id, type: "LOAD_IN", label: "Load-In", startTime: new Date("1970-01-01T09:00:00Z"), endTime: new Date("1970-01-01T13:00:00Z"), sortOrder: 1 },
      { tourDayId: day3.id, type: "CATERING", label: "Lunch", startTime: new Date("1970-01-01T12:30:00Z"), endTime: new Date("1970-01-01T13:30:00Z"), sortOrder: 2 },
      { tourDayId: day3.id, type: "SOUNDCHECK", label: "Soundcheck", startTime: new Date("1970-01-01T14:00:00Z"), endTime: new Date("1970-01-01T15:30:00Z"), sortOrder: 3 },
      { tourDayId: day3.id, type: "MEET_AND_GREET", label: "VIP Meet & Greet", startTime: new Date("1970-01-01T17:30:00Z"), endTime: new Date("1970-01-01T18:30:00Z"), notes: "20 VIP ticket holders", sortOrder: 4 },
      { tourDayId: day3.id, type: "DOORS", label: "Doors Open", startTime: new Date("1970-01-01T19:00:00Z"), sortOrder: 5 },
      { tourDayId: day3.id, type: "SUPPORT_SET", label: "Support: Local Opener", startTime: new Date("1970-01-01T19:30:00Z"), endTime: new Date("1970-01-01T20:15:00Z"), sortOrder: 6 },
      { tourDayId: day3.id, type: "SET_TIME", label: "The Demo Band", startTime: new Date("1970-01-01T21:00:00Z"), endTime: new Date("1970-01-01T22:30:00Z"), sortOrder: 7 },
      { tourDayId: day3.id, type: "CURFEW", label: "Curfew", startTime: new Date("1970-01-01T23:00:00Z"), sortOrder: 8 },
    ],
  })

  // Schedule for Day 5 (Brussels Show)
  await prisma.scheduleItem.createMany({
    data: [
      { tourDayId: day5.id, type: "LOAD_IN", label: "Load-In", startTime: new Date("1970-01-01T10:00:00Z"), sortOrder: 1 },
      { tourDayId: day5.id, type: "SOUNDCHECK", label: "Soundcheck", startTime: new Date("1970-01-01T15:00:00Z"), endTime: new Date("1970-01-01T16:30:00Z"), sortOrder: 2 },
      { tourDayId: day5.id, type: "DOORS", label: "Doors", startTime: new Date("1970-01-01T19:30:00Z"), sortOrder: 3 },
      { tourDayId: day5.id, type: "SET_TIME", label: "The Demo Band", startTime: new Date("1970-01-01T20:30:00Z"), endTime: new Date("1970-01-01T22:00:00Z"), sortOrder: 4 },
      { tourDayId: day5.id, type: "CURFEW", label: "Curfew", startTime: new Date("1970-01-01T23:00:00Z"), sortOrder: 5 },
    ],
  })

  // ============================================================
  // TRAVEL LEGS
  // ============================================================

  // Day 2: Paris → London by Eurostar
  await prisma.travelLeg.create({
    data: {
      mode: "TRAIN",
      departureCity: "Paris",
      arrivalCity: "London",
      departureTime: new Date("2026-06-16T08:15:00Z"),
      arrivalTime: new Date("2026-06-16T09:40:00Z"),
      carrier: "Eurostar",
      flightNumber: "EST 9024",
      confirmationCode: "EUR-7742A",
      notes: "Gare du Nord → St Pancras. 2 hour check-in. Equipment going by truck separately.",
      sortOrder: 1,
      tourDayId: day2.id,
    },
  })

  // Day 6: Brussels → Amsterdam by bus
  await prisma.travelLeg.create({
    data: {
      mode: "BUS",
      departureCity: "Brussels",
      arrivalCity: "Amsterdam",
      departureTime: new Date("2026-06-20T10:00:00Z"),
      arrivalTime: new Date("2026-06-20T13:30:00Z"),
      notes: "Tour bus. Departs from venue loading dock. ~200km, 3-3.5h depending on traffic.",
      sortOrder: 1,
      tourDayId: day6.id,
    },
  })

  // Day 8: Amsterdam → Berlin by flight
  await prisma.travelLeg.create({
    data: {
      mode: "FLY",
      departureCity: "Amsterdam",
      arrivalCity: "Berlin",
      departureTime: new Date("2026-06-22T11:30:00Z"),
      arrivalTime: new Date("2026-06-22T13:15:00Z"),
      carrier: "KLM",
      flightNumber: "KL1833",
      confirmationCode: "KLM-993BX",
      notes: "AMS → BER. Equipment shipped separately via truck.",
      sortOrder: 1,
      tourDayId: day8.id,
    },
  })

  // ============================================================
  // HOTEL STAYS
  // ============================================================

  // Paris hotel
  await prisma.hotelStay.create({
    data: {
      hotelName: "Hotel Le Marais",
      address: "5 Rue de Rivoli",
      city: "Paris",
      phone: "+33 1 42 72 34 12",
      email: "reception@lemarais.fr",
      checkIn: new Date("2026-06-14T15:00:00Z"),
      checkOut: new Date("2026-06-16T11:00:00Z"),
      confirmationCode: "HLM-88421",
      notes: "6 rooms booked. Late checkout confirmed for production crew.",
      tourDayId: day1.id,
    },
  })

  // London hotel
  await prisma.hotelStay.create({
    data: {
      hotelName: "Premier Inn Camden",
      address: "2 Restmor Way, Walworth Road",
      city: "London",
      phone: "+44 20 7843 6400",
      checkIn: new Date("2026-06-16T14:00:00Z"),
      checkOut: new Date("2026-06-19T11:00:00Z"),
      confirmationCode: "PI-UK-553291",
      notes: "3 nights (including day off). 8 rooms booked. Breakfast included.",
      tourDayId: day3.id,
    },
  })

  // Amsterdam hotel
  await prisma.hotelStay.create({
    data: {
      hotelName: "Conscious Hotel Vondelpark",
      address: "Overtoom 519",
      city: "Amsterdam",
      phone: "+31 20 820 3333",
      email: "vondelpark@conscioushotels.com",
      website: "https://conscioushotels.com",
      checkIn: new Date("2026-06-20T15:00:00Z"),
      checkOut: new Date("2026-06-22T11:00:00Z"),
      confirmationCode: "CH-AMS-7712",
      tourDayId: day7.id,
    },
  })

  // Berlin hotel
  await prisma.hotelStay.create({
    data: {
      hotelName: "Michelberger Hotel",
      address: "Warschauer Str. 39/40",
      city: "Berlin",
      phone: "+49 30 2977 8590",
      email: "info@michelbergerhotel.com",
      website: "https://michelbergerhotel.com",
      checkIn: new Date("2026-06-22T15:00:00Z"),
      checkOut: new Date("2026-06-25T11:00:00Z"),
      confirmationCode: "MBH-DE-2214",
      notes: "Near Warschauer Straße. Band loves this place.",
      tourDayId: day9.id,
    },
  })

  // ============================================================
  // SHOW DETAILS for Paris (example of financial data)
  // ============================================================
  await prisma.showDetails.create({
    data: {
      tourDayId: day1.id,
      dealType: "GUARANTEE_PLUS",
      guarantee: 8000,
      percentage: 85,
      ticketPrice: 35,
      capacity: 2000,
      ticketsSold: 1750,
      grossRevenue: 61250,
      setLength: 90,
      promoterName: "Pierre Dupont",
      promoterEmail: "pierre@promofr.com",
      promoterPhone: "+33 6 12 34 56 78",
      productionNotes: "Full PA provided. Bring own monitors. Lighting rig: GrandMA2.",
    },
  })

  // ============================================================
  // GUEST LIST for Paris show
  // ============================================================
  await prisma.guestListItem.createMany({
    data: [
      { tourDayId: day1.id, guestName: "Marie Laurent", plusOnes: 1, status: "APPROVED", requestedBy: "Management" },
      { tourDayId: day1.id, guestName: "Jean-Paul Renoir", plusOnes: 2, status: "APPROVED", requestedBy: "Promoter" },
      { tourDayId: day1.id, guestName: "Sophie Marceau", plusOnes: 0, status: "PENDING", requestedBy: "PR Team" },
      { tourDayId: day1.id, guestName: "Record Label A&R", plusOnes: 1, status: "APPROVED", requestedBy: "Label", notes: "Important industry contact" },
    ],
  })

  // ============================================================
  // CONTACTS
  // ============================================================
  await prisma.contact.createMany({
    data: [
      {
        firstName: "Pierre", lastName: "Dupont",
        email: "pierre@promofr.com", phone: "+33 6 12 34 56 78",
        company: "PromoFR", jobTitle: "Senior Promoter",
        category: "PROMOTER", teamId: team.id,
      },
      {
        firstName: "Sarah", lastName: "Mitchell",
        email: "sarah@roundhouse.org.uk", phone: "+44 20 7424 9992",
        company: "The Roundhouse", jobTitle: "Production Manager",
        category: "VENUE_STAFF", teamId: team.id,
      },
      {
        firstName: "Klaus", lastName: "Weber",
        email: "klaus@tempodrom.de", phone: "+49 30 747 371",
        company: "Tempodrom Berlin", jobTitle: "Technical Director",
        category: "VENUE_STAFF", teamId: team.id,
      },
      {
        firstName: "Emma", lastName: "van den Berg",
        email: "emma@paradiso.nl", phone: "+31 20 626 4522",
        company: "Paradiso Amsterdam", jobTitle: "Booking Manager",
        category: "VENUE_STAFF", teamId: team.id,
      },
      {
        firstName: "James", lastName: "Walker",
        email: "james@tourbus.eu", phone: "+44 7700 900123",
        mobile: "+44 7700 900124",
        company: "European Tour Bus Co.", jobTitle: "Fleet Manager",
        category: "TRANSPORT", teamId: team.id,
      },
      {
        firstName: "Lisa", lastName: "Anderson",
        email: "lisa@bigagency.com", phone: "+1 212 555 0199",
        company: "Big Agency LLC", jobTitle: "Booking Agent",
        category: "AGENT", teamId: team.id,
        notes: "Primary booking agent for EU territory.",
      },
      {
        firstName: "Marco", lastName: "Rossi",
        email: "marco@soundco.eu",
        company: "SoundCo Europe", jobTitle: "FOH Engineer",
        category: "PRODUCTION", teamId: team.id,
      },
      {
        firstName: "Ana", lastName: "Fernandez",
        email: "ana@cateringpro.eu", phone: "+32 2 555 1234",
        company: "CateringPro", jobTitle: "Tour Catering Coordinator",
        category: "CATERING", teamId: team.id,
      },
    ],
  })

  // ============================================================
  // CREW MEMBERS
  // ============================================================

  const crewMembers = await Promise.all([
    prisma.tourCrewMember.create({
      data: {
        roleTitle: "Dave Richards",
        role: "TOUR_MANAGER",
        department: "Management",
        dailyRate: 500,
        perDiem: 75,
        currency: "EUR",
        nationality: "British",
        dateOfBirth: new Date("1982-03-15"),
        tShirtSize: "L",
        dietaryNeeds: "None",
        emergencyName: "Sarah Richards",
        emergencyPhone: "+44 7700 100200",
        emergencyRelation: "Spouse",
        startDate: new Date("2026-06-14"),
        endDate: new Date("2026-06-25"),
        isActive: true,
        notes: "Experienced TM with 15+ years on European tours. Fluent in French and German.",
        userId: user.id,
        tourId: tour.id,
      },
    }),
    prisma.tourCrewMember.create({
      data: {
        roleTitle: "Sophie Chen",
        role: "PRODUCTION_MANAGER",
        department: "Management",
        dailyRate: 450,
        perDiem: 75,
        currency: "EUR",
        nationality: "Canadian",
        tShirtSize: "M",
        emergencyName: "Michael Chen",
        emergencyPhone: "+1 604 555 1234",
        emergencyRelation: "Father",
        startDate: new Date("2026-06-14"),
        endDate: new Date("2026-06-25"),
        isActive: true,
        tourId: tour.id,
      },
    }),
    prisma.tourCrewMember.create({
      data: {
        roleTitle: "Marco Rossi",
        role: "FOH_ENGINEER",
        department: "Audio",
        dailyRate: 400,
        perDiem: 75,
        currency: "EUR",
        nationality: "Italian",
        tShirtSize: "XL",
        dietaryNeeds: "Vegetarian",
        startDate: new Date("2026-06-15"),
        endDate: new Date("2026-06-25"),
        isActive: true,
        notes: "Uses Avid S6L console. Needs 2 hours for soundcheck minimum.",
        tourId: tour.id,
      },
    }),
    prisma.tourCrewMember.create({
      data: {
        roleTitle: "Elena Bergström",
        role: "MONITOR_ENGINEER",
        department: "Audio",
        dailyRate: 400,
        perDiem: 75,
        currency: "EUR",
        nationality: "Swedish",
        tShirtSize: "S",
        startDate: new Date("2026-06-15"),
        endDate: new Date("2026-06-25"),
        isActive: true,
        tourId: tour.id,
      },
    }),
    prisma.tourCrewMember.create({
      data: {
        roleTitle: "Tom Williams",
        role: "LIGHTING_DESIGNER",
        department: "Lighting",
        dailyRate: 425,
        perDiem: 75,
        currency: "EUR",
        nationality: "British",
        tShirtSize: "L",
        emergencyName: "Jane Williams",
        emergencyPhone: "+44 7700 300400",
        emergencyRelation: "Partner",
        startDate: new Date("2026-06-15"),
        endDate: new Date("2026-06-25"),
        isActive: true,
        notes: "Running grandMA3 console. Needs 3 hours for focus/programming.",
        tourId: tour.id,
      },
    }),
    prisma.tourCrewMember.create({
      data: {
        roleTitle: "Yuki Tanaka",
        role: "BACKLINE_TECH",
        department: "Backline",
        dailyRate: 350,
        perDiem: 75,
        currency: "EUR",
        nationality: "Japanese",
        tShirtSize: "M",
        dietaryNeeds: "No shellfish",
        allergies: "Shellfish",
        startDate: new Date("2026-06-15"),
        endDate: new Date("2026-06-25"),
        isActive: true,
        tourId: tour.id,
      },
    }),
    prisma.tourCrewMember.create({
      data: {
        roleTitle: "Klaus Müller",
        role: "BUS_DRIVER",
        department: "Transport",
        dailyRate: 300,
        perDiem: 50,
        currency: "EUR",
        nationality: "German",
        tShirtSize: "XXL",
        passportNumber: "C01234567",
        passportExpiry: new Date("2028-11-30"),
        startDate: new Date("2026-06-14"),
        endDate: new Date("2026-06-25"),
        isActive: true,
        notes: "Nightliner driver. EU professional license. 20 years experience.",
        tourId: tour.id,
      },
    }),
    prisma.tourCrewMember.create({
      data: {
        roleTitle: "Ana Fernandez",
        role: "CATERING",
        department: "Catering",
        dailyRate: 275,
        perDiem: 50,
        currency: "EUR",
        nationality: "Spanish",
        tShirtSize: "M",
        startDate: new Date("2026-06-15"),
        endDate: new Date("2026-06-25"),
        isActive: true,
        tourId: tour.id,
      },
    }),
    prisma.tourCrewMember.create({
      data: {
        roleTitle: "Pete O'Brien",
        role: "MERCH_MANAGER",
        department: "Merchandise",
        dailyRate: 250,
        perDiem: 75,
        currency: "EUR",
        nationality: "Irish",
        tShirtSize: "L",
        startDate: new Date("2026-06-15"),
        endDate: new Date("2026-06-25"),
        isActive: true,
        notes: "Handling merch for 3 different artists on this run.",
        tourId: tour.id,
      },
    }),
    prisma.tourCrewMember.create({
      data: {
        roleTitle: "Léa Dubois",
        role: "WARDROBE",
        department: "Wardrobe & Styling",
        dailyRate: 325,
        perDiem: 75,
        currency: "EUR",
        nationality: "French",
        tShirtSize: "S",
        startDate: new Date("2026-06-15"),
        endDate: new Date("2026-06-25"),
        isActive: true,
        tourId: tour.id,
      },
    }),
  ])

  // ============================================================
  // EXPENSES
  // ============================================================

  await prisma.expense.createMany({
    data: [
      {
        description: "Nightliner rental (11 days)",
        amount: 8800,
        currency: "EUR",
        category: "VEHICLE",
        date: new Date("2026-06-14"),
        vendor: "European Tour Bus Co.",
        notes: "12-bunk sleeper bus with lounge. Pick up in Paris, drop off in Munich.",
        tourId: tour.id,
      },
      {
        description: "Eurostar group tickets (8 pax)",
        amount: 1840,
        currency: "EUR",
        category: "TRAVEL",
        date: new Date("2026-06-16"),
        vendor: "Eurostar",
        notes: "Standard Premier class. Paris Gare du Nord to London St Pancras.",
        tourId: tour.id,
      },
      {
        description: "Hotel & Hub Paris (2 nights, 6 rooms)",
        amount: 2400,
        currency: "EUR",
        category: "ACCOMMODATION",
        date: new Date("2026-06-15"),
        vendor: "Hotel & Hub",
        isReimbursed: true,
        tourId: tour.id,
      },
      {
        description: "Backline rental - Paris",
        amount: 1200,
        currency: "EUR",
        category: "EQUIPMENT",
        date: new Date("2026-06-15"),
        vendor: "SoundCo Paris",
        tourId: tour.id,
      },
      {
        description: "Catering advance - Week 1",
        amount: 3500,
        currency: "EUR",
        category: "CATERING",
        date: new Date("2026-06-14"),
        vendor: "CateringPro",
        tourId: tour.id,
      },
      {
        description: "Production freight - EU leg",
        amount: 4200,
        currency: "EUR",
        category: "PRODUCTION",
        date: new Date("2026-06-13"),
        vendor: "Stage Trucking GmbH",
        notes: "2x 40ft trailers. Sound, lighting, backline, merch.",
        tourId: tour.id,
      },
      {
        description: "Travel insurance (all crew)",
        amount: 890,
        currency: "EUR",
        category: "INSURANCE",
        date: new Date("2026-06-01"),
        vendor: "AXA Partners",
        isReimbursed: true,
        tourId: tour.id,
      },
      {
        description: "Fuel - Tour bus Week 1",
        amount: 650,
        currency: "EUR",
        category: "FUEL",
        date: new Date("2026-06-18"),
        tourId: tour.id,
      },
      {
        description: "Motorway tolls - France/Belgium",
        amount: 185,
        currency: "EUR",
        category: "TOLLS",
        date: new Date("2026-06-19"),
        tourId: tour.id,
      },
      {
        description: "KLM flights Brussels-Amsterdam (3 pax)",
        amount: 540,
        currency: "EUR",
        category: "TRAVEL",
        date: new Date("2026-06-21"),
        vendor: "KLM",
        tourId: tour.id,
      },
    ],
  })

  // ============================================================
  // BUDGET ITEMS
  // ============================================================

  await prisma.budgetItem.createMany({
    data: [
      {
        category: "Transport",
        description: "Nightliner rental (full tour)",
        estimated: 8800,
        actual: 8800,
        tourId: tour.id,
      },
      {
        category: "Travel",
        description: "Flights and trains",
        estimated: 3000,
        actual: 2380,
        tourId: tour.id,
      },
      {
        category: "Accommodation",
        description: "Hotels (non-bus nights)",
        estimated: 6000,
        actual: 2400,
        notes: "4 hotel nights booked so far",
        tourId: tour.id,
      },
      {
        category: "Crew",
        description: "Crew wages (10 crew × 11 days)",
        estimated: 41250,
        tourId: tour.id,
      },
      {
        category: "Crew",
        description: "Per diems (10 crew × 11 days)",
        estimated: 7700,
        tourId: tour.id,
      },
      {
        category: "Catering",
        description: "Tour catering",
        estimated: 7000,
        actual: 3500,
        tourId: tour.id,
      },
      {
        category: "Equipment Rental",
        description: "Backline rental per show",
        estimated: 7200,
        actual: 1200,
        tourId: tour.id,
      },
      {
        category: "Production",
        description: "Freight and trucking",
        estimated: 4500,
        actual: 4200,
        tourId: tour.id,
      },
      {
        category: "Insurance",
        description: "Travel & equipment insurance",
        estimated: 1200,
        actual: 890,
        tourId: tour.id,
      },
      {
        category: "Contingency",
        description: "10% contingency fund",
        estimated: 8500,
        tourId: tour.id,
      },
    ],
  })

  console.log("Seed complete!")
  console.log(`  User: demo@tourmanager.com / password123`)
  console.log(`  Team: ${team.name}`)
  console.log(`  Tour: ${tour.name}`)
  console.log(`  Venues: ${venues.length}`)
  console.log(`  Tour Days: 11 (6 shows, 3 travel, 1 off, 1 rehearsal)`)
  console.log(`  Crew Members: ${crewMembers.length}`)
  console.log(`  Contacts: 8`)
  console.log(`  Expenses: 10`)
  console.log(`  Budget Items: 10`)
  console.log(`  Schedule Items: 23`)
  console.log(`  Travel Legs: 3`)
  console.log(`  Hotels: 4`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
