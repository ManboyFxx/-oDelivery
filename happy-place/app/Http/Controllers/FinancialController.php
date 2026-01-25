<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class FinancialController extends Controller
{
    public function index(Request $request)
    {
        // Mocking data for now as Order Logic might not be fully populated with real sales
        // In a real scenario, we would query the Orders table.

        $startDate = Carbon::now()->startOfMonth();
        $endDate = Carbon::now()->endOfMonth();

        // Simulate KPI Data
        $metrics = [
            'total_revenue' => 15420.50,
            'orders_count' => 342,
            'average_ticket' => 45.10,
            'growth' => 12.5 // Percentage
        ];

        // Simulate Chart Data (Last 7 Days)
        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $chartData[] = [
                'date' => $date->format('d/m'),
                'value' => rand(1500, 3500)
            ];
        }

        // Simulate Recent Transactions
        $transactions = [
            [
                'id' => '#ORD-001',
                'customer' => 'João Silva',
                'amount' => 120.50,
                'status' => 'completed',
                'payment_method' => 'PIX',
                'date' => Carbon::now()->subMinutes(10)->format('H:i')
            ],
            [
                'id' => '#ORD-002',
                'customer' => 'Maria Oliveira',
                'amount' => 45.00,
                'status' => 'completed',
                'payment_method' => 'Cartão de Crédito',
                'date' => Carbon::now()->subMinutes(25)->format('H:i')
            ],
            [
                'id' => '#ORD-003',
                'customer' => 'Pedro Santos',
                'amount' => 89.90,
                'status' => 'completed',
                'payment_method' => 'Dinheiro',
                'date' => Carbon::now()->subMinutes(40)->format('H:i')
            ],
            [
                'id' => '#ORD-004',
                'customer' => 'Ana Costa',
                'amount' => 250.00,
                'status' => 'refunded',
                'payment_method' => 'Cartão de Crédito',
                'date' => Carbon::now()->subHour()->format('H:i')
            ],
            [
                'id' => '#ORD-005',
                'customer' => 'Lucas Lima',
                'amount' => 60.00,
                'status' => 'completed',
                'payment_method' => 'PIX',
                'date' => Carbon::now()->subHours(2)->format('H:i')
            ],
        ];

        return Inertia::render('Financial/Index', [
            'metrics' => $metrics,
            'chart_data' => $chartData,
            'transactions' => $transactions
        ]);
    }
}
