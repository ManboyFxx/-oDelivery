<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentFailedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $planName;
    public $attemptNumber;
    public $nextAttemptDate;
    public $updatePaymentUrl;

    public function __construct($planName, $attemptNumber, $nextAttemptDate, $updatePaymentUrl)
    {
        $this->planName = $planName;
        $this->attemptNumber = $attemptNumber;
        $this->nextAttemptDate = $nextAttemptDate;
        $this->updatePaymentUrl = $updatePaymentUrl;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Ação Necessária: Falha no Pagamento - ' . config('app.name'),
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.payment.failed',
        );
    }
}
