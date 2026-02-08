<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AbandonedCheckoutMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $planName;
    public $recoveryUrl;
    public $couponCode;

    public function __construct($planName, $recoveryUrl, $couponCode = 'VOLTE10')
    {
        $this->planName = $planName;
        $this->recoveryUrl = $recoveryUrl;
        $this->couponCode = $couponCode;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Não perca seu plano! Finalize agora com desconto - ' . config('app.name'),
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.payment.abandoned',
        );
    }
}
