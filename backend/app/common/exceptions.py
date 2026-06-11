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
    
    
def shop_not_found():
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Shop not found",
    )
    
    
def review_not_found():
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Review not found",
    )
    
    
def access_denied():
    return HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Access denied",
    )
    

def invalid_quantity(available_quantity):
    return HTTPException(
        status_code=status.HTTP_409_CONFLICT, 
        detail=f"Available {available_quantity} pieces"
    )


def application_not_found():
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Application not found",
    )