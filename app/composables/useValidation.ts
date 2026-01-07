export function useValidation() {
  function validatePhoneNumber(phone: string): boolean {
    // 支援格式：09xx-xxxxxx 或 09xxxxxxxx
    const phoneRegex = /^09\d{2}-?\d{6}$/
    return phoneRegex.test(phone)
  }

  function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/
    return emailRegex.test(email)
  }

  function validateBookingDate(dateString: string): boolean {
    const selectedDate = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return selectedDate >= today
  }

  function validateTime(timeString: string): boolean {
    const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d$/
    return timeRegex.test(timeString)
  }

  return {
    validatePhoneNumber,
    validateEmail,
    validateBookingDate,
    validateTime,
  }
}
