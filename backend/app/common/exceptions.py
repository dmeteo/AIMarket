from fastapi import HTTPException, status


def product_not_found():
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Product not found",
    )
    
    
def category_not_found():
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Category not found",
    )
     
     
def brand_not_found():
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Brand not found",
    )