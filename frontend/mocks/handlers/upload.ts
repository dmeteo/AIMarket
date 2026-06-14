import { http, HttpResponse } from 'msw'

export const uploadHandlers = [
  // POST /api/v1/media/upload?entity=products|avatars
  http.post('/api/v1/media/upload', async ({ request }) => {
    const url = new URL(request.url)
    const entity = url.searchParams.get('entity')

    if (!entity || !['products', 'avatars'].includes(entity)) {
      return HttpResponse.json(
        { detail: 'Параметр entity обязателен: products или avatars' },
        { status: 422 },
      )
    }

    const formData = await request.formData()
    const files = formData.getAll('files')

    if (!files || files.length === 0) {
      return HttpResponse.json(
        { detail: 'Файлы не найдены' },
        { status: 422 },
      )
    }

    const fullUrls: string[] = []
    const keys: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file instanceof File) {
        const key = `${entity}/${Date.now()}-${i}-${file.name}`
        // Для моков используем data URL как full_url
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })
        fullUrls.push(dataUrl)
        keys.push(key)
      }
    }

    return HttpResponse.json({ full_urls: fullUrls, keys })
  }),
]
