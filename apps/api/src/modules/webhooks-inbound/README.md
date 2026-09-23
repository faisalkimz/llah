# Webhooks Inbound Module

Receives webhooks from payment providers.

## API Endpoints

### POST /api/webhooks-inbound/stripe
Stripe webhook endpoint.

### POST /api/webhooks-inbound/paypal
PayPal webhook endpoint.

## Features
- Provider-specific webhook handling
- Signature verification
- Event processing
- Idempotency
