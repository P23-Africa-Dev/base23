import type { StripeError } from '@stripe/stripe-js';

/**
 * Convert Stripe SDK errors into user-actionable guidance.
 */
export function resolveStripeError(error: StripeError): string {
    const code = error.code ?? '';
    const declineCode = error.decline_code ?? '';

    if (
        code === 'authentication_required' ||
        declineCode === 'authentication_required' ||
        declineCode === 'authentication_failure'
    ) {
        return 'Your bank requires OTP/3D Secure verification for this card. Please enable online/international payments in your banking app and try again, or use another card.';
    }

    if (declineCode === 'do_not_honor' || declineCode === 'generic_decline') {
        return 'Your bank declined this transaction. Please check your card settings for online/international payments or try another card.';
    }

    if (declineCode === 'transaction_not_allowed' || declineCode === 'card_not_supported') {
        return 'This card is not enabled for online transactions. Please enable e-commerce payments in your bank app or use a different card.';
    }

    if (declineCode === 'insufficient_funds') {
        return 'Your card was declined due to insufficient funds. Please use a different card.';
    }

    if (code === 'expired_card') {
        return 'Your card has expired. Please use a different card.';
    }

    if (code === 'incorrect_cvc') {
        return 'The card security code is incorrect. Please check and try again.';
    }

    return error.message || 'Card verification failed. Please try another card.';
}
