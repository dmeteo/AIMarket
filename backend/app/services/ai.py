import json

from groq import Groq


def groq_search_chat(client: Groq, query: str, products: list) -> list[int]:
    products_text = "\n".join(
        f"id: {p.id}, title: {p.title}, description: {p.description}, price: {p.price}, categories: {p.categories}"
        for p in products
    )

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": "Ты помощник в интернет-магазине. Отвечай только JSON без пояснений.",
            },
            {
                "role": "user",
                "content": f"""Пользователь ищет: "{query}"

                Отсортируй все товары из списка по релевантности запросу. Верни id всех товаров, ничего не исключая.
                Верни только JSON формата: {{"product_ids": [5, 1, 3]}}

                Товары:
                {products_text}""",
            },
        ],
    )

    data = json.loads(response.choices[0].message.content)
    return data.get("product_ids", [])


def groq_parse_query(client: Groq, query: str):
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": "Ты помощник в интернет-магазине. Отвечай только JSON без пояснений.",
            },
            {
                "role": "user",
                "content": f"""Пользователь ищет: "{query}"

                Оставь тип товара и его значимые характеристики (назначение, сезон, вид). Убери только слова о цене, получателе подарка и прочий мусор Например: 
                'недорогой телефон для папы' → q: 'телефон'
                'подарок папе'  → q: 'часы ремень инструменты гаджеты мужские'
                'подарок маме'  → q: 'украшения сумка парфюм платок женские'
                'беговые кроссовки Nike подешевле' → q: 'беговые кроссовки Nike'
                'что подарить на зиму, куртку тёплую' → q: 'тёплая зимняя куртка'

                Если запрос содержит слова о дешевизне - "cheap", о премиальности/дороговизне - "expensive", иначе null
                
                Ответ должен соответствовать формату:
                {{"q": "<тип товара>", "price_intent": "cheap" | "expensive" | null}}""",
            },
        ],
    )
    data = json.loads(response.choices[0].message.content)
    return data


def groq_create_product_description(client: Groq, title, description=None):
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": "Ты помощник в интернет-магазине. Отвечай только JSON без пояснений.",
            },
            {
                "role": "user",
                "content": f"""Пользователь хочет сгенерировать продающее описание к своему товару.
                Название товара: {title}
                Предварительное описание/просьба: {description or "нет"}
                
                Не придумывай технические характеристики, которых нет в исходных данных. Описание 2-4 предложения.
                Ответ на русском языке

                Ответ должен соответствовать формату:
                {{"description": "Сформированное описание"}}""",
            },
        ],
    )
    data = json.loads(response.choices[0].message.content)
    return data