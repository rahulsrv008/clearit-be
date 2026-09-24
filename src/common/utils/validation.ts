/** 10-digit Indian mobile number, no country code. */
export const MOBILE_REGEX = /^[6-9]\d{9}$/;

export const MOBILE_MESSAGE = 'mobile must be a valid 10-digit Indian number';

export const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export const PINCODE_REGEX = /^\d{6}$/;

export const MEDIA_REF_REGEX = /^(https?:\/\/|data:image\/)/i;

export const MEDIA_REF_MESSAGE =
  'must be a photo from camera/gallery or an http(s) image URL';
