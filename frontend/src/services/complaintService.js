const BASE = '/api/complaints';

function authHeaders(token) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function createComplaint(payload, token) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
}

export async function getMyComplaints(token) {
  const res = await fetch(`${BASE}/my`, { headers: authHeaders(token) });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
}

export async function getAllComplaints(token) {
  const res = await fetch(BASE, { headers: authHeaders(token) });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
}

export async function updateComplaint(id, patch, token) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(patch),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
}