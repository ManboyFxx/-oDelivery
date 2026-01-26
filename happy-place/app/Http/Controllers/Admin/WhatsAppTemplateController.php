<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WhatsAppTemplate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WhatsAppTemplateController extends Controller
{
    public function index()
    {
        $templates = WhatsAppTemplate::orderBy('created_at', 'asc')->get();

        return Inertia::render('Admin/WhatsApp/Templates/Index', [
            'templates' => $templates
        ]);
    }

    public function update(Request $request, WhatsAppTemplate $template)
    {
        $validated = $request->validate([
            'message' => 'required|string',
            'is_active' => 'boolean'
        ]);

        $template->update($validated);

        return back()->with('success', 'Template atualizado com sucesso!');
    }
}
