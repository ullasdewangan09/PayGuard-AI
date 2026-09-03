from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.api.v1.auth import get_current_user_id
from app.db.database import get_db
from app.models.receipt import Receipt
from app.services.receipt import receipt_service

router = APIRouter()


@router.get("/{receipt_id}")
def get_receipt(receipt_id: str, db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    receipt = db.query(Receipt).filter(Receipt.public_id == receipt_id).first()
    if not receipt:
        raise HTTPException(status_code=404, detail="Receipt not found")
    if receipt.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this receipt")
    pdf = receipt_service.render_pdf(receipt)
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{receipt.receipt_number}.pdf"'},
    )
