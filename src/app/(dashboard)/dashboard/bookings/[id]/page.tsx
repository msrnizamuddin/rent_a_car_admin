"use client";

import { useParams } from "next/navigation";
import BookingDetail from "@/components/bookings/BookingDetail";

export default function BookingDetailPage() {
  const params = useParams<{ id: string }>();
  return <BookingDetail id={params.id} />;
}
