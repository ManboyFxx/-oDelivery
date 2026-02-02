<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;

class SupportController extends Controller
{
    public function index()
    {
        return Inertia::render('Support/Index', [
            'support_contact' => [
                'whatsapp' => '5511999999999', // Replace with actual support number
                'email' => 'suporte@oodelivery.online',
                'hours' => 'Segunda a Sexta, das 09h às 18h'
            ]
        ]);
    }
}
