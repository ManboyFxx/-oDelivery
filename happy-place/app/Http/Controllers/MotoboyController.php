<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MotoboyController extends Controller
{
    public function index()
    {
        $motoboys = User::where('role', 'motoboy')->get();
        return Inertia::render('Motoboys/Index', [
            'motoboys' => $motoboys
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'phone' => 'required|string',
            'password' => 'required|min:6',
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'password' => bcrypt($validated['password']),
            'role' => 'motoboy',
        ]);

        return back()->with('success', 'Motoboy cadastrado!');
    }

    public function update(Request $request, User $motoboy)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string',
        ]);

        $motoboy->update($validated);
        return back()->with('success', 'Motoboy atualizado!');
    }

    public function destroy(User $motoboy)
    {
        $motoboy->delete();
        return back()->with('success', 'Motoboy removido!');
    }
}
