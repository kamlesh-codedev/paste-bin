function getExpirationDate(expiration, customExpiration) {
  if (expiration === 'never') return null

  if (expiration === 'custom') {
    const customDate = new Date(customExpiration)
    if (!customExpiration || Number.isNaN(customDate.getTime())) {
      throw new Error('Choose a valid custom expiration date and time.')
    }
    return customDate.toISOString()
  }

  const expirationDays = {
    '1-day': 1,
    '7-days': 7,
    '30-days': 30,
  }[expiration]

  return expirationDays ? new Date(Date.now() + expirationDays * 86_400_000).toISOString() : null
}

function toPastePayload(formValues) {
  return {
    title: formValues.title.trim(),
    content: formValues.content,
    language: formValues.language,
    visibility: formValues.visibility,
    expires_at: getExpirationDate(formValues.expiration, formValues.customExpiration),
  }
}

export { toPastePayload }
