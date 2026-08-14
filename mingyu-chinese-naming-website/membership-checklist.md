# Membership Rollout Checklist

## Recommended plans

- `Starter Membership` - `$19/month` - `30 credits / month`
- `Studio Membership` - `$39/month` - `80 credits / month`
- `Credit Pack` - `$29 one-time` - `50 credits`

## Billing rules to show publicly

- `1 credit = 1 AI naming or report generation request`
- Monthly memberships auto-renew until cancelled
- One-time credit packs do not auto-renew
- Credit packs are not wallet balance or stored cash value
- Digital fulfillment happens in-app after successful payment
- Support email: `support@chinesenamepro.com`

## Pages to build next

1. `Register / Sign in`
2. `Pricing / Membership`
3. `Account dashboard`
4. `Billing history`
5. `Credits ledger`
6. `Saved reports`
7. `Cancellation / manage subscription`
8. `Success / failed payment`

## Core account fields

- Email
- Password or passwordless login token
- Display name
- Billing country
- Marketing consent
- Support contact preference

## Membership fields

- `plan_id`
- `plan_name`
- `billing_interval`
- `status`
- `renewal_at`
- `cancel_at_period_end`
- `payment_provider`
- `provider_customer_id`
- `provider_subscription_id`

## Credit ledger fields

- `user_id`
- `event_type` (`grant`, `usage`, `refund`, `adjustment`, `expiry`)
- `credits_delta`
- `credits_balance_after`
- `source` (`membership`, `credit_pack`, `manual_support`)
- `reference_id`
- `created_at`

## Fulfillment proof fields

- Request id
- User id or billing email
- Plan or credit source
- Generation started at
- Generation completed at
- Result delivery status
- Provider transaction id
- IP / browser metadata for fraud review

