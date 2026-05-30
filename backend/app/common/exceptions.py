from fastapi import HTTPException, status


def product_not_found():
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Product not found",
    )