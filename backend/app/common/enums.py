from enum import Enum


class Role(str, Enum):
    BUYER = "BUYER"
    SELLER = "SELLER"
    ADMIN = "ADMIN"
    MODERATOR = "MODERATOR"
    
    
class DeliveryType(Enum):
    CDEK = "CDEK"
    YANDEX = "YANDEX"
    

class OrderStatus(Enum):
    IN_PROCESSING = "IN_PROCESSING"
    CONFIRMED = "CONFIRMED"
    AWAITING_DELIVERY = "AWAITING_DELIVERY"
    DELIVERY = "DELIVERY"
    AWAIT_RECEIPT = "AWAIT_RECEIPT"
    RECEIVED = "RECEIVED"
    
    
class PersonType(str, Enum):
    INDIVIDUAL_EMPLOYER = "INDIVIDUAL_EMPLOYER"
    SELF_EMPLOYED = "SELF_EMPLOYED"
    OOO = "OOO"
    
    
class VerdictApplicationToBeSeller(str, Enum):
    PENDING = "PENDING"
    APPROVE = "APPROVE"
    REJECT = "REJECT"
    