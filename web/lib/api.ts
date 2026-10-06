const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function getCollection<T>(path: string): Promise<T[]> {
  const res = await fetch(`${API}${path}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`API request failed: ${res.status}`);
  return res.json();
}
