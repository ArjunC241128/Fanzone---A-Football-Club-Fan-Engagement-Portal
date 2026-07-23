// fanzoneData.js
// Talks to the Express/MongoDB backend (server.js) for fan bookings and reviews,
// so anything a fan submits here shows up in TitansAdminDashboard's Bookings & Reviews tabs.

const API = "http://localhost:3000";

/**
 * Create or update a fan's RSVP for a match.
 * Mirrors the shape TitansAdminDashboard's BookingsTab expects:
 * fanName, matchLabel, status, ticketType, submittedAt.
 */
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

/**
 * Fetch all bookings for one fan (by Firebase uid), keyed to their fixtures via matchId.
 * NOTE: this currently fetches all bookings and filters client-side, since the backend
 * has no /bookings?userId= filter yet. Fine for now; worth adding a query param
 * server-side if the Bookings collection grows large.
 */
export async function fetchFanBookings(userId) {
  const res = await fetch(`${API}/bookings`);
  if (!res.ok) throw new Error(`Failed to load bookings (${res.status})`);
  const all = await res.json();
  return all.filter((b) => b.userId === userId);
}

/**
 * Post a new fan review. Defaults status to "pending" so it lands in the admin
 * moderation queue (ReviewsTab) until an admin publishes or hides it.
 */
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

  // TitansFanzoneDashboard's ReviewsTab keys list items on `.id` and spreads this
  // straight into local state, so shape it to match what it already renders.
  return { id: data.insertedId, match, rating, comment, date: payload.date };
}

/** Fetch all reviews written by one fan (by Firebase uid). */
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

/** Delete a fan's own review. */
export async function deleteFanReview(id) {
  const res = await fetch(`${API}/reviews/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete review (${res.status})`);
  const data = await res.json();
  if (!data.deletedCount) throw new Error("Failed to delete review");
  return data;
}