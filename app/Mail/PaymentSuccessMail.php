<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentSuccessMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $planName;
    public $amount;
    public $date;
    public $invoiceUrl;

    public function __construct($planName, $amount, $date, $invoiceUrl)
    {
        $this->planName = $planName;
        $this->amount = $amount;
        $this->date = $date;
        $this->invoiceUrl = $invoiceUrl;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Pagamento Confirmado - ' . config('app.name'),
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.payment.success',
        );
    }
}
