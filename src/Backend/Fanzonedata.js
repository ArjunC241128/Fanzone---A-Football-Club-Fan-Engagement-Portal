const API = "http://localhost:3000";

export async function setFanBooking({ userId, fanName, fanEmail, matchId, matchLabel, status, ticketType }) {
  const payload = {
    userId,
    fanName,
    fanEmail,
    matchId,
    matchLabel,
    status,
    ticketType,
    submittedAt: new Date().toISOString(),
  };

  const res = await fetch(`${API}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`Failed to save RSVP (${res.status})`);
  const data = await res.json();
  if (!data.insertedId) throw new Error("Failed to save RSVP");

  return { _id: data.insertedId, ...payload };
}


export async function fetchFanBookings(userId) {
  const res = await fetch(`${API}/bookings`);
  if (!res.ok) throw new Error(`Failed to load bookings (${res.status})`);
  const all = await res.json();
  return all.filter((b) => b.userId === userId);
}


export async function createFanReview({ userId, fanName, fanEmail, match, rating, comment }) {
  const payload = {
    userId,
    fanName,
    fanEmail,
    match,
    rating,
    comment,
    status: "pending",
    date: new Date().toISOString(),
  };

  const res = await fetch(`${API}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`Failed to post review (${res.status})`);
  const data = await res.json();
  if (!data.insertedId) throw new Error("Failed to post review");


  return { id: data.insertedId, match, rating, comment, date: payload.date };
}


export async function fetchFanReviews(userId) {
  const res = await fetch(`${API}/reviews`);
  if (!res.ok) throw new Error(`Failed to load reviews (${res.status})`);
  const all = await res.json();
  return all
    .filter((r) => r.userId === userId)
    .map((r) => ({
      id: r._id,
      match: r.match,
      rating: r.rating,
      comment: r.comment,
      date: r.date,
    }));
}

export async function deleteFanReview(id) {
  const res = await fetch(`${API}/reviews/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete review (${res.status})`);
  const data = await res.json();
  if (!data.deletedCount) throw new Error("Failed to delete review");
  return data;
}
