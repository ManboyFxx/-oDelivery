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
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->format('Y-m-d'));

        // Basic query scoped to tenant via Global Scope
        $query = Order::whereBetween('created_at', [
            Carbon::parse($startDate)->startOfDay(),
            Carbon::parse($endDate)->endOfDay()
        ])->where('status', '!=', 'cancelled'); // Exclude cancelled orders

        $totalRevenue = $query->sum('total');
        $orderCount = $query->count();
        $averageTicket = $orderCount > 0 ? $totalRevenue / $orderCount : 0;

        // Daily breakdown for chart
        $dailyData = Order::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(total) as revenue'),
            DB::raw('COUNT(*) as count')
        )
            ->whereBetween('created_at', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay()
            ])
            ->where('status', '!=', 'cancelled')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Payment method breakdown
        $paymentMethods = Order::select('payment_method', DB::raw('count(*) as count'), DB::raw('sum(total) as total'))
            ->whereBetween('created_at', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay()
            ])
            ->where('status', '!=', 'cancelled')
            ->groupBy('payment_method')
            ->get();

        return Inertia::render('Financial/Index', [
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'summary' => [
                'revenue' => $totalRevenue,
                'orders' => $orderCount,
                'average_ticket' => $averageTicket,
            ],
            'daily_data' => $dailyData,
            'payment_methods' => $paymentMethods
        ]);
    }
}
