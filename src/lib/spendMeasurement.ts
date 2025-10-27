export async function spendMeasurement(uid:string){
  const res = await fetch("/api/credits/spend-measurement", {
    method:"POST", headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ uid })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "SPEND_FAILED");
}