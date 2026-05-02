const PROFILE_NAMES = {
  "1":"Investigator","2":"Hermit","3":"Martyr",
  "4":"Opportunist","5":"Heretic","6":"Role Model"
};
const CENTER_MAP = {
  "G":"G Center","Head":"Head","Ajna":"Ajna","Throat":"Throat",
  "Ego":"Heart/Ego","Heart":"Heart/Ego","Sacral":"Sacral",
  "Solar Plexus":"Solar Plexus","SP":"Solar Plexus",
  "Spleen":"Spleen","Root":"Root"
};
const CENTERS_ALL = ["Head","Ajna","Throat","G Center","Heart/Ego","Sacral","Solar Plexus","Spleen","Root"];

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { date, time, city } = req.body;
  if (!date || !time || !city) return res.status(400).json({ error: "date, time, and city are required" });
  const apiKey = process.env.HD_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "HD_API_KEY not configured" });
  try {
    const hdRes = await fetch("https://api.humandesignhub.app/v1/bodygraph", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-KEY": apiKey },
      body: JSON.stringify({ date, time, city }),
    });
    if (!hdRes.ok) {
      const err = await hdRes.json().catch(() => ({}));
      return res.status(hdRes.status).json({ error: err.message || err.detail || `API error ${hdRes.status}` });
    }
    const data = await hdRes.json();
    const type = data.type || "Generator";
    const authority = data.authority || "Sacral";
    const profileRaw = (data.profile || "1/3").toString().replace(/\s/g, "");
    const [pl, dl] = profileRaw.split("/");
    const profile = `${profileRaw} — ${PROFILE_NAMES[pl]||pl} / ${PROFILE_NAMES[dl]||dl}`;
    const defined = (data.centers || []).map(c => CENTER_MAP[c] || c).filter(c => CENTERS_ALL.includes(c));
    const gates = {
      personalitySun: data.gates?.personality_sun || null,
      personalityMoon: data.gates?.personality_moon || null,
      designSun: data.gates?.design_sun || null,
      designMoon: data.gates?.design_moon || null,
    };
    return res.status(200).json({ type, authority, profile, defined, gates, calculation: "Human Design Hub API" });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Unexpected error" });
  }
}
