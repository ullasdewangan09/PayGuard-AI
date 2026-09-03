"""payment receipts notifications

Revision ID: 8f2a4db71f40
Revises: 403ea243d1a9
Create Date: 2026-08-30 21:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "8f2a4db71f40"
down_revision: Union[str, Sequence[str], None] = "403ea243d1a9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("phone_number", sa.String(), nullable=True))
    op.add_column("users", sa.Column("whatsapp_number", sa.String(), nullable=True))
    op.add_column("users", sa.Column("email_enabled", sa.Boolean(), nullable=False, server_default=sa.true()))
    op.add_column("users", sa.Column("sms_enabled", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column("users", sa.Column("whatsapp_enabled", sa.Boolean(), nullable=False, server_default=sa.false()))

    op.add_column("transactions", sa.Column("payment_method", sa.String(), nullable=True))
    op.add_column("transactions", sa.Column("payment_metadata", sa.JSON(), nullable=True))
    op.add_column("transactions", sa.Column("payment_failure_code", sa.String(), nullable=True))
    op.add_column("transactions", sa.Column("payment_failure_reason", sa.String(), nullable=True))
    op.add_column("transactions", sa.Column("authorized_at", sa.DateTime(), nullable=True))
    op.add_column("transactions", sa.Column("captured_at", sa.DateTime(), nullable=True))
    op.add_column("transactions", sa.Column("updated_at", sa.DateTime(), nullable=True))

    op.create_table(
        "receipts",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("public_id", sa.String(), nullable=False),
        sa.Column("receipt_number", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("transaction_id", sa.String(), nullable=False),
        sa.Column("amount", sa.String(), nullable=False),
        sa.Column("currency", sa.String(), nullable=False),
        sa.Column("payment_method", sa.String(), nullable=True),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("receipt_jsonb", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["transaction_id"], ["transactions.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("transaction_id"),
    )
    op.create_index(op.f("ix_receipts_public_id"), "receipts", ["public_id"], unique=True)
    op.create_index(op.f("ix_receipts_receipt_number"), "receipts", ["receipt_number"], unique=True)
    op.create_index(op.f("ix_receipts_user_id"), "receipts", ["user_id"], unique=False)

    op.create_table(
        "notifications",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("transaction_id", sa.String(), nullable=True),
        sa.Column("receipt_id", sa.String(), nullable=True),
        sa.Column("event_type", sa.String(), nullable=False),
        sa.Column("channel", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("provider_message_id", sa.String(), nullable=True),
        sa.Column("idempotency_key", sa.String(), nullable=False),
        sa.Column("attempt_count", sa.Integer(), nullable=False),
        sa.Column("last_attempt_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("delivered_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("failed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("error_code", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("idempotency_key", name="uq_notifications_idempotency_key"),
    )
    op.create_index(op.f("ix_notifications_user_id"), "notifications", ["user_id"], unique=False)
    op.create_index(op.f("ix_notifications_transaction_id"), "notifications", ["transaction_id"], unique=False)
    op.create_index(op.f("ix_notifications_receipt_id"), "notifications", ["receipt_id"], unique=False)
    op.create_index(op.f("ix_notifications_event_type"), "notifications", ["event_type"], unique=False)
    op.create_index(op.f("ix_notifications_channel"), "notifications", ["channel"], unique=False)

    op.create_table(
        "webhook_events",
        sa.Column("event_key", sa.String(), nullable=False),
        sa.Column("provider", sa.String(), nullable=False),
        sa.Column("event_type", sa.String(), nullable=False),
        sa.Column("processed_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("event_key"),
    )
    op.create_index(op.f("ix_webhook_events_event_key"), "webhook_events", ["event_key"], unique=False)
    op.create_index(op.f("ix_webhook_events_event_type"), "webhook_events", ["event_type"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_webhook_events_event_type"), table_name="webhook_events")
    op.drop_index(op.f("ix_webhook_events_event_key"), table_name="webhook_events")
    op.drop_table("webhook_events")

    op.drop_index(op.f("ix_notifications_channel"), table_name="notifications")
    op.drop_index(op.f("ix_notifications_event_type"), table_name="notifications")
    op.drop_index(op.f("ix_notifications_receipt_id"), table_name="notifications")
    op.drop_index(op.f("ix_notifications_transaction_id"), table_name="notifications")
    op.drop_index(op.f("ix_notifications_user_id"), table_name="notifications")
    op.drop_table("notifications")

    op.drop_index(op.f("ix_receipts_user_id"), table_name="receipts")
    op.drop_index(op.f("ix_receipts_receipt_number"), table_name="receipts")
    op.drop_index(op.f("ix_receipts_public_id"), table_name="receipts")
    op.drop_table("receipts")

    op.drop_column("transactions", "updated_at")
    op.drop_column("transactions", "captured_at")
    op.drop_column("transactions", "authorized_at")
    op.drop_column("transactions", "payment_failure_reason")
    op.drop_column("transactions", "payment_failure_code")
    op.drop_column("transactions", "payment_metadata")
    op.drop_column("transactions", "payment_method")

    op.drop_column("users", "whatsapp_enabled")
    op.drop_column("users", "sms_enabled")
    op.drop_column("users", "email_enabled")
    op.drop_column("users", "whatsapp_number")
    op.drop_column("users", "phone_number")
