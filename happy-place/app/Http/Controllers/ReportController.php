<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Schema;

class ReportController extends Controller
{
    public function index()
    {
        // Mock data for now, real implementation would query orders/payments tables
        $summary = [
            'today_sales' => 1250.00,
            'weekly_sales' => 8400.50,
            'monthly_sales' => 32000.00,
            'average_ticket' => 45.00,
        ];

        return Inertia::render('Reports/Index', [
            'summary' => $summary
        ]);
    }
}
