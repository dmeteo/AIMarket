from fastapi import APIRouter

from app.api.v1.routers import auth, users, products, shops, brands, categories, carts, orders, admin, media


router = APIRouter(prefix="/api/v1")

router.include_router(admin.router)
router.include_router(auth.router)
router.include_router(users.router)
router.include_router(products.router)
router.include_router(shops.router)
router.include_router(brands.router)
router.include_router(categories.router)
router.include_router(carts.router)
router.include_router(orders.router)
router.include_router(media.router)
router.include_router(orders.router)