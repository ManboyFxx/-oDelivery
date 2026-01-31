<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\SecurityEvent;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminLogsController extends Controller
{
    public function security(Request $request)
    {
        $query = SecurityEvent::with('user:id,name,email')
            ->latest();

        // Filtros opcionais
        if ($request->filled('event_type')) {
            $query->where('event_type', $request->event_type);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $logs = $query->paginate(50)->through(function ($event) {
            return [
                'id' => $event->id,
                'event_type' => $event->event_type,
                'user_email' => $event->user->email ?? 'N/A',
                'ip_address' => $event->ip_address,
                'user_agent' => $event->user_agent,
                'status' => $event->status,
                'created_at' => $event->created_at->diffForHumans(),
            ];
        });

        return Inertia::render('Admin/Logs/Security', [
            'logs' => $logs,
            'filters' => $request->only(['event_type', 'user_id']),
        ]);
    }

    public function audit(Request $request)
    {
        $query = AuditLog::with('user:id,name,email')
            ->latest();

        // Filtros
        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('model_type')) {
            $query->where('model_type', $request->model_type);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $logs = $query->paginate(50)->through(function ($log) {
            return [
                'id' => $log->id,
                'action' => $log->action,
                'model_type' => $log->model_type,
                'model_id' => $log->model_id,
                'user' => [
                    'name' => $log->user->name ?? 'Sistema',
                    'email' => $log->user->email ?? 'N/A',
                ],
                'old_values' => $log->old_values,
                'new_values' => $log->new_values,
                'created_at' => $log->created_at->diffForHumans(),
            ];
        });

        // Estatísticas
        $stats = [
            'total_actions' => AuditLog::count(),
            'today_actions' => AuditLog::whereDate('created_at', today())->count(),
            'unique_users' => AuditLog::distinct('user_id')->count('user_id'),
        ];

        return Inertia::render('Admin/Logs/Audit', [
            'logs' => $logs,
            'stats' => $stats,
            'filters' => $request->only(['action', 'model_type', 'user_id']),
        ]);
    }
}
