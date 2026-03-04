import { z } from "zod"

export const createTourDaySchema = z.object({
  date: z.string().min(1, "Date is required"),
  dayType: z.enum(["SHOW", "TRAVEL", "OFF", "REHEARSAL", "PRESS", "LOAD_IN", "FESTIVAL", "OTHER"]),
  title: z.string().max(200).optional(),
  city: z.string().max(200).optional(),
  country: z.string().max(10).optional(),
  venueId: z.string().optional(),
  isConfirmed: z.boolean().optional(),
  notes: z.string().optional(),
})

export const updateTourDaySchema = createTourDaySchema.partial()

export const createScheduleItemSchema = z.object({
  type: z.enum([
    "LOAD_IN", "SOUNDCHECK", "DOORS", "SUPPORT_SET", "SET_TIME",
    "CHANGEOVER", "CURFEW", "MEET_AND_GREET", "CATERING", "PRESS",
    "INTERVIEW", "REHEARSAL", "TRAVEL_DEPART", "TRAVEL_ARRIVE",
    "HOTEL_CHECK_IN", "HOTEL_CHECK_OUT", "CUSTOM",
  ]),
  label: z.string().min(1, "Label is required").max(200),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  notes: z.string().optional(),
})

export const createTravelLegSchema = z.object({
  mode: z.enum(["BUS", "FLY", "DRIVE", "TRAIN", "FERRY", "OTHER"]),
  departureCity: z.string().optional(),
  arrivalCity: z.string().optional(),
  departureTime: z.string().optional(),
  arrivalTime: z.string().optional(),
  carrier: z.string().optional(),
  flightNumber: z.string().optional(),
  confirmationCode: z.string().optional(),
  notes: z.string().optional(),
})

export const createHotelStaySchema = z.object({
  hotelName: z.string().min(1, "Hotel name is required").max(200),
  address: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().optional(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  confirmationCode: z.string().optional(),
  notes: z.string().optional(),
})

export type CreateTourDayInput = z.infer<typeof createTourDaySchema>
export type CreateScheduleItemInput = z.infer<typeof createScheduleItemSchema>
export type CreateTravelLegInput = z.infer<typeof createTravelLegSchema>
export type CreateHotelStayInput = z.infer<typeof createHotelStaySchema>
