<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class SystemController extends Controller
{
    public function downloads()
    {
        return Inertia::render('System/Downloads');
    }
}
