import json

from groq import Groq


def groq_search_chat(client: Groq, query: str, products: list) -> list[int]:
    products_text = "\n".join(
        f"id: {p.id}, title: {p.title}, description: {p.description}"
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

                Извлеки только суть запроса — название категории или тип товара, без лишних слов. Например: 'недорогой телефон для папы' → q: 'телефон'.

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