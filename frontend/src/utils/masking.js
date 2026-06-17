export function maskAadhaar(aadhaar) {
  if (!aadhaar) return aadhaar;
  const cleaned = aadhaar.replace(/\D/g, '');
  if (cleaned.length === 12) {
    return `XXXX XXXX ${cleaned.slice(-4)}`;
  }
  return aadhaar;
}

export function maskPAN(pan) {
  if (!pan) return pan;
  const cleaned = pan.trim();
  if (cleaned.length === 10) {
    return `XXXXX${cleaned.slice(5, 9)}X`;
  }
  return pan;
}

export function maskPhone(phone) {
  if (!phone) return phone;
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length >= 10) {
    return `XXXXXX${cleaned.slice(-4)}`;
  }
  return phone;
}

export function maskAccountNumber(acc) {
  if (!acc) return acc;
  const cleaned = acc.trim();
  if (cleaned.length > 4) {
    return `XXXX${cleaned.slice(-4)}`;
  }
  return acc;
}
