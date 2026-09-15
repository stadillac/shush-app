package com.shush.data

object PhoneNumbers {
    /**
     * Normalizes a phone number for matching by stripping everything but
     * digits and keeping the last 10 digits.
     *
     * This is intentionally simple (US/Canada-centric) to get real call
     * blocking working end-to-end first. It will produce false
     * negatives/positives for some international numbers sharing the
     * same last 10 digits. Swap in a proper E.164 parser (e.g.
     * libphonenumber) once that matters.
     */
    fun normalize(raw: String?): String {
        if (raw.isNullOrBlank()) return ""
        val digits = raw.filter { it.isDigit() }
        return if (digits.length > 10) digits.takeLast(10) else digits
    }
}
