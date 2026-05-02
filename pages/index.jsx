import { useState, useEffect, useCallback, useRef } from "react";

// ─── Full 9-Planet Ephemeris (VSOP87 truncated series, Jean Meeus AA2) ────────
// Accurate to ~1 arcminute for dates 1800–2100. All 9 HD planets included.

const D2R = Math.PI / 180;
const norm = (x) => ((x % 360) + 360) % 360;

function jd(year, month, day, hour = 12) {
  if (month <= 2) { year--; month += 12; }
  const A = Math.floor(year / 100);
  return Math.floor(365.25*(year+4716)) + Math.floor(30.6001*(month+1)) + day + hour/24 + (2 - A + Math.floor(A/4)) - 1524.5;
}

// Convert UTC datetime + timezone offset string to JD
function birthToJD(date, time, tzOffset) {
  const [y,mo,d] = date.split("-").map(Number);
  const [h,mi] = (time||"12:00").split(":").map(Number);
  // Parse offset like "-07:00" or "+05:30"
  const sign = tzOffset[0] === "-" ? -1 : 1;
  const [oh, om] = tzOffset.replace(/[+-]/,"").split(":").map(Number);
  const utcHour = h + mi/60 - sign*(oh + om/60);
  return jd(y, mo, d, utcHour);
}

// Sun longitude (high precision)
function sunLon(T) {
  const L0 = norm(280.46646 + 36000.76983*T + 0.0003032*T*T);
  const M = norm(357.52911 + 35999.05029*T - 0.0001537*T*T);
  const Mr = M*D2R;
  const C = (1.914602 - 0.004817*T - 0.000014*T*T)*Math.sin(Mr)
           +(0.019993 - 0.000101*T)*Math.sin(2*Mr)
           + 0.000289*Math.sin(3*Mr);
  const O = norm(125.04 - 1934.136*T);
  return norm(L0 + C - 0.00569 - 0.00478*Math.sin(O*D2R));
}

// Moon longitude (ELP2000 simplified, ~15 arcmin accuracy)
function moonLon(T) {
  const Lp = norm(218.3164477 + 481267.88123421*T - 0.0015786*T*T);
  const M  = norm(357.5291092 + 35999.0502909*T  - 0.0001536*T*T);
  const Mp = norm(134.9633964 + 477198.8675055*T + 0.0087414*T*T);
  const D  = norm(297.8501921 + 445267.1114034*T - 0.0018819*T*T);
  const F  = norm(93.2720950  + 483202.0175233*T - 0.0036539*T*T);
  const [Mr,Mpr,Dr,Fr] = [M,Mp,D,F].map(x=>x*D2R);
  return norm(Lp
    + 6.288774*Math.sin(Mpr)
    + 1.274027*Math.sin(2*Dr - Mpr)
    + 0.658314*Math.sin(2*Dr)
    + 0.213618*Math.sin(2*Mpr)
