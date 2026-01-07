export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { imagePath } = body

  if (!imagePath) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Image path is required',
    })
  }

  try {
    const richMenuId = await setupRichMenu(imagePath)

    return {
      success: true,
      richMenuId,
    }
  }
  catch (error) {
    console.error('Failed to create rich menu:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create rich menu',
    })
  }
})
